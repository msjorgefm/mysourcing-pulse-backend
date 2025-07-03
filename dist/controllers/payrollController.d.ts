import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare class PayrollController {
    static getAllPayrolls(req: AuthRequest, res: Response): Promise<void>;
    static getPayrollById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createPayroll(req: AuthRequest, res: Response): Promise<void>;
    static calculatePayroll(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static sendForAuthorization(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static authorizePayroll(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getPayrollStats(req: AuthRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=payrollController.d.ts.map