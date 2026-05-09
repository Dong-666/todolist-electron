## ADDED Requirements

### Requirement: GitHub Gist 连接配置

系统 SHALL 提供 Gist 连接配置界面：
- 输入 Gist ID 或完整 URL
- 输入个人访问令牌（PAT）或加密密钥
- 测试连接按钮
- 连接状态显示

### Requirement: AES-256-GCM 加密

系统 SHALL 使用 AES-256-GCM 加密待办数据：
- 用户提供加密密钥（至少 8 字符）
- 使用 Web Crypto API 加密
- 加密后的数据存储在 Gist
- IV（初始向量）每次随机生成并附加到密文

### Requirement: 数据拉取与同步

系统 SHALL 实现数据同步流程：
- 启动时自动拉取 Gist 最新数据
- 手动刷新按钮
- 最后同步时间显示
- 冲突检测（基于时间戳）

### Requirement: 数据推送

系统 SHALL 实现数据推送：
- 每次数据变更后延迟 2 秒自动推送（防抖）
- 手动同步按钮
- 推送失败重试机制（最多 3 次）

### Requirement: 冲突处理

系统 SHALL 处理多设备冲突：
- Last-Write-Wins 策略（基于 updatedAt 时间戳）
- 冲突时显示通知
- 允许用户选择保留本地或远程

### Requirement: 离线支持

系统 SHALL 支持离线操作：
- 本地 electron-store 缓存
- 离线时正常操作
- 恢复网络后自动同步
