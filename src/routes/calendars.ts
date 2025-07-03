import { Router } from 'express';
import { calendarController } from '../controllers/calendarController';
import { validateCalendarParams, validatePeriodParams } from '../middleware/validation';

const router = Router();

// GET /api/calendars/company/:companyId
router.get('/company/:companyId', 
  validateCalendarParams,
  calendarController.getCalendarsByCompany
);

// POST /api/calendars
router.post('/', calendarController.createCalendar);

// PUT /api/calendars/:id
router.put('/:id', calendarController.updateCalendar);

// DELETE /api/calendars/:id
router.delete('/:id', calendarController.deleteCalendar);

// GET /api/calendars/:id
router.get('/:id', calendarController.getCalendarById);

// GET /api/calendars/:calendarId/periods
router.get('/:calendarId/periods', 
  validateCalendarParams,
  calendarController.getCalendarPeriods
);

// GET /api/calendars/:calendarId/periods/active
router.get('/:calendarId/periods/active', 
  validateCalendarParams,
  calendarController.getActivePeriods
);

// POST /api/calendars/:calendarId/periods
router.post('/:calendarId/periods', 
  validatePeriodParams,
  calendarController.createPeriod
);

// PUT /api/calendars/:calendarId/periods/:periodId
router.put('/:calendarId/periods/:periodId', 
  validatePeriodParams,
  calendarController.updatePeriod
);

// DELETE /api/calendars/:calendarId/periods/:periodId
router.delete('/:calendarId/periods/:periodId', 
  calendarController.deletePeriod
);

// GET /api/calendars/:calendarId/periods/current
router.get('/:calendarId/periods/current', 
  validateCalendarParams,
  calendarController.getCurrentPeriod
);

// POST /api/calendars/:calendarId/generate-periods
router.post('/:calendarId/generate-periods', 
  calendarController.generatePeriods
);

export default router;