import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CompanyWizardService {
  
  // Inicializar wizard para una nueva empresa
  static async initializeWizard(companyId: number) {
    try {
      // Verificar si ya existe un wizard para esta empresa
      const existingWizard = await prisma.companyWizard.findUnique({
        where: { companyId }
      });

      if (existingWizard) {
        return existingWizard;
      }

      // Crear wizard y sus secciones
      const wizard = await prisma.companyWizard.create({
        data: {
          companyId,
          sectionProgress: {
            create: [
              {
                sectionNumber: 1,
                sectionName: 'Datos Generales',
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'Información General' },
                    { stepNumber: 2, stepName: 'Domicilio' },
                    { stepNumber: 3, stepName: 'Representante Legal' },
                    { stepNumber: 4, stepName: 'Poder Notarial' }
                  ]
                }
              },
              {
                sectionNumber: 2,
                sectionName: 'Obligaciones Patronales',
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'IMSS Registro Patronal' },
                    { stepNumber: 2, stepName: 'IMSS Domicilio' },
                    { stepNumber: 3, stepName: 'FONACOT' }
                  ]
                }
              },
              {
                sectionNumber: 3,
                sectionName: 'Bancos',
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'Tipos de Bancos' }
                  ]
                }
              },
              {
                sectionNumber: 4,
                sectionName: 'Sellos Digitales',
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'Certificados Digitales' }
                  ]
                }
              },
              {
                sectionNumber: 5,
                sectionName: 'Estructura Organizacional',
                isOptional: true,
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'Areas', isOptional: true },
                    { stepNumber: 2, stepName: 'Departamentos', isOptional: true },
                    { stepNumber: 3, stepName: 'Puestos' }
                  ]
                }
              },
              {
                sectionNumber: 6,
                sectionName: 'Prestaciones',
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'Prestaciones de Ley' },
                    { stepNumber: 2, stepName: 'Gestión de Grupo de Prestaciones', isOptional: true }
                  ]
                }
              },
              {
                sectionNumber: 7,
                sectionName: 'Nómina',
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'Calendario' }
                  ]
                }
              },
              {
                sectionNumber: 8,
                sectionName: 'Talento Humano',
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'Horarios' },
                    { stepNumber: 2, stepName: 'Alta Trabajadores' }
                  ]
                }
              }
            ]
          }
        },
        include: {
          sectionProgress: {
            include: {
              steps: true
            }
          }
        }
      });

      return wizard;
    } catch (error) {
      console.error('Error initializing wizard:', error);
      throw error;
    }
  }

  // Obtener estado del wizard
  static async getWizardStatus(companyId: number) {
    try {
      let wizard = await prisma.companyWizard.findUnique({
        where: { companyId },
        include: {
          sectionProgress: {
            include: {
              steps: true
            },
            orderBy: { sectionNumber: 'asc' }
          }
        }
      });

      if (!wizard) {
        // Si no existe el wizard, lo creamos automáticamente
        console.log(`Wizard no encontrado para empresa ${companyId}, creando uno nuevo...`);
        await this.initializeWizard(companyId);
        
        // Recuperar el wizard con todas las relaciones
        wizard = await prisma.companyWizard.findUnique({
          where: { companyId },
          include: {
            sectionProgress: {
              include: {
                steps: true
              },
              orderBy: { sectionNumber: 'asc' }
            }
          }
        });
      }

      // Asegurarse de que se devuelven currentSection y currentStep
      return {
        ...wizard,
        currentSection: wizard?.currentSection || 1,
        currentStep: wizard?.currentStep || 1
      };
    } catch (error) {
      console.error('Error getting wizard status:', error);
      throw error;
    }
  }

  // Actualizar paso del wizard
  static async updateWizardStep(companyId: number, sectionNumber: number, stepNumber: number, stepData: any) {
    try {
      const wizard = await prisma.companyWizard.findUnique({
        where: { companyId },
        include: {
          sectionProgress: {
            where: { sectionNumber },
            include: { steps: { where: { stepNumber } } }
          }
        }
      });

      if (!wizard || !wizard.sectionProgress[0] || !wizard.sectionProgress[0].steps[0]) {
        throw new Error('Wizard step not found');
      }

      const stepId = wizard.sectionProgress[0].steps[0].id;

      // Actualizar el paso
      const updatedStep = await prisma.companyWizardStep.update({
        where: { id: stepId },
        data: {
          stepData,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Actualizar la posición actual del wizard
      await prisma.companyWizard.update({
        where: { companyId },
        data: {
          currentSection: sectionNumber,
          currentStep: stepNumber
        }
      });

      // Verificar si todos los pasos obligatorios de la sección están completos
      const sectionId = wizard.sectionProgress[0].id;
      const allSteps = await prisma.companyWizardStep.findMany({
        where: { sectionId }
      });

      const mandatorySteps = allSteps.filter(step => !step.isOptional);
      const completedMandatorySteps = mandatorySteps.filter(step => step.status === 'COMPLETED');

      // Si todos los pasos obligatorios están completos, marcar la sección como completa
      if (completedMandatorySteps.length === mandatorySteps.length) {
        await prisma.companyWizardSection.update({
          where: { id: sectionId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });
      }

      // Procesar datos específicos según la sección
      await this.processStepData(companyId, sectionNumber, stepNumber, stepData);

      return updatedStep;
    } catch (error) {
      console.error('Error updating wizard step:', error);
      throw error;
    }
  }

  // Procesar datos específicos de cada paso
  static async processStepData(companyId: number, sectionNumber: number, stepNumber: number, stepData: any) {
    try {
      switch (sectionNumber) {
        case 1: // Datos Generales
          await this.processGeneralInfoData(companyId, stepNumber, stepData);
          break;
        case 2: // Obligaciones Patronales
          await this.processTaxObligationsData(companyId, stepNumber, stepData);
          break;
        case 3: // Bancos
          await this.processBankData(companyId, stepData);
          break;
        case 4: // Sellos Digitales
          await this.processDigitalCertificateData(companyId, stepData);
          break;
        case 5: // Estructura Organizacional
          await this.processOrganizationalData(companyId, stepNumber, stepData);
          break;
        case 6: // Prestaciones
          await this.processBenefitsData(companyId, stepNumber, stepData);
          break;
        case 7: // Nómina
          await this.processPayrollData(companyId, stepData);
          break;
        case 8: // Talento Humano
          await this.processHRData(companyId, stepNumber, stepData);
          break;
      }
    } catch (error) {
      console.error('Error processing step data:', error);
      throw error;
    }
  }

  // Métodos para procesar datos específicos
  static async processGeneralInfoData(companyId: number, stepNumber: number, stepData: any) {
    // Paso 1: Información General
    if (stepNumber === 1) {
      const existingInfo = await prisma.companyGeneralInfo.findUnique({
        where: { companyId }
      });

      // Convertir la fecha al formato ISO-8601 completo si viene solo la fecha
      const updateData = { ...stepData };
      if (updateData.startDate && !updateData.startDate.includes('T')) {
        updateData.startDate = new Date(updateData.startDate + 'T00:00:00.000Z');
      }

      if (existingInfo) {
        // Hacer merge de los datos existentes con los nuevos para permitir actualizaciones parciales
        await prisma.companyGeneralInfo.update({
          where: { companyId },
          data: updateData
        });
      } else {
        await prisma.companyGeneralInfo.create({
          data: {
            companyId,
            ...updateData
          }
        });
      }
    }
    // Paso 2: Domicilio
    else if (stepNumber === 2) {
      const existingAddress = await prisma.companyAddress.findUnique({
        where: { companyId }
      });

      if (existingAddress) {
        await prisma.companyAddress.update({
          where: { companyId },
          data: stepData
        });
      } else {
        await prisma.companyAddress.create({
          data: {
            companyId,
            ...stepData
          }
        });
      }
    }
    // Paso 3: Representante Legal
    else if (stepNumber === 3) {
      const existingRep = await prisma.companyLegalRepresentative.findUnique({
        where: { companyId }
      });

      // Mapear los campos del frontend a los campos de la base de datos
      const mappedData = {
        name: stepData.legalRepName,
        rfc: stepData.legalRepRFC,
        curp: stepData.legalRepCurp || null,
        position: stepData.legalRepPosition
      };

      if (existingRep) {
        await prisma.companyLegalRepresentative.update({
          where: { companyId },
          data: mappedData
        });
      } else {
        await prisma.companyLegalRepresentative.create({
          data: {
            companyId,
            ...mappedData
          }
        });
      }
    }
    // Paso 4: Poder Notarial (actualizar el representante legal existente)
    else if (stepNumber === 4) {
      const existingRep = await prisma.companyLegalRepresentative.findUnique({
        where: { companyId }
      });

      if (existingRep) {
        await prisma.companyLegalRepresentative.update({
          where: { companyId },
          data: {
            notarialPower: stepData.notarialPower || null,
            notaryNumber: stepData.notaryNumber || null,
            notaryName: stepData.notaryName || null
          }
        });
      }
    }
  }

  static async processTaxObligationsData(companyId: number, stepNumber: number, stepData: any) {
    const existingInfo = await prisma.companyTaxObligations.findUnique({
      where: { companyId }
    });

    if (existingInfo) {
      await prisma.companyTaxObligations.update({
        where: { companyId },
        data: stepData
      });
    } else {
      await prisma.companyTaxObligations.create({
        data: {
          companyId,
          ...stepData
        }
      });
    }
  }

  static async processBankData(companyId: number, stepData: any) {
    if (stepData.banks && Array.isArray(stepData.banks)) {
      // Eliminar bancos existentes
      await prisma.companyBank.deleteMany({
        where: { companyId }
      });

      // Mapeo de tipos del frontend al backend
      const bankTypeMap: { [key: string]: 'CHECKING' | 'SAVINGS' | 'PAYROLL' } = {
        'OPERACION': 'CHECKING',
        'AHORRO': 'SAVINGS',
        'NOMINA': 'PAYROLL'
      };

      // Crear nuevos bancos
      for (const bank of stepData.banks) {
        await prisma.companyBank.create({
          data: {
            companyId,
            bankName: bank.name,
            bankType: bankTypeMap[bank.type] || 'CHECKING',
            accountNumber: bank.accountNumber,
            clabe: bank.clabe || null,
            isPrimary: bank.isDefault || false
          }
        });
      }
    }
  }

  static async processDigitalCertificateData(companyId: number, stepData: any) {
    const existingCert = await prisma.companyDigitalCertificate.findUnique({
      where: { companyId }
    });

    // Asegurarse de que las fechas están en formato ISO-8601
    const certificateData = {
      certificateFile: stepData.certificateFile || '',
      keyFile: stepData.keyFile || '',
      password: stepData.password || '',
      validFrom: stepData.validFrom ? new Date(stepData.validFrom) : new Date(),
      validUntil: stepData.validUntil ? new Date(stepData.validUntil) : new Date()
    };

    if (existingCert) {
      await prisma.companyDigitalCertificate.update({
        where: { companyId },
        data: certificateData
      });
    } else {
      await prisma.companyDigitalCertificate.create({
        data: {
          companyId,
          ...certificateData
        }
      });
    }
  }

  static async processOrganizationalData(companyId: number, stepNumber: number, stepData: any) {
    if (stepNumber === 1 && stepData.areas) { // Areas
      await prisma.companyArea.deleteMany({ where: { companyId } });
      for (const area of stepData.areas) {
        await prisma.companyArea.create({
          data: { companyId, ...area }
        });
      }
    } else if (stepNumber === 2 && stepData.departments) { // Departamentos
      await prisma.companyDepartment.deleteMany({ where: { companyId } });
      for (const dept of stepData.departments) {
        await prisma.companyDepartment.create({
          data: { companyId, ...dept }
        });
      }
    } else if (stepNumber === 3 && stepData.positions) { // Puestos
      await prisma.companyPosition.deleteMany({ where: { companyId } });
      for (const position of stepData.positions) {
        await prisma.companyPosition.create({
          data: { companyId, ...position }
        });
      }
    }
  }

  static async processBenefitsData(companyId: number, stepNumber: number, stepData: any) {
    if (stepNumber === 1 && stepData.benefits) { // Prestaciones de Ley
      for (const benefit of stepData.benefits) {
        await prisma.companyBenefit.create({
          data: { companyId, isLegal: true, ...benefit }
        });
      }
    } else if (stepNumber === 2 && stepData.benefitGroups) { // Grupos de Prestaciones
      for (const group of stepData.benefitGroups) {
        await prisma.companyBenefitGroup.create({
          data: { companyId, ...group }
        });
      }
    }
  }

  static async processPayrollData(companyId: number, stepData: any) {
    if (stepData.calendar) {
      await prisma.calendar.create({
        data: {
          companyId,
          ...stepData.calendar
        }
      });
    }
  }

  static async processHRData(companyId: number, stepNumber: number, stepData: any) {
    if (stepNumber === 1 && stepData.schedules) { // Horarios
      for (const schedule of stepData.schedules) {
        await prisma.companySchedule.create({
          data: { companyId, ...schedule }
        });
      }
    }
    // stepNumber === 2 sería para Alta Trabajadores, que se manejará en el frontend
  }

  // Completar wizard
  static async completeWizard(companyId: number) {
    try {
      // Verificar que todas las secciones obligatorias estén completas
      const wizard = await prisma.companyWizard.findUnique({
        where: { companyId },
        include: {
          sectionProgress: {
            include: { steps: true }
          }
        }
      });

      if (!wizard) {
        throw new Error('Wizard not found');
      }

      const mandatorySections = wizard.sectionProgress.filter(section => !section.isOptional);
      const completedMandatorySections = mandatorySections.filter(section => section.status === 'COMPLETED');

      if (completedMandatorySections.length !== mandatorySections.length) {
        throw new Error('Not all mandatory sections are completed');
      }

      // Marcar wizard como completado
      await prisma.companyWizard.update({
        where: { companyId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Actualizar estado de la empresa a CONFIGURED
      await prisma.company.update({
        where: { id: companyId },
        data: {
          status: 'CONFIGURED'
        }
      });

      return { success: true, message: 'Wizard completed successfully' };
    } catch (error) {
      console.error('Error completing wizard:', error);
      throw error;
    }
  }
}