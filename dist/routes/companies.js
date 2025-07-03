"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controllers/companyController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Rutas para empresas
router.get('/', async (req, res, next) => {
    try {
        await companyController_1.CompanyController.getAllCompanies(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        await companyController_1.CompanyController.getCompanyById(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id/stats', async (req, res, next) => {
    try {
        await companyController_1.CompanyController.getCompanyStats(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Solo operadores pueden crear, actualizar y eliminar empresas
router.post('/', (0, auth_1.authorize)(['OPERATOR', 'ADMIN']), async (req, res, next) => {
    try {
        await companyController_1.CompanyController.createCompany(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', (0, auth_1.authorize)(['OPERATOR', 'ADMIN']), async (req, res, next) => {
    try {
        await companyController_1.CompanyController.updateCompany(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', (0, auth_1.authorize)(['OPERATOR', 'ADMIN']), async (req, res, next) => {
    try {
        await companyController_1.CompanyController.deleteCompany(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=companies.js.map