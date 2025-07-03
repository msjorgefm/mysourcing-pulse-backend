import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { validateEmployee } from '../middleware/validation';

const prisma = new PrismaClient();

export const employeeController = {
  // Obtener todos los empleados de una empresa
  async getEmployeesByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      const employees = await prisma.employee.findMany({
        where: { companyId: parseInt(companyId) },
        include: {
          company: true,
          incidences: true
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: employees,
        count: employees.length
      });
    } catch (error) {
      logger.error('Error fetching employees:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener empleados'
      });
    }
  },

  // Crear nuevo empleado
  async createEmployee(req: Request, res: Response) {
    try {
      const validation = validateEmployee(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        });
      }

      const employee = await prisma.employee.create({
        data: req.body,
        include: {
          company: true
        }
      });

      logger.info(`Employee created: ${employee.name}`);
      res.status(201).json({
        success: true,
        data: employee
      });
    } catch (error) {
      logger.error('Error creating employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear empleado'
      });
    }
  },

  // Actualizar empleado
  async updateEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const validation = validateEmployee(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        });
      }

      const employee = await prisma.employee.update({
        where: { id: parseInt(id) },
        data: req.body,
        include: {
          company: true
        }
      });

      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      logger.error('Error updating employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar empleado'
      });
    }
  },

  // Eliminar empleado
  async deleteEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.employee.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Empleado eliminado correctamente'
      });
    } catch (error) {
      logger.error('Error deleting employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar empleado'
      });
    }
  }
};