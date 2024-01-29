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
      this.vscode.window.createOutputChannel('Instrument TS Server'),
    )
  }

  log(message: string, level: LogLevel = 'info') {
    this.logger.log(level, message)
  }

  async loadScriptPath() {
    const scriptPath: string =
      this.vscode.workspace
        .getConfiguration('crcarrick.instrumentTsServer')
        .get('scriptPath') ?? ''

    this.log(`Loaded script path: ${scriptPath}`)
    if (await this.ensureScriptPath(scriptPath)) {
      this.vscode.commands
        .executeCommand('_typescript.configurePlugin', 'instrument-ts-server', {
          scriptPath,
        })
        .then(
          () => this.log('Script path passed to TS Server.'),
          (reason) =>
            this.log(
              `Failed to pass script path to TS Server: ${reason}`,
              'error',
            ),
        )
    }
  }

  protected async ensureScriptPath(scriptPath: string) {
    try {
      await fs.access(scriptPath)
    } catch (error) {
      this.log(`Cannot access script at path ${scriptPath}`, 'error')
      return false
    }

    return true
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const extension = new Extension(vscode)

  extension.log('Instrumenting TS Server...')
  await extension.loadScriptPath()
  extension.log('Instrumented TS Server.')
}

export function deactivate(context: vscode.ExtensionContext) {
  context.subscriptions.forEach((disposable) => disposable.dispose())
}
