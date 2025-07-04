export declare class CompanyWizardService {
    static initializeWizard(companyId: number): Promise<{
        id: number;
        companyId: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WizardStatus;
        currentSection: number;
        currentStep: number;
        wizardData: import("@prisma/client/runtime/library").JsonValue;
        completedAt: Date | null;
    }>;
    static getWizardStatus(companyId: number): Promise<{
        sectionProgress: ({
            steps: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.StepStatus;
                completedAt: Date | null;
                isOptional: boolean;
                sectionId: number;
                stepNumber: number;
                stepName: string;
                stepData: import("@prisma/client/runtime/library").JsonValue;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SectionStatus;
            completedAt: Date | null;
            wizardId: number;
            sectionNumber: number;
            sectionName: string;
            isOptional: boolean;
        })[];
    } & {
        id: number;
        companyId: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WizardStatus;
        currentSection: number;
        currentStep: number;
        wizardData: import("@prisma/client/runtime/library").JsonValue;
        completedAt: Date | null;
    }>;
    static updateWizardStep(companyId: number, sectionNumber: number, stepNumber: number, stepData: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StepStatus;
        completedAt: Date | null;
        isOptional: boolean;
        sectionId: number;
        stepNumber: number;
        stepName: string;
        stepData: import("@prisma/client/runtime/library").JsonValue;
    }>;
    static processStepData(companyId: number, sectionNumber: number, stepNumber: number, stepData: any): Promise<void>;
    static processGeneralInfoData(companyId: number, stepNumber: number, stepData: any): Promise<void>;
    static processTaxObligationsData(companyId: number, stepNumber: number, stepData: any): Promise<void>;
    static processBankData(companyId: number, stepData: any): Promise<void>;
    static processDigitalCertificateData(companyId: number, stepData: any): Promise<void>;
    static processOrganizationalData(companyId: number, stepNumber: number, stepData: any): Promise<void>;
    static processBenefitsData(companyId: number, stepNumber: number, stepData: any): Promise<void>;
    static processPayrollData(companyId: number, stepData: any): Promise<void>;
    static processHRData(companyId: number, stepNumber: number, stepData: any): Promise<void>;
    static completeWizard(companyId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=companyWizardService.d.ts.map