const {PassThrough} = require('stream')
const encoder = require('./encoder')
const spawn = require('child_process').spawn
const decoder = require('./decoder')
const pump = require('pump')

function createListenerMethods (arr) {
  return {
    addListener: (l) => {
      arr.push(l)
    },
    removeListener: (l) => {
      const index = arr.findIndex((i) => i === l)
      if (~index) arr.splice(index, 1)
    }
  }
}

function Port (script) {
  if (!(this instanceof Port)) { return new Port(script) }

  this.name = script
  this.fork = spawn(script)
  this.disconnectListeners = []
  this.messageListeners = []

  this.fork.on('close', (exitCode) => {
    console.log('exit', exitCode)
    this.disconnectListeners.forEach((l) => {
      l({error: null})
    })

    this.disconnectListeners = []
  })

  this.fork.on('error', (err) => {
    console.log('error', err)
    this.disconnectListeners.forEach((l) => {
      l({error: err})
    })
  })

  this.fork.stderr.on('data', (m) => {
    console.log('stderr', m.toString())
  })

  this.onMessage = createListenerMethods(this.messageListeners)
  this.onDisconnect = createListenerMethods(this.disconnectListeners)

  this.writer = new PassThrough()
  this.reader = new PassThrough()
  this.encoder = encoder()
  this.decoder = decoder()

  pump(this.writer, this.encoder, this.fork.stdin, function (err) {
    console.error('STDIN ends with error', err)
  })

  pump(this.fork.stdout, this.decoder, this.reader, function (err) {
    console.error('STDOUT ends with error', err)
  })

  this.reader.on('data', (data) => {
    data = JSON.parse(data)
    this.messageListeners.forEach((l) => {
      l(data)
    })
  })
}

Port.prototype.postMessage = function (message) {
  this.writer.write(JSON.stringify(message))
}

Port.prototype.disconnect = function () {
  this.fork.kill()
}

function connectNative (script) {
  return new Port(script)
}

module.exports.connectNative = connectNative
module.exports.NativeEncoder = encoder
module.exports.NativeDecoder = decoder
