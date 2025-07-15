export class CalculationService {
  
  static async calculatePayrollForCompany(
    workers: any[],
    incidences: any[],
    periodStart: Date,
    periodEnd: Date
  ) {
    const workingDaysInPeriod = this.calculateWorkingDays(periodStart, periodEnd);
    
    const workerCalculations = [];
    let totals = {
      totalPerceptions: 0,
      totalDeductions: 0,
      totalProvisions: 0,
      totalNetPay: 0,
      totalEmployees: workers.length,
      totalIncidences: incidences.length,
      employeesWithIncidences: 0,
      totalCompanyCost: 0
    };
    
    for (const worker of workers) {
      const workerIncidences = incidences.filter(inc => inc.workerDetailsId === worker.id);
      const calculation = this.calculateWorkerPayroll(worker, workerIncidences, workingDaysInPeriod);
      
      workerCalculations.push({
        employeeId: worker.id, // Keep as employeeId for backward compatibility in response
        employeeName: `${worker.nombres} ${worker.apellidoPaterno} ${worker.apellidoMaterno || ''}`.trim(),
        employeeNumber: worker.numeroTrabajador,
        ...calculation
      });
      
      // Sumar a totales
      totals.totalPerceptions += calculation.perceptions.total;
      totals.totalDeductions += calculation.deductions.total;
      totals.totalProvisions += calculation.provisions.total;
      totals.totalNetPay += calculation.netPay;
      
      if (workerIncidences.length > 0) {
        totals.employeesWithIncidences++;
      }
    }
    
    totals.totalCompanyCost = totals.totalPerceptions + totals.totalProvisions;
    
    return {
      totals,
      employeeCalculations: workerCalculations
    };
  }
  
  private static calculateWorkerPayroll(worker: any, incidences: any[], workingDays: number) {
    // Get base salary from contract conditions if available
    const baseSalary = worker.contractConditions?.salarioDiario 
      ? Number(worker.contractConditions.salarioDiario) * workingDays
      : 15000; // Default fallback
    const dailySalary = baseSalary / workingDays;
    const hourlyRate = dailySalary / 8;
    
    // Percepciones base
    const basePerceptions = {
      salarioBase: baseSalary,
      aguinaldoProporcional: baseSalary * 0.0833,
      primaVacacionalProporcional: baseSalary * 0.0208,
      prestaciones: baseSalary * 0.1
    };
    
    // Aplicar incidencias
    let incidenceAmount = 0;
    let incidenceDetails: any[] = [];
    
    incidences.forEach(inc => {
      let amount = 0;
      
      switch (inc.type) {
        case 'FALTAS':
          amount = -(dailySalary * inc.quantity);
          break;
        case 'VACACIONES':
          amount = dailySalary * inc.quantity;
          break;
        case 'TIEMPO_EXTRA':
          amount = hourlyRate * inc.quantity * 2;
          break;
        case 'BONOS':
          amount = inc.quantity;
          break;
        case 'PERMISOS':
          amount = 0; // Por defecto sin afectación
          break;
        default:
          amount = inc.amount || 0;
      }
      
      incidenceAmount += amount;
      incidenceDetails.push({
        type: inc.type,
        quantity: inc.quantity,
        amount: amount,
        description: this.getIncidenceTypeLabel(inc.type)
      });
    });
    
    // Total percepciones
    const totalPerceptions = Object.values(basePerceptions).reduce((sum: number, val: number) => sum + val, 0) + 
                             (incidenceAmount > 0 ? incidenceAmount : 0);
    
    // Deducciones
    const deductions = {
      isr: totalPerceptions * 0.12,
      imssObrero: baseSalary * 0.0275,
      infonavitObrero: baseSalary * 0.05,
      incidenceDeductions: incidenceAmount < 0 ? Math.abs(incidenceAmount) : 0
    };
    
    const totalDeductions = Object.values(deductions).reduce((sum: number, val: number) => sum + val, 0);
    
    // Provisiones patronales
    const provisions = {
      imssPatronal: baseSalary * 0.1047,
      infonavitPatronal: baseSalary * 0.05,
      sar: baseSalary * 0.02,
      impuestoNomina: totalPerceptions * 0.025
    };
    
    const totalProvisions = Object.values(provisions).reduce((sum: number, val: number) => sum + val, 0);
    
    // Neto a pagar
    const netPay = totalPerceptions - totalDeductions;
    
    return {
      perceptions: {
        ...basePerceptions,
        incidences: incidenceAmount > 0 ? incidenceAmount : 0,
        total: totalPerceptions
      },
      deductions: {
        ...deductions,
        total: totalDeductions
      },
      provisions: {
        ...provisions,
        total: totalProvisions
      },
      netPay,
      incidenceDetails,
      hasIncidences: incidenceDetails.length > 0
    };
  }
  
  private static calculateWorkingDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    
    while (start <= end) {
      const dayOfWeek = start.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No domingo ni sábado
        workingDays++;
      }
      start.setDate(start.getDate() + 1);
    }
    
    return workingDays || 15; // Default 15 días
  }
  
  private static getIncidenceTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'FALTAS': 'Faltas',
      'PERMISOS': 'Permisos',
      'VACACIONES': 'Vacaciones',
      'TIEMPO_EXTRA': 'Tiempo Extra',
      'BONOS': 'Bonos y Comisiones'
    };
    
    return typeMap[type] || type;
  }
}