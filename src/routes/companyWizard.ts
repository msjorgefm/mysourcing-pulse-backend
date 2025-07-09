import { Router } from 'express';
import { CompanyWizardController } from '../controllers/companyWizardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Inicializar wizard para una empresa
router.post('/:companyId/wizard/initialize', async (req, res, next) => {
  try {
    await CompanyWizardController.initializeWizard(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener estado del wizard
router.get('/:companyId/wizard/status', async (req, res, next) => {
  try {
    await CompanyWizardController.getWizardStatus(req, res);
  } catch (err) {
    next(err);
  }
});

// Actualizar paso del wizard
router.put('/:companyId/wizard/section/:sectionNumber/step/:stepNumber', async (req, res, next) => {
  try {
    await CompanyWizardController.updateWizardStep(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener datos específicos de una sección
router.get('/:companyId/wizard/section/:sectionNumber/data', async (req, res, next) => {
  try {
    await CompanyWizardController.getSectionData(req, res);
  } catch (err) {
    next(err);
  }
});

// Saltar sección opcional
router.put('/:companyId/wizard/section/:sectionNumber/skip', async (req, res, next) => {
  try {
    await CompanyWizardController.skipSection(req, res);
  } catch (err) {
    next(err);
  }
});

// Completar wizard
router.post('/:companyId/wizard/complete', async (req, res, next) => {
  try {
    await CompanyWizardController.completeWizard(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener todas las áreas de una empresa
router.get('/companies/:companyId/areas', async (req, res, next) => {
  try {
    await CompanyWizardController.getCompanyAreas(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener todos los departamentos de una empresa (opcionalmente filtrados por área)
router.get('/companies/:companyId/departamentos', async (req, res, next) => {
  try {
    await CompanyWizardController.getCompanyDepartamentos(req, res);
  } catch (err) {
    next(err);
  }
});

// Eliminar un área
router.delete('/companies/:companyId/areas/:areaId', async (req, res, next) => {
  try {
    await CompanyWizardController.deleteArea(req, res);
  } catch (err) {
    next(err);
  }
});

// Eliminar un departamento
router.delete('/companies/:companyId/departamentos/:departamentoId', async (req, res, next) => {
  try {
    await CompanyWizardController.deleteDepartamento(req, res);
  } catch (err) {
    next(err);
  }
});

// Eliminar un puesto
router.delete('/companies/:companyId/puestos/:puestoId', async (req, res, next) => {
  try {
    await CompanyWizardController.deletePuesto(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;