import { Router } from 'express';
import { locationController } from '../controllers/locationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All location routes require authentication
router.use(authenticate);

// Get all states
router.get('/states', async (req, res, next) => {
  try {
    await locationController.getStates(req, res);
  } catch (err) {
    next(err);
  }
});

// Get municipios by state
router.get('/states/:stateCode/municipios', async (req, res, next) => {
  try {
    await locationController.getMunicipios(req, res);
  } catch (err) {
    next(err);
  }
});

// Get ciudades by municipio
router.get('/municipios/:municipioCode/ciudades', async (req, res, next) => {
  try {
    await locationController.getCiudades(req, res);
  } catch (err) {
    next(err);
  }
});

// Get colonias by municipio and ciudad
router.get('/municipios/:municipioCode/colonias', async (req, res, next) => {
  try {
    await locationController.getColonias(req, res);
  } catch (err) {
    next(err);
  }
});

// Get location info by postal code
router.get('/postal-code/:postalCode', async (req, res, next) => {
  try {
    await locationController.getLocationByPostalCode(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;