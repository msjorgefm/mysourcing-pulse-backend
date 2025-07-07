import { Router } from 'express';
import { stateController } from '../controllers/stateController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todos los estados
router.get('/', async (req, res, next) => {
  try {
    await stateController.getAllStates(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener un estado por código
router.get('/:code', async (req, res, next) => {
  try {
    await stateController.getStateByCode(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;