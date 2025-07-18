import { Request, Response } from 'express';
import { NotificationServiceStatic as NotificationService, getNotificationService } from '../services/notificationService';

interface AuthRequest extends Request {
  user?: any;
}

export class NotificationController {
  
  static async createNotification(req: AuthRequest, res: Response) {
    try {
      const {
        type,
        title,
        message,
        priority = 'medium',
        companyId,
        targetRole,
        userId
      } = req.body;

      // Validaciones básicas
      if (!type || !title || !message) {
        return res.status(400).json({ 
          error: 'Type, title and message are required' 
        });
      }

      // Usar el servicio de notificaciones que maneja tanto la BD como Socket.IO
      const notificationService = getNotificationService();
      
      // Si se especificó un userId específico, notificar al usuario
      if (userId) {
        await notificationService.notifyUser(userId, {
          type,
          title,
          message,
          priority,
          data: { companyId, targetRole, createdBy: req.user!.id }
        });
        
        res.status(201).json({
          message: 'Notification created successfully',
          data: { userId, type, title, message }
        });
      } 
      // Si se especificó targetRole y companyId, notificar al rol
      else if (targetRole && companyId) {
        await notificationService.notifyCompanyRole(companyId, targetRole, {
          type,
          title,
          message,
          priority,
          data: { companyId, targetRole, createdBy: req.user!.id }
        });
        
        res.status(201).json({
          message: 'Notification created successfully',
          data: { targetRole, companyId, type, title, message }
        });
      } else {
        // Si no se especifica ni userId ni targetRole, usar el método estático anterior
        const notification = await NotificationService.createNotification({
          type,
          title,
          message,
          priority,
          companyId,
          targetRole,
          userId,
          createdBy: req.user!.id
        });

        res.status(201).json({
          message: 'Notification created successfully',
          data: notification
        });
      }
    } catch (error: any) {
      console.error('Create notification error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to create notification' 
      });
    }
  }
  
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      const unreadOnly = req.query.unread === 'true';
      
      console.log('GetNotifications - User:', req.user);
      console.log('GetNotifications - Query:', req.query);
      
      // Si es cliente, solo ver notificaciones de su empresa
      const companyId = req.user?.role === 'CLIENT' ? req.user.companyId : undefined;
      
      console.log('GetNotifications - CompanyId:', companyId);
      console.log('GetNotifications - UserId:', req.user!.id);
      
      const notifications = await NotificationService.getNotifications(
        companyId,
        req.user!.id,
        unreadOnly
      );
      
      console.log('GetNotifications - Found notifications:', notifications.length);
      
      res.json({
        message: 'Notifications retrieved successfully',
        data: notifications
      });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: error.message || 'Failed to get notifications' });
    }
  }
  
  static async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      
      // Verificar que el usuario solo pueda ver sus propias notificaciones
      if (userId !== req.user!.id && req.user!.role !== 'OPERATOR') {
        return res.status(403).json({ 
          error: 'You can only view your own notifications' 
        });
      }
      
      const notifications = await NotificationService.getUserNotifications(userId);
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error: any) {
      console.error('Get user notifications error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to get user notifications' 
      });
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