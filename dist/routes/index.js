"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employees_1 = __importDefault(require("./employees"));
const incidences_1 = __importDefault(require("./incidences"));
const calendars_1 = __importDefault(require("./calendars"));
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
router.use('/employees', employees_1.default);
router.use('/incidences', incidences_1.default);
router.use('/calendars', calendars_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map