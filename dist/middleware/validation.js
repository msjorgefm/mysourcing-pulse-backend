"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGeneratePeriods = exports.validateCalendarQuery = exports.validatePeriodParams = exports.validateCalendarParams = exports.validateIncidenceParams = exports.validateEmployeeParams = exports.validatePayrollPeriod = exports.validatePayrollCalendar = exports.validateIncidence = exports.validateEmployee = void 0;
// src/middleware/validation.ts
const joi_1 = __importDefault(require("joi"));
// Esquemas de validación
const employeeSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    employeeNumber: joi_1.default.string().min(1).max(50).required(),
    position: joi_1.default.string().max(100),
    department: joi_1.default.string().max(100),
    salary: joi_1.default.number().positive().required(),
    companyId: joi_1.default.number().integer().positive().required(),
    hireDate: joi_1.default.date(),
    isActive: joi_1.default.boolean().default(true)
});
const incidenceSchema = joi_1.default.object({
    employeeId: joi_1.default.number().integer().positive().required(),
    companyId: joi_1.default.number().integer().positive().required(),
    type: joi_1.default.string().valid('faltas', 'vacaciones', 'tiempo_extra', 'permisos', 'bonos', 'descuentos').required(),
    quantity: joi_1.default.number().positive().required(),
    amount: joi_1.default.number(),
    date: joi_1.default.date().required(),
    comments: joi_1.default.string().max(500),
    periodStart: joi_1.default.date(),
    periodEnd: joi_1.default.date()
});
const payrollCalendarSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    companyId: joi_1.default.number().integer().positive().required(),
    frequency: joi_1.default.string().valid('quincenal', 'mensual').required(),
    startDate: joi_1.default.date().required(),
    isActive: joi_1.default.boolean().default(true)
});
const payrollPeriodSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().required(),
    status: joi_1.default.string().valid('draft', 'in_progress', 'completed', 'closed').default('draft'),
    workingDays: joi_1.default.number().integer().min(1).max(31)
});
// Funciones de validación
const validateEmployee = (data) => {
    const { error } = employeeSchema.validate(data);
    return {
        isValid: !error,
        errors: error ? error.details.map(d => d.message) : []
    };
};
exports.validateEmployee = validateEmployee;
const validateIncidence = (data) => {
    const { error } = incidenceSchema.validate(data);
    return {
        isValid: !error,
        errors: error ? error.details.map(d => d.message) : []
    };
};
exports.validateIncidence = validateIncidence;
const validatePayrollCalendar = (data) => {
    const { error } = payrollCalendarSchema.validate(data);
    return {
        isValid: !error,
        errors: error ? error.details.map(d => d.message) : []
    };
};
exports.validatePayrollCalendar = validatePayrollCalendar;
const validatePayrollPeriod = (data) => {
    const { error } = payrollPeriodSchema.validate(data);
    return {
        isValid: !error,
        errors: error ? error.details.map(d => d.message) : []
    };
};
exports.validatePayrollPeriod = validatePayrollPeriod;
// Middleware de validación de parámetros
const validateEmployeeParams = (req, res, next) => {
    const { companyId } = req.params;
    if (!companyId || isNaN(parseInt(companyId))) {
        res.status(400).json({
            success: false,
            message: 'ID de empresa inválido'
        });
        return;
    }
    next();
};
exports.validateEmployeeParams = validateEmployeeParams;
const validateIncidenceParams = (req, res, next) => {
    const { companyId, periodStart, periodEnd } = req.query;
    if (!companyId || !periodStart || !periodEnd) {
        res.status(400).json({
            success: false,
            message: 'Parámetros requeridos: companyId, periodStart, periodEnd'
        });
        return;
    }
    // Validar fechas
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({
            success: false,
            message: 'Formato de fecha inválido'
        });
        return;
    }
    if (startDate >= endDate) {
        res.status(400).json({
            success: false,
            message: 'La fecha de inicio debe ser anterior a la fecha de fin'
        });
        return;
    }
    next();
};
exports.validateIncidenceParams = validateIncidenceParams;
const validateCalendarParams = (req, res, next) => {
    const { companyId, calendarId } = req.params;
    // Validar companyId si está presente
    if (companyId && isNaN(parseInt(companyId))) {
        res.status(400).json({
            success: false,
            message: 'ID de empresa inválido'
        });
        return;
    }
    // Validar calendarId si está presente
    if (calendarId && isNaN(parseInt(calendarId))) {
        res.status(400).json({
            success: false,
            message: 'ID de calendario inválido'
        });
        return;
    }
    next();
};
exports.validateCalendarParams = validateCalendarParams;
const validatePeriodParams = (req, res, next) => {
    const { calendarId, periodId } = req.params;
    // Validar calendarId
    if (!calendarId || isNaN(parseInt(calendarId))) {
        res.status(400).json({
            success: false,
            message: 'ID de calendario inválido'
        });
        return;
    }
    // Validar periodId si está presente
    if (periodId && isNaN(parseInt(periodId))) {
        res.status(400).json({
            success: false,
            message: 'ID de período inválido'
        });
        return;
    }
    // Si hay datos en el body para crear/actualizar período, validarlos
    if (req.method === 'POST' || req.method === 'PUT') {
        // Validar usando el esquema de Joi directamente
        const { error } = payrollPeriodSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Datos del período inválidos',
                errors: error.details.map(d => d.message)
            });
            return;
        }
        // Validación adicional: startDate debe ser menor que endDate
        if (req.body.startDate && req.body.endDate) {
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);
            if (startDate >= endDate) {
                res.status(400).json({
                    success: false,
                    message: 'La fecha de inicio debe ser anterior a la fecha de fin'
                });
                return;
            }
        }
    }
    next();
};
exports.validatePeriodParams = validatePeriodParams;
// Middleware adicional para validar query parameters de calendarios
const validateCalendarQuery = (req, res, next) => {
    const { status, year } = req.query;
    // Validar status si está presente
    if (status && !['draft', 'in_progress', 'completed', 'closed'].includes(status)) {
        res.status(400).json({
            success: false,
            message: 'Status inválido. Valores permitidos: draft, in_progress, completed, closed'
        });
        return;
    }
    // Validar year si está presente
    if (year) {
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
            res.status(400).json({
                success: false,
                message: 'Año inválido. Debe estar entre 2020 y 2030'
            });
            return;
        }
    }
    next();
};
exports.validateCalendarQuery = validateCalendarQuery;
// Middleware para validar datos de generación de períodos
const validateGeneratePeriods = (req, res, next) => {
    const { year, frequency } = req.body;
    if (!year || !frequency) {
        res.status(400).json({
            success: false,
            message: 'Año y frecuencia son requeridos'
        });
        return;
    }
    // Validar año
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
        res.status(400).json({
            success: false,
            message: 'Año inválido. Debe estar entre 2020 y 2030'
        });
        return;
    }
    // Validar frecuencia
    if (!['quincenal', 'mensual', 'semanal', 'decenal'].includes(frequency)) {
        res.status(400).json({
            success: false,
            message: 'Frecuencia inválida. Valores permitidos: quincenal, mensual, semanal, decenal'
        });
        return;
    }
    next();
};
exports.validateGeneratePeriods = validateGeneratePeriods;
//# sourceMappingURL=validation.js.map