import { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme, Tray, Menu, shell, nativeImage } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Store from 'electron-store'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

const store = new Store()

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
let autoSyncInterval: NodeJS.Timeout | null = null

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const isDev = !!VITE_DEV_SERVER_URL

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createTray() {
  const iconPath = join(__dirname, '../public/todolist.ico')
  let trayIcon: nativeImage

  try {
    trayIcon = nativeImage.createFromPath(isDev ? join(__dirname, '../public/todolist.ico') : iconPath)
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty()
    }
  } catch {
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => mainWindow?.show() },
    { label: '快速添加', click: () => {
      mainWindow?.show()
      mainWindow?.webContents.send('open-quick-add')
    }},
    { type: 'separator' },
    { label: '退出', click: () => {
      isQuitting = true
      app.quit()
    }}
  ])

  tray.setToolTip('TodoList')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => mainWindow?.show())
}

function registerGlobalShortcuts() {
  const quickAddShortcut = store.get('quickAddShortcut', 'CommandOrControl+Shift+T') as string
  const showHideShortcut = store.get('showHideShortcut', 'CommandOrControl+Shift+H') as string

  globalShortcut.register(quickAddShortcut, () => {
    mainWindow?.show()
    mainWindow?.webContents.send('open-quick-add')
  })

  globalShortcut.register(showHideShortcut, () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
}

ipcMain.handle('get-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
})

ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.hide())

ipcMain.handle('get-store', (_event, key: string) => store.get(key))
ipcMain.handle('set-store', (_event, key: string, value: unknown) => store.set(key, value))

ipcMain.handle('register-shortcut', (_event, action: string, shortcut: string) => {
  try {
    // Check if shortcut is already registered by another application
    if (globalShortcut.isRegistered(shortcut)) {
      return { success: false, error: '快捷键已被其他应用程序占用' }
    }

    if (action === 'quickAdd') {
      globalShortcut.unregister(store.get('quickAddShortcut', 'CommandOrControl+Shift+T') as string)
      store.set('quickAddShortcut', shortcut)
      globalShortcut.register(shortcut, () => {
        mainWindow?.show()
        mainWindow?.webContents.send('open-quick-add')
      })
    } else if (action === 'showHide') {
      globalShortcut.unregister(store.get('showHideShortcut', 'CommandOrControl+Shift+H') as string)
      store.set('showHideShortcut', shortcut)
      globalShortcut.register(shortcut, () => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow?.show()
        }
      })
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('check-shortcut', (_event, shortcut: string) => {
  const isRegistered = globalShortcut.isRegistered(shortcut)
  return { available: !isRegistered, registered: isRegistered }
})

ipcMain.handle('get-auto-sync', () => {
  return {
    enabled: store.get('autoSync', false),
    interval: store.get('syncInterval', 30)
  }
})

ipcMain.handle('set-auto-sync', (_event, enabled: boolean, interval: number) => {
  store.set('autoSync', enabled)
  store.set('syncInterval', interval)
  setupAutoSync(enabled, interval)
  return { success: true }
})

function setupAutoSync(enabled: boolean, intervalMinutes: number) {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval)
    autoSyncInterval = null
  }

  if (enabled && intervalMinutes > 0) {
    const intervalMs = intervalMinutes * 60 * 1000
    autoSyncInterval = setInterval(() => {
      mainWindow?.webContents.send('auto-sync-trigger')
    }, intervalMs)
  }
}

nativeTheme.on('updated', () => {
  mainWindow?.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
})

app.whenReady().then(() => {
  if (tray || mainWindow) return // Prevent multiple instances
  createWindow()
  createTray()
  registerGlobalShortcuts()

  // Initialize auto sync
  const autoSyncEnabled = store.get('autoSync', false) as boolean
  const autoSyncInterval = store.get('syncInterval', 30) as number
  setupAutoSync(autoSyncEnabled, autoSyncInterval)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
})
