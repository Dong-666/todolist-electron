## ADDED Requirements

### Requirement: 系统主题监听

系统 SHALL 监听操作系统主题变化：
- 使用 prefers-color-scheme 媒体查询
- 使用 electron nativeTheme API
- 主题变化时自动切换

### Requirement: 手动主题切换

系统 SHALL 提供手动切换选项：
- 浅色模式
- 深色模式
- 跟随系统（默认）

### Requirement: 主题切换动画

系统 SHALL 实现主题切换的平滑过渡：
- 300ms 过渡动画
- 所有颜色属性渐变
- 避免闪烁

### Requirement: 主题持久化

系统 SHALL 持久化主题偏好：
- 存储在 electron-store
- 启动时恢复用户偏好
