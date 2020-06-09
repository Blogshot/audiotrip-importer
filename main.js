const { app, BrowserWindow } = require('electron')
var fs = require('fs')
require('log-timestamp');

var win

const importer = require('./functions.js')

function createWindow() {

  win = new BrowserWindow({
    width: 600,
    height: 450,
    webPreferences: {
      nodeIntegration: true
    },
    resizable: false
  })

  win.setMenu(null)
  //win.webContents.openDevTools()

  win.loadFile('index.html')

  setInterval(function () {

    var questWrapper = require('./questWrapper')

    questWrapper.questIsConnected().then(data => {
      win.webContents.executeJavaScript(`document.getElementById('quest').style.backgroundColor = "green";`)
    }).catch(error => {
      console.log("Quest is not connected")
      win.webContents.executeJavaScript(`document.getElementById('quest').style.backgroundColor = "red";`)
    })

  }, 2000)

  // check if PC version is installed
  var locationPC = process.env.LOCALAPPDATA + "Low\\Kinemotik Studios\\Audio Trip\\Songs\\"
  var pc = fs.existsSync(locationPC)

  if (pc) {
    win.webContents.executeJavaScript(`document.getElementById('pc').style.backgroundColor = "green";`)
  } else {
    win.webContents.executeJavaScript(`document.getElementById('pc').style.backgroundColor = "red";`)
  }
}

var ipc = require('electron').ipcMain;

ipc.on('onFile', function (event, data) {

  setLoading(true)

  for (var elem in data) {
    importer.entrypoint(data[elem], event)
  }

  setLoading(false)
});

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function setLoading(bool) {

  if (bool) {
    win.webContents.executeJavaScript(`document.getElementById("dropLogo").style.display = "none";`)
    win.webContents.executeJavaScript(`document.getElementById("spinner").style.removeProperty('display');`)
  } else {
    win.webContents.executeJavaScript(`document.getElementById("spinner").style.display = "none";`)
    win.webContents.executeJavaScript(`document.getElementById("dropLogo").style.removeProperty('display');`)
  }
}