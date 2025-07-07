"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidation = exports.loginValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginValidation = joi_1.default.object({
    email: joi_1.default.string().required().messages({
        'string.empty': 'El usuario es requerido',
        'any.required': 'El usuario es requerido'
    }),
    password: joi_1.default.string().min(6).required()
});
exports.registerValidation = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    name: joi_1.default.string().min(2).max(100).required(),
    role: joi_1.default.string().valid('OPERATOR', 'CLIENT', 'EMPLOYEE', 'ADMIN').required(),
    companyId: joi_1.default.number().optional(),
    employeeId: joi_1.default.number().optional()
});
//# sourceMappingURL=authValidation.js.map