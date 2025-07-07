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
  
  // Obtener tipos de identificación
  static async getIdentificationTypes(req: Request, res: Response) {
    try {
      const identificationTypes = await prisma.identificationType.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
        select: {
          id: true,
          code: true,
          nombre: true
        }
      });
      
      res.json({
        success: true,
        data: identificationTypes
      });
    } catch (error: any) {
      console.error('Error getting identification types:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get identification types' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }
  
  // Obtener clases de riesgo IMSS
  static async getIMSSRiskClasses(req: Request, res: Response) {
    try {
      const riskClasses = await prisma.claseRiesgoIMSS.findMany({
        orderBy: { codigo: 'asc' },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          descripcion: true
        }
      });
      
      res.json({
        success: true,
        data: riskClasses
      });
    } catch (error: any) {
      console.error('Error getting IMSS risk classes:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get IMSS risk classes' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  // Obtener origenes de movimiento IMSS
  static async getIMSSOrigenMovimiento(req: Request, res: Response) {
    try {
      const origenes = await prisma.iMSSOrigenMovimiento.findMany({
        where: { isActive: true },
        orderBy: { codigo: 'asc' },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          descripcion: true
        }
      });
      
      res.json({
        success: true,
        data: origenes
      });
    } catch (error: any) {
      console.error('Error getting IMSS origen movimiento:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get IMSS origen movimiento' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  // Obtener delegaciones IMSS
  static async getIMSSDelegaciones(req: Request, res: Response) {
    try {
      const { entidadFederativa } = req.query;
      
      let where: any = { isActive: true };
      
      if (entidadFederativa) {
        where.entidadFederativaCode = entidadFederativa;
      }
      
      const delegaciones = await prisma.iMSSDelegacion.findMany({
        where,
        orderBy: { codigo: 'asc' },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          entidadFederativaCode: true
        }
      });
      
      res.json({
        success: true,
        data: delegaciones
      });
    } catch (error: any) {
      console.error('Error getting IMSS delegaciones:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get IMSS delegaciones' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  // Obtener subdelegaciones IMSS
  static async getIMSSSubdelegaciones(req: Request, res: Response) {
    try {
      const { delegacionId, municipioCode } = req.query;
      
      let where: any = { isActive: true };
      
      if (delegacionId) {
        where.delegacionId = Number(delegacionId);
      }
      
      if (municipioCode) {
        where.municipioCode = municipioCode;
      }
      
      const subdelegaciones = await prisma.iMSSSubdelegacion.findMany({
        where,
        orderBy: { codigo: 'asc' },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          delegacionId: true,
          municipioCode: true
        }
      });
      
      res.json({
        success: true,
        data: subdelegaciones
      });
    } catch (error: any) {
      console.error('Error getting IMSS subdelegaciones:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get IMSS subdelegaciones' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  // Obtener municipios por estado
  static async getMunicipios(req: Request, res: Response) {
    try {
      const { stateCode } = req.query;
      
      if (!stateCode) {
        return res.status(400).json({ 
          success: false, 
          error: 'State code is required' 
        });
      }
      
      const municipios = await prisma.municipio.findMany({
        where: { 
          stateCode: String(stateCode),
          isActive: true 
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          stateCode: true
        }
      });
      
      res.json({
        success: true,
        data: municipios
      });
    } catch (error: any) {
      console.error('Error getting municipios:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get municipios' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  // Obtener colonias por código postal
  static async getColoniasByPostalCode(req: Request, res: Response) {
    try {
      const { postalCode } = req.query;
      
      if (!postalCode) {
        return res.status(400).json({ 
          success: false, 
          error: 'Postal code is required' 
        });
      }
      
      const colonias = await prisma.colonia.findMany({
        where: { 
          postalCode: String(postalCode),
          isActive: true 
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          postalCode: true,
          cityName: true,
          municipioCode: true,
          stateCode: true,
          municipio: {
            select: {
              name: true
            }
          },
          state: {
            select: {
              name: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: colonias
      });
    } catch (error: any) {
      console.error('Error getting colonias:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get colonias' 
      });
    } finally {
      await prisma.$disconnect();
    }
  }
}