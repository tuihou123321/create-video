/**
 * Landing Page 配置示例文件
 * 
 * 这是一个示例配置，展示了如何自定义Landing Page的所有内容。
 * 复制此文件到 landingConfig.ts 并根据您的需求进行修改。
 */

import { LandingConfig } from './landingConfig';

export const customLandingConfig: LandingConfig = {
  // ===== Hero Section 英雄区配置 =====
  hero: {
    title: '您的主标题',
    subtitle: '您的副标题',
    description: '这里放置您的产品描述，简洁有力地说明产品价值',
    primaryCTA: '主要行动按钮',
    secondaryCTA: '次要行动按钮',
    heroImage: '🎬' // 可以使用任何emoji或图片URL
  },

  // ===== Features Section 功能区配置 =====
  features: {
    title: '核心功能',
    subtitle: '为什么选择我们的产品',
    items: [
      {
        icon: '🎙️',
        title: '功能1',
        description: '功能1的详细描述，说明它如何帮助用户'
      },
      {
        icon: '📝',
        title: '功能2',
        description: '功能2的详细描述，说明它如何帮助用户'
      },
      {
        icon: '🎨',
        title: '功能3',
        description: '功能3的详细描述，说明它如何帮助用户'
      },
      {
        icon: '✨',
        title: '功能4',
        description: '功能4的详细描述，说明它如何帮助用户'
      },
      {
        icon: '🎵',
        title: '功能5',
        description: '功能5的详细描述，说明它如何帮助用户'
      },
      {
        icon: '⚡',
        title: '功能6',
        description: '功能6的详细描述，说明它如何帮助用户'
      }
    ]
  },

  // ===== Introduction Section 介绍区配置 =====
  introduction: {
    title: '关于我们的产品',
    subtitle: '详细介绍产品背景',
    content: '这里是详细的产品介绍文字，可以包含多个段落。说明产品的背景、使用场景、解决的问题等。建议控制在200字以内，保持简洁。',
    image: '📊', // 可以使用emoji或图片URL
    highlights: [
      '亮点1：量化的数据说明',
      '亮点2：具体的优势描述',
      '亮点3：用户获得的价值',
      '亮点4：与竞品的差异化'
    ]
  },

  // ===== Benefits Section 优势区配置 =====
  benefits: {
    title: '核心优势',
    subtitle: '我们带给您的价值',
    items: [
      {
        icon: '💰',
        title: '优势1',
        description: '详细说明这个优势如何帮助用户节省成本或提升效率',
        stats: '数据展示' // 例如：省钱80%
      },
      {
        icon: '⏱️',
        title: '优势2',
        description: '详细说明这个优势如何帮助用户节省时间',
        stats: '数据展示' // 例如：提速10倍
      },
      {
        icon: '🎯',
        title: '优势3',
        description: '详细说明这个优势如何帮助用户达成目标',
        stats: '数据展示' // 例如：转化+50%
      },
      {
        icon: '📈',
        title: '优势4',
        description: '详细说明这个优势的长期价值',
        stats: '数据展示' // 例如：复用率95%
      }
    ]
  },

  // ===== Key Features Section 核心特性配置 =====
  keyFeatures: {
    title: '核心特性',
    subtitle: '深入了解产品功能',
    items: [
      {
        title: '特性1标题',
        description: '特性1的详细描述。这里可以写得更详细一些，说明技术实现、使用方法、适用场景等。建议控制在150字以内。',
        image: '🗣️', // 可以使用emoji或图片URL
        tags: ['标签1', '标签2', '标签3'] // 相关的技术或特点标签
      },
      {
        title: '特性2标题',
        description: '特性2的详细描述。这里可以写得更详细一些，说明技术实现、使用方法、适用场景等。',
        image: '🖼️',
        tags: ['标签1', '标签2', '标签3']
      },
      {
        title: '特性3标题',
        description: '特性3的详细描述。这里可以写得更详细一些，说明技术实现、使用方法、适用场景等。',
        image: '📝',
        tags: ['标签1', '标签2', '标签3']
      },
      {
        title: '特性4标题',
        description: '特性4的详细描述。这里可以写得更详细一些，说明技术实现、使用方法、适用场景等。',
        image: '💾',
        tags: ['标签1', '标签2', '标签3']
      }
    ]
  },

  // ===== FAQ Section 常见问题配置 =====
  faq: {
    title: '常见问题',
    subtitle: '您可能想了解的',
    items: [
      {
        question: '问题1？',
        answer: '问题1的详细回答。要简洁明了，直接解答用户疑问。可以包含具体的操作步骤或说明。'
      },
      {
        question: '问题2？',
        answer: '问题2的详细回答。'
      },
      {
        question: '问题3？',
        answer: '问题3的详细回答。'
      },
      {
        question: '问题4？',
        answer: '问题4的详细回答。'
      },
      {
        question: '问题5？',
        answer: '问题5的详细回答。'
      },
      {
        question: '问题6？',
        answer: '问题6的详细回答。'
      },
      {
        question: '问题7？',
        answer: '问题7的详细回答。'
      },
      {
        question: '问题8？',
        answer: '问题8的详细回答。'
      }
    ]
  },

  // ===== CTA Section 行动召唤配置 =====
  cta: {
    title: '准备好开始了吗？',
    description: '一句话总结产品价值，鼓励用户采取行动',
    buttonText: '立即开始'
  }
};

/**
 * 使用自定义配置的示例：
 * 
 * 在 App.tsx 或 LandingPage.tsx 中：
 * import { customLandingConfig } from './landingConfig.example';
 * 
 * <LandingPage 
 *   onStartCreating={handleStartCreating}
 *   config={customLandingConfig}
 * />
 */
