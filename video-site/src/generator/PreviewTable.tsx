import React from 'react';
import './PreviewTable.css';
import { GenerationConfig } from './ConfigPage';
import { GeneratedContent } from './VideoPlayer';

interface PreviewTableProps {
  content: GeneratedContent;
  config: GenerationConfig;
  onRegenerateImage: (index: number) => Promise<void> | void;
  regeneratingIndexes: number[];
  onGenerateVideo: () => void;
  onBackToConfig: () => void;
  onBackToHome?: () => void;
}

const backgroundModeLabels: Record<string, string> = {
  auto: '智能去除（推荐）',
  'ai-remove': 'AI背景去除',
  'removebg-api': 'Remove.bg API',
  'css-blend': 'CSS混合模式',
  'checkerboard-remove': '强力去棋盘格',
  none: '保持原始'
};

const isBackgroundRemovalImageBased = (
  mode: GenerationConfig['imageBackgroundRemoval']
) => {
  return (
    mode !== 'none' &&
    mode !== 'css-blend' &&
    mode !== 'checkerboard-remove'
  );
};

const PreviewTable: React.FC<PreviewTableProps> = ({
  content,
  config,
  onRegenerateImage,
  regeneratingIndexes,
  onGenerateVideo,
  onBackToConfig,
  onBackToHome
}) => {
  const isRegenerating = (index: number) => regeneratingIndexes.includes(index);

  const handleImageClick = (index: number) => {
    if (isRegenerating(index)) {
      return;
    }
    onRegenerateImage(index);
  };

  const generatedImageCount = content.images.length;

  return (
    <div className="preview-page">
      <div className="preview-header">
        <div className="preview-header-left">
          <button className="preview-secondary-btn" onClick={onBackToConfig}>
            返回配置
          </button>
          {onBackToHome && (
            <button className="preview-secondary-btn" onClick={onBackToHome}>
              返回首页
            </button>
          )}
        </div>
        <div className="preview-header-right">
          <button
            className="preview-primary-btn"
            onClick={onGenerateVideo}
            disabled={regeneratingIndexes.length > 0}
          >
            {regeneratingIndexes.length > 0 ? '等待图片生成...' : '生成视频'}
          </button>
        </div>
      </div>

      <div className="preview-intro">
        <h1>预览配图确认</h1>
        <p>
          系统已将文案自动切分为 {content.subtitles.length} 段，并为每段生成一张配图。
          请逐一确认图片是否匹配文案，需要替换时可以直接点击图片重新生成。
        </p>
        <div className="preview-summary">
          <div>
            <span className="preview-summary-label">语音配置：</span>
            <span>{config.voice}</span>
          </div>
          <div>
            <span className="preview-summary-label">抠图状态：</span>
            <span>{config.enableBackgroundRemoval ? '已开启' : '未开启（保留原图）'}</span>
          </div>
          <div>
            <span className="preview-summary-label">背景处理模式：</span>
            <span>{backgroundModeLabels[config.imageBackgroundRemoval] || config.imageBackgroundRemoval}</span>
          </div>
          <div>
            <span className="preview-summary-label">当前配图数量：</span>
            <span>{generatedImageCount}</span>
          </div>
        </div>
      </div>

      <div className="preview-table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>切分文案</th>
              <th>生成原图</th>
              <th>抠图效果</th>
            </tr>
          </thead>
          <tbody>
            {content.subtitles.map((subtitle, index) => {
              const image = content.images[index];
              const loading = isRegenerating(index);
              const originalUrl = image?.url;
              const processedUrl = image?.processedUrl;
              const supportsMattingPreview = isBackgroundRemovalImageBased(config.imageBackgroundRemoval);
              const hasProcessedImage = supportsMattingPreview && !!processedUrl;
              const processedSameAsOriginal = supportsMattingPreview && processedUrl === originalUrl;

              return (
                <tr key={`${subtitle.start_time}-${index}`}>
                  <td className="preview-index">{index + 1}</td>
                  <td className="preview-text">
                    <span>{subtitle.text}</span>
                  </td>
                  <td>
                    <div
                      className={`preview-image-wrapper ${loading ? 'is-loading' : ''}`}
                      onClick={() => handleImageClick(index)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleImageClick(index);
                        }
                      }}
                    >
                      {originalUrl ? (
                        <img src={originalUrl} alt={`${subtitle.text} 原图`} />
                      ) : (
                        <div className="preview-image-placeholder">图片加载中...</div>
                      )}
                      <div className="preview-image-overlay">点击图片重新生成</div>
                      {loading && (
                        <div className="preview-image-loading">
                          <span>重新生成中...</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div
                      className={`preview-image-wrapper ${loading ? 'is-loading' : ''}`}
                      onClick={() => handleImageClick(index)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleImageClick(index);
                        }
                      }}
                    >
                      {hasProcessedImage ? (
                        <img src={processedUrl || originalUrl} alt={`${subtitle.text} 抠图效果`} />
                      ) : (
                        <div className="preview-image-placeholder">
                          {config.enableBackgroundRemoval
                            ? '该模式在视频中生效'
                            : '未启用抠图'}
                        </div>
                      )}
                      <div className="preview-image-overlay">点击图片重新生成</div>
                      {hasProcessedImage && processedSameAsOriginal && (
                        <div className="preview-image-badge">抠图失败，保留原图</div>
                      )}
                      {loading && (
                        <div className="preview-image-loading">
                          <span>重新生成中...</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {regeneratingIndexes.length > 0 && (
        <div className="preview-hint">
          部分图片正在重新生成，请稍候完成后再生成视频。
        </div>
      )}
    </div>
  );
};

export default PreviewTable;
