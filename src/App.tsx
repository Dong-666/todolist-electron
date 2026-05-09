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

  const handleSyncToCloud = async () => {
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
  }

  useEffect(() => {
    const initTheme = async () => {
      const systemTheme = await window.electronAPI.getTheme()
      const savedTheme = await window.electronAPI.getStore('theme') as 'light' | 'dark' | 'system' | undefined
      setTheme(savedTheme || systemTheme)
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

    window.electronAPI.onAutoSyncTrigger(() => {
      handleSyncToCloud()
    })
  }, [setTheme, setQuickAddOpen])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="h-screen w-screen overflow-hidden theme-transition relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Subtle noise texture overlay */}
      <div className="noise-overlay" />

      <div className="h-full w-full flex flex-col rounded-2xl overflow-hidden relative" style={{ border: '1px solid var(--divider)' }}>
        <TitleBar onSettingsClick={() => setSettingsOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 overflow-hidden" style={{ pointerEvents: 'auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={useStore.getState().activeListId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {useStore.getState().activeListId === '__trash__' ? (
                  <TrashList />
                ) : (
                  <TodoList />
                )}
              </motion.div>
            </AnimatePresence>
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
