"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testController_1 = require("../controllers/testController");
const router = (0, express_1.Router)();
// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
    // Generar invitación de prueba
    router.post('/invitation', async (req, res) => {
        await testController_1.TestController.testInvitation(req, res);
    });
}
exports.default = router;
//# sourceMappingURL=testRoutes.js.map