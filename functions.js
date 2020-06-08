const fs = require('fs')
require('log-timestamp');


// make available globally
var locationPC = process.env.LOCALAPPDATA + "Low\\Kinemotik Studios\\Audio Trip\\Songs\\"

// check if PC version is installed
var pc = fs.existsSync(locationPC)
// check if Quest is connected
var quest = false

module.exports = {

  entrypoint: async function entrypoint(filePath) {

    return new Promise((resolve, reject) => {

      var fileName = filePath.substr(filePath.lastIndexOf("\\") + 1)

      // support only dropping an .ogg file
      if (fileName.endsWith(".ogg") || fileName.endsWith(".ats")) {

        console.log("File is valid. Deploying...")

        this.deployToGame(filePath.substr(0, filePath.lastIndexOf("\\") + 1), fileName).then(() => {
          resolve(fileName + " successfully imported.")
        }).catch(error => {
          reject("Error when processing " + fileName + " : " + error)
        })
      } else {
        resolve(fileName + ": File is not of type '.ogg' or '.ats'")
      }
    })
  },

  deployToGame: async function deployToGame(path, file) {

    // write  audio file and generated song into custom song location
    if (pc) {
      fs.copyFileSync(path + file, locationPC + file)
    }

    var adbWrapper = require('./adb.js')

    // check if Quest is connected
    console.log("Check for Quest")
    quest = await adbWrapper.questIsConnected()

    if (quest) {
      console.log("Transferring file")
      await adbWrapper.copyToQuest(quest[0], quest[1], path + file)
      console.log("Files transferred")
    }
  }
}

