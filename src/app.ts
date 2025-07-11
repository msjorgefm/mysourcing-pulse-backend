
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Importar middleware personalizado
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Importar rutas
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import companyDocumentRoutes from './routes/companyDocumentRoutes';
import employeeRoutes from './routes/employees';
import payrollRoutes from './routes/payrolls';
import calendarRoutes from './routes/calendars';
import incidenceRoutes from './routes/incidences';
import notificationRoutes from './routes/notifications';
import onboardingRoutes from './routes/onboardingRoutes';
import testRoutes from './routes/testRoutes';
import uploadRoutes from './routes/upload';
import catalogRoutes from './routes/catalogs';
import companyWizardRoutes from './routes/companyWizard';
import postalCodeRoutes from './routes/postalCodeRoutes';
import stateRoutes from './routes/stateRoutes';
import userRoutes from './routes/users';
import vinculacionJefesRoutes from './routes/vinculacionJefes';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const server = createServer(app);

// Configurar Socket.IO para notificaciones en tiempo real
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// ================================
// MIDDLEWARE GLOBAL
// ================================

// Seguridad
app.use(helmet({
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
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
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
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos de login por IP por ventana
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});
app.use('/api/auth', authLimiter);

// Compresión
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/companies', companyDocumentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payrolls', payrollRoutes);
app.use('/api/calendars', calendarRoutes);
app.use('/api/incidences', incidenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/company-wizard', companyWizardRoutes);
app.use('/api/postal-codes', postalCodeRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vinculacion-jefes', vinculacionJefesRoutes);

// Rutas de prueba (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', testRoutes);
}

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
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

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
    console.log('🔄 Iniciando servidor en puerto', PORT);
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
    
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
};

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;