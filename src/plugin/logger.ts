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

    this.logger.msg(info[MESSAGE])
    callback()
  }
}

export function createLogger(logger: tsModule.server.Logger) {
  return winston.createLogger({
    transports: [
      new TypescriptServerPluginTransport(logger, {
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          winston.format.printf(
            (info) =>
              `${
                info.timestamp
              } [${info.level.toUpperCase()}] [Instrument TS Server] ${
                info.message
              }`,
          ),
        ),
      }),
    ],
  })
}
