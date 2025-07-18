// src/services/notificationService.ts
import { PrismaClient, NotificationType, NotificationPriority, UserRole } from '@prisma/client';
import { Server } from 'socket.io';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority?: NotificationPriority;
}

export class NotificationServiceInstance {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Enviar notificación a un usuario específico
   */
  async notifyUser(userId: number, notification: NotificationData & { companyId?: number }) {
    try {
      console.log(`NotificationService.notifyUser - userId: ${userId}`);
      console.log('NotificationService.notifyUser - data:', notification);
      
      // Obtener el companyId del usuario si no se proporciona
      let companyId = notification.companyId;
      if (!companyId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { companyId: true }
        });
        companyId = user?.companyId || undefined;
      }
      
      // Guardar en base de datos
      const savedNotification = await prisma.notification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          read: false,
          priority: notification.priority || 'NORMAL',
          companyId: companyId
        }
      });
      
      console.log('Notificación guardada:', savedNotification);

      // Emitir por socket con companyId incluido
      this.io.to(`user_${userId}`).emit('notification', {
        ...savedNotification,
        companyId: companyId
      });
      
      logger.info(`Notification sent to user ${userId}: ${notification.type}`);
    } catch (error) {
      logger.error('Error sending notification to user:', error);
    }
  }

  /**
   * Enviar notificación a todos los usuarios de una empresa con un rol específico
   */
  async notifyCompanyRole(companyId: number, role: UserRole, notification: NotificationData) {
    try {
      // Obtener usuarios de la empresa con el rol especificado
      const users = await prisma.user.findMany({
        where: {
          companyId,
          role
        }
      });

      // Crear notificaciones para cada usuario
      const notifications = await Promise.all(
        users.map(user => 
          prisma.notification.create({
            data: {
              userId: user.id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              data: notification.data || {},
              read: false,
              priority: notification.priority || 'NORMAL',
              companyId: companyId
            }
          })
        )
      );

      // Emitir por socket a cada usuario y a la sala del rol
      notifications.forEach((savedNotification, index) => {
        const userId = users[index].id;
        // Emitir a cada usuario individualmente con la notificación completa incluyendo companyId
        this.io.to(`user_${userId}`).emit('notification', {
          ...savedNotification,
          companyId: companyId
        });
      });
      
      // También emitir a la sala del rol
      this.io.to(`company_${companyId}_${role.toLowerCase()}s`).emit('notification', {
        ...notification,
        companyId: companyId
      });
      
      logger.info(`Notification sent to ${users.length} ${role} users in company ${companyId}`);
    } catch (error) {
      logger.error('Error sending notification to company role:', error);
    }
  }

  /**
   * Enviar notificación a todos los usuarios de una empresa
   */
  async notifyCompany(companyId: number, notification: NotificationData) {
    try {
      // Obtener todos los usuarios de la empresa
      const users = await prisma.user.findMany({
        where: { companyId }
      });

      // Crear notificaciones para cada usuario
      const notifications = await Promise.all(
        users.map(user => 
          prisma.notification.create({
            data: {
              userId: user.id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              data: notification.data || {},
              read: false,
              priority: notification.priority || 'NORMAL'
            }
          })
        )
      );

      // Emitir por socket
      this.io.to(`company_${companyId}`).emit('notification', notification);
      
      logger.info(`Notification sent to ${users.length} users in company ${companyId}`);
    } catch (error) {
      logger.error('Error sending notification to company:', error);
    }
  }

  /**
   * Notificaciones específicas para cambios de estado de período
   */
  async notifyPeriodStatusChange(
    periodId: number, 
    oldStatus: string, 
    newStatus: string,
    companyId: number,
    companyName: string,
    periodNumber: number
  ) {
    const statusMessages = {
      EN_REVISION: 'cerrado para revisión',
      CERRADO: 'aprobado y cerrado',
      RECHAZADA: 'rechazado',
      EN_INCIDENCIA: 'reabierto para incidencias'
    };

    // Definir mensajes específicos según la transición
    let message = '';
    let notifyOperator = false;
    let notifyClient = false;
    
    if (oldStatus === 'EN_INCIDENCIA' && newStatus === 'EN_REVISION') {
      // Cliente cerró período de incidencias -> Notificar al operador asignado
      message = `La empresa ${companyName} cerró el período de incidencias del calendario - Período ${periodNumber}. Ya puedes realizar el proceso de cierre del período.`;
      notifyOperator = true;
    } else if (oldStatus === 'EN_REVISION' && newStatus === 'EN_INCIDENCIA') {
      // Cliente rechazó las incidencias -> Notificar al operador con prioridad alta
      message = `La empresa ${companyName} ha rechazado las incidencias del período ${periodNumber}.`;
      notifyOperator = true;
    } else if (newStatus === 'CERRADO') {
      // Período cerrado -> Notificar a ambos
      message = `El período ${periodNumber} de ${companyName} ha sido cerrado definitivamente.`;
      notifyOperator = true;
      notifyClient = true;
    } else {
      // Otros cambios
      message = `El período ${periodNumber} de ${companyName} ha sido ${statusMessages[newStatus as keyof typeof statusMessages]}`;
      notifyOperator = true;
      notifyClient = true;
    }

    const notification: NotificationData = {
      type: NotificationType.PERIOD_STATUS_CHANGED,
      title: newStatus === 'RECHAZADA' || newStatus === 'EN_INCIDENCIA' ? 'Incidencias Rechazadas' : 'Estado de Período Actualizado',
      message,
      data: {
        periodId,
        periodNumber,
        oldStatus,
        newStatus,
        companyId,
        companyName
      },
      priority: (newStatus === 'RECHAZADA' || (oldStatus === 'EN_REVISION' && newStatus === 'EN_INCIDENCIA')) ? 'HIGH' : 'NORMAL'
    };

    // Notificar solo a los roles correspondientes y solo al operador asignado
    if (notifyOperator) {
      // Obtener el operador asignado a la empresa
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { managedByAdminId: true }
      });
      
      if (company?.managedByAdminId) {
        console.log(`Enviando notificación al operador asignado: ${company.managedByAdminId}`);
        console.log('Datos de la notificación:', notification);
        // Obtener instancia del servicio
        const service = getNotificationService();
        await service.notifyUser(company.managedByAdminId, notification);
      }
    }
    
    if (notifyClient) {
      // Obtener instancia del servicio
      const service = getNotificationService();
      await service.notifyCompanyRole(companyId, UserRole.CLIENT, notification);
    }

    // Emitir evento de cambio de estado del período por Socket.IO
    this.io.to(`company_${companyId}`).emit('periodStatusChanged', {
      periodId,
      oldStatus,
      newStatus,
      periodNumber,
      companyId,
      timestamp: new Date()
    });
    
    // También emitir a operadores asignados
    this.io.to(`company_${companyId}_operators`).emit('periodStatusChanged', {
      periodId,
      oldStatus,
      newStatus,
      periodNumber,
      companyId,
      timestamp: new Date()
    });
  }

  /**
   * Notificación para carga de archivos
   */
  async notifyFileUploaded(
    type: 'prenomina' | 'layouts',
    periodId: number,
    periodNumber: number,
    companyId: number,
    companyName: string,
    fileName: string
  ) {
    const notification: NotificationData = {
      type: type === 'prenomina' ? NotificationType.PRENOMINA_UPLOADED : NotificationType.LAYOUTS_UPLOADED,
      title: `${type === 'prenomina' ? 'Prenómina' : 'Layouts Bancarios'} Cargado`,
      message: `Se ha cargado el archivo de ${type === 'prenomina' ? 'prenómina' : 'layouts bancarios'} para el período ${periodNumber}`,
      data: {
        periodId,
        periodNumber,
        companyId,
        companyName,
        fileName
      }
    };

    // Notificar solo a clientes
    await this.notifyCompanyRole(companyId, UserRole.CLIENT, notification);
  }

  /**
   * Notificación específica para prenómina lista para revisión
   */
  async notifyPrenominaReadyForReview(
    periodId: number,
    periodNumber: number,
    companyId: number,
    companyName: string,
    fileName: string
  ) {
    const notification: NotificationData = {
      type: NotificationType.PRENOMINA_UPLOADED,
      title: 'Prenómina Lista para Revisión',
      message: `La prenómina del período ${periodNumber} está lista para su revisión y aprobación`,
      data: {
        periodId,
        periodNumber,
        companyId,
        companyName,
        fileName,
        requiresAction: true
      },
      priority: 'HIGH'
    };

    // Notificar a todos los clientes de la empresa
    await this.notifyCompanyRole(companyId, UserRole.CLIENT, notification);
    
    // También emitir evento de cambio de estado
    this.io.to(`company_${companyId}`).emit('periodStatusChanged', {
      periodId,
      oldStatus: 'CERRADO',
      newStatus: 'EN_REVISION_PRENOMINA',
      periodNumber,
      companyId,
      timestamp: new Date()
    });
  }

  /**
   * Notificación específica para layouts listos para revisión
   */
  async notifyLayoutsReadyForReview(
    periodId: number,
    periodNumber: number,
    companyId: number,
    companyName: string,
    fileName: string
  ) {
    const notification: NotificationData = {
      type: 'LAYOUTS_REVIEW_REQUEST' as any,
      title: 'Layouts Bancarios Listos para Revisión',
      message: `Los layouts bancarios del período ${periodNumber} están listos para su revisión y aprobación`,
      data: {
        periodId,
        periodNumber,
        companyId,
        companyName,
        fileName,
        requiresAction: true
      },
      priority: 'HIGH'
    };

    // Notificar a todos los clientes de la empresa
    await this.notifyCompanyRole(companyId, UserRole.CLIENT, notification);
    
    // También emitir evento de cambio de estado
    this.io.to(`company_${companyId}`).emit('periodStatusChanged', {
      periodId,
      oldStatus: 'PRENOMINA_APROBADA',
      newStatus: 'EN_REVISION_LAYOUTS',
      periodNumber,
      companyId,
      timestamp: new Date()
    });
  }
}

