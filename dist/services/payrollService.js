"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const client_1 = require("@prisma/client");
const notificationService_1 = require("./notificationService");
const calculationService_1 = require("./calculationService");
const prisma = new client_1.PrismaClient();
class PayrollService {
    static async getAllPayrolls(companyId, status) {
        const where = {};
        if (companyId)
            where.companyId = companyId;
        if (status)
            where.status = this.mapStatusFromFrontend(status);
        const payrolls = await prisma.payroll.findMany({
            where,
            include: {
                company: {
                    select: { id: true, name: true, rfc: true }
                },
                calendar: {
                    select: { id: true, name: true, payFrequency: true }
                },
                _count: {
                    select: {
                        incidences: true,
                        details: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return payrolls.map((payroll) => ({
            id: payroll.id,
            period: payroll.period,
            periodStart: payroll.periodStart.toISOString().split('T')[0],
            periodEnd: payroll.periodEnd.toISOString().split('T')[0],
            amount: payroll.amount,
            employees: payroll.employees,
            status: this.mapStatusToFrontend(payroll.status),
            companyId: payroll.companyId,
            companyName: payroll.company.name,
            calendarInfo: payroll.calendar,
            calculations: payroll.calculations,
            incidencesCount: payroll._count.incidences,
            submittedAt: payroll.submittedAt,
            submittedBy: payroll.submittedBy,
            authorizedAt: payroll.authorizedAt,
            authorizedBy: payroll.authorizedBy,
            comments: payroll.comments,
            createdAt: payroll.createdAt,
            updatedAt: payroll.updatedAt
        }));
    }
    static async getPayrollById(id, includeDetails = false) {
        const include = {
            company: {
                select: { id: true, name: true, rfc: true }
            },
            calendar: {
                select: { id: true, name: true, payFrequency: true }
            },
            incidences: {
                include: {
                    employee: {
                        select: { id: true, name: true, employeeNumber: true }
                    }
                }
            }
        };
        if (includeDetails) {
            include.details = {
                include: {
                    employee: {
                        select: { id: true, name: true, employeeNumber: true, position: true }
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
            amount: payroll.amount,
            employees: payroll.employees,
            status: this.mapStatusToFrontend(payroll.status),
            companyId: payroll.companyId,
            companyName: payroll.company.name,
            calendarInfo: payroll.calendar,
            calculations: payroll.calculations,
            detailedCalculations: payroll.detailedCalculations,
            incidences: payroll.incidences,
            ...(includeDetails && { details: payroll.details }),
            submittedAt: payroll.submittedAt,
            submittedBy: payroll.submittedBy,
            authorizedAt: payroll.authorizedAt,
            authorizedBy: payroll.authorizedBy,
            comments: payroll.comments,
            createdAt: payroll.createdAt,
            updatedAt: payroll.updatedAt
        };
    }
    static async createPayroll(data, userId) {
        // Verificar que la empresa existe
        const company = await prisma.company.findUnique({
            where: { id: data.companyId },
            include: {
                employees: {
                    where: { status: 'ACTIVE' }
                }
            }
        });
        if (!company) {
            throw new Error('Company not found');
        }
        // Obtener empleados a incluir
        const employees = data.employeeIds?.length
            ? company.employees.filter((emp) => data.employeeIds.includes(emp.id))
            : company.employees;
        if (employees.length === 0) {
            throw new Error('No active employees found for this company');
        }
        // Crear nómina inicial
        const payroll = await prisma.payroll.create({
            data: {
                period: data.period,
                periodStart: new Date(data.periodStart),
                periodEnd: new Date(data.periodEnd),
                amount: 0, // Se calculará después
                employees: employees.length,
                status: 'CALCULATING',
                companyId: data.companyId,
                calendarId: data.calendarId,
                submittedBy: `User-${userId}`
            }
        });
        return {
            id: payroll.id,
            period: payroll.period,
            periodStart: payroll.periodStart.toISOString().split('T')[0],
            periodEnd: payroll.periodEnd.toISOString().split('T')[0],
            amount: payroll.amount,
            employees: payroll.employees,
            status: this.mapStatusToFrontend(payroll.status),
            companyId: payroll.companyId,
            companyName: company.name,
            createdAt: payroll.createdAt
        };
    }
    static async calculatePayroll(payrollId) {
        const payroll = await prisma.payroll.findUnique({
            where: { id: payrollId },
            include: {
                company: {
                    include: {
                        employees: {
                            where: { status: 'ACTIVE' }
                        }
                    }
                },
                incidences: {
                    include: {
                        employee: true
                    }
                }
            }
        });
        if (!payroll) {
            throw new Error('Payroll not found');
        }
        if (payroll.status !== 'CALCULATING') {
            throw new Error('Payroll is not in calculating status');
        }
        // Calcular nómina usando el servicio de cálculos
        const calculations = await calculationService_1.CalculationService.calculatePayrollForCompany(payroll.company.employees, payroll.incidences, payroll.periodStart, payroll.periodEnd);
        // Crear detalles por empleado
        const payrollDetails = [];
        for (const empCalc of calculations.employeeCalculations) {
            const detail = await prisma.payrollDetail.create({
                data: {
                    payrollId: payrollId,
                    employeeId: empCalc.employeeId,
                    perceptions: empCalc.perceptions,
                    deductions: empCalc.deductions,
                    provisions: empCalc.provisions,
                    netPay: empCalc.netPay
                }
            });
            payrollDetails.push(detail);
        }
        // Actualizar nómina con cálculos
        const updatedPayroll = await prisma.payroll.update({
            where: { id: payrollId },
            data: {
                amount: calculations.totals.totalNetPay,
                calculations: calculations.totals,
                detailedCalculations: calculations.employeeCalculations,
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
    static async sendForAuthorization(payrollId, userId, io) {
        const payroll = await prisma.payroll.findUnique({
            where: { id: payrollId },
            include: {
                company: true
            }
        });
        if (!payroll) {
            throw new Error('Payroll not found');
        }
        if (!['CALCULATING', 'PENDING_AUTHORIZATION'].includes(payroll.status)) {
            throw new Error('Payroll cannot be sent for authorization');
        }
        // Si está en CALCULATING, calcular primero
        if (payroll.status === 'CALCULATING') {
            await this.calculatePayroll(payrollId);
        }
        // Actualizar estado
        const updatedPayroll = await prisma.payroll.update({
            where: { id: payrollId },
            data: {
                status: 'PENDING_AUTHORIZATION',
                submittedAt: new Date(),
                submittedBy: `User-${userId}`
            }
        });
        // Crear notificación para el cliente
        await notificationService_1.NotificationService.createPayrollNotification({
            type: 'PAYROLL_PENDING_AUTHORIZATION',
            title: 'Nueva Nómina Pendiente de Autorización',
            message: `${payroll.company.name} - ${payroll.period}`,
            companyId: payroll.companyId,
            payrollId: payroll.id,
            metadata: {
                period: payroll.period,
                amount: payroll.amount,
                employees: payroll.employees,
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
            submittedAt: updatedPayroll.submittedAt
        };
    }
    static async authorizePayroll(payrollId, action, comments = '', userId, io) {
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
                status: newStatus,
                authorizedAt: new Date(),
                authorizedBy: `User-${userId}`,
                comments: comments || undefined
            }
        });
        // Crear notificación para operadores
        const notificationType = action === 'approve' ? 'PAYROLL_APPROVED' : 'PAYROLL_REJECTED';
        const notificationTitle = action === 'approve' ? 'Nómina Aprobada' : 'Nómina Rechazada';
        await notificationService_1.NotificationService.createPayrollNotification({
            type: notificationType,
            title: notificationTitle,
            message: `${payroll.company.name} - ${payroll.period}`,
            companyId: payroll.companyId,
            payrollId: payroll.id,
            metadata: {
                period: payroll.period,
                amount: payroll.amount,
                employees: payroll.employees,
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
            comments: updatedPayroll.comments
        };
    }
    static async getPayrollStats(companyId) {
        const where = {};
        if (companyId)
            where.companyId = companyId;
        const stats = await prisma.payroll.aggregate({
            where,
            _count: { id: true },
            _sum: { amount: true },
            _avg: { amount: true }
        });
        const statusStats = await prisma.payroll.groupBy({
            by: ['status'],
            where,
            _count: { id: true },
            _sum: { amount: true }
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
            _sum: { amount: true }
        });
        return {
            total: {
                count: stats._count.id,
                amount: stats._sum.amount || 0,
                average: stats._avg.amount || 0
            },
            byStatus: statusStats.map((stat) => ({
                status: this.mapStatusToFrontend(stat.status),
                count: stat._count.id,
                amount: stat._sum.amount || 0
            })),
            monthly: monthlyStats.map((stat) => ({
                month: stat.createdAt,
                count: stat._count.id,
                amount: stat._sum.amount || 0
            }))
        };
    }
    // Mapeo de estados
    static mapStatusToFrontend(status) {
        const statusMap = {
            'CALCULATING': 'calculating',
            'PENDING_AUTHORIZATION': 'pending_authorization',
            'APPROVED': 'approved',
            'REJECTED': 'rejected',
            'TIMBERED': 'timbered',
            'DISPERSED': 'dispersed',
            'CANCELLED': 'cancelled'
        };
        return statusMap[status] || status;
    }
    static mapStatusFromFrontend(status) {
        const statusMap = {
            'calculating': 'CALCULATING',
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
exports.PayrollService = PayrollService;
//# sourceMappingURL=payrollService.js.map