import { Router } from 'express';
import { incidenceController } from '../controllers/incidenceController';
import { validateIncidenceParams } from '../middleware/validation';

const router = Router();

router.get('/', 
  validateIncidenceParams,
  (req, res) => incidenceController.getIncidencesByPeriod(req, res)
);

router.post('/', async (req, res, next) => {
  try {
    await incidenceController.createIncidence(req, res);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await incidenceController.updateIncidence(req, res);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await incidenceController.deleteIncidence(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    await incidenceController.getIncidenceStats(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/export', async (req, res) => {
  // Implementar exportación de incidencias
});


export default router;