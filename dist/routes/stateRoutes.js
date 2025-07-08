"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stateController_1 = require("../controllers/stateController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Obtener todos los estados
router.get('/', async (req, res, next) => {
    try {
        await stateController_1.stateController.getAllStates(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Obtener un estado por código
router.get('/:code', async (req, res, next) => {
    try {
        await stateController_1.stateController.getStateByCode(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=stateRoutes.js.map