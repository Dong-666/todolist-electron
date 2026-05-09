import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { syncToGist, syncFromGist, mergeSyncData, initOctokit } from '../utils/github'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, setTheme, lastSyncTime, setSyncStatus, syncStatus } = useStore()
  const [quickAddShortcut, setQuickAddShortcut] = useState('')
  const [showHideShortcut, setShowHideShortcut] = useState('')
  const [isRecording, setIsRecording] = useState<string | null>(null)
  const [githubToken, setGithubToken] = useState('')
  const [gistId, setGistId] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')
  const [syncMessage, setSyncMessage] = useState('')
  const [autoSync, setAutoSync] = useState(false)
  const [syncInterval, setSyncInterval] = useState(30)

  useEffect(() => {
    const loadSettings = async () => {
      const savedQuickAdd = await window.electronAPI.getStore('quickAddShortcut') as string
      const savedShowHide = await window.electronAPI.getStore('showHideShortcut') as string
      const savedToken = await window.electronAPI.getStore('githubToken') as string
      const savedGistId = await window.electronAPI.getStore('gistId') as string
      const savedKey = await window.electronAPI.getStore('encryptionKey') as string
      const savedAutoSync = await window.electronAPI.getStore('autoSync') as boolean
      const savedSyncInterval = await window.electronAPI.getStore('syncInterval') as number
      setQuickAddShortcut(savedQuickAdd || 'CommandOrControl+Shift+T')
      setShowHideShortcut(savedShowHide || 'CommandOrControl+Shift+H')
      setGithubToken(savedToken || '')
      setGistId(savedGistId || '')
      setEncryptionKey(savedKey || '')
      setAutoSync(savedAutoSync || false)
      setSyncInterval(savedSyncInterval || 30)
      if (savedToken) initOctokit(savedToken)
    }
    loadSettings()
  }, [])

  const handleKeyRecording = (field: 'quickAdd' | 'showHide') => {
    setIsRecording(isRecording === field ? null : field)
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!isRecording) return
    e.preventDefault()

    const parts: string[] = []
    if (e.ctrlKey) parts.push('CommandOrControl')
    if (e.altKey) parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')

    if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      parts.push(e.key.toUpperCase())
      const shortcut = parts.join('+')

      const { available } = await window.electronAPI.checkShortcut(shortcut)
      if (!available) {
        alert('该快捷键已被其他程序占用，请选择其他组合键')
        setIsRecording(null)
        return
      }

      if (isRecording === 'quickAdd') {
        const result = await window.electronAPI.registerShortcut('quickAdd', shortcut)
        if (result.success) setQuickAddShortcut(shortcut)
        else alert(result.error || '注册快捷键失败')
      } else {
        const result = await window.electronAPI.registerShortcut('showHide', shortcut)
        if (result.success) setShowHideShortcut(shortcut)
        else alert(result.error || '注册快捷键失败')
      }
      setIsRecording(null)
    }
  }

  const handleSaveGist = () => {
    if (githubToken) {
      initOctokit(githubToken)
      window.electronAPI.setStore('githubToken', githubToken)
    }
    window.electronAPI.setStore('gistId', gistId)
    window.electronAPI.setStore('encryptionKey', encryptionKey)
    setSyncMessage('设置已保存')
    setTimeout(() => setSyncMessage(''), 2000)
  }

  const handleSync = async () => {
    if (!githubToken) {
      setSyncMessage('请先填写 GitHub Token')
      return
    }
    if (!gistId || !encryptionKey) {
      setSyncMessage('请先填写 Gist ID 和加密密钥')
      return
    }
    setSyncStatus('syncing')
    setSyncMessage('同步中...')

    initOctokit(githubToken)

    const { todos, todoLists, tags, tombstones } = useStore.getState()
    const local = { todos, lists: todoLists, tags, updatedAt: Date.now() }

    // 1. 拉取云端数据
    const remote = await syncFromGist(gistId, encryptionKey)

    if (!remote.success) {
      setSyncStatus('error')
      setSyncMessage('同步失败: ' + (remote.error || '未知错误'))
      setTimeout(() => setSyncMessage(''), 3000)
      return
    }

    // 2. 合并数据
    const merged = mergeSyncData(local, remote.data || local, tombstones)

    // 3. 推送合并结果
    const result = await syncToGist(gistId, encryptionKey, merged)

    if (result.success) {
      // 4. 更新本地
      if (merged.todos) useStore.getState().setTodos(merged.todos)
      if (merged.lists) useStore.getState().setTodoLists(merged.lists)
      if (merged.tags) useStore.getState().setTags(merged.tags)
      setSyncStatus('idle')
      setSyncMessage('同步成功 ✓')
    } else {
      setSyncStatus('error')
      setSyncMessage('同步失败: ' + (result.error || '未知错误'))
    }
    setTimeout(() => setSyncMessage(''), 3000)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="w-[460px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="shrink-0 p-6 pb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            设置
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-5 space-y-6">
          {/* Theme */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
              外观
            </h3>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: theme === t ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: theme === t ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {t === 'light' ? '☀️ 浅色' : t === 'dark' ? '🌙 深色' : '💻 系统'}
                </button>
              ))}
            </div>
          </div>

          {/* Shortcuts */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
              快捷键
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>快速添加</span>
                <button
                  onClick={() => handleKeyRecording('quickAdd')}
                  onKeyDown={handleKeyDown}
                  className="px-4 py-2 rounded-lg text-xs font-mono transition-all"
                  style={{
                    background: isRecording === 'quickAdd' ? 'var(--accent-soft)' : 'var(--bg-card)',
                    color: isRecording === 'quickAdd' ? 'var(--accent)' : 'var(--text-primary)',
                    border: isRecording === 'quickAdd' ? '1px solid var(--accent)' : '1px solid transparent'
                  }}
                >
                  {isRecording === 'quickAdd' ? '按下组合键...' : quickAddShortcut}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>显示/隐藏</span>
                <button
                  onClick={() => handleKeyRecording('showHide')}
                  onKeyDown={handleKeyDown}
                  className="px-4 py-2 rounded-lg text-xs font-mono transition-all"
                  style={{
                    background: isRecording === 'showHide' ? 'var(--accent-soft)' : 'var(--bg-card)',
                    color: isRecording === 'showHide' ? 'var(--accent)' : 'var(--text-primary)',
                    border: isRecording === 'showHide' ? '1px solid var(--accent)' : '1px solid transparent'
                  }}
                >
                  {isRecording === 'showHide' ? '按下组合键...' : showHideShortcut}
                </button>
              </div>
            </div>
          </div>

          {/* GitHub Sync */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
              数据同步
            </h3>
            <div className="space-y-3">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="GitHub Token"
                className="input-field w-full text-sm"
              />
              <input
                type="text"
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
                placeholder="Gist ID"
                className="input-field w-full text-sm"
              />
              <input
                type="password"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder="8位加密密钥"
                maxLength={8}
                className="input-field w-full text-sm"
              />

              <button
                onClick={handleSync}
                disabled={syncStatus === 'syncing' || !gistId || !encryptionKey || !githubToken}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncStatus === 'syncing' ? '同步中...' : '同步'}
              </button>

              <button onClick={handleSaveGist} className="btn-ghost w-full">
                保存设置
              </button>

              {syncMessage && (
                <p
                  className="text-xs text-center"
                  style={{
                    color: syncMessage.includes('成功') ? 'var(--accent)' : syncMessage.includes('失败') ? 'var(--priority-high)' : 'var(--text-tertiary)'
                  }}
                >
                  {syncMessage}
                </p>
              )}
              {lastSyncTime && (
                <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                  上次同步: {new Date(lastSyncTime).toLocaleString('zh-CN')}
                </p>
              )}
              {/* Auto sync toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>自动同步</span>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>定时同步云端数据</p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !autoSync
                    setAutoSync(newValue)
                    window.electronAPI.setStore('autoSync', newValue)
                    window.electronAPI.setStore('syncInterval', syncInterval)
                  }}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{
                    background: autoSync ? 'var(--accent)' : 'var(--text-tertiary)'
                  }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    style={{
                      left: autoSync ? '24px' : '4px',
                      transition: 'left 200ms ease'
                    }}
                  />
                </button>
              </div>
              {/* Sync interval selector */}
              {autoSync && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>同步间隔:</span>
                  <select
                    value={syncInterval}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setSyncInterval(val)
                      window.electronAPI.setStore('syncInterval', val)
                    }}
                    className="text-sm py-1.5 px-3 pr-8"
                    style={{ width: 'auto', minWidth: '100px' }}
                  >
                    <option value="15">15 分钟</option>
                    <option value="30">30 分钟</option>
                    <option value="60">1 小时</option>
                    <option value="120">2 小时</option>
                    <option value="360">6 小时</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-6 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)'
            }}
          >
            完成
          </button>
        </div>
      </motion.div>
    </div>
  )
}
