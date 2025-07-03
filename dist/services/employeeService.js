"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EmployeeService {
    static async getAllEmployees(companyId, status) {
        const where = {};
        if (companyId)
            where.companyId = companyId;
        if (status)
            where.status = status.toUpperCase();
        const employees = await prisma.employee.findMany({
            where,
            include: {
                company: {
                    select: { id: true, name: true, rfc: true }
                },
                _count: {
                    select: {
                        incidences: true,
                        payrollDetails: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        return employees.map((employee) => ({
            id: employee.id,
            employeeNumber: employee.employeeNumber,
            name: employee.name,
            email: employee.email,
            rfc: employee.rfc,
            position: employee.position,
            department: employee.department,
            salary: employee.salary,
            hireDate: employee.hireDate.toISOString().split('T')[0],
            status: this.mapStatusToFrontend(employee.status),
            companyId: employee.companyId,
            companyName: employee.company.name,
            bankName: employee.bankName,
            accountNumber: employee.accountNumber ? `****${employee.accountNumber.slice(-4)}` : null,
            clabe: employee.clabe ? `****${employee.clabe.slice(-4)}` : null,
            incidencesCount: employee._count.incidences,
            payrollsCount: employee._count.payrollDetails,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt
        }));
    }
    static async getEmployeeById(id) {
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                company: {
                    select: { id: true, name: true, rfc: true }
                },
                incidences: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                payrollDetails: {
                    include: {
                        payroll: {
                            select: { id: true, period: true, status: true, createdAt: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });
        if (!employee) {
            throw new Error('Employee not found');
        }
        return {
            id: employee.id,
            employeeNumber: employee.employeeNumber,
            name: employee.name,
            email: employee.email,
            rfc: employee.rfc,
            position: employee.position,
            department: employee.department,
            salary: employee.salary,
            hireDate: employee.hireDate.toISOString().split('T')[0],
            status: this.mapStatusToFrontend(employee.status),
            companyId: employee.companyId,
            companyName: employee.company.name,
            bankName: employee.bankName,
            accountNumber: employee.accountNumber,
            clabe: employee.clabe,
            incidences: employee.incidences,
            payrollDetails: employee.payrollDetails,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt
        };
    }
    static async createEmployee(data) {
        // Verificar que la empresa existe
        const company = await prisma.company.findUnique({
            where: { id: data.companyId }
        });
        if (!company) {
            throw new Error('Company not found');
        }
        // Verificar RFC único
        const existingRfc = await prisma.employee.findUnique({
            where: { rfc: data.rfc }
        });
        if (existingRfc) {
            throw new Error('RFC already exists');
        }
        // Verificar email único
        const existingEmail = await prisma.employee.findUnique({
            where: { email: data.email }
        });
        if (existingEmail) {
            throw new Error('Email already exists');
        }
        // Verificar número de empleado único
        const existingNumber = await prisma.employee.findUnique({
            where: { employeeNumber: data.employeeNumber }
        });
        if (existingNumber) {
            throw new Error('Employee number already exists');
        }
        const employee = await prisma.employee.create({
            data: {
                ...data,
                hireDate: new Date(data.hireDate),
                status: 'ACTIVE'
            }
        });
        // Actualizar contador de empleados en la empresa
        await prisma.company.update({
            where: { id: data.companyId },
            data: {
                employeesCount: {
                    increment: 1
                }
            }
        });
        return {
            id: employee.id,
            employeeNumber: employee.employeeNumber,
            name: employee.name,
            email: employee.email,
            rfc: employee.rfc,
            position: employee.position,
            department: employee.department,
            salary: employee.salary,
            hireDate: employee.hireDate.toISOString().split('T')[0],
            status: this.mapStatusToFrontend(employee.status),
            companyId: employee.companyId,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt
        };
    }
    static async updateEmployee(data) {
        const { id, ...updateData } = data;
        const existingEmployee = await prisma.employee.findUnique({
            where: { id }
        });
        if (!existingEmployee) {
            throw new Error('Employee not found');
        }
        // Verificar RFC único si se está actualizando
        if (updateData.rfc && updateData.rfc !== existingEmployee.rfc) {
            const rfcExists = await prisma.employee.findUnique({
                where: { rfc: updateData.rfc }
            });
            if (rfcExists) {
                throw new Error('RFC already exists');
            }
        }
        // Verificar email único si se está actualizando
        if (updateData.email && updateData.email !== existingEmployee.email) {
            const emailExists = await prisma.employee.findUnique({
                where: { email: updateData.email }
            });
            if (emailExists) {
                throw new Error('Email already exists');
            }
        }
        const employee = await prisma.employee.update({
            where: { id },
            data: {
                ...updateData,
                ...(updateData.hireDate && { hireDate: new Date(updateData.hireDate) })
            }
        });
        return {
            id: employee.id,
            employeeNumber: employee.employeeNumber,
            name: employee.name,
            email: employee.email,
            rfc: employee.rfc,
            position: employee.position,
            department: employee.department,
            salary: employee.salary,
            hireDate: employee.hireDate.toISOString().split('T')[0],
            status: this.mapStatusToFrontend(employee.status),
            companyId: employee.companyId,
            bankName: employee.bankName,
            accountNumber: employee.accountNumber,
            clabe: employee.clabe,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt
        };
    }
    static async deleteEmployee(id) {
        const employee = await prisma.employee.findUnique({
            where: { id }
        });
        if (!employee) {
            throw new Error('Employee not found');
        }
        // Verificar si tiene nóminas activas
        const activePayrolls = await prisma.payrollDetail.count({
            where: {
                employeeId: id,
                payroll: {
                    status: {
                        in: ['CALCULATING', 'PENDING_AUTHORIZATION']
                    }
                }
            }
        });
        if (activePayrolls > 0) {
            throw new Error('Cannot delete employee with active payrolls');
        }
        // Soft delete: cambiar status a TERMINATED
        await prisma.employee.update({
            where: { id },
            data: { status: 'TERMINATED' }
        });
        // Actualizar contador de empleados en la empresa
        await prisma.company.update({
            where: { id: employee.companyId },
            data: {
                employeesCount: {
                    decrement: 1
                }
            }
        });
        return {
            message: 'Employee deactivated successfully',
            employeeId: id
        };
    }
    static async getEmployeeStats(companyId) {
        const where = {};
        if (companyId)
            where.companyId = companyId;
        const stats = await prisma.employee.groupBy({
            by: ['status', 'department'],
            where,
            _count: { id: true },
            _avg: { salary: true }
        });
        const totalStats = await prisma.employee.aggregate({
            where,
            _count: { id: true },
            _avg: { salary: true },
            _min: { salary: true },
            _max: { salary: true }
        });
        return {
            total: totalStats._count.id,
            averageSalary: totalStats._avg.salary || 0,
            minSalary: totalStats._min.salary || 0,
            maxSalary: totalStats._max.salary || 0,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat.status] = (acc[stat.status] || 0) + stat._count.id;
                return acc;
            }, {}),
            byDepartment: stats.reduce((acc, stat) => {
                if (!acc[stat.department]) {
                    acc[stat.department] = { count: 0, avgSalary: 0 };
                }
                acc[stat.department].count += stat._count.id;
                acc[stat.department].avgSalary = stat._avg.salary || 0;
                return acc;
            }, {})
        };
    }
    static mapStatusToFrontend(status) {
        const statusMap = {
            'ACTIVE': 'Activo',
            'INACTIVE': 'Inactivo',
            'TERMINATED': 'Terminado',
            'ON_LEAVE': 'Con Permiso'
        };
        return statusMap[status] || status;
    }
}
exports.EmployeeService = EmployeeService;
//# sourceMappingURL=employeeService.js.map