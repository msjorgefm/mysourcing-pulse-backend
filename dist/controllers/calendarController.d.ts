import { Request, Response } from 'express';
export declare const calendarController: {
    getCalendarsByCompany(req: Request, res: Response): Promise<void>;
    getCalendarById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createCalendar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCalendar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCalendar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCalendarPeriods(req: Request, res: Response): Promise<void>;
    getActivePeriods(req: Request, res: Response): Promise<void>;
    getCurrentPeriod(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createPeriod(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePeriod(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePeriod(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    generatePeriods(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    calculateWorkingDays(startDate: Date, endDate: Date): number;
};
//# sourceMappingURL=calendarController.d.ts.map