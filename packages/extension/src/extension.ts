import * as vscode from 'vscode'
import winston from 'winston'

import { createLogger } from './logger'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'
export type VSCode = typeof vscode

interface ScriptHooks {
  onStart(): void
  onStop(): void
}

function noop() {}

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

  async loadScriptHooks(): Promise<ScriptHooks> {
    const scriptPath: string =
      this.vscode.workspace
        .getConfiguration('crcarrick.instrumentTsServer')
        .get('scriptPath') ?? ''

    if (scriptPath) {
      try {
        const scriptHooks: ScriptHooks = await import(scriptPath)

        return {
          onStart: scriptHooks.onStart ?? noop,
          onStop: scriptHooks.onStop ?? noop,
        }
      } catch (err) {
        this.log(
          `Failed to load script hooks from ${scriptPath}: ${err}`,
          'error',
        )
      }
    }

    return {
      onStart() {},
      onStop() {},
    }
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const extension = new Extension(vscode)
  const scriptHooks = await extension.loadScriptHooks()

  vscode.commands.executeCommand(
    '_typescript.configurePlugin',
    'instrument-ts-server',
    scriptHooks,
  )

  extension.log('Instrumenting TS Server...')
}

export function deactivate(context: vscode.ExtensionContext) {
  context.subscriptions.forEach((disposable) => disposable.dispose())
}
