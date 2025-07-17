import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { User } from '../types';
import { InvitationService } from '../services/invitationService';
import * as crypto from 'crypto';

// Extender el tipo Request para incluir user
interface AuthRequest extends Request {
  user?: User;
}

const prisma = new PrismaClient();

export class AdminController {
  // Obtener todos los operadores gestionados por el administrador con sus empresas
  static async getOperatorsWithCompanies(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Obtener todos los operadores que gestiona este administrador
      const operators = await prisma.user.findMany({
        where: {
          role: 'OPERATOR',
          managedByAdminId: adminId
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          // Obtener las empresas asignadas a través de OperatorCompany
          operatorCompanies: {
            where: {
              isActive: true
            },
            select: {
              assignedAt: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  rfc: true,
                  legalName: true,
                  status: true,
                  employeesCount: true,
                  email: true,
                  phone: true,
                  // Contar clientes y trabajadores
                  _count: {
                    select: {
                      users: true,
                      workerDetails: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transformar los datos para una mejor presentación
      const operatorsWithCompaniesData = operators.map(operator => ({
        id: operator.id,
        email: operator.email,
        username: operator.username,
        fullName: `${operator.firstName || ''} ${operator.lastName || ''}`.trim(),
        isActive: operator.isActive,
        lastLogin: operator.lastLoginAt,
        companiesCount: operator.operatorCompanies.length,
        companies: operator.operatorCompanies.map(oc => ({
          ...oc.company,
          assignedAt: oc.assignedAt,
          clientsCount: oc.company._count.users,
          workersCount: oc.company._count.workerDetails
        }))
      }));

      res.json({
        success: true,
        data: operatorsWithCompaniesData
      });
    } catch (error) {
      console.error('Error getting operators with companies:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener operadores con sus empresas'
      });
    }
  }

  // Obtener detalles de una empresa específica con sus clientes y trabajadores
  static async getCompanyDetails(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Verificar que la empresa esté asignada a un operador del admin
      const companyOperator = await prisma.operatorCompany.findFirst({
        where: {
          companyId: parseInt(companyId),
          operator: {
            managedByAdminId: adminId
          }
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
      });

      if (!companyOperator) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para ver esta empresa'
        });
      }

      // Obtener detalles completos de la empresa
      const company = await prisma.company.findUnique({
        where: {
          id: parseInt(companyId)
        },
        include: {
          // Clientes (usuarios con role CLIENT)
          users: {
            where: {
              role: 'CLIENT'
            },
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true
            }
          },
          // Trabajadores
          workerDetails: {
            select: {
              id: true,
              numeroTrabajador: true,
              nombres: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              rfc: true,
              curp: true,
              nss: true,
              activo: true,
              // Información del contrato
              contractConditions: {
                select: {
                  tipoContrato: true,
                  fechaIngreso: true,
                  salarioDiario: true,
                  sueldoBaseCotizacion: true,
                  puesto: {
                    select: {
                      nombre: true
                    }
                  },
                  area: {
                    select: {
                      nombre: true
                    }
                  },
                  departamento: {
                    select: {
                      nombre: true
                    }
                  }
                }
              }
            },
            orderBy: {
              numeroTrabajador: 'asc'
            }
          },
          // Información adicional
          generalInfo: true,
          companyAddress: true,
          legalRepresentative: true
        }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Empresa no encontrada'
        });
      }

      // Formatear respuesta
      const response = {
        id: company.id,
        name: company.name,
        rfc: company.rfc,
        legalName: company.legalName,
        status: company.status,
        operator: {
          id: companyOperator.operator.id,
          email: companyOperator.operator.email,
          fullName: `${companyOperator.operator.firstName || ''} ${companyOperator.operator.lastName || ''}`.trim()
        },
        generalInfo: company.generalInfo,
        address: company.companyAddress,
        legalRepresentative: company.legalRepresentative,
        clients: company.users.map(user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          isActive: user.isActive,
          lastLogin: user.lastLoginAt,
          createdAt: user.createdAt
        })),
        workers: company.workerDetails.map(worker => ({
          id: worker.id,
          employeeNumber: worker.numeroTrabajador,
          fullName: `${worker.nombres} ${worker.apellidoPaterno} ${worker.apellidoMaterno || ''}`.trim(),
          rfc: worker.rfc,
          curp: worker.curp,
          nss: worker.nss,
          hireDate: worker.contractConditions?.fechaIngreso || '',
          isActive: worker.activo,
          position: worker.contractConditions?.puesto?.nombre || 'Sin puesto',
          area: worker.contractConditions?.area?.nombre || 'Sin área',
          department: worker.contractConditions?.departamento?.nombre || 'Sin departamento',
          dailySalary: worker.contractConditions?.salarioDiario || 0,
          contractType: worker.contractConditions?.tipoContrato || 'No especificado'
        })),
        stats: {
          totalClients: company.users.length,
          totalWorkers: company.workerDetails.length,
          activeWorkers: company.workerDetails.filter(w => w.activo).length
        }
      };

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error getting company details:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener detalles de la empresa'
      });
    }
  }

  // Obtener resumen general del administrador
  static async getAdminDashboard(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Obtener estadísticas generales
      const [
        totalOperators,
        activeOperators,
        allCompanies,
        totalWorkers,
        recentActivities
      ] = await Promise.all([
        // Total de operadores
        prisma.user.count({
          where: {
            role: 'OPERATOR',
            managedByAdminId: adminId
          }
        }),
        // Operadores activos
        prisma.user.count({
          where: {
            role: 'OPERATOR',
            managedByAdminId: adminId,
            isActive: true
          }
        }),
        // Obtener SOLO las empresas gestionadas por este admin
        prisma.company.findMany({
          where: {
            managedByAdminId: adminId
          },
          include: {
            operatorCompanies: {
              where: {
                isActive: true
              },
              include: {
                operator: {
                  select: {
                    id: true,
                    managedByAdminId: true
                  }
                }
              }
            }
          }
        }),
        // Total de trabajadores en todas las empresas del admin
        prisma.workerDetails.count({
          where: {
            company: {
              managedByAdminId: adminId
            }
          }
        }),
        // Actividades recientes (últimos 10 usuarios creados)
        prisma.user.findMany({
          where: {
            OR: [
              {
                role: 'OPERATOR',
                managedByAdminId: adminId
              },
              {
                role: 'CLIENT',
                company: {
                  managedByAdminId: adminId
                }
              }
            ]
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            company: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        })
      ]);

      // Contar empresas con y sin operador asignado
      const companiesWithOperator = allCompanies.filter(company => company.operatorCompanies.length > 0).length;
      const companiesWithoutOperator = allCompanies.filter(company => company.operatorCompanies.length === 0).length;

      // Obtener distribución de empresas por estado
      const companiesByStatus = await prisma.company.groupBy({
        by: ['status'],
        where: {
          managedByAdminId: adminId
        },
        _count: {
          status: true
        }
      });

      const dashboard = {
        stats: {
          totalOperators,
          activeOperators,
          inactiveOperators: totalOperators - activeOperators,
          totalCompanies: companiesWithOperator + companiesWithoutOperator,
          companiesWithOperator,
          companiesWithoutOperator,
          totalWorkers,
          companiesByStatus: companiesByStatus.map(item => ({
            status: item.status,
            count: item._count.status
          }))
        },
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          email: activity.email,
          username: activity.username,
          role: activity.role,
          companyName: activity.company?.name || 'N/A',
          createdAt: activity.createdAt,
          action: 'Usuario creado'
        }))
      };

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el dashboard del administrador'
      });
    }
  }

  // Asignar operador a empresa
  static async assignOperatorToCompany(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      const { operatorId, companyId } = req.body;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Verificar que el operador pertenece a este admin
      const operator = await prisma.user.findFirst({
        where: {
          id: operatorId,
          role: 'OPERATOR',
          managedByAdminId: adminId
        }
      });

      if (!operator) {
        return res.status(403).json({
          success: false,
          error: 'Operador no encontrado o no tiene permisos'
        });
      }

      // Verificar que la empresa existe
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Empresa no encontrada'
        });
      }

      // Verificar si ya existe la asignación
      const existingAssignment = await prisma.operatorCompany.findUnique({
        where: {
          operatorId_companyId: {
            operatorId,
            companyId
          }
        }
      });

      if (existingAssignment) {
        return res.status(409).json({
          success: false,
          error: 'El operador ya está asignado a esta empresa'
        });
      }

      // Crear la asignación
      const assignment = await prisma.operatorCompany.create({
        data: {
          operatorId,
          companyId,
          assignedBy: adminId,
          isActive: true
        },
        include: {
          operator: {
            select: {
              email: true,
              username: true
            }
          },
          company: {
            select: {
              name: true,
              rfc: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Operador asignado exitosamente',
        data: assignment
      });
    } catch (error) {
      console.error('Error assigning operator to company:', error);
      res.status(500).json({
        success: false,
        error: 'Error al asignar operador a empresa'
      });
    }
  }

  // Remover operador de empresa
  static async removeOperatorFromCompany(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      const { operatorId, companyId } = req.params;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Verificar permisos
      const assignment = await prisma.operatorCompany.findFirst({
        where: {
          operatorId: parseInt(operatorId),
          companyId: parseInt(companyId),
          operator: {
            managedByAdminId: adminId
          }
        }
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: 'Asignación no encontrada'
        });
      }

      // Eliminar la asignación completamente
      await prisma.operatorCompany.delete({
        where: {
          id: assignment.id
        }
      });

      res.json({
        success: true,
        message: 'Operador removido de la empresa exitosamente'
      });
    } catch (error) {
      console.error('Error removing operator from company:', error);
      res.status(500).json({
        success: false,
        error: 'Error al remover operador de empresa'
      });
    }
  }

  // Obtener empresas disponibles para asignar a un operador
  static async getAvailableCompaniesForOperator(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      const { operatorId } = req.params;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Verificar que el operador pertenece a este admin
      const operator = await prisma.user.findFirst({
        where: {
          id: parseInt(operatorId),
          role: 'OPERATOR',
          managedByAdminId: adminId
        }
      });

      if (!operator) {
        return res.status(403).json({
          success: false,
          error: 'Operador no encontrado o no tiene permisos'
        });
      }

      // Obtener todas las empresas
      const allCompanies = await prisma.company.findMany({
        where: { managedByAdminId: adminId },
        include: {
          operatorCompanies: {
            where: {
              isActive: true
            },
            include: {
              operator: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  managedByAdminId: true
                }
              }
            }
          }
        }
      });
      console.log('all companies for admin:', allCompanies);

      // Filtrar para mostrar solo empresas relevantes para este admin:
      // 1. Empresas sin operador asignado
      // 2. Empresas con operadores que pertenecen a este admin
      const relevantCompanies = allCompanies.filter(company => {
        // Si no tiene operadores, es disponible
        if (company.operatorCompanies.length === 0) {
          return true;
        }
        
        // Si tiene operadores, verificar que al menos uno pertenezca a este admin
        return company.operatorCompanies.some(oc => 
          oc.operator.managedByAdminId === adminId
        );
      });

      // Ahora filtrar para el operador específico:
      // 1. Empresas ya asignadas a este operador
      // 2. Empresas sin ningún operador asignado
      const availableCompanies = relevantCompanies.filter(company => {
        const hasThisOperator = company.operatorCompanies.some(oc => oc.operatorId === parseInt(operatorId));
        const hasNoOperator = company.operatorCompanies.length === 0;
        
        return hasThisOperator || hasNoOperator;
      });

      console.log('Available companies for operator:', availableCompanies);

      // Formatear respuesta
      const formattedCompanies = availableCompanies.map(company => ({
        id: company.id,
        name: company.name,
        rfc: company.rfc,
        legalName: company.legalName,
        status: company.status,
        email: company.email,
        isAssignedToOperator: company.operatorCompanies.some(oc => oc.operatorId === parseInt(operatorId)),
        currentOperator: company.operatorCompanies.length > 0 ? {
          id: company.operatorCompanies[0].operator.id,
          email: company.operatorCompanies[0].operator.email,
          name: `${company.operatorCompanies[0].operator.firstName || ''} ${company.operatorCompanies[0].operator.lastName || ''}`.trim()
        } : null
      }));

      res.json({
        success: true,
        data: formattedCompanies
      });
    } catch (error) {
      console.error('Error getting available companies for operator:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener empresas disponibles'
      });
    }
  }

  // Crear nuevo operador
  static async createOperator(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      const { email, firstName, lastName, phone } = req.body;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Validar campos requeridos
      if (!email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'Email, nombre y apellido son requeridos'
        });
      }

      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Ya existe un usuario con ese email'
        });
      }

      // Generar token de configuración
      const setupToken = crypto.randomBytes(32).toString('hex');
      const setupTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

      // Crear el operador en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Crear el usuario operador
        const operator = await tx.user.create({
          data: {
            email,
            username: email.split('@')[0], // Username temporal basado en email
            password: '', // Sin contraseña inicial
            firstName,
            lastName,
            phone,
            role: 'OPERATOR',
            isActive: true,
            managedByAdminId: adminId,
            setupToken,
            setupTokenExpiry
          }
        });

        return { operator };
      });

      // Enviar email de invitación
      try {
        await InvitationService.sendOperatorInvitation(
          email,
          firstName,
          lastName,
          setupToken
        );
      } catch (emailError) {
        console.error('Error sending operator invitation email:', emailError);
        // No fallar la operación si el email no se envía
      }

      res.status(201).json({
        success: true,
        message: 'Operador creado exitosamente. Se ha enviado una invitación por email.',
        data: {
          id: result.operator.id,
          email: result.operator.email,
          firstName: result.operator.firstName,
          lastName: result.operator.lastName,
          role: result.operator.role,
          setupPending: true
        }
      });
    } catch (error) {
      console.error('Error creating operator:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear el operador'
      });
    }
  }
}