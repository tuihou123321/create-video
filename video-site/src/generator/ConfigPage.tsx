import React, { useState, useEffect } from 'react';
import './ConfigPage.css';

interface ConfigPageProps {
  onGenerate: (config: GenerationConfig) => void;
  onLoadHistory: (historyItem: HistoryItem) => void;
  onBackToHome?: () => void;
  isGenerating: boolean;
  generationStep?: string;
  imageProgress?: {completed: number, total: number};
  backgroundProgress?: {completed: number, total: number};
}

export interface GenerationConfig {
  // 基本配置
  text: string;
  voice: string;
  characterImage: string;
  
  // 视觉配置
  backgroundImage: string;
  watermarkText: string;
  headerLeftText: string;
  headerRightText: string;
  
  // 音频配置
  backgroundMusic: string;
  musicVolume: number;
  
  // 样式配置
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleBackgroundOpacity: number;
  imageBackgroundRemoval: 'auto' | 'css-blend' | 'checkerboard-remove' | 'ai-remove' | 'removebg-api' | 'none';
}

export interface HistoryItem {
  id: string;
  config: GenerationConfig;
  result: any;
  timestamp: number;
  title: string;
}

const VOICE_OPTIONS = [
  { name: '芊悦', voice: 'Cherry', description: '女声 - 甜美清新' },
  { name: '晨煦', voice: 'Ethan', description: '男声 - 温和成熟' },
  { name: '不吃鱼', voice: 'Nofish', description: '男声 - 特色音色' },
  { name: '詹妮弗', voice: 'Jennifer', description: '女声 - 优雅知性' },
  { name: '甜茶', voice: 'Ryan', description: '男声 - 活力青春' },
  { name: '卡捷琳娜', voice: 'Katerina', description: '女声 - 异域风情' },
  { name: '墨讲师', voice: 'Elias', description: '女声 - 专业稳重' },
  { name: '上海-阿珍', voice: 'Jada', description: '女声 - 上海方言' },
  { name: '北京-晓东', voice: 'Dylan', description: '男声 - 北京方言' },
  { name: '四川-晴儿', voice: 'Sunny', description: '女声 - 四川方言' },
  { name: '南京-老李', voice: 'li', description: '男声 - 南京方言' },
  { name: '陕西-秦川', voice: 'Marcus', description: '男声 - 陕西方言' },
  { name: '闽南-阿杰', voice: 'Roy', description: '男声 - 闽南方言' },
  { name: '天津-李彼得', voice: 'Peter', description: '男声 - 天津方言' },
  { name: '粤语-阿强', voice: 'Rocky', description: '男声 - 粤语' },
  { name: '粤语-阿清', voice: 'Kiki', description: '女声 - 粤语' },
  { name: '四川-程川', voice: 'Eric', description: '男声 - 四川方言' }
];

const DEFAULT_CONFIG: GenerationConfig = {
  text: '听好了，从今儿起，别再把自己当软柿子捏。学着用狠角色的路子火。',
  voice: 'Ethan',
  characterImage: 'https://cdnv2.ruguoapp.com/Fqrfh4Ix879kG9SgXtm9R9zk-uTiv3.png?imageMogr2/auto-orient/thumbnail/400x2000%3E',
  backgroundImage: '/static/bg-img.jpg',
  watermarkText: '反叛心理',
  headerLeftText: '反内耗 | 反脆弱 | 反玻璃心',
  headerRightText: '咱不负责安慰 | 咱只提供真相',
  backgroundMusic: '/static/bg-music.mp3',
  musicVolume: 0.2,
  subtitleFontSize: 4,
  subtitleColor: '#ffffff',
  subtitleBackgroundOpacity: 0.7,
  imageBackgroundRemoval: 'auto'
};

const ConfigPage: React.FC<ConfigPageProps> = ({ 
  onGenerate, 
  onLoadHistory,
  onBackToHome,
  isGenerating, 
  generationStep, 
  imageProgress, 
  backgroundProgress 
}) => {
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'visual' | 'audio' | 'style'>('basic');

  useEffect(() => {
    const savedHistory = localStorage.getItem('video-generator-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(config);
  };

  const handleLoadHistory = (item: HistoryItem) => {
    onLoadHistory(item);
  };

  const clearHistory = () => {
    localStorage.removeItem('video-generator-history');
    setHistory([]);
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const updateConfig = (field: keyof GenerationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="config-page">
      <div className="config-container">
        <div className="config-header">
          {onBackToHome && (
            <button className="back-to-home-btn" onClick={onBackToHome}>
              ← 返回首页
            </button>
          )}
          <h1>AI营销视频生成器</h1>
        </div>
        
        <div className="config-tabs">
          <button 
            className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            基本设置
          </button>
          <button 
            className={`tab-button ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            视觉设置
          </button>
          <button 
            className={`tab-button ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            音频设置
          </button>
          <button 
            className={`tab-button ${activeTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            样式设置
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="config-form">
          {/* 基本设置 */}
          {activeTab === 'basic' && (
            <>
              <div className="form-group">
                <label htmlFor="text">短视频逐字稿</label>
                <textarea
                  id="text"
                  value={config.text}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  placeholder="请输入视频文本内容..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="voice">声音选择</label>
                <div className="voice-group">
                  <div className="voice-select-container">
                    <select
                      id="voice"
                      value={config.voice}
                      onChange={(e) => updateConfig('voice', e.target.value)}
                    >
                      {VOICE_OPTIONS.map(voiceOption => (
                        <option key={voiceOption.voice} value={voiceOption.voice}>
                          {voiceOption.name} - {voiceOption.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="voice-preview-btn"
                    onClick={() => window.open('https://bailian.console.aliyun.com/?spm=a2c4g.11186623.0.0.4ed7601bSW0Csr&tab=doc#/doc/?type=model&url=2879134', '_blank')}
                  >
                    试听音效
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="characterImage">主角角色图URL</label>
                <input
                  type="url"
                  id="characterImage"
                  value={config.characterImage}
                  onChange={(e) => updateConfig('characterImage', e.target.value)}
                  placeholder="请输入角色图片URL..."
                  required
                />
              </div>
            </>
          )}

          {/* 视觉设置 */}
          {activeTab === 'visual' && (
            <>
              <div className="form-group">
                <label htmlFor="backgroundImage">背景图片URL</label>
                <input
                  type="url"
                  id="backgroundImage"
                  value={config.backgroundImage}
                  onChange={(e) => updateConfig('backgroundImage', e.target.value)}
                  placeholder="请输入背景图片URL或本地路径..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="watermarkText">水印文字</label>
                <input
                  type="text"
                  id="watermarkText"
                  value={config.watermarkText}
                  onChange={(e) => updateConfig('watermarkText', e.target.value)}
                  placeholder="页面中心的水印文字..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="headerLeftText">顶部左侧文字</label>
                <input
                  type="text"
                  id="headerLeftText"
                  value={config.headerLeftText}
                  onChange={(e) => updateConfig('headerLeftText', e.target.value)}
                  placeholder="页面顶部左侧文字..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="headerRightText">顶部右侧文字</label>
                <input
                  type="text"
                  id="headerRightText"
                  value={config.headerRightText}
                  onChange={(e) => updateConfig('headerRightText', e.target.value)}
                  placeholder="页面顶部右侧文字..."
                />
              </div>
            </>
          )}

          {/* 音频设置 */}
          {activeTab === 'audio' && (
            <>
              <div className="form-group">
                <label htmlFor="backgroundMusic">背景音乐URL</label>
                <input
                  type="url"
                  id="backgroundMusic"
                  value={config.backgroundMusic}
                  onChange={(e) => updateConfig('backgroundMusic', e.target.value)}
                  placeholder="请输入背景音乐URL或本地路径..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="musicVolume">背景音乐音量 ({Math.round(config.musicVolume * 100)}%)</label>
                <input
                  type="range"
                  id="musicVolume"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.musicVolume}
                  onChange={(e) => updateConfig('musicVolume', parseFloat(e.target.value))}
                />
                <div className="range-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </>
          )}

          {/* 样式设置 */}
          {activeTab === 'style' && (
            <>
              <div className="form-group">
                <label htmlFor="subtitleFontSize">字幕字体大小 ({config.subtitleFontSize}rem)</label>
                <input
                  type="range"
                  id="subtitleFontSize"
                  min="1"
                  max="8"
                  step="0.5"
                  value={config.subtitleFontSize}
                  onChange={(e) => updateConfig('subtitleFontSize', parseFloat(e.target.value))}
                />
                <div className="range-labels">
                  <span>1rem</span>
                  <span>4rem</span>
                  <span>8rem</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subtitleColor">字幕文字颜色</label>
                <input
                  type="color"
                  id="subtitleColor"
                  value={config.subtitleColor}
                  onChange={(e) => updateConfig('subtitleColor', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitleBackgroundOpacity">字幕背景透明度 ({Math.round(config.subtitleBackgroundOpacity * 100)}%)</label>
                <input
                  type="range"
                  id="subtitleBackgroundOpacity"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.subtitleBackgroundOpacity}
                  onChange={(e) => updateConfig('subtitleBackgroundOpacity', parseFloat(e.target.value))}
                />
                <div className="range-labels">
                  <span>透明</span>
                  <span>半透明</span>
                  <span>不透明</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="imageBackgroundRemoval">图片背景处理</label>
                <select
                  id="imageBackgroundRemoval"
                  value={config.imageBackgroundRemoval}
                  onChange={(e) => updateConfig('imageBackgroundRemoval', e.target.value)}
                >
                  <option value="auto">智能去除（推荐）</option>
                  <option value="ai-remove">AI背景去除</option>
                  <option value="removebg-api">Remove.bg API</option>
                  <option value="css-blend">CSS混合模式</option>
                  <option value="checkerboard-remove">强力去棋盘格</option>
                  <option value="none">保持原始</option>
                </select>
                <p className="form-hint">AI背景去除和Remove.bg API可完全移除棋盘格背景，效果最佳</p>
              </div>
            </>
          )}

          <div className="form-buttons">
            <button 
              type="button" 
              className="reset-button"
              onClick={resetToDefaults}
            >
              重置为默认
            </button>
            <button 
              type="submit" 
              className="generate-button"
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '生成视频'}
            </button>
          </div>
        </form>

        {isGenerating && (
          <div className="progress-container">
            <div className="progress-info">
              <h3>生成进度</h3>
              <p className="progress-step">{generationStep || '正在生成...'}</p>
              
              {imageProgress && imageProgress.total > 0 && (
                <div className="progress-item">
                  <div className="progress-label">
                    图片生成: {imageProgress.completed}/{imageProgress.total}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(imageProgress.completed / imageProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {backgroundProgress && backgroundProgress.total > 0 && (
                <div className="progress-item">
                  <div className="progress-label">
                    背景处理: {backgroundProgress.completed}/{backgroundProgress.total}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(backgroundProgress.completed / backgroundProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="history-section">
            <div className="history-header">
              <h2>历史记录</h2>
              <button onClick={clearHistory} className="clear-history-btn">清空记录</button>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-content">
                    <h3>{item.title}</h3>
                    <p className="history-text">{item.config.text.substring(0, 50)}...</p>
                    <p className="history-info">
                      声音: {VOICE_OPTIONS.find(v => v.voice === item.config.voice)?.name || item.config.voice} | {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleLoadHistory(item)}
                    className="load-history-btn"
                  >
                    查看
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPage;
