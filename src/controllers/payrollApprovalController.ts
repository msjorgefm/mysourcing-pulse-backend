import { Request, Response } from 'express';
import { PrismaClient, PayrollStatus, UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

export class PayrollApprovalController {
  
  // Obtener nóminas pendientes de aprobación para el cliente
  static async getPendingPayrolls(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const user = req.user;
      
      // Verificar que el usuario es cliente de la empresa
      if (user.role !== 'CLIENT' || user.companyId !== parseInt(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver estas nóminas'
        });
      }
      
      const payrolls = await prisma.payroll.findMany({
        where: {
          companyId: parseInt(companyId),
          status: PayrollStatus.PENDING_AUTHORIZATION
          // approvalStatus: PayrollApprovalStatus.PENDING
        },
        include: {
          // payrollCalendar: true,
          // createdByUser: {
          //   select: {
          //     id: true,
          //     name: true,
          //     email: true
          //   }
          // },
          payrollItems: {
            include: {
              workerDetails: {
                select: {
                  id: true,
                  numeroTrabajador: true,
                  nombres: true
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
        data: payrolls
      });
      
    } catch (error: any) {
      logger.error('Error getting pending payrolls:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener las nóminas pendientes'
      });
    }
  }
  
  // Aprobar nómina
  static async approvePayroll(req: AuthRequest, res: Response) {
    try {
      const { payrollId } = req.params;
      const user = req.user;
      
      // Obtener la nómina
      const payroll = await prisma.payroll.findUnique({
        where: { id: parseInt(payrollId) },
        include: { company: true }
      });
      
      if (!payroll) {
        return res.status(404).json({
          success: false,
          error: 'Nómina no encontrada'
        });
      }
      
      // Verificar permisos
      if (user.role !== 'CLIENT' || user.companyId !== payroll.companyId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para aprobar esta nómina'
        });
      }
      
      // Actualizar nómina
      const updated = await prisma.payroll.update({
        where: { id: parseInt(payrollId) },
        data: {
          // approvalStatus: PayrollApprovalStatus.APPROVED,
          // clientApprovedBy: user.id,
          // clientApprovalDate: new Date(),
          status: PayrollStatus.AUTHORIZED
        }
      });
      
      // Crear notificación para el operador
      // Obtener todos los usuarios OPERATOR de la empresa para notificarles
      const operators = await prisma.user.findMany({
        where: {
          role: 'OPERATOR',
          isActive: true
        }
      });
      
      // Crear notificación para cada operador
      for (const operator of operators) {
        await prisma.notification.create({
          data: {
            userId: operator.id, // ← AGREGAR ESTE CAMPO A NIVEL RAÍZ
            type: 'INFO' as any, // 'PAYROLL_APPROVED',
            title: 'Nómina Aprobada',
            message: `La nómina del período ${payroll.period} ha sido aprobada por ${user.name}`,
            priority: 'HIGH',
            companyId: payroll.companyId,
            payrollId: payroll.id,
            metadata: {
              payrollId: payroll.id,
              approvedBy: user.name,
              approvalDate: new Date()
            }
          }
        });
      }
      
      res.json({
        success: true,
        data: updated,
        message: 'Nómina aprobada exitosamente'
      });
      
    } catch (error: any) {
      logger.error('Error approving payroll:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al aprobar la nómina'
      });
    }
  }
  
  // Rechazar nómina
  static async rejectPayroll(req: AuthRequest, res: Response) {
    try {
      const { payrollId } = req.params;
      const { reason } = req.body;
      const user = req.user;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Debes proporcionar un motivo de rechazo'
        });
      }
      
      // Obtener la nómina
      const payroll = await prisma.payroll.findUnique({
        where: { id: parseInt(payrollId) },
        include: { company: true }
      });
      
      if (!payroll) {
        return res.status(404).json({
          success: false,
          error: 'Nómina no encontrada'
        });
      }
      
      // Verificar permisos
      if (user.role !== 'CLIENT' || user.companyId !== payroll.companyId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para rechazar esta nómina'
        });
      }
      
      // Actualizar nómina
      const updated = await prisma.payroll.update({
        where: { id: parseInt(payrollId) },
        data: {
          // approvalStatus: PayrollApprovalStatus.REJECTED,
          // clientApprovedBy: user.id,
          // clientApprovalDate: new Date(),
          // clientRejectionReason: reason,
          status: PayrollStatus.DRAFT // Vuelve a borrador
        }
      });
      
      // Crear notificación para el operador
      // Obtener todos los usuarios OPERATOR de la empresa para notificarles
      const operators = await prisma.user.findMany({
        where: {
          role: 'OPERATOR',
          isActive: true
        }
      });
      
      // Crear notificación para cada operador
      for (const operator of operators) {
        await prisma.notification.create({
          data: {
            userId: operator.id, // ← AGREGAR ESTE CAMPO A NIVEL RAÍZ
            type: 'INFO' as any, // 'PAYROLL_REJECTED',
            title: 'Nómina Rechazada',
            message: `La nómina del período ${payroll.period} ha sido rechazada por ${user.name}. Motivo: ${reason}`,
            priority: 'HIGH',
            companyId: payroll.companyId,
            payrollId: payroll.id,
            metadata: {
              payrollId: payroll.id,
              rejectedBy: user.name,
              rejectionDate: new Date(),
              reason
            }
          }
        });
      }
      
      res.json({
        success: true,
        data: updated,
        message: 'Nómina rechazada exitosamente'
      });
      
    } catch (error: any) {
      logger.error('Error rejecting payroll:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al rechazar la nómina'
      });
    }
  }
  
  // Obtener historial de aprobaciones
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
      
      const payrolls = await prisma.payroll.findMany({
        where: {
          companyId: parseInt(companyId),
          // approvalStatus: {
          //   in: [PayrollApprovalStatus.APPROVED, PayrollApprovalStatus.REJECTED]
          // }
          status: {
            in: [PayrollStatus.AUTHORIZED, PayrollStatus.DRAFT]
          }
        },
        include: {
          // payrollCalendar: true,
          // clientApprovedByUser: {
          //   select: {
          //     id: true,
          //     name: true,
          //     email: true
          //   }
          // }
        },
        orderBy: {
          // clientApprovalDate: 'desc'
          updatedAt: 'desc'
        }
      });
      
      res.json({
        success: true,
        data: payrolls
      });
      
    } catch (error: any) {
      logger.error('Error getting approval history:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener el historial'
      });
    }
  }
}