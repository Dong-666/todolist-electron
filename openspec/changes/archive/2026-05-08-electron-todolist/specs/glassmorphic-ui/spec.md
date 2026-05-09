## ADDED Requirements

### Requirement: 毛玻璃背景层

系统 SHALL 实现毛玻璃背景层，使用 `backdrop-filter: blur(20px) saturate(180%)` 创造玻璃质感。

### Requirement: 玻璃卡片组件

系统 SHALL 提供 GlassCard 组件，支持：
- 白色/深色半透明背景（opacity 0.7-0.85）
- 圆角边框（border-radius: 16px）
- 微妙边框高光（1px rgba(255,255,255,0.2)）
- 阴影层次（box-shadow 多层叠加）

### Requirement: 窗口控件样式

系统 SHALL 为窗口关闭/最小化/最大化按钮实现 macOS 风格：
- 关闭按钮：红色 (#FF5F57)
- 最小化按钮：黄色 (#FEBC2E)
- 最大化按钮：绿色 (#28C840)
- hover 状态显示内部图标

### Requirement: 深色模式适配

系统 SHALL 支持深色模式切换：
- 背景层在深色模式下使用深灰/黑色半透明
- 文字颜色自动反转
- 边框高光颜色相应调整
- 切换时 300ms 过渡动画

### Requirement: 主题变量系统

系统 SHALL 提供 CSS 变量系统：
```css
--glass-bg-light: rgba(255, 255, 255, 0.72);
--glass-bg-dark: rgba(30, 30, 30, 0.75);
--glass-border-light: rgba(255, 255, 255, 0.3);
--glass-border-dark: rgba(255, 255, 255, 0.1);
```
