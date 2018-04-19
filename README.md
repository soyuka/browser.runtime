browser.runtime
===============

[`browser.runtime`](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime) implementation in nodejs.

See also [Native Messaging](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging).

## Usage

```code
npm install browser.runtime
```

```javascript
const runtime = require('browser.runtime')
const port = runtime.connectNative(`${__dirname}/py_ping_pong`)

port.onMessage.addListener((response) => {
  t.equal(response, 'pong')
  port.disconnect()
})

port.postMessage('ping')
```

## Transform streams

You can reuse low level transform streams to encode/decode messages:

```
const {NativeEncoder, NativeDecoder} = require('browser.runtime')
```

See [tests](./test/test.js).
