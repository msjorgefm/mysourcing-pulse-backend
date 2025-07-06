import { Router } from 'express';
import { postalCodeController } from '../controllers/postalCodeController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Buscar códigos postales
router.get('/search', async (req, res, next) => {
  try {
    await postalCodeController.search(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener información de un código postal específico
router.get('/:postalCode', async (req, res, next) => {
  try {
    await postalCodeController.getByCode(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener colonias de un código postal
router.get('/:postalCode/neighborhoods', async (req, res, next) => {
  try {
    await postalCodeController.getNeighborhoods(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;