const fs = require('fs')

// make available globally
var locationPC = process.env.LOCALAPPDATA + "Low\\Kinemotik Studios\\Audio Trip\\Songs\\"

// check if PC version is installed
var pc = fs.existsSync(locationPC)
// check if Quest is connected
var quest = false

module.exports = {

  entrypoint: async function entrypoint(filePath, callback) {

    var fileName = filePath.substr(filePath.lastIndexOf("\\") + 1)
    
    // support only dropping an .ogg file
    if (fileName.endsWith(".ogg") || fileName.endsWith(".ats")) {

      await this.deployToGame(filePath.substr(0, filePath.lastIndexOf("\\") + 1), fileName)

      callback({
        "result": true, "message": "The song was successfully imported.\nYou can find the files at:" +
          "\n" + (pc ? "- " + locationPC : "") +
          "\n" + (quest ? "- Your Quest" : "")
      })
    }

    callback({
      "result": false, "message": "File is not of type .ogg"
    })
  },

  deployToGame: async function deployToGame(path, file) {

    // check if Quest is connected
    quest = await this.questIsConnected()

    // write  audio file and generated song into custom song location
    if (pc) {
      fs.copyFileSync(path + file, locationPC + file)
    }

    if (quest) {
      await this.copyToQuest(quest[0], quest[1], path + file)
    }
  },

  questIsConnected: async function questIsConnected() {
    
    return new Promise((resolve, reject) => {
      var adb = require('adbkit')
      var client = adb.createClient( { bin: ".\\adb.exe" })

      client.listDevices().then(devices => {

        if (devices.length == 0) {
          console.log("No devices connected!")
          resolve(false)
        }

        for (var index in devices) {

          var id = devices[index].id

          client.getProperties(id).then(props => {
            var model = props["ro.product.model"]

            if (model == "Quest") {
              resolve([client, id])
            }
          })
        }
      })
    })
  },

  copyToQuest: async function copyToQuest(client, id, filePath) {

    return new Promise((resolve, reject) => {

      client.getProperties(id).then(props => {

        var model = props["ro.product.model"]

        if (model == "Quest") {

          client.syncService(id).then(sync => {

            var fileName = filePath.substr(filePath.lastIndexOf("\\") + 1)
            var transfer = sync.pushFile(filePath, '/sdcard/Android/data/com.KinemotikStudios.AudioTripQuest/files/Songs/' + fileName)

            transfer.on('end', () => {
              resolve(true)
            })
            transfer.on('error', error => {
              console.error(error)
              resolve(false)
            })
          })
        }
      })
    })
  },
}

