import { Request, Response } from 'express';
export declare const calendarController: {
    getAllCalendars(req: Request, res: Response): Promise<void>;
    getCalendarsByCompany(req: Request, res: Response): Promise<void>;
    getCalendarById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createCalendar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCalendar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCalendar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCalendarInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWorkingDaysInMonth(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    checkWorkingDay(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addHoliday(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateWorkDays(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    removeHoliday(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCalendarStats(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    calculateWorkingDaysInMonth(year: number, month: number, workDays: number[], holidays: any[]): number;
    calculateWorkingDaysInYear(year: number, workDays: number[], holidays: any[]): number;
    isWorkingDay(date: Date, workDays: number[], holidays: any[]): boolean;
    getDaysInYear(year: number): number;
    calculateWeekendsInYear(year: number, workDays: number[]): number;
};
//# sourceMappingURL=calendarController.d.ts.map