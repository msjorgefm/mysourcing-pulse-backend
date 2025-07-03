"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class SocketManager {
    constructor(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });
        this.setupMiddleware();
        this.setupEventHandlers();
        logger_1.logger.info('Socket.IO server initialized');
    }
    setupMiddleware() {
        // Middleware de autenticación
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token ||
                    socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                socket.companyId = decoded.companyId;
                logger_1.logger.info(`Socket authenticated for user ${decoded.userId}`);
                next();
            }
            catch (error) {
                logger_1.logger.error('Socket authentication failed:', error);
                next(new Error('Authentication failed'));
            }
        });
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`User ${socket.userId} connected via socket`);
            // Unirse a salas basadas en empresa
            if (socket.companyId) {
                socket.join(`company_${socket.companyId}`);
            }
            // Unirse a sala basada en rol
            if (socket.userRole) {
                socket.join(`role_${socket.userRole}`);
            }
            // Eventos de nómina
            socket.on('payroll:subscribe', (data) => {
                const { companyId, periodId } = data;
                socket.join(`payroll_${companyId}_${periodId}`);
                logger_1.logger.info(`User ${socket.userId} subscribed to payroll ${companyId}_${periodId}`);
            });
            socket.on('payroll:unsubscribe', (data) => {
                const { companyId, periodId } = data;
                socket.leave(`payroll_${companyId}_${periodId}`);
                logger_1.logger.info(`User ${socket.userId} unsubscribed from payroll ${companyId}_${periodId}`);
            });
            // Eventos de incidencias
            socket.on('incidence:created', (data) => {
                this.broadcastToCompany(socket.companyId, 'incidence:new', data);
            });
            socket.on('incidence:updated', (data) => {
                this.broadcastToCompany(socket.companyId, 'incidence:updated', data);
            });
            // Desconexión
            socket.on('disconnect', (reason) => {
                logger_1.logger.info(`User ${socket.userId} disconnected: ${reason}`);
            });
            // Ping/Pong para mantener conexión
            socket.on('ping', () => {
                socket.emit('pong');
            });
        });
    }
    // Métodos públicos para emisión
    broadcastToCompany(companyId, event, data) {
        this.io.to(`company_${companyId}`).emit(event, data);
    }
    broadcastToRole(role, event, data) {
        this.io.to(`role_${role}`).emit(event, data);
    }
    broadcastToPayroll(companyId, periodId, event, data) {
        this.io.to(`payroll_${companyId}_${periodId}`).emit(event, data);
    }
    sendToUser(userId, event, data) {
        // Buscar socket por userId
        const sockets = Array.from(this.io.sockets.sockets.values());
        const userSocket = sockets.find((s) => s.userId === userId);
        if (userSocket) {
            userSocket.emit(event, data);
        }
    }
    getConnectedUsers() {
        return this.io.sockets.sockets.size;
    }
    getUsersInCompany(companyId) {
        const room = this.io.sockets.adapter.rooms.get(`company_${companyId}`);
        return room ? room.size : 0;
    }
}
exports.SocketManager = SocketManager;
exports.default = SocketManager;
//# sourceMappingURL=socket.js.map