export declare class CalculationService {
    static calculatePayrollForCompany(employees: any[], incidences: any[], periodStart: Date, periodEnd: Date): Promise<{
        totals: {
            totalPerceptions: number;
            totalDeductions: number;
            totalProvisions: number;
            totalNetPay: number;
            totalEmployees: number;
            totalIncidences: number;
            employeesWithIncidences: number;
            totalCompanyCost: number;
        };
        employeeCalculations: {
            perceptions: {
                incidences: number;
                total: any;
                salarioBase: any;
                aguinaldoProporcional: number;
                primaVacacionalProporcional: number;
                prestaciones: number;
            };
            deductions: {
                total: number;
                isr: number;
                imssObrero: number;
                infonavitObrero: number;
                incidenceDeductions: number;
            };
            provisions: {
                total: number;
                imssPatronal: number;
                infonavitPatronal: number;
                sar: number;
                impuestoNomina: number;
            };
            netPay: number;
            incidenceDetails: any[];
            hasIncidences: boolean;
            employeeId: any;
            employeeName: any;
            employeeNumber: any;
        }[];
    }>;
    private static calculateEmployeePayroll;
    private static calculateWorkingDays;
    private static getIncidenceTypeLabel;
}
//# sourceMappingURL=calculationService.d.ts.map