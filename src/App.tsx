import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './store'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import TodoList from './components/TodoList'
import QuickAddPanel from './components/QuickAddPanel'
import SettingsModal from './components/SettingsModal'
import TrashList from './components/TrashList'

export default function App() {
  const { theme, setTheme, quickAddOpen, setQuickAddOpen, setLastSyncTime, setSyncStatus } = useStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initTheme = async () => {
      const systemTheme = await window.electronAPI.getTheme()
      const savedTheme = await window.electronAPI.getStore('theme') as 'light' | 'dark' | 'system' | undefined
      setTheme(savedTheme || systemTheme)
      setReady(true)
    }
    initTheme()

    window.electronAPI.onThemeChanged((newTheme) => {
      const savedTheme = useStore.getState().theme
      if (savedTheme === 'system') {
        setTheme(newTheme as 'light' | 'dark')
      }
    })

    window.electronAPI.onOpenQuickAdd(() => {
      setQuickAddOpen(true)
    })

    window.electronAPI.onAutoSyncTrigger(async () => {
      const { todos, todoLists, tags } = useStore.getState()
      if (!todos.length && !todoLists.length) return

      setSyncStatus('syncing')
      const { syncToGist, initOctokit } = await import('./utils/github')
      const token = await window.electronAPI.getStore('githubToken') as string
      const gistId = await window.electronAPI.getStore('gistId') as string
      const key = await window.electronAPI.getStore('encryptionKey') as string
      if (!token || !gistId || !key) return

      initOctokit(token)
      const result = await syncToGist(gistId, key, { todos, lists: todoLists, tags, updatedAt: Date.now() })
      if (result.success) {
        setLastSyncTime(Date.now())
        setSyncStatus('idle')
      } else {
        setSyncStatus('error')
      }
    })
  }, [setTheme, setQuickAddOpen, setLastSyncTime, setSyncStatus])

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('light', !isDark)
  }, [theme])

  if (!ready) {
    return (
      <div className="h-screen w-screen overflow-hidden relative" style={{ background: 'var(--bg-primary)' }} />
    )
  }

  const activeListId = useStore.getState().activeListId

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: 'var(--bg-primary)' }}>
      <div className="grid-pattern" />

      <div className="h-full w-full flex flex-col relative z-10">
        <TitleBar onSettingsClick={() => setSettingsOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 overflow-hidden">
            {activeListId === '__trash__' ? (
              <TrashList key="trash" />
            ) : (
              <TodoList key={activeListId} />
            )}
          </main>
        </div>

        <AnimatePresence>
          {quickAddOpen && <QuickAddPanel onClose={() => setQuickAddOpen(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
