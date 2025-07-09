import { Request, Response } from 'express';
export declare class OnboardingController {
    static validateInvitationToken(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static setupClientAccess(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static resendInvitation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=onboardingController.d.ts.map