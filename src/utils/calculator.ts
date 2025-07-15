import { IncidenceType } from '../types/payroll';
import { WorkerDetails } from '../types/user';

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
interface WorkerCalculationData {
  salary: number;
  isActive: boolean;
  [key: string]: any;
}

export const calculateIncidenceAmount = (
  type: IncidenceType,
  worker: WorkerCalculationData,
  quantity: number,
  workingDaysInPeriod: number = CALCULATION_CONSTANTS.WORKING_DAYS_PER_PERIOD
): number => {
  if (!type || !worker || !quantity || quantity < 0) {
    return 0;
  }

  const dailySalary = worker.salary / workingDaysInPeriod;
  const hourlyRate = dailySalary / CALCULATION_CONSTANTS.WORKING_HOURS_PER_DAY;

  switch (type) {
    case 'ABSENCE':
      // Descuento por días no trabajados
      return parseFloat(
        (dailySalary * quantity * CALCULATION_CONSTANTS.ABSENCE_MULTIPLIER).toFixed(2)
      );

    case 'VACATION':
      // Pago normal por días de vacaciones
      return parseFloat(
        (dailySalary * quantity * CALCULATION_CONSTANTS.VACATION_MULTIPLIER).toFixed(2)
      );

    case 'OVERTIME':
      // Pago de tiempo extra (doble)
      return parseFloat(
        (hourlyRate * quantity * CALCULATION_CONSTANTS.OVERTIME_MULTIPLIER).toFixed(2)
      );

    case 'PERMISSION':
      // Por defecto sin afectación (puede ser con o sin goce)
      return 0;

    case 'BONUS':
      // Para bonos, la cantidad ES el monto
      return parseFloat(parseFloat(quantity.toString()).toFixed(2));

    default:
      return 0;
  }
};

/**
 * Calcula el salario bruto de un trabajador para un período
 */
export const calculateGrossSalary = (
  worker: WorkerDetails,
  workingDaysInPeriod: number = CALCULATION_CONSTANTS.WORKING_DAYS_PER_PERIOD
): number => {
  const monthlySalary = worker.contractConditions?.salarioDiario 
    ? Number(worker.contractConditions.salarioDiario) * 30 
    : 15000; // Default monthly salary
  const dailySalary = monthlySalary / 30;
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
  workers: WorkerDetails[],
  incidences: Array<any> = []
): {
  totalEmployees: number;
  totalGrossSalary: number;
  totalIncidences: number;
  totalBonuses: number;
  totalDeductions: number;
  estimatedNetTotal: number;
} => {
  const totalEmployees = workers.length;
  
  const totalGrossSalary = workers.reduce((sum, worker) => {
    return sum + calculateGrossSalary(worker);
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
    case 'OVERTIME':
      if (quantity > 12) {
        return { 
          isValid: false, 
          message: 'Las horas extra no pueden exceder 12 horas por día' 
        };
      }
      break;

    case 'VACATION':
    case 'ABSENCE':
      if (quantity > maxWorkingDays) {
        return { 
          isValid: false, 
          message: `Los días no pueden exceder ${maxWorkingDays} días del período` 
        };
      }
      break;

    case 'BONUS':
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