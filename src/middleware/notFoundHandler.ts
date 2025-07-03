import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error handler:', error);
  
  // Error de Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Registro duplicado'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado'
    });
  }
  
  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.details
    });
  }
  
  // Error de autenticación
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'No autorizado'
    });
  }
  
  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack 
    })
  });
};