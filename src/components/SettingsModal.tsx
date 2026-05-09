import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { syncToGist, syncFromGist, initOctokit } from '../utils/github'

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
    if (isRecording === field) {
      setIsRecording(null)
    } else {
      setIsRecording(field)
    }
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

  const handleSyncToCloud = async () => {
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
    const { todos, todoLists, tags } = useStore.getState()
    const result = await syncToGist(gistId, encryptionKey, {
      todos,
      lists: todoLists,
      tags,
      updatedAt: Date.now()
    })

    if (result.success) {
      setSyncStatus('idle')
      setSyncMessage('同步成功 ✓')
    } else {
      setSyncStatus('error')
      setSyncMessage('同步失败: ' + (result.error || '未知错误'))
    }
    setTimeout(() => setSyncMessage(''), 3000)
  }

  const handleSyncFromCloud = async () => {
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
    const result = await syncFromGist(gistId, encryptionKey)

    if (result.success && result.data) {
      // Apply the synced data - replace local data with cloud data
      if (result.data.todos) {
        useStore.getState().setTodos(result.data.todos)
      }
      if (result.data.lists) {
        useStore.getState().setTodoLists(result.data.lists)
      }
      if (result.data.tags) {
        useStore.getState().setTags(result.data.tags)
      }
      setSyncStatus('idle')
      setSyncMessage('同步成功 ✓')
    } else if (result.success && !result.data) {
      setSyncStatus('idle')
      setSyncMessage('云端暂无数据')
    } else {
      setSyncStatus('error')
      setSyncMessage('同步失败: ' + (result.error || '未知错误'))
    }
    setTimeout(() => setSyncMessage(''), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-[460px] max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--divider)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="shrink-0 p-7 pb-4">
          <motion.h2
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            设置
          </motion.h2>
        </div>

        <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-6">
          {/* Theme */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">外观</h3>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t, i) => (
                <motion.button
                  key={t}
                  onClick={() => setTheme(t)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: theme === t ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: theme === t ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {t === 'light' ? '☀️ 浅色' : t === 'dark' ? '🌙 深色' : '💻 系统'}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">快捷键</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>快速添加</span>
                <button
                  onClick={() => handleKeyRecording('quickAdd')}
                  onKeyDown={handleKeyDown}
                  className="px-4 py-2 rounded-lg text-xs font-mono transition-all"
                  style={{
                    background: isRecording === 'quickAdd' ? 'var(--accent-soft)' : 'var(--bg-secondary)',
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
                    background: isRecording === 'showHide' ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                    color: isRecording === 'showHide' ? 'var(--accent)' : 'var(--text-primary)',
                    border: isRecording === 'showHide' ? '1px solid var(--accent)' : '1px solid transparent'
                  }}
                >
                  {isRecording === 'showHide' ? '按下组合键...' : showHideShortcut}
                </button>
              </div>
            </div>
          </motion.div>

          {/* GitHub Sync */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">数据同步</h3>
            <div className="space-y-3">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="GitHub Token (ghp_xxx)"
                className="input-field w-full text-sm"
              />
              <input
                type="text"
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
                placeholder="Gist ID 或 URL"
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
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveGist}
                  className="btn-secondary flex-1"
                >
                  保存设置
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSyncToCloud}
                  disabled={syncStatus === 'syncing' || !gistId || !encryptionKey || !githubToken}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {syncStatus === 'syncing' ? '同步中...' : '上传到云端'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSyncFromCloud}
                  disabled={syncStatus === 'syncing' || !gistId || !encryptionKey || !githubToken}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  {syncStatus === 'syncing' ? '同步中...' : '从云端下载'}
                </motion.button>
              </div>
              {syncMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs text-center ${syncMessage.includes('成功') ? 'text-green-500' : syncMessage.includes('失败') ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {syncMessage}
                </motion.p>
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
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>定时上传数据到云端</p>
                </div>
                <motion.button
                  onClick={() => {
                    const newValue = !autoSync
                    setAutoSync(newValue)
                    window.electronAPI.setStore('autoSync', newValue)
                    window.electronAPI.setStore('syncInterval', syncInterval)
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{
                    background: autoSync ? 'var(--accent)' : 'var(--text-tertiary)',
                  }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{
                      left: autoSync ? '24px' : '4px',
                      transition: 'left 200ms'
                    }}
                  />
                </motion.button>
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
                    className="input-field text-sm py-1.5 px-3"
                    style={{ width: 'auto' }}
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
          </motion.div>
        </div>

        <div className="shrink-0 p-7 pt-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)'
            }}
          >
            完成
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}