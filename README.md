# 🚀 AI 算法解析引擎

一个基于 AI 的算法代码分析工具，能够智能解析算法复杂度、推演执行步骤并提供优化建议。

## ✨ 功能特性

- 🔍 **智能代码解析** - 自动识别算法类型和关键逻辑
- ⚡ **复杂度分析** - 精确计算时间和空间复杂度
- 📊 **步骤推演** - 可视化展示代码执行的每一步
- 💡 **优化建议** - AI 提供专业的性能优化方案
- 🌈 **多语言支持** - 支持 C++、Python、JavaScript、Java、Go、Rust、TypeScript、C 等 8 种编程语言
- 📚 **示例代码库** - 内置 8 个经典算法示例（快排、二分查找、动态规划等）
- 📱 **全平台响应式** - 完美支持桌面、平板和移动设备

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 组件**: Element Plus
- **代码编辑器**: Monaco Editor (VS Code 编辑器内核)
- **后端服务**: Cloudflare Workers
- **AI 模型**: OpenAI 兼容 API

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd kc-analyzer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并配置你的 API 地址：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_URL=https://your-worker.your-account.workers.dev
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 即可使用。

### 5. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 🎯 使用指南

### 基础使用

1. **选择语言** - 在编辑器右上角选择你的代码语言
2. **输入代码** - 在左侧编辑器中输入或粘贴算法代码
3. **选择示例**（可选）- 使用示例代码下拉菜单快速加载常见算法
4. **开始解析** - 点击"开始解析"按钮
5. **查看结果** - 在右侧查看复杂度分析、执行步骤和优化建议

### 内置示例算法

- 🔄 全排列（回溯算法）
- ⚡ 快速排序
- 📈 斐波那契数列（动态规划）
- 🔍 二分查找
- 🌲 二叉树遍历
- 📊 Dijkstra 最短路径
- 🎯 两数之和（哈希表）
- 💾 LRU 缓存

## 🏗️ 项目结构

```
kc-analyzer/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── CodeEditor.vue   # 代码编辑器（含语言选择和示例）
│   │   ├── ResultPanel.vue  # 结果展示面板
│   │   ├── ComplexityMetric.vue  # 复杂度指标卡片
│   │   └── StepTimeline.vue # 执行步骤时间线
│   ├── utils/
│   │   └── codeExamples.js  # 示例代码数据
│   ├── App.vue              # 主应用组件
│   └── main.js              # 应用入口
├── public/                  # 静态资源
├── .env.example             # 环境变量示例
├── .env                     # 环境变量配置（不提交到 Git）
├── vite.config.js           # Vite 配置
└── package.json             # 项目依赖
```

## 🔧 后端部署（Cloudflare Workers）

项目根目录的 `worker.js` 是后端 API 代码，需要部署到 Cloudflare Workers。

### 部署步骤

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 创建 Workers
2. 复制 `worker.js` 的内容到 Workers 编辑器
3. 配置环境变量：
   - `API_BASE_URL`: 你的 AI API 地址
   - `API_KEY`: AI API 密钥
   - `MODEL_NAME`: 使用的模型名称
4. 部署并获取 Workers URL
5. 将 Workers URL 配置到前端的 `.env` 文件中

## 📱 移动端适配

项目已针对不同设备尺寸优化：

- **桌面端** (>992px): 完整功能和最佳体验
- **平板** (768px-992px): 自适应布局
- **手机** (480px-768px): 简化 UI，纵向布局
- **小屏手机** (<480px): 极致压缩，保证可用性

## 🎨 自定义配置

### 修改 API 超时时间

编辑 `src/App.vue`，在 `fetch` 请求中添加超时控制：

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

await fetch(API_URL, {
  signal: controller.signal,
  // ...其他配置
});
```

### 添加新的示例代码

编辑 `src/utils/codeExamples.js`：

```javascript
{
  id: "your-example",
  name: "示例名称",
  language: "python",
  category: "算法分类",
  code: `你的代码`,
}
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 强大的代码编辑器
- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/GCHkongcheng/kc-analyzer/issues)
- 邮箱: your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
