"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payrollController_1 = require("../controllers/payrollController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        await payrollController_1.PayrollController.getAllPayrolls(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/stats', async (req, res, next) => {
    try {
        await payrollController_1.PayrollController.getPayrollStats(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        await payrollController_1.PayrollController.getPayrollById(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Solo operadores pueden crear y calcular nóminas
router.post('/', (0, auth_1.authorize)(['OPERATOR', 'ADMIN']), async (req, res, next) => {
    try {
        await payrollController_1.PayrollController.createPayroll(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.post('/:id/calculate', (0, auth_1.authorize)(['OPERATOR', 'ADMIN']), async (req, res, next) => {
    try {
        await payrollController_1.PayrollController.calculatePayroll(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.post('/:id/send-authorization', (0, auth_1.authorize)(['OPERATOR', 'ADMIN']), async (req, res, next) => {
    try {
        await payrollController_1.PayrollController.sendForAuthorization(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Solo clientes pueden autorizar nóminas
router.post('/:id/authorize', (0, auth_1.authorize)(['CLIENT', 'ADMIN']), async (req, res, next) => {
    try {
        await payrollController_1.PayrollController.authorizePayroll(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=payrolls.js.map