## Context

当前市场上缺乏一款兼具苹果美学与 GitHub 同步能力的桌面待办应用。用户需要在多设备间同步数据，同时要求 UI 精致、动画流畅。

技术选型：Electron 28+ 提供成熟的桌面能力，React 18 + TypeScript 确保类型安全，Framer Motion 驱动流畅动画，electron-store + GitHub API 实现数据持久化。

## Goals / Non-Goals

**Goals:**
- 构建 macOS 风格毛玻璃 UI（高斯模糊、半透明层）
- 实现 60fps+ 丝滑动画（Framer Motion）
- GitHub Gist/仓库 JSON 同步，支持 AES-256-GCM 加密
- 全局快捷键快速添加待办
- 多清单分类（任务、书单、影单等）
- 系统级深色/浅色模式切换

**Non-Goals:**
- 不做服务器端（纯客户端通过 GitHub API 同步）
- 不做移动端（桌面专属）
- 不做复杂团队协作（单人数据同步）

## Decisions

### 1. 毛玻璃 UI 方案
**选择**: Tailwind CSS + backdrop-blur + 自定义 CSS 变量
**理由**: Tailwind 的 backdrop-blur 配合 CSS 变量实现主题切换，无需引入重型 UI 库。
**替代方案**: 使用 @radix-ui/shadcn（太组件化，定制毛玻璃需大量覆盖）

### 2. 动画方案
**选择**: Framer Motion
**理由**: React 生态最成熟，支持手势、布局动画、承诺 60fps。
**替代方案**: CSS animations（难以处理复杂交互）、React Spring（API 较复杂）

### 3. 数据同步方案
**选择**: GitHub Gist API（公开 + 加密）
**理由**: Gist 提供免费 JSON 托管，AES-256-GCM 本地加密后存储，解决公开仓库安全隐患。
**替代方案**: GitHub repo raw content（需要 PAT，权限过大）

### 4. 状态管理
**选择**: Zustand（轻量、TypeScript 友好）
**理由**: 相比 Redux，BoM 更小，API 简洁。
**替代方案**: Jotai（原子化，过于分散）、Redux Toolkit（过于复杂）

### 5. 加密方案
**选择**: Web Crypto API (AES-256-GCM)
**理由**: 原生 API，无需引入 crypto 库，用户提供密钥，本地加解密。
**替代方案**: Node.js crypto（Electron 主进程可用，但 IPC 复杂度高）

### 6. 全局快捷键
**选择**: electron globalShortcut
**理由**: Electron 官方方案，系统级注册，支持全局触发。
**替代方案**: 第三方库（如 hotkeys-js）仅支持窗口内

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| GitHub API 限流 | 本地缓存 + 增量更新 + 请求间隔控制 |
| 加密密钥丢失 | 引导用户备份密钥，提供密钥恢复说明 |
| 多设备冲突 | 时间戳 + Last-Write-Wins + 冲突提示 |
| 快捷键冲突 | 允许自定义快捷键，检测系统级冲突 |

## Open Questions

1. 是否需要实现「回收站」功能（软删除）？
   要
2. 是否需要「标签」颜色自定义？
   要
3. 加密密钥存储方式：Keychain (macOS) / DPAPI (Windows) 还是纯本地文件？
   就一个八位的字母加数字混合，可以作为密钥
4. 是否需要实现「快捷指令」（类似 iOS Shortcuts）？
   不用
