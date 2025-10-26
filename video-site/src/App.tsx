import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ConfigPage, { GenerationConfig, HistoryItem } from './ConfigPage';
import { apiService, GeneratedContent } from './services/apiService';
import { imageProcessor } from './services/imageProcessor';

interface CartoonImage {
  image_url: string;
  associated_text: string;
  start_time: number;
}

function App() {
  const [mode, setMode] = useState<'config' | 'video'>('config');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [currentConfig, setCurrentConfig] = useState<GenerationConfig | null>(null);
  
  // 进度跟踪状态
  const [generationStep, setGenerationStep] = useState<string>('');
  const [imageProgress, setImageProgress] = useState<{completed: number, total: number}>({completed: 0, total: 0});
  const [backgroundProgress, setBackgroundProgress] = useState<{completed: number, total: number}>({completed: 0, total: 0});
  
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<CartoonImage | null>(null);
  const [imageScale, setImageScale] = useState<number>(70);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  
  const videoAudioRef = useRef<HTMLAudioElement>(null);
  const bgMusicRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (bgMusicRef.current && currentConfig) {
      bgMusicRef.current.volume = currentConfig.musicVolume;
      bgMusicRef.current.loop = true;
    }
  }, [currentConfig]);

  useEffect(() => {
    if (!videoAudioRef.current || !generatedContent) return;

    const audio = videoAudioRef.current;
    
    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setProgress(currentTime);

      const activeSubtitle = generatedContent.subtitles.find(
        sub => currentTime >= sub.start_time && currentTime <= sub.end_time
      );
      setCurrentSubtitle(activeSubtitle?.text || '');

      const activeImage = generatedContent.images.find(
        img => currentTime >= img.start_time && currentTime < img.start_time + 3.5
      );
      
      if (activeImage && (activeImage.processedUrl || activeImage.url) !== currentImage?.image_url) {
        setCurrentImage({
          image_url: activeImage.processedUrl || activeImage.url, // 使用处理后的URL
          associated_text: activeImage.text,
          start_time: activeImage.start_time
        });
        setImageScale(70);
        setTimeout(() => setImageScale(50), 100);
      } else if (!activeImage && currentImage) {
        setCurrentImage(null);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsControlsVisible(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentImage, generatedContent]);

  // ESC键监听
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mode === 'video') {
        setIsControlsVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [mode]);

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

      // 检查是否需要背景处理（抠图）
      const needsBackgroundProcessing = config.imageBackgroundRemoval !== 'none' && 
                                      config.imageBackgroundRemoval !== 'css-blend' && 
                                      config.imageBackgroundRemoval !== 'checkerboard-remove';

      console.log(`背景处理配置: ${config.imageBackgroundRemoval}, 需要处理: ${needsBackgroundProcessing}`);

      let images = rawImages.map(img => ({...img, processedUrl: img.url})); // 默认使用原图

      if (needsBackgroundProcessing) {
        console.log('开始调用抠图API处理所有生成的卡通图片...');
        setGenerationStep('完全并发处理背景去除...');
        setBackgroundProgress({completed: 0, total: rawImages.length});
        console.log('5. 完全并发处理背景去除...');
        
        // 背景处理可以完全并发，因为remove.bg API和本地AI没有严格限制
        let completedProcessing = 0;
        const processImagePromises = rawImages.map(async (imageData) => {
          let processedUrl = imageData.url; // 默认使用原图
          
          try {
            console.log(`[抠图API] 开始处理图片背景: ${imageData.text} - ${imageData.url}`);
            
            if (config.imageBackgroundRemoval === 'auto') {
              // 智能模式：优先使用remove.bg API
              try {
                console.log(`[抠图API] 使用remove.bg API处理: ${imageData.text}`);
                processedUrl = await imageProcessor.removeBackgroundWithRemoveBg(imageData.url);
                console.log(`[抠图API] Remove.bg API处理完成: ${imageData.text} -> ${processedUrl}`);
              } catch (error) {
                console.log(`[抠图API] Remove.bg API失败，切换到本地AI: ${imageData.text}`, error);
                processedUrl = await imageProcessor.removeBackgroundFromUrl(imageData.url);
                console.log(`[抠图API] 本地AI处理完成: ${imageData.text} -> ${processedUrl}`);
              }
            } else if (config.imageBackgroundRemoval === 'ai-remove') {
              console.log(`[抠图API] 使用本地AI处理: ${imageData.text}`);
              processedUrl = await imageProcessor.removeBackgroundFromUrl(imageData.url);
              console.log(`[抠图API] 本地AI处理完成: ${imageData.text} -> ${processedUrl}`);
            } else if (config.imageBackgroundRemoval === 'removebg-api') {
              console.log(`[抠图API] 使用remove.bg API处理: ${imageData.text}`);
              processedUrl = await imageProcessor.removeBackgroundWithRemoveBg(imageData.url);
              console.log(`[抠图API] Remove.bg API处理完成: ${imageData.text} -> ${processedUrl}`);
            }
          } catch (error) {
            console.error(`[抠图API] 背景处理失败，使用原图: ${imageData.text}`, error);
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
        console.log(`[抠图API] 所有背景处理完成！共处理${images.length}张图片`);
        console.log(`[抠图API] 抠图处理结果摘要:`, images.map(img => ({
          text: img.text,
          原始URL: img.url,
          处理后URL: img.processedUrl,
          是否成功处理: img.url !== img.processedUrl
        })));
      } else {
        console.log('根据配置跳过背景处理（抠图）步骤');
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

  const handlePlay = async () => {
    if (videoAudioRef.current && bgMusicRef.current) {
      if (isPlaying) {
        videoAudioRef.current.pause();
        bgMusicRef.current.pause();
        setIsPlaying(false);
        setIsControlsVisible(true);
      } else {
        try {
          await videoAudioRef.current.play();
          await bgMusicRef.current.play();
          setIsPlaying(true);
          setIsControlsVisible(false);
        } catch (error) {
          console.error('播放失败:', error);
          alert('音频播放失败，请检查音频文件');
        }
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoAudioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const newTime = clickRatio * duration;
    
    videoAudioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBackToConfig = () => {
    setMode('config');
    setGeneratedContent(null);
    setIsPlaying(false);
    setIsControlsVisible(true);
    if (videoAudioRef.current) {
      videoAudioRef.current.pause();
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
  };

  if (mode === 'config') {
    return (
      <ConfigPage 
        onGenerate={handleGenerate} 
        onLoadHistory={handleLoadHistory}
        isGenerating={isGenerating}
        generationStep={generationStep}
        imageProgress={imageProgress}
        backgroundProgress={backgroundProgress}
      />
    );
  }

  return (
    <div className="App">
      <div className="background">
        <img 
          src={currentConfig?.backgroundImage || "/static/bg-img.jpg"} 
          alt="background" 
          className="bg-image"
        />
      </div>

      <div className="watermark-text">{currentConfig?.watermarkText || "反叛心理"}</div>

      <div className="header">
        <div className="header-left">{currentConfig?.headerLeftText || "反内耗 | 反脆弱 | 反玻璃心"}</div>
        <div className="header-right">{currentConfig?.headerRightText || "咱不负责安慰 | 咱只提供真相"}</div>
      </div>

      {currentImage && (
        <div className="cartoon-container">
          <img 
            src={currentImage.image_url} 
            alt={currentImage.associated_text}
            className={`cartoon-image ${currentConfig?.imageBackgroundRemoval === 'css-blend' ? 'css-blend-mode' : ''} ${currentConfig?.imageBackgroundRemoval === 'checkerboard-remove' ? 'checkerboard-remove' : ''} ${currentConfig?.imageBackgroundRemoval !== 'none' && currentConfig?.imageBackgroundRemoval !== 'css-blend' && currentConfig?.imageBackgroundRemoval !== 'checkerboard-remove' ? 'background-removed' : ''}`}
            style={{
              height: `${imageScale}vh`,
              transition: 'height 0.3s ease-out'
            }}
          />
        </div>
      )}

      {currentSubtitle && (
        <div 
          className="subtitle"
          style={{
            fontSize: `${currentConfig?.subtitleFontSize || 4}rem`,
            color: currentConfig?.subtitleColor || '#ffffff',
            backgroundColor: `rgba(0, 0, 0, ${currentConfig?.subtitleBackgroundOpacity || 0.7})`
          }}
        >
          {currentSubtitle}
        </div>
      )}

      {isControlsVisible && (
        <>
          <div className="progress-container" onClick={handleProgressClick}>
            <div className="progress-bar-video">
              <div 
                className="progress-fill-video"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="progress-time">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls">
            <button className="back-button" onClick={handleBackToConfig}>
              重新配置
            </button>
            <button className="play-button" onClick={handlePlay}>
              {isPlaying ? '暂停' : '播放'}
            </button>
          </div>
        </>
      )}

      {generatedContent && (
        <>
          <audio ref={videoAudioRef}>
            <source src={generatedContent.audioUrl} type="audio/wav" />
          </audio>
          <audio ref={bgMusicRef}>
            <source src={currentConfig?.backgroundMusic || "/static/bg-music.mp3"} type="audio/mpeg" />
          </audio>
        </>
      )}
    </div>
  );
}

export default App;
