# Landing Page 使用指南

## 📋 概述

全新设计的 AI 视频生成器 Landing Page，专为视频营销人员打造，采用现代化UI设计，包含完整的营销页面元素。

## 🎨 页面结构

### 1. Hero Section（英雄区）
- **位置**：页面顶部
- **内容**：主标题、副标题、描述、CTA按钮、统计数据
- **特色**：渐变背景、浮动卡片动画、响应式设计

### 2. Features Section（功能区）
- **位置**：Hero下方
- **内容**：6个核心功能卡片
- **特色**：网格布局、悬停动画效果

### 3. Introduction Section（介绍区）
- **位置**：功能区下方
- **内容**：产品介绍、核心亮点
- **特色**：左右分栏、图文结合

### 4. Benefits Section（优势区）
- **位置**：介绍区下方
- **内容**：4大核心优势，包含数据统计
- **特色**：渐变背景、磨砂玻璃效果

### 5. Key Features Section（核心特性区）
- **位置**：优势区下方
- **内容**：4个详细特性说明，配有标签
- **特色**：交替布局、大图展示

### 6. FAQ Section（常见问题区）
- **位置**：核心特性区下方
- **内容**：8个常见问题及答案
- **特色**：手风琴效果、点击展开

### 7. CTA Section（行动召唤区）
- **位置**：FAQ下方
- **内容**：最终转化文案和按钮
- **特色**：渐变背景、醒目按钮

### 8. Footer（页脚）
- **位置**：页面底部
- **内容**：品牌信息、版权声明
- **特色**：深色主题

## ⚙️ 配置说明

### 配置文件位置
`/video-site/src/landingConfig.ts`

### 配置结构

```typescript
export interface LandingConfig {
  hero: {
    title: string;              // 主标题
    subtitle: string;           // 副标题
    description: string;        // 描述文字
    primaryCTA: string;         // 主按钮文字
    secondaryCTA: string;       // 次按钮文字
    heroImage: string;          // 英雄区图标（支持emoji）
  };
  features: {
    title: string;              // 功能区标题
    subtitle: string;           // 功能区副标题
    items: Array<{
      icon: string;             // 功能图标（emoji）
      title: string;            // 功能标题
      description: string;      // 功能描述
    }>;
  };
  // ... 其他配置项
}
```

### 如何修改内容

1. **修改文字内容**
   ```typescript
   // 编辑 landingConfig.ts
   export const defaultLandingConfig: LandingConfig = {
     hero: {
       title: '你的新标题',
       subtitle: '你的新副标题',
       // ...
     }
   }
   ```

2. **添加/删除功能卡片**
   ```typescript
   features: {
     items: [
       {
         icon: '🎯',
         title: '新功能',
         description: '新功能描述'
       },
       // 添加更多功能...
     ]
   }
   ```

3. **修改FAQ**
   ```typescript
   faq: {
     items: [
       {
         question: '你的问题？',
         answer: '你的答案'
       },
       // 添加更多问题...
     ]
   }
   ```

## 🎯 使用流程

1. **用户进入网站** → 看到 Landing Page
2. **浏览产品介绍** → 了解功能和优势
3. **点击"开始创作"** → 进入配置页面
4. **配置视频参数** → 生成视频
5. **返回首页按钮** → 回到 Landing Page

## 🎨 样式定制

### 主题色
Landing Page 使用渐变色主题：
- 主色：`#667eea` 到 `#764ba2`
- 辅色：`#f093fb`

### 修改主题色
编辑 `/video-site/src/LandingPage.css`：

```css
/* 主渐变背景 */
background: linear-gradient(135deg, #你的颜色1 0%, #你的颜色2 100%);

/* 按钮渐变 */
.btn-primary {
  background: linear-gradient(135deg, #你的颜色1 0%, #你的颜色2 100%);
}
```

## 📱 响应式设计

Landing Page 完全响应式，支持：
- 桌面端（>1024px）
- 平板端（768px - 1024px）
- 移动端（<768px）

移动端特性：
- 导航栏自动隐藏
- 卡片堆叠显示
- 字体大小自适应
- 触摸友好的交互

## 🚀 性能优化

- CSS动画使用GPU加速
- 图片使用emoji，无需加载外部资源
- 懒加载优化（如需添加图片）
- 平滑滚动效果

## 🔧 技术栈

- **React 19** - UI框架
- **TypeScript** - 类型安全
- **CSS3** - 现代化样式
- **CSS Animations** - 流畅动画

## 📝 组件说明

### LandingPage.tsx
主Landing Page组件，包含所有页面区块

### landingConfig.ts
配置文件，管理所有可配置内容

### LandingPage.css
样式文件，包含所有样式和动画

## 💡 最佳实践

1. **保持简洁**：每个区块的文字要简洁有力
2. **突出重点**：使用对比色和大小突出重要信息
3. **引导转化**：CTA按钮要醒目且位置合理
4. **移动优先**：优先考虑移动端体验
5. **性能优化**：避免大图片，使用emoji代替icon

## 🎓 示例修改

### 示例1：修改Hero区标题
```typescript
// landingConfig.ts
hero: {
  title: '让AI为您的营销赋能',
  subtitle: '智能视频生成，营销效率10倍提升',
  // ...
}
```

### 示例2：添加新功能卡片
```typescript
// landingConfig.ts
features: {
  items: [
    // 现有功能...
    {
      icon: '🎯',
      title: '精准投放',
      description: '智能分析目标受众，精准投放您的视频内容'
    }
  ]
}
```

### 示例3：修改FAQ
```typescript
// landingConfig.ts
faq: {
  items: [
    {
      question: '如何快速上手？',
      answer: '只需3步：1. 输入文案 2. 选择配音 3. 生成视频。整个过程不超过5分钟！'
    }
  ]
}
```

## 🐛 常见问题

**Q: 如何添加真实图片？**
A: 在配置中将emoji替换为图片URL，并在CSS中调整相应的样式。

**Q: 如何修改动画效果？**
A: 编辑 `LandingPage.css` 中的 `@keyframes` 规则。

**Q: 如何添加新的页面区块？**
A: 在 `LandingPage.tsx` 中添加新的 `<section>`，并在配置文件中添加相应配置。

## 📞 支持

如有问题，请参考：
- 项目主 README.md
- 组件内联注释
- React 官方文档

---

**最后更新**: 2024-10-26
**版本**: 1.0.0
