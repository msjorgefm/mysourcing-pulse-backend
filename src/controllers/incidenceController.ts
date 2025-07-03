import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { validateIncidence } from '../middleware/validation';
import { calculateIncidenceAmount } from '../utils/calculator';

const prisma = new PrismaClient();

export const incidenceController = {
  // Obtener incidencias por empresa y período
  async getIncidencesByPeriod(req: Request, res: Response) {
    try {
      const { companyId, periodStart, periodEnd } = req.query;

      const incidences = await prisma.incidence.findMany({
        where: {
          companyId: parseInt(companyId as string),
          date: {
            gte: new Date(periodStart as string),
            lte: new Date(periodEnd as string)
          }
        },
        include: {
          employee: true,
          company: true
        },
        orderBy: { date: 'desc' }
      });

      res.json({
        success: true,
        data: incidences,
        count: incidences.length
      });
    } catch (error) {
      logger.error('Error fetching incidences:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener incidencias'
      });
    }
  },

  // Crear nueva incidencia
  async createIncidence(req: Request, res: Response) {
    try {
      const validation = validateIncidence(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        });
      }

      // Obtener datos del empleado para calcular monto
      const employee = await prisma.employee.findUnique({
        where: { id: req.body.employeeId }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado'
        });
      }

      // Calcular monto automáticamente
      const calculatedAmount = calculateIncidenceAmount(
        req.body.type,
        employee,
        req.body.quantity
      );

      const incidence = await prisma.incidence.create({
        data: {
          ...req.body,
          amount: calculatedAmount
        },
        include: {
          employee: true,
          company: true
        }
      });

      logger.info(`Incidence created for employee: ${employee.name}`);
      res.status(201).json({
        success: true,
        data: incidence
      });
    } catch (error) {
      logger.error('Error creating incidence:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear incidencia'
      });
    }
  },

  // Actualizar incidencia
  async updateIncidence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const validation = validateIncidence(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        });
      }

      // Recalcular monto si cambió la cantidad o tipo
      const employee = await prisma.employee.findUnique({
        where: { id: req.body.employeeId }
      });

      const calculatedAmount = calculateIncidenceAmount(
        req.body.type,
        employee!,
        req.body.quantity
      );

      const incidence = await prisma.incidence.update({
        where: { id: parseInt(id) },
        data: {
          ...req.body,
          amount: calculatedAmount
        },
        include: {
          employee: true,
          company: true
        }
      });

      res.json({
        success: true,
        data: incidence
      });
    } catch (error) {
      logger.error('Error updating incidence:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar incidencia'
      });
    }
  },

  // Eliminar incidencia
  async deleteIncidence(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.incidence.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Incidencia eliminada correctamente'
      });
    } catch (error) {
      logger.error('Error deleting incidence:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar incidencia'
      });
    }
  },

  // Obtener estadísticas de incidencias
  async getIncidenceStats(req: Request, res: Response) {
    try {
      const { companyId, periodStart, periodEnd } = req.query;

      const stats = await prisma.incidence.groupBy({
        by: ['type'],
        where: {
          companyId: parseInt(companyId as string),
          date: {
            gte: new Date(periodStart as string),
            lte: new Date(periodEnd as string)
          }
        },
        _count: true,
        _sum: {
          amount: true,
          quantity: true
        }
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching incidence stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas'
      });
    }
  }
};