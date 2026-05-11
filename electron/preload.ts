import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  onThemeChanged: (callback: (theme: string) => void) => {
    ipcRenderer.on('theme-changed', (_event, theme) => callback(theme))
  },
  onOpenQuickAdd: (callback: () => void) => {
    ipcRenderer.on('open-quick-add', () => callback())
  },
  onAutoSyncTrigger: (callback: () => void) => {
    ipcRenderer.on('auto-sync-trigger', () => callback())
  },
  onInitialSync: (callback: () => void) => {
    ipcRenderer.on('initial-sync', () => callback())
  },
  getStore: (key: string) => ipcRenderer.invoke('get-store', key),
  setStore: (key: string, value: unknown) => ipcRenderer.invoke('set-store', key, value),
  registerShortcut: (action: string, shortcut: string) =>
    ipcRenderer.invoke('register-shortcut', action, shortcut),
  checkShortcut: (shortcut: string) =>
    ipcRenderer.invoke('check-shortcut', shortcut),
  getAutoSync: () => ipcRenderer.invoke('get-auto-sync'),
  setAutoSync: (enabled: boolean, interval: number) =>
    ipcRenderer.invoke('set-auto-sync', enabled, interval),
  onFocusTimerTick: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('focus-timer-tick', handler)
    return () => ipcRenderer.removeListener('focus-timer-tick', handler)
  },
  setFocusTimer: (enabled: boolean) =>
    ipcRenderer.invoke('set-focus-timer', enabled),
  showWindow: () => ipcRenderer.send('show-window'),
})
