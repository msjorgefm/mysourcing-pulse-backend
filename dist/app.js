"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
// Importar middleware personalizado
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
// Importar rutas
const auth_1 = __importDefault(require("./routes/auth"));
const companies_1 = __importDefault(require("./routes/companies"));
const employees_1 = __importDefault(require("./routes/employees"));
const payrolls_1 = __importDefault(require("./routes/payrolls"));
const calendars_1 = __importDefault(require("./routes/calendars"));
const incidences_1 = __importDefault(require("./routes/incidences"));
const notifications_1 = __importDefault(require("./routes/notifications"));
// Cargar variables de entorno
dotenv_1.default.config();
// Crear aplicación Express
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Configurar Socket.IO para notificaciones en tiempo real
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
// ================================
// MIDDLEWARE GLOBAL
// ================================
// Seguridad
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP por ventana
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Rate limiting más estricto para autenticación
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 intentos de login por IP por ventana
    message: {
        error: 'Too many authentication attempts, please try again later.'
    }
});
app.use('/api/auth', authLimiter);
// Compresión
app.use((0, compression_1.default)());
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ================================
// RUTAS
// ================================
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/companies', companies_1.default);
app.use('/api/employees', employees_1.default);
app.use('/api/payrolls', payrolls_1.default);
app.use('/api/calendars', calendars_1.default);
app.use('/api/incidences', incidences_1.default);
app.use('/api/notifications', notifications_1.default);
// ================================
// SOCKET.IO PARA TIEMPO REAL
// ================================
// Middleware de autenticación para sockets
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    // Verificar token JWT aquí
    // ... lógica de verificación
    next();
});
// Manejo de conexiones de socket
io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);
    // Unirse a room específico de empresa
    socket.on('join-company', (companyId) => {
        socket.join(`company-${companyId}`);
        console.log(`Socket ${socket.id} se unió a company-${companyId}`);
    });
    // Unirse a room específico de usuario
    socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`Socket ${socket.id} se unió a user-${userId}`);
    });
    // Manejo de desconexión
    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
    });
});
// Hacer io disponible en toda la aplicación
app.set('io', io);
// ================================
// MANEJO DE ERRORES
// ================================
// 404 handler
app.use(notFoundHandler_1.notFoundHandler);
// Error handler global
app.use(errorHandler_1.errorHandler);
// ================================
// INICIO DEL SERVIDOR
// ================================
const PORT = process.env.PORT || 3001;
// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Verificar conexión a la base de datos
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log('✅ Conexión a base de datos establecida');
        // Iniciar servidor
        server.listen(PORT, () => {
            console.log(`
        🚀 Servidor iniciado correctamente
        📍 Entorno: ${process.env.NODE_ENV || 'development'}
        🌐 URL: http://localhost:${PORT}
        📊 Health: http://localhost:${PORT}/health
        🔌 Socket.IO: Habilitado
        📈 API: http://localhost:${PORT}/api
      `);
        });
        // Manejo graceful de cierre
        process.on('SIGTERM', async () => {
            console.log('🔄 Recibida señal SIGTERM, cerrando servidor...');
            await prisma.$disconnect();
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });
        process.on('SIGINT', async () => {
            console.log('🔄 Recibida señal SIGINT, cerrando servidor...');
            await prisma.$disconnect();
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
};
// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    startServer();
}
exports.default = app;
//# sourceMappingURL=app.js.map