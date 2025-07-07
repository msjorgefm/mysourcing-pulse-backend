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
              legalRepName: legalRep.name,
              legalRepRFC: legalRep.rfc,
              legalRepCurp: legalRep.curp,
              legalRepPosition: legalRep.position,
              notarialPower: legalRep.notarialPower,
              notaryNumber: legalRep.notaryNumber,
              notaryName: legalRep.notaryName
            };
          }
          
          return {
            generalInfo,
            address,
            legalRepresentative: mappedLegalRep
          };
        case 2: // Obligaciones Patronales
          return await prisma.companyTaxObligations.findUnique({
            where: { companyId }
          });
        case 3: // Bancos
          const banks = await prisma.companyBank.findMany({
            where: { companyId }
          });
          
          // Mapeo inverso de tipos del backend al frontend
          const bankTypeMapReverse: { [key: string]: string } = {
            'CHECKING': 'OPERACION',
            'SAVINGS': 'AHORRO',
            'PAYROLL': 'NOMINA'
          };
          
          // Mapear los datos para el frontend
          return {
            banks: banks.map(bank => ({
              name: bank.bankName,
              type: bankTypeMapReverse[bank.bankType] || 'OPERACION',
              accountNumber: bank.accountNumber,
              clabe: bank.clabe || '',
              isDefault: bank.isPrimary
            }))
          };
        case 4: // Sellos Digitales
          return await prisma.companyDigitalCertificate.findUnique({
            where: { companyId }
          });
        case 5: // Estructura Organizacional
          // Obtener datos del wizard para extraer stepData
          const wizard = await prisma.companyWizard.findUnique({
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

          if (!wizard || !wizard.sectionProgress[0]) {
            return {
              areas: [],
              departments: [],
              positions: []
            };
          }

          const section = wizard.sectionProgress[0];
          const steps = section.steps;

          // Extraer datos de cada paso
          const areasStep = steps.find(s => s.stepNumber === 1);
          const departmentsStep = steps.find(s => s.stepNumber === 2);
          const positionsStep = steps.find(s => s.stepNumber === 3);

          // Extraer los datos del stepData
          const areasData = areasStep?.stepData as any;
          const departmentsData = departmentsStep?.stepData as any;
          const positionsData = positionsStep?.stepData as any;

          const areas = areasData?.['áreas'] || areasData?.['areas'] || [];
          const departments = departmentsData?.['departamentos'] || departmentsData?.['departments'] || [];
          const positions = positionsData?.['puestos'] || positionsData?.['positions'] || [];

          return {
            areas,
            departments,
            positions
          };
        case 6: // Prestaciones
          return {
            benefits: await prisma.companyBenefit.findMany({ where: { companyId } }),
            benefitGroups: await prisma.companyBenefitGroup.findMany({ where: { companyId } })
          };
        case 7: // Nómina
          return await prisma.calendar.findMany({
            where: { companyId }
          });
        case 8: // Talento Humano
          return {
            schedules: await prisma.companySchedule.findMany({ where: { companyId } }),
            employees: await prisma.employee.findMany({ where: { companyId } })
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
}