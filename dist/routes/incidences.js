"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incidenceController_1 = require("../controllers/incidenceController");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const { companyId, periodStart, periodEnd } = req.query;
        // Si hay parámetros de filtro, usar getIncidencesByPeriod
        if (companyId && periodStart && periodEnd) {
            await incidenceController_1.incidenceController.getIncidencesByPeriod(req, res);
        }
        else {
            // Si no hay filtros, obtener todas las incidencias
            await incidenceController_1.incidenceController.getAllIncidences(req, res);
        }
    }
    catch (err) {
        next(err);
    }
});
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