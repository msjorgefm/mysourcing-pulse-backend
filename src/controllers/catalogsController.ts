import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CatalogsController {
  
  // Obtener regímenes fiscales
  static async getTaxRegimes(req: Request, res: Response) {
    try {
      const { tipoPersona } = req.query;
      
      let where: any = { isActive: true };
      
      // Si se especifica tipo de persona, filtrar
      if (tipoPersona && (tipoPersona === 'FISICA' || tipoPersona === 'MORAL')) {
        where.tipoPersona = tipoPersona;
      }
      
      const taxRegimes = await prisma.taxRegime.findMany({
        where,
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          tipoPersona: true
        }
      });
      
      res.json({
        success: true,
        data: taxRegimes
      });
    } catch (error: any) {
      console.error('Error getting tax regimes:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get tax regimes' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }
  
  // Obtener actividades económicas
  static async getEconomicActivities(req: Request, res: Response) {
    try {
      const economicActivities = await prisma.economicActivity.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          description: true
        }
      });
      
      res.json({
        success: true,
        data: economicActivities
      });
    } catch (error: any) {
      console.error('Error getting economic activities:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get economic activities' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }
}