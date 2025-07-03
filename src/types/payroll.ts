export interface PayrollPeriod {
  id: number;
  calendarId: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'in_progress' | 'completed' | 'closed';
  workingDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollCalendar {
  id: number;
  companyId: number;
  name: string;
  frequency: 'quincenal' | 'mensual';
  startDate: Date;
  isActive: boolean;
  periods?: PayrollPeriod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Payroll {
  id: number;
  companyId: number;
  periodId: number;
  employeeId: number;
  grossSalary: number;
  deductions: number;
  bonuses: number;
  netSalary: number;
  status: 'draft' | 'pending_authorization' | 'authorized' | 'paid';
  authorizedBy?: number;
  authorizedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Incidence {
  id: number;
  employeeId: number;
  companyId: number;
  type: IncidenceType;
  quantity: number;
  amount: number;
  date: Date;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IncidenceType = 
  | 'faltas' 
  | 'vacaciones' 
  | 'tiempo_extra' 
  | 'permisos' 
  | 'bonos' 
  | 'descuentos';

export interface IncidenceCalculation {
  baseAmount: number;
  calculatedAmount: number;
  factor: number;
  description: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalGrossAmount: number;
  totalDeductions: number;
  totalBonuses: number;
  totalNetAmount: number;
  incidencesCount: number;
  status: string;
}