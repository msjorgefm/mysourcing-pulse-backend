"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationService {
    static async createNotification(data) {
        const notification = await prisma.notification.create({
            data: {
                type: data.type,
                title: data.title,
                message: data.message,
                priority: data.priority || 'NORMAL',
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
    static async createPayrollNotification(data) {
        return this.createNotification({
            ...data,
            priority: 'HIGH'
        });
    }
    static async getNotifications(companyId, userId, unreadOnly = false) {
        const where = {};
        if (companyId)
            where.companyId = companyId;
        if (unreadOnly)
            where.read = false;
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
        return notifications.map((notification) => ({
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
    static async markAsRead(notificationId) {
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
    static async markAllAsRead(companyId) {
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
    static async deleteNotification(notificationId) {
        await prisma.notification.delete({
            where: { id: notificationId }
        });
        return {
            message: 'Notification deleted successfully',
            notificationId
        };
    }
    static async cleanOldNotifications(daysOld = 30) {
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
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map