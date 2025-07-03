import express from 'express';
import { PayrollController } from '../controllers/payrollController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    await PayrollController.getAllPayrolls(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/stats', async (req, res, next) => {
  try {
    await PayrollController.getPayrollStats(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    await PayrollController.getPayrollById(req, res);
  } catch (err) {
    next(err);
  }
});

// Solo operadores pueden crear y calcular nóminas
router.post('/', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await PayrollController.createPayroll(req, res);
  } catch (err) {
    next(err);
  }
});
router.post('/:id/calculate', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await PayrollController.calculatePayroll(req, res);
  } catch (err) {
    next(err);
  }
});
router.post('/:id/send-authorization', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await PayrollController.sendForAuthorization(req, res);
  } catch (err) {
    next(err);
  }
});

// Solo clientes pueden autorizar nóminas
router.post('/:id/authorize', authorize(['CLIENT', 'ADMIN']), async (req, res, next) => {
  try {
    await PayrollController.authorizePayroll(req, res);
  } catch (err) {
    next(err);
  }
});



export default router;