import { Request, Response } from 'express';
import { CompanyWizardService } from '../services/companyWizardService';

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
      
      res.json({
        message: 'Wizard step updated successfully',
        data: updatedStep
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

  // Método auxiliar para obtener datos específicos de cada sección
  static async getSectionSpecificData(companyId: number, sectionNumber: number) {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      switch (sectionNumber) {
        case 1: // Datos Generales
          return await prisma.companyGeneralInfo.findUnique({
            where: { companyId }
          });
        case 2: // Obligaciones Patronales
          return await prisma.companyTaxObligations.findUnique({
            where: { companyId }
          });
        case 3: // Bancos
          return await prisma.companyBank.findMany({
            where: { companyId }
          });
        case 4: // Sellos Digitales
          return await prisma.companyDigitalCertificate.findUnique({
            where: { companyId }
          });
        case 5: // Estructura Organizacional
          return {
            areas: await prisma.companyArea.findMany({ where: { companyId } }),
            departments: await prisma.companyDepartment.findMany({ where: { companyId } }),
            positions: await prisma.companyPosition.findMany({ where: { companyId } })
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

      const { PrismaClient } = await import('@prisma/client');
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