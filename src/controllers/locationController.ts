import { Request, Response } from 'express';
import { locationService } from '../services/locationService';

export const locationController = {
  // Get all states
  async getStates(req: Request, res: Response): Promise<void> {
    try {
      const states = await locationService.getStates();
      res.json({
        success: true,
        data: states
      });
    } catch (error) {
      console.error('Error getting states:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los estados'
      });
    }
  },

  // Get municipios by state
  async getMunicipios(req: Request, res: Response): Promise<void> {
    try {
      const { stateCode } = req.params;
      const municipios = await locationService.getMunicipiosByState(stateCode);
      res.json({
        success: true,
        data: municipios
      });
    } catch (error) {
      console.error('Error getting municipios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los municipios'
      });
    }
  },

  // Get ciudades by municipio
  async getCiudades(req: Request, res: Response): Promise<void> {
    try {
      const { municipioCode } = req.params;
      const ciudades = await locationService.getCiudadesByMunicipio(municipioCode);
      res.json({
        success: true,
        data: ciudades.map((c: any) => c.name)
      });
    } catch (error) {
      console.error('Error getting ciudades:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las ciudades'
      });
    }
  },

  // Get colonias by municipio and ciudad
  async getColonias(req: Request, res: Response): Promise<void> {
    try {
      const { municipioCode } = req.params;
      const { cityName } = req.query;

      if (!cityName || typeof cityName !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El nombre de la ciudad es requerido'
        });
        return;
      }

      const colonias = await locationService.getColoniasByMunicipioAndCiudad(municipioCode, cityName);
      res.json({
        success: true,
        data: colonias
      });
    } catch (error) {
      console.error('Error getting colonias:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las colonias'
      });
    }
  },

  // Get location by postal code
  async getLocationByPostalCode(req: Request, res: Response): Promise<void> {
    try {
      const { postalCode } = req.params;

      if (!postalCode || postalCode.length !== 5) {
        res.status(400).json({
          success: false,
          message: 'Código postal inválido'
        });
        return;
      }

      const location = await locationService.getLocationByPostalCode(postalCode);

      if (!location) {
        res.status(404).json({
          success: false,
          message: 'No se encontró información para este código postal'
        });
        return;
      }

      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Error getting location by postal code:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la información del código postal'
      });
    }
  }
};