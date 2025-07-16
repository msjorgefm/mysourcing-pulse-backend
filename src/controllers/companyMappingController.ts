import { Request, Response } from 'express';
import { companyMappingService } from '../services/companyMappingService';

export const companyMappingController = {
  // Guardar configuración de mapeo
  saveMapping: async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const configuration = req.body;

      console.log('Request received for company:', companyId);
      console.log('User making request:', (req as any).user?.id);

      if (!companyId || isNaN(parseInt(companyId))) {
        return res.status(400).json({
          success: false,
          error: 'ID de empresa inválido'
        });
      }

      const result = await companyMappingService.saveMapping(
        parseInt(companyId),
        configuration
      );

      res.json({
        success: true,
        data: result,
        message: 'Configuración de mapeo guardada exitosamente'
      });
    } catch (error) {
      console.error('Error al guardar configuración de mapeo:', error);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al guardar la configuración de mapeo',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  },

  // Obtener configuración de mapeo
  getMapping: async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;

      const mapping = await companyMappingService.getMapping(parseInt(companyId));

      res.json({
        success: true,
        data: mapping
      });
    } catch (error) {
      console.error('Error al obtener configuración de mapeo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener la configuración de mapeo'
      });
    }
  },

  // Procesar Excel con mapeo
  processExcel: async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { excelData } = req.body;

      if (!excelData || !Array.isArray(excelData)) {
        return res.status(400).json({
          success: false,
          error: 'Datos de Excel inválidos'
        });
      }

      const transformedData = await companyMappingService.processExcelWithMapping(
        parseInt(companyId),
        excelData
      );

      res.json({
        success: true,
        data: transformedData,
        count: transformedData.length
      });
    } catch (error) {
      console.error('Error al procesar Excel:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar el archivo Excel'
      });
    }
  }
};