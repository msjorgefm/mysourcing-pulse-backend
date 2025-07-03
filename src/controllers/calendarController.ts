import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { validatePayrollCalendar } from '../middleware/validation';

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
  }
};