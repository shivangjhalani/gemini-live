// src/main/index.js
import { app, shell, BrowserWindow, session, desktopCapturer } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Open DevTools in development
  if (is.dev) {
    mainWindow.webContents.openDevTools({ mode: 'right' }) // or 'bottom', 'undocked', etc.
  }
}

app.whenReady().then(() => {
  // This handler is required to enable navigator.mediaDevices.getDisplayMedia().
  // It allows the renderer process to request screen capture permission.
  session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
    // This function can be used to programmatically select a source,
    // but for the standard OS picker to show, we just need the handler to exist.
    // The OS will handle the source selection.
    // We can get sources to potentially filter or log them.
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] })
    // The callback must be called to authorize the request.
    // An empty object `{}` would suffice if no specific source is pre-selected.
    callback({ video: sources[0] })
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
