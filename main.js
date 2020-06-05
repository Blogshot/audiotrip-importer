const { app, BrowserWindow } = require('electron')

const importer = require('./functions.js')

function createWindow () {
  
  let win = new BrowserWindow({
    width: 600,
    height: 450,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.setMenu(null)
  
  win.loadFile('index.html')
}

var ipc = require('electron').ipcMain;

ipc.on('onFile', function(event, data){    

  importer.entrypoint(data, function(successful) {
    if(successful.result) {
      event.sender.send('actionReply', successful.message);
    } else {
      event.sender.send('actionReply', "Error:\n" + successful.message);
    }
  })

});

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    
    // kill adb before exiting
    require('adbkit').createClient( { bin: ".\\adb.exe" }).kill()
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
