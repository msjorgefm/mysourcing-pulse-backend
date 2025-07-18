// src/controllers/payrollPeriodController.ts
import { Request, Response } from 'express';
import { PrismaClient, PeriodStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { getNotificationService } from '../services/notificationService';

const prisma = new PrismaClient();

// Función auxiliar para obtener el nombre del usuario
async function getUserName(userId: number): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    });
    return user ? `${user.firstName} ${user.lastName}` : 'Usuario desconocido';
  } catch {
    return 'Usuario desconocido';
  }
}

export const payrollPeriodController = {
  // Obtener todos los períodos de un calendario
  async getPeriodsByCalendar(req: Request, res: Response) {
    try {
      const { calendarId } = req.params;
      
      const periods = await prisma.payrollCalendarPeriod.findMany({
        where: { 
          calendarId: parseInt(calendarId),
          //Excluir períodos finalizados - temporalmente comentado hasta que se ejecute la migración
          NOT: {
             status: 'FINALIZADO'
           }
        },
        orderBy: { number: 'asc' }
      });

      res.json({ data: periods, success: true });
    } catch (error) {
      logger.error('Error fetching payroll periods:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener períodos del calendario'
      });
    }
  },

  // Crear períodos para un calendario
  async createPeriodsForCalendar(req: Request, res: Response) {
    try {
      const { calendarId } = req.params;
      const { periods } = req.body;
      
      // Verificar que el calendario existe
      const calendar = await prisma.payrollCalendar.findUnique({
        where: { id: parseInt(calendarId) }
      });

      if (!calendar) {
        return res.status(404).json({
          success: false,
          message: 'Calendario no encontrado'
        });
      }

      // Crear todos los períodos en una transacción
      const createdPeriods = await prisma.$transaction(
        periods.map((period: any) => 
          prisma.payrollCalendarPeriod.create({
            data: {
              calendarId: parseInt(calendarId),
              number: period.number,
              startDate: new Date(period.startDate),
              endDate: new Date(period.endDate),
              paymentDate: new Date(period.paymentDate),
              status: PeriodStatus.EN_INCIDENCIA
            }
          })
        )
      );

      logger.info(`Created ${createdPeriods.length} periods for calendar ${calendarId}`);
      res.status(201).json({ data: createdPeriods, success: true });
    } catch (error) {
      logger.error('Error creating payroll periods:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear períodos del calendario'
      });
    }
  },

  // Cambiar estado del período
  async updatePeriodStatus(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const { status, rejectionReason } = req.body;
      const userId = (req as any).user.id;
      
      // Obtener el período actual
      const currentPeriod = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!currentPeriod) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Validar transiciones de estado
      const validTransitions: Record<string, string[]> = {
        EN_INCIDENCIA: ['EN_REVISION'],
        EN_REVISION: ['CERRADO', 'RECHAZADA'],
        CERRADO: ['EN_INCIDENCIA', 'EN_REVISION_PRENOMINA', 'FINALIZADO'],
        RECHAZADA: ['EN_INCIDENCIA'],
        EN_REVISION_PRENOMINA: ['PRENOMINA_APROBADA', 'PRENOMINA_RECHAZADA'],
        PRENOMINA_APROBADA: ['EN_REVISION_LAYOUTS', 'FINALIZADO'],
        PRENOMINA_RECHAZADA: ['CERRADO'],
        EN_REVISION_LAYOUTS: ['LAYOUTS_APROBADOS', 'LAYOUTS_RECHAZADOS'],
        LAYOUTS_APROBADOS: ['FINALIZADO'],
        LAYOUTS_RECHAZADOS: ['PRENOMINA_APROBADA'],
        FINALIZADO: ['EN_INCIDENCIA'] // Permite reabrir el período
      };

      if (!validTransitions[currentPeriod.status].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `No se puede cambiar de ${currentPeriod.status} a ${status}`
        });
      }

      // Actualizar el período
      const updateData: any = { status };
      
      if (status === PeriodStatus.EN_REVISION) {
        updateData.closedAt = new Date();
        updateData.closedBy = userId;
      } else if (status === PeriodStatus.CERRADO) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = userId;
      } else if (status === PeriodStatus.RECHAZADA) {
        updateData.rejectionReason = rejectionReason;
      }

      const updatedPeriod = await prisma.payrollCalendarPeriod.update({
        where: { id: parseInt(periodId) },
        data: updateData,
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      // Enviar notificación usando el servicio
      const notificationService = getNotificationService();
      await notificationService.notifyPeriodStatusChange(
        updatedPeriod.id,
        currentPeriod.status,
        status,
        updatedPeriod.calendar.companyId,
        updatedPeriod.calendar.company.name,
        updatedPeriod.number
      );

      logger.info(`Period ${periodId} status changed from ${currentPeriod.status} to ${status}`);
      res.json({ data: updatedPeriod, success: true });
    } catch (error) {
      logger.error('Error updating period status:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar estado del período'
      });
    }
  },

  // Subir archivo de prenómina
  async uploadPrenominaFile(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo'
        });
      }

      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Verificar que el período esté cerrado
      if (period.status !== PeriodStatus.CERRADO) {
        return res.status(400).json({
          success: false,
          message: 'El período debe estar cerrado para cargar prenómina'
        });
      }

      // Actualizar el período con la ruta del archivo y cambiar estado
      const updatedPeriod = await prisma.payrollCalendarPeriod.update({
        where: { id: parseInt(periodId) },
        data: {
          prenominaFile: file.path,
          status: 'EN_REVISION_PRENOMINA' as any // Comentado temporalmente hasta que se ejecuten las migraciones
        },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      // Enviar notificación al cliente para revisión de prenómina
      const notificationService = getNotificationService();
      await notificationService.notifyPrenominaReadyForReview(
        period.id,
        period.number,  
        period.calendar.companyId,
        period.calendar.company.name,
        file.originalname
      );

      logger.info(`Prenomina file uploaded for period ${periodId}`);
      res.json({ data: updatedPeriod, success: true });
    } catch (error) {
      logger.error('Error uploading prenomina file:', error);
      console.error('Detailed error:', error); // Log detallado temporal
      
      // Si es un error de Prisma relacionado con enums
      if (error instanceof Error && error.message.includes('Invalid value')) {
        return res.status(500).json({
          success: false,
          message: 'Error de configuración de base de datos. Los nuevos estados de prenómina no están disponibles.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al cargar archivo de prenómina',
        error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Subir archivo de layouts
  async uploadLayoutsFile(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo'
        });
      }

      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Verificar que el período tenga prenómina aprobada
      if (period.status !== 'PRENOMINA_APROBADA' as any || !period.prenominaFile) {
        return res.status(400).json({
          success: false,
          message: 'El período debe tener la prenómina aprobada antes de cargar layouts'
        });
      }

      // Actualizar el período con la ruta del archivo y cambiar estado
      const updatedPeriod = await prisma.payrollCalendarPeriod.update({
        where: { id: parseInt(periodId) },
        data: {
          layoutsFile: file.path,
          status: 'EN_REVISION_LAYOUTS' as any // Cambiar estado a revisión de layouts
        },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      // Enviar notificación al cliente para revisión de layouts
      const notificationService = getNotificationService();
      await notificationService.notifyLayoutsReadyForReview(
        period.id,
        period.number,
        period.calendar.companyId,
        period.calendar.company.name,
        file.originalname
      );

      logger.info(`Layouts file uploaded for period ${periodId}`);
      res.json({ data: updatedPeriod, success: true });
    } catch (error) {
      logger.error('Error uploading layouts file:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cargar archivo de layouts'
      });
    }
  },

  // Obtener estado actual de un período
  async getPeriodStatus(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      
      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        select: {
          id: true,
          status: true,
          number: true,
          prenominaFile: true,
          layoutsFile: true,
          // prenominaRejectionReason: true // TEMPORALMENTE COMENTADO HASTA EJECUTAR MIGRACIÓN
          // layoutsRejectionReason: true // TEMPORALMENTE COMENTADO HASTA EJECUTAR MIGRACIÓN
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      res.json({ data: period, success: true });
    } catch (error) {
      logger.error('Error fetching period status:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado del período'
      });
    }
  },

  // Aprobar prenómina
  async approvePrenomina(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const userId = (req as any).user.id;
      
      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Verificar que el período esté en revisión de prenómina
      if (period.status !== ('EN_REVISION_PRENOMINA' as any)) {
        return res.status(400).json({
          success: false,
          message: 'El período debe estar en revisión de prenómina'
        });
      }

      // Actualizar el período
      const updatedPeriod = await prisma.payrollCalendarPeriod.update({
        where: { id: parseInt(periodId) },
        data: {
          status: 'PRENOMINA_APROBADA' as any,
          prenominaApprovedAt: new Date() as any,
          prenominaApprovedBy: userId as any
        } as any
      });

      // Notificar al operador
      const company = await prisma.company.findUnique({
        where: { id: period.calendar.companyId },
        select: { managedByAdminId: true }
      });
      
      if (company?.managedByAdminId) {
        const notificationService = getNotificationService();
        await notificationService.notifyUser(company.managedByAdminId, {
          type: 'PRENOMINA_APPROVED' as any,
          title: 'Prenómina Aprobada',
          message: `La prenómina del período ${period.number} de ${period.calendar.company.name} ha sido aprobada`,
          priority: 'HIGH'
        });
      }

      logger.info(`Prenomina approved for period ${periodId}`);
      res.json({ data: updatedPeriod, success: true });
    } catch (error) {
      logger.error('Error approving prenomina:', error);
      res.status(500).json({
        success: false,
        message: 'Error al aprobar prenómina'
      });
    }
  },

  // Rechazar prenómina
  async rejectPrenomina(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user.id;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un motivo de rechazo'
        });
      }

      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Verificar que el período esté en revisión de prenómina
      if (period.status !== ('EN_REVISION_PRENOMINA' as any)) {
        return res.status(400).json({
          success: false,
          message: 'El período debe estar en revisión de prenómina'
        });
      }

      // Actualizar el período
      const updatedPeriod = await prisma.payrollCalendarPeriod.update({
        where: { id: parseInt(periodId) },
        data: {
          status: 'PRENOMINA_RECHAZADA' as any,
          prenominaRejectionReason: reason as any,
          prenominaRejectedAt: new Date() as any,
          prenominaRejectedBy: userId as any
        } as any
      });

      // Notificar al operador
      const company = await prisma.company.findUnique({
        where: { id: period.calendar.companyId },
        select: { managedByAdminId: true }
      });
      
      if (company?.managedByAdminId) {
        const notificationService = getNotificationService();
        await notificationService.notifyUser(company.managedByAdminId, {
          type: 'PRENOMINA_REJECTED' as any,
          title: 'Prenómina Rechazada',
          message: `La prenómina del período ${period.number} de ${period.calendar.company.name} ha sido rechazada. Motivo: ${reason}`,
          priority: 'HIGH'
        });
      }

      logger.info(`Prenomina rejected for period ${periodId}`);
      res.json({ data: updatedPeriod, success: true });
    } catch (error) {
      logger.error('Error rejecting prenomina:', error);
      res.status(500).json({
        success: false,
        message: 'Error al rechazar prenómina'
      });
    }
  },

  // Descargar archivo de prenómina
  async downloadPrenomina(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      
      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        select: {
          prenominaFile: true,
          number: true
        }
      });

      if (!period || !period.prenominaFile) {
        return res.status(404).json({
          success: false,
          message: 'Archivo de prenómina no encontrado'
        });
      }

      // Enviar el archivo
      res.download(period.prenominaFile, `prenomina_periodo_${period.number}.xlsx`);
    } catch (error) {
      logger.error('Error downloading prenomina:', error);
      res.status(500).json({
        success: false,
        message: 'Error al descargar archivo de prenómina'
      });
    }
  },

  // Descargar archivo de layouts
  async downloadLayouts(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      
      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        select: {
          layoutsFile: true,
          number: true
        }
      });

      if (!period || !period.layoutsFile) {
        return res.status(404).json({
          success: false,
          message: 'Archivo de layouts no encontrado'
        });
      }

      // Enviar el archivo
      res.download(period.layoutsFile, `layouts_periodo_${period.number}.xlsx`);
    } catch (error) {
      logger.error('Error downloading layouts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al descargar archivo de layouts'
      });
    }
  },

  // Aprobar layouts
  async approveLayouts(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const userId = (req as any).user.id;
      
      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Verificar que el período esté en revisión de layouts
      if (period.status !== ('EN_REVISION_LAYOUTS' as any)) {
        return res.status(400).json({
          success: false,
          message: 'El período debe estar en revisión de layouts'
        });
      }

      // Actualizar el período
      const updatedPeriod = await prisma.payrollCalendarPeriod.update({
        where: { id: parseInt(periodId) },
        data: {
          status: 'LAYOUTS_APROBADOS' as any,
          layoutsApprovedAt: new Date() as any,
          layoutsApprovedBy: userId as any
        } as any
      });

      // Notificar al operador
      const company = await prisma.company.findUnique({
        where: { id: period.calendar.companyId },
        select: { managedByAdminId: true }
      });
      
      if (company?.managedByAdminId) {
        const notificationService = getNotificationService();
        await notificationService.notifyUser(company.managedByAdminId, {
          type: 'LAYOUTS_APPROVED' as any,
          title: 'Layouts Bancarios Aprobados',
          message: `Los layouts bancarios del período ${period.number} de ${period.calendar.company.name} han sido aprobados`,
          priority: 'HIGH'
        });
      }

      logger.info(`Layouts approved for period ${periodId}`);
      res.json({ data: updatedPeriod, success: true });
    } catch (error) {
      logger.error('Error approving layouts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al aprobar layouts'
      });
    }
  },

  // Rechazar layouts
  async rejectLayouts(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user.id;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un motivo de rechazo'
        });
      }

      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Verificar que el período esté en revisión de layouts
      if (period.status !== ('EN_REVISION_LAYOUTS' as any)) {
        return res.status(400).json({
          success: false,
          message: 'El período debe estar en revisión de layouts'
        });
      }

      // Actualizar el período
      const updatedPeriod = await prisma.payrollCalendarPeriod.update({
        where: { id: parseInt(periodId) },
        data: {
          status: 'LAYOUTS_RECHAZADOS' as any,
          layoutsRejectionReason: reason as any,
          layoutsRejectedAt: new Date() as any,
          layoutsRejectedBy: userId as any
        } as any
      });

      // Notificar al operador
      const company = await prisma.company.findUnique({
        where: { id: period.calendar.companyId },
        select: { managedByAdminId: true }
      });
      
      if (company?.managedByAdminId) {
        const notificationService = getNotificationService();
        await notificationService.notifyUser(company.managedByAdminId, {
          type: 'LAYOUTS_REJECTED' as any,
          title: 'Layouts Bancarios Rechazados',
          message: `Los layouts bancarios del período ${period.number} de ${period.calendar.company.name} han sido rechazados. Motivo: ${reason}`,
          priority: 'HIGH'
        });
      }

      logger.info(`Layouts rejected for period ${periodId}`);
      res.json({ data: updatedPeriod, success: true });
    } catch (error) {
      logger.error('Error rejecting layouts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al rechazar layouts'
      });
    }
  },

  // Obtener períodos finalizados de un calendario
  async getFinalizedPeriodsByCalendar(req: Request, res: Response) {
    try {
      const { calendarId } = req.params;
      
      const periods = await prisma.payrollCalendarPeriod.findMany({
        where: { 
          calendarId: parseInt(calendarId),
          status: 'FINALIZADO'
        },
        orderBy: { paymentDate: 'desc' }
      });

      res.json({ data: periods, success: true });
    } catch (error) {
      logger.error('Error fetching finalized periods:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener períodos finalizados'
      });
    }
  },

  // Obtener resumen completo del período
  async getPeriodSummary(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      
      // Obtener información completa del período
      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Obtener incidencias del período
      const incidences = await prisma.incidence.findMany({
        where: {
          companyId: period.calendar.companyId,
          periodId: periodId.toString() // Como periodId es string en la tabla Incidence
        },
        include: {
          workerDetails: true,
          customType: true
        }
      });

      // Construir timeline de estados
      const timeline = [];
      
      // Estado inicial
      timeline.push({
        status: 'Período Iniciado',
        date: period.createdAt,
        user: 'Sistema',
        description: 'El período de nómina fue creado'
      });

      // Si fue cerrado
      if (period.closedAt) {
        timeline.push({
          status: 'Período Cerrado',
          date: period.closedAt,
          user: period.closedBy ? await getUserName(period.closedBy) : 'Sistema',
          description: 'Las incidencias fueron cerradas para revisión'
        });
      }

      // Si fue aprobado
      if (period.approvedAt) {
        timeline.push({
          status: 'Período Aprobado',
          date: period.approvedAt,
          user: period.approvedBy ? await getUserName(period.approvedBy) : 'Sistema',
          description: 'El período fue aprobado y cerrado definitivamente'
        });
      }

      // Si tiene prenómina
      if (period.prenominaFile) {
        timeline.push({
          status: 'Prenómina Cargada',
          date: period.updatedAt, // Temporalmente usando updatedAt
          user: 'Operador',
          description: 'Se cargó el archivo de prenómina'
        });
      }

      // Si prenómina fue aprobada
      if ((period as any).prenominaApprovedAt) {
        timeline.push({
          status: 'Prenómina Aprobada',
          date: (period as any).prenominaApprovedAt,
          user: (period as any).prenominaApprovedBy ? await getUserName((period as any).prenominaApprovedBy) : 'Cliente',
          description: 'La prenómina fue aprobada por el cliente'
        });
      }

      // Si prenómina fue rechazada
      if ((period as any).prenominaRejectedAt) {
        timeline.push({
          status: 'Prenómina Rechazada',
          date: (period as any).prenominaRejectedAt,
          user: (period as any).prenominaRejectedBy ? await getUserName((period as any).prenominaRejectedBy) : 'Cliente',
          description: (period as any).prenominaRejectionReason || 'La prenómina fue rechazada'
        });
      }

      // Si tiene layouts
      if (period.layoutsFile) {
        timeline.push({
          status: 'Layouts Cargados',
          date: period.updatedAt,
          user: 'Operador',
          description: 'Se cargaron los layouts bancarios'
        });
      }

      // Si layouts fueron aprobados
      if ((period as any).layoutsApprovedAt) {
        timeline.push({
          status: 'Layouts Aprobados',
          date: (period as any).layoutsApprovedAt,
          user: (period as any).layoutsApprovedBy ? await getUserName((period as any).layoutsApprovedBy) : 'Cliente',
          description: 'Los layouts bancarios fueron aprobados'
        });
      }

      // Si período fue finalizado
      if (period.status === 'FINALIZADO') {
        timeline.push({
          status: 'Período Finalizado',
          date: period.updatedAt,
          user: 'Sistema',
          description: 'El proceso de nómina fue completado exitosamente'
        });
      }

      // Calcular estadísticas de incidencias
      const incidenceStats = incidences.reduce((acc: any, inc: any) => {
        // Total
        acc.totalIncidences++;
        acc.totalAmount += Number(inc.amount) || 0;
        acc.employeeIds.add(inc.employeeId);
        
        // Por tipo - usar customType si existe, sino usar type
        const typeName = inc.customType?.name || inc.type || 'Sin tipo';
        if (!acc.byType[typeName]) {
          acc.byType[typeName] = { count: 0, amount: 0 };
        }
        acc.byType[typeName].count++;
        acc.byType[typeName].amount += Number(inc.amount) || 0;
        
        return acc;
      }, {
        totalIncidences: 0,
        totalAmount: 0,
        employeeIds: new Set(),
        byType: {}
      });

      // Preparar respuesta
      const summary = {
        ...period,
        timeline: timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        totalIncidences: incidenceStats.totalIncidences,
        totalAmount: incidenceStats.totalAmount,
        totalEmployees: incidenceStats.employeeIds.size,
        incidencesByType: incidenceStats.byType,
        prenominaStatus: (period as any).prenominaApprovedAt ? 'APROBADA' : 
                        (period as any).prenominaRejectedAt ? 'RECHAZADA' : 
                        period.prenominaFile ? 'EN_REVISION' : null,
        layoutsStatus: (period as any).layoutsApprovedAt ? 'APROBADOS' : 
                      (period as any).layoutsRejectedAt ? 'RECHAZADOS' : 
                      period.layoutsFile ? 'EN_REVISION' : null,
        finalFiles: (period as any).timbradoFile ? [{
          title: 'Recibos Timbrados (CFDI)',
          fileName: 'timbrado.zip',
          type: 'timbrado',
          generatedAt: period.updatedAt
        }] : []
      };

      res.json({ data: summary, success: true });
    } catch (error) {
      logger.error('Error fetching period summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen del período'
      });
    }
  },

  // Subir archivo de timbrado (CFDI)
  async uploadTimbradoFile(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo'
        });
      }

      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Verificar que el período tenga layouts aprobados
      if (period.status !== 'LAYOUTS_APROBADOS' as any || !period.layoutsFile) {
        return res.status(400).json({
          success: false,
          message: 'El período debe tener los layouts aprobados antes de cargar el timbrado'
        });
      }

      // Actualizar el período con la ruta del archivo y cambiar estado a FINALIZADO
      const updatedPeriod = await prisma.payrollCalendarPeriod.update({
        where: { id: parseInt(periodId) },
        data: {
          timbradoFile: file.path as any,
          status: 'FINALIZADO' as any
        },
        include: {
          calendar: {
            include: {
              company: true
            }
          }
        }
      });

      // Notificar al cliente que el período ha sido finalizado
      const companyUsers = await prisma.user.findMany({
        where: {
          companyId: period.calendar.companyId,
          role: 'CLIENT'
        }
      });

      const notificationService = getNotificationService();
      for (const user of companyUsers) {
        await notificationService.notifyUser(user.id, {
          type: 'PERIOD_FINALIZED' as any,
          title: 'Período de Nómina Finalizado',
          message: `El período ${period.number} ha sido finalizado exitosamente. Los recibos timbrados están disponibles.`,
          priority: 'HIGH'
        });
      }

      logger.info(`Timbrado file uploaded and period ${periodId} finalized`);
      res.json({ data: updatedPeriod, success: true });
    } catch (error) {
      logger.error('Error uploading timbrado file:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cargar archivo de timbrado'
      });
    }
  },

  // Descargar archivo de timbrado
  async downloadTimbrado(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      
      const period = await prisma.payrollCalendarPeriod.findUnique({
        where: { id: parseInt(periodId) },
        select: {
          timbradoFile: true as any,
          number: true
        }
      });

      if (!period || !(period as any).timbradoFile) {
        return res.status(404).json({
          success: false,
          message: 'Archivo de timbrado no encontrado'
        });
      }

      // Enviar el archivo
      res.download((period as any).timbradoFile, `timbrado_periodo_${period.number}.zip`);
    } catch (error) {
      logger.error('Error downloading timbrado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al descargar archivo de timbrado'
      });
    }
  }
};