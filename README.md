# TodoList

一个简洁美观的待办事项管理桌面应用，支持 GitHub Gist 云端同步。

![效果预览](public/screenshot.png)

## 功能特性

- **任务管理**：创建、编辑、删除、完成任务
- **清单分类**：任务、书单、观影单等多种清单类型
- **标签系统**：为待办事项添加标签分类
- **回收站**：误删内容可从此恢复
- **云端同步**：加密同步数据到 GitHub Gist
- **自动同步**：定时自动上传数据
- **全局快捷键**：快速添加任务、显示/隐藏窗口
- **深色模式**：支持浅色、深色、系统主题
- **系统托盘**：最小化到托盘，后台运行

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+T` | 快速添加待办 |
| `Ctrl+Shift+H` | 显示/隐藏窗口 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建打包

```bash
# 构建 Windows 版本
npm run build:win

# 构建所有平台
npm run build
```

打包后的文件在 `release` 目录下。

## 云端同步设置

1. 打开应用设置
2. 在"数据同步"中填写：
   - **GitHub Token**：在 GitHub Settings → Developer settings → Personal access tokens 生成，勾选 `gist` 权限
   - **Gist ID**：创建 GitHub Gist 后，URL 中 `/<gist-id>` 部分
   - **加密密钥**：8位字符，用于加密本地数据
3. 点击"上传到云端"测试同步
4. 可开启"自动同步"，选择同步间隔（15分钟/30分钟/1小时/2小时/6小时）

## 技术栈

- **框架**：Electron + React + TypeScript
- **构建**：Vite + electron-builder
- **状态管理**：Zustand
- **动画**：Framer Motion
- **样式**：Tailwind CSS
- **云同步**：GitHub Gist API (Octokit)
- **加密**：AES-256-GCM

## 项目结构

```
├── electron/           # Electron 主进程
│   ├── main.ts        # 主进程入口
│   └── preload.ts     # 预加载脚本
├── src/               # React 渲染进程
│   ├── components/    # React 组件
│   ├── store/         # Zustand 状态管理
│   ├── utils/         # 工具函数
│   ├── styles/        # 全局样式
│   └── App.tsx        # 应用入口
├── public/            # 静态资源
└── release/           # 打包输出目录
```

## 系统要求

- Windows 10 或更高版本（64位）
- 约 200MB 磁盘空间

## License

MIT
