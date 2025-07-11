import { Request, Response } from 'express';
import * as vinculacionJefesService from '../services/vinculacionJefesService';

export const getOrganizationalData = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const data = await vinculacionJefesService.getOrganizationalData(parseInt(companyId));
    res.json(data);
  } catch (error) {
    console.error('Error fetching organizational data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener datos organizacionales' 
    });
  }
};

export const getVinculacionesByCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const vinculaciones = await vinculacionJefesService.getVinculacionesByCompany(parseInt(companyId));
    res.json({
      success: true,
      data: vinculaciones
    });
  } catch (error) {
    console.error('Error fetching vinculaciones:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener vinculaciones de jefes' 
    });
  }
};

export const getVinculacionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vinculacion = await vinculacionJefesService.getVinculacionById(parseInt(id));
    
    if (!vinculacion) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vinculación no encontrada' 
      });
    }
    
    res.json({
      success: true,
      data: vinculacion
    });
  } catch (error) {
    console.error('Error fetching vinculacion:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener vinculación' 
    });
  }
};

export const createVinculacion = async (req: Request, res: Response) => {
  try {
    const vinculacion = await vinculacionJefesService.createVinculacion(req.body);
    res.status(201).json({
      success: true,
      data: vinculacion
    });
  } catch (error) {
    console.error('Error creating vinculacion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al crear vinculación de jefe';
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const updateVinculacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vinculacion = await vinculacionJefesService.updateVinculacion(parseInt(id), req.body);
    
    if (!vinculacion) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vinculación no encontrada' 
      });
    }
    
    res.json({
      success: true,
      data: vinculacion
    });
  } catch (error) {
    console.error('Error updating vinculacion:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar vinculación' 
    });
  }
};

export const deleteVinculacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await vinculacionJefesService.deleteVinculacion(parseInt(id));
    res.json({
      success: true,
      message: 'Vinculación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting vinculacion:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar vinculación' 
    });
  }
};

export const getEmpleadosACargo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empleados = await vinculacionJefesService.getEmpleadosACargo(parseInt(id));
    res.json({
      success: true,
      data: empleados
    });
  } catch (error) {
    console.error('Error fetching empleados a cargo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener empleados a cargo' 
    });
  }
};