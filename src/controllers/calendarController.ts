// src/controllers/calendarController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { validatePayrollCalendar } from '../middleware/validation';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export const calendarController = {
  // Obtener calendarios de una empresa
  async getCalendarsByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      const calendars = await prisma.payrollCalendar.findMany({
        where: { companyId: parseInt(companyId) },
        include: {
          company: true,
          periods: {
            orderBy: { startDate: 'desc' }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: calendars
      });
    } catch (error) {
      logger.error('Error fetching calendars:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener calendarios'
      });
    }
  },

  // Obtener calendario por ID
  async getCalendarById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const calendar = await prisma.payrollCalendar.findUnique({
        where: { id: parseInt(id) },
        include: {
          company: true,
          periods: {
            orderBy: { startDate: 'desc' }
          }
        }
      });

      if (!calendar) {
        return res.status(404).json({
          success: false,
          message: 'Calendario no encontrado'
        });
      }

      res.json({
        success: true,
        data: calendar
      });
    } catch (error) {
      logger.error('Error fetching calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener calendario'
      });
    }
  },

  // Crear nuevo calendario
  async createCalendar(req: Request, res: Response) {
    try {
      const validation = validatePayrollCalendar(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        });
      }

      const calendar = await prisma.payrollCalendar.create({
        data: req.body,
        include: {
          company: true,
          periods: true
        }
      });

      logger.info(`Calendar created: ${calendar.name}`);
      res.status(201).json({
        success: true,
        data: calendar
      });
    } catch (error) {
      logger.error('Error creating calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear calendario'
      });
    }
  },

  // Actualizar calendario
  async updateCalendar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const validation = validatePayrollCalendar(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        });
      }

      const calendar = await prisma.payrollCalendar.update({
        where: { id: parseInt(id) },
        data: req.body,
        include: {
          company: true,
          periods: true
        }
      });

      logger.info(`Calendar updated: ${calendar.name}`);
      res.json({
        success: true,
        data: calendar
      });
    } catch (error: unknown) {
      logger.error('Error updating calendar:', error);
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Calendario no encontrado'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error al actualizar calendario'
      });
    }
  },

  // Eliminar calendario
  async deleteCalendar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar si el calendario tiene períodos asociados
      const periodsCount = await prisma.payrollPeriod.count({
        where: { calendarId: parseInt(id) }
      });

      if (periodsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el calendario porque tiene períodos asociados'
        });
      }

      await prisma.payrollCalendar.delete({
        where: { id: parseInt(id) }
      });

      logger.info(`Calendar deleted: ${id}`);
      res.json({
        success: true,
        message: 'Calendario eliminado exitosamente'
      });
    } catch (error: unknown) {
      logger.error('Error deleting calendar:', error);
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Calendario no encontrado'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error al eliminar calendario'
      });
    }
  },

  // Obtener períodos de un calendario
  async getCalendarPeriods(req: Request, res: Response) {
    try {
      const { calendarId } = req.params;
      const { status, year } = req.query;

      const whereClause: any = {
        calendarId: parseInt(calendarId)
      };

      if (status) {
        whereClause.status = status;
      }

      if (year) {
        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${year}-12-31`);
        whereClause.startDate = {
          gte: yearStart,
          lte: yearEnd
        };
      }

      const periods = await prisma.payrollPeriod.findMany({
        where: whereClause,
        orderBy: { startDate: 'desc' }
      });

      res.json({
        success: true,
        data: periods
      });
    } catch (error) {
      logger.error('Error fetching calendar periods:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener períodos del calendario'
      });
    }
  },

  // Obtener períodos activos
  async getActivePeriods(req: Request, res: Response) {
    try {
      const { calendarId } = req.params;
      const currentDate = new Date();

      const periods = await prisma.payrollPeriod.findMany({
        where: {
          calendarId: parseInt(calendarId),
          startDate: { lte: currentDate },
          endDate: { gte: currentDate }
        },
        orderBy: { startDate: 'asc' }
      });

      res.json({
        success: true,
        data: periods
      });
    } catch (error) {
      logger.error('Error fetching active periods:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener períodos activos'
      });
    }
  },

  // Obtener período actual
  async getCurrentPeriod(req: Request, res: Response) {
    try {
      const { calendarId } = req.params;
      const currentDate = new Date();

      const period = await prisma.payrollPeriod.findFirst({
        where: {
          calendarId: parseInt(calendarId),
          startDate: { lte: currentDate },
          endDate: { gte: currentDate }
        }
      });

      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'No hay período activo en este momento'
        });
      }

      res.json({
        success: true,
        data: period
      });
    } catch (error) {
      logger.error('Error fetching current period:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener período actual'
      });
    }
  },

  // Crear período
  async createPeriod(req: Request, res: Response) {
    try {
      const { calendarId } = req.params;
      const periodData = {
        ...req.body,
        calendarId: parseInt(calendarId)
      };

      // Validar que no haya solapamiento de fechas
      const overlappingPeriod = await prisma.payrollPeriod.findFirst({
        where: {
          calendarId: parseInt(calendarId),
          OR: [
            {
              startDate: { lte: new Date(periodData.endDate) },
              endDate: { gte: new Date(periodData.startDate) }
            }
          ]
        }
      });

      if (overlappingPeriod) {
        return res.status(400).json({
          success: false,
          message: 'Las fechas del período se solapan con un período existente'
        });
      }

      const period = await prisma.payrollPeriod.create({
        data: periodData
      });

      logger.info(`Period created: ${period.name}`);
      res.status(201).json({
        success: true,
        data: period
      });
    } catch (error) {
      logger.error('Error creating period:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear período'
      });
    }
  },

  // Actualizar período
  async updatePeriod(req: Request, res: Response) {
    try {
      const { calendarId, periodId } = req.params;

      // Verificar que el período existe y pertenece al calendario
      const existingPeriod = await prisma.payrollPeriod.findFirst({
        where: {
          id: parseInt(periodId),
          calendarId: parseInt(calendarId)
        }
      });

      if (!existingPeriod) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Validar solapamiento si se están actualizando las fechas
      if (req.body.startDate || req.body.endDate) {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : existingPeriod.startDate;
        const endDate = req.body.endDate ? new Date(req.body.endDate) : existingPeriod.endDate;

        const overlappingPeriod = await prisma.payrollPeriod.findFirst({
          where: {
            calendarId: parseInt(calendarId),
            id: { not: parseInt(periodId) },
            OR: [
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate }
              }
            ]
          }
        });

        if (overlappingPeriod) {
          return res.status(400).json({
            success: false,
            message: 'Las fechas del período se solapan con un período existente'
          });
        }
      }

      const period = await prisma.payrollPeriod.update({
        where: { id: parseInt(periodId) },
        data: req.body
      });

      logger.info(`Period updated: ${period.name}`);
      res.json({
        success: true,
        data: period
      });
    } catch (error) {
      logger.error('Error updating period:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar período'
      });
    }
  },

  // Eliminar período
  async deletePeriod(req: Request, res: Response) {
    try {
      const { calendarId, periodId } = req.params;

      // Verificar que el período existe y pertenece al calendario
      const existingPeriod = await prisma.payrollPeriod.findFirst({
        where: {
          id: parseInt(periodId),
          calendarId: parseInt(calendarId)
        }
      });

      if (!existingPeriod) {
        return res.status(404).json({
          success: false,
          message: 'Período no encontrado'
        });
      }

      // Verificar si hay nóminas asociadas al período
      const payrollsCount = await prisma.payroll.count({
        where: { periodId: parseInt(periodId) }
      });

      if (payrollsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el período porque tiene nóminas asociadas'
        });
      }

      await prisma.payrollPeriod.delete({
        where: { id: parseInt(periodId) }
      });

      logger.info(`Period deleted: ${periodId}`);
      res.json({
        success: true,
        message: 'Período eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error deleting period:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar período'
      });
    }
  },

  // Generar períodos automáticamente
  async generatePeriods(req: Request, res: Response) {
    try {
      const { calendarId } = req.params;
      const { year, frequency } = req.body;

      if (!year || !frequency) {
        return res.status(400).json({
          success: false,
          message: 'Año y frecuencia son requeridos'
        });
      }

      // Obtener el calendario
      const calendar = await prisma.payrollCalendar.findUnique({
        where: { id: parseInt(calendarId) }
      });

      if (!calendar) {
        return res.status(404).json({
          success: false,
          message: 'Calendario no encontrado'
        });
      }

      const periods = [];
      const startDate = new Date(`${year}-01-01`);
      
      // Calcular períodos según la frecuencia
      const frequencyMap: { [key: string]: number } = {
        'quincenal': 15,
        'mensual': 30,
        'semanal': 7,
        'decenal': 10
      };

      const daysPerPeriod = frequencyMap[frequency] || 15;
      const periodsPerYear = Math.floor(365 / daysPerPeriod);

      for (let i = 0; i < periodsPerYear; i++) {
        const periodStart = new Date(startDate);
        periodStart.setDate(startDate.getDate() + (i * daysPerPeriod));
        
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + daysPerPeriod - 1);

        // Verificar que no exceda el año
        if (periodEnd.getFullYear() > year) {
          periodEnd.setDate(31);
          periodEnd.setMonth(11);
          periodEnd.setFullYear(year);
        }

        const periodName = `Período ${i + 1} - ${year}`;
        
        periods.push({
          calendarId: parseInt(calendarId),
          name: periodName,
          startDate: periodStart,
          endDate: periodEnd,
          status: 'draft',
          workingDays: this.calculateWorkingDays(periodStart, periodEnd)
        });
      }

      // Crear períodos en la base de datos
      const createdPeriods = await prisma.payrollPeriod.createMany({
        data: periods,
        skipDuplicates: true
      });

      logger.info(`Generated ${createdPeriods.count} periods for calendar ${calendarId}`);
      
      res.status(201).json({
        success: true,
        message: `Se generaron ${createdPeriods.count} períodos exitosamente`,
        data: { count: createdPeriods.count }
      });
    } catch (error) {
      logger.error('Error generating periods:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar períodos'
      });
    }
  },

  // Método auxiliar para calcular días laborables
  calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Excluir sábados (6) y domingos (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }
};