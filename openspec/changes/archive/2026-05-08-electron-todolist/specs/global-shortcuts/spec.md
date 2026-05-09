## ADDED Requirements

### Requirement: 全局快捷键注册

系统 SHALL 使用 electron globalShortcut 注册系统级快捷键：
- 应用未运行时也能触发
- 支持 modifier 键（Ctrl/Cmd, Alt, Shift）
- 快捷键全局唯一

### Requirement: 快捷键自定义

系统 SHALL 提供快捷键自定义界面：
- 显示当前快捷键
- 点击后可录制新快捷键
- 快捷键冲突检测
- 重置为默认按钮

### Requirement: 快速添加面板

系统 SHALL 实现全局快捷键触发的快速添加面板：
- 弹出透明毛玻璃浮层
- 自动聚焦输入框
- 支持快速选择清单分类
- Enter 提交，Esc 关闭

### Requirement: 默认快捷键

系统 SHALL 提供默认快捷键：
- 快速添加：Ctrl/Cmd + Shift + T
- 显示/隐藏应用：Ctrl/Cmd + Shift + H
