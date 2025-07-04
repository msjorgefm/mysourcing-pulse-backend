import express from 'express';
import { CompanyController } from '../controllers/companyController';
import { authenticate, authorize } from '../middleware/auth';
import { CompanyWizardController } from '../controllers/companyWizardController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para empresas
router.get('/', async (req, res, next) => {
  try {
    await CompanyController.getAllCompanies(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    await CompanyController.getCompanyById(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/:id/stats', async (req, res, next) => {
  try {
    await CompanyController.getCompanyStats(req, res);
  } catch (err) {
    next(err);
  }
});
// Solo operadores pueden crear, actualizar y eliminar empresas
router.post('/', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyController.createCompany(req, res);
  } catch (err) {
    next(err);
  }
});
router.put('/:id', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyController.updateCompany(req, res);
  } catch (err) {
    next(err);
  }
});
router.delete('/:id', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyController.deleteCompany(req, res);
  } catch (err) {
    next(err);
  }
});

// Rutas del wizard de configuración
router.get('/:companyId/wizard/status', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyWizardController.getWizardStatus(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/:companyId/wizard/section/:sectionNumber/data', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyWizardController.getSectionData(req, res);
  } catch (err) {
    next(err);
  }
});

router.put('/:companyId/wizard/section/:sectionNumber/step/:stepNumber', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyWizardController.updateWizardStep(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/:companyId/wizard/complete', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyWizardController.completeWizard(req, res);
  } catch (err) {
    next(err);
  }
});


export default router;