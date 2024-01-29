import type { Logger } from 'winston'

export interface Configuration {
  userProvidedInstrumentationCallbacks: Record<
    string,
    (logger: Logger, ...args: any[]) => void
  >
}

export class ConfigurationManager {
  private configuration: Configuration = {
    userProvidedInstrumentationCallbacks: {},
  }

  public get<K extends keyof Configuration>(key: K): Configuration[K] {
    return this.configuration[key]
  }

  public async updateInstrumentationCallbacksFromScriptPath(
    scriptPath: string,
  ) {
    const script = require(scriptPath)

    this.configuration = {
      ...this.configuration,
      userProvidedInstrumentationCallbacks: script,
    }
  }
}
