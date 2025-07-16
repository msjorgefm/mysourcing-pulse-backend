import { Request, Response } from 'express';
import { PrismaClient, IncidenceStatus, IncidenceType } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

export class IncidenciasController {
  
  static async createBulkIncidencias(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const { incidencias } = req.body;
      const user = req.user;
      
      console.log('createBulkIncidencias - Request received:', {
        companyId,
        incidenciasCount: incidencias?.length,
        userRole: user?.role,
        userCompanyId: user?.companyId,
        bodyKeys: Object.keys(req.body)
      });
      
      // Verificar permisos
      if (user.role !== 'OPERATOR' && user.role !== 'CLIENT' && user.role !== 'DEPARTMENT_HEAD') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para crear incidencias'
        });
      }
      
      // Si es cliente, verificar que sea de su propia empresa
      if (user.role === 'CLIENT' && user.companyId !== parseInt(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes crear incidencias para tu propia empresa'
        });
      }
      
      if (!incidencias || !Array.isArray(incidencias)) {
        return res.status(400).json({
          success: false,
          error: 'Debes proporcionar un array de incidencias'
        });
      }
      
      // Procesar incidencias
      const incidenciasToCreate = [];
      const employeesNotFound = [];
      const validationErrors = [];
      
      for (const inc of incidencias) {
        // Buscar empleado por número de empleado
        let employeeId = null;
        let employeeFound = false;
        
        if (inc.employeeId) {
          const employee = await prisma.workerDetails.findFirst({
            where: {
              companyId: parseInt(companyId),
              numeroTrabajador: parseInt(inc.employeeId)
            }
          });
          
          if (employee) {
            employeeId = employee.id;
            employeeFound = true;
          }
        }
        
        // Si no se encontró por número, buscar por nombre
        if (!employeeFound && inc.employeeName) {
          const employee = await prisma.workerDetails.findFirst({
            where: {
              companyId: parseInt(companyId),
              nombres: {
                contains: inc.employeeName,
                mode: 'insensitive'
              }
            }
          });
          
          if (employee) {
            employeeId = employee.id;
            employeeFound = true;
          }
        }
        
        // Si no se encontró el empleado, agregarlo a la lista de no encontrados
        if (!employeeFound) {
          employeesNotFound.push({
            employeeId: inc.employeeId || 'N/A',
            employeeName: inc.employeeName || 'Sin nombre',
            incidenceType: inc.incidenceType,
            amount: inc.amount,
            quantity: inc.quantity
          });
          continue; // Saltar esta incidencia
        }
        
        if (employeeId) {
          // Determinar el estado según el rol del usuario
          const incidenceStatus = user.role === 'CLIENT' 
            ? IncidenceStatus.APPROVED 
            : (user.role === 'DEPARTMENT_HEAD' || user.role === 'OPERATOR')
              ? IncidenceStatus.PENDING
              : IncidenceStatus.APPROVED;
          
          // Mapear tipos de incidencia nuevos a tipos existentes temporalmente
          let incidenceType = inc.incidenceType as string;
          
          // Mapeo temporal mientras se actualiza la base de datos
          const typeMapping: { [key: string]: IncidenceType } = {
            'INCAPACIDADES': IncidenceType.PERMISOS, // Temporal: mapear a PERMISOS
            'INCENTIVOS': IncidenceType.BONOS,       // Temporal: mapear a BONOS
            'PRIMA_DOMINICAL': IncidenceType.BONOS,  // Temporal: mapear a BONOS
            'OTROS': IncidenceType.BONOS             // Temporal: mapear a BONOS
          };
          
          // Si es un tipo nuevo, usar el mapeo temporal
          if (typeMapping[incidenceType]) {
            console.warn(`Tipo ${incidenceType} mapeado temporalmente a ${typeMapping[incidenceType]}`);
            incidenceType = typeMapping[incidenceType];
          }
          
          // Parsear fecha en formato DD/MM/YYYY
          let parsedDate: Date;
          if (inc.date) {
            // Si la fecha viene en formato DD/MM/YYYY
            if (inc.date.includes('/')) {
              const [day, month, year] = inc.date.split('/');
              parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
              // Si viene en otro formato, intentar parsearlo normalmente
              parsedDate = new Date(inc.date);
            }
            
            // Validar que la fecha sea válida
            if (isNaN(parsedDate.getTime())) {
              console.warn(`Fecha inválida para incidencia: ${inc.date}, usando fecha actual`);
              parsedDate = new Date();
            }
          } else {
            parsedDate = new Date();
          }
          
          const incidenceData: any = {
            employeeId,
            companyId: parseInt(companyId),
            type: incidenceType as IncidenceType || IncidenceType.BONOS,
            amount: parseFloat(inc.amount) || 0,
            quantity: parseFloat(inc.quantity) || 1, // Usar quantity del frontend
            date: parsedDate,
            description: inc.comments || `${inc.incidenceType || 'Incidencia'} - Cantidad: ${inc.quantity || inc.amount}`,
            status: incidenceStatus
            // Temporalmente comentados hasta que se actualice la base de datos
            // createdBy: user.role as UserRole,
            // createdByUserId: user.id
          };
          
          // Only add these fields if they exist in the schema
          // Remove these comments after running migration
          // if (inc.payrollCalendarId) {
          //   incidenceData.payrollCalendarId = parseInt(inc.payrollCalendarId);
          // }
          if (inc.periodId) {
            incidenceData.periodId = inc.periodId;
          }
          
          incidenciasToCreate.push(incidenceData);
        }
      }
      
      // Crear incidencias en lote
      const created = await prisma.incidence.createMany({
        data: incidenciasToCreate
      });
      
      // Si es jefe de departamento, crear notificación para el cliente
      if (user.role === 'DEPARTMENT_HEAD' && created.count > 0) {
        try {
          // Obtener información del departamento del jefe
          const departmentHead = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              workerDetails: { include: { contractConditions: { include: { departmento: true } } }}
            }
          });
          
          const departmentName = departmentHead?.workerDetails?.contractConditions?.departmento?.nombre || 'Departamento';
          
          // Crear notificación para usuarios con rol CLIENT de la empresa
          await prisma.notification.create({
            data: {
              type: 'SYSTEM_ALERT',
              title: 'Incidencias pendientes de aprobación',
              message: `El jefe de ${departmentName} ha registrado ${created.count} incidencias que requieren tu aprobación`,
              priority: 'HIGH',
              companyId: parseInt(companyId),
              metadata: {
                departmentName,
                incidenceCount: created.count,
                departmentHeadId: user.id,
                departmentHeadName: user.name || 'Jefe de Departamento',
                createdAt: new Date().toISOString(),
                targetRole: 'CLIENT'
              }
            }
          });
        } catch (notifError) {
          console.error('Error creando notificación:', notifError);
          // No fallar la operación principal si falla la notificación
        }
      }
      
      // Preparar respuesta con detalles
      const response: any = {
        success: true,
        data: {
          created: created.count,
          total: incidencias.length,
          skipped: incidencias.length - created.count,
          employeesNotFound: employeesNotFound.length
        }
      };
      
      // Si hay empleados no encontrados, incluir los detalles
      if (employeesNotFound.length > 0) {
        response.data.notFoundDetails = employeesNotFound;
        response.warning = `Se encontraron ${employeesNotFound.length} empleados que no existen en la empresa ${companyId}`;
      }
      
      res.json(response);
      
    } catch (error: any) {
      console.error('Error creating bulk incidencias:', error);
      console.error('Error stack:', error.stack);
      
      // Enviar más detalles del error
      res.status(500).json({
        success: false,
        error: error.message || 'Error al crear las incidencias',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          code: error.code
        } : undefined
      });
    }
  }
  
  static async getIncidenciasByCompany(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const user = req.user;
      
      // Verificar permisos
      if (user.role !== 'OPERATOR' && user.role !== 'CLIENT' && user.role !== 'DEPARTMENT_HEAD') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver estas incidencias'
        });
      }
      
      // Verificar que el usuario pertenezca a la empresa
      if ((user.role === 'CLIENT' || user.role === 'DEPARTMENT_HEAD') && user.companyId !== parseInt(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes ver incidencias de tu propia empresa'
        });
      }
      
      // Construir el filtro where según el rol
      const whereCondition: any = {
        companyId: parseInt(companyId)
      };
      
      // Filtrar por rol:
      // - OPERATOR: solo ve incidencias APPROVED (para cálculo de nómina)
      // - CLIENT: ve todas las incidencias de su empresa
      // - DEPARTMENT_HEAD: ve todas las incidencias de su empresa
      if (user.role === 'OPERATOR') {
        whereCondition.status = 'APPROVED';
      }
      
      const incidencias = await prisma.incidence.findMany({
        where: whereCondition,
        include: {
          workerDetails: {
            include: {
              contractConditions: {
                include: {
                  departmento: {
                    select: {
                      nombre: true
                    }
                  },
                  puesto: {
                    select: {
                      nombre: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json({
        success: true,
        data: incidencias
      });
      
    } catch (error: any) {
      console.error('Error getting incidencias:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener las incidencias'
      });
    }
  }
  
  static async updateIncidencia(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      const updateData = req.body;
      
      // Obtener la incidencia para verificar permisos
      const incidencia = await prisma.incidence.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!incidencia) {
        return res.status(404).json({
          success: false,
          error: 'Incidencia no encontrada'
        });
      }
      
      // Verificar permisos
      if (user.role !== 'OPERATOR' && user.companyId !== incidencia.companyId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para actualizar esta incidencia'
        });
      }
      
      const updated = await prisma.incidence.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      
      res.json({
        success: true,
        data: updated
      });
      
    } catch (error: any) {
      console.error('Error updating incidencia:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al actualizar la incidencia'
      });
    }
  }
  
  static async deleteIncidencia(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      // Obtener la incidencia para verificar permisos
      const incidencia = await prisma.incidence.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!incidencia) {
        return res.status(404).json({
          success: false,
          error: 'Incidencia no encontrada'
        });
      }
      
      // Verificar permisos
      if (user.role !== 'OPERATOR' && user.companyId !== incidencia.companyId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para eliminar esta incidencia'
        });
      }
      
      await prisma.incidence.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({
        success: true,
        message: 'Incidencia eliminada exitosamente'
      });
      
    } catch (error: any) {
      console.error('Error deleting incidencia:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al eliminar la incidencia'
      });
    }
  }
  
  // Obtener incidencias pendientes de aprobación
  static async getPendingIncidencias(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const user = req.user;
      
      // Verificar permisos
      if (user.role !== 'CLIENT' || user.companyId !== parseInt(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver estas incidencias'
        });
      }
      
      const incidencias = await prisma.incidence.findMany({
        where: {
          companyId: parseInt(companyId),
          status: IncidenceStatus.PENDING
          // createdBy: { 
          //   in: [UserRole.DEPARTMENT_HEAD, UserRole.OPERATOR] 
          // } // Solo las creadas por jefes u operadores
        },
        include: {
          workerDetails: {
            include: { 
              contractConditions: { 
                include: { 
                  departmento: true,
                  puesto: true
                } 
              } 
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json({
        success: true,
        data: incidencias
      });
      
    } catch (error: any) {
      console.error('Error getting pending incidencias:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener las incidencias pendientes'
      });
    }
  }
  
  // Aprobar incidencia
  static async approveIncidencia(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      // Obtener la incidencia
      const incidencia = await prisma.incidence.findUnique({
        where: { id: parseInt(id) },
        include: { 
          // createdByUser: true 
        }
      });
      
      if (!incidencia) {
        return res.status(404).json({
          success: false,
          error: 'Incidencia no encontrada'
        });
      }
      
      // Verificar permisos
      if (user.role !== 'CLIENT' || user.companyId !== incidencia.companyId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para aprobar esta incidencia'
        });
      }
      
      // Actualizar incidencia
      const updated = await prisma.incidence.update({
        where: { id: parseInt(id) },
        data: {
          status: IncidenceStatus.APPROVED
          // rejectionReason: null // Limpiar motivo de rechazo si había uno previo
          // approvedBy: user.id,
          // approvalDate: new Date()
        }
      });
      
      // Crear notificación para el jefe que creó la incidencia
      // Primero verificar si la incidencia fue creada por un jefe
      try {
        const incidenceEmployee = await prisma.workerDetails.findUnique({
          where: { id: incidencia.employeeId },
          select: { nombres: true, numeroTrabajador: true }
        });
        
        // Buscar notificaciones previas relacionadas con esta incidencia para identificar al jefe
        const previousNotification = await prisma.notification.findFirst({
          where: {
            companyId: incidencia.companyId,
            metadata: {
              path: ['incidenceCount'],
              gte: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        
        if (previousNotification && previousNotification.metadata) {
          const metadata = previousNotification.metadata as any;
          if (metadata.departmentHeadId) {
            await prisma.notification.create({
              data: {
                type: 'SYSTEM_ALERT',
                title: 'Incidencia Aprobada',
                message: `Tu incidencia del empleado ${incidenceEmployee?.numeroTrabajador} - ${incidenceEmployee?.nombres} ha sido aprobada`,
                priority: 'NORMAL',
                companyId: incidencia.companyId,
                metadata: {
                  incidenceId: incidencia.id,
                  approvedBy: user.name,
                  approvalDate: new Date(),
                  userId: metadata.departmentHeadId,
                  targetRole: 'DEPARTMENT_HEAD'
                }
              }
            });
          }
        }
      } catch (notifError) {
        console.error('Error creating approval notification:', notifError);
        // No fallar la operación principal si falla la notificación
      }
      
      res.json({
        success: true,
        data: updated,
        message: 'Incidencia aprobada exitosamente'
      });
      
    } catch (error: any) {
      console.error('Error approving incidencia:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al aprobar la incidencia'
      });
    }
  }
  
  // Rechazar incidencia
  static async rejectIncidencia(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = req.user;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Debes proporcionar un motivo de rechazo'
        });
      }
      
      // Obtener la incidencia
      const incidencia = await prisma.incidence.findUnique({
        where: { id: parseInt(id) },
        include: { 
          // createdByUser: true 
        }
      });
      
      if (!incidencia) {
        return res.status(404).json({
          success: false,
          error: 'Incidencia no encontrada'
        });
      }
      
      // Verificar permisos
      if (user.role !== 'CLIENT' || user.companyId !== incidencia.companyId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para rechazar esta incidencia'
        });
      }
      
      // Actualizar incidencia
      const updated = await prisma.incidence.update({
        where: { id: parseInt(id) },
        data: {
          status: IncidenceStatus.REJECTED,
          // rejectionReason: reason // El campo no está siendo reconocido por Prisma
          description: incidencia.description ? 
            `${incidencia.description} | RECHAZADA: ${reason}` : 
            `RECHAZADA: ${reason}`
          // approvedBy: user.id,
          // approvalDate: new Date()
        }
      });
      
      // Crear notificación para el jefe que creó la incidencia
      try {
        const incidenceEmployee = await prisma.workerDetails.findUnique({
          where: { id: incidencia.employeeId },
          select: { nombres: true, numeroTrabajador: true }
        });
        
        // Buscar notificaciones previas relacionadas con esta incidencia para identificar al jefe
        const previousNotification = await prisma.notification.findFirst({
          where: {
            companyId: incidencia.companyId,
            metadata: {
              path: ['incidenceCount'],
              gte: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        
        if (previousNotification && previousNotification.metadata) {
          const metadata = previousNotification.metadata as any;
          if (metadata.departmentHeadId) {
            await prisma.notification.create({
              data: {
                type: 'SYSTEM_ALERT',
                title: 'Incidencia Rechazada',
                message: `Tu incidencia del empleado ${incidenceEmployee?.numeroTrabajador} - ${incidenceEmployee?.nombres} ha sido rechazada. Motivo: ${reason}`,
                priority: 'HIGH',
                companyId: incidencia.companyId,
                metadata: {
                  incidenceId: incidencia.id,
                  rejectedBy: user.name,
                  rejectionDate: new Date(),
                  reason,
                  userId: metadata.departmentHeadId,
                  targetRole: 'DEPARTMENT_HEAD'
                }
              }
            });
          }
        }
      } catch (notifError) {
        console.error('Error creating rejection notification:', notifError);
        // No fallar la operación principal si falla la notificación
      }
      
      res.json({
        success: true,
        data: updated,
        message: 'Incidencia rechazada exitosamente'
      });
      
    } catch (error: any) {
      console.error('Error rejecting incidencia:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al rechazar la incidencia'
      });
    }
  }
  
  // Obtener incidencias con filtros
  static async getIncidenciasWithFilters(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const { calendarId, periodId, createdBy, status } = req.query;
      const user = req.user;
      
      // Verificar permisos
      if (user.role !== 'OPERATOR' && user.companyId !== parseInt(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver estas incidencias'
        });
      }
      
      const where: any = {
        companyId: parseInt(companyId)
      };
      
      if (calendarId) {
        where.payrollCalendarId = parseInt(calendarId as string);
      }
      
      if (periodId) {
        where.periodId = periodId as string;
      }
      
      // if (createdBy) {
      //   where.createdBy = createdBy as UserRole;
      // }
      
      if (status) {
        where.status = status as IncidenceStatus;
      }
      
      const incidencias = await prisma.incidence.findMany({
        where,
        include: {
          workerDetails: {
            include: { 
              contractConditions: { 
                include: { 
                  departmento: { 
                    select: { nombre: true } 
                  }, 
                  puesto: { 
                    select: { nombre: true } 
                  } 
                } 
              } 
            }
          }
          // createdByUser: {
          //   select: {
          //     id: true,
          //     name: true,
          //     email: true,
          //     role: true
          //   }
          // },
          // approvedByUser: {
          //   select: {
          //     id: true,
          //     name: true,
          //     email: true
          //   }
          // },
          // payrollCalendar: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json({
        success: true,
        data: incidencias
      });
      
    } catch (error: any) {
      console.error('Error getting filtered incidencias:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener las incidencias'
      });
    }
  }
  
  // Obtener historial de aprobaciones de incidencias
  static async getApprovalHistory(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const user = req.user;
      
      // Verificar permisos
      if (user.role !== 'CLIENT' || user.companyId !== parseInt(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver este historial'
        });
      }
      
      const incidencias = await prisma.incidence.findMany({
        where: {
          companyId: parseInt(companyId),
          status: {
            in: [IncidenceStatus.APPROVED, IncidenceStatus.REJECTED]
          }
        },
        include: {
          workerDetails: {
            include: { 
              contractConditions: { 
                include: { 
                  departmento: { 
                    select: { nombre: true } 
                  }, 
                  puesto: { 
                    select: { nombre: true } 
                  } 
                } 
              } 
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      res.json({
        success: true,
        data: incidencias
      });
      
    } catch (error: any) {
      console.error('Error getting incidencias approval history:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener el historial'
      });
    }
  }
  
  // Descargar plantilla de incidencias
  static async downloadTemplate(req: AuthRequest, res: Response) {
    try {
      console.log('=== DOWNLOAD TEMPLATE START ===');
      const { companyId } = req.params;
      const { format = 'xlsx' } = req.query; // xlsx o csv
      const user = req.user;
      
      console.log('Downloading template for:', { companyId, userRole: user.role, userCompanyId: user.companyId });
      
      // Verificar permisos
      if (user.role === 'CLIENT' && user.companyId !== parseInt(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes descargar plantillas de tu propia empresa'
        });
      }
      
      // Obtener información de la empresa para el nombre del archivo
      const company = await prisma.company.findUnique({
        where: { id: parseInt(companyId) },
        select: { name: true }
      });
      
      // Crear nombre corto de la empresa (primeras palabras sin caracteres especiales)
      const shortCompanyName = company?.name
        ? company.name
            .split(' ')
            .slice(0, 2) // Tomar las primeras 2 palabras
            .join('_')
            .replace(/[^a-zA-Z0-9_]/g, '') // Eliminar caracteres especiales
            .toLowerCase()
        : `empresa_${companyId}`;
      
      // Construir el filtro según el rol
      const whereClause: any = {
        companyId: parseInt(companyId),
        contractConditions: {
          situacionContractual: 'PERMANENTE'
        }
      };
      
      // Si es jefe de departamento, solo puede ver empleados de su departamento
      if (user.role === 'DEPARTMENT_HEAD') {
        // Obtener el departamento del jefe
        const departmentHead = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            workerDetails: {
              include: { contractConditions: { include: { departmento: true, puesto: true } } }
            }
          }
        });
        
        if (departmentHead?.workerDetails?.contractConditions?.departmento) {
          whereClause.department = departmentHead.workerDetails?.contractConditions?.departmento.nombre;
        }
      }
      
      // Obtener empleados según permisos
      const employees = await prisma.workerDetails.findMany({
        where: whereClause,
        include: { 
          contractConditions: { 
            include: { 
              departmento: { 
                select: { nombre: true } 
              }, 
              puesto: { 
                select: { nombre: true } 
              } 
            } 
          } 
        },
        orderBy: [
          { contractConditions: { departmento: { nombre: 'asc' }} },
          { numeroTrabajador: 'asc' }
        ]
      });
      
      // Obtener la plantilla configurada para esta empresa
      let templateConfig = null;
      let customIncidenceTypes: any[] = [];
      
      try {
        templateConfig = await (prisma as any).companyIncidenceTemplate.findUnique({
          where: { companyId: parseInt(companyId) }
        });
        
        // Obtener los tipos de incidencia configurados para esta empresa
        customIncidenceTypes = await (prisma as any).companyIncidenceType.findMany({
          where: {
            companyId: parseInt(companyId),
            activo: true
          },
          orderBy: [
            { tipo: 'asc' },
            { codigo: 'asc' }
          ]
        });
      } catch (error) {
        console.log('Error fetching custom incidence types:', error);
        console.log('Using default incidence types for now');
      }
      
      // Preparar headers basándose en la configuración
      let headers = [
        'ID_EMPLEADO',
        'NOMBRE', 
        'DEPARTAMENTO',
        'PUESTO',
        'FECHA'
      ];
      
      // Si hay tipos personalizados configurados, usarlos
      if (customIncidenceTypes && customIncidenceTypes.length > 0) {
        console.log(`Using custom incidence types for company ${companyId}:`, customIncidenceTypes.map((t: any) => t.codigo));
        // Agregar los tipos de incidencia configurados como columnas
        customIncidenceTypes.forEach((type: any) => {
          headers.push(type.codigo);
        });
      } else {
        console.log(`No custom incidence types found for company ${companyId}, using default headers`);
        // Usar los headers por defecto si no hay configuración
        headers = headers.concat([
          'FALTAS',
          'RETARDOS',
          'PERMISOS',
          'VACACIONES',
          'INCAPACIDADES',
          'T.EXTRA',
          'BONO',
          'INCENTIVOS',
          'PRIMA_DOMINICAL',
          'OTROS'
        ]);
      }
      
      // Generar buffer según formato
      let buffer;
      let contentType;
      let filename;
      
      if (format === 'csv') {
        // Generar CSV manualmente
        const csvRows = [];
        
        // Agregar headers
        csvRows.push(headers.join(','));
        
        // Agregar datos de empleados
        employees.forEach(emp => {
          // Formatear fecha en formato DD/MM/YYYY para Excel
          const today = new Date();
          const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
          
          const row = [
            emp.numeroTrabajador,
            `"${emp.nombres}"`, // Envolver en comillas para manejar nombres con comas
            `"${emp.contractConditions?.departmento?.nombre || ''}"`,
            `"${emp.contractConditions?.puesto?.nombre || ''}"`,
            `"${formattedDate}"` // Fecha en formato DD/MM/YYYY entre comillas
          ];
          
          // Agregar columnas vacías para cada tipo de incidencia
          const incidenceColumnCount = headers.length - 5; // Restar las 5 columnas fijas
          for (let i = 0; i < incidenceColumnCount; i++) {
            row.push('');
          }
          
          csvRows.push(row.join(','));
        });
        
        // Convertir a buffer con BOM para Excel
        const csvContent = '\ufeff' + csvRows.join('\n'); // BOM para caracteres especiales
        buffer = Buffer.from(csvContent, 'utf8');
        contentType = 'text/csv; charset=utf-8';
        filename = `plantilla_incidencias_${shortCompanyName}_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        // Para Excel, crear un HTML table que Excel puede abrir
        let htmlContent = `
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              table { border-collapse: collapse; }
              th, td { border: 1px solid black; padding: 8px; }
              th { background-color: #f2f2f2; font-weight: bold; }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <tr>
                  ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
        `;
        
        employees.forEach(emp => {
          // Formatear fecha en formato DD/MM/YYYY para Excel
          const today = new Date();
          const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
          
          htmlContent += `
            <tr>
              <td>${emp.numeroTrabajador}</td>
              <td>${emp.nombres}</td>
              <td>${emp.contractConditions?.departmento?.nombre || ''}</td>
              <td>${emp.contractConditions?.puesto?.nombre || ''}</td>
              <td style="mso-number-format:'@'">${formattedDate}</td>`;
          
          // Agregar celdas vacías para cada tipo de incidencia
          const incidenceColumnCount = headers.length - 5; // Restar las 5 columnas fijas
          for (let i = 0; i < incidenceColumnCount; i++) {
            htmlContent += `<td></td>`;
          }
          
          htmlContent += `
            </tr>
          `;
        });
        
        htmlContent += `
              </tbody>
            </table>
          </body>
          </html>
        `;
        
        buffer = Buffer.from(htmlContent, 'utf8');
        contentType = 'application/vnd.ms-excel';
        filename = `plantilla_incidencias_${shortCompanyName}_${new Date().toISOString().split('T')[0]}.xls`;
      }
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      
      res.send(buffer);
      
    } catch (error: any) {
      console.error('Error generating template:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al generar la plantilla'
      });
    }
  }
}