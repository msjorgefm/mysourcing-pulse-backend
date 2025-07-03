import winston from 'winston';
import path from 'path';

// Configuración de formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
  })
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  logFormat
);

// Crear logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'development' ? developmentFormat : logFormat,
  defaultMeta: { service: 'mysourcing-pulse-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development' ? developmentFormat : logFormat
    }),
    
    // File transports
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ],
  
  // Manejo de excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log')
    })
  ],
  
  // Manejo de rechazos de promesas no capturadas
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log')
    })
  ]
});

// Métodos de conveniencia
export const logRequest = (req: any, res: any) => {
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
      logger.warn(`${method} ${originalUrl} - ${statusCode} (${duration}ms)`, logData);
    } else {
      logger.info(`${method} ${originalUrl} - ${statusCode} (${duration}ms)`, logData);
    }
  });
};

export const logError = (error: Error, context?: any) => {
  logger.error('Application error:', {
    message: error.message,
    stack: error.stack,
    context
  });
};

export const logPayrollAction = (action: string, payrollId: number, userId: number, details?: any) => {
  logger.info(`Payroll action: ${action}`, {
    payrollId,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};

export const logIncidenceAction = (action: string, incidenceId: number, employeeId: number, userId: number) => {
  logger.info(`Incidence action: ${action}`, {
    incidenceId,
    employeeId,
    userId,
    timestamp: new Date().toISOString()
  });
};

// Crear directorio de logs si no existe
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;