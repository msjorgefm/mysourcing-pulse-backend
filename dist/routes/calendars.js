"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendarController_1 = require("../controllers/calendarController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Calendar routes
router.get('/company/:companyId', validation_1.validateCalendarParams, calendarController_1.calendarController.getCalendarsByCompany);
router.post('/', async (req, res, next) => {
    try {
        await calendarController_1.calendarController.createCalendar(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        await calendarController_1.calendarController.getCalendarById(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        await calendarController_1.calendarController.updateCalendar(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await calendarController_1.calendarController.deleteCalendar(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Period routes
router.get('/:calendarId/periods', validation_1.validateCalendarParams, validation_1.validateCalendarQuery, calendarController_1.calendarController.getCalendarPeriods);
router.get('/:calendarId/periods/active', validation_1.validateCalendarParams, calendarController_1.calendarController.getActivePeriods);
router.get('/:calendarId/periods/current', validation_1.validateCalendarParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.getCurrentPeriod(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.post('/:calendarId/periods', validation_1.validateCalendarParams, validation_1.validatePeriodParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.createPeriod(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:calendarId/periods/:periodId', validation_1.validateCalendarParams, validation_1.validatePeriodParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.updatePeriod(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:calendarId/periods/:periodId', validation_1.validateCalendarParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.deletePeriod(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Generate periods
router.post('/:calendarId/generate-periods', validation_1.validateCalendarParams, validation_1.validateGeneratePeriods, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.generatePeriods(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=calendars.js.map