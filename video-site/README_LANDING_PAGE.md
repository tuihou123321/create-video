# 🎬 AI视频生成器 - Landing Page 版本

## 📖 项目概述

这是一个专为视频营销人员打造的AI视频生成工具，现在配备了专业的Landing Page（着陆页），采用现代化UI设计，包含完整的营销页面元素。

## ✨ 主要特性

### Landing Page 特性
- ✅ **现代化设计** - 渐变色主题 + 流畅动画
- ✅ **完全响应式** - 完美适配桌面、平板、移动设备
- ✅ **配置化管理** - 所有内容通过配置文件轻松修改
- ✅ **零图片依赖** - 使用emoji图标，加载速度快
- ✅ **8大核心区块** - Hero、功能、介绍、优势、特性、FAQ、CTA、页脚

### 视频生成特性
- 🎙️ **智能配音** - 支持17种中文方言
- 📝 **自动字幕** - AI语音识别，精准时间轴
- 🎨 **AI配图** - 自动生成匹配的卡通配图
- ✨ **背景处理** - 多种背景去除方案
- 🎵 **背景音乐** - 自定义音乐和音量
- ⚡ **实时预览** - 所见即所得

## 📁 项目结构

```
video-site/
├── src/
│   ├── App.tsx                      # 主应用组件
│   ├── App.css                      # 主应用样式
│   ├── LandingPage.tsx              # Landing Page组件 ⭐新增
│   ├── LandingPage.css              # Landing Page样式 ⭐新增
│   ├── landingConfig.ts             # Landing Page配置 ⭐新增
│   ├── landingConfig.example.ts     # 配置示例 ⭐新增
│   ├── ConfigPage.tsx               # 配置页面组件
│   ├── ConfigPage.css               # 配置页面样式
│   └── services/                    # API服务
│       ├── apiService.ts
│       └── imageProcessor.ts
├── public/                          # 静态资源
├── LANDING_PAGE_GUIDE.md           # 详细使用指南 ⭐新增
├── QUICK_START.md                  # 快速开始指南 ⭐新增
└── package.json                    # 依赖配置
```

## 🚀 快速开始

### 1. 安装依赖
```bash
cd video-site
npm install
```

### 2. 启动开发服务器
```bash
npm start
```

应用会自动在浏览器打开 `http://localhost:3000`

### 3. 查看Landing Page
首次访问会看到Landing Page，点击"免费开始创作"进入配置页面

## 📝 自定义内容

### 方法1: 直接修改默认配置（推荐）
编辑 `src/landingConfig.ts`：

```typescript
export const defaultLandingConfig: LandingConfig = {
  hero: {
    title: '您的标题',
    subtitle: '您的副标题',
    // ...修改其他内容
  },
  // ...
}
```

### 方法2: 创建自定义配置
1. 复制 `landingConfig.example.ts` 为新文件
2. 修改配置内容
3. 在 `App.tsx` 中引入使用

详见 [`QUICK_START.md`](./QUICK_START.md)

## 🎨 页面结构

Landing Page包含以下8个区块：

1. **Hero Section** - 英雄区
   - 主标题、副标题、描述
   - CTA按钮
   - 统计数据
   - 动画效果

2. **Features Section** - 功能区
   - 6个核心功能卡片
   - 图标 + 标题 + 描述

3. **Introduction Section** - 介绍区
   - 产品介绍文字
   - 4个核心亮点

4. **Benefits Section** - 优势区
   - 4个核心优势
   - 包含数据统计

5. **Key Features Section** - 核心特性区
   - 4个详细特性
   - 配有标签

6. **FAQ Section** - 常见问题区
   - 8个问答
   - 手风琴效果

7. **CTA Section** - 行动召唤区
   - 转化文案
   - 行动按钮

8. **Footer** - 页脚
   - 品牌信息
   - 版权声明

## 🔄 页面导航流程

```
Landing Page (mode: 'landing')
    ↓ 点击"免费开始创作"
配置页面 (mode: 'config')
    ↓ 点击"生成视频"
视频预览 (mode: 'video')
    ↓ 点击"重新配置"
配置页面 (mode: 'config')
    ↓ 点击"返回首页"
Landing Page (mode: 'landing')
```

## 📱 响应式设计

- **桌面端** (>1024px) - 完整布局
- **平板端** (768-1024px) - 优化布局
- **移动端** (<768px) - 堆叠布局

在移动端：
- 导航栏简化
- 卡片单列显示
- 字体自适应
- 触摸友好

## 🎯 使用场景

### 营销人员
- 快速制作短视频内容
- 批量生产视频素材
- 多平台内容分发

### 内容创作者
- 文字转视频
- 配音配图自动化
- 提升创作效率

### 企业宣传
- 产品介绍视频
- 品牌宣传片
- 教育培训内容

## 📚 文档导航

- **[快速开始指南](./QUICK_START.md)** - 5分钟上手
- **[详细使用指南](./LANDING_PAGE_GUIDE.md)** - 深入了解所有功能
- **[更新说明](../LANDING_PAGE_UPDATE.md)** - 了解本次更新内容
- **[配置示例](./src/landingConfig.example.ts)** - 配置文件参考

## 🛠️ 技术栈

- **React 19** - UI框架
- **TypeScript** - 类型安全
- **CSS3** - 现代样式和动画
- **Node.js + Express** - 后端代理服务器
- **阿里云DashScope** - AI服务
- **Remove.bg API** - 背景去除

## 🎨 设计特点

### 颜色主题
- 主色：`#667eea` (紫色)
- 辅色：`#764ba2` (深紫)
- 强调色：`#f093fb` (粉紫)

### 动画效果
- 浮动动画 - Hero区卡片
- 脉冲动画 - 图标元素
- 渐变动画 - 进度条
- 悬停动画 - 交互元素

### 设计理念
- **简洁** - 去除不必要的元素
- **专注** - 突出核心价值
- **引导** - 清晰的转化路径
- **专业** - 符合B2B/B2C营销标准

## 📊 性能优化

- ✅ GPU加速的CSS动画
- ✅ 无外部图片依赖
- ✅ 代码分割和懒加载
- ✅ 优化的渲染性能
- ✅ 响应式图片处理

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build

# 运行测试
npm test
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

开发规范：
1. 遵循TypeScript类型约束
2. 保持代码风格一致
3. 添加必要的注释
4. 测试所有功能

## 📄 许可证

本项目仅供学习和参考使用。

## 🆘 获取帮助

遇到问题？
1. 查看 [QUICK_START.md](./QUICK_START.md) 的常见问题部分
2. 查看 [LANDING_PAGE_GUIDE.md](./LANDING_PAGE_GUIDE.md) 的详细说明
3. 检查浏览器控制台的错误信息
4. 参考代码注释

## 📞 联系方式

- 📧 Email: 通过GitHub Issues联系
- 📝 文档: 查看项目根目录下的相关文档
- 💬 讨论: GitHub Discussions

---

**版本**: 2.0.0  
**更新日期**: 2024-10-26  
**主要更新**: 添加专业Landing Page

🎉 **享受创作视频的乐趣！**
