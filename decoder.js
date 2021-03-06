const { Transform } = require('stream')
const EMPTY = Buffer.alloc(0)

class Decoder extends Transform {
  constructor (options) {
    super(options)
    this._buffer = EMPTY
    this._currentLength = 0
  }

  _transform (chunk, enc, cb) {
    let buffer = Buffer.concat([ this._buffer, chunk ])

    if (this._currentLength === 0) {
      this._currentLength = buffer.readInt32LE(0)
      buffer = buffer.slice(4)
    }

    // we didn't get all of the message yet
    if (buffer.length < this._currentLength) {
      this._buffer = buffer
      cb()
      return
    }

    this.push(buffer.toString('utf8', 0, this._currentLength))

    // read everything?
    if (buffer.length === this._currentLength) {
      this._buffer = EMPTY
      this._currentLength = 0
      cb()
      return
    }

    this._buffer = Buffer.from(buffer.slice(this._currentLength))
    this._currentLength = 0
    this._transform(EMPTY, enc, cb)
  }
}

module.exports = () => new Decoder()
