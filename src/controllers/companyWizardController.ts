import { Request, Response } from 'express';
import { CompanyWizardService } from '../services/companyWizardService';
import { PrismaClient } from '@prisma/client';

export class CompanyWizardController {
  
  // Inicializar wizard para una empresa
  static async initializeWizard(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }

      const wizard = await CompanyWizardService.initializeWizard(Number(companyId));
      
      res.json({
        message: 'Wizard initialized successfully',
        data: wizard
      });
    } catch (error: any) {
      console.error('Initialize wizard error:', error);
      res.status(500).json({ error: error.message || 'Failed to initialize wizard' });
    }
  }

  // Obtener estado del wizard
  static async getWizardStatus(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }

      const wizard = await CompanyWizardService.getWizardStatus(Number(companyId));
      
      res.json({
        message: 'Wizard status retrieved successfully',
        data: wizard
      });
    } catch (error: any) {
      console.error('Get wizard status error:', error);
      if (error.message === 'Wizard not found') {
        return res.status(404).json({ error: 'Wizard not found' });
      }
      res.status(500).json({ error: error.message || 'Failed to get wizard status' });
    }
  }

  // Actualizar paso del wizard
  static async updateWizardStep(req: Request, res: Response) {
    try {
      const { companyId, sectionNumber, stepNumber } = req.params;
      const stepData = req.body;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }
      
      if (!sectionNumber || isNaN(Number(sectionNumber))) {
        return res.status(400).json({ error: 'Valid section number is required' });
      }
      
      if (!stepNumber || isNaN(Number(stepNumber))) {
        return res.status(400).json({ error: 'Valid step number is required' });
      }

      const updatedStep = await CompanyWizardService.updateWizardStep(
        Number(companyId),
        Number(sectionNumber),
        Number(stepNumber),
        stepData
      );
      
      // Obtener el estado actualizado del wizard completo
      const updatedWizard = await CompanyWizardService.getWizardStatus(Number(companyId));
      
      res.json({
        message: 'Wizard step updated successfully',
        data: updatedStep,
        wizardStatus: updatedWizard
      });
    } catch (error: any) {
      console.error('Update wizard step error:', error);
      res.status(500).json({ error: error.message || 'Failed to update wizard step' });
    }
  }

  // Completar wizard
  static async completeWizard(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }

      const result = await CompanyWizardService.completeWizard(Number(companyId));
      
      res.json({
        message: 'Wizard completed successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Complete wizard error:', error);
      res.status(500).json({ error: error.message || 'Failed to complete wizard' });
    }
  }

  // Obtener datos específicos de una sección
  static async getSectionData(req: Request, res: Response) {
    try {
      const { companyId, sectionNumber } = req.params;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }
      
      if (!sectionNumber || isNaN(Number(sectionNumber))) {
        return res.status(400).json({ error: 'Valid section number is required' });
      }

      // Implementar lógica para obtener datos específicos de cada sección
      const sectionData = await CompanyWizardController.getSectionSpecificData(
        Number(companyId),
        Number(sectionNumber)
      );
      
      res.json({
        message: 'Section data retrieved successfully',
        data: sectionData
      });
    } catch (error: any) {
      console.error('Get section data error:', error);
      res.status(500).json({ error: error.message || 'Failed to get section data' });
    }
  }

  // Método auxiliar para obtener datos específicos de un paso
  static async getStepSpecificData(companyId: number, sectionNumber: number, stepNumber: number): Promise<any> {
    const prisma = new PrismaClient();

    try {
      switch (sectionNumber) {
        case 1: // Datos Generales
          if (stepNumber === 1) {
            return await prisma.companyGeneralInfo.findUnique({ where: { companyId } });
          } else if (stepNumber === 2) {
            return await prisma.companyAddress.findUnique({ where: { companyId } });
          } else if (stepNumber === 3) {
            return await prisma.companyLegalRepresentative.findUnique({ where: { companyId } });
          }
          break;
      }
      return null;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Método auxiliar para obtener datos específicos de cada sección
  static async getSectionSpecificData(companyId: number, sectionNumber: number): Promise<any> {
    const prisma = new PrismaClient();

    try {
      switch (sectionNumber) {
        case 1: // Datos Generales
          const generalInfo = await prisma.companyGeneralInfo.findUnique({ where: { companyId } });
          const address = await prisma.companyAddress.findUnique({ where: { companyId } });
          const legalRep = await prisma.companyLegalRepresentative.findUnique({ where: { companyId } });
          
          // Mapear los datos del representante legal a los nombres esperados por el frontend
          let mappedLegalRep = null;
          if (legalRep) {
            mappedLegalRep = {
              name: legalRep.name,
              legalRepName: legalRep.name, // Para compatibilidad con frontend
              primerApellido: legalRep.primerApellido,
              segundoApellido: legalRep.segundoApellido,
              tipoIdentificacion: legalRep.tipoIdentificacionId,
              uriIdentificacion: legalRep.uriIdentificacion
            };
          }
          
          // Obtener el poder notarial si existe
          const notarialPower = await prisma.companyNotarialPower.findUnique({ where: { companyId } });
          let mappedNotarialPower = null;
          if (notarialPower) {
            mappedNotarialPower = {
              folioPoderNotarial: notarialPower.folioPoderNotarial,
              fechaEmision: notarialPower.fechaEmision,
              fechaVigencia: notarialPower.fechaVigencia,
              nombreFederatario: notarialPower.nombreFederatario,
              numeroFederatario: notarialPower.numeroFederatario,
              estado: notarialPower.estadoId,
              municipio: notarialPower.municipioId,
              uriPoderNotarial: notarialPower.uriPoderNotarial
            };
          }
          
          return {
            generalInfo,
            address,
            legalRepresentative: mappedLegalRep,
            notarialPower: mappedNotarialPower
          };
        case 2: // Obligaciones Patronales
          const fonacot = await prisma.fonacot.findUnique({
            where: { companyId }
          });
          
          const imssRegistro = await prisma.iMSSRegistroPatronal.findUnique({
            where: { companyId }
          });

          const imssRegistroPatronalId = imssRegistro?.id;
          const imssDomicilio = imssRegistroPatronalId 
            ? await prisma.iMSSDomicilio.findUnique({ where: { imssRegistroPatronalId } })
            : null;
          
          return {
            fonacot,
            imssRegistro,
            imssDomicilio
          };
        case 3: // Bancos
          const bankData = await prisma.companyBank.findFirst({
            where: { companyId },
            include: { bank: true }
          });
          
          // Si existe, retornar los datos con la información del banco
          if (bankData) {
            return {
              bankId: bankData.bankId,
              bancoId: bankData.bankId, // Para compatibilidad temporal
              nombreBanco: bankData.bank?.nombre || '',
              nomCuentaBancaria: bankData.nomCuentaBancaria,
              numCuentaBancaria: bankData.numCuentaBancaria,
              numClabeInterbancaria: bankData.numClabeInterbancaria,
              numSucursal: bankData.numSucursal,
              clvDispersion: bankData.clvDispersion,
              desCuentaBancaria: bankData.desCuentaBancaria,
              opcCuentaBancariaPrincipal: bankData.opcCuentaBancariaPrincipal
            };
          }
          
          return null;
        case 4: // Sellos Digitales
          return await prisma.companyDigitalCertificate.findUnique({
            where: { companyId }
          });
        case 5: // Estructura Organizacional
          // Obtener datos del wizard para extraer stepData
          const wizardForStructure = await prisma.companyWizard.findUnique({
            where: { companyId },
            include: {
              sectionProgress: {
                where: { sectionNumber: 5 },
                include: {
                  steps: true
                }
              }
            }
          });

          if (!wizardForStructure || !wizardForStructure.sectionProgress[0]) {
            return {
              areas: [],
              departments: [],
              positions: []
            };
          }

          const section = wizardForStructure.sectionProgress[0];

          // Retornar directamente los datos de la base de datos
          return {
            areas: await prisma.area.findMany({ 
              where: { 
                empresaId: companyId,
                activo: true
              },
              orderBy: { nombre: 'asc' }
            }),
            departamentos: await prisma.departamento.findMany({ 
              where: { 
                empresaId: companyId,
                activo: true
              },
              include: {
                area: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              },
              orderBy: { nombre: 'asc' }
            }),
            puestos: await prisma.puesto.findMany({ 
              where: { 
                empresaId: companyId,
                activo: true
              },
              include: {
                departamento: {
                  include: {
                    area: true
                  }
                }
              },
              orderBy: { nombre: 'asc' }
            })
          };
        case 6: // Nómina
          // Obtener los calendarios de nómina desde la tabla payrollCalendar
          const payrollCalendars = await prisma.payrollCalendar.findMany({
            where: { companyId }
          });
          
          return payrollCalendars;
        case 7: // Talento Humano
          return {
            schedules: await prisma.companySchedule.findMany({ where: { companyId } }),
            workers: await prisma.workerDetails.findMany({ where: { companyId } })
          };
        default:
          return null;
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  // Saltar sección opcional
  static async skipSection(req: Request, res: Response) {
    try {
      const { companyId, sectionNumber } = req.params;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }
      
      if (!sectionNumber || isNaN(Number(sectionNumber))) {
        return res.status(400).json({ error: 'Valid section number is required' });
      }

      const prisma = new PrismaClient();

      try {
        // Encontrar la sección
        const section = await prisma.companyWizardSection.findFirst({
          where: {
            wizard: { companyId: Number(companyId) },
            sectionNumber: Number(sectionNumber)
          }
        });

        if (!section) {
          return res.status(404).json({ error: 'Section not found' });
        }

        if (!section.isOptional) {
          return res.status(400).json({ error: 'Cannot skip mandatory section' });
        }

        // Marcar sección como saltada
        await prisma.companyWizardSection.update({
          where: { id: section.id },
          data: {
            status: 'SKIPPED',
            completedAt: new Date()
          }
        });

        res.json({
          message: 'Section skipped successfully',
          data: { sectionNumber: Number(sectionNumber), status: 'SKIPPED' }
        });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error: any) {
      console.error('Skip section error:', error);
      res.status(500).json({ error: error.message || 'Failed to skip section' });
    }
  }

  // Obtener todas las áreas de una empresa
  static async getCompanyAreas(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }

      const prisma = new PrismaClient();

      try {
        const areas = await prisma.area.findMany({
          where: { 
            empresaId: Number(companyId),
            activo: true
          },
          orderBy: { nombre: 'asc' }
        });

        res.json({ areas });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error: any) {
      console.error('Get areas error:', error);
      res.status(500).json({ error: error.message || 'Failed to get areas' });
    }
  }

  // Obtener todos los departamentos de una empresa (opcionalmente filtrados por área)
  static async getCompanyDepartamentos(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { areaId } = req.query;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }

      const prisma = new PrismaClient();

      try {
        const whereClause: any = {
          empresaId: Number(companyId),
          activo: true
        };

        if (areaId && !isNaN(Number(areaId))) {
          whereClause.areaId = Number(areaId);
        }

        const departamentos = await prisma.departamento.findMany({
          where: whereClause,
          include: {
            area: {
              select: {
                id: true,
                nombre: true
              }
            }
          },
          orderBy: { nombre: 'asc' }
        });

        res.json({ departamentos });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error: any) {
      console.error('Get departamentos error:', error);
      res.status(500).json({ error: error.message || 'Failed to get departamentos' });
    }
  }

  // Obtener todos los puestos de una empresa (opcionalmente filtrados por departamento)
  static async getCompanyPuestos(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { departamentoId } = req.query;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'Valid company ID is required' });
      }

      const prisma = new PrismaClient();

      try {
        const whereCondition: any = {
          empresaId: Number(companyId)
        };

        // Si se proporciona departamentoId, filtrar por él
        if (departamentoId && !isNaN(Number(departamentoId))) {
          whereCondition.departamentoId = Number(departamentoId);
        }

        const puestos = await prisma.puesto.findMany({
          where: whereCondition,
          include: {
            departamento: {
              include: {
                area: true
              }
            }
          },
          orderBy: { nombre: 'asc' }
        });

        res.json(puestos);
      } finally {
        await prisma.$disconnect();
      }
    } catch (error: any) {
      console.error('Get puestos error:', error);
      res.status(500).json({ error: error.message || 'Failed to get puestos' });
    }
  }

  // Eliminar un área
  static async deleteArea(req: Request, res: Response) {
    try {
      const { companyId, areaId } = req.params;
      
      if (!companyId || isNaN(Number(companyId)) || !areaId || isNaN(Number(areaId))) {
        return res.status(400).json({ error: 'Valid company ID and area ID are required' });
      }

      const prisma = new PrismaClient();

      try {
        // Verificar que el área pertenezca a la empresa
        const area = await prisma.area.findFirst({
          where: {
            id: Number(areaId),
            empresaId: Number(companyId)
          }
        });

        if (!area) {
          return res.status(404).json({ error: 'Área no encontrada' });
        }

        // Verificar si existen departamentos asociados al área
        const departamentosCount = await prisma.departamento.count({
          where: {
            areaId: Number(areaId),
            activo: true
          }
        });

        if (departamentosCount > 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar el área porque tiene departamentos asociados. Por favor elimine primero todos los departamentos de esta área.',
            departamentos: departamentosCount
          });
        }

        // Eliminar el área
        await prisma.area.delete({
          where: { id: Number(areaId) }
        });

        res.json({ message: 'Área eliminada exitosamente' });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error: any) {
      console.error('Delete area error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete area' });
    }
  }

  // Eliminar un departamento
  static async deleteDepartamento(req: Request, res: Response) {
    try {
      const { companyId, departamentoId } = req.params;
      
      if (!companyId || isNaN(Number(companyId)) || !departamentoId || isNaN(Number(departamentoId))) {
        return res.status(400).json({ error: 'Valid company ID and departamento ID are required' });
      }

      const prisma = new PrismaClient();

      try {
        // Verificar que el departamento pertenezca a la empresa
        const departamento = await prisma.departamento.findFirst({
          where: {
            id: Number(departamentoId),
            empresaId: Number(companyId)
          }
        });

        if (!departamento) {
          return res.status(404).json({ error: 'Departamento no encontrado' });
        }

        // Verificar si existen puestos asociados al departamento
        const puestosCount = await prisma.puesto.count({
          where: {
            departamentoId: Number(departamentoId),
            activo: true
          }
        });

        if (puestosCount > 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar el departamento porque tiene puestos asociados. Por favor elimine primero todos los puestos de este departamento.',
            puestos: puestosCount
          });
        }

        // Eliminar el departamento
        await prisma.departamento.delete({
          where: { id: Number(departamentoId) }
        });

        res.json({ message: 'Departamento eliminado exitosamente' });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error: any) {
      console.error('Delete departamento error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete departamento' });
    }
  }

  // Eliminar un puesto
  static async deletePuesto(req: Request, res: Response) {
    try {
      const { companyId, puestoId } = req.params;
      
      if (!companyId || isNaN(Number(companyId)) || !puestoId || isNaN(Number(puestoId))) {
        return res.status(400).json({ error: 'Valid company ID and puesto ID are required' });
      }

      const prisma = new PrismaClient();

      try {
        // Verificar que el puesto pertenezca a la empresa
        const puesto = await prisma.puesto.findFirst({
          where: {
            id: Number(puestoId),
            empresaId: Number(companyId)
          }
        });

        if (!puesto) {
          return res.status(404).json({ error: 'Puesto no encontrado' });
        }

        // Permitir eliminar cualquier puesto, incluso el último
        // La validación de tener al menos un puesto se manejará en el frontend si es necesaria

        // Eliminar el puesto
        await prisma.puesto.delete({
          where: { id: Number(puestoId) }
        });

        res.json({ message: 'Puesto eliminado exitosamente' });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error: any) {
      console.error('Delete puesto error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete puesto' });
    }
  }
}