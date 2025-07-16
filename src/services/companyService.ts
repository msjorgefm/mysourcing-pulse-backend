import { PrismaClient } from '@prisma/client';
import { InvitationService } from './invitationService';

const prisma = new PrismaClient();

export interface CreateCompanyRequest {
  name: string;
  rfc: string;
  legalName: string;
  address: string;
  email: string;
  phone?: string;
  status?: string;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
  id: number;
}

export class CompanyService {
  
  static async getAllCompanies(operatorOnly: boolean = false) {
    const companies = await prisma.company.findMany({
      include: {
        workerDetails: {
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
        documentChecklist: true,
        operatorCompanies: {
          where: { isActive: true },
          include: {
            operator: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            workerDetails: true,
            payrolls: true,
            incidences: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transformar datos para el frontend
    return companies.map((company: any) => ({
      id: company.id,
      name: company.name,
      rfc: company.rfc,
      legalName: company.legalName,
      address: company.address,
      email: company.email,
      phone: company.phone,
      status: this.mapStatusToFrontend(company.status),
      employeesCount: company._count?.workerDetails || 0,
      payrollsCount: company._count.payrolls,
      incidencesCount: company._count.incidences,
      calendarsCount: company.calendars.length,
      recentPayrolls: company.payrolls,
      activeCalendars: company.calendars,
      documentChecklist: company.documentChecklist,
      operators: company.operatorCompanies.map((oc: any) => ({
        id: oc.operator.id,
        email: oc.operator.email,
        username: oc.operator.username,
        fullName: `${oc.operator.firstName || ''} ${oc.operator.lastName || ''}`.trim(),
        assignedAt: oc.assignedAt
      })),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }));
  }
  
  static async getCompanyById(id: number, includeDetails: boolean = false) {
    const include: any = {
      _count: {
        select: {
          workerDetails: true,
          payrolls: true,
          incidences: true
        }
      }
    };
    
    if (includeDetails) {
      include.workerDetails = {
        orderBy: { numeroTrabajador: 'asc' }
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
      employeesCount: (company as any)._count?.workerDetails || 0,
      ...(includeDetails && {
        employees: (company as any).workerDetails || [],
        payrolls: (company as any).payrolls || [],
        calendars: (company as any).calendars || []
      }),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }
  
  static async createCompany(data: CreateCompanyRequest) {
    // Si el RFC es temporal o está pendiente, generar uno único
    let finalRfc = data.rfc;
    if (!data.rfc || data.rfc === 'PENDIENTE123' || data.rfc.startsWith('PENDIENTE')) {
      // Generar RFC temporal único basado en timestamp
      const timestamp = Date.now();
      finalRfc = `PENDIENTE${timestamp}`;
    } else {
      // Si se proporciona un RFC real, verificar que no exista
      const existingCompany = await prisma.company.findUnique({
        where: { rfc: data.rfc }
      });
      
      if (existingCompany) {
        throw new Error('RFC already exists');
      }
    }
    
    // Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw new Error('Ya existe un usuario registrado con ese correo electrónico');
    }
    
    // Usar una transacción para crear tanto la empresa como el usuario
    const result = await prisma.$transaction(async (tx) => {
      // Crear la empresa
      const company = await tx.company.create({
        data: {
          name: data.name || data.legalName, // Use legalName if name not provided
          rfc: finalRfc, // Use the generated unique RFC
          legalName: data.legalName,
          address: data.address || 'Por definir', // Default address if not provided
          email: data.email,
          phone: data.phone,
          status: 'IN_SETUP', // Siempre crear con estado "en configuración"
          employeesCount: 0,
          // Crear el checklist vacío por defecto
          documentChecklist: {
            create: {}
          }
        },
        include: {
          documentChecklist: true
        }
      });
      
      // Crear el usuario para la empresa
      const user = await tx.user.create({
        data: {
          email: data.email,
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'CLIENT',
          isActive: true,
          companyId: company.id
        }
      });
      
      return { company, user };
    });
    
    // Enviar invitación por correo electrónico
    try {
      await InvitationService.createAndSendInvitation(
        result.company.id,
        result.company.email,
        result.company.name
      );
    } catch (error) {
      console.error('Error sending invitation:', error);
      // No fallar la creación de la empresa si falla el envío del correo
    }
    
    return {
      id: result.company.id,
      name: result.company.name,
      rfc: result.company.rfc,
      legalName: result.company.legalName,
      address: result.company.address,
      email: result.company.email,
      phone: result.company.phone,
      status: this.mapStatusToFrontend(result.company.status),
      employeesCount: 0,
      documentChecklist: result.company.documentChecklist,
      createdAt: result.company.createdAt,
      updatedAt: result.company.updatedAt
    };
  }
  
  static async updateCompany(data: UpdateCompanyRequest) {
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
          status: this.mapStatusFromFrontend(updateData.status) as any
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
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }
  
  static async deleteCompany(id: number) {
    // Verificar si la empresa tiene trabajadores activos
    const workerCount = await prisma.workerDetails.count({
      where: { 
        companyId: id
      }
    });
    
    if (workerCount > 0) {
      throw new Error('Cannot delete company with active workers');
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
  
  static async getCompanyStats(id: number) {
    const stats = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            workerDetails: true,
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
    const totalPayrollAmount = stats.payrolls.reduce(
      (sum: number, p: any) => sum + Number(p.totalNet),
      0
    );
    const avgPayrollAmount = stats.payrolls.length > 0 ? totalPayrollAmount / stats.payrolls.length : 0;
    
    const payrollsByStatus = stats.payrolls.reduce((acc: any, p: any) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    
    const incidencesByType = stats.incidences.reduce((acc: any, inc: any) => {
      acc[inc.type] = (acc[inc.type] || 0) + 1;
      return acc;
    }, {});
    
    const totalIncidenceAmount = stats.incidences.reduce(
      (sum: number, inc: any) => sum + (Number(inc.amount) || 0),
      0
    );
    
    return {
      companyId: id,
      employees: {
        total: stats._count.workerDetails,
        active: stats._count.workerDetails
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
  private static mapStatusToFrontend(status: string): string {
    const statusMap: { [key: string]: string } = {
      'IN_SETUP': 'En Configuración',
      'CONFIGURED': 'Configurada',
      'ACTIVE': 'Activa',
      'INACTIVE': 'Inactiva',
      'SUSPENDED': 'Suspendida'
    };
    
    return statusMap[status] || status;
  }
  
  private static mapStatusFromFrontend(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En Configuración': 'IN_SETUP',
      'Configurada': 'CONFIGURED',
      'Activa': 'ACTIVE',
      'Inactiva': 'INACTIVE',
      'Suspendida': 'SUSPENDED'
    };
    
    return statusMap[status] || 'IN_SETUP';
  }
  
  static async getCompanyDepartments(companyId: number) {
    const departments = await prisma.departamento.findMany({
      where: { 
        empresaId: companyId,
        activo: true
      },
      include: {
        area: true,
        puestos: {
          where: { activo: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
    
    return departments;
  }
  
  static async inviteDepartmentHead(companyId: number, email: string, departmentId: number) {
    // Verificar que el departamento pertenezca a la empresa
    const department = await prisma.departamento.findFirst({
      where: {
        id: departmentId,
        empresaId: companyId,
        activo: true
      }
    });
    
    if (!department) {
      throw new Error('Departamento no encontrado o no pertenece a esta empresa');
    }
    
    // Verificar que no exista ya un usuario con ese email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('Ya existe un usuario con ese correo electrónico');
    }
    
    // Crear invitación
    const invitation = await InvitationService.createDepartmentHeadInvitation(
      companyId,
      email,
      departmentId
    );
    
    return {
      success: true,
      message: 'Invitación enviada exitosamente',
      invitation
    };
  }
  
  static async resendInvitation(companyId: number) {
    return await InvitationService.resendInvitation(companyId);
  }
  
  static async sendAdditionalInvitation(companyId: number, email: string) {
    return await InvitationService.sendAdditionalInvitation(companyId, email);
  }
  
  static async assignOperatorToCompany(companyId: number, operatorId: number, assignedBy: number) {
    // Verificar que la empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      throw new Error('Company not found');
    }
    
    // Verificar que el operador existe y tiene el rol correcto
    const operator = await prisma.user.findUnique({
      where: { id: operatorId }
    });
    
    if (!operator) {
      throw new Error('Operator not found');
    }
    
    if (operator.role !== 'OPERATOR') {
      throw new Error('User is not an operator');
    }
    
    // Verificar si ya existe la asignación
    const existingAssignment = await prisma.operatorCompany.findUnique({
      where: {
        operatorId_companyId: {
          operatorId: operatorId,
          companyId: companyId
        }
      }
    });
    
    if (existingAssignment) {
      // Si ya existe pero está inactiva, reactivarla
      if (!existingAssignment.isActive) {
        await prisma.operatorCompany.update({
          where: { id: existingAssignment.id },
          data: { 
            isActive: true,
            assignedAt: new Date(),
            assignedBy: assignedBy
          }
        });
      }
      return existingAssignment;
    }
    
    // Crear nueva asignación
    const assignment = await prisma.operatorCompany.create({
      data: {
        operatorId: operatorId,
        companyId: companyId,
        assignedBy: assignedBy,
        isActive: true
      }
    });
    
    return assignment;
  }
  
  static async getCompaniesByOperator(operatorId: number) {
    const companies = await prisma.company.findMany({
      where: {
        operatorCompanies: {
          some: {
            operatorId: operatorId,
            isActive: true
          }
        }
      },
      include: {
        workerDetails: {
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
        documentChecklist: true,
        operatorCompanies: {
          where: { isActive: true },
          include: {
            operator: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            workerDetails: true,
            payrolls: true,
            incidences: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transformar datos para el frontend
    return companies.map((company: any) => ({
      id: company.id,
      name: company.name,
      rfc: company.rfc,
      legalName: company.legalName,
      address: company.address,
      email: company.email,
      phone: company.phone,
      status: this.mapStatusToFrontend(company.status),
      employeesCount: company._count?.workerDetails || 0,
      payrollsCount: company._count.payrolls,
      incidencesCount: company._count.incidences,
      calendarsCount: company.calendars.length,
      recentPayrolls: company.payrolls,
      activeCalendars: company.calendars,
      documentChecklist: company.documentChecklist,
      operators: company.operatorCompanies.map((oc: any) => ({
        id: oc.operator.id,
        email: oc.operator.email,
        username: oc.operator.username,
        fullName: `${oc.operator.firstName || ''} ${oc.operator.lastName || ''}`.trim(),
        assignedAt: oc.assignedAt
      })),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }));
  }
  
  static async getCompaniesManagedByAdmin(adminId: number) {
    // Para administradores: obtener TODAS las empresas
    const companies = await prisma.company.findMany({
      include: {
        workerDetails: {
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
        documentChecklist: true,
        operatorCompanies: {
          where: { 
            isActive: true
          },
          include: {
            operator: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            workerDetails: true,
            payrolls: true,
            incidences: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transformar datos para el frontend
    return companies.map((company: any) => ({
      id: company.id,
      name: company.name,
      rfc: company.rfc,
      legalName: company.legalName,
      address: company.address,
      email: company.email,
      phone: company.phone,
      status: this.mapStatusToFrontend(company.status),
      employeesCount: company._count?.workerDetails || 0,
      payrollsCount: company._count.payrolls,
      incidencesCount: company._count.incidences,
      calendarsCount: company.calendars.length,
      recentPayrolls: company.payrolls,
      activeCalendars: company.calendars,
      documentChecklist: company.documentChecklist,
      operators: company.operatorCompanies.map((oc: any) => ({
        id: oc.operator.id,
        email: oc.operator.email,
        username: oc.operator.username,
        fullName: `${oc.operator.firstName || ''} ${oc.operator.lastName || ''}`.trim(),
        assignedAt: oc.assignedAt
      })),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }));
  }
}