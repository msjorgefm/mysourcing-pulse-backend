// src/controllers/payrollCalendarController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

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

      const calendar = await prisma.payrollCalendar.create({
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

      logger.info(`Payroll calendar created: ${calendar.id}`);
      res.status(201).json({ data: calendar, success: true });
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