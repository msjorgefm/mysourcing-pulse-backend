"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incidenceController_1 = require("../controllers/incidenceController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/', validation_1.validateIncidenceParams, (req, res) => incidenceController_1.incidenceController.getIncidencesByPeriod(req, res));
router.post('/', async (req, res, next) => {
    try {
        await incidenceController_1.incidenceController.createIncidence(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        await incidenceController_1.incidenceController.updateIncidence(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await incidenceController_1.incidenceController.deleteIncidence(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/stats', async (req, res, next) => {
    try {
        await incidenceController_1.incidenceController.getIncidenceStats(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/export', async (req, res) => {
    // Implementar exportación de incidencias
});
exports.default = router;
//# sourceMappingURL=incidences.js.map