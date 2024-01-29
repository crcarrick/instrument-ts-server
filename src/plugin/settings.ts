import tsModule from 'typescript/lib/tsserverlibrary'

export interface Configuration {
  userProvidedInstrumentationCallback(
    event: tsModule.server.ProjectServiceEvent,
  ): void
}

export class ConfigurationManager {
  private configuration: Configuration = {
    userProvidedInstrumentationCallback() {},
  }

  public get<K extends keyof Configuration>(key: K): Configuration[K] {
    return this.configuration[key]
  }

  public async updateInstrumentationCallbackFromScriptPath(scriptPath: string) {
    const script = await import(scriptPath)

    if (!script.instrument || typeof script.instrument !== 'function') {
      throw new Error(
        `The script at path ${scriptPath} does not export an instrument function.`,
      )
    }

    this.configuration = {
      ...this.configuration,
      userProvidedInstrumentationCallback: script.instrument,
    }
  }
}
