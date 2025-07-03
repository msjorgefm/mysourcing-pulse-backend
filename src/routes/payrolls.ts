import express from 'express';
import { PayrollController } from '../controllers/payrollController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', PayrollController.getAllPayrolls);
router.get('/stats', PayrollController.getPayrollStats);
router.get('/:id', PayrollController.getPayrollById);

// Solo operadores pueden crear y calcular nóminas
router.post('/', authorize(['OPERATOR', 'ADMIN']), PayrollController.createPayroll);
router.post('/:id/calculate', authorize(['OPERATOR', 'ADMIN']), PayrollController.calculatePayroll);
router.post('/:id/send-authorization', authorize(['OPERATOR', 'ADMIN']), PayrollController.sendForAuthorization);

// Solo clientes pueden autorizar nóminas
router.post('/:id/authorize', authorize(['CLIENT', 'ADMIN']), PayrollController.authorizePayroll);

export default router;