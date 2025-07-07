import { Router } from 'express';
import { CatalogsController } from '../controllers/catalogsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener regímenes fiscales
router.get('/tax-regimes', async (req, res, next) => {
  try {
    await CatalogsController.getTaxRegimes(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener actividades económicas
router.get('/economic-activities', async (req, res, next) => {
  try {
    await CatalogsController.getEconomicActivities(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener tipos de identificación
router.get('/catalogs/identification-types', async (req, res, next) => {
  try {
    await CatalogsController.getIdentificationTypes(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener clases de riesgo IMSS
router.get('/catalogs/imss-risk-classes', async (req, res, next) => {
  try {
    await CatalogsController.getIMSSRiskClasses(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener orígenes de movimiento IMSS
router.get('/catalogs/imss-origen-movimiento', async (req, res, next) => {
  try {
    await CatalogsController.getIMSSOrigenMovimiento(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener delegaciones IMSS
router.get('/catalogs/imss-delegaciones', async (req, res, next) => {
  try {
    await CatalogsController.getIMSSDelegaciones(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener subdelegaciones IMSS
router.get('/catalogs/imss-subdelegaciones', async (req, res, next) => {
  try {
    await CatalogsController.getIMSSSubdelegaciones(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener municipios por estado
router.get('/catalogs/municipios', async (req, res, next) => {
  try {
    await CatalogsController.getMunicipios(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener colonias por código postal
router.get('/catalogs/colonias', async (req, res, next) => {
  try {
    await CatalogsController.getColoniasByPostalCode(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;