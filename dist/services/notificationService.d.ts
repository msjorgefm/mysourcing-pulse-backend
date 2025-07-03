export interface CreateNotificationRequest {
    type: string;
    title: string;
    message: string;
    companyId?: number;
    payrollId?: number;
    priority?: string;
    metadata?: any;
}
export declare class NotificationService {
    static createNotification(data: CreateNotificationRequest): Promise<{
        id: number;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        priority: import(".prisma/client").$Enums.NotificationPriority;
        read: boolean;
        companyId: number | null;
        payrollId: number | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }>;
    static createPayrollNotification(data: CreateNotificationRequest): Promise<{
        id: number;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        priority: import(".prisma/client").$Enums.NotificationPriority;
        read: boolean;
        companyId: number | null;
        payrollId: number | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }>;
    static getNotifications(companyId?: number, userId?: number, unreadOnly?: boolean): Promise<{
        id: any;
        type: any;
        title: any;
        message: any;
        priority: any;
        read: any;
        companyId: any;
        companyName: any;
        payrollId: any;
        payrollInfo: any;
        metadata: any;
        createdAt: any;
        readAt: any;
    }[]>;
    static markAsRead(notificationId: number): Promise<{
        id: number;
        read: boolean;
        readAt: Date | null;
    }>;
    static markAllAsRead(companyId: number): Promise<{
        updatedCount: number;
    }>;
    static deleteNotification(notificationId: number): Promise<{
        message: string;
        notificationId: number;
    }>;
    static cleanOldNotifications(daysOld?: number): Promise<{
        deletedCount: number;
        cutoffDate: Date;
    }>;
}
//# sourceMappingURL=notificationService.d.ts.map