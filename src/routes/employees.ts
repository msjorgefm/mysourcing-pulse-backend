import { Router } from 'express';
import { employeeController } from '../controllers/employeeController';
import { validateEmployeeParams } from '../middleware/validation';

const router = Router();

// GET /api/employees
router.get('/', async (req, res, next) => {
  try {
    await employeeController.getAllEmployees(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/company/:companyId
router.get('/company/:companyId', 
  validateEmployeeParams,
  employeeController.getEmployeesByCompany
);

// POST /api/employees
router.post('/', async (req, res, next) => {
  try {
    await employeeController.createEmployee(req, res);
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res, next) => {
  try {
    await employeeController.updateEmployee(req, res);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await employeeController.deleteEmployee(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id/incidences
router.get('/:id/incidences', async (req, res, next) => {
  try {
    // Implementar obtener incidencias de un empleado específico
    //await employeeController.getEmployeeIncidences(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/employees/company/:companyId/validate
router.post('/company/:companyId/validate', async (req, res, next) => {
  try {
    await employeeController.validateBulkEmployees(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/employees/company/:companyId/bulk
router.post('/company/:companyId/bulk', async (req, res, next) => {
  try {
    await employeeController.createBulkEmployees(req, res);
  } catch (err) {
    next(err);
  }
});


export default router;