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
}

export class NotificationService {
  
  static async createNotification(data: CreateNotificationRequest) {
    const notification = await prisma.notification.create({
      data: {
        type: data.type as any,
        title: data.title,
        message: data.message,
        priority: (data.priority as any) || 'NORMAL',
        companyId: data.companyId,
        payrollId: data.payrollId,
        metadata: data.metadata
      }
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