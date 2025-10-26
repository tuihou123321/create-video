import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';
import { GenerationConfig } from './ConfigPage';

interface CartoonImage {
  image_url: string;
  associated_text: string;
  start_time: number;
}

export interface GeneratedContent {
  audioUrl: string;
  subtitles: Array<{
    text: string;
    start_time: number;
    end_time: number;
  }>;
  images: Array<{
    url: string;
    processedUrl?: string;
    text: string;
    start_time: number;
  }>;
}

interface VideoPlayerProps {
  generatedContent: GeneratedContent;
  config: GenerationConfig;
  onBackToConfig: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  generatedContent,
  config,
  onBackToConfig
}) => {
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
    if (bgMusicRef.current && config) {
      bgMusicRef.current.volume = config.musicVolume;
      bgMusicRef.current.loop = true;
    }
  }, [config]);

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
          image_url: activeImage.processedUrl || activeImage.url,
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
      if (event.key === 'Escape') {
        setIsControlsVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  return (
    <div className="App">
      <div className="background">
        <img 
          src={config?.backgroundImage || "/static/bg-img.jpg"} 
          alt="background" 
          className="bg-image"
        />
      </div>

      <div className="watermark-text">{config?.watermarkText || "反叛心理"}</div>

      <div className="header">
        <div className="header-left">{config?.headerLeftText || "反内耗 | 反脆弱 | 反玻璃心"}</div>
        <div className="header-right">{config?.headerRightText || "咱不负责安慰 | 咱只提供真相"}</div>
      </div>

      {currentImage && (
        <div className="cartoon-container">
          <img 
            src={currentImage.image_url} 
            alt={currentImage.associated_text}
            className={`cartoon-image ${config?.imageBackgroundRemoval === 'css-blend' ? 'css-blend-mode' : ''} ${config?.imageBackgroundRemoval === 'checkerboard-remove' ? 'checkerboard-remove' : ''} ${config?.imageBackgroundRemoval !== 'none' && config?.imageBackgroundRemoval !== 'css-blend' && config?.imageBackgroundRemoval !== 'checkerboard-remove' ? 'background-removed' : ''}`}
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
            fontSize: `${config?.subtitleFontSize || 4}rem`,
            color: config?.subtitleColor || '#ffffff',
            backgroundColor: `rgba(0, 0, 0, ${config?.subtitleBackgroundOpacity || 0.7})`
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
            <button className="back-button" onClick={onBackToConfig}>
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
            <source src={config?.backgroundMusic || "/static/bg-music.mp3"} type="audio/mpeg" />
          </audio>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
