import React, { useState } from 'react';
import ConfigPage, { GenerationConfig, HistoryItem } from './ConfigPage';
import VideoPlayer, { GeneratedContent } from './VideoPlayer';
import PreviewTable from './PreviewTable';
import { apiService } from '../services/apiService';
import { imageProcessor } from '../services/imageProcessor';

interface GeneratorProps {
  onBackToHome: () => void;
}

const shouldProcessBackground = (
  mode: GenerationConfig['imageBackgroundRemoval']
) => {
  return (
    mode !== 'none' &&
    mode !== 'css-blend' &&
    mode !== 'checkerboard-remove'
  );
};

const applyBackgroundRemoval = async (
  imageUrl: string,
  config: GenerationConfig
): Promise<string> => {
  if (!shouldProcessBackground(config.imageBackgroundRemoval)) {
    return imageUrl;
  }

  try {
    if (config.imageBackgroundRemoval === 'auto') {
      try {
        return await imageProcessor.removeBackgroundWithRemoveBg(imageUrl);
      } catch (error) {
        console.warn('Remove.bg API处理失败，改用本地AI', error);
        return await imageProcessor.removeBackgroundFromUrl(imageUrl);
      }
    }

    if (config.imageBackgroundRemoval === 'ai-remove') {
      return await imageProcessor.removeBackgroundFromUrl(imageUrl);
    }

    if (config.imageBackgroundRemoval === 'removebg-api') {
      return await imageProcessor.removeBackgroundWithRemoveBg(imageUrl);
    }
  } catch (error) {
    console.error('背景处理失败，使用原图', error);
  }

  return imageUrl;
};

