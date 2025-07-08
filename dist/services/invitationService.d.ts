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
}
//# sourceMappingURL=invitationService.d.ts.map