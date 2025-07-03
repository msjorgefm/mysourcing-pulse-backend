import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

interface AuthRequest extends Request {
  user?: any;
}

export class NotificationController {
  
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      const unreadOnly = req.query.unread === 'true';
      
      // Si es cliente, solo ver notificaciones de su empresa
      const companyId = req.user?.role === 'CLIENT' ? req.user.companyId : undefined;
      
      const notifications = await NotificationService.getNotifications(
        companyId,
        req.user!.id,
        unreadOnly
      );
      
      res.json({
        message: 'Notifications retrieved successfully',
        data: notifications
      });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: error.message || 'Failed to get notifications' });
    }
  }
  
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid notification ID' });
      }
      
      const result = await NotificationService.markAsRead(id);
      
      res.json({
        message: 'Notification marked as read',
        data: result
      });
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
    }
  }
  
  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'CLIENT') {
        return res.status(403).json({ error: 'Only clients can mark all notifications as read' });
      }
      
      const result = await NotificationService.markAllAsRead(req.user.companyId);
      
      res.json({
        message: 'All notifications marked as read',
        data: result
      });
    } catch (error: any) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: error.message || 'Failed to mark all notifications as read' });
    }
  }
  
  static async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid notification ID' });
      }
      
      const result = await NotificationService.deleteNotification(id);
      
      res.json({
        message: result.message,
        data: { notificationId: result.notificationId }
      });
    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete notification' });
    }
  }
}