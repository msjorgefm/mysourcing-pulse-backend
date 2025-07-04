import { Router } from 'express';
import employeeRoutes from './employees';
import incidenceRoutes from './incidences';
import calendarRoutes from './calendars';
import companyWizardRoutes from './companyWizard';
import { authenticate } from '../middleware/auth';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'MySourcing Pulse Backend'
  });
});

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Rutas principales
router.use('/employees', employeeRoutes);
router.use('/incidences', incidenceRoutes);
router.use('/calendars', calendarRoutes);
router.use('/', companyWizardRoutes); // Las rutas del wizard ya incluyen el prefijo completo

export default router;