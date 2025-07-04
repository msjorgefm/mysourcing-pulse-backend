import { Request, Response } from 'express';
export declare class CompanyWizardController {
    static initializeWizard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getWizardStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateWizardStep(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static completeWizard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSectionData(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSectionSpecificData(companyId: number, sectionNumber: number): Promise<{
        id: number;
        name: string;
        companyId: number;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        workDays: import("@prisma/client/runtime/library").JsonValue;
        holidays: import("@prisma/client/runtime/library").JsonValue;
        isDefault: boolean;
    }[] | {
        id: number;
        companyId: number;
        createdAt: Date;
        updatedAt: Date;
        bankName: string;
        clabe: string | null;
        bankType: import(".prisma/client").$Enums.BankType;
        accountNumber: string;
        isPrimary: boolean;
    }[] | {
        id: number;
        companyId: number;
        createdAt: Date;
        updatedAt: Date;
        rfc: string;
        taxRegime: string;
        businessName: string;
        commercialName: string | null;
        startDate: Date;
        street: string;
        exteriorNumber: string;
        interiorNumber: string | null;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        legalRepName: string;
        legalRepRFC: string;
        legalRepCurp: string | null;
        legalRepPosition: string;
        notarialPower: string | null;
        notaryNumber: string | null;
        notaryName: string | null;
    } | {
        id: number;
        companyId: number;
        createdAt: Date;
        updatedAt: Date;
        imssRegistration: string | null;
        imssClassification: string | null;
        imssRiskClass: string | null;
        imssAddress: string | null;
        imssCity: string | null;
        imssState: string | null;
        imssZipCode: string | null;
        fonacotRegistration: string | null;
        fonacotCenter: string | null;
    } | {
        password: string;
        id: number;
        companyId: number;
        createdAt: Date;
        updatedAt: Date;
        certificateFile: string;
        keyFile: string;
        validFrom: Date;
        validUntil: Date;
    } | {
        areas: {
            id: number;
            name: string;
            isActive: boolean;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        }[];
        departments: {
            id: number;
            name: string;
            isActive: boolean;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            areaId: number | null;
        }[];
        positions: {
            id: number;
            name: string;
            isActive: boolean;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            departmentId: number;
            minSalary: import("@prisma/client/runtime/library").Decimal | null;
            maxSalary: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        benefits?: undefined;
        benefitGroups?: undefined;
        schedules?: undefined;
        employees?: undefined;
    } | {
        benefits: {
            id: number;
            name: string;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.BenefitType;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
            isLegal: boolean;
            percentage: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        benefitGroups: {
            id: number;
            name: string;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            benefits: import("@prisma/client/runtime/library").JsonValue;
            description: string | null;
        }[];
        areas?: undefined;
        departments?: undefined;
        positions?: undefined;
        schedules?: undefined;
        employees?: undefined;
    } | {
        schedules: {
            id: number;
            name: string;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            workDays: import("@prisma/client/runtime/library").JsonValue;
            startTime: string;
            endTime: string;
            breakTime: number | null;
        }[];
        employees: {
            email: string | null;
            id: number;
            name: string;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            rfc: string;
            address: string | null;
            phone: string | null;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            bankAccount: string | null;
            taxRegime: string | null;
            employeeNumber: string;
            position: string;
            department: string;
            hireDate: Date;
            contractType: import(".prisma/client").$Enums.ContractType;
            workSchedule: string | null;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            dateOfBirth: Date | null;
            emergencyContact: string | null;
            bankName: string | null;
            clabe: string | null;
        }[];
        areas?: undefined;
        departments?: undefined;
        positions?: undefined;
        benefits?: undefined;
        benefitGroups?: undefined;
    } | null>;
    static skipSection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=companyWizardController.d.ts.map