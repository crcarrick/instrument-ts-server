# Instrument TS Server

VSCode extension that allows users to plug-in to the internals of VSCode's Typescript server.

## Features

Allows user to provide a set of functions (via a local file) that are called when events happen within VSCode's TS language service.

```json
{
  "crcarrick.instrumentTsServer.scriptPath": "/path/to/script.js"
}
```

```js
// /path/to/script.js

// the keys of this object map directly to any internal function call within TS Server.
// when that event happens -> provided function is called
module.exports = {
  getSyntacticDiagnostics(logger, ...args) {
    // we provide a logging utility to easily write to tsserver.log
    logger.log('info', 'Hello from getSyntacticDiagnostics')
    // remaining ...args are the args being passed to the real function by the
    // language service
  },
}
```

## Extension Settings

This extension contributes the following settings:

- `crcarrick.instrumentTsServer.scriptPath`: Absolute path to the local file containing user-defined TS Server functions

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of Instrument TS Server
