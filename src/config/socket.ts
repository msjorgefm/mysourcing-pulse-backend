import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
  companyId?: number;
}

export class SocketManager {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
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
    
    logger.info('Socket.IO server initialized');
  }

  private setupMiddleware() {
    // Middleware de autenticación
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || 
                     socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.companyId = decoded.companyId;
        
        logger.info(`Socket authenticated for user ${decoded.userId}`);
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User ${socket.userId} connected via socket`);

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
        logger.info(`User ${socket.userId} subscribed to payroll ${companyId}_${periodId}`);
      });

      socket.on('payroll:unsubscribe', (data) => {
        const { companyId, periodId } = data;
        socket.leave(`payroll_${companyId}_${periodId}`);
        logger.info(`User ${socket.userId} unsubscribed from payroll ${companyId}_${periodId}`);
      });

      // Eventos de incidencias
      socket.on('incidence:created', (data) => {
        this.broadcastToCompany(socket.companyId!, 'incidence:new', data);
      });

      socket.on('incidence:updated', (data) => {
        this.broadcastToCompany(socket.companyId!, 'incidence:updated', data);
      });

      // Desconexión
      socket.on('disconnect', (reason) => {
        logger.info(`User ${socket.userId} disconnected: ${reason}`);
      });

      // Ping/Pong para mantener conexión
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  // Métodos públicos para emisión
  public broadcastToCompany(companyId: number, event: string, data: any) {
    this.io.to(`company_${companyId}`).emit(event, data);
  }

  public broadcastToRole(role: string, event: string, data: any) {
    this.io.to(`role_${role}`).emit(event, data);
  }

  public broadcastToPayroll(companyId: number, periodId: number, event: string, data: any) {
    this.io.to(`payroll_${companyId}_${periodId}`).emit(event, data);
  }

  public sendToUser(userId: number, event: string, data: any) {
    // Buscar socket por userId
    const sockets = Array.from(this.io.sockets.sockets.values());
    const userSocket = sockets.find((s: any) => s.userId === userId);
    
    if (userSocket) {
      userSocket.emit(event, data);
    }
  }

  public getConnectedUsers(): number {
    return this.io.sockets.sockets.size;
  }

  public getUsersInCompany(companyId: number): number {
    const room = this.io.sockets.adapter.rooms.get(`company_${companyId}`);
    return room ? room.size : 0;
  }
}

export default SocketManager;