const Generator: React.FC<GeneratorProps> = ({ onBackToHome }) => {
  const [mode, setMode] = useState<'config' | 'preview' | 'video'>('config');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState<GeneratedContent | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [currentConfig, setCurrentConfig] = useState<GenerationConfig | null>(null);
  const [regeneratingIndexes, setRegeneratingIndexes] = useState<number[]>([]);

  // 进度跟踪状态
  const [generationStep, setGenerationStep] = useState<string>('');
  const [imageProgress, setImageProgress] = useState<{ completed: number, total: number }>({ completed: 0, total: 0 });
  const [backgroundProgress, setBackgroundProgress] = useState<{ completed: number, total: number }>({ completed: 0, total: 0 });

  const saveToHistory = (config: GenerationConfig, result: GeneratedContent) => {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      config,
      result,
      timestamp: Date.now(),
      title: config.text.substring(0, 20) + (config.text.length > 20 ? '...' : '')
    };

    const savedHistory = localStorage.getItem('video-generator-history');
    const history: HistoryItem[] = savedHistory ? JSON.parse(savedHistory) : [];
    history.unshift(historyItem);

    // 最多保存10条记录
    if (history.length > 10) {
      history.splice(10);
    }

    localStorage.setItem('video-generator-history', JSON.stringify(history));
  };

  const handleGenerate = async (config: GenerationConfig) => {
    const effectiveConfig: GenerationConfig = config.enableBackgroundRemoval
      ? config
      : { ...config, imageBackgroundRemoval: 'none' };

    setPreviewContent(null);
    setGeneratedContent(null);
    setIsGenerating(true);
    setRegeneratingIndexes([]);
    setCurrentConfig(effectiveConfig);
    setGenerationStep('准备开始预览...');
    setImageProgress({ completed: 0, total: 0 });
    setBackgroundProgress({ completed: 0, total: 0 });

    try {
      setGenerationStep('文本转语音中...');
      console.log('1. 开始文本转语音...');
      const audioUrl = await apiService.textToSpeech(effectiveConfig.text, effectiveConfig.voice);
      console.log('音频URL:', audioUrl);

      setGenerationStep('音频转字幕中...');
      console.log('2. 开始音频转字幕...');
      const taskId = await apiService.startASRTask(audioUrl);
      console.log('ASR任务ID:', taskId);

      const transcriptionUrl = await apiService.waitForASRCompletion(taskId);
      console.log('字幕URL:', transcriptionUrl);

      setGenerationStep('获取字幕文件...');
      const transcriptionData = await apiService.fetchTranscription(transcriptionUrl);
      const subtitles = apiService.processTranscription(transcriptionData);
      console.log('处理后的字幕:', subtitles);

      setGenerationStep('并发生成配图...');
      setImageProgress({ completed: 0, total: subtitles.length });
      console.log('4. 并发生成配图（最大并发数: 10）...');

      // 并发生成图片，限制并发数为10
      const rawImages: any[] = new Array(subtitles.length).fill(null);
      let completedCount = 0;
      const CONCURRENCY_LIMIT = 10;

      const generateImageTask = async (subtitle: any, index: number) => {
        try {
          const prompt = apiService.generateImagePrompt(subtitle.text);
          const imageUrl = await apiService.generateImage(effectiveConfig.characterImage, prompt, effectiveConfig.model);

          rawImages[index] = {
            url: imageUrl,
            text: subtitle.text,
            start_time: subtitle.start_time
          };

          completedCount++;
          setImageProgress({ completed: completedCount, total: subtitles.length });
          console.log(`生成配图 (${completedCount}/${subtitles.length}): ${subtitle.text} -> ${imageUrl}`);
        } catch (error) {
          console.error(`生成图片失败 (index: ${index}):`, error);
          // 可以在这里放入一个占位图或者重试逻辑
          rawImages[index] = {
            url: effectiveConfig.characterImage, // 失败时使用角色图兜底
            text: subtitle.text,
            start_time: subtitle.start_time
          };
          completedCount++;
          setImageProgress({ completed: completedCount, total: subtitles.length });
        }
      };

      const activePromises: Promise<void>[] = [];

      for (let i = 0; i < subtitles.length; i++) {
        const p = generateImageTask(subtitles[i], i).then(() => {
          activePromises.splice(activePromises.indexOf(p), 1);
        });
        activePromises.push(p);

        if (activePromises.length >= CONCURRENCY_LIMIT) {
          await Promise.race(activePromises);
        }
      }

      await Promise.all(activePromises);

      console.log(`所有配图生成完成，共${rawImages.length}张`);

      let images = rawImages.map(img => ({ ...img, processedUrl: img.url }));
      const needsBackgroundProcessing = shouldProcessBackground(effectiveConfig.imageBackgroundRemoval);

      if (needsBackgroundProcessing) {
        setGenerationStep('并发处理背景去除...');
        setBackgroundProgress({ completed: 0, total: rawImages.length });
        console.log('5. 并发处理背景去除（最大并发数: 10）...');

        // 使用并发控制处理背景
        const processedImages: any[] = new Array(rawImages.length).fill(null);
        let completedProcessing = 0;
        const BG_CONCURRENCY_LIMIT = 10;

        const processImageTask = async (imageData: any, index: number) => {
          try {
            console.log(`开始处理图片背景 (${index + 1}/${rawImages.length}): ${imageData.text}`);
            const processedUrl = await applyBackgroundRemoval(imageData.url, effectiveConfig);

            processedImages[index] = {
              url: imageData.url,
              processedUrl: processedUrl,
              text: imageData.text,
              start_time: imageData.start_time
            };

            completedProcessing++;
            setBackgroundProgress({ completed: completedProcessing, total: rawImages.length });
            console.log(`背景处理完成 (${completedProcessing}/${rawImages.length}): ${imageData.text}`);
          } catch (error) {
            console.error(`背景处理失败 (index: ${index}):`, error);
            // 失败时使用原图
            processedImages[index] = {
              url: imageData.url,
              processedUrl: imageData.url,
              text: imageData.text,
              start_time: imageData.start_time
            };
            completedProcessing++;
            setBackgroundProgress({ completed: completedProcessing, total: rawImages.length });
          }
        };

        const activePromises: Promise<void>[] = [];

        for (let i = 0; i < rawImages.length; i++) {
          const p = processImageTask(rawImages[i], i).then(() => {
            activePromises.splice(activePromises.indexOf(p), 1);
          });
          activePromises.push(p);

          if (activePromises.length >= BG_CONCURRENCY_LIMIT) {
            await Promise.race(activePromises);
          }
        }

        await Promise.all(activePromises);

        images = processedImages;
        console.log(`所有背景处理完成，共${images.length}张`);
      }

      setGenerationStep('预览准备完成');
      const content: GeneratedContent = {
        audioUrl,
        subtitles,
        images
      };

      setPreviewContent(content);
      setMode('preview');
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请检查网络连接和API配置');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
      setImageProgress({ completed: 0, total: 0 });
      setBackgroundProgress({ completed: 0, total: 0 });
    }
  };

  const handleLoadHistory = (historyItem: HistoryItem) => {
    setGeneratedContent(historyItem.result);
    setCurrentConfig(historyItem.config);
    setPreviewContent(null);
    setMode('video');
  };

  const handleBackToConfig = () => {
    setMode('config');
    setRegeneratingIndexes([]);
  };

  const addRegeneratingIndex = (index: number) => {
    setRegeneratingIndexes(prev => (
      prev.includes(index) ? prev : [...prev, index]
    ));
  };

  const removeRegeneratingIndex = (index: number) => {
    setRegeneratingIndexes(prev => prev.filter(item => item !== index));
  };

  const handleRegenerateImage = async (index: number) => {
    if (!previewContent || !currentConfig) return;
    if (index < 0 || index >= previewContent.images.length) return;

    const subtitle = previewContent.subtitles[index];
    if (!subtitle) return;

    addRegeneratingIndex(index);
    try {
      const prompt = apiService.generateImagePrompt(subtitle.text);
      const imageUrl = await apiService.generateImage(currentConfig.characterImage, prompt, currentConfig.model);
      const processedUrl = await applyBackgroundRemoval(imageUrl, currentConfig);

      setPreviewContent(prev => {
        if (!prev) return prev;
        const updatedImages = [...prev.images];
        updatedImages[index] = {
          ...updatedImages[index],
          url: imageUrl,
          processedUrl
        };
        return {
          ...prev,
          images: updatedImages
        };
      });
    } catch (error) {
      console.error('图片重新生成失败:', error);
      alert('图片重新生成失败，请稍后重试');
    } finally {
      removeRegeneratingIndex(index);
    }
  };

  const handleGenerateVideo = () => {
    if (!previewContent || !currentConfig) {
      alert('请先完成预览生成');
      return;
    }

    setGeneratedContent(previewContent);
    saveToHistory(currentConfig, previewContent);
    setMode('video');
  };

  if (mode === 'config') {
    return (
      <ConfigPage
        onGenerate={handleGenerate}
        onLoadHistory={handleLoadHistory}
        onBackToHome={onBackToHome}
        isGenerating={isGenerating}
        generationStep={generationStep}
        imageProgress={imageProgress}
        backgroundProgress={backgroundProgress}
      />
    );
  }

  if (mode === 'preview' && previewContent && currentConfig) {
    return (
      <PreviewTable
        content={previewContent}
        config={currentConfig}
        onRegenerateImage={handleRegenerateImage}
        regeneratingIndexes={regeneratingIndexes}
        onGenerateVideo={handleGenerateVideo}
        onBackToConfig={handleBackToConfig}
        onBackToHome={onBackToHome}
      />
    );
  }

  if (!generatedContent || !currentConfig) {
    return null;
  }

  return (
    <VideoPlayer
      generatedContent={generatedContent}
      config={currentConfig}
      onBackToConfig={handleBackToConfig}
    />
  );
};

export default Generator;
