export interface CreatePayrollRequest {
    companyId: number;
    period: string;
    periodStart: string;
    periodEnd: string;
    calendarId?: number;
    employeeIds?: number[];
}
export interface PayrollCalculation {
    totalPerceptions: number;
    totalDeductions: number;
    totalProvisions: number;
    totalNetPay: number;
    totalEmployees: number;
    totalIncidences: number;
    employeesWithIncidences: number;
    totalCompanyCost: number;
}
export declare class PayrollService {
    static getAllPayrolls(companyId?: number, status?: string): Promise<{
        id: number;
        period: string;
        periodStart: string;
        periodEnd: string;
        totalNet: number;
        employeeCount: number;
        status: string;
        companyId: number;
        companyName: string;
        incidencesCount: number;
        processedAt: Date | null;
        authorizedAt: Date | null;
        authorizedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static getPayrollById(id: number, includeDetails?: boolean): Promise<{
        processedAt: Date | null;
        authorizedAt: Date | null;
        authorizedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        payrollItems?: ({
            id: number;
            companyId: number;
            employeeId: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.IncidenceStatus;
            type: import(".prisma/client").$Enums.IncidenceType;
            date: Date;
            quantity: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
            payrollId: number | null;
        } | {
            id: number;
            companyId: number;
            employeeId: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.IncidenceStatus;
            type: import(".prisma/client").$Enums.IncidenceType;
            date: Date;
            quantity: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
            payrollId: number | null;
        })[] | ({
            message: string;
            id: number;
            companyId: number | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            priority: import(".prisma/client").$Enums.NotificationPriority;
            payrollId: number | null;
            title: string;
            read: boolean;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            readAt: Date | null;
        } | {
            message: string;
            id: number;
            companyId: number | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            priority: import(".prisma/client").$Enums.NotificationPriority;
            payrollId: number | null;
            title: string;
            read: boolean;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            readAt: Date | null;
        })[] | {
            id: number;
            companyId: number;
            employeeId: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.IncidenceStatus;
            type: import(".prisma/client").$Enums.IncidenceType;
            date: Date;
            quantity: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
            payrollId: number | null;
        }[] | {
            message: string;
            id: number;
            companyId: number | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            priority: import(".prisma/client").$Enums.NotificationPriority;
            payrollId: number | null;
            title: string;
            read: boolean;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            readAt: Date | null;
        }[] | ({
            id: number;
            employeeId: number;
            createdAt: Date;
            updatedAt: Date;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            totalGross: import("@prisma/client/runtime/library").Decimal;
            totalDeductions: import("@prisma/client/runtime/library").Decimal;
            payrollId: number;
            overtime: import("@prisma/client/runtime/library").Decimal;
            bonuses: import("@prisma/client/runtime/library").Decimal;
            incomeTax: import("@prisma/client/runtime/library").Decimal;
            socialSecurity: import("@prisma/client/runtime/library").Decimal;
            otherDeductions: import("@prisma/client/runtime/library").Decimal;
            netSalary: import("@prisma/client/runtime/library").Decimal;
            workedDays: number;
            cfdiStatus: import(".prisma/client").$Enums.CFDIStatus;
            cfdiUuid: string | null;
            cfdiXmlPath: string | null;
            cfdiPdfPath: string | null;
        } | {
            id: number;
            employeeId: number;
            createdAt: Date;
            updatedAt: Date;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            totalGross: import("@prisma/client/runtime/library").Decimal;
            totalDeductions: import("@prisma/client/runtime/library").Decimal;
            payrollId: number;
            overtime: import("@prisma/client/runtime/library").Decimal;
            bonuses: import("@prisma/client/runtime/library").Decimal;
            incomeTax: import("@prisma/client/runtime/library").Decimal;
            socialSecurity: import("@prisma/client/runtime/library").Decimal;
            otherDeductions: import("@prisma/client/runtime/library").Decimal;
            netSalary: import("@prisma/client/runtime/library").Decimal;
            workedDays: number;
            cfdiStatus: import(".prisma/client").$Enums.CFDIStatus;
            cfdiUuid: string | null;
            cfdiXmlPath: string | null;
            cfdiPdfPath: string | null;
        })[] | {
            id: number;
            employeeId: number;
            createdAt: Date;
            updatedAt: Date;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            totalGross: import("@prisma/client/runtime/library").Decimal;
            totalDeductions: import("@prisma/client/runtime/library").Decimal;
            payrollId: number;
            overtime: import("@prisma/client/runtime/library").Decimal;
            bonuses: import("@prisma/client/runtime/library").Decimal;
            incomeTax: import("@prisma/client/runtime/library").Decimal;
            socialSecurity: import("@prisma/client/runtime/library").Decimal;
            otherDeductions: import("@prisma/client/runtime/library").Decimal;
            netSalary: import("@prisma/client/runtime/library").Decimal;
            workedDays: number;
            cfdiStatus: import(".prisma/client").$Enums.CFDIStatus;
            cfdiUuid: string | null;
            cfdiXmlPath: string | null;
            cfdiPdfPath: string | null;
        }[] | undefined;
        id: number;
        period: string;
        periodStart: string;
        periodEnd: string;
        totalNet: number;
        employeeCount: number;
        status: string;
        companyId: number;
        companyName: any;
        incidences: any;
    }>;
    static createPayroll(data: CreatePayrollRequest, userId: number): Promise<{
        id: number;
        period: string;
        periodStart: string;
        periodEnd: string;
        totalNet: number;
        employeeCount: number;
        status: string;
        companyId: number;
        companyName: string;
        createdAt: Date;
    }>;
    static calculatePayroll(payrollId: number): Promise<{
        id: number;
        calculations: {
            totalPerceptions: number;
            totalDeductions: number;
            totalProvisions: number;
            totalNetPay: number;
            totalEmployees: number;
            totalIncidences: number;
            employeesWithIncidences: number;
            totalCompanyCost: number;
        };
        detailedCalculations: {
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
        status: string;
    }>;
    static sendForAuthorization(payrollId: number, userId: number, io: any): Promise<{
        id: number;
        status: string;
        processedAt: Date | null;
    }>;
    static authorizePayroll(payrollId: number, action: 'approve' | 'reject', comments: string | undefined, userId: number, io: any): Promise<{
        id: number;
        status: string;
        authorizedAt: Date | null;
    }>;
    static getPayrollStats(companyId?: number): Promise<{
        total: {
            count: number;
            amount: number;
            average: number;
        };
        byStatus: {
            status: string;
            count: any;
            amount: any;
        }[];
        monthly: {
            month: any;
            count: any;
            amount: any;
        }[];
    }>;
    private static mapStatusToFrontend;
    private static mapStatusFromFrontend;
}
//# sourceMappingURL=payrollService.d.ts.map