import fs from 'node:fs/promises'

import * as vscode from 'vscode'
import winston from 'winston'

import { createLogger } from './logger'
import { join } from 'node:path'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'
export type VSCode = typeof vscode

export class Extension {
  protected logger: winston.Logger

  constructor(private vscode: VSCode) {
    this.logger = createLogger(
      this.vscode.window.createOutputChannel('Instrument TS Server', 'log'),
    )
  }

  log(message: string, level: LogLevel = 'info') {
    this.logger.log(level, message)
  }

  loadScriptPath() {
    return new Promise<void>((resolve, reject) => {
      const scriptPath: string =
        this.vscode.workspace
          .getConfiguration('crcarrick.instrumentTsServer')
          .get('scriptPath') ?? ''

      this.log(`Loaded script path: ${scriptPath}`)
      this.ensureScriptPath(scriptPath)
        .then(() => {
          this.vscode.commands
            .executeCommand(
              '_typescript.configurePlugin',
              'plugin-instrument-ts-server',
              {
                scriptPath,
              },
            )
            .then(
              () => {
                this.log('Script path passed to TS Server.')
                resolve()
              },
              (reason) => {
                this.log(
                  `Failed to pass script path to TS Server: ${reason}`,
                  'error',
                )
                reject(reason)
              },
            )
        })
        .catch((reason) => {
          this.log(`Failed to access script path: ${reason}`, 'error')
          reject(reason)
        })
    })
  }

  protected ensureScriptPath(scriptPath: string) {
    return fs.access(scriptPath)
  }
}

export function activate(_context: vscode.ExtensionContext) {
  const extension = new Extension(vscode)

  extension.log('Instrumenting TS Server...')
  extension
    .loadScriptPath()
    .then(() => extension.log('Instrumented TS Server.'))
    .catch((reason) => {
      extension.log(`Failed to instrument TS Server: ${reason}`, 'error')
    })
}

export function deactivate(context: vscode.ExtensionContext) {
  context.subscriptions.forEach((disposable) => disposable.dispose())
}
