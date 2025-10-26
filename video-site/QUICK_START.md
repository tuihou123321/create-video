# 🚀 快速开始指南

## 启动项目

### 1. 启动后端服务器
```bash
cd proxy-server
npm install  # 首次运行需要安装依赖
npm start
```

后端服务运行在 `http://localhost:3001`

### 2. 启动前端应用
新开一个终端窗口：
```bash
cd video-site
npm install  # 首次运行需要安装依赖
npm start
```

前端应用会自动打开浏览器，访问 `http://localhost:3000`

## 🎨 自定义Landing Page内容

### 快速修改（5分钟）

编辑 `/video-site/src/landingConfig.ts`：

```typescript
export const defaultLandingConfig: LandingConfig = {
  hero: {
    title: '修改您的主标题',           // ← 改这里
    subtitle: '修改您的副标题',        // ← 改这里
    description: '修改产品描述...',    // ← 改这里
    // ...
  },
  // ...修改其他区块
}
```

保存后页面会自动刷新！

### 完整自定义步骤

1. **复制示例配置**
   ```bash
   cp src/landingConfig.example.ts src/myCustomConfig.ts
   ```

2. **修改配置内容**
   编辑 `src/myCustomConfig.ts`，按照注释修改各个区块的内容

3. **应用自定义配置**
   在 `src/App.tsx` 中：
   ```typescript
   import { customLandingConfig } from './myCustomConfig';
   
   // 在 Landing Page 组件中使用
   <LandingPage 
     onStartCreating={handleStartCreating}
     config={customLandingConfig}  // ← 使用自定义配置
   />
   ```

## 🎨 修改颜色主题

编辑 `/video-site/src/LandingPage.css`：

```css
/* 主题渐变色 - 搜索并替换这些颜色值 */

/* 主渐变 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    ↑改这里↑    ↑改这里↑

/* 按钮渐变 */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 其他渐变元素同样修改 */
```

**推荐配色方案：**
- 蓝紫渐变：`#667eea` → `#764ba2` (当前)
- 橙红渐变：`#FF6B6B` → `#FF8E53`
- 绿青渐变：`#11998e` → `#38ef7d`
- 粉紫渐变：`#ee0979` → `#ff6a00`

## 📝 常用修改场景

### 场景1：修改Hero区的统计数据

```typescript
// 在 LandingPage.tsx 中找到 hero-stats 区域
<div className="hero-stats">
  <div className="stat-item">
    <div className="stat-value">90%</div>  {/* ← 改这里 */}
    <div className="stat-label">时间节省</div>
  </div>
  // ...修改其他统计
</div>
```

### 场景2：添加新功能卡片

```typescript
// 在 landingConfig.ts 的 features.items 中添加
{
  icon: '🎯',              // 选择emoji图标
  title: '新功能名称',
  description: '功能描述文字'
}
```

### 场景3：修改FAQ

```typescript
// 在 landingConfig.ts 的 faq.items 中添加或修改
{
  question: '您的问题？',
  answer: '详细的回答内容'
}
```

## 🔍 页面导航流程

```
Landing Page (首页)
    ↓ 点击"免费开始创作"
配置页面
    ↓ 点击"生成视频"
视频预览
    ↓ 点击"重新配置"
配置页面
    ↓ 点击"返回首页"
Landing Page (首页)
```

## 📱 测试响应式设计

### Chrome DevTools
1. 按 `F12` 打开开发者工具
2. 点击 "Toggle device toolbar" 图标 (或按 `Ctrl+Shift+M`)
3. 选择不同设备尺寸查看效果：
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

### 断点测试
- 移动端: < 768px
- 平板端: 768px - 1024px
- 桌面端: > 1024px

## 🎯 优化建议

### 1. 图片替换（可选）
如果要使用真实图片代替emoji：

```typescript
// 在配置中
hero: {
  heroImage: '/path/to/your/image.png'  // 替换emoji
}
```

```css
/* 在CSS中调整样式 */
.hero-main-icon {
  background-image: url('/path/to/your/image.png');
  background-size: contain;
  width: 400px;
  height: 400px;
}
```

### 2. 字体替换（可选）
```css
/* 在 LandingPage.css 顶部添加 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.landing-page {
  font-family: 'Inter', sans-serif;
}
```

### 3. 添加Logo（可选）
```typescript
// 在 LandingPage.tsx 的导航栏中
<div className="nav-logo">
  <img src="/path/to/logo.png" alt="Logo" />
  <span className="logo-text">产品名称</span>
</div>
```

## 🐛 常见问题解决

### 问题1: 端口被占用
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 问题2: 样式不生效
**解决方案：**
1. 清除浏览器缓存 (Ctrl+Shift+R 硬刷新)
2. 检查CSS文件是否正确导入
3. 重启开发服务器

### 问题3: 配置修改不显示
**解决方案：**
1. 确认已保存文件
2. 检查是否有语法错误
3. 查看浏览器控制台是否有报错

## 📚 深入学习

- **详细指南**: 查看 `LANDING_PAGE_GUIDE.md`
- **更新说明**: 查看 `LANDING_PAGE_UPDATE.md`
- **配置示例**: 查看 `src/landingConfig.example.ts`

## ✅ 检查清单

部署前确认：
- [ ] 修改了所有文字内容（去掉示例文字）
- [ ] 测试了所有链接和按钮
- [ ] 在不同设备上测试了响应式设计
- [ ] 检查了浏览器控制台没有错误
- [ ] FAQ内容已更新为实际问题
- [ ] 颜色主题符合品牌要求

## 🎉 完成！

现在您已经掌握了Landing Page的基本使用方法！

如有更多问题，请参考详细文档或查看代码注释。

---
**最后更新**: 2024-10-26
