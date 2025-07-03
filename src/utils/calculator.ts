import {  IncidenceType } from '../types/payroll';
import { Employee } from '../types/user';

// Constantes para cálculos
export const CALCULATION_CONSTANTS = {
  WORKING_DAYS_PER_PERIOD: 15,
  WORKING_HOURS_PER_DAY: 8,
  OVERTIME_MULTIPLIER: 2,
  VACATION_MULTIPLIER: 1,
  ABSENCE_MULTIPLIER: -1
} as const;

/**
 * Calcula el monto de una incidencia basado en el tipo y cantidad
 */
export const calculateIncidenceAmount = (
  type: IncidenceType,
  employee: Employee,
  quantity: number,
  workingDaysInPeriod: number = CALCULATION_CONSTANTS.WORKING_DAYS_PER_PERIOD
): number => {
  if (!type || !employee || !quantity || quantity < 0) {
    return 0;
  }

  const dailySalary = employee.salary / workingDaysInPeriod;
  const hourlyRate = dailySalary / CALCULATION_CONSTANTS.WORKING_HOURS_PER_DAY;

  switch (type) {
    case 'faltas':
      // Descuento por días no trabajados
      return parseFloat(
        (dailySalary * quantity * CALCULATION_CONSTANTS.ABSENCE_MULTIPLIER).toFixed(2)
      );

    case 'vacaciones':
      // Pago normal por días de vacaciones
      return parseFloat(
        (dailySalary * quantity * CALCULATION_CONSTANTS.VACATION_MULTIPLIER).toFixed(2)
      );

    case 'tiempo_extra':
      // Pago de tiempo extra (doble)
      return parseFloat(
        (hourlyRate * quantity * CALCULATION_CONSTANTS.OVERTIME_MULTIPLIER).toFixed(2)
      );

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

/**
 * Calcula el salario bruto de un empleado para un período
 */
export const calculateGrossSalary = (
  employee: Employee,
  workingDaysInPeriod: number = CALCULATION_CONSTANTS.WORKING_DAYS_PER_PERIOD
): number => {
  const dailySalary = employee.salary / workingDaysInPeriod;
  return parseFloat((dailySalary * workingDaysInPeriod).toFixed(2));
};

/**
 * Calcula las deducciones básicas (IMSS, ISR, etc.)
 */
export const calculateBasicDeductions = (grossSalary: number): {
  imss: number;
  isr: number;
  total: number;
} => {
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

/**
 * Calcula el salario neto
 */
export const calculateNetSalary = (
  grossSalary: number,
  deductions: number,
  bonuses: number = 0
): number => {
  return parseFloat((grossSalary - deductions + bonuses).toFixed(2));
};

/**
 * Calcula el total de incidencias para un empleado
 */
export const calculateIncidencesTotal = (
  incidences: Array<{ type: IncidenceType; quantity: number; amount: number }>
): {
  totalBonuses: number;
  totalDeductions: number;
  netIncidences: number;
  count: number;
} => {
  let totalBonuses = 0;
  let totalDeductions = 0;

  incidences.forEach(incidence => {
    if (incidence.amount > 0) {
      totalBonuses += incidence.amount;
    } else {
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

/**
 * Calcula resumen de nómina para una empresa
 */
export const calculatePayrollSummary = (
  employees: Employee[],
  incidences: Array<any> = []
): {
  totalEmployees: number;
  totalGrossSalary: number;
  totalIncidences: number;
  totalBonuses: number;
  totalDeductions: number;
  estimatedNetTotal: number;
} => {
  const totalEmployees = employees.length;
  
  const totalGrossSalary = employees.reduce((sum, emp) => {
    return sum + calculateGrossSalary(emp);
  }, 0);

  const incidencesTotal = calculateIncidencesTotal(incidences);

  const basicDeductions = calculateBasicDeductions(totalGrossSalary);
  const totalDeductions = basicDeductions.total + incidencesTotal.totalDeductions;

  return {
    totalEmployees,
    totalGrossSalary: parseFloat(totalGrossSalary.toFixed(2)),
    totalIncidences: incidences.length,
    totalBonuses: incidencesTotal.totalBonuses,
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    estimatedNetTotal: parseFloat(
      (totalGrossSalary - totalDeductions + incidencesTotal.totalBonuses).toFixed(2)
    )
  };
};

/**
 * Valida si una cantidad es válida para un tipo de incidencia
 */
export const validateIncidenceQuantity = (
  type: IncidenceType,
  quantity: number,
  maxWorkingDays: number = CALCULATION_CONSTANTS.WORKING_DAYS_PER_PERIOD
): { isValid: boolean; message?: string } => {
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

export default {
  calculateIncidenceAmount,
  calculateGrossSalary,
  calculateBasicDeductions,
  calculateNetSalary,
  calculateIncidencesTotal,
  calculatePayrollSummary,
  validateIncidenceQuantity,
  CALCULATION_CONSTANTS
};