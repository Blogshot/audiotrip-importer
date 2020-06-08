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


  // start the server
  var adb = require('./adb.js')
  adb.getClient()

  setInterval(async function () {
    var quest = await adb.questIsConnected()

    if (quest) {
      win.webContents.executeJavaScript(`document.getElementById('quest').style.backgroundColor = "green";`)
    } else {
      win.webContents.executeJavaScript(`document.getElementById('quest').style.backgroundColor = "red";`)
    }
  }, 2000)


  // make available globally
  var locationPC = process.env.LOCALAPPDATA + "Low\\Kinemotik Studios\\Audio Trip\\Songs\\"

  // check if PC version is installed
  var pc = fs.existsSync(locationPC)

  if (pc) {
    win.webContents.executeJavaScript(`document.getElementById('pc').style.backgroundColor = "green";`)
  } else {
    win.webContents.executeJavaScript(`document.getElementById('pc').style.backgroundColor = "red";`)
  }
}

var ipc = require('electron').ipcMain;

ipc.on('onFile', async function (event, data) {

  win.webContents.executeJavaScript(`document.getElementById("dropLogo").style.display = "none";`)
  win.webContents.executeJavaScript(`document.getElementById("spinner").style.removeProperty('display');`)

  var results = new Array()

  for (var elem in data) {

    console.log("Processing " + data[elem])

    results.push(
      await importer.entrypoint(data[elem], event)
    )

  }

  console.log("Results are here!")
  win.webContents.executeJavaScript(`document.getElementById("spinner").style.display = "none";`)
  win.webContents.executeJavaScript(`document.getElementById("dropLogo").style.removeProperty('display');`)
  event.sender.send('actionReply', "Results:\n" + results.join("\n"))

});

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {

    // kill adb before exiting
    require('adbkit').createClient({ bin: ".\\adb.exe" }).kill()
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
