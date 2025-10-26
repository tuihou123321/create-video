import React, { useState } from 'react';
import ConfigPage, { GenerationConfig, HistoryItem } from './ConfigPage';
import VideoPlayer, { GeneratedContent } from './VideoPlayer';
import { apiService } from '../services/apiService';
import { imageProcessor } from '../services/imageProcessor';

interface GeneratorProps {
  onBackToHome: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ onBackToHome }) => {
  const [mode, setMode] = useState<'config' | 'video'>('config');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [currentConfig, setCurrentConfig] = useState<GenerationConfig | null>(null);
  
  // 进度跟踪状态
  const [generationStep, setGenerationStep] = useState<string>('');
  const [imageProgress, setImageProgress] = useState<{completed: number, total: number}>({completed: 0, total: 0});
  const [backgroundProgress, setBackgroundProgress] = useState<{completed: number, total: number}>({completed: 0, total: 0});

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
    setIsGenerating(true);
    setCurrentConfig(config);
    setGenerationStep('准备开始...');
    setImageProgress({completed: 0, total: 0});
    setBackgroundProgress({completed: 0, total: 0});
    
    try {
      setGenerationStep('文本转语音中...');
      console.log('1. 开始文本转语音...');
      const audioUrl = await apiService.textToSpeech(config.text, config.voice);
      console.log('音频URL:', audioUrl);

      setGenerationStep('音频转字幕中...');
      console.log('2. 开始音频转字幕...');
      const taskId = await apiService.startASRTask(audioUrl);
      console.log('ASR任务ID:', taskId);
      
      const transcriptionUrl = await apiService.waitForASRCompletion(taskId);
      console.log('字幕URL:', transcriptionUrl);

      setGenerationStep('获取字幕文件...');
      console.log('3. 获取字幕文件...');
      const transcriptionData = await apiService.fetchTranscription(transcriptionUrl);
      const subtitles = apiService.processTranscription(transcriptionData);
      console.log('处理后的字幕:', subtitles);

      setGenerationStep('串行生成配图...');
      setImageProgress({completed: 0, total: subtitles.length});
      console.log('4. 串行生成配图（避免API限制）...');
      
      // 串行生成图片，避免API并发限制
      const rawImages = [];
      for (let i = 0; i < subtitles.length; i++) {
        const subtitle = subtitles[i];
        const prompt = apiService.generateImagePrompt(subtitle.text);
        const imageUrl = await apiService.generateImage(config.characterImage, prompt);
        
        rawImages.push({
          url: imageUrl,
          text: subtitle.text,
          start_time: subtitle.start_time
        });
        
        // 更新进度
        setImageProgress({completed: i + 1, total: subtitles.length});
        console.log(`生成配图 (${i + 1}/${subtitles.length}): ${subtitle.text} -> ${imageUrl}`);
      }
      
      console.log(`所有配图生成完成，共${rawImages.length}张`);

      // 只有需要背景处理的才进行处理
      const needsBackgroundProcessing = config.imageBackgroundRemoval !== 'none' && 
                                      config.imageBackgroundRemoval !== 'css-blend' && 
                                      config.imageBackgroundRemoval !== 'checkerboard-remove';

      let images = rawImages.map(img => ({...img, processedUrl: img.url})); // 默认使用原图

      if (needsBackgroundProcessing) {
        setGenerationStep('完全并发处理背景去除...');
        setBackgroundProgress({completed: 0, total: rawImages.length});
        console.log('5. 完全并发处理背景去除...');
        
        // 背景处理可以完全并发
        let completedProcessing = 0;
        const processImagePromises = rawImages.map(async (imageData) => {
          let processedUrl = imageData.url; // 默认使用原图
          
          try {
            console.log(`开始处理图片背景: ${imageData.text}`);
            
            if (config.imageBackgroundRemoval === 'auto') {
              // 智能模式：优先使用remove.bg API
              try {
                processedUrl = await imageProcessor.removeBackgroundWithRemoveBg(imageData.url);
                console.log(`Remove.bg API处理完成: ${imageData.text}`);
              } catch (error) {
                console.log(`Remove.bg API失败，使用本地AI: ${imageData.text}`);
                processedUrl = await imageProcessor.removeBackgroundFromUrl(imageData.url);
                console.log(`本地AI处理完成: ${imageData.text}`);
              }
            } else if (config.imageBackgroundRemoval === 'ai-remove') {
              processedUrl = await imageProcessor.removeBackgroundFromUrl(imageData.url);
              console.log(`AI处理完成: ${imageData.text}`);
            } else if (config.imageBackgroundRemoval === 'removebg-api') {
              processedUrl = await imageProcessor.removeBackgroundWithRemoveBg(imageData.url);
              console.log(`Remove.bg API处理完成: ${imageData.text}`);
            }
          } catch (error) {
            console.error(`背景处理失败，使用原图: ${imageData.text}`, error);
            processedUrl = imageData.url;
          }
          
          completedProcessing++;
          setBackgroundProgress({completed: completedProcessing, total: rawImages.length});
          console.log(`背景处理完成 (${completedProcessing}/${rawImages.length}): ${imageData.text}`);
          
          return {
            url: imageData.url,
            processedUrl: processedUrl,
            text: imageData.text,
            start_time: imageData.start_time
          };
        });
        
        images = await Promise.all(processImagePromises);
        console.log(`所有背景处理完成，共${images.length}张`);
      }

      setGenerationStep('完成生成');
      const content: GeneratedContent = {
        audioUrl,
        subtitles,
        images
      };

      setGeneratedContent(content);
      saveToHistory(config, content);
      setMode('video');
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请检查网络连接和API配置');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
      setImageProgress({completed: 0, total: 0});
      setBackgroundProgress({completed: 0, total: 0});
    }
  };

  const handleLoadHistory = (historyItem: HistoryItem) => {
    setGeneratedContent(historyItem.result);
    setCurrentConfig(historyItem.config);
    setMode('video');
  };

  const handleBackToConfig = () => {
    setMode('config');
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

  return (
    <VideoPlayer
      generatedContent={generatedContent!}
      config={currentConfig!}
      onBackToConfig={handleBackToConfig}
    />
  );
};

export default Generator;
