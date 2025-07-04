"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CompanyService {
    static async getAllCompanies(operatorOnly = false) {
        const companies = await prisma.company.findMany({
            include: {
                employees: {
                    where: { status: 'ACTIVE' },
                    select: { id: true }
                },
                payrolls: {
                    select: {
                        id: true,
                        status: true,
                        totalNet: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                calendars: {
                    select: { id: true, name: true, year: true }
                },
                _count: {
                    select: {
                        employees: { where: { status: 'ACTIVE' } },
                        payrolls: true,
                        incidences: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Transformar datos para el frontend
        return companies.map((company) => ({
            id: company.id,
            name: company.name,
            rfc: company.rfc,
            legalName: company.legalName,
            address: company.address,
            email: company.email,
            phone: company.phone,
            status: this.mapStatusToFrontend(company.status),
            employeesCount: company._count?.employees || 0,
            payrollsCount: company._count.payrolls,
            incidencesCount: company._count.incidences,
            calendarsCount: company.calendars.length,
            paymentMethod: company.paymentMethod,
            bankAccount: company.bankAccount,
            recentPayrolls: company.payrolls,
            activeCalendars: company.calendars,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        }));
    }
    static async getCompanyById(id, includeDetails = false) {
        const include = {
            _count: {
                select: {
                    employees: { where: { status: 'ACTIVE' } },
                    payrolls: true,
                    incidences: true
                }
            }
        };
        if (includeDetails) {
            include.employees = {
                where: { status: 'ACTIVE' },
                orderBy: { name: 'asc' }
            };
            include.payrolls = {
                orderBy: { createdAt: 'desc' },
                take: 10
            };
            include.calendars = true;
        }
        const company = await prisma.company.findUnique({
            where: { id },
            include
        });
        if (!company) {
            throw new Error('Company not found');
        }
        return {
            id: company.id,
            name: company.name,
            rfc: company.rfc,
            legalName: company.legalName,
            address: company.address,
            email: company.email,
            phone: company.phone,
            status: this.mapStatusToFrontend(company.status),
            employeesCount: company._count?.employees || 0,
            paymentMethod: company.paymentMethod,
            bankAccount: company.bankAccount,
            ...(includeDetails && {
                employees: company.employees || [],
                payrolls: company.payrolls || [],
                calendars: company.calendars || []
            }),
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        };
    }
    static async createCompany(data) {
        // Verificar si RFC ya existe
        const existingCompany = await prisma.company.findUnique({
            where: { rfc: data.rfc }
        });
        if (existingCompany) {
            throw new Error('RFC already exists');
        }
        const company = await prisma.company.create({
            data: {
                name: data.name,
                rfc: data.rfc,
                legalName: data.legalName,
                address: data.address,
                email: data.email,
                phone: data.phone,
                status: (data.status ? this.mapStatusFromFrontend(data.status) : 'IN_SETUP'),
                paymentMethod: data.paymentMethod,
                bankAccount: data.bankAccount,
                employeesCount: 0
            }
        });
        return {
            id: company.id,
            name: company.name,
            rfc: company.rfc,
            legalName: company.legalName,
            address: company.address,
            email: company.email,
            phone: company.phone,
            status: this.mapStatusToFrontend(company.status),
            employeesCount: 0,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        };
    }
    static async updateCompany(data) {
        const { id, ...updateData } = data;
        // Verificar si la empresa existe
        const existingCompany = await prisma.company.findUnique({
            where: { id }
        });
        if (!existingCompany) {
            throw new Error('Company not found');
        }
        // Si se está actualizando el RFC, verificar que no exista
        if (updateData.rfc && updateData.rfc !== existingCompany.rfc) {
            const rfcExists = await prisma.company.findUnique({
                where: { rfc: updateData.rfc }
            });
            if (rfcExists) {
                throw new Error('RFC already exists');
            }
        }
        const company = await prisma.company.update({
            where: { id },
            data: {
                ...updateData,
                ...(updateData.status && {
                    status: this.mapStatusFromFrontend(updateData.status)
                })
            }
        });
        return {
            id: company.id,
            name: company.name,
            rfc: company.rfc,
            legalName: company.legalName,
            address: company.address,
            email: company.email,
            phone: company.phone,
            status: this.mapStatusToFrontend(company.status),
            employeesCount: company.employeesCount,
            paymentMethod: company.paymentMethod,
            bankAccount: company.bankAccount,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        };
    }
    static async deleteCompany(id) {
        // Verificar si la empresa tiene empleados activos
        const employeeCount = await prisma.employee.count({
            where: {
                companyId: id,
                status: 'ACTIVE'
            }
        });
        if (employeeCount > 0) {
            throw new Error('Cannot delete company with active employees');
        }
        // Verificar si tiene nóminas pendientes
        const pendingPayrolls = await prisma.payroll.count({
            where: {
                companyId: id,
                status: {
                    in: ['CALCULATED', 'PENDING_AUTHORIZATION']
                }
            }
        });
        if (pendingPayrolls > 0) {
            throw new Error('Cannot delete company with pending payrolls');
        }
        // Soft delete: cambiar status a INACTIVE
        const company = await prisma.company.update({
            where: { id },
            data: { status: 'INACTIVE' }
        });
        return {
            message: 'Company deactivated successfully',
            companyId: id
        };
    }
    static async getCompanyStats(id) {
        const stats = await prisma.company.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        employees: { where: { status: 'ACTIVE' } },
                        payrolls: true,
                        incidences: true,
                        calendars: true
                    }
                },
                payrolls: {
                    select: {
                        totalNet: true,
                        status: true,
                        createdAt: true
                    },
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), 0, 1) // Este año
                        }
                    }
                },
                incidences: {
                    select: {
                        amount: true,
                        type: true,
                        createdAt: true
                    },
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), 0, 1) // Este año
                        }
                    }
                }
            }
        });
        if (!stats) {
            throw new Error('Company not found');
        }
        // Calcular estadísticas
        const totalPayrollAmount = stats.payrolls.reduce((sum, p) => sum + Number(p.totalNet), 0);
        const avgPayrollAmount = stats.payrolls.length > 0 ? totalPayrollAmount / stats.payrolls.length : 0;
        const payrollsByStatus = stats.payrolls.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {});
        const incidencesByType = stats.incidences.reduce((acc, inc) => {
            acc[inc.type] = (acc[inc.type] || 0) + 1;
            return acc;
        }, {});
        const totalIncidenceAmount = stats.incidences.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
        return {
            companyId: id,
            employees: {
                total: stats._count.employees,
                active: stats._count.employees
            },
            payrolls: {
                total: stats._count.payrolls,
                totalAmount: totalPayrollAmount,
                avgAmount: avgPayrollAmount,
                byStatus: payrollsByStatus
            },
            incidences: {
                total: stats._count.incidences,
                totalAmount: totalIncidenceAmount,
                byType: incidencesByType
            },
            calendars: {
                total: stats._count.calendars
            }
        };
    }
    // Mapeo de estados entre frontend y backend
    static mapStatusToFrontend(status) {
        const statusMap = {
            'IN_SETUP': 'En Configuración',
            'CONFIGURED': 'Configurada',
            'ACTIVE': 'Activa',
            'INACTIVE': 'Inactiva',
            'SUSPENDED': 'Suspendida'
        };
        return statusMap[status] || status;
    }
    static mapStatusFromFrontend(status) {
        const statusMap = {
            'En Configuración': 'IN_SETUP',
            'Configurada': 'CONFIGURED',
            'Activa': 'ACTIVE',
            'Inactiva': 'INACTIVE',
            'Suspendida': 'SUSPENDED'
        };
        return statusMap[status] || 'IN_SETUP';
    }
}
exports.CompanyService = CompanyService;
//# sourceMappingURL=companyService.js.map