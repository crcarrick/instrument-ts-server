import type { Logger } from 'winston'

export interface Configuration {
  userProvidedCallbacks: Record<
    string,
    <T extends any[]>(
      logger: Logger,
      ...args: T
    ) => ((result: any) => void) | void
  >
}

export class ConfigurationManager {
  private configuration: Configuration = {
    userProvidedCallbacks: {},
  }

  public get<K extends keyof Configuration>(key: K): Configuration[K] {
    return this.configuration[key]
  }

  public async updateCallbacksFromScriptPath(scriptPath: string) {
    const script = require(scriptPath)

    this.configuration.userProvidedCallbacks = script
  }
}
