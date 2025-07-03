"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logIncidenceAction = exports.logPayrollAction = exports.logError = exports.logRequest = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Configuración de formatos
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
}));
const developmentFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat);
// Crear logger
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'development' ? developmentFormat : logFormat,
    defaultMeta: { service: 'mysourcing-pulse-backend' },
    transports: [
        // Console transport
        new winston_1.default.transports.Console({
            format: process.env.NODE_ENV === 'development' ? developmentFormat : logFormat
        }),
        // File transports
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 10
        })
    ],
    // Manejo de excepciones no capturadas
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'exceptions.log')
        })
    ],
    // Manejo de rechazos de promesas no capturadas
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'rejections.log')
        })
    ]
});
// Métodos de conveniencia
const logRequest = (req, res) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;
        const logData = {
            method,
            url: originalUrl,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent: req.get('User-Agent')
        };
        if (statusCode >= 400) {
            exports.logger.warn(`${method} ${originalUrl} - ${statusCode} (${duration}ms)`, logData);
        }
        else {
            exports.logger.info(`${method} ${originalUrl} - ${statusCode} (${duration}ms)`, logData);
        }
    });
};
exports.logRequest = logRequest;
const logError = (error, context) => {
    exports.logger.error('Application error:', {
        message: error.message,
        stack: error.stack,
        context
    });
};
exports.logError = logError;
const logPayrollAction = (action, payrollId, userId, details) => {
    exports.logger.info(`Payroll action: ${action}`, {
        payrollId,
        userId,
        details,
        timestamp: new Date().toISOString()
    });
};
exports.logPayrollAction = logPayrollAction;
const logIncidenceAction = (action, incidenceId, employeeId, userId) => {
    exports.logger.info(`Incidence action: ${action}`, {
        incidenceId,
        employeeId,
        userId,
        timestamp: new Date().toISOString()
    });
};
exports.logIncidenceAction = logIncidenceAction;
// Crear directorio de logs si no existe
const fs_1 = __importDefault(require("fs"));
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map