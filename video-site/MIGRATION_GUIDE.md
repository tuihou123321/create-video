# 🔄 迁移指南 - 工具页重构

## 快速迁移

如果您之前使用过旧版本的代码，这里是迁移指南。

## 📁 文件位置变更

### 之前的结构
```
src/
├── App.tsx           # 包含所有逻辑
├── App.css
├── ConfigPage.tsx
├── ConfigPage.css
└── LandingPage.tsx
```

### 现在的结构
```
src/
├── App.tsx                    # 仅路由逻辑
├── LandingPage.tsx            # 着陆页
├── generator/                 # 工具页目录 ⭐新增
│   ├── index.tsx             # 工具主入口
│   ├── ConfigPage.tsx        # 配置页
│   ├── ConfigPage.css
│   ├── VideoPlayer.tsx       # 播放器 ⭐新增
│   └── VideoPlayer.css
└── services/                  # 保持不变
```

## 🔧 代码变更

### 1. 不再直接使用 ConfigPage

**❌ 旧方式：**
```typescript
import ConfigPage from './ConfigPage';

<ConfigPage onGenerate={...} />
```

**✅ 新方式：**
```typescript
import Generator from './generator';

<Generator onBackToHome={...} />
```

### 2. App.tsx 简化

**❌ 旧代码：**
```typescript
// 管理 landing、config、video 三个模式
const [mode, setMode] = useState<'landing' | 'config' | 'video'>('landing');

// 包含所有生成逻辑
const handleGenerate = async (config) => {
  // ... 大量代码
};
```

**✅ 新代码：**
```typescript
// 只管理两个页面
const [currentPage, setCurrentPage] = useState<'landing' | 'generator'>('landing');

// 简单的页面切换
const handleStartCreating = () => setCurrentPage('generator');
const handleBackToHome = () => setCurrentPage('landing');
```

### 3. 导入路径变更

如果您有自定义代码引用这些组件：

**❌ 旧导入：**
```typescript
import ConfigPage from './ConfigPage';
import { GenerationConfig } from './ConfigPage';
```

**✅ 新导入：**
```typescript
import Generator from './generator';
import { GenerationConfig } from './generator/ConfigPage';
```

## 🎯 功能保持不变

尽管文件结构改变，但所有功能都保持不变：

- ✅ 文本转语音
- ✅ 自动字幕生成
- ✅ AI配图
- ✅ 背景处理
- ✅ 历史记录
- ✅ 视频预览

## 📝 配置文件兼容

所有配置和历史记录完全兼容：

- ✅ localStorage中的历史记录可直接使用
- ✅ 配置格式完全相同
- ✅ API调用方式不变

## 🔄 升级步骤

### 方式一：使用新代码（推荐）

直接使用最新的代码，无需迁移。

### 方式二：手动升级现有项目

1. **备份现有代码**
   ```bash
   cp -r video-site video-site-backup
   ```

2. **创建 generator 目录**
   ```bash
   mkdir -p video-site/src/generator
   ```

3. **移动并重命名文件**
   - 将旧的 `App.tsx` 中的视频生成逻辑提取到 `generator/index.tsx`
   - 复制 `ConfigPage.tsx` 到 `generator/ConfigPage.tsx`
   - 创建新的 `generator/VideoPlayer.tsx`

4. **简化 App.tsx**
   参考新的 `App.tsx`，只保留路由逻辑

5. **测试功能**
   ```bash
   npm start
   ```

## 🐛 常见问题

### Q: 旧的历史记录还能用吗？
**A:** 可以！历史记录存储格式完全兼容，无需任何修改。

### Q: 我的自定义配置需要改吗？
**A:** 不需要！`GenerationConfig` 接口完全相同。

### Q: 性能有变化吗？
**A:** 没有性能变化，只是代码组织方式改变了。

### Q: 可以只用Landing Page吗？
**A:** 可以！在 `App.tsx` 中设置初始页面为 `'generator'` 即可跳过Landing Page。

### Q: 能直接访问配置页吗？
**A:** 可以！Generator组件默认显示配置页面。

## ✅ 检查清单

升级后请检查：

- [ ] Landing Page正常显示
- [ ] 点击"免费开始创作"能跳转到工具页
- [ ] 配置页面所有表单正常工作
- [ ] 生成视频功能正常
- [ ] 视频预览播放正常
- [ ] 历史记录能正常加载
- [ ] "返回首页"按钮正常工作
- [ ] 无控制台错误

## 📞 需要帮助？

如果升级过程中遇到问题：

1. 查看 [GENERATOR_REFACTOR.md](../GENERATOR_REFACTOR.md) 了解详细变更
2. 查看新的 `App.tsx` 示例代码
3. 检查浏览器控制台错误信息
4. 对比旧版和新版文件差异

---

**迁移难度**: ⭐ 简单  
**向后兼容**: ✅ 完全兼容  
**数据迁移**: ❌ 不需要
