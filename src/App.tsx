import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useStore } from './store'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import TodoList from './components/TodoList'
import QuickAddPanel from './components/QuickAddPanel'
import SettingsModal from './components/SettingsModal'
import TrashList from './components/TrashList'
import FocusModal from './components/FocusModal'
import LoadingScreen from './components/LoadingScreen'
import { fetchWeather } from './utils/weather'
import { setFocusDuration, setBreakDuration } from './utils/pomodoro'

export default function App() {
  const { theme, setTheme, quickAddOpen, setQuickAddOpen, setLastSyncTime, setSyncStatus, weather, setWeather, setTodos, setTodoLists, setTags } = useStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const initApp = async () => {
      // 1. 先加载本地持久化数据
      const savedTodos = await window.electronAPI.getStore('todos') as any[]
      const savedLists = await window.electronAPI.getStore('todoLists') as any[]
      const savedTags = await window.electronAPI.getStore('tags') as any[]
      if (savedTodos) setTodos(savedTodos)
      if (savedLists) setTodoLists(savedLists)
      if (savedTags) setTags(savedTags)

      const systemTheme = await window.electronAPI.getTheme()
      const savedTheme = await window.electronAPI.getStore('theme') as 'light' | 'dark' | 'system' | undefined
      setTheme(savedTheme || systemTheme)

      const weatherData = await fetchWeather()
      setWeather(weatherData)

      // 定时刷新天气（每1小时），失败则每10s重试，最多3次
      const weatherInterval = setInterval(async () => {
        let attempts = 0
        const maxAttempts = 3
        const retryDelay = 10000 // 10秒

        const tryFetchWeather = async (): Promise<void> => {
          const data = await fetchWeather()
          if (data) {
            setWeather(data)
          } else if (attempts < maxAttempts) {
            attempts++
            setTimeout(tryFetchWeather, retryDelay)
          }
        }
        tryFetchWeather()
      }, 60 * 60 * 1000)

      const savedFocusMinutes = await window.electronAPI.getStore('focusMinutes') as number
      const savedBreakMinutes = await window.electronAPI.getStore('breakMinutes') as number
      if (savedFocusMinutes) setFocusDuration(savedFocusMinutes)
      if (savedBreakMinutes) setBreakDuration(savedBreakMinutes)

      // 显示加载动画至少1秒，让用户看到品牌
      setTimeout(() => {
        setShowLoader(false)
      }, 1200)

      return () => clearInterval(weatherInterval)
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

    window.electronAPI.onInitialSync(async () => {
      const token = await window.electronAPI.getStore('githubToken') as string
      const gistId = await window.electronAPI.getStore('gistId') as string
      const key = await window.electronAPI.getStore('encryptionKey') as string
      if (!token || !gistId || !key) return

      setSyncStatus('syncing')
      const { syncFromGist, mergeSyncData, initOctokit, syncToGist } = await import('./utils/github')
      initOctokit(token)

      const remote = await syncFromGist(gistId, key)
      if (!remote.success) {
        setSyncStatus('error')
        return
      }

      const { todos, todoLists, tags, tombstones, setTodos, setTodoLists, setTags } = useStore.getState()
      const local = { todos, lists: todoLists, tags, updatedAt: Date.now() }
      const merged = mergeSyncData(local, remote.data || local, tombstones)

      // Apply merged data to local store
      if (merged.todos) setTodos(merged.todos)
      if (merged.lists) setTodoLists(merged.lists)
      if (merged.tags) setTags(merged.tags)

      const result = await syncToGist(gistId, key, merged)

      if (result.success) {
        setLastSyncTime(Date.now())
        setSyncStatus('idle')
      } else {
        setSyncStatus('error')
      }
    })
  }, [setTheme, setQuickAddOpen, setLastSyncTime, setSyncStatus, setWeather, setTodos, setTodoLists, setTags])

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('light', !isDark)
  }, [theme])

  if (showLoader) {
    return <LoadingScreen />
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
