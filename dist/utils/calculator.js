"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIncidenceQuantity = exports.calculatePayrollSummary = exports.calculateIncidencesTotal = exports.calculateNetSalary = exports.calculateBasicDeductions = exports.calculateGrossSalary = exports.calculateIncidenceAmount = exports.CALCULATION_CONSTANTS = void 0;
// Constantes para cálculos
exports.CALCULATION_CONSTANTS = {
    WORKING_DAYS_PER_PERIOD: 15,
    WORKING_HOURS_PER_DAY: 8,
    OVERTIME_MULTIPLIER: 2,
    VACATION_MULTIPLIER: 1,
    ABSENCE_MULTIPLIER: -1
};
/**
 * Calcula el monto de una incidencia basado en el tipo y cantidad
 */
const calculateIncidenceAmount = (type, employee, quantity, workingDaysInPeriod = exports.CALCULATION_CONSTANTS.WORKING_DAYS_PER_PERIOD) => {
    if (!type || !employee || !quantity || quantity < 0) {
        return 0;
    }
    const dailySalary = employee.salary / workingDaysInPeriod;
    const hourlyRate = dailySalary / exports.CALCULATION_CONSTANTS.WORKING_HOURS_PER_DAY;
    switch (type) {
        case 'faltas':
            // Descuento por días no trabajados
            return parseFloat((dailySalary * quantity * exports.CALCULATION_CONSTANTS.ABSENCE_MULTIPLIER).toFixed(2));
        case 'vacaciones':
            // Pago normal por días de vacaciones
            return parseFloat((dailySalary * quantity * exports.CALCULATION_CONSTANTS.VACATION_MULTIPLIER).toFixed(2));
        case 'tiempo_extra':
            // Pago de tiempo extra (doble)
            return parseFloat((hourlyRate * quantity * exports.CALCULATION_CONSTANTS.OVERTIME_MULTIPLIER).toFixed(2));
        case 'permisos':
            // Por defecto sin afectación (puede ser con o sin goce)
            return 0;
        case 'bonos':
            // Para bonos, la cantidad ES el monto
            return parseFloat(parseFloat(quantity.toString()).toFixed(2));
        case 'descuentos':
            // Para descuentos, aplicar como negativo
            return parseFloat((-Math.abs(quantity)).toFixed(2));
        default:
            return 0;
    }
};
exports.calculateIncidenceAmount = calculateIncidenceAmount;
/**
 * Calcula el salario bruto de un empleado para un período
 */
const calculateGrossSalary = (employee, workingDaysInPeriod = exports.CALCULATION_CONSTANTS.WORKING_DAYS_PER_PERIOD) => {
    const dailySalary = employee.salary / workingDaysInPeriod;
    return parseFloat((dailySalary * workingDaysInPeriod).toFixed(2));
};
exports.calculateGrossSalary = calculateGrossSalary;
/**
 * Calcula las deducciones básicas (IMSS, ISR, etc.)
 */
const calculateBasicDeductions = (grossSalary) => {
    // Porcentajes aproximados (deben ser configurables)
    const imssRate = 0.0725; // 7.25%
    const isrRate = 0.1; // 10% (simplificado)
    const imss = parseFloat((grossSalary * imssRate).toFixed(2));
    const isr = parseFloat((grossSalary * isrRate).toFixed(2));
    return {
        imss,
        isr,
        total: parseFloat((imss + isr).toFixed(2))
    };
};
exports.calculateBasicDeductions = calculateBasicDeductions;
/**
 * Calcula el salario neto
 */
const calculateNetSalary = (grossSalary, deductions, bonuses = 0) => {
    return parseFloat((grossSalary - deductions + bonuses).toFixed(2));
};
exports.calculateNetSalary = calculateNetSalary;
/**
 * Calcula el total de incidencias para un empleado
 */
const calculateIncidencesTotal = (incidences) => {
    let totalBonuses = 0;
    let totalDeductions = 0;
    incidences.forEach(incidence => {
        if (incidence.amount > 0) {
            totalBonuses += incidence.amount;
        }
        else {
            totalDeductions += Math.abs(incidence.amount);
        }
    });
    return {
        totalBonuses: parseFloat(totalBonuses.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        netIncidences: parseFloat((totalBonuses - totalDeductions).toFixed(2)),
        count: incidences.length
    };
};
exports.calculateIncidencesTotal = calculateIncidencesTotal;
/**
 * Calcula resumen de nómina para una empresa
 */
const calculatePayrollSummary = (employees, incidences = []) => {
    const totalEmployees = employees.length;
    const totalGrossSalary = employees.reduce((sum, emp) => {
        return sum + (0, exports.calculateGrossSalary)(emp);
    }, 0);
    const incidencesTotal = (0, exports.calculateIncidencesTotal)(incidences);
    const basicDeductions = (0, exports.calculateBasicDeductions)(totalGrossSalary);
    const totalDeductions = basicDeductions.total + incidencesTotal.totalDeductions;
    return {
        totalEmployees,
        totalGrossSalary: parseFloat(totalGrossSalary.toFixed(2)),
        totalIncidences: incidences.length,
        totalBonuses: incidencesTotal.totalBonuses,
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        estimatedNetTotal: parseFloat((totalGrossSalary - totalDeductions + incidencesTotal.totalBonuses).toFixed(2))
    };
};
exports.calculatePayrollSummary = calculatePayrollSummary;
/**
 * Valida si una cantidad es válida para un tipo de incidencia
 */
const validateIncidenceQuantity = (type, quantity, maxWorkingDays = exports.CALCULATION_CONSTANTS.WORKING_DAYS_PER_PERIOD) => {
    if (quantity < 0) {
        return { isValid: false, message: 'La cantidad no puede ser negativa' };
    }
    switch (type) {
        case 'tiempo_extra':
            if (quantity > 12) {
                return {
                    isValid: false,
                    message: 'Las horas extra no pueden exceder 12 horas por día'
                };
            }
            break;
        case 'vacaciones':
        case 'faltas':
            if (quantity > maxWorkingDays) {
                return {
                    isValid: false,
                    message: `Los días no pueden exceder ${maxWorkingDays} días del período`
                };
            }
            break;
        case 'bonos':
        case 'descuentos':
            if (quantity > 999999.99) {
                return {
                    isValid: false,
                    message: 'El monto no puede exceder $999,999.99'
                };
            }
            break;
    }
    return { isValid: true };
};
exports.validateIncidenceQuantity = validateIncidenceQuantity;
exports.default = {
    calculateIncidenceAmount: exports.calculateIncidenceAmount,
    calculateGrossSalary: exports.calculateGrossSalary,
    calculateBasicDeductions: exports.calculateBasicDeductions,
    calculateNetSalary: exports.calculateNetSalary,
    calculateIncidencesTotal: exports.calculateIncidencesTotal,
    calculatePayrollSummary: exports.calculatePayrollSummary,
    validateIncidenceQuantity: exports.validateIncidenceQuantity,
    CALCULATION_CONSTANTS: exports.CALCULATION_CONSTANTS
};
//# sourceMappingURL=calculator.js.map