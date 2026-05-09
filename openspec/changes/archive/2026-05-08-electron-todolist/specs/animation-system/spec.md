## ADDED Requirements

### Requirement: 页面过渡动画

系统 SHALL 实现页面间过渡动画：
- 淡入淡出 + 轻微位移（opacity 0→1, translateY 10px→0）
- 持续时间：250ms
- 缓动函数：ease-out

### Requirement: 列表项动画

系统 SHALL 为待办列表项实现动画：
- 新增项：从上方滑入 + 淡入（AnimatePresence + motion.div）
- 删除项：向左滑出 + 淡出
- 完成项：划线动画 + 透明度降低
- 列表重排：布局动画（layout animation）

### Requirement: 微交互反馈

系统 SHALL 实现按钮/卡片的微交互：
- hover：轻微放大 scale(1.02) + 阴影增强
- 点击：轻微缩小 scale(0.98)
- 持续时间：150ms
- 缓动函数：spring (stiffness: 400, damping: 25)

### Requirement: 主题切换动画

系统 SHALL 实现深色/浅色模式切换的平滑过渡：
- 所有颜色属性 300ms 过渡
- 背景/文字颜色渐变切换

### Requirement: 性能保证

系统 SHALL 保证动画性能：
- 使用 `will-change` 优化
- 优先使用 transform/opacity
- 避免触发布局的重排属性动画
- 目标帧率：60fps
