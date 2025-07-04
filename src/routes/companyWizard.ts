import { Router } from 'express';
import { CompanyWizardController } from '../controllers/companyWizardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Inicializar wizard para una empresa
router.post('/companies/:companyId/wizard/initialize', async (req, res, next) => {
  try {
    await CompanyWizardController.initializeWizard(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener estado del wizard
router.get('/companies/:companyId/wizard/status', async (req, res, next) => {
  try {
    await CompanyWizardController.getWizardStatus(req, res);
  } catch (err) {
    next(err);
  }
});

// Actualizar paso del wizard
router.put('/companies/:companyId/wizard/section/:sectionNumber/step/:stepNumber', async (req, res, next) => {
  try {
    await CompanyWizardController.updateWizardStep(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener datos específicos de una sección
router.get('/companies/:companyId/wizard/section/:sectionNumber/data', async (req, res, next) => {
  try {
    await CompanyWizardController.getSectionData(req, res);
  } catch (err) {
    next(err);
  }
});

// Saltar sección opcional
router.put('/companies/:companyId/wizard/section/:sectionNumber/skip', async (req, res, next) => {
  try {
    await CompanyWizardController.skipSection(req, res);
  } catch (err) {
    next(err);
  }
});

// Completar wizard
router.post('/companies/:companyId/wizard/complete', async (req, res, next) => {
  try {
    await CompanyWizardController.completeWizard(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;