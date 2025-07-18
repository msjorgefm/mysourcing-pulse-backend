import { PrismaClient, Request, RequestStatus, RequestType, RequestPriority, UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Helper function to translate request status to Spanish
const translateRequestStatus = (status: RequestStatus): string => {
  const statusTranslations: Record<RequestStatus, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En Progreso',
    PENDING_INFO: 'Pendiente de Información',
    RESOLVED: 'Resuelto',
    CANCELLED: 'Cancelado'
  };
  
  return statusTranslations[status] || status;
};

interface CreateRequestDto {
  type: RequestType;
  priority: RequestPriority;
  subject: string;
  description: string;
  dueDate?: Date;
  customFields?: any;
  clientId: number;
  clientName: string;
  companyId: number;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    path: string;
    url: string;
    uploadedById: number;
    uploadedByName: string;
  }>;
}

interface UpdateRequestDto {
  status?: RequestStatus;
  assignedToId?: number;
  assignedToName?: string;
  subject?: string;
  description?: string;
  priority?: RequestPriority;
  dueDate?: Date;
  customFields?: any;
}

interface CreateCommentDto {
  text: string;
  userId: number;
  userName: string;
  userRole: UserRole;
}

interface RequestFilters {
  companyId?: number;
  companyIds?: number[]; // Para filtrar por múltiples empresas (operadores)
  clientId?: number;
  assignedToId?: number;
  status?: RequestStatus;
  type?: RequestType;
  priority?: RequestPriority;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export class RequestService {
  // Generar folio único
  private generateFolio(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REQ-${year}${month}${day}-${random}`;
  }

  // Crear una nueva solicitud
  async createRequest(data: CreateRequestDto) {
    try {
      const folio = this.generateFolio();

      // Buscar el operador asignado a la empresa del cliente
      const operatorAssignment = await prisma.operatorCompany.findFirst({
        where: {
          companyId: data.companyId,
          isActive: true
        },
        include: {
          operator: true
        }
      });

      // Preparar datos de la solicitud
      const requestData: any = {
        folio,
        type: data.type,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
        dueDate: data.dueDate,
        customFields: data.customFields,
        clientId: data.clientId,
        clientName: data.clientName,
        companyId: data.companyId,
        history: {
          create: {
            action: 'CREATED',
            details: 'Solicitud creada',
            userId: data.clientId,
            userName: data.clientName
          }
        }
      };

      // Si hay un operador asignado a la empresa, asignar la solicitud automáticamente
      if (operatorAssignment && operatorAssignment.operator) {
        requestData.assignedToId = operatorAssignment.operatorId;
        requestData.assignedToName = `${operatorAssignment.operator.firstName || ''} ${operatorAssignment.operator.lastName || ''}`.trim() || 
          operatorAssignment.operator.email;
        requestData.status = 'IN_PROGRESS'; // Cambiar estado a en proceso
        
        logger.info(`Auto-assigning request to operator: ${requestData.assignedToName} (ID: ${operatorAssignment.operatorId})`);
      }

      const request = await prisma.request.create({
        data: requestData,
        include: {
          client: true,
          company: true,
          assignedTo: true,
          comments: {
            include: {
              user: true,
              attachments: true
            }
          },
          attachments: true,
          history: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      // Crear archivos adjuntos si existen
      if (data.attachments && data.attachments.length > 0) {
        const attachmentPromises = data.attachments.map(attachment =>
          prisma.requestAttachment.create({
            data: {
              name: attachment.name,
              size: attachment.size,
              type: attachment.type,
              url: attachment.url,
              path: attachment.path,
              requestId: request.id,
              uploadedById: attachment.uploadedById,
              uploadedByName: attachment.uploadedByName
            }
          })
        );
        
        await Promise.all(attachmentPromises);
      }

      // Si se asignó automáticamente, crear entrada en el historial
      if (operatorAssignment && operatorAssignment.operator) {
        await prisma.requestHistory.create({
          data: {
            action: 'AUTO_ASSIGNED',
            details: `Asignado automáticamente a ${requestData.assignedToName}`,
            requestId: request.id,
            userId: data.clientId,
            userName: data.clientName,
            metadata: {
              operatorId: operatorAssignment.operatorId,
              operatorName: requestData.assignedToName
            }
          }
        });
      }

      // Obtener la solicitud completa con los archivos adjuntos
      const completeRequest = await prisma.request.findUnique({
        where: { id: request.id },
        include: {
          client: true,
          company: true,
          assignedTo: true,
          comments: {
            include: {
              user: true,
              attachments: true
            }
          },
          attachments: true,
          history: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      logger.info(`Request created successfully: ${folio}`);
      return completeRequest || request;
    } catch (error) {
      logger.error('Error creating request:', error);
      throw error;
    }
  }

  // Obtener solicitudes con filtros
  async getRequests(filters: RequestFilters, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters.companyId) where.companyId = filters.companyId;
      if (filters.companyIds && filters.companyIds.length > 0) {
        where.companyId = { in: filters.companyIds };
        console.log('Filtrando por empresas:', filters.companyIds);
      }
      if (filters.clientId) where.clientId = filters.clientId;
      if (filters.assignedToId) where.assignedToId = filters.assignedToId;
      if (filters.status) where.status = filters.status;
      if (filters.type) where.type = filters.type;
      if (filters.priority) where.priority = filters.priority;

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      if (filters.search) {
        where.OR = [
          { folio: { contains: filters.search, mode: 'insensitive' } },
          { subject: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [requests, total] = await Promise.all([
        prisma.request.findMany({
          where,
          skip,
          take: limit,
          include: {
            client: true,
            company: true,
            assignedTo: true,
            comments: {
              include: {
                user: true,
                attachments: true
              }
            },
            attachments: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.request.count({ where })
      ]);

      return {
        requests,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting requests:', error);
      throw error;
    }
  }

  // Obtener una solicitud por ID
  async getRequestById(id: number) {
    try {
      const request = await prisma.request.findUnique({
        where: { id },
        include: {
          client: true,
          company: true,
          assignedTo: true,
          comments: {
            include: {
              user: true,
              attachments: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          attachments: true,
          history: {
            include: {
              user: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!request) {
        throw new Error('Request not found');
      }

      return request;
    } catch (error) {
      logger.error('Error getting request by ID:', error);
      throw error;
    }
  }

  // Actualizar una solicitud
  async updateRequest(id: number, data: UpdateRequestDto, userId: number, userName: string) {
    try {
      const currentRequest = await prisma.request.findUnique({
        where: { id }
      });

      if (!currentRequest) {
        throw new Error('Request not found');
      }

      // Preparar datos de actualización
      const updateData: any = { ...data };

      // Si cambia el estado, actualizar las fechas correspondientes
      if (data.status && data.status !== currentRequest.status) {
        if (data.status === 'RESOLVED') {
          updateData.resolvedAt = new Date();
        } else if (data.status === 'CANCELLED') {
          updateData.cancelledAt = new Date();
        }
      }

      const request = await prisma.request.update({
        where: { id },
        data: updateData,
        include: {
          client: true,
          company: true,
          assignedTo: true,
          comments: {
            include: {
              user: true,
              attachments: true
            }
          },
          attachments: true,
          history: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      // Crear entrada en el historial
      let historyDetails = 'Solicitud actualizada';
      if (data.status && data.status !== currentRequest.status) {
        historyDetails = `Estado cambiado de ${translateRequestStatus(currentRequest.status)} a ${translateRequestStatus(data.status)}`;
      } else if (data.assignedToId && data.assignedToId !== currentRequest.assignedToId) {
        historyDetails = `Asignado a ${data.assignedToName || 'operador'}`;
      }

      await prisma.requestHistory.create({
        data: {
          action: 'UPDATED',
          details: historyDetails,
          requestId: id,
          userId,
          userName,
          metadata: data as any
        }
      });

      logger.info(`Request updated successfully: ${id}`);
      return request;
    } catch (error) {
      logger.error('Error updating request:', error);
      throw error;
    }
  }

  // Agregar comentario a una solicitud
  async addComment(requestId: number, data: CreateCommentDto) {
    try {
      const comment = await prisma.requestComment.create({
        data: {
          text: data.text,
          requestId,
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole
        },
        include: {
          user: true,
          attachments: true
        }
      });

      // Actualizar fecha de última actualización de la solicitud
      await prisma.request.update({
        where: { id: requestId },
        data: { updatedAt: new Date() }
      });

      // Crear entrada en el historial
      await prisma.requestHistory.create({
        data: {
          action: 'COMMENT_ADDED',
          details: 'Comentario agregado',
          requestId,
          userId: data.userId,
          userName: data.userName
        }
      });

      logger.info(`Comment added to request: ${requestId}`);
      return comment;
    } catch (error) {
      logger.error('Error adding comment:', error);
      throw error;
    }
  }

  // Obtener estadísticas de solicitudes
  async getRequestStats(companyId: number) {
    try {
      const stats = await prisma.request.groupBy({
        by: ['status'],
        where: { companyId },
        _count: {
          status: true
        }
      });

      const criticalCount = await prisma.request.count({
        where: {
          companyId,
          priority: 'CRITICAL',
          status: {
            notIn: ['RESOLVED', 'CANCELLED']
          }
        }
      });

      const statusCounts = stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
        open: statusCounts.open || 0,
        inProgress: statusCounts.in_progress || 0,
        pendingInfo: statusCounts.pending_info || 0,
        resolved: statusCounts.resolved || 0,
        cancelled: statusCounts.cancelled || 0,
        critical: criticalCount
      };
    } catch (error) {
      logger.error('Error getting request stats:', error);
      throw error;
    }
  }

  // Asignar solicitud a un operador
  async assignRequest(requestId: number, operatorId: number, operatorName: string, assignedBy: number, assignedByName: string) {
    try {
      const request = await this.updateRequest(
        requestId,
        {
          assignedToId: operatorId,
          assignedToName: operatorName,
          status: 'IN_PROGRESS'
        },
        assignedBy,
        assignedByName
      );

      return request;
    } catch (error) {
      logger.error('Error assigning request:', error);
      throw error;
    }
  }

  // Obtener estadísticas por usuario (cliente)
  async getRequestStatsByUser(userId: number) {
    try {
      const stats = await prisma.request.groupBy({
        by: ['status'],
        where: {
          clientId: userId
        },
        _count: {
          status: true
        }
      });

      const criticalCount = await prisma.request.count({
        where: {
          clientId: userId,
          priority: 'CRITICAL',
          status: {
            in: ['OPEN', 'IN_PROGRESS']
          }
        }
      });

      const statusCounts = stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
        open: statusCounts.open || 0,
        inProgress: statusCounts.in_progress || 0,
        pendingInfo: statusCounts.pending_info || 0,
        resolved: statusCounts.resolved || 0,
        cancelled: statusCounts.cancelled || 0,
        critical: criticalCount
      };
    } catch (error) {
      logger.error('Error getting user request stats:', error);
      throw error;
    }
  }

  // Obtener estadísticas por operador
  async getRequestStatsByOperator(operatorId: number) {
    try {
      // Primero obtener las empresas asignadas al operador
      const operatorCompanies = await this.getOperatorCompanies(operatorId);
      
      if (operatorCompanies.length === 0) {
        // Si no tiene empresas asignadas, retornar estadísticas vacías
        return {
          total: 0,
          open: 0,
          inProgress: 0,
          pendingInfo: 0,
          resolved: 0,
          cancelled: 0,
          critical: 0
        };
      }

      const stats = await prisma.request.groupBy({
        by: ['status'],
        where: {
          companyId: {
            in: operatorCompanies
          }
        },
        _count: {
          status: true
        }
      });

      const criticalCount = await prisma.request.count({
        where: {
          companyId: {
            in: operatorCompanies
          },
          priority: 'CRITICAL',
          status: {
            in: ['OPEN', 'IN_PROGRESS']
          }
        }
      });

      const statusCounts = stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
        open: statusCounts.open || 0,
        inProgress: statusCounts.in_progress || 0,
        pendingInfo: statusCounts.pending_info || 0,
        resolved: statusCounts.resolved || 0,
        cancelled: statusCounts.cancelled || 0,
        critical: criticalCount
      };
    } catch (error) {
      logger.error('Error getting operator request stats:', error);
      throw error;
    }
  }

  // Obtener estadísticas generales (para admin sin companyId)
  async getRequestStatsGeneral() {
    try {
      const stats = await prisma.request.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const criticalCount = await prisma.request.count({
        where: {
          priority: 'CRITICAL',
          status: {
            in: ['OPEN', 'IN_PROGRESS']
          }
        }
      });

      const statusCounts = stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
        open: statusCounts.open || 0,
        inProgress: statusCounts.in_progress || 0,
        pendingInfo: statusCounts.pending_info || 0,
        resolved: statusCounts.resolved || 0,
        cancelled: statusCounts.cancelled || 0,
        critical: criticalCount
      };
    } catch (error) {
      logger.error('Error getting general request stats:', error);
      throw error;
    }
  }

  // Obtener solicitudes por usuario (cliente u operador)
  async getRequestsByUser(userId: number, userRole: UserRole) {
    try {
      const where: any = {};

      if (userRole === 'CLIENT') {
        where.clientId = userId;
      } else if (userRole === 'OPERATOR') {
        where.assignedToId = userId;
      }

      const requests = await prisma.request.findMany({
        where,
        include: {
          client: true,
          company: true,
          assignedTo: true,
          comments: true,
          attachments: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return requests;
    } catch (error) {
      logger.error('Error getting requests by user:', error);
      throw error;
    }
  }

  // Obtener empresas asignadas a un operador
  async getOperatorCompanies(operatorId: number): Promise<number[]> {
    try {
      const operatorCompanies = await prisma.operatorCompany.findMany({
        where: {
          operatorId,
          isActive: true
        },
        select: {
          companyId: true
        }
      });

      return operatorCompanies.map(oc => oc.companyId);
    } catch (error) {
      logger.error('Error getting operator companies:', error);
      throw error;
    }
  }

  // Obtener empresas gestionadas por un administrador
  async getAdminCompanies(adminId: number): Promise<number[]> {
    try {
      const adminCompanies = await prisma.company.findMany({
        where: {
          managedByAdminId: adminId
        },
        select: {
          id: true
        }
      });

      return adminCompanies.map(company => company.id);
    } catch (error) {
      logger.error('Error getting admin companies:', error);
      throw error;
    }
  }
}

export const requestService = new RequestService();