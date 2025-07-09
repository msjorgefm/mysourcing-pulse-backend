"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const onboardingController_1 = require("../controllers/onboardingController");
const router = (0, express_1.Router)();
// Validar token de invitación
router.get('/validate-token', async (req, res) => {
    await onboardingController_1.OnboardingController.validateInvitationToken(req, res);
});
// Configurar acceso del cliente
router.post('/setup-access', async (req, res) => {
    await onboardingController_1.OnboardingController.setupClientAccess(req, res);
});
// Reenviar invitación (requiere autenticación de operador)
router.post('/resend-invitation/:companyId', async (req, res) => {
    await onboardingController_1.OnboardingController.resendInvitation(req, res);
});
exports.default = router;
//# sourceMappingURL=onboardingRoutes.js.map