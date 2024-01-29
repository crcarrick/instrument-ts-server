import tsModule from 'typescript/lib/tsserverlibrary'

import { createLogger } from './logger'
import { ConfigurationManager } from './settings'
import { isExtensionConfigUpdate } from './utils'

export default function init({ typescript }: { typescript: typeof tsModule }) {
  const configurationManager = new ConfigurationManager()

  return {
    create(info: tsModule.server.PluginCreateInfo): tsModule.LanguageService {
      const logger = createLogger(info.project.projectService.logger)

      logger.log('info', 'Plugin create start')

      if (
        info.project.projectKind !== typescript.server.ProjectKind.Configured
      ) {
        return info.languageService
      }

      if (info.config.scriptPath) {
        configurationManager.updateInstrumentationCallbackFromScriptPath(
          info.config.scriptPath,
        )
      }

      const handler: ProxyHandler<tsModule.LanguageService> = {
        get(target, propKey, receiver) {
          const original = Reflect.get(target, propKey, receiver)

          if (propKey !== 'eventHandler') {
            return original
          }

          return (event: tsModule.server.ProjectServiceEvent) => {
            const userProvidedInstrumentationCallback =
              configurationManager.get('userProvidedInstrumentationCallback')

            if (userProvidedInstrumentationCallback) {
              logger.log(
                'info',
                'Calling user provided instrumentation callback',
              )
              userProvidedInstrumentationCallback(event)
            }

            return original.apply(this, [event])
          }
        },
      }

      logger.log('info', 'Plugin create finish')

      return new Proxy(info.languageService, handler)
    },
    onConfigurationChange(config: unknown) {
      console.log('here?')

      if (isExtensionConfigUpdate(config)) {
        configurationManager.updateInstrumentationCallbackFromScriptPath(
          config.scriptPath,
        )
      }
    },
  }
}
