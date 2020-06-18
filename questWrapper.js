
module.exports = {

  questIsConnected: function questIsConnected() {

    return new Promise((resolve, reject) => {

      const { exec } = require('child_process');

      exec('((New-Object -com Shell.Application).NameSpace(0x11).items() | where { $_.name -eq "Quest" }).Path', { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
        
        if (!stderr && !error && stdout) {
          resolve("Quest is connected")
        } else {
          reject("Quest is not connected")
        }
      })
    })
  },

  copyToQuest: function copyToQuest(path, file) {
    const powershell = require('node-powershell');

    // Create the PS Instance
    let ps = new powershell({
      executionPolicy: 'Bypass',
      noProfile: false
    })

    ps.addCommand("./copyViaMTP.ps1")
    ps.addParameters([
      { name: "sourcePath", value: path },
      { name: 'filter', value: file }
    ]);

    console.log("Invoking...")
    ps.invoke().then(output => {
      console.log(output)
    }).catch(err => {
      console.error(err)
      ps.dispose()
    })

  }
}
