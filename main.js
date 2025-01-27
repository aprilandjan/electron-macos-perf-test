// Modules to control application life and create native browser window
const {app, BrowserWindow, crashReporter} = require('electron')
const path = require('path');
const perf = require('./perf');

perf.mark('init');

function createWindow () {
  perf.mark('startCreateWindow');
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  mainWindow.on('ready-to-show', () => {
    perf.mark('windowReadyToShow');
    perf.prepare(mainWindow);
    perf.run();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

app.once('will-finish-launching', () => {
  perf.mark('startCrashReporter');
  crashReporter.start({
    submitURL: '',
    uploadToServer: false,
  });
  perf.mark('stopCrashReporter');
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  perf.mark('appReady');
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
