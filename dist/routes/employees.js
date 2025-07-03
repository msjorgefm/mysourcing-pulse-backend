"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../controllers/employeeController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// GET /api/employees/company/:companyId
router.get('/company/:companyId', validation_1.validateEmployeeParams, employeeController_1.employeeController.getEmployeesByCompany);
// POST /api/employees
router.post('/', async (req, res, next) => {
    try {
        await employeeController_1.employeeController.createEmployee(req, res);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/employees/:id
router.put('/:id', async (req, res, next) => {
    try {
        await employeeController_1.employeeController.updateEmployee(req, res);
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/employees/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await employeeController_1.employeeController.deleteEmployee(req, res);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/employees/:id/incidences
router.get('/:id/incidences', async (req, res, next) => {
    try {
        // Implementar obtener incidencias de un empleado específico
        //await employeeController.getEmployeeIncidences(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=employees.js.map