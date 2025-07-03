import { IncidenceType } from '../types/payroll';
import { Employee } from '../types/user';
export declare const CALCULATION_CONSTANTS: {
    readonly WORKING_DAYS_PER_PERIOD: 15;
    readonly WORKING_HOURS_PER_DAY: 8;
    readonly OVERTIME_MULTIPLIER: 2;
    readonly VACATION_MULTIPLIER: 1;
    readonly ABSENCE_MULTIPLIER: -1;
};
/**
 * Calcula el monto de una incidencia basado en el tipo y cantidad
 */
export declare const calculateIncidenceAmount: (type: IncidenceType, employee: Employee, quantity: number, workingDaysInPeriod?: number) => number;
/**
 * Calcula el salario bruto de un empleado para un período
 */
export declare const calculateGrossSalary: (employee: Employee, workingDaysInPeriod?: number) => number;
/**
 * Calcula las deducciones básicas (IMSS, ISR, etc.)
 */
export declare const calculateBasicDeductions: (grossSalary: number) => {
    imss: number;
    isr: number;
    total: number;
};
/**
 * Calcula el salario neto
 */
export declare const calculateNetSalary: (grossSalary: number, deductions: number, bonuses?: number) => number;
/**
 * Calcula el total de incidencias para un empleado
 */
export declare const calculateIncidencesTotal: (incidences: Array<{
    type: IncidenceType;
    quantity: number;
    amount: number;
}>) => {
    totalBonuses: number;
    totalDeductions: number;
    netIncidences: number;
    count: number;
};
/**
 * Calcula resumen de nómina para una empresa
 */
export declare const calculatePayrollSummary: (employees: Employee[], incidences?: Array<any>) => {
    totalEmployees: number;
    totalGrossSalary: number;
    totalIncidences: number;
    totalBonuses: number;
    totalDeductions: number;
    estimatedNetTotal: number;
};
/**
 * Valida si una cantidad es válida para un tipo de incidencia
 */
export declare const validateIncidenceQuantity: (type: IncidenceType, quantity: number, maxWorkingDays?: number) => {
    isValid: boolean;
    message?: string;
};
declare const _default: {
    calculateIncidenceAmount: (type: IncidenceType, employee: Employee, quantity: number, workingDaysInPeriod?: number) => number;
    calculateGrossSalary: (employee: Employee, workingDaysInPeriod?: number) => number;
    calculateBasicDeductions: (grossSalary: number) => {
        imss: number;
        isr: number;
        total: number;
    };
    calculateNetSalary: (grossSalary: number, deductions: number, bonuses?: number) => number;
    calculateIncidencesTotal: (incidences: Array<{
        type: IncidenceType;
        quantity: number;
        amount: number;
    }>) => {
        totalBonuses: number;
        totalDeductions: number;
        netIncidences: number;
        count: number;
    };
    calculatePayrollSummary: (employees: Employee[], incidences?: Array<any>) => {
        totalEmployees: number;
        totalGrossSalary: number;
        totalIncidences: number;
        totalBonuses: number;
        totalDeductions: number;
        estimatedNetTotal: number;
    };
    validateIncidenceQuantity: (type: IncidenceType, quantity: number, maxWorkingDays?: number) => {
        isValid: boolean;
        message?: string;
    };
    CALCULATION_CONSTANTS: {
        readonly WORKING_DAYS_PER_PERIOD: 15;
        readonly WORKING_HOURS_PER_DAY: 8;
        readonly OVERTIME_MULTIPLIER: 2;
        readonly VACATION_MULTIPLIER: 1;
        readonly ABSENCE_MULTIPLIER: -1;
    };
};
export default _default;
//# sourceMappingURL=calculator.d.ts.map