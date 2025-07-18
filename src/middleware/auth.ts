import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { User } from '../types';

interface AuthRequest extends Request {
  user?: User;
}

export const authenticate: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
       res.status(401).json({ error: 'Access token required' });
       return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
       res.status(500).json({ error: 'JWT configuration error' });
       return;
    }

    const decoded = jwt.verify(token, secret) as any;
    
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          company: true,
          workerDetails: true
        }
      });
      
      if (!user || !user.isActive) {
         res.status(401).json({ error: 'Invalid or inactive user' });
         return;
      }
      
      req.user = {
        id: user.id,
        email: user.email,
        name: user.username || user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any,
        companyId: user.companyId || undefined,
        companyName: user.company?.name || undefined,
        workerDetailsId: user.workerDetailsId || undefined,
        employeeId: user.workerDetails?.id || undefined,
        isActive: user.isActive
      } as User;
      
      next();
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Authentication error:', error);
     res.status(401).json({ error: 'Invalid token' });
    return;
  }
};

export const authorize = (roles: string[]): RequestHandler => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient privileges' });
      return;
    }
    
    next();
  };
};