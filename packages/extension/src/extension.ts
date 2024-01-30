import fs from 'node:fs/promises'

import * as vscode from 'vscode'
import winston from 'winston'

import { createLogger } from './logger'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'
export type VSCode = typeof vscode

export class Extension {
  protected logger: winston.Logger

  constructor(private vscode: VSCode) {
    this.logger = createLogger(
      this.vscode.window.createOutputChannel('Instrument TS Server', 'log'),
    )
  }

  public log(message: string, level: LogLevel = 'info') {
    this.logger.log(level, message)
  }

  public async loadScriptPath() {
    return new Promise<void>(async (resolve, reject) => {
      const scriptPath: string =
        this.vscode.workspace
          .getConfiguration('crcarrick.instrumentTsServer')
          .get('scriptPath') ?? ''

      this.log(`Loaded script path: ${scriptPath}`)

      try {
        await this.ensureScriptPath(scriptPath)
        await this.vscode.commands.executeCommand(
          '_typescript.configurePlugin',
          'plugin-instrument-ts-server',
          {
            scriptPath,
          },
        )

        this.log('Script path passed to TS Server.')
        resolve()
      } catch (err) {
        this.log(`Failed to pass script path to TS Server: ${err}`, 'error')
        reject(err)
      }
    })
  }

  protected ensureScriptPath(scriptPath: string) {
    return fs.access(scriptPath)
  }

  protected passScriptPathToTsServer(scriptPath: string) {
    return this.vscode.commands.executeCommand(
      '_typescript.configurePlugin',
      'plugin-instrument-ts-server',
      {
        scriptPath,
      },
    )
  }
}

export async function activate(_context: vscode.ExtensionContext) {
  const extension = new Extension(vscode)

  extension.log('Instrumenting TS Server...')

  try {
    await extension.loadScriptPath()
    extension.log('Instrumented TS Server.')
  } catch (err) {
    extension.log(`Failed to instrument TS Server: ${err}`, 'error')
  }
}

export function deactivate(context: vscode.ExtensionContext) {
  context.subscriptions.forEach((disposable) => disposable.dispose())
}
