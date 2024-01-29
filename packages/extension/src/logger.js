"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const triple_beam_1 = require("triple-beam");
const winston_1 = __importDefault(require("winston"));
const winston_transport_1 = __importDefault(require("winston-transport"));
class VSCodeTransport extends winston_transport_1.default {
    outputChannel;
    constructor(outputChannel, opts) {
        super(opts);
        this.outputChannel = outputChannel;
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        this.outputChannel.appendLine(info[triple_beam_1.MESSAGE]);
        callback();
    }
}
function createLogger(outputChannel) {
    return winston_1.default.createLogger({
        transports: [
            new VSCodeTransport(outputChannel, {
                format: winston_1.default.format.combine(winston_1.default.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }), winston_1.default.format.printf((info) => `${info.timestamp} [${info.level}] ${info.message}`)),
            }),
        ],
    });
}
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map