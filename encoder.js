const { Transform } = require('stream')

module.exports = () => new Transform({
  transform (chunk, enc, cb) {
    const length = Buffer.byteLength(chunk, 'utf8')
    const buffer = Buffer.allocUnsafe(4)
    buffer.writeInt32LE(length)
    cb(null, Buffer.concat([buffer, chunk], length + 4))
  }
})
