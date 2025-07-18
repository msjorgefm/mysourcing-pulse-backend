import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService';
import { CalculationService } from './calculationService';

const prisma = new PrismaClient();

export interface CreatePayrollRequest {
  companyId: number;
  period: string;
  periodStart: string;
  periodEnd: string;
  calendarId?: number;
  workerDetailsIds?: number[];
}

export interface PayrollCalculation {
  totalPerceptions: number;
  totalDeductions: number;
  totalProvisions: number;
  totalNetPay: number;
  totalEmployees: number;
  totalIncidences: number;
  employeesWithIncidences: number;
  totalCompanyCost: number;
}

export class PayrollService {
  
  static async getAllPayrolls(companyId?: number, status?: string) {
    const where: any = {};
    
    if (companyId) where.companyId = companyId;
    if (status) where.status = this.mapStatusFromFrontend(status);
    
    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        company: {
          select: { 
            id: true, 
            name: true,
            generalInfo: {
              select: {
                rfc: true
              }
            }
          }
        },
        // Calendar relationship removed as it doesn't exist in schema
        _count: {
          select: {
            incidences: true,
            payrollItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return payrolls.map((payroll: typeof payrolls[number]) => ({
      id: payroll.id,
      period: payroll.period,
      periodStart: payroll.periodStart.toISOString().split('T')[0],
      periodEnd: payroll.periodEnd.toISOString().split('T')[0],
      totalNet: Number(payroll.totalNet),
      employeeCount: payroll.employeeCount,
      status: this.mapStatusToFrontend(payroll.status),
      companyId: payroll.companyId,
      companyName: payroll.company.name,
      incidencesCount: payroll._count.incidences,
      processedAt: payroll.processedAt,
      authorizedAt: payroll.authorizedAt,
      authorizedBy: payroll.authorizedBy,
      createdAt: payroll.createdAt,
      updatedAt: payroll.updatedAt
    }));
  }
  
  static async getPayrollById(id: number, includeDetails: boolean = false) {
    const include: any = {
      company: {
        select: { 
          id: true, 
          name: true,
          generalInfo: {
            select: { rfc: true }
          }
        }
      },
      // Calendar relationship removed
      incidences: {
        include: {
          workerDetails: {
            select: { id: true, nombres: true, apellidoPaterno: true, apellidoMaterno: true, numeroTrabajador: true }
          }
        }
      }
    };
    
    if (includeDetails) {
      include.payrollItems = {
        include: {
          workerDetails: {
            select: { id: true, nombres: true, apellidoPaterno: true, apellidoMaterno: true, numeroTrabajador: true }
          }
        }
      };
    }
    
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include
    });
    
    if (!payroll) {
      throw new Error('Payroll not found');
    }
    
    return {
      id: payroll.id,
      period: payroll.period,
      periodStart: payroll.periodStart.toISOString().split('T')[0],
      periodEnd: payroll.periodEnd.toISOString().split('T')[0],
      totalNet: Number(payroll.totalNet),
      employeeCount: payroll.employeeCount,
      status: this.mapStatusToFrontend(payroll.status),
      companyId: payroll.companyId,
      companyName: (payroll as any).company.name,
      incidences: (payroll as any).incidences,
      ...(includeDetails && { payrollItems: payroll.payrollItems }),
      processedAt: payroll.processedAt,
      authorizedAt: payroll.authorizedAt,
      authorizedBy: payroll.authorizedBy,
      // Comments field removed
      createdAt: payroll.createdAt,
      updatedAt: payroll.updatedAt
    };
  }
  
  static async createPayroll(data: CreatePayrollRequest, userId: number) {
    // Verificar que la empresa existe
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
      include: {
        workerDetails: true
      }
    });
    
    if (!company) {
      throw new Error('Company not found');
    }
    
    // Obtener trabajadores a incluir
    const workers = data.workerDetailsIds?.length 
      ? company.workerDetails?.filter( (worker: { id: number }) => data.workerDetailsIds!.includes(worker.id)) || []
      : company.workerDetails || [];
    
    if (workers.length === 0) { 
      throw new Error('No active workers found for this company');
    }
    
    // Crear nómina inicial
    const payroll = await prisma.payroll.create({
      data: {
        period: data.period,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        employeeCount: workers.length,
        status: 'DRAFT',
        companyId: data.companyId
      }
    });
    
    return {
      id: payroll.id,
      period: payroll.period,
      periodStart: payroll.periodStart.toISOString().split('T')[0],
      periodEnd: payroll.periodEnd.toISOString().split('T')[0],
      totalNet: Number(payroll.totalNet),
      employeeCount: payroll.employeeCount,
      status: this.mapStatusToFrontend(payroll.status),
      companyId: payroll.companyId,
      companyName: company.name,
      createdAt: payroll.createdAt
    };
  }
  
  static async calculatePayroll(payrollId: number) {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        company: {
          include: {
            workerDetails: true
          }
        },
        incidences: {
          include: {
            workerDetails: true
          }
        }
      }
    });
    
    if (!payroll) {
      throw new Error('Payroll not found');
    }
    
    if (payroll.status !== 'DRAFT') {
      throw new Error('Payroll is not in draft status');
    }
    
    // Calcular nómina usando el servicio de cálculos
    const calculations = await CalculationService.calculatePayrollForCompany(
      (payroll.company.workerDetails) || [],
      (payroll as any).incidences || [],
      payroll.periodStart,
      payroll.periodEnd
    );
    
    // Crear detalles por trabajador
    const payrollDetails = [];
    for (const workerCalc of calculations.employeeCalculations) {
      const detail = await prisma.payrollItem.create({
        data: {
          payrollId: payrollId,
          workerDetailsId: workerCalc.employeeId, // Note: CalculationService might need to be updated to use workerId
          baseSalary: workerCalc.perceptions?.salarioBase || 0,
          totalGross: workerCalc.perceptions?.total || 0,
          totalDeductions: workerCalc.deductions?.total || 0,
          netSalary: workerCalc.netPay || 0,
          workedDays: 15
        }
      });
      payrollDetails.push(detail);
    }
    
    // Actualizar nómina con cálculos
    const updatedPayroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        totalGross: calculations.totals.totalPerceptions || 0,
        totalDeductions: calculations.totals.totalDeductions || 0,
        totalNet: calculations.totals.totalNetPay || 0,
        status: 'PENDING_AUTHORIZATION'
      }
    });
    
    return {
      id: updatedPayroll.id,
      calculations: calculations.totals,
      detailedCalculations: calculations.employeeCalculations,
      status: this.mapStatusToFrontend(updatedPayroll.status)
    };
  }
  
  static async sendForAuthorization(payrollId: number, userId: number, io: any) {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        company: true
      }
    });
    
    if (!payroll) {
      throw new Error('Payroll not found');
    }
    
    if (!['DRAFT', 'CALCULATED', 'PENDING_AUTHORIZATION'].includes(payroll.status)) {
      throw new Error('Payroll cannot be sent for authorization');
    }
    
    // Si está en CALCULATING, calcular primero
    if (payroll.status === 'DRAFT') {
      await this.calculatePayroll(payrollId);
    }
    
    // Actualizar estado
    const updatedPayroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: 'PENDING_AUTHORIZATION',
        processedAt: new Date(),
        authorizedBy: `User-${userId}`
      }
    });
    
    // Crear notificación para el cliente
    await NotificationService.createPayrollNotification({
      type: 'PAYROLL_PENDING_AUTHORIZATION',
      title: 'Nueva Nómina Pendiente de Autorización',
      message: `${payroll.company.name} - ${payroll.period}`,
      companyId: payroll.companyId,
      payrollId: payroll.id,
      metadata: {
        period: payroll.period,
        totalNet: Number(payroll.totalNet),
        employeeCount: payroll.employeeCount,
        companyName: payroll.company.name
      }
    });
    
    // Enviar notificación en tiempo real
    if (io) {
      io.to(`company-${payroll.companyId}`).emit('new-notification', {
        type: 'payroll_pending_authorization',
        title: 'Nueva Nómina Pendiente',
        message: `${payroll.company.name} - ${payroll.period}`,
        payrollId: payroll.id
      });
    }
    
    return {
      id: updatedPayroll.id,
      status: this.mapStatusToFrontend(updatedPayroll.status),
      processedAt: updatedPayroll.processedAt
    };
  }
  
  static async authorizePayroll(payrollId: number, action: 'approve' | 'reject', comments: string = '', userId: number, io: any) {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        company: true
      }
    });
    
    if (!payroll) {
      throw new Error('Payroll not found');
    }
    
    if (payroll.status !== 'PENDING_AUTHORIZATION') {
      throw new Error('Payroll is not pending authorization');
    }
    
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    
    // Actualizar nómina
    const updatedPayroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: newStatus as any,
        authorizedAt: new Date(),
        authorizedBy: `User-${userId}`
      }
    });
    
    // Crear notificación para operadores
    const notificationType = action === 'approve' ? 'PAYROLL_APPROVED' : 'PAYROLL_REJECTED';
    const notificationTitle = action === 'approve' ? 'Nómina Aprobada' : 'Nómina Rechazada';
    
    await NotificationService.createPayrollNotification({
      type: notificationType,
      title: notificationTitle,
      message: `${payroll.company.name} - ${payroll.period}`,
      companyId: payroll.companyId,
      payrollId: payroll.id,
      metadata: {
        period: payroll.period,
        totalNet: Number(payroll.totalNet),
        employeeCount: payroll.employeeCount,
        companyName: payroll.company.name,
        action,
        comments
      }
    });
    
    // Enviar notificación en tiempo real
    if (io) {
      const eventType = action === 'approve' ? 'payroll_approved' : 'payroll_rejected';
      io.to(`company-${payroll.companyId}`).emit('payroll-status-change', {
        type: eventType,
        payrollId: payroll.id,
        status: this.mapStatusToFrontend(newStatus),
        comments
      });
    }
    
    return {
      id: updatedPayroll.id,
      status: this.mapStatusToFrontend(updatedPayroll.status),
      authorizedAt: updatedPayroll.authorizedAt,
      // Comments field removed
    };
  }
  
  static async getPayrollStats(companyId?: number) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    
    const stats = await prisma.payroll.aggregate({
      where,
      _count: { id: true },
      _sum: { totalNet: true },
      _avg: { totalNet: true }
    });
    
    const statusStats = await prisma.payroll.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
      _sum: { totalNet: true }
    });
    
    const monthlyStats = await prisma.payroll.groupBy({
      by: ['createdAt'],
      where: {
        ...where,
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1)
        }
      },
      _count: { id: true },
      _sum: { totalNet: true }
    });
    
    return {
      total: {
        count: stats._count.id,
        amount: Number(stats._sum.totalNet) || 0,
        average: Number(stats._avg.totalNet) || 0
      },
      byStatus: statusStats.map((stat: any) => ({
        status: this.mapStatusToFrontend(stat.status),
        count: stat._count.id,
        amount: stat._sum.totalNet || 0
      })),
      monthly: monthlyStats.map((stat: any) => ({
        month: stat.createdAt,
        count: stat._count.id,
        amount: stat._sum.totalNet || 0
      }))
    };
  }
  
  // Mapeo de estados
  private static mapStatusToFrontend(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'draft',
      'CALCULATED': 'calculated',
      'PENDING_AUTHORIZATION': 'pending_authorization',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'TIMBERED': 'timbered',
      'DISPERSED': 'dispersed',
      'CANCELLED': 'cancelled'
    };
    
    return statusMap[status] || status;
  }
  
  private static mapStatusFromFrontend(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'DRAFT',
      'calculated': 'CALCULATED',
      'pending_authorization': 'PENDING_AUTHORIZATION',
      'approved': 'APPROVED',
      'rejected': 'REJECTED',
      'timbered': 'TIMBERED',
      'dispersed': 'DISPERSED',
      'cancelled': 'CANCELLED'
    };
    
    return statusMap[status] || 'CALCULATING';
  }
}