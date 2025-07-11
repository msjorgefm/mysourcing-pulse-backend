import { PrismaClient } from '@prisma/client';
import { emailService } from './emailService';
import crypto from 'crypto';
import { config } from '../config';

const prisma = new PrismaClient();

interface CreateVinculacionData {
  empresaId: number;
  empleadoId: number;
  areaIds?: number[];
  departamentoIds?: number[];
  puestoIds?: number[];
  empleadoIds?: number[];
}

interface UpdateVinculacionData {
  areaIds?: number[];
  departamentoIds?: number[];
  puestoIds?: number[];
  empleadoIds?: number[];
  activo?: boolean;
}

export const getOrganizationalData = async (companyId: number) => {
  const [areas, departamentos, puestos, empleados] = await Promise.all([
    prisma.organizationalArea.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        description: true
      }
    }),
    prisma.organizationalDepartment.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        description: true,
        areaId: true
      }
    }),
    prisma.organizationalPosition.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        description: true,
        departmentId: true
      }
    }),
    prisma.employee.findMany({
      where: {
        companyId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        employeeNumber: true,
        name: true,
        position: true,
        department: true,
        email: true
      }
    })
  ]);

  // Filtrar empleados que ya son jefes
  const empleadosQueYaSonJefes = await prisma.vinculacionJefe.findMany({
    where: { empresaId: companyId },
    select: { empleadoId: true }
  });

  const empleadosJefeIds = empleadosQueYaSonJefes.map(v => v.empleadoId);
  
  return {
    areas,
    departamentos,
    puestos,
    empleados,
    empleadosDisponiblesParaJefe: empleados.filter(e => !empleadosJefeIds.includes(e.id)),
    empleadosDisponiblesParaAsignar: empleados
  };
};

export const getVinculacionesByCompany = async (companyId: number) => {
  return await prisma.vinculacionJefe.findMany({
    where: { empresaId: companyId },
    include: {
      empleado: {
        select: {
          id: true,
          employeeNumber: true,
          name: true,
          position: true,
          department: true,
          email: true
        }
      },
      usuario: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      areas: {
        include: {
          area: true
        }
      },
      departamentos: {
        include: {
          departamento: true
        }
      },
      puestos: {
        include: {
          puesto: true
        }
      },
      empleadosACargo: {
        include: {
          empleado: {
            select: {
              id: true,
              employeeNumber: true,
              name: true,
              position: true,
              department: true
            }
          }
        }
      }
    }
  });
};

export const getVinculacionById = async (id: number) => {
  return await prisma.vinculacionJefe.findUnique({
    where: { id },
    include: {
      empleado: true,
      usuario: true,
      areas: {
        include: {
          area: true
        }
      },
      departamentos: {
        include: {
          departamento: true
        }
      },
      puestos: {
        include: {
          puesto: true
        }
      },
      empleadosACargo: {
        include: {
          empleado: true
        }
      }
    }
  });
};

export const createVinculacion = async (data: CreateVinculacionData) => {
  const { empresaId, empleadoId, areaIds = [], departamentoIds = [], puestoIds = [], empleadoIds = [] } = data;

  // Validar que tenga al menos un área, departamento o puesto
  if (areaIds.length === 0 && departamentoIds.length === 0 && puestoIds.length === 0) {
    throw new Error('Debe asignar al menos un área, departamento o puesto al jefe');
  }

  // Asegurar que empleadoId sea un número
  const empleadoIdNum = typeof empleadoId === 'string' ? parseInt(empleadoId) : empleadoId;

  // Verificar que el empleado exista y obtenga su información
  const empleado = await prisma.employee.findUnique({
    where: { id: empleadoIdNum },
    include: { user: true }
  });

  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }

  // Verificar si el empleado ya tiene un usuario existente
  let usuario = empleado.user;
  let isNewUser = false;
  let shouldSendEmail = false;
  
  if (!usuario) {
    // No tiene usuario, crear uno nuevo
    isNewUser = true;
    shouldSendEmail = true;
  } else if (!usuario.isActive || !usuario.password) {
    // Tiene usuario pero nunca completó el setup, actualizar el token
    shouldSendEmail = true;
  }

  // Generar nuevo token si se necesita enviar email
  if (shouldSendEmail) {
    const setupToken = crypto.randomBytes(32).toString('hex');
    const setupTokenExpiry = new Date();
    setupTokenExpiry.setHours(setupTokenExpiry.getHours() + 48); // Token válido por 48 horas

    if (isNewUser) {
      // Crear nuevo usuario
      usuario = await prisma.user.create({
        data: {
          email: empleado.email || `jefe_${empleado.employeeNumber}@empresa.com`,
          password: '', // Sin contraseña hasta que configure su cuenta
          name: empleado.name,
          role: 'DEPARTMENT_HEAD',
          companyId: empresaId,
          employeeId: empleado.id,
          isActive: false,
          setupToken,
          setupTokenExpiry
        }
      });
      console.log(`🔑 Nuevo usuario creado con setupToken: ${setupToken}`);
    } else {
      // Actualizar token en usuario existente
      usuario = await prisma.user.update({
        where: { id: usuario!.id },
        data: {
          setupToken,
          setupTokenExpiry,
          isActive: false // Resetear a inactivo si no había completado el setup
        }
      });
      console.log(`🔑 Token actualizado para usuario existente: ${setupToken}`);
    }
  }

  if (!usuario) {
    throw new Error('No se pudo crear o encontrar el usuario para el jefe');
  }

  const usuarioId = usuario.id;

  // Crear la vinculación con todas las relaciones
  const vinculacion = await prisma.vinculacionJefe.create({
    data: {
      empresaId,
      usuarioId,
      empleadoId: empleadoIdNum,
      areas: {
        create: areaIds.map(areaId => ({ areaId }))
      },
      departamentos: {
        create: departamentoIds.map(departamentoId => ({ departamentoId }))
      },
      puestos: {
        create: puestoIds.map(puestoId => ({ puestoId }))
      },
      empleadosACargo: {
        create: empleadoIds.map(empleadoId => ({ empleadoId }))
      }
    },
    include: {
      empleado: true,
      usuario: true,
      empresa: true,
      areas: {
        include: {
          area: true
        }
      },
      departamentos: {
        include: {
          departamento: true
        }
      },
      puestos: {
        include: {
          puesto: true
        }
      },
      empleadosACargo: {
        include: {
          empleado: true
        }
      }
    }
  });

  // Si se debe enviar email de configuración
  if (shouldSendEmail && empleado.email) {
    try {
      // Obtener información para el email
      const areasNombres = vinculacion.areas.map(a => a.area.name);
      const departamentosNombres = vinculacion.departamentos.map(d => d.departamento.name);
      const empleadosACargoCount = vinculacion.empleadosACargo.length;
      
      // Generar enlace de configuración
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const setupLink = `${frontendUrl}/setup-account?token=${vinculacion.usuario.setupToken}`;
      
      // Enviar email
      await emailService.sendVinculacionJefeEmail(
        empleado.email,
        empleado.name,
        vinculacion.empresa.name,
        setupLink,
        areasNombres,
        departamentosNombres,
        empleadosACargoCount
      );
      
      console.log(`✅ Email enviado a ${empleado.email} para configurar su vinculación de jefe`);
    } catch (emailError) {
      console.error('❌ Error al enviar email de configuración:', emailError);
      // No fallar la operación si el email no se puede enviar
    }
  } else if (shouldSendEmail && !empleado.email) {
    console.warn(`⚠️ No se puede enviar email de configuración: el empleado ${empleado.name} no tiene email registrado`);
  }

  return vinculacion;
};

