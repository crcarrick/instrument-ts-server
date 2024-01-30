import tsModule from 'typescript/lib/tsserverlibrary'

import { createLogger } from './logger'
import { createProxyHandler } from './proxy'
import { ConfigurationManager } from './settings'
import { isExtensionConfigUpdate } from './utils'

export = function init({ typescript: _ts }: { typescript: typeof tsModule }) {
  const configurationManager = new ConfigurationManager()
  let logger: ReturnType<typeof createLogger>

  return {
    create(info: tsModule.server.PluginCreateInfo): tsModule.LanguageService {
      logger = createLogger(info.project.projectService.logger)
      logger.log('info', 'Plugin create start')

      if (info.config.scriptPath) {
        logger.log(
          'info',
          `Updating configuration with script path ${info.config.scriptPath}`,
        )

        configurationManager.updateCallbacksFromScriptPath(
          info.config.scriptPath,
        )
      }

      const handler = createProxyHandler(info, configurationManager, logger)

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

        configurationManager.updateCallbacksFromScriptPath(config.scriptPath)
      }
    },
  }
}
