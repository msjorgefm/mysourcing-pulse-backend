"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendarController_1 = require("../controllers/calendarController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Calendar routes
// GET /api/calendars
router.get('/', async (req, res, next) => {
    try {
        await calendarController_1.calendarController.getAllCalendars(req, res);
    }
    catch (err) {
        next(err);
    }
});
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
// Calendar utility routes
router.get('/:calendarId/info', validation_1.validateCalendarParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.getCalendarInfo(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:calendarId/working-days', validation_1.validateCalendarParams, validation_1.validateCalendarQuery, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.getWorkingDaysInMonth(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:calendarId/is-working-day', validation_1.validateCalendarParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.checkWorkingDay(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.post('/:calendarId/holidays', validation_1.validateCalendarParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.addHoliday(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:calendarId/work-days', validation_1.validateCalendarParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.updateWorkDays(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:calendarId/holidays', validation_1.validateCalendarParams, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.removeHoliday(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Calendar statistics
router.get('/:calendarId/stats', validation_1.validateCalendarParams, validation_1.validateCalendarQuery, async (req, res, next) => {
    try {
        await calendarController_1.calendarController.getCalendarStats(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=calendars.js.map