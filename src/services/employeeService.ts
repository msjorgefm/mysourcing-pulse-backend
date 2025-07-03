import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateEmployeeRequest {
  employeeNumber: string;
  name: string;
  email: string;
  rfc: string;
  position: string;
  department: string;
  baseSalary: number;
  hireDate: string;
  companyId: number;
  bankName?: string;
  bankAccount?: string;
  clabe?: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  id: number;
}

export class EmployeeService {
  
  static async getAllEmployees(companyId?: number, status?: string) {
    const where: any = {};
    
    if (companyId) where.companyId = companyId;
    if (status) where.status = status.toUpperCase();
    
    const employees = await prisma.employee.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, rfc: true }
        },
        _count: {
          select: {
            incidences: true,
            payrollItems: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return employees.map((employee: typeof employees[number]) => ({
      id: employee.id,
      employeeNumber: employee.employeeNumber,
      name: employee.name,
      email: employee.email,
      rfc: employee.rfc,
      position: employee.position,
      department: employee.department,
      salary: Number(employee.baseSalary),
      hireDate: employee.hireDate.toISOString().split('T')[0],
      status: this.mapStatusToFrontend(employee.status),
      companyId: employee.companyId,
      companyName: employee.company.name,
      bankName: employee.bankName,
      accountNumber: employee.bankAccount ? `****${employee.bankAccount.slice(-4)}` : null,
      clabe: employee.clabe ? `****${employee.clabe.slice(-4)}` : null,
      incidencesCount: employee._count.incidences,
      payrollsCount: employee._count.payrollItems,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    }));
  }
  
  static async getEmployeeById(id: number) {
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
        payrollItems: {
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
      salary: Number(employee.baseSalary),
      hireDate: employee.hireDate.toISOString().split('T')[0],
      status: this.mapStatusToFrontend(employee.status),
      companyId: employee.companyId,
      companyName: employee.company.name,
      bankName: employee.bankName,
      accountNumber: employee.bankAccount,
      clabe: employee.clabe,
      incidences: employee.incidences,
      payrollItems: employee.payrollItems,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }
  
  static async createEmployee(data: CreateEmployeeRequest) {
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
    if (data.email) {
      const existingEmail = await prisma.employee.findFirst({
        where: { email: data.email }
      });
      
      if (existingEmail) {
        throw new Error('Email already exists');
      }
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
        employeeNumber: data.employeeNumber,
        name: data.name,
        email: data.email,
        rfc: data.rfc,
        position: data.position,
        department: data.department,
        baseSalary: data.baseSalary,
        hireDate: new Date(data.hireDate),
        contractType: 'INDEFINITE', // Default value
        status: 'ACTIVE',
        companyId: data.companyId,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        clabe: data.clabe
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
      salary: Number(employee.baseSalary),
      hireDate: employee.hireDate.toISOString().split('T')[0],
      status: this.mapStatusToFrontend(employee.status),
      companyId: employee.companyId,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }
  
  static async updateEmployee(data: UpdateEmployeeRequest) {
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
      const emailExists = await prisma.employee.findFirst({
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
        ...(updateData.hireDate && { hireDate: new Date(updateData.hireDate) }),
        ...(updateData.baseSalary && { baseSalary: updateData.baseSalary }),
        ...(updateData.bankAccount && { bankAccount: updateData.bankAccount })
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
      salary: Number(employee.baseSalary),
      hireDate: employee.hireDate.toISOString().split('T')[0],
      status: this.mapStatusToFrontend(employee.status),
      companyId: employee.companyId,
      bankName: employee.bankName,
      accountNumber: employee.bankAccount,
      clabe: employee.clabe,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }
  
  static async deleteEmployee(id: number) {
    const employee = await prisma.employee.findUnique({
      where: { id }
    });
    
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Verificar si tiene nóminas activas
    const activePayrolls = await prisma.payrollItem.count({
      where: {
        employeeId: id,
        payroll: {
          status: {
            in: ['CALCULATED', 'PENDING_AUTHORIZATION']
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
  
  static async getEmployeeStats(companyId?: number) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    
    const stats = await prisma.employee.groupBy({
      by: ['status', 'department'],
      where,
      _count: { id: true },
      _avg: { baseSalary: true }
    });
    
    const totalStats = await prisma.employee.aggregate({
      where,
      _count: { id: true },
      _avg: { baseSalary: true },
      _min: { baseSalary: true },
      _max: { baseSalary: true }
    });
    
    return {
      total: totalStats._count?.id || 0,
      averageSalary: Number(totalStats._avg?.baseSalary) || 0,
      minSalary: Number(totalStats._min?.baseSalary) || 0,
      maxSalary: Number(totalStats._max?.baseSalary) || 0,
      byStatus: stats.reduce((acc: any, stat: any) => {
        acc[stat.status] = (acc[stat.status] || 0) + (stat._count?.id || 0);
        return acc;
      }, {}),
      byDepartment: stats.reduce((acc: any, stat: any) => {
        if (!acc[stat.department]) {
          acc[stat.department] = { count: 0, avgSalary: 0 };
        }
        acc[stat.department].count += (stat._count?.id || 0);
        acc[stat.department].avgSalary = Number(stat._avg?.baseSalary) || 0;
        return acc;
      }, {})
    };
  }
  
  private static mapStatusToFrontend(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
      'TERMINATED': 'Terminado',
      'ON_LEAVE': 'Con Permiso'
    };
    
    return statusMap[status] || status;
  }
}