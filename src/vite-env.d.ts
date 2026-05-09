/// <reference types="vite/client" />

interface ElectronAPI {
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  getTheme: () => Promise<'light' | 'dark'>
  onThemeChanged: (callback: (theme: string) => void) => void
  onOpenQuickAdd: (callback: () => void) => void
  getStore: (key: string) => Promise<unknown>
  setStore: (key: string, value: unknown) => Promise<void>
  registerShortcut: (action: string, shortcut: string) => Promise<{ success: boolean; error?: string }>
  checkShortcut: (shortcut: string) => Promise<{ available: boolean; registered: boolean }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
