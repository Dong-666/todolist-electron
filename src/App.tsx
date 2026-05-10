import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './store'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import TodoList from './components/TodoList'
import QuickAddPanel from './components/QuickAddPanel'
import SettingsModal from './components/SettingsModal'
import TrashList from './components/TrashList'
import FocusModal from './components/FocusModal'
import { fetchWeather } from './utils/weather'

export default function App() {
  const { theme, setTheme, quickAddOpen, setQuickAddOpen, setLastSyncTime, setSyncStatus, weather, setWeather } = useStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initApp = async () => {
      const systemTheme = await window.electronAPI.getTheme()
      const savedTheme = await window.electronAPI.getStore('theme') as 'light' | 'dark' | 'system' | undefined
      setTheme(savedTheme || systemTheme)

      const weatherData = await fetchWeather()
      setWeather(weatherData)

      setReady(true)
    }
    initApp()

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
      const { todos, todoLists, tags, tombstones } = useStore.getState()
      if (!todos.length && !todoLists.length) return

      setSyncStatus('syncing')
      const { syncToGist, syncFromGist, mergeSyncData, initOctokit } = await import('./utils/github')
      const token = await window.electronAPI.getStore('githubToken') as string
      const gistId = await window.electronAPI.getStore('gistId') as string
      const key = await window.electronAPI.getStore('encryptionKey') as string
      if (!token || !gistId || !key) return

      initOctokit(token)
      const local = { todos, lists: todoLists, tags, updatedAt: Date.now() }

      const remote = await syncFromGist(gistId, key)
      if (!remote.success) {
        setSyncStatus('error')
        return
      }

      const merged = mergeSyncData(local, remote.data || local, tombstones)
      const result = await syncToGist(gistId, key, merged)

      if (result.success) {
        setLastSyncTime(Date.now())
        setSyncStatus('idle')
      } else {
        setSyncStatus('error')
      }
    })
  }, [setTheme, setQuickAddOpen, setLastSyncTime, setSyncStatus, setWeather])

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
        <TitleBar onSettingsClick={() => setSettingsOpen(true)} theme={theme} weather={weather} />

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

        <AnimatePresence>
          {useStore.getState().focusMode && <FocusModal />}
        </AnimatePresence>
      </div>
    </div>
  )
}
