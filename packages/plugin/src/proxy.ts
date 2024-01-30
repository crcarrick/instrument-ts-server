import type tsModule from 'typescript/lib/tsserverlibrary'
import type { Logger } from 'winston'

import { createLogger } from './logger'
import type { ConfigurationManager } from './settings'

export function createProxyHandler(
  info: tsModule.server.PluginCreateInfo,
  config: ConfigurationManager,
  logger: Logger,
): ProxyHandler<tsModule.LanguageService> {
  return {
    get(target, propKey, receiver) {
      const strPropKey = String(propKey)

      const original = Reflect.get(target, propKey, receiver)
      if (typeof original !== 'function') {
        return original
      }

      const userProvidedCallbacks = config.get('userProvidedCallbacks')
      if (!(strPropKey in (userProvidedCallbacks ?? {}))) {
        return original
      }

      logger.log('info', `Instrumenting ${strPropKey}`)

      return (...args: any[]) => {
        const userCallback = userProvidedCallbacks[strPropKey]
        const userLogger = createLogger(
          info.project.projectService.logger,
          `[Plugin Instrument TS Server] [${strPropKey}]`,
        )

        const done = userCallback(userLogger, ...args) ?? (() => {})
        const result = original.apply(this, args)
        done(result)
        return result
      }
    },
  }
}
