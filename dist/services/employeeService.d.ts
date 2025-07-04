export interface CreateEmployeeRequest {
    employeeNumber: string;
    name: string;
    email: string;
    rfc: string;
    position: string;
    department: string;
    baseSalary: number;
    hireDate: string;
    companyId: number;
    bankName?: string;
    bankAccount?: string;
    clabe?: string;
}
export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
    id: number;
}
export declare class EmployeeService {
    static getAllEmployees(companyId?: number, status?: string): Promise<{
        id: number;
        employeeNumber: string;
        name: string;
        email: string | null;
        rfc: string;
        position: string;
        department: string;
        salary: number;
        hireDate: string;
        status: string;
        companyId: number;
        companyName: string;
        bankName: string | null;
        accountNumber: string | null;
        clabe: string | null;
        incidencesCount: number;
        payrollsCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static getEmployeeById(id: number): Promise<{
        id: number;
        employeeNumber: string;
        name: string;
        email: string | null;
        rfc: string;
        position: string;
        department: string;
        salary: number;
        hireDate: string;
        status: string;
        companyId: number;
        companyName: string;
        bankName: string | null;
        accountNumber: string | null;
        clabe: string | null;
        incidences: {
            id: number;
            companyId: number;
            employeeId: number;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.IncidenceType;
            date: Date;
            status: import(".prisma/client").$Enums.IncidenceStatus;
            quantity: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
            payrollId: number | null;
        }[];
        payrollItems: ({
            payroll: {
                id: number;
                createdAt: Date;
                status: import(".prisma/client").$Enums.PayrollStatus;
                period: string;
            };
        } & {
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
        })[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    static createEmployee(data: CreateEmployeeRequest): Promise<{
        id: number;
        employeeNumber: string;
        name: string;
        email: string | null;
        rfc: string;
        position: string;
        department: string;
        salary: number;
        hireDate: string;
        status: string;
        companyId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static updateEmployee(data: UpdateEmployeeRequest): Promise<{
        id: number;
        employeeNumber: string;
        name: string;
        email: string | null;
        rfc: string;
        position: string;
        department: string;
        salary: number;
        hireDate: string;
        status: string;
        companyId: number;
        bankName: string | null;
        accountNumber: string | null;
        clabe: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static deleteEmployee(id: number): Promise<{
        message: string;
        employeeId: number;
    }>;
    static getEmployeeStats(companyId?: number): Promise<{
        total: number;
        averageSalary: number;
        minSalary: number;
        maxSalary: number;
        byStatus: any;
        byDepartment: any;
    }>;
    private static mapStatusToFrontend;
}
//# sourceMappingURL=employeeService.d.ts.map