const assert = require('assert')
const runtime = require('../')
const tape = require('tape')
const {PassThrough} = require('stream')
const pump = require('pump')

tape('run python', function (t) {
  const port = runtime.connectNative(`${__dirname}/py_ping_pong`)

  port.onMessage.addListener((response) => {
    t.equal(response, 'pong')
    port.disconnect()
    t.end()
  })

  port.postMessage('ping')
})

tape('run js', function (t) {
  const port = runtime.connectNative(`${__dirname}/js_ping_pong`)

  port.onMessage.addListener((response) => {
    t.equal(response, 'pong')
    port.disconnect()
    t.end()
  })

  port.postMessage('ping')
})

tape('encoder/decoder', function (t) {
  const {NativeEncoder, NativeDecoder} = require('../')
  const write = new PassThrough()
  const read = new PassThrough()

  pump(write, NativeEncoder(), NativeDecoder(), read, function (err) {
    t.error(err)
  })

  read.on('data', function(d) {
    t.same(JSON.parse(d.toString()), {hello: 'world'})
    t.end()
  })

  write.write(JSON.stringify({hello: 'world'}))
})
