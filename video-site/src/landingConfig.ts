// Landing Page 配置文件
export interface LandingConfig {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    primaryCTA: string;
    secondaryCTA: string;
    heroImage: string;
  };
  features: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  introduction: {
    title: string;
    subtitle: string;
    content: string;
    image: string;
    highlights: string[];
  };
  benefits: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
      stats?: string;
    }>;
  };
  keyFeatures: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
      image: string;
      tags: string[];
    }>;
  };
  faq: {
    title: string;
    subtitle: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    buttonText: string;
  };
}

export const defaultLandingConfig: LandingConfig = {
  hero: {
    title: '让每个视频都自带流量',
    subtitle: '营销人员的智能助手',
    description: '一键生成专业短视频，智能配音、自动字幕、AI配图，让您的内容营销事半功倍',
    primaryCTA: '免费开始创作',
    secondaryCTA: '观看演示',
    heroImage: '🎬'
  },
  features: {
    title: '强大功能',
    subtitle: '为视频营销人员量身定制的AI工具',
    items: [
      {
        icon: '🎙️',
        title: '智能配音',
        description: '支持17种中文方言和语音风格，让您的视频更具亲和力'
      },
      {
        icon: '📝',
        title: '自动字幕',
        description: '基于AI语音识别，自动生成精准时间轴字幕，省时省力'
      },
      {
        icon: '🎨',
        title: 'AI配图',
        description: '智能生成与内容匹配的卡通配图，让视频更生动有趣'
      },
      {
        icon: '✨',
        title: '背景处理',
        description: '智能去除图片背景，支持多种处理模式，完美融入场景'
      },
      {
        icon: '🎵',
        title: '背景音乐',
        description: '自定义背景音乐，可调节音量，打造沉浸式观看体验'
      },
      {
        icon: '⚡',
        title: 'IP定制',
        description: '打造专属品牌IP形象,定制化声音和视觉风格,让内容更具辨识度'
      }
    ]
  },
  introduction: {
    title: '为什么选择AI视频生成器？',
    subtitle: '专为视频营销而生',
    content: '在短视频营销的时代，内容产出速度决定了竞争力。我们的AI视频生成器让您从繁琐的视频制作中解放出来，专注于创意和策略。无需专业视频编辑技能，无需昂贵的制作团队，只需要一段文案，就能生成专业级的营销视频。',
    image: '📊',
    highlights: [
      '节省90%的视频制作时间',
      '降低80%的内容生产成本',
      '提升3倍的内容产出效率',
      '零门槛上手，即学即用'
    ]
  },
  benefits: {
    title: '核心优势',
    subtitle: '让您的视频营销更轻松',
    items: [
      {
        icon: '💰',
        title: '降低成本',
        description: '无需雇佣配音演员、视频剪辑师，一个人就能完成整个制作流程',
        stats: '省钱80%'
      },
      {
        icon: '⏱️',
        title: '提升效率',
        description: '从创意到成品仅需5分钟，让您的创意快速变现',
        stats: '提速10倍'
      },
      {
        icon: '🎯',
        title: '精准营销',
        description: '支持多种方言配音，精准触达目标用户群体',
        stats: '转化+50%'
      },
      {
        icon: '📈',
        title: '持续优化',
        description: '历史记录功能，轻松复用和优化成功案例',
        stats: '复用率95%'
      }
    ]
  },
  keyFeatures: {
    title: '核心特性',
    subtitle: '每个功能都经过精心打磨',
    items: [
      {
        title: '多方言智能配音',
        description: '提供17种中文方言和语音风格选择，包括标准普通话、上海话、北京话、四川话、粤语等，让您的视频更贴近目标受众。每种声音都经过AI优化，自然流畅。',
        image: '🗣️',
        tags: ['中文方言', '自然语音', '情感表达']
      },
      {
        title: 'AI图像生成与处理',
        description: '基于先进的图像生成模型，自动创建与内容匹配的卡通配图。支持智能背景去除，包括Remove.bg API、本地AI等多种处理方式，确保图片完美融入视频场景。',
        image: '🖼️',
        tags: ['AI生成', '背景去除', '智能匹配']
      },
      {
        title: '精准时间轴字幕',
        description: '采用阿里云Paraformer V2语音识别模型，自动生成带精确时间轴的字幕。支持自定义字体大小、颜色和背景透明度，让字幕更符合您的品牌风格。',
        image: '📝',
        tags: ['自动识别', '时间同步', '样式自定义']
      },
      {
        title: '历史记录管理',
        description: '自动保存每次生成的视频配置和结果，支持一键回放和复用。轻松管理您的创作历史，快速复制成功案例，持续优化营销效果。',
        image: '💾',
        tags: ['自动保存', '快速复用', '版本管理']
      }
    ]
  },
  faq: {
    title: '常见问题',
    subtitle: '您可能想了解的',
    items: [
      {
        question: '需要哪些技术背景才能使用？',
        answer: '完全不需要！我们的工具设计理念就是零门槛。只要您会打字，就能创作出专业的营销视频。所有AI功能都已经封装好，您只需要输入文案和选择配音即可。'
      },
      {
        question: '生成一个视频需要多长时间？',
        answer: '通常情况下，一个30秒的短视频从开始到完成只需要3-5分钟。具体时间取决于文案长度和配图数量。我们采用了智能并发处理技术，大大缩短了生成时间。'
      },
      {
        question: '支持哪些配音语言和方言？',
        answer: '目前支持17种中文语音，包括标准普通话（多种风格）、上海话、北京话、四川话、南京话、陕西话、闽南话、天津话、粤语等。每种语音都有独特的特色，适合不同的营销场景。'
      },
      {
        question: '如何去除AI生成图片的背景？',
        answer: '我们提供多种背景处理方案：1) 智能去除（推荐）：自动选择最佳方案；2) Remove.bg API：专业级背景去除；3) 本地AI：离线处理；4) CSS混合模式：快速处理；5) 保持原始：不做处理。您可以根据需求选择。'
      },
      {
        question: '生成的视频可以商用吗？',
        answer: '可以！您生成的所有内容都归您所有，可以自由用于商业营销。但请注意，如果使用了第三方素材（如背景图片、音乐），请确保您有相应的使用权限。'
      },
      {
        question: '如何保存和复用我的创作？',
        answer: '系统会自动保存您的每次创作记录（最多10条）。您可以在历史记录中查看和回放之前的作品，也可以基于历史配置快速创建新视频。所有数据都保存在本地浏览器中，安全可靠。'
      },
      {
        question: '需要什么样的配置才能使用？',
        answer: '只需要一台能上网的电脑和现代浏览器（Chrome、Firefox、Safari等）。不需要安装任何软件，不需要高性能电脑。所有AI处理都在云端完成，您的设备只负责展示结果。'
      },
      {
        question: '遇到问题如何获取支持？',
        answer: '我们提供完善的文档说明和在线支持。如果在使用过程中遇到任何问题，请检查浏览器控制台的错误信息，或参考项目文档中的故障排除指南。'
      }
    ]
  },
  cta: {
    title: '准备好开始创作了吗？',
    description: '立即使用AI视频生成器，让您的视频营销更轻松、更高效、更专业',
    buttonText: '免费开始创作'
  }
};
