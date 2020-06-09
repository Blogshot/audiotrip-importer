const fs = require('fs')
require('log-timestamp');


// make available globally
var locationPC = process.env.LOCALAPPDATA + "Low\\Kinemotik Studios\\Audio Trip\\Songs\\"

// check if PC version is installed
var pc = fs.existsSync(locationPC)
// check if Quest is connected
var quest = false

module.exports = {

  entrypoint: function entrypoint(filePath) {

    var fileName = filePath.substr(filePath.lastIndexOf("\\") + 1)

      // support only dropping an .ogg file
      if (fileName.endsWith(".ogg") || fileName.endsWith(".ats")) {

        console.log("File is valid. Deploying...")

        this.deployToGame(filePath.substr(0, filePath.lastIndexOf("\\") + 1), fileName)
      }
  },

  deployToGame: function deployToGame(path, file) {

    // write  audio file and generated song into custom song location
    if (pc) {
      fs.copyFileSync(path + file, locationPC + file)
    }

    var questWrapper = require('./questWrapper')

    questWrapper.questIsConnected().then( data => {
      questWrapper.copyToQuest(path, file)
    })
  }
}