export const updateVinculacion = async (id: number, data: UpdateVinculacionData) => {
  const { areaIds, departamentoIds, puestoIds, empleadoIds, activo } = data;

  // Actualizar la vinculación principal
  const updateData: any = {};
  if (activo !== undefined) {
    updateData.activo = activo;
  }

  // Iniciar transacción para actualizar todo de forma atómica
  return await prisma.$transaction(async (tx) => {
    // Actualizar vinculación principal
    await tx.vinculacionJefe.update({
      where: { id },
      data: updateData
    });

    // Actualizar áreas si se proporcionan
    if (areaIds !== undefined) {
      await tx.vinculacionJefeArea.deleteMany({
        where: { vinculacionJefeId: id }
      });
      if (areaIds.length > 0) {
        await tx.vinculacionJefeArea.createMany({
          data: areaIds.map(areaId => ({ vinculacionJefeId: id, areaId }))
        });
      }
    }

    // Actualizar departamentos si se proporcionan
    if (departamentoIds !== undefined) {
      await tx.vinculacionJefeDepartamento.deleteMany({
        where: { vinculacionJefeId: id }
      });
      if (departamentoIds.length > 0) {
        await tx.vinculacionJefeDepartamento.createMany({
          data: departamentoIds.map(departamentoId => ({ vinculacionJefeId: id, departamentoId }))
        });
      }
    }

    // Actualizar puestos si se proporcionan
    if (puestoIds !== undefined) {
      await tx.vinculacionJefePuesto.deleteMany({
        where: { vinculacionJefeId: id }
      });
      if (puestoIds.length > 0) {
        await tx.vinculacionJefePuesto.createMany({
          data: puestoIds.map(puestoId => ({ vinculacionJefeId: id, puestoId }))
        });
      }
    }

    // Actualizar empleados a cargo si se proporcionan
    if (empleadoIds !== undefined) {
      await tx.vinculacionJefeEmpleado.deleteMany({
        where: { vinculacionJefeId: id }
      });
      if (empleadoIds.length > 0) {
        await tx.vinculacionJefeEmpleado.createMany({
          data: empleadoIds.map(empleadoId => ({ vinculacionJefeId: id, empleadoId }))
        });
      }
    }

    // Retornar la vinculación actualizada con todas las relaciones
    return await tx.vinculacionJefe.findUnique({
      where: { id },
      include: {
        empleado: true,
        usuario: true,
        areas: {
          include: {
            area: true
          }
        },
        departamentos: {
          include: {
            departamento: true
          }
        },
        puestos: {
          include: {
            puesto: true
          }
        },
        empleadosACargo: {
          include: {
            empleado: true
          }
        }
      }
    });
  });
};

export const deleteVinculacion = async (id: number) => {
  // Primero obtener la vinculación para conocer el usuario asociado
  const vinculacion = await prisma.vinculacionJefe.findUnique({
    where: { id },
    include: {
      usuario: true,
      empleado: true
    }
  });

  if (!vinculacion) {
    throw new Error('Vinculación no encontrada');
  }

  // Usar transacción para asegurar que todo se elimine correctamente
  return await prisma.$transaction(async (tx) => {
    // 1. Eliminar la vinculación (las relaciones se eliminarán por CASCADE)
    await tx.vinculacionJefe.delete({
      where: { id }
    });

    // 2. Verificar si el usuario tiene otras vinculaciones
    const otrasVinculaciones = await tx.vinculacionJefe.count({
      where: {
        usuarioId: vinculacion.usuarioId,
        id: { not: id }
      }
    });

    // 3. Si el usuario no tiene otras vinculaciones, eliminarlo o desactivarlo
    if (otrasVinculaciones === 0 && vinculacion.usuario) {
      // Opción 1: Eliminar el usuario completamente
      await tx.user.delete({
        where: { id: vinculacion.usuarioId }
      });
      
      console.log(`✅ Usuario ${vinculacion.usuario.email} eliminado al no tener más vinculaciones`);
    }

    console.log(`✅ Vinculación de jefe para ${vinculacion.empleado.name} eliminada exitosamente`);
    
    return true;
  });
};

export const getEmpleadosACargo = async (vinculacionJefeId: number) => {
  const empleadosACargo = await prisma.vinculacionJefeEmpleado.findMany({
    where: { 
      vinculacionJefeId,
      activo: true 
    },
    include: {
      empleado: {
        select: {
          id: true,
          employeeNumber: true,
          name: true,
          position: true,
          department: true,
          email: true,
          phone: true,
          status: true
        }
      }
    }
  });

  return empleadosACargo.map(item => item.empleado);
};