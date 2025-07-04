export interface CreateCompanyRequest {
    name: string;
    rfc: string;
    legalName: string;
    address: string;
    email: string;
    phone?: string;
    status?: string;
    paymentMethod?: string;
    bankAccount?: string;
}
export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
    id: number;
}
export declare class CompanyService {
    static getAllCompanies(operatorOnly?: boolean): Promise<{
        id: any;
        name: any;
        rfc: any;
        legalName: any;
        address: any;
        email: any;
        phone: any;
        status: string;
        employeesCount: any;
        payrollsCount: any;
        incidencesCount: any;
        calendarsCount: any;
        paymentMethod: any;
        bankAccount: any;
        recentPayrolls: any;
        activeCalendars: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    static getCompanyById(id: number, includeDetails?: boolean): Promise<{
        createdAt: Date;
        updatedAt: Date;
        employees?: any;
        payrolls?: any;
        calendars?: any;
        id: number;
        name: string;
        rfc: string;
        legalName: string;
        address: string;
        email: string;
        phone: string | null;
        status: string;
        employeesCount: any;
        paymentMethod: string | null;
        bankAccount: string | null;
    }>;
    static createCompany(data: CreateCompanyRequest): Promise<{
        id: number;
        name: string;
        rfc: string;
        legalName: string;
        address: string;
        email: string;
        phone: string | null;
        status: string;
        employeesCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static updateCompany(data: UpdateCompanyRequest): Promise<{
        id: number;
        name: string;
        rfc: string;
        legalName: string;
        address: string;
        email: string;
        phone: string | null;
        status: string;
        employeesCount: number;
        paymentMethod: string | null;
        bankAccount: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static deleteCompany(id: number): Promise<{
        message: string;
        companyId: number;
    }>;
    static getCompanyStats(id: number): Promise<{
        companyId: number;
        employees: {
            total: number;
            active: number;
        };
        payrolls: {
            total: number;
            totalAmount: number;
            avgAmount: number;
            byStatus: any;
        };
        incidences: {
            total: number;
            totalAmount: number;
            byType: any;
        };
        calendars: {
            total: number;
        };
    }>;
    private static mapStatusToFrontend;
    private static mapStatusFromFrontend;
}
//# sourceMappingURL=companyService.d.ts.map