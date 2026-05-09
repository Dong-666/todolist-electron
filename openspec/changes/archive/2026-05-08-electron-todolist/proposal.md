## Why

需要一个优雅、跨平台的桌面待办应用，融合苹果毛玻璃美学与流畅动画，同时通过 GitHub JSON 文件实现无缝同步，让用户在任意设备上都能访问自己的待办数据。

## What Changes

- **新应用**: Electron + React + TypeScript 桌面待办应用
- **UI 风格**: 苹果毛玻璃（Glassmorphism）风格，高斯模糊、透明度层次、光晕效果
- **动画**: 基于 Framer Motion 的丝滑过渡动画（60fps+）
- **数据同步**: GitHub Gist/仓库 JSON 文件同步，支持 AES-256-GCM 本地加密
- **全局快捷键**: 自定义快捷键快速调起应用并添加待办
- **多清单支持**: 任务清单、阅读书单、观影单等自定义分类
- **深色模式**: 系统级深色/浅色模式自动切换
- **额外创意**: 快捷指令面板、待办优先级/标签系统、数据导出

## Capabilities

### New Capabilities

- `glassmorphic-ui`: 毛玻璃界面组件库——背景模糊层、玻璃卡片、窗口控件
- `animation-system`: 基于 Framer Motion 的统一动画系统——页面过渡、列表项动画、微交互
- `github-sync`: GitHub Gist/仓库 JSON 同步模块——加密存储、拉取/推送冲突处理
- `global-shortcuts`: 全局快捷键系统——系统级注册、自定义按键绑定、快速添加面板
- `multi-list`: 多清单系统——清单创建、分类、筛选、视图切换
- `dark-mode`: 深色/浅色模式——系统监听、主题切换、过渡动画
- `quick-add`: 快捷添加——全局呼出、语音输入（可选）、快速分类
- `priority-tags`: 优先级与标签——颜色标记、筛选、排序

### Modified Capabilities

（暂无现有规格变更）

## Impact

- **前端**: React 18 + TypeScript + Framer Motion + Tailwind CSS
- **桌面**: Electron 28+（Chromium 120+）
- **存储**: electron-store（本地加密）+ GitHub API
- **加密**: Web Crypto API（AES-256-GCM）
- **快捷键**: electron globalShortcut
