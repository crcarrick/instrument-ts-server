import tsModule from 'typescript/lib/tsserverlibrary'

import { createLogger } from './logger'
import { ConfigurationManager } from './settings'
import { isExtensionConfigUpdate } from './utils'

export = function init({ typescript }: { typescript: typeof tsModule }) {
  const configurationManager = new ConfigurationManager()
  let logger: ReturnType<typeof createLogger>

  return {
    create(info: tsModule.server.PluginCreateInfo): tsModule.LanguageService {
      logger = createLogger(info.project.projectService.logger)
      logger.log('info', 'Plugin create start')

      if (
        info.project.projectKind !== typescript.server.ProjectKind.Configured
      ) {
        return info.languageService
      }

      if (info.config.scriptPath) {
        logger.log(
          'info',
          `Updating configuration with script path ${info.config.scriptPath}`,
        )

        configurationManager.updateInstrumentationCallbacksFromScriptPath(
          info.config.scriptPath,
        )
      }

      const handler: ProxyHandler<tsModule.LanguageService> = {
        get(target, propKey, receiver) {
          const original = Reflect.get(target, propKey, receiver)
          const strPropKey = String(propKey)

          if (typeof original !== 'function') {
            return original
          }

          const userProvidedInstrumentationCallbacks = configurationManager.get(
            'userProvidedInstrumentationCallbacks',
          )

          if (!(strPropKey in (userProvidedInstrumentationCallbacks ?? {}))) {
            return original
          }

          logger.log('info', `Instrumenting ${strPropKey}`)

          return (...args: any[]) => {
            userProvidedInstrumentationCallbacks[strPropKey](
              createLogger(
                info.project.projectService.logger,
                `[Plugin Instrument TS Server] [${strPropKey}]`,
              ),
              ...args,
            )

            return original.apply(this, args)
          }
        },
      }

      logger.log('info', 'Plugin create finish')

      return new Proxy(info.languageService, handler)
    },
    onConfigurationChange(config: unknown) {
      if (isExtensionConfigUpdate(config)) {
        if (logger) {
          logger.log(
            'info',
            `Updating configuration with script path ${config.scriptPath}`,
          )
        }

        configurationManager.updateInstrumentationCallbacksFromScriptPath(
          config.scriptPath,
        )
      }
    },
  }
}
