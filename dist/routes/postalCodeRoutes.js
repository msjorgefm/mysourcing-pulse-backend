"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postalCodeController_1 = require("../controllers/postalCodeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Buscar códigos postales
router.get('/search', async (req, res, next) => {
    try {
        await postalCodeController_1.postalCodeController.search(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Obtener información de un código postal específico
router.get('/:postalCode', async (req, res, next) => {
    try {
        await postalCodeController_1.postalCodeController.getByCode(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Obtener colonias de un código postal
router.get('/:postalCode/neighborhoods', async (req, res, next) => {
    try {
        await postalCodeController_1.postalCodeController.getNeighborhoods(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=postalCodeRoutes.js.map