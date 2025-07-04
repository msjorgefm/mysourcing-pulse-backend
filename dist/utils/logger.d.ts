import winston from 'winston';
export declare const logger: winston.Logger;
export declare const logRequest: (req: any, res: any) => void;
export declare const logError: (error: Error, context?: any) => void;
export declare const logPayrollAction: (action: string, payrollId: number, userId: number, details?: any) => void;
export declare const logIncidenceAction: (action: string, incidenceId: number, employeeId: number, userId: number) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map