// Singleton para el servicio
let notificationService: NotificationServiceInstance;

export const initNotificationService = (io: Server) => {
  notificationService = new NotificationServiceInstance(io);
  return notificationService;
};

export const getNotificationService = () => {
  if (!notificationService) {
    throw new Error('NotificationService not initialized');
  }
  return notificationService;
};

// Static methods for controller use
export class NotificationServiceStatic {
  static async createNotification(data: {
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    companyId?: number;
    targetRole?: UserRole;
    userId?: number;
    createdBy: number;
  }) {
    try {
      // Si se especifica un userId específico, crear notificación directa
      if (data.userId) {
        return await prisma.notification.create({
          data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            priority: data.priority || 'NORMAL',
            companyId: data.companyId,
            metadata: {
              createdBy: data.createdBy,
              targetRole: data.targetRole
            }
          }
        });
      }
      
      // Si se especifica targetRole y companyId, crear notificaciones para ese rol
      if (data.targetRole && data.companyId) {
        const users = await prisma.user.findMany({
          where: {
            companyId: data.companyId,
            role: data.targetRole,
            isActive: true
          }
        });
        
        const notifications = await prisma.notification.createMany({
          data: users.map(user => ({
            userId: user.id,
            type: data.type,
            title: data.title,
            message: data.message,
            priority: data.priority || 'NORMAL',
            companyId: data.companyId,
            metadata: {
              createdBy: data.createdBy,
              targetRole: data.targetRole
            }
          }))
        });
        
        return { count: notifications.count, targetRole: data.targetRole };
      }
      
      throw new Error('Must specify either userId or both targetRole and companyId');
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }
  
  static async getNotifications(companyId?: number, userId?: number, unreadOnly?: boolean) {
    try {
      const where: any = {};
      
      if (companyId) where.companyId = companyId;
      if (userId) where.userId = userId;
      if (unreadOnly) where.read = false;
      
      return await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limit to last 50 notifications
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      throw error;
    }
  }
  
  static async getUserNotifications(userId: number) {
    try {
      return await prisma.notification.findMany({
        where: {
          userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }
  
  static async markAsRead(notificationId: number) {
    try {
      return await prisma.notification.update({
        where: {
          id: notificationId
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  static async markAllAsRead(companyId: number) {
    try {
      return await prisma.notification.updateMany({
        where: {
          companyId,
          read: false
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  static async deleteNotification(notificationId: number) {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId
        }
      });
      
      return {
        message: 'Notification deleted successfully',
        notificationId
      };
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }
}

// Export the static class as NotificationService for controller use
export { NotificationServiceStatic as NotificationService };