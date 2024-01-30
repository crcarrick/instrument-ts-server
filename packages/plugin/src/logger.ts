import tsModule from 'typescript/lib/tsserverlibrary'
import { MESSAGE } from 'triple-beam'
import winston from 'winston'
import Transport, { type TransportStreamOptions } from 'winston-transport'

export class TypescriptServerPluginTransport extends Transport {
  constructor(
    private logger: tsModule.server.Logger,
    opts: TransportStreamOptions,
  ) {
    super(opts)
  }

  log(info: winston.Logform.TransformableInfo, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    this.logger.msg(info[MESSAGE], tsModule.server.Msg.Perf)
    callback()
  }
}

export function createLogger(
  logger: tsModule.server.Logger,
  loggerName = '[Plugin Instrument TS Server]',
) {
  return winston.createLogger({
    transports: [
      new TypescriptServerPluginTransport(logger, {
        format: winston.format.printf(
          (info) => `[${info.level}] ${loggerName} ${info.message}`,
        ),
      }),
    ],
  })
}
