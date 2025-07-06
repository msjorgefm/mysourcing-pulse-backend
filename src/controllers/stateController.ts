import { Request, Response } from 'express';
import { StateService } from '../services/stateService';

export const stateController = {
  /**
   * Obtiene todos los estados
   * GET /api/states
   */
  async getAllStates(req: Request, res: Response) {
    try {
      const states = await StateService.getAllStates();
      
      return res.json({
        success: true,
        data: states
      });
    } catch (error) {
      console.error('Error getting states:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener los estados'
      });
    }
  },

  /**
   * Obtiene un estado por su código
   * GET /api/states/:code
   */
  async getStateByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'El código del estado es requerido'
        });
      }

      const state = await StateService.getStateByCode(code);
      
      if (!state) {
        return res.status(404).json({
          success: false,
          message: 'Estado no encontrado'
        });
      }

      return res.json({
        success: true,
        data: state
      });
    } catch (error) {
      console.error('Error getting state:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el estado'
      });
    }
  }
};