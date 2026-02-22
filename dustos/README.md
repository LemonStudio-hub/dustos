# dustOS - Web Desktop Operating System

![dustOS](https://img.shields.io/badge/dustOS-v0.0.0-blue)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF)
![License](https://img.shields.io/badge/License-MIT-green)

dustOS 是一个基于 Web 技术构建的虚拟桌面操作系统，完全使用 Vue 3 + TypeScript + Vite 开发。它提供了一个类似于现代桌面操作系统的用户体验，包括窗口管理、任务栏、开始菜单、文件系统、系统设置等完整功能。

## 🌟 主要特性

### 桌面环境
- **窗口管理系统**：支持窗口的拖拽、调整大小、最小化、最大化、关闭、置顶、透明度调节
- **多窗口支持**：可同时打开多个应用窗口，支持窗口切换和排列
- **窗口快照**：可以保存和恢复窗口布局状态
- **应用分组**：支持将桌面图标进行分组管理
- **屏幕锁定**：支持系统锁定功能

### 系统功能
- **虚拟文件系统**：完整的文件管理功能，支持创建、删除、重命名文件和文件夹
- **全局搜索**：支持文件名搜索、高级搜索（按类型、大小、日期过滤）、搜索历史记录
- **剪贴板历史**：记录剪贴板历史记录
- **快捷键管理**：自定义系统快捷键
- **系统通知**：支持系统通知功能
- **音效系统**：可配置的系统音效，支持音量渐变

### 主题与个性化
- **深色/浅色模式**：支持系统主题切换，带有平滑过渡动画
- **多壁纸支持**：内置多套壁纸，支持主题相关壁纸切换
- **音量控制**：支持音量调节和音效开关

### 预装应用

#### 📁 文件管理
- **文件管理器**：浏览和管理虚拟文件系统
- **图片查看器**：查看图片文件
- **日志查看器**：查看系统日志

#### 🛠️ 系统工具
- **设置**：系统设置中心
- **任务管理器**：查看和管理运行中的应用
- **系统信息**：查看系统详细信息
- **终端**：命令行终端模拟器

#### 📝 生产力工具
- **记事本**：文本编辑器
- **代码编辑器**：代码编辑器
- **计算器**：基本计算器
- **任务列表**：待办事项管理
- **日历**：日历应用
- **时钟**：时钟应用

#### 🎮 娱乐应用
- **音乐播放器**：音乐播放器
- **视频播放器**：视频播放器
- **录音机**：语音录制
- **扫雷**：经典扫雷游戏
- **贪吃蛇**：经典贪吃蛇游戏

#### 🌐 网络应用
- **浏览器**：Web浏览器
- **天气**：天气信息
- **应用商店**：应用商店

## 🚀 技术栈

- **前端框架**：Vue 3.5.27
- **开发语言**：TypeScript 5.9.3
- **构建工具**：Vite 7.3.1
- **状态管理**：Pinia 3.0.4
- **路由管理**：Vue Router 5.0.1
- **代码规范**：ESLint + Prettier + Oxlint
- **测试框架**：Playwright 1.58.2
- **包管理器**：pnpm

## 📦 安装与运行

### 环境要求

- Node.js ^20.19.0 || >=22.12.0
- pnpm (推荐)

### 安装依赖

```bash
cd dustos
pnpm install
```

### 开发模式

```bash
pnpm run dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
pnpm run build
```

### 预览生产版本

```bash
pnpm run preview
```

### 代码检查与格式化

```bash
# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 类型检查
pnpm run type-check
```

## 📁 项目结构

```
dustos/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 组件
│   │   ├── apps/       # 应用组件
│   │   ├── icons/      # 图标组件
│   │   └── ...         # 其他通用组件
│   ├── constants/      # 常量定义
│   ├── hooks/          # Vue 组合式函数
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia 状态管理
│   │   ├── system.ts   # 系统状态
│   │   ├── desktop.ts  # 桌面状态
│   │   ├── filesystem.ts # 文件系统状态
│   │   ├── clipboard.ts # 剪贴板状态
│   │   └── counter.ts  # 计数器状态
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── public/             # 公共资源
├── index.html          # HTML 模板
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
├── eslint.config.ts    # ESLint 配置
├── .prettierrc.json    # Prettier 配置
└── package.json        # 项目配置
```

## 🏗️ 核心架构

### 状态管理

项目使用 Pinia 进行状态管理，主要 Store 包括：

- **system.ts**：系统级状态，包括时间、主题、音量、电池、WiFi、壁纸、通知等
- **desktop.ts**：桌面环境状态，包括窗口管理、桌面图标、开始菜单、屏幕锁定等
- **filesystem.ts**：虚拟文件系统状态，支持文件操作和搜索功能
- **clipboard.ts**：剪贴板历史记录状态

### 窗口管理

窗口系统支持以下功能：
- 窗口创建、关闭、最小化、最大化
- 窗口拖拽和调整大小
- 窗口聚焦和切换
- 窗口置顶和透明度调节
- 窗口分屏布局（左、右、上、下、四分屏）
- 窗口快照保存和恢复

### 文件系统

虚拟文件系统提供完整的文件操作功能：
- 文件和文件夹的创建、删除、重命名
- 目录导航
- 文件内容查看和编辑
- 基于索引的快速搜索
- 高级搜索（按类型、大小、日期过滤）
- 搜索历史记录

## 🎨 界面设计

- 响应式设计，支持桌面和移动设备
- Material Design 风格
- 平滑的过渡动画
- 深色/浅色主题切换
- 自适应窗口布局

## 🔧 配置说明

### Vite 配置

项目使用 Vite 进行构建，配置文件位于 `vite.config.ts`：

- Vue 插件支持
- JSX 支持
- Vue DevTools 集成
- 路径别名配置（`@` 指向 `src` 目录）

### TypeScript 配置

- `tsconfig.json`：基础 TypeScript 配置
- `tsconfig.app.json`：应用代码配置
- `tsconfig.node.json`：构建工具配置

### 代码规范

- **ESLint**：使用 ESLint 进行代码检查
- **Prettier**：使用 Prettier 进行代码格式化
- **Oxlint**：快速 Rust 编写的 Linter

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 规则
- 编写清晰的提交信息
- 添加必要的注释

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📮 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发起 Pull Request

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集

---

**dustOS** - 体验 Web 桌面操作系统的魅力！