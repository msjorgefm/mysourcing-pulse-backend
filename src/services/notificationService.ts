import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationRequest {
  type: string;
  title: string;
  message: string;
  companyId?: number;
  payrollId?: number;
  priority?: string;
  metadata?: any;
  targetRole?: string;
  userId?: number;
  createdBy?: number;
}

export class NotificationService {
  
  static async createNotification(data: CreateNotificationRequest) {
    const notificationData: any = {
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'NORMAL',
      companyId: data.companyId,
      payrollId: data.payrollId,
      metadata: data.metadata || {}
    };

    // Agregar targetRole y userId al metadata si se proporcionan
    if (data.targetRole) {
      notificationData.metadata = {
        ...notificationData.metadata,
        targetRole: data.targetRole
      };
    }
    if (data.userId) {
      notificationData.metadata = {
        ...notificationData.metadata,
        userId: data.userId
      };
    }

    const notification = await prisma.notification.create({
      data: notificationData
    });
    
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      read: notification.read,
      companyId: notification.companyId,
      payrollId: notification.payrollId,
      metadata: notification.metadata,
      targetRole: (notification.metadata as any)?.targetRole,
      userId: (notification.metadata as any)?.userId,
      createdAt: notification.createdAt
    };
  }
  
  static async createPayrollNotification(data: CreateNotificationRequest) {
    return this.createNotification({
      ...data,
      priority: 'HIGH'
    });
  }
  
  static async getNotifications(companyId?: number, userId?: number, unreadOnly: boolean = false) {
    const where: any = {};
    
    if (companyId) where.companyId = companyId;
    if (unreadOnly) where.read = false;
    
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true }
        },
        payroll: {
          select: { id: true, period: true, totalNet: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return notifications.map((notification: any) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      read: notification.read,
      companyId: notification.companyId,
      companyName: notification.company?.name,
      payrollId: notification.payrollId,
      payrollInfo: notification.payroll,
      metadata: notification.metadata,
      targetRole: (notification.metadata as any)?.targetRole,
      userId: (notification.metadata as any)?.userId,
      createdAt: notification.createdAt,
      readAt: notification.readAt
    }));
  }
  
  static async markAsRead(notificationId: number) {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date()
      }
    });
    
    return {
      id: notification.id,
      read: notification.read,
      readAt: notification.readAt
    };
  }
  
  static async markAllAsRead(companyId: number) {
    const result = await prisma.notification.updateMany({
      where: {
        companyId: companyId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });
    
    return {
      updatedCount: result.count
    };
  }
  
  static async deleteNotification(notificationId: number) {
    await prisma.notification.delete({
      where: { id: notificationId }
    });
    
    return {
      message: 'Notification deleted successfully',
      notificationId
    };
  }
  
  static async cleanOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        read: true
      }
    });
    
    return {
      deletedCount: result.count,
      cutoffDate
    };
  }
}