var adb = require('adbkit')
var client

module.exports = {

  getClient: function getClient() {

    if (client == undefined) {
      client = adb.createClient({ bin: ".\\adb.exe" })
    }

    return client
  },

  questIsConnected: async function questIsConnected() {

    return new Promise((resolve, reject) => {

      this.getClient().listDevices().then(devices => {

        if (devices.length == 0) {
          console.log("No devices connected!")
          resolve(false)
        }

        for (var index in devices) {

          var id = devices[index].id

          this.getClient().getProperties(id).then(props => {
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

      this.getClient().getProperties(id).then(props => {

        var model = props["ro.product.model"]

        if (model == "Quest") {

          this.getClient().syncService(id).then(sync => {

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
  }
}