import { Router } from 'express';
import { employeeController } from '../controllers/employeeController';
import { validateEmployeeParams } from '../middleware/validation';

const router = Router();

// GET /api/employees/company/:companyId
router.get('/company/:companyId', 
  validateEmployeeParams,
  employeeController.getEmployeesByCompany
);

// POST /api/employees
router.post('/', employeeController.createEmployee);

// PUT /api/employees/:id
router.put('/:id', employeeController.updateEmployee);

// DELETE /api/employees/:id
router.delete('/:id', employeeController.deleteEmployee);

// GET /api/employees/:id/incidences
router.get('/:id/incidences', async (req, res) => {
  // Implementar obtener incidencias de un empleado específico
});

export default router;