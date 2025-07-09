interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    constructor();
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendInvitationEmail(email: string, companyName: string, invitationLink: string): Promise<boolean>;
    private htmlToText;
    sendDepartmentHeadInvitationEmail(email: string, companyName: string, departmentName: string, invitationLink: string): Promise<boolean>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map