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

export default router;