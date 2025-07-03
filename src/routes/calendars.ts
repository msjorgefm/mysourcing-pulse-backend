import { Router, Request, Response, NextFunction } from 'express';
import { calendarController } from '../controllers/calendarController';
import {
  validateCalendarParams,
  validateCalendarQuery,
  validatePeriodParams,
  validateGeneratePeriods,
} from '../middleware/validation';

const router = Router();

// Calendar routes
router.get(
  '/company/:companyId',
  validateCalendarParams,
  calendarController.getCalendarsByCompany
);

router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.createCalendar(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.getCalendarById(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.updateCalendar(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.deleteCalendar(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Period routes
router.get(
  '/:calendarId/periods',
  validateCalendarParams,
  validateCalendarQuery,
  calendarController.getCalendarPeriods
);

router.get(
  '/:calendarId/periods/active',
  validateCalendarParams,
  calendarController.getActivePeriods
);

router.get(
  '/:calendarId/periods/current',
  validateCalendarParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.getCurrentPeriod(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:calendarId/periods',
  validateCalendarParams,
  validatePeriodParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.createPeriod(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:calendarId/periods/:periodId',
  validateCalendarParams,
  validatePeriodParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.updatePeriod(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:calendarId/periods/:periodId',
  validateCalendarParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.deletePeriod(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Generate periods
router.post(
  '/:calendarId/generate-periods',
  validateCalendarParams,
  validateGeneratePeriods,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.generatePeriods(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
