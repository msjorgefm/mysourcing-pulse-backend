"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = globalThis.__prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma;
}
// Conectar a la base de datos
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        logger_1.logger.info('Database connected successfully');
        // Verificar conexión
        await prisma.$queryRaw `SELECT 1`;
        logger_1.logger.info('Database connection verified');
    }
    catch (error) {
        logger_1.logger.error('Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
// Desconectar de la base de datos
const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        logger_1.logger.info('Database disconnected');
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from database:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
// Manejar señales de cierre
process.on('SIGINT', async () => {
    await (0, exports.disconnectDatabase)();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await (0, exports.disconnectDatabase)();
    process.exit(0);
});
exports.default = prisma;
//# sourceMappingURL=database.js.map