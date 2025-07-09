import { Router } from 'express';
import employeeRoutes from './employees';
import incidenceRoutes from './incidences';
import calendarRoutes from './calendars';
import companyWizardRoutes from './companyWizard';
import postalCodeRoutes from './postalCodeRoutes';
import stateRoutes from './stateRoutes';
import locationRoutes from './locations';
import companyRoutes from './companies';
import bankRoutes from './bankRoutes';
import payrollRoutes from './payrolls';
import notificationRoutes from './notifications';
import uploadRoutes from './upload';
import catalogRoutes from './catalogs';
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
router.use('/companies', companyRoutes);
router.use('/employees', employeeRoutes);
router.use('/payrolls', payrollRoutes);
router.use('/calendars', calendarRoutes);
router.use('/incidences', incidenceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/postal-codes', postalCodeRoutes);
router.use('/states', stateRoutes);
router.use('/locations', locationRoutes);
router.use('/banks', bankRoutes);

// Rutas que se montan en la raíz de /api
router.use('/', uploadRoutes);
router.use('/', catalogRoutes);
router.use('/', companyWizardRoutes);

export default router;