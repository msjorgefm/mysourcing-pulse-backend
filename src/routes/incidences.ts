import { Router } from 'express';
import { incidenceController } from '../controllers/incidenceController';
import { validateIncidenceParams } from '../middleware/validation';

const router = Router();

// GET /api/incidences?companyId=&periodStart=&periodEnd=
router.get('/', 
  validateIncidenceParams,
  incidenceController.getIncidencesByPeriod
);

// POST /api/incidences
router.post('/', incidenceController.createIncidence);

// PUT /api/incidences/:id
router.put('/:id', incidenceController.updateIncidence);

// DELETE /api/incidences/:id
router.delete('/:id', incidenceController.deleteIncidence);

// GET /api/incidences/stats
router.get('/stats', incidenceController.getIncidenceStats);

// GET /api/incidences/export
router.get('/export', async (req, res) => {
  // Implementar exportación de incidencias
});

export default router;