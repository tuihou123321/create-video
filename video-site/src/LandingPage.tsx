import React, { useState } from 'react';
import './LandingPage.css';
import { defaultLandingConfig, LandingConfig } from './landingConfig';

interface LandingPageProps {
  onStartCreating: () => void;
  config?: LandingConfig;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartCreating, 
  config = defaultLandingConfig 
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToTool = () => {
    onStartCreating();
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">AI营销视频生成器</span>
            </div>
            <div className="nav-links">
              <a href="#features">功能</a>
              <a href="#benefits">优势</a>
              <a href="#key-features">特性</a>
              <a href="#faq">FAQ</a>
              <button className="nav-cta" onClick={scrollToTool}>开始创作</button>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>✨</span>
              <span>AI驱动的视频营销工具</span>
            </div>
            <h1 className="hero-title">
              {config.hero.title}
            </h1>
            <p className="hero-subtitle">{config.hero.subtitle}</p>
            <p className="hero-description">{config.hero.description}</p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={scrollToTool}>
                {config.hero.primaryCTA}
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-secondary" onClick={() => document.getElementById('introduction')?.scrollIntoView({ behavior: 'smooth' })}>
                {config.hero.secondaryCTA}
                <span className="btn-icon">▶</span>
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">90%</div>
                <div className="stat-label">时间节省</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">17+</div>
                <div className="stat-label">方言支持</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">5分钟</div>
                <div className="stat-label">快速生成</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-container">
              <div className="floating-card card-1">
                <div className="card-icon">🎙️</div>
                <div className="card-text">智能配音</div>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">📝</div>
                <div className="card-text">自动字幕</div>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">🎨</div>
                <div className="card-text">AI配图</div>
              </div>
              <div className="hero-main-icon">{config.hero.heroImage}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{config.features.title}</h2>
            <p className="section-subtitle">{config.features.subtitle}</p>
          </div>
          <div className="features-grid">
            {config.features.items.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section id="introduction" className="introduction-section">
        <div className="section-container">
          <div className="intro-content">
            <div className="intro-text">
              <div className="section-header">
                <h2 className="section-title">{config.introduction.title}</h2>
                <p className="section-subtitle">{config.introduction.subtitle}</p>
              </div>
              <p className="intro-description">{config.introduction.content}</p>
              <div className="intro-highlights">
                {config.introduction.highlights.map((highlight, index) => (
                  <div key={index} className="highlight-item">
                    <span className="highlight-icon">✓</span>
                    <span className="highlight-text">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="intro-visual">
              <div className="intro-image-container">
                <div className="intro-icon">{config.introduction.image}</div>
                <div className="intro-decoration"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{config.benefits.title}</h2>
            <p className="section-subtitle">{config.benefits.subtitle}</p>
          </div>
          <div className="benefits-grid">
            {config.benefits.items.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <div className="benefit-content">
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-description">{benefit.description}</p>
                  {benefit.stats && (
                    <div className="benefit-stats">{benefit.stats}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="key-features" className="key-features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{config.keyFeatures.title}</h2>
            <p className="section-subtitle">{config.keyFeatures.subtitle}</p>
          </div>
          <div className="key-features-list">
            {config.keyFeatures.items.map((feature, index) => (
              <div key={index} className={`key-feature-item ${index % 2 === 1 ? 'reverse' : ''}`}>
                <div className="key-feature-visual">
                  <div className="key-feature-image">{feature.image}</div>
                </div>
                <div className="key-feature-content">
                  <h3 className="key-feature-title">{feature.title}</h3>
                  <p className="key-feature-description">{feature.description}</p>
                  <div className="key-feature-tags">
                    {feature.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="feature-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{config.faq.title}</h2>
            <p className="section-subtitle">{config.faq.subtitle}</p>
          </div>
          <div className="faq-list">
            {config.faq.items.map((item, index) => (
              <div key={index} className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(index)}>
                  <span>{item.question}</span>
                  <span className="faq-icon">{openFaqIndex === index ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">{config.cta.title}</h2>
            <p className="cta-description">{config.cta.description}</p>
            <button className="cta-button" onClick={scrollToTool}>
              {config.cta.buttonText}
              <span className="cta-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">AI营销视频生成器</span>
            </div>
            <p className="footer-text">让每个视频都自带流量</p>
          </div>
          <div className="footer-bottom">
            <p>© 2025 AI营销视频生成器. 专为视频营销人员打造.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
