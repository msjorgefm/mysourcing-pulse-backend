import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare class NotificationController {
    static getNotifications(req: AuthRequest, res: Response): Promise<void>;
    static markAsRead(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static markAllAsRead(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteNotification(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export {};
//# sourceMappingURL=notificationController.d.ts.map