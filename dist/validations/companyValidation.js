"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyValidation = exports.createCompanyValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCompanyValidation = joi_1.default.object({
    name: joi_1.default.string().min(2).max(255).required(),
    rfc: joi_1.default.string().min(12).max(13).required(),
    legalName: joi_1.default.string().min(2).max(255).required(),
    address: joi_1.default.string().min(10).max(500).required(),
    email: joi_1.default.string().email().required(),
    phone: joi_1.default.string().pattern(/^[0-9\-\+\(\)\s]+$/).optional(),
    status: joi_1.default.string().valid('En Configuración', 'Configurada', 'Activa', 'Inactiva').optional(),
    paymentMethod: joi_1.default.string().max(100).optional(),
    bankAccount: joi_1.default.string().max(100).optional()
});
exports.updateCompanyValidation = joi_1.default.object({
    name: joi_1.default.string().min(2).max(255).optional(),
    rfc: joi_1.default.string().min(12).max(13).optional(),
    legalName: joi_1.default.string().min(2).max(255).optional(),
    address: joi_1.default.string().min(10).max(500).optional(),
    email: joi_1.default.string().email().optional(),
    phone: joi_1.default.string().pattern(/^[0-9\-\+\(\)\s]+$/).optional(),
    status: joi_1.default.string().valid('En Configuración', 'Configurada', 'Activa', 'Inactiva').optional(),
    paymentMethod: joi_1.default.string().max(100).optional(),
    bankAccount: joi_1.default.string().max(100).optional()
});
//# sourceMappingURL=companyValidation.js.map