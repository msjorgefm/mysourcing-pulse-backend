import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);
  
  // Errores de Prisma
  if (error.code === 'P2002') {
    res.status(409).json({
      error: 'Duplicate entry. This record already exists.'
    });
    return;
  }
  
  if (error.code === 'P2025') {
    res.status(404).json({
      error: 'Record not found.'
    });
    return;
  }
  
  // Errores de validación
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation error',
      details: error.details
    });
    return;
  }
  
  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token'
    });
    return;
  }
  
  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired'
    });
    return;
  }
  
  // Error por defecto
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`
  });
};