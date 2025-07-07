"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employees_1 = __importDefault(require("./employees"));
const incidences_1 = __importDefault(require("./incidences"));
const calendars_1 = __importDefault(require("./calendars"));
const companyWizard_1 = __importDefault(require("./companyWizard"));
const postalCodeRoutes_1 = __importDefault(require("./postalCodeRoutes"));
const stateRoutes_1 = __importDefault(require("./stateRoutes"));
const companies_1 = __importDefault(require("./companies"));
const payrolls_1 = __importDefault(require("./payrolls"));
const notifications_1 = __importDefault(require("./notifications"));
const upload_1 = __importDefault(require("./upload"));
const catalogs_1 = __importDefault(require("./catalogs"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'MySourcing Pulse Backend'
    });
});
// Aplicar autenticación a todas las rutas
router.use(auth_1.authenticate);
// Rutas principales
router.use('/companies', companies_1.default);
router.use('/employees', employees_1.default);
router.use('/payrolls', payrolls_1.default);
router.use('/calendars', calendars_1.default);
router.use('/incidences', incidences_1.default);
router.use('/notifications', notifications_1.default);
router.use('/postal-codes', postalCodeRoutes_1.default);
router.use('/states', stateRoutes_1.default);
// Rutas que se montan en la raíz de /api
router.use('/', upload_1.default);
router.use('/', catalogs_1.default);
router.use('/', companyWizard_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map