# 🎬 反内耗视频生成器

一个基于AI的自动化视频内容生成工具，可以将文本转换为带有语音、字幕和卡通配图的视频内容。

## ✨ 功能特性

- 🎙️ **文本转语音** - 支持多种中文语音和方言
- 🎵 **自动字幕生成** - AI音频识别生成精确时间轴字幕
- 🖼️ **AI卡通配图** - 根据内容自动生成匹配的卡通图片
- 🎨 **智能背景去除** - 支持多种背景处理方式
- 🎬 **实时预览播放** - 可视化视频预览和控制
- 📱 **响应式界面** - 支持多种设备访问
- 💾 **历史记录** - 自动保存生成历史，支持重新播放

## 🚀 技术栈

### 前端
- **React 18** + **TypeScript**
- **CSS3** 自定义样式
- **HTML5 Audio API** 音频控制

### 后端
- **Node.js** + **Express** 代理服务器
- **阿里云DashScope API** 文本转语音、图像生成
- **Remove.bg API** 智能背景去除

### AI服务
- **Qwen TTS Flash** 文本转语音模型
- **Paraformer V2** 语音识别模型  
- **Qwen Image Edit** 图像生成模型
- **Remove.bg** 背景去除服务

## 📦 项目结构

```
create_video/
├── proxy-server/          # 后端代理服务器
│   ├── server.js          # Express服务器
│   ├── package.json       # 后端依赖
│   ├── .env.example       # 环境变量模板
│   └── .gitignore         # Git忽略文件
├── video-site/            # 前端React应用
│   ├── src/
│   │   ├── App.tsx        # 主应用组件
│   │   ├── ConfigPage.tsx # 配置页面
│   │   └── services/      # API服务层
│   ├── public/            # 静态资源
│   ├── package.json       # 前端依赖
│   ├── .env.example       # 环境变量模板
│   └── .gitignore         # Git忽略文件
└── README.md              # 项目说明
```

## ⚡ 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/tuihou123321/ai_video_generator.git
cd ai_video_generator
```

### 2. 配置环境变量

#### 后端配置
```bash
cd proxy-server
cp .env.example .env
```

编辑 `proxy-server/.env` 文件：
```env
DASHSCOPE_API_KEY=your_dashscope_api_key
REMOVE_BG_API_KEY=your_remove_bg_api_key
PORT=3001
```

#### 前端配置
```bash
cd ../video-site
cp .env.example .env
```

编辑 `video-site/.env` 文件：
```env
REACT_APP_REMOVE_BG_API_KEY=your_remove_bg_api_key
```

### 3. 安装依赖

#### 后端依赖
```bash
cd proxy-server
npm install
```

#### 前端依赖
```bash
cd ../video-site
npm install
```

### 4. 启动服务

#### 启动后端服务器
```bash
cd proxy-server
npm start
```

#### 启动前端应用
```bash
cd ../video-site
npm start
```

### 5. 访问应用

打开浏览器访问：`http://localhost:3000`

## 🔧 配置说明

### API密钥获取

#### DashScope API Key
1. 访问 [阿里云DashScope](https://dashscope.aliyuncs.com/)
2. 注册账号并实名认证
3. 创建API Key
4. 确保账户有足够余额

#### Remove.bg API Key
1. 访问 [Remove.bg](https://www.remove.bg/api)
2. 注册账号
3. 获取API密钥
4. 免费账户每月有50次调用额度

### 图片背景处理选项

- **智能去除（推荐）** - 优先使用Remove.bg API，失败时回退到本地AI
- **Remove.bg API** - 仅使用Remove.bg服务
- **AI背景去除** - 使用本地AI模型处理
- **CSS混合模式** - CSS样式处理
- **强力去棋盘格** - 特殊滤镜处理
- **保持原始** - 不做背景处理

## 🎯 使用指南

### 1. 基本配置
- **输入文本** - 要转换的文本内容
- **选择语音** - 支持多种中文语音和方言
- **角色图片** - 用于生成配图的角色参考

### 2. 视觉设置
- **背景图片** - 视频背景
- **水印文字** - 自定义水印
- **页头文字** - 顶部显示文字
- **图片背景处理** - 选择背景去除方式

### 3. 音频设置
- **背景音乐** - 支持自定义背景音乐
- **音量控制** - 调节背景音乐音量

### 4. 样式设置
- **字幕字体大小** - 调节字幕显示大小
- **字幕颜色** - 自定义字幕颜色
- **背景透明度** - 调节字幕背景透明度

### 5. 生成流程
1. 点击「生成」后，系统会先展示一个预览表格，表格中包含：
   - **切分的文案**：每行文案会用于生成对应的一张卡通图片。
   - **生成的图片**：展示当前根据文案生成的原始图像。
   - **抠图效果**：展示自动抠图后的效果图，便于对比确认（可选，默认开启）。
   - *若在配置页关闭自动抠图，则该列展示提示信息。*
2. 若对某张图片不满意，可以直接点击该图片，触发重新生成，直到满意为止。
3. 在确认每段文案都配对了合适的图片后，点击「生成视频」，系统才会开始合成网页版的视频内容。

## 🚧 开发说明

### 本地开发

1. 确保Node.js版本 >= 16
2. 按照快速开始指南配置环境
3. 代理服务器运行在 `http://localhost:3001`
4. 前端应用运行在 `http://localhost:3000`

### API限制

- **qwen-image-edit** 模型同时只支持2个并发请求
- 项目已实现串行处理避免API限流
- Remove.bg免费账户月限50次调用

### 性能优化

- ✅ 图片生成采用串行处理，避免API限制
- ✅ 背景去除采用并发处理，提升处理速度
- ✅ 在生成阶段预处理所有图片，播放时无需等待
- ✅ 智能进度显示，实时反馈处理状态

## 📝 更新日志

### v1.0.0 (2024-09-25)
- ✨ 首次发布
- 🎙️ 支持文本转语音
- 🖼️ AI卡通配图生成
- 🎨 多种背景处理方式
- 🎬 实时视频预览播放
- 💾 历史记录功能
- 🔐 环境变量配置

## 🤝 贡献指南

1. Fork 这个项目
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

这个项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [阿里云DashScope](https://dashscope.aliyuncs.com/) - AI模型服务
- [Remove.bg](https://www.remove.bg/) - 背景去除服务
- [@imgly/background-removal](https://github.com/imgly/background-removal-js) - 本地AI背景去除
- [React](https://reactjs.org/) - 前端框架
- [Express](https://expressjs.com/) - 后端框架

## 📞 支持

如果你在使用过程中遇到问题，请：

1. 查看 [环境配置说明](ENV_SETUP.md)
2. 检查API密钥配置是否正确
3. 提交 [Issue](https://github.com/tuihou123321/ai_video_generator/issues)

---

⭐ 如果这个项目对你有帮助，请给个星标支持一下！
