import { Request, Response } from 'express';
import { requestService } from '../services/requestService';
import { logger } from '../utils/logger';
import { RequestStatus, RequestType, RequestPriority } from '@prisma/client';

interface AuthRequest extends Request {
  user?: any;
}

export const requestController = {
  // Crear nueva solicitud
  async createRequest(req: AuthRequest, res: Response) {
    try {

      const { type, priority, subject, description, dueDate, customFields } = req.body;
      const userId = req.user?.id;
      const userName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        return res.status(400).json({
          error: 'Usuario o empresa no identificados'
        });
      }

      // Procesar archivos adjuntos si existen
      const files = (req as any).files;
      const attachments = [];
      
      if (files && files.length > 0) {
        // Filtrar solo los archivos que son del campo 'attachments'
        const attachmentFiles = files.filter((file: any) => file.fieldname === 'attachments');
        
        for (const file of attachmentFiles) {
          attachments.push({
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            path: file.filename,
            url: `/api/requests/attachments/${file.filename}`,
            uploadedById: userId,
            uploadedByName: userName
          });
        }
      }

      const request = await requestService.createRequest({
        type,
        priority,
        subject,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        customFields,
        clientId: userId,
        clientName: userName,
        companyId,
        attachments
      });

      res.status(201).json({
        message: 'Solicitud creada exitosamente',
        request,
        success: true
      });
    } catch (error) {
      logger.error('Error creating request:', error);
      res.status(500).json({
        error: 'Error al crear la solicitud'
      });
    }
  },

  // Obtener solicitudes con filtros
  async getRequests(req: AuthRequest, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        status,
        type,
        priority,
        dateFrom,
        dateTo,
        search,
        clientId,
        assignedToId
      } = req.query;

      const userRole = req.user?.role;
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      // Construir filtros según el rol del usuario
      const filters: any = {};

      // Los clientes solo ven sus propias solicitudes
      if (userRole === 'CLIENT') {
        filters.clientId = userId;
      } else if (userRole === 'OPERATOR') {
        // Los operadores ven las solicitudes de las empresas que tienen asignadas
        const operatorCompanies = await requestService.getOperatorCompanies(userId);
        console.log('Operador ID:', userId);
        console.log('Empresas asignadas al operador:', operatorCompanies);
        if (operatorCompanies.length > 0) {
          filters.companyIds = operatorCompanies;
        } else {
          // Si no tiene empresas asignadas, usar un ID imposible para no mostrar nada
          filters.companyIds = [-1];
        }
      } else if (userRole === 'ADMIN') {
        // Los admins ven las solicitudes de las empresas que gestionan
        const adminCompanies = await requestService.getAdminCompanies(userId);
        console.log('Admin ID:', userId);
        console.log('Empresas gestionadas por el admin:', adminCompanies);
        if (adminCompanies.length > 0) {
          filters.companyIds = adminCompanies;
        } else if (companyId) {
          // Si no gestiona empresas pero tiene companyId, usar ese
          filters.companyId = companyId;
        } else {
          // Si no gestiona empresas y no tiene companyId, no mostrar nada
          filters.companyIds = [-1];
        }
      }

      // Aplicar filtros adicionales
      if (status) filters.status = status as RequestStatus;
      if (type) filters.type = type as RequestType;
      if (priority) filters.priority = priority as RequestPriority;
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);
      if (search) filters.search = search as string;
      if (clientId && userRole !== 'CLIENT') filters.clientId = parseInt(clientId as string);
      if (assignedToId && userRole === 'ADMIN') filters.assignedToId = parseInt(assignedToId as string);

      const result = await requestService.getRequests(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json(result);
    } catch (error) {
      logger.error('Error getting requests:', error);
      res.status(500).json({
        error: 'Error al obtener las solicitudes'
      });
    }
  },

  // Obtener solicitud por ID
  async getRequestById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;
      const userId = req.user?.id;

      const request = await requestService.getRequestById(parseInt(id));

      // Verificar permisos de acceso
      if (userRole === 'CLIENT' && request.clientId !== userId) {
        return res.status(403).json({
          error: 'No tiene permisos para ver esta solicitud'
        });
      } else if (userRole === 'OPERATOR') {
        // Verificar si el operador tiene acceso a la empresa de la solicitud
        const operatorCompanies = await requestService.getOperatorCompanies(userId);
        if (!operatorCompanies.includes(request.companyId)) {
          return res.status(403).json({
            error: 'No tiene permisos para ver esta solicitud'
          });
        }
      } else if (userRole === 'ADMIN') {
        // Verificar si el admin gestiona la empresa de la solicitud
        const adminCompanies = await requestService.getAdminCompanies(userId);
        const userCompanyId = req.user?.companyId;
        if (!adminCompanies.includes(request.companyId) && request.companyId !== userCompanyId) {
          return res.status(403).json({
            error: 'No tiene permisos para ver esta solicitud'
          });
        }
      }

      res.json(request);
    } catch (error) {
      logger.error('Error getting request by ID:', error);
      if (error instanceof Error && error.message === 'Request not found') {
        res.status(404).json({
          error: 'Solicitud no encontrada'
        });
      } else {
        res.status(500).json({
          error: 'Error al obtener la solicitud'
        });
      }
    }
  },

  // Actualizar solicitud
  async updateRequest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;
      const userName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email;
      const userRole = req.user?.role;

      // Obtener la solicitud actual para verificar permisos
      const currentRequest = await requestService.getRequestById(parseInt(id));

      // Verificar permisos según el rol
      if (userRole === 'CLIENT') {
        // Los clientes solo pueden cancelar sus propias solicitudes abiertas
        if (currentRequest.clientId !== userId) {
          return res.status(403).json({
            error: 'No tiene permisos para modificar esta solicitud'
          });
        }
        if (updateData.status && updateData.status !== 'CANCELLED') {
          return res.status(403).json({
            error: 'Solo puede cancelar sus solicitudes'
          });
        }
        if (currentRequest.status !== 'OPEN') {
          return res.status(403).json({
            error: 'Solo puede cancelar solicitudes abiertas'
          });
        }
      } else if (userRole === 'OPERATOR') {
        // Los operadores pueden actualizar solicitudes de las empresas que tienen asignadas
        const operatorCompanies = await requestService.getOperatorCompanies(userId);
        if (!operatorCompanies.includes(currentRequest.companyId)) {
          return res.status(403).json({
            error: 'No tiene permisos para modificar esta solicitud'
          });
        }
      } else if (userRole === 'ADMIN') {
        // Los admins pueden actualizar solicitudes de las empresas que gestionan
        const adminCompanies = await requestService.getAdminCompanies(userId);
        const userCompanyId = req.user?.companyId;
        if (!adminCompanies.includes(currentRequest.companyId) && currentRequest.companyId !== userCompanyId) {
          return res.status(403).json({
            error: 'No tiene permisos para modificar esta solicitud'
          });
        }
      }

      const request = await requestService.updateRequest(
        parseInt(id),
        updateData,
        userId,
        userName
      );

      res.json({
        message: 'Solicitud actualizada exitosamente',
        request
      });
    } catch (error) {
      logger.error('Error updating request:', error);
      res.status(500).json({
        error: 'Error al actualizar la solicitud'
      });
    }
  },

  // Agregar comentario
  async addComment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const userId = req.user?.id;
      const userName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email;
      const userRole = req.user?.role;

      if (!text || !text.trim()) {
        return res.status(400).json({
          error: 'El comentario no puede estar vacío'
        });
      }

      // Verificar permisos
      const request = await requestService.getRequestById(parseInt(id));
      
      if (userRole === 'CLIENT' && request.clientId !== userId) {
        return res.status(403).json({
          error: 'No tiene permisos para comentar en esta solicitud'
        });
      } else if (userRole === 'OPERATOR') {
        // Los operadores pueden comentar en solicitudes de las empresas que tienen asignadas
        const operatorCompanies = await requestService.getOperatorCompanies(userId);
        if (!operatorCompanies.includes(request.companyId)) {
          return res.status(403).json({
            error: 'No tiene permisos para comentar en esta solicitud'
          });
        }
      } else if (userRole === 'ADMIN') {
        // Los admins pueden comentar en solicitudes de las empresas que gestionan
        const adminCompanies = await requestService.getAdminCompanies(userId);
        const userCompanyId = req.user?.companyId;
        if (!adminCompanies.includes(request.companyId) && request.companyId !== userCompanyId) {
          return res.status(403).json({
            error: 'No tiene permisos para comentar en esta solicitud'
          });
        }
      }

      const comment = await requestService.addComment(parseInt(id), {
        text,
        userId,
        userName,
        userRole
      });

      res.status(201).json({
        message: 'Comentario agregado exitosamente',
        comment
      });
    } catch (error) {
      logger.error('Error adding comment:', error);
      res.status(500).json({
        error: 'Error al agregar el comentario'
      });
    }
  },

  // Obtener estadísticas
  async getRequestStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const companyId = req.user?.companyId;

      let stats;

      // Obtener estadísticas según el rol del usuario
      if (userRole === 'CLIENT') {
        // Para clientes: estadísticas de sus propias solicitudes
        stats = await requestService.getRequestStatsByUser(userId);
      } else if (userRole === 'OPERATOR') {
        // Para operadores: estadísticas de las solicitudes asignadas a ellos
        stats = await requestService.getRequestStatsByOperator(userId);
      } else if (userRole === 'ADMIN') {
        // Para administradores: estadísticas de toda la empresa (si tienen companyId)
        if (companyId) {
          stats = await requestService.getRequestStats(companyId);
        } else {
          // Si no tienen companyId, obtener estadísticas generales
          stats = await requestService.getRequestStatsGeneral();
        }
      } else {
        return res.status(403).json({
          error: 'No tiene permisos para ver estadísticas'
        });
      }

      res.json(stats);
    } catch (error) {
      logger.error('Error getting request stats:', error);
      res.status(500).json({
        error: 'Error al obtener las estadísticas'
      });
    }
  },

  // Asignar solicitud a operador
  async assignRequest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { operatorId, operatorName } = req.body;
      const assignedBy = req.user?.id;
      const assignedByName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email;
      const userRole = req.user?.role;

      // Solo admins pueden asignar solicitudes
      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          error: 'No tiene permisos para asignar solicitudes'
        });
      }

      const request = await requestService.assignRequest(
        parseInt(id),
        operatorId,
        operatorName,
        assignedBy,
        assignedByName
      );

      res.json({
        message: 'Solicitud asignada exitosamente',
        request
      });
    } catch (error) {
      logger.error('Error assigning request:', error);
      res.status(500).json({
        error: 'Error al asignar la solicitud'
      });
    }
  },

  // Obtener solicitudes del usuario actual
  async getMyRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const requests = await requestService.getRequestsByUser(userId, userRole);

      res.json(requests);
    } catch (error) {
      logger.error('Error getting user requests:', error);
      res.status(500).json({
        error: 'Error al obtener las solicitudes del usuario'
      });
    }
  }
};