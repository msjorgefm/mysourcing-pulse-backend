"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeValidation = exports.createEmployeeValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createEmployeeValidation = joi_1.default.object({
    employeeNumber: joi_1.default.string().min(1).max(20).required(),
    name: joi_1.default.string().min(2).max(255).required(),
    email: joi_1.default.string().email().required(),
    rfc: joi_1.default.string().min(12).max(13).required(),
    position: joi_1.default.string().min(2).max(100).required(),
    department: joi_1.default.string().min(2).max(100).required(),
    salary: joi_1.default.number().positive().required(),
    hireDate: joi_1.default.date().iso().required(),
    companyId: joi_1.default.number().integer().positive().required(),
    bankName: joi_1.default.string().max(100).optional(),
    accountNumber: joi_1.default.string().max(20).optional(),
    clabe: joi_1.default.string().length(18).optional()
});
exports.updateEmployeeValidation = joi_1.default.object({
    employeeNumber: joi_1.default.string().min(1).max(20).optional(),
    name: joi_1.default.string().min(2).max(255).optional(),
    email: joi_1.default.string().email().optional(),
    rfc: joi_1.default.string().min(12).max(13).optional(),
    position: joi_1.default.string().min(2).max(100).optional(),
    department: joi_1.default.string().min(2).max(100).optional(),
    salary: joi_1.default.number().positive().optional(),
    hireDate: joi_1.default.date().iso().optional(),
    bankName: joi_1.default.string().max(100).optional(),
    accountNumber: joi_1.default.string().max(20).optional(),
    clabe: joi_1.default.string().length(18).optional()
});
//# sourceMappingURL=employeeValidation.js.map