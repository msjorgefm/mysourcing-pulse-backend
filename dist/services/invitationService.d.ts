export declare class InvitationService {
    static createAndSendInvitation(companyId: number, email: string, companyName: string): Promise<void>;
    static validateToken(token: string): Promise<{
        valid: boolean;
        companyId?: number;
        email?: string;
    }>;
    static markTokenAsUsed(token: string): Promise<void>;
    static getInvitationDetails(token: string): Promise<{
        email: string;
        company: {
            id: number;
            name: string;
            rfc: string;
        };
    } | null>;
    static getFullInvitationDetails(token: string): Promise<({
        company: {
            email: string;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            rfc: string;
            legalName: string;
            address: string;
            status: import(".prisma/client").$Enums.CompanyStatus;
            employeesCount: number;
        };
    } & {
        email: string;
        id: number;
        companyId: number;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        used: boolean;
        usedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }) | null>;
    static createDepartmentHeadInvitation(companyId: number, email: string, departmentId: number): Promise<any>;
}
//# sourceMappingURL=invitationService.d.ts.map