import { Router } from 'express';
import { incidenceController } from '../controllers/incidenceController';
// import { validateIncidenceParams } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { companyId, periodStart, periodEnd } = req.query;
    
    // Si hay parámetros de filtro, usar getIncidencesByPeriod
    if (companyId && periodStart && periodEnd) {
      await incidenceController.getIncidencesByPeriod(req, res);
    } else {
      // Si no hay filtros, obtener todas las incidencias
      await incidenceController.getAllIncidences(req, res);
    }
  } catch (err) {
    next(err);
  }
});

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

// Ruta para carga masiva de incidencias
router.post('/bulk', async (req, res, next) => {
  try {
    // Usar el controlador personalizado de incidencias
    const { IncidenciasController } = await import('../controllers/incidenciasController');
    await IncidenciasController.createBulkIncidencias(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;