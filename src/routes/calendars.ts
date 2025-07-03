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
// GET /api/calendars
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await calendarController.getAllCalendars(req, res);
  } catch (err) {
    next(err);
  }
});

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

// Calendar utility routes
router.get(
  '/:calendarId/info',
  validateCalendarParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.getCalendarInfo(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:calendarId/working-days',
  validateCalendarParams,
  validateCalendarQuery,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.getWorkingDaysInMonth(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:calendarId/is-working-day',
  validateCalendarParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.checkWorkingDay(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:calendarId/holidays',
  validateCalendarParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.addHoliday(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:calendarId/work-days',
  validateCalendarParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.updateWorkDays(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:calendarId/holidays',
  validateCalendarParams,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.removeHoliday(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Calendar statistics
router.get(
  '/:calendarId/stats',
  validateCalendarParams,
  validateCalendarQuery,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calendarController.getCalendarStats(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
