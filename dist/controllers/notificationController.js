"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
class NotificationController {
    static async getNotifications(req, res) {
        try {
            const unreadOnly = req.query.unread === 'true';
            // Si es cliente, solo ver notificaciones de su empresa
            const companyId = req.user?.role === 'CLIENT' ? req.user.companyId : undefined;
            const notifications = await notificationService_1.NotificationService.getNotifications(companyId, req.user.id, unreadOnly);
            res.json({
                message: 'Notifications retrieved successfully',
                data: notifications
            });
        }
        catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: error.message || 'Failed to get notifications' });
        }
    }
    static async markAsRead(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid notification ID' });
            }
            const result = await notificationService_1.NotificationService.markAsRead(id);
            res.json({
                message: 'Notification marked as read',
                data: result
            });
        }
        catch (error) {
            console.error('Mark notification as read error:', error);
            res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
        }
    }
    static async markAllAsRead(req, res) {
        try {
            if (req.user?.role !== 'CLIENT') {
                return res.status(403).json({ error: 'Only clients can mark all notifications as read' });
            }
            const result = await notificationService_1.NotificationService.markAllAsRead(req.user.companyId);
            res.json({
                message: 'All notifications marked as read',
                data: result
            });
        }
        catch (error) {
            console.error('Mark all notifications as read error:', error);
            res.status(500).json({ error: error.message || 'Failed to mark all notifications as read' });
        }
    }
    static async deleteNotification(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid notification ID' });
            }
            const result = await notificationService_1.NotificationService.deleteNotification(id);
            res.json({
                message: result.message,
                data: { notificationId: result.notificationId }
            });
        }
        catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({ error: error.message || 'Failed to delete notification' });
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notificationController.js.map