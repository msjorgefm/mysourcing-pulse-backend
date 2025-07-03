import { Request, Response, NextFunction } from 'express';
export declare const validateEmployee: (data: any) => {
    isValid: boolean;
    errors: string[];
};
export declare const validateIncidence: (data: any) => {
    isValid: boolean;
    errors: string[];
};
export declare const validatePayrollCalendar: (data: any) => {
    isValid: boolean;
    errors: string[];
};
export declare const validatePayrollPeriod: (data: any) => {
    isValid: boolean;
    errors: string[];
};
export declare const validateEmployeeParams: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateIncidenceParams: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateCalendarParams: (req: Request, res: Response, next: NextFunction) => void;
export declare const validatePeriodParams: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateCalendarQuery: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateGeneratePeriods: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map