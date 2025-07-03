import express from 'express';
import { CompanyController } from '../controllers/companyController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para empresas
router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getCompanyById);
router.get('/:id/stats', CompanyController.getCompanyStats);

// Solo operadores pueden crear, actualizar y eliminar empresas
router.post('/', authorize(['OPERATOR', 'ADMIN']), CompanyController.createCompany);
router.put('/:id', authorize(['OPERATOR', 'ADMIN']), CompanyController.updateCompany);
router.delete('/:id', authorize(['OPERATOR', 'ADMIN']), CompanyController.deleteCompany);

export default router;