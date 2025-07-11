// src/routes/payrollCalendars.ts
import { Router, Request, Response, NextFunction } from 'express';
import { payrollCalendarController } from '../controllers/payrollCalendarController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// GET /api/payroll-calendars
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await payrollCalendarController.getAllPayrollCalendars(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/payroll-calendars/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await payrollCalendarController.getPayrollCalendarById(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/payroll-calendars
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await payrollCalendarController.createPayrollCalendar(req, res);
  } catch (err) {
    next(err);
  }
});

// PUT /api/payroll-calendars/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await payrollCalendarController.updatePayrollCalendar(req, res);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/payroll-calendars/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await payrollCalendarController.deletePayrollCalendar(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;