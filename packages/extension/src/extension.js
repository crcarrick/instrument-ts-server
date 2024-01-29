"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.Extension = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const vscode = __importStar(require("vscode"));
const logger_1 = require("./logger");
class Extension {
    vscode;
    logger;
    constructor(vscode) {
        this.vscode = vscode;
        this.logger = (0, logger_1.createLogger)(this.vscode.window.createOutputChannel('Instrument TS Server', 'log'));
    }
    log(message, level = 'info') {
        this.logger.log(level, message);
    }
    loadScriptPath() {
        return new Promise((resolve, reject) => {
            const scriptPath = this.vscode.workspace
                .getConfiguration('crcarrick.instrumentTsServer')
                .get('scriptPath') ?? '';
            this.log(`Loaded script path: ${scriptPath}`);
            this.ensureScriptPath(scriptPath)
                .then(() => {
                this.vscode.commands
                    .executeCommand('_typescript.configurePlugin', 'instrument-ts-server', {
                    scriptPath,
                })
                    .then(() => {
                    this.log('Script path passed to TS Server.');
                    resolve();
                }, (reason) => {
                    this.log(`Failed to pass script path to TS Server: ${reason}`, 'error');
                    reject(reason);
                });
            })
                .catch((reason) => {
                this.log(`Failed to access script path: ${reason}`, 'error');
                reject(reason);
            });
        });
    }
    ensureScriptPath(scriptPath) {
        return promises_1.default.access(scriptPath);
    }
}
exports.Extension = Extension;
function activate(_context) {
    const extension = new Extension(vscode);
    extension.log('Instrumenting TS Server...');
    extension
        .loadScriptPath()
        .then(() => extension.log('Instrumented TS Server.'))
        .catch((reason) => {
        extension.log(`Failed to instrument TS Server: ${reason}`, 'error');
    });
}
exports.activate = activate;
function deactivate(context) {
    context.subscriptions.forEach((disposable) => disposable.dispose());
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map