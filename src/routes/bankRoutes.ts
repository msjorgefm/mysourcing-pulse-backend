import { Router } from 'express';
import { bankController } from '../controllers/bankController';

const router = Router();

// GET /api/banks - Obtener catálogo de bancos
router.get('/', async (req, res, next) => {
  try {
    await bankController.getAll(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/banks/search - Buscar bancos por nombre
router.get('/search', async (req, res, next) => {
  try {
    await bankController.search(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;