import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare class CompanyController {
    static getAllCompanies(req: AuthRequest, res: Response): Promise<void>;
    static getCompanyById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createCompany(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateCompany(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteCompany(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getCompanyStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export {};
//# sourceMappingURL=companyController.d.ts.map