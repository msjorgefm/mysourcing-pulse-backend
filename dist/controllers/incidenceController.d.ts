import { Request, Response } from 'express';
export declare const incidenceController: {
    getIncidencesByPeriod(req: Request, res: Response): Promise<void>;
    createIncidence(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateIncidence(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteIncidence(req: Request, res: Response): Promise<void>;
    getIncidenceStats(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=incidenceController.d.ts.map