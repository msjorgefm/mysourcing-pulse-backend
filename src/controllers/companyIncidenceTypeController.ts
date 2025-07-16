import { Request, Response } from 'express';
import { companyIncidenceTypeService } from '../services/companyIncidenceTypeService';

export const companyIncidenceTypeController = {
  async getByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId || isNaN(parseInt(companyId))) {
        return res.status(400).json({
          success: false,
          error: 'ID de empresa inválido'
        });
      }

      const types = await companyIncidenceTypeService.getByCompany(parseInt(companyId));
      
      res.json({
        success: true,
        data: types
      });
    } catch (error: any) {
      console.error('Error in getByCompany:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener tipos de incidencia'
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { codigo, nombre, tipo, descripcion, activo } = req.body;
      
      if (!companyId || isNaN(parseInt(companyId))) {
        return res.status(400).json({
          success: false,
          error: 'ID de empresa inválido'
        });
      }

      if (!codigo || !nombre || !tipo) {
        return res.status(400).json({
          success: false,
          error: 'Código, nombre y tipo son requeridos'
        });
      }

      if (!['DEDUCCION', 'PERCEPCION'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo debe ser DEDUCCION o PERCEPCION'
        });
      }

      const type = await companyIncidenceTypeService.create(
        parseInt(companyId),
        { codigo, nombre, tipo, descripcion, activo }
      );
      
      res.status(201).json({
        success: true,
        data: type
      });
    } catch (error: any) {
      console.error('Error in create:', error);
      
      if (error.message.includes('Ya existe')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error al crear tipo de incidencia'
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { typeId } = req.params;
      const data = req.body;
      
      if (!typeId || isNaN(parseInt(typeId))) {
        return res.status(400).json({
          success: false,
          error: 'ID de tipo inválido'
        });
      }

      if (data.tipo && !['DEDUCCION', 'PERCEPCION'].includes(data.tipo)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo debe ser DEDUCCION o PERCEPCION'
        });
      }

      const type = await companyIncidenceTypeService.update(
        parseInt(typeId),
        data
      );
      
      res.json({
        success: true,
        data: type
      });
    } catch (error: any) {
      console.error('Error in update:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al actualizar tipo de incidencia'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { typeId } = req.params;
      
      if (!typeId || isNaN(parseInt(typeId))) {
        return res.status(400).json({
          success: false,
          error: 'ID de tipo inválido'
        });
      }

      await companyIncidenceTypeService.delete(parseInt(typeId));
      
      res.json({
        success: true,
        message: 'Tipo de incidencia eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error in delete:', error);
      
      if (error.message.includes('No se puede eliminar')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error al eliminar tipo de incidencia'
      });
    }
  },

  async saveTemplate(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { nombre, headerRow, columnMappings, types } = req.body;
      
      if (!companyId || isNaN(parseInt(companyId))) {
        return res.status(400).json({
          success: false,
          error: 'ID de empresa inválido'
        });
      }

      if (!nombre || !headerRow || !columnMappings || !types) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos'
        });
      }

      const result = await companyIncidenceTypeService.saveTemplate(
        parseInt(companyId),
        {
          nombre,
          headerRow,
          columnMappings,
          incidenceTypes: types
        }
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error in saveTemplate:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al guardar plantilla'
      });
    }
  },

  async getTemplate(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId || isNaN(parseInt(companyId))) {
        return res.status(400).json({
          success: false,
          error: 'ID de empresa inválido'
        });
      }

      const template = await companyIncidenceTypeService.getTemplate(parseInt(companyId));
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'No se encontró plantilla para esta empresa'
        });
      }
      
      res.json({
        success: true,
        data: template
      });
    } catch (error: any) {
      console.error('Error in getTemplate:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener plantilla'
      });
    }
  }
};