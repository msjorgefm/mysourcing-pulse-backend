import express from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Todas las rutas requieren autenticación y rol ADMIN
router.use(authenticate as any);
router.use(authorize(['ADMIN']) as any);

// Obtener dashboard del administrador
router.get('/dashboard', async (req, res, next) => {
  try {
    await AdminController.getAdminDashboard(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener todos los operadores con sus empresas asignadas
router.get('/operators', async (req, res, next) => {
  try {
    await AdminController.getOperatorsWithCompanies(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener detalles de una empresa específica con clientes y trabajadores
router.get('/companies/:companyId', async (req, res, next) => {
  try {
    await AdminController.getCompanyDetails(req, res);
  } catch (err) {
    next(err);
  }
});

// Crear nuevo operador
router.post('/operators/create', async (req, res, next) => {
  try {
    await AdminController.createOperator(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener empresas disponibles para un operador
router.get('/operators/:operatorId/available-companies', async (req, res, next) => {
  try {
    await AdminController.getAvailableCompaniesForOperator(req, res);
  } catch (err) {
    next(err);
  }
});

// Asignar operador a empresa
router.post('/operators/assign', async (req, res, next) => {
  try {
    await AdminController.assignOperatorToCompany(req, res);
  } catch (err) {
    next(err);
  }
});

// Remover operador de empresa
router.delete('/operators/:operatorId/companies/:companyId', async (req, res, next) => {
  try {
    await AdminController.removeOperatorFromCompany(req, res);
  } catch (err) {
    next(err);
  }
});

// Ruta legacy - mantener por compatibilidad
router.get('/operators-overview', async (req, res, next) => {
  try {
    await AdminController.getOperatorsWithCompanies(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;