import { PrismaClient } from '@prisma/client';
import { PostalCodeService } from './postalCodeService';

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
                    { stepNumber: 2, stepName: 'FONACOT' }
                  ]
                }
              },
              {
                sectionNumber: 3,
                sectionName: 'Bancos',
                isOptional: true,
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
                sectionName: 'Nómina',
                steps: {
                  create: [
                    { stepNumber: 1, stepName: 'Calendario' }
                  ]
                }
              },
              {
                sectionNumber: 7,
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
        case 6: // Nómina
          await this.processPayrollData(companyId, stepData);
          break;
        case 7: // Talento Humano
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
      // Verificar si el código postal existe, si no, crearlo
      if (stepData.zipCode && stepData.neighborhood && stepData.city && stepData.state) {
        await PostalCodeService.createPostalCodeIfNotExists({
          postalCode: stepData.zipCode,
          neighborhood: stepData.neighborhood,
          city: stepData.city,
          state: stepData.state,
          municipality: stepData.municipio
        });
      }

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
        name: stepData.name || stepData.legalRepName || '',
        primerApellido: stepData.primerApellido || null,
        segundoApellido: stepData.segundoApellido || null,
        tipoIdentificacionId: stepData.tipoIdentificacion ? parseInt(stepData.tipoIdentificacion) : null,
        uriIdentificacion: stepData.uriIdentificacion || null
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
    // Paso 4: Poder Notarial
    else if (stepNumber === 4) {
      const existingPower = await prisma.companyNotarialPower.findUnique({
        where: { companyId }
      });

      // Mapear los datos del frontend
      const mappedData = {
        folioPoderNotarial: stepData.folioPoderNotarial || '',
        fechaEmision: stepData.fechaEmision ? new Date(stepData.fechaEmision) : new Date(),
        fechaVigencia: stepData.fechaVigencia ? new Date(stepData.fechaVigencia) : new Date(),
        nombreFederatario: stepData.nombreFederatario || '',
        numeroFederatario: stepData.numeroFederatario ? parseInt(stepData.numeroFederatario) : 0,
        estadoId: stepData.estado ? parseInt(stepData.estado) : 1,
        municipioId: stepData.municipio ? parseInt(stepData.municipio) : 1,
        uriPoderNotarial: stepData.uriPoderNotarial || null
      };

      if (existingPower) {
        await prisma.companyNotarialPower.update({
          where: { companyId },
          data: mappedData
        });
      } else {
        await prisma.companyNotarialPower.create({
          data: {
            companyId,
            ...mappedData
          }
        });
      }
    }
  }

  static async processTaxObligationsData(companyId: number, stepNumber: number, stepData: any) {
    // Paso 1: IMSS Registro Patronal
    if (stepNumber === 1) {
      const existingRegistro = await (prisma as any).iMSSRegistroPatronal.findUnique({
        where: { companyId }
      });

      // Mapear los datos del frontend
      const mappedData = {
        nomDomicilio: stepData.nomDomicilio || null,
        actividadEconomica: stepData.actividadEconomica || null,
        clvRegistroPatronal: stepData.clvRegistroPatronal || null,
        claseRiesgoId: stepData.claseRiesgoId ? parseInt(stepData.claseRiesgoId) : null,
        numFraccion: stepData.numFraccion ? parseInt(stepData.numFraccion) : null,
        numPrismaRiesgo: stepData.numPrismaRiesgo ? parseFloat(stepData.numPrismaRiesgo) : null,
        fechaVigencia: stepData.fechaVigencia ? new Date(stepData.fechaVigencia) : null,
        uriRegistroPatronal: stepData.uriRegistroPatronal || null
      };

      if (existingRegistro) {
        await (prisma as any).iMSSRegistroPatronal.update({
          where: { companyId },
          data: mappedData
        });
      } else {
        await (prisma as any).iMSSRegistroPatronal.create({
          data: {
            companyId,
            ...mappedData
          }
        });
      }
    }
    /* Comentado temporalmente - IMSS Domicilio
    // Paso 2: IMSS Domicilio
    else if (stepNumber === 2) {
      // Código de IMSS Domicilio...
    }
    */
    // Paso 2: FONACOT
    else if (stepNumber === 2) {
      const existingInfo = await prisma.fonacot.findUnique({
        where: { companyId }
      });

      // Mapear solo los campos de FONACOT
      const mappedData = {
        registroPatronal: stepData.registroPatronal || null,
        fechaAfiliacion: stepData.fechaAfiliacion ? new Date(stepData.fechaAfiliacion) : null,
        uriArchivoFonacot: stepData.uriArchivoFonacot || null
      };

      if (existingInfo) {
        await prisma.fonacot.update({
          where: { companyId },
          data: mappedData
        });
      } else {
        await prisma.fonacot.create({
          data: {
            companyId,
            ...mappedData
          }
        });
      }
    }
  }

  static async processBankData(companyId: number, stepData: any) {
    // Si no hay datos bancarios, no hacer nada
    if (!stepData || (!stepData.nomCuentaBancaria && !stepData.bankId)) {
      console.log('No bank data to process, skipping...');
      return;
    }

    // Validar datos requeridos solo si se está intentando guardar información bancaria
    if (stepData.nomCuentaBancaria) {
      if (!stepData.bankId || !stepData.numCuentaBancaria || !stepData.numClabeInterbancaria) {
        throw new Error('Faltan datos bancarios requeridos: banco, número de cuenta y CLABE son obligatorios');
      }
    }

    // Ahora es un solo formulario, no un arreglo
    const existingBank = await prisma.companyBank.findUnique({
      where: { companyId }
    });

    // Preparar datos validando tipos
    const bankIdValue = stepData.bankId || stepData.bancoId;
    if (!bankIdValue) {
      throw new Error('El ID del banco es requerido');
    }
    
    const bankId = parseInt(bankIdValue);
    if (isNaN(bankId)) {
      throw new Error('El ID del banco debe ser un número válido');
    }

    const bankData = {
      nomCuentaBancaria: stepData.nomCuentaBancaria,
      bankId: bankId,
      numCuentaBancaria: stepData.numCuentaBancaria,
      numClabeInterbancaria: stepData.numClabeInterbancaria,
      numSucursal: stepData.numSucursal || null,
      clvDispersion: stepData.clvDispersion ? parseInt(stepData.clvDispersion) : null,
      desCuentaBancaria: stepData.desCuentaBancaria || null,
      opcCuentaBancariaPrincipal: stepData.opcCuentaBancariaPrincipal === true
    };

    // Validar clvDispersion si se proporciona
    if (bankData.clvDispersion !== null && isNaN(bankData.clvDispersion)) {
      bankData.clvDispersion = null;
    }

    if (existingBank) {
      await prisma.companyBank.update({
        where: { companyId },
        data: bankData
      });
    } else {
      await prisma.companyBank.create({
        data: {
          companyId,
          ...bankData
        }
      });
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
    if (stepNumber === 1 && stepData.areas) { // Áreas
      await prisma.area.deleteMany({ where: { empresaId: companyId } });
      
      for (const area of stepData.areas) {
        await prisma.area.create({
          data: { 
            empresaId: companyId,
            nombre: area.nombre,
            descripcion: area.descripcion || null,
            activo: true
          }
        });
      }
    } else if (stepNumber === 2 && stepData.departamentos) { // Departamentos
      await prisma.departamento.deleteMany({ where: { empresaId: companyId } });
      
      for (const dept of stepData.departamentos) {
        await prisma.departamento.create({
          data: { 
            empresaId: companyId,
            areaId: dept.areaId ? parseInt(dept.areaId) : null,
            nombre: dept.nombre,
            descripcion: dept.descripcion || null,
            activo: true
          }
        });
      }
    } else if (stepNumber === 3 && stepData.puestos) { // Puestos (REQUERIDO)
      // Validar que haya al menos un puesto
      if (!stepData.puestos || stepData.puestos.length === 0) {
        throw new Error('Debe agregar al menos un puesto para continuar');
      }
      
      await prisma.puesto.deleteMany({ where: { empresaId: companyId } });
      
      for (const puesto of stepData.puestos) {
        // No enviar el ID temporal del frontend
        const { id, areaNombre, departamentoNombre, ...puestoData } = puesto;
        
        await prisma.puesto.create({
          data: { 
            empresaId: companyId,
            areaId: puestoData.areaId ? parseInt(puestoData.areaId) : null,
            departamentoId: puestoData.departamentoId ? parseInt(puestoData.departamentoId) : null,
            nombre: puestoData.nombre,
            activo: true
          }
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