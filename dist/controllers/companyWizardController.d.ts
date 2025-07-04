import { Request, Response } from 'express';
export declare class CompanyWizardController {
    static initializeWizard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getWizardStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateWizardStep(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static completeWizard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSectionData(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSectionSpecificData(companyId: number, sectionNumber: number): Promise<any>;
    static skipSection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=companyWizardController.d.ts.map