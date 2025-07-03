import { Request, Response } from 'express';
export declare const employeeController: {
    getEmployeesByCompany(req: Request, res: Response): Promise<void>;
    createEmployee(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateEmployee(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteEmployee(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=employeeController.d.ts.map