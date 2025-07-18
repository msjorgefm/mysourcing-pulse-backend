// src/controllers/payrollCalendarController.ts
import { Request, Response } from 'express';
import { PrismaClient, PeriodStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Función para generar períodos según la frecuencia de pago
function generatePeriods(
  calendarId: number, 
  startDate: Date, 
  payFrequency: string,
  startPeriodNumber: number = 1
) {
  const periods = [];
  const year = startDate.getFullYear();
  let currentDate = new Date(startDate);
  let periodNumber = startPeriodNumber;
  
  // Determinar cuántos períodos generar según la frecuencia
  let periodsToGenerate = 0;
  let daysToAdd = 0;
  
  switch (payFrequency.toLowerCase()) {
    case 'semanal':
      periodsToGenerate = 52; // 52 semanas al año
      daysToAdd = 7;
      break;
    case 'catorcenal':
      periodsToGenerate = 27; // 27 períodos catorcenales aproximadamente
      daysToAdd = 14;
      break;
    case 'quincenal':
      periodsToGenerate = 24; // 24 quincenas al año
      break;
    case 'mensual':
      periodsToGenerate = 12; // 12 meses al año
      break;
    default:
      throw new Error(`Frecuencia de pago no válida: ${payFrequency}`);
  }
  
  // Generar períodos para todo el año
  for (let i = 0; i < periodsToGenerate && currentDate.getFullYear() === year; i++) {
    let periodStart = new Date(currentDate);
    let periodEnd: Date;
    
    if (payFrequency.toLowerCase() === 'quincenal') {
      // Para quincenal: 1-15 y 16-último día del mes
      if (currentDate.getDate() <= 15) {
        periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 16);
      } else {
        periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 16);
        // Último día del mes
        periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        // Mover al primer día del siguiente mes
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      }
    } else if (payFrequency.toLowerCase() === 'mensual') {
      periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    } else {
      // Semanal o catorcenal
      periodEnd = new Date(currentDate);
      periodEnd.setDate(periodEnd.getDate() + daysToAdd - 1);
      currentDate.setDate(currentDate.getDate() + daysToAdd);
    }
    
    periods.push({
      calendarId: calendarId,
      number: periodNumber++,
      startDate: periodStart,
      endDate: periodEnd,
      paymentDate: new Date(periodEnd.getTime() + 24 * 60 * 60 * 1000), // Día siguiente al fin del período
      status: PeriodStatus.EN_INCIDENCIA // Estado inicial
    });
  }
  
  return periods;
}

export const payrollCalendarController = {
  // Obtener todos los calendarios de nómina
  async getAllPayrollCalendars(req: Request, res: Response) {
    try {
      const { companyId } = req.query;
      
      const where = companyId ? { companyId: parseInt(companyId as string) } : {};
      
      const calendars = await prisma.payrollCalendar.findMany({
        where,
        include: {
          company: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({data: calendars, success: true});
    } catch (error) {
      logger.error('Error fetching payroll calendars:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener calendarios de nómina'
      });
    }
  },

  // Obtener calendario de nómina por ID
  async getPayrollCalendarById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const calendar = await prisma.payrollCalendar.findUnique({
        where: { id: parseInt(id) },
        include: {
          company: true
        }
      });

      if (!calendar) {
        return res.status(404).json({
          success: false,
          message: 'Calendario de nómina no encontrado'
        });
      }

      res.json({ data: calendar, success: true });
    } catch (error) {
      logger.error('Error fetching payroll calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener calendario de nómina'
      });
    }
  },

  // Crear nuevo calendario de nómina
  async createPayrollCalendar(req: Request, res: Response) {
    try {
      const data = req.body;
      
      // Validar campos requeridos
      if (!data.name || !data.companyId || !data.payFrequency || !data.startDate) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos',
          errors: ['name, companyId, payFrequency y startDate son requeridos']
        });
      }

      // Crear el calendario y sus períodos en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Crear el calendario
        const calendar = await tx.payrollCalendar.create({
          data: {
            companyId: parseInt(data.companyId),
            name: data.name,
            payFrequency: data.payFrequency,
            daysBeforeClose: data.daysBeforeClose || 0,
            startDate: new Date(data.startDate),
            periodNumber: data.periodNumber || 1,
            payNaturalDays: data.payNaturalDays || false
          },
          include: {
            company: true
          }
        });

        // Generar períodos según la frecuencia
        const periods = generatePeriods(
          calendar.id,
          new Date(data.startDate),
          data.payFrequency,
          data.periodNumber || 1
        );

        // Crear los períodos
        await tx.payrollCalendarPeriod.createMany({
          data: periods
        });

        // Retornar el calendario con sus períodos
        return await tx.payrollCalendar.findUnique({
          where: { id: calendar.id },
          include: {
            company: true,
            periods: {
              orderBy: { number: 'asc' },
              take: 5 // Solo incluir los primeros 5 períodos en la respuesta
            }
          }
        });
      });

      logger.info(`Payroll calendar created with periods: ${result?.id}`);
      res.status(201).json({ data: result, success: true });
    } catch (error) {
      logger.error('Error creating payroll calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear calendario de nómina',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      });
    }
  },

  // Actualizar calendario de nómina
  async updatePayrollCalendar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      logger.info(`Updating payroll calendar ${id} with data:`, data);

      // Verificar que el calendario existe
      const existingCalendar = await prisma.payrollCalendar.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingCalendar) {
        return res.status(404).json({
          success: false,
          message: 'Calendario de nómina no encontrado'
        });
      }

      const calendar = await prisma.payrollCalendar.update({
        where: { id: parseInt(id) },
        data: {
          name: data.name,
          payFrequency: data.payFrequency,
          daysBeforeClose: data.daysBeforeClose,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          periodNumber: data.periodNumber,
          payNaturalDays: data.payNaturalDays
        },
        include: {
          company: true
        }
      });

      logger.info(`Payroll calendar updated: ${calendar.id}`);
      res.json({ data: calendar, success: true });
    } catch (error) {
      logger.error('Error updating payroll calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar calendario de nómina',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Eliminar calendario de nómina
  async deletePayrollCalendar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.payrollCalendar.delete({
        where: { id: parseInt(id) }
      });

      logger.info(`Payroll calendar deleted: ${id}`);
      res.json({
        success: true,
        message: 'Calendario de nómina eliminado'
      });
    } catch (error) {
      logger.error('Error deleting payroll calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar calendario de nómina'
      });
    }
  }
};