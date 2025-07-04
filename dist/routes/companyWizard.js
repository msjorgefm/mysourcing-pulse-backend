"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyWizardController_1 = require("../controllers/companyWizardController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Inicializar wizard para una empresa
router.post('/companies/:companyId/wizard/initialize', async (req, res, next) => {
    try {
        await companyWizardController_1.CompanyWizardController.initializeWizard(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Obtener estado del wizard
router.get('/companies/:companyId/wizard/status', async (req, res, next) => {
    try {
        await companyWizardController_1.CompanyWizardController.getWizardStatus(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Actualizar paso del wizard
router.put('/companies/:companyId/wizard/section/:sectionNumber/step/:stepNumber', async (req, res, next) => {
    try {
        await companyWizardController_1.CompanyWizardController.updateWizardStep(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Obtener datos específicos de una sección
router.get('/companies/:companyId/wizard/section/:sectionNumber/data', async (req, res, next) => {
    try {
        await companyWizardController_1.CompanyWizardController.getSectionData(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Saltar sección opcional
router.put('/companies/:companyId/wizard/section/:sectionNumber/skip', async (req, res, next) => {
    try {
        await companyWizardController_1.CompanyWizardController.skipSection(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Completar wizard
router.post('/companies/:companyId/wizard/complete', async (req, res, next) => {
    try {
        await companyWizardController_1.CompanyWizardController.completeWizard(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=companyWizard.js.map