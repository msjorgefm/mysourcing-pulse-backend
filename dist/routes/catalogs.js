"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalogsController_1 = require("../controllers/catalogsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Obtener regímenes fiscales
router.get('/catalogs/tax-regimes', async (req, res, next) => {
    try {
        await catalogsController_1.CatalogsController.getTaxRegimes(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Obtener actividades económicas
router.get('/catalogs/economic-activities', async (req, res, next) => {
    try {
        await catalogsController_1.CatalogsController.getEconomicActivities(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=catalogs.js.map