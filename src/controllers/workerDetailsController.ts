import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { translatePrismaError } from '../utils/errorTranslator';
import { randomBytes } from 'crypto';
import { sendEmail } from '../services/emailService';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import * as path from 'path';

const prisma = new PrismaClient();

// Manejar cierre de conexión con Prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Helper function to map frontend values to enum values
const mapTipoContrato = (value: string): any => {
  const mapping: { [key: string]: string } = {
    'INDEFINIDO': 'TIEMPO_INDETERMINADO',
    'TIEMPO_DETERMINADO': 'OBRA_TIEMPO_DETERMINADO',
    'MEDIO_TIEMPO': 'TIEMPO_INDETERMINADO',
    'PRACTICANTE': 'PRACTICAS_PROFESIONALES',
    'PROYECTO': 'OBRA_TIEMPO_DETERMINADO',
    // Also accept the correct values directly
    'PERIODO_PRUEBA': 'PERIODO_PRUEBA',
    'CAPACITACION_INICIAL': 'CAPACITACION_INICIAL',
    'OBRA_TIEMPO_DETERMINADO': 'OBRA_TIEMPO_DETERMINADO',
    'TEMPORADA': 'TEMPORADA',
    'TIEMPO_INDETERMINADO': 'TIEMPO_INDETERMINADO',
    'PRACTICAS_PROFESIONALES': 'PRACTICAS_PROFESIONALES',
    'TELETRABAJO': 'TELETRABAJO'
  };
  
  return mapping[value] || 'TIEMPO_INDETERMINADO';
};

export const workerDetailsController = {
  // Obtener calendarios de nómina de una empresa
  async getCompanyPayrollCalendars(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      const calendars = await prisma.payrollCalendar.findMany({
        where: { companyId: parseInt(companyId) },
        select: { 
          id: true,
          name: true,
          payFrequency: true,
          startDate: true,
          daysBeforeClose: true,
          payNaturalDays: true
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: calendars,
        count: calendars.length
      });
    } catch (error) {
      logger.error('Error fetching payroll calendars:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener calendarios de nómina'
      });
    }
  },

  // Obtener todos los trabajadores
  async getAllWorkerDetails(_req: Request, res: Response) {
    try {
      const workers = await prisma.workerDetails.findMany({
        include: {
          company: true,
          incidences: true,
          payrollItems: true,
          user: true,
          contractConditions: {
            include: {
              area: true,
              departamento: true,
              puesto: true
            }
          }
        },
        orderBy: { nombres: 'asc' }
      });

      res.json({
        success: true,
        data: workers,
        count: workers.length
      });
    } catch (error) {
      logger.error('Error fetching all workers:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener trabajadores'
      });
    }
  },

  // Obtener todos los trabajadores de una empresa
  async getWorkerDetailsByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      const workers = await prisma.workerDetails.findMany({
        where: { companyId: parseInt(companyId) },
        include: {
          company: true,
          incidences: true,
          payrollItems: true,
          user: true,
          contractConditions: {
            include: {
              area: true,
              departamento: true,
              puesto: true
            }
          }
        },
        orderBy: { nombres: 'asc' }
      });

      res.json({
        success: true,
        data: workers,
        count: workers.length
      });
    } catch (error) {
      logger.error('Error fetching workers by company:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener trabajadores'
      });
    }
  },

  // Obtener un trabajador por ID
  async getWorkerDetailsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const worker = await prisma.workerDetails.findUnique({
        where: { id: parseInt(id) },
        include: {
          company: true,
          incidences: true,
          payrollItems: true,
          user: true,
          contractConditions: {
            include: {
              area: true,
              departamento: true,
              puesto: true
            }
          },
          address: true,
          alimony: true,
          documents: true,
          familyMembers: true,
          fonacotCredits: true,
          infonavitCredits: true,
          paymentData: true
        }
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Trabajador no encontrado'
        });
      }

      res.json({
        success: true,
        data: worker
      });
    } catch (error) {
      logger.error('Error fetching worker by id:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener trabajador'
      });
    }
  },

  // Crear un nuevo trabajador
  async createWorkerDetails(req: Request, res: Response) {
    try {
      const data = req.body;
      
      const worker = await prisma.workerDetails.create({
        data: {
          companyId: data.companyId,
          numeroTrabajador: data.numeroTrabajador,
          nombres: data.nombres,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          fechaNacimiento: new Date(data.fechaNacimiento),
          sexo: data.sexo,
          nacionalidad: data.nacionalidad,
          estadoCivil: data.estadoCivil,
          rfc: data.rfc,
          curp: data.curp,
          nss: data.nss,
          umf: data.umf
        },
        include: {
          company: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Trabajador creado exitosamente',
        data: worker
      });
    } catch (error) {
      logger.error('Error creating worker:', error);
      const translatedError = translatePrismaError(error);
      res.status(400).json({
        success: false,
        message: translatedError.message,
        code: translatedError.code
      });
    }
  },

  // Actualizar un trabajador
  async updateWorkerDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const worker = await prisma.workerDetails.update({
        where: { id: parseInt(id) },
        data: {
          numeroTrabajador: data.numeroTrabajador,
          nombres: data.nombres,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
          sexo: data.sexo,
          nacionalidad: data.nacionalidad,
          estadoCivil: data.estadoCivil,
          rfc: data.rfc,
          curp: data.curp,
          nss: data.nss,
          umf: data.umf
        },
        include: {
          company: true,
          contractConditions: true
        }
      });

      res.json({
        success: true,
        message: 'Trabajador actualizado exitosamente',
        data: worker
      });
    } catch (error) {
      logger.error('Error updating worker:', error);
      const translatedError = translatePrismaError(error);
      res.status(400).json({
        success: false,
        message: translatedError.message,
        code: translatedError.code
      });
    }
  },

  // Eliminar un trabajador
  async deleteWorkerDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.workerDetails.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Trabajador eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error deleting worker:', error);
      const translatedError = translatePrismaError(error);
      res.status(400).json({
        success: false,
        message: translatedError.message,
        code: translatedError.code
      });
    }
  },

  // Validar trabajadores masivos
  async validateBulkWorkers(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const employees = req.body.workers || req.body.employees;

      if (!employees || !Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron empleados para validar'
        });
      }

      const validationResults: {
        valid: boolean,
        errors: Array<{ row: number; field: string; error: string }>,
        warnings: Array<{ row: number; field: string; warning: string }>
      } = {
        valid: true,
        errors: [],
        warnings: []
      };

      // Validar números de empleado duplicados en el batch
      const employeeNumbers = new Map<string, number[]>();
      employees.forEach((emp: any, index: number) => {
        const numeroEmpleado = emp.numeroEmpleado || emp.numeroTrabajador;
        if (numeroEmpleado) {
          const key = String(numeroEmpleado);
          if (!employeeNumbers.has(key)) {
            employeeNumbers.set(key, []);
          }
          employeeNumbers.get(key)!.push(index + 1);
        }
      });

      // Marcar duplicados
      employeeNumbers.forEach((rows, empNumber) => {
        if (rows.length > 1) {
          rows.forEach(row => {
            validationResults.errors.push({
              row,
              field: 'numeroEmpleado',
              error: `Número de empleado ${empNumber} duplicado en las filas ${rows.join(', ')}`
            });
          });
          validationResults.valid = false;
        }
      });

      // Validar cada empleado
      for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        const row = i + 1;

        // Validaciones de campos requeridos
        const requiredFields = [
          { field: 'numeroEmpleado', name: 'Número de empleado' },
          { field: 'nombres', name: 'Nombre(s)' },
          { field: 'primerApellido', name: 'Primer apellido' },
          { field: 'rfc', name: 'RFC' },
          { field: 'curp', name: 'CURP' },
          { field: 'nss', name: 'NSS' },
          { field: 'fechaNacimiento', name: 'Fecha de nacimiento' },
          { field: 'genero', name: 'Género' },
          { field: 'estadocivil', name: 'Estado civil' },
          { field: 'email', name: 'Correo electrónico' },
          { field: 'codigoPostal', name: 'Código postal' },
          { field: 'puesto', name: 'Puesto' },
          { field: 'fechaIngreso', name: 'Fecha de ingreso' },
          { field: 'salarioDiario', name: 'Salario diario' },
          { field: 'calendario', name: 'Calendario de nómina' }
        ];

        for (const { field, name } of requiredFields) {
          // Handle alternate field names
          let value = employee[field];
          if (field === 'numeroEmpleado' && !value) {
            value = employee.numeroTrabajador;
          } else if (field === 'primerApellido' && !value) {
            value = employee.apellidoPaterno;
          } else if (field === 'estadocivil' && !value) {
            value = employee.estadoCivil;
          }

          if (!value || value === '') {
            validationResults.errors.push({
              row,
              field,
              error: `${name} es requerido`
            });
            validationResults.valid = false;
          }
        }

        // Validar RFC
        if (employee.rfc) {
          const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
          if (!rfcRegex.test(employee.rfc.toUpperCase())) {
            validationResults.errors.push({
              row,
              field: 'rfc',
              error: 'RFC inválido. Formato esperado: 3-4 letras, 6 dígitos, 3 caracteres'
            });
            validationResults.valid = false;
          }
        }

        // Validar CURP
        if (employee.curp) {
          const curpRegex = /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;
          if (!curpRegex.test(employee.curp.toUpperCase())) {
            validationResults.errors.push({
              row,
              field: 'curp',
              error: 'CURP inválido. Verifique el formato'
            });
            validationResults.valid = false;
          }
        }

        // Validar NSS
        if (employee.nss) {
          const nssStr = String(employee.nss).replace(/\D/g, '');
          if (nssStr.length !== 11) {
            validationResults.errors.push({
              row,
              field: 'nss',
              error: 'NSS debe tener exactamente 11 dígitos'
            });
            validationResults.valid = false;
          }
        }

        // Validar email
        if (employee.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.email)) {
            validationResults.errors.push({
              row,
              field: 'email',
              error: 'Formato de correo electrónico inválido'
            });
            validationResults.valid = false;
          }
        }

        // Validar fechas
        const dateFields = [
          { field: 'fechaNacimiento', name: 'Fecha de nacimiento' },
          { field: 'fechaIngreso', name: 'Fecha de ingreso' },
          { field: 'fechaAntiguedad', name: 'Fecha de antigüedad' }
        ];

        for (const { field, name } of dateFields) {
          if (employee[field]) {
            const date = new Date(employee[field]);
            if (isNaN(date.getTime())) {
              validationResults.errors.push({
                row,
                field,
                error: `${name} tiene formato inválido. Use AAAA-MM-DD`
              });
              validationResults.valid = false;
            }
          }
        }

        // Validar valores numéricos
        const numericFields = [
          { field: 'salarioDiario', name: 'Salario diario' },
          { field: 'sueldoBaseCotizacion', name: 'Sueldo base cotización' }
        ];

        for (const { field, name } of numericFields) {
          if (employee[field]) {
            const value = parseFloat(employee[field]);
            if (isNaN(value) || value <= 0) {
              validationResults.errors.push({
                row,
                field,
                error: `${name} debe ser un número mayor a 0`
              });
              validationResults.valid = false;
            }
          }
        }

        // Validar enums
        const enumValidations = [
          {
            field: 'genero',
            name: 'Género',
            validValues: ['M', 'F', 'O'],
            errorMsg: 'Género debe ser M (Masculino), F (Femenino) u O (Otro)'
          },
          {
            field: 'estadocivil',
            name: 'Estado civil',
            validValues: ['S', 'C'],
            errorMsg: 'Estado civil debe ser S (Soltero) o C (Casado)'
          },
          {
            field: 'tipoContrato',
            name: 'Tipo de contrato',
            validValues: ['PERIODO_PRUEBA', 'CAPACITACION_INICIAL', 'OBRA_TIEMPO_DETERMINADO', 'TEMPORADA', 'TIEMPO_INDETERMINADO', 'PRACTICAS_PROFESIONALES', 'TELETRABAJO'],
            errorMsg: 'Tipo de contrato erroneo.'
          },
          {
            field: 'zonaGeografica',
            name: 'Zona geográfica',
            validValues: ['RESTO_PAIS', 'ZONA_FRONTERA_NORTE'],
            errorMsg: 'Zona geográfica debe ser RESTO_PAIS o ZONA_FRONTERA_NORTE'
          },
          {
            field: 'tipoSalario',
            name: 'Tipo de salario',
            validValues: ['FIJO', 'MIXTO', 'VARIABLE'],
            errorMsg: 'Tipo de salario debe ser FIJO, MIXTO o VARIABLE'
          }
        ];

        for (const { field, name, validValues, errorMsg } of enumValidations) {
          let value = employee[field];
          if (field === 'estadocivil' && !value) {
            value = employee.estadoCivil;
          }
          
          if (value && !validValues.includes(value)) {
            validationResults.errors.push({
              row,
              field,
              error: errorMsg
            });
            validationResults.valid = false;
          }
        }

        // Verificar duplicados en la base de datos
        if (employee.rfc) {
          const existingWorker = await prisma.workerDetails.findFirst({
            where: { 
              rfc: employee.rfc.toUpperCase(),
              companyId: parseInt(companyId)
            }
          });
          if (existingWorker) {
            validationResults.errors.push({
              row,
              field: 'rfc',
              error: 'El RFC ya está registrado en el sistema'
            });
            validationResults.valid = false;
          }
        }

        if (employee.curp) {
          const existingWorker = await prisma.workerDetails.findFirst({
            where: { 
              curp: employee.curp.toUpperCase(),
              companyId: parseInt(companyId)
            }
          });
          if (existingWorker) {
            validationResults.errors.push({
              row,
              field: 'curp',
              error: 'El CURP ya está registrado en el sistema'
            });
            validationResults.valid = false;
          }
        }

        const numeroEmpleado = employee.numeroEmpleado || employee.numeroTrabajador;
        if (numeroEmpleado) {
          const existingWorker = await prisma.workerDetails.findFirst({
            where: { 
              numeroTrabajador: parseInt(numeroEmpleado),
              companyId: parseInt(companyId)
            }
          });
          if (existingWorker) {
            validationResults.errors.push({
              row,
              field: 'numeroEmpleado',
              error: 'El número de empleado ya existe en esta empresa'
            });
            validationResults.valid = false;
          }
        }

        // Validar que el puesto existe en la empresa
        if (employee.puesto) {
          const puesto = await prisma.puesto.findFirst({
            where: {
              empresaId: parseInt(companyId),
              nombre: employee.puesto,
              activo: true
            }
          });
          if (!puesto) {
            validationResults.errors.push({
              row,
              field: 'puesto',
              error: `El puesto "${employee.puesto}" no existe en el catálogo de la empresa`
            });
            validationResults.valid = false;
          }
        }

        // Validar que el calendario existe en la empresa
        if (employee.calendario) {
          const calendario = await prisma.payrollCalendar.findFirst({
            where: {
              companyId: parseInt(companyId),
              name: employee.calendario
            }
          });
          if (!calendario) {
            validationResults.errors.push({
              row,
              field: 'calendario',
              error: `El calendario "${employee.calendario}" no existe en el catálogo de la empresa`
            });
            validationResults.valid = false;
          }
        }

        // Validar que el email no esté ya en uso
        if (employee.email) {
          const existingUser = await prisma.user.findUnique({
            where: { 
              email: employee.email.toLowerCase()
            }
          });
          if (existingUser) {
            validationResults.errors.push({
              row,
              field: 'email',
              error: 'El correo electrónico ya está registrado en el sistema'
            });
            validationResults.valid = false;
          }
        }
      }

      res.json({
        success: true,
        data: validationResults
      });

    } catch (error) {
      logger.error('Error validating employees:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar empleados'
      });
    }
  },

  // Crear trabajadores masivos
  async createBulkWorkers(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const employees = req.body.workers || req.body.employees;

      if (!employees || !Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron empleados para cargar'
        });
      }

      const results: {
        success: Array<{ row: number; employeeNumber: string; name: string }>,
        errors: Array<{ row: number; employeeNumber: string; error: string }>
      } = {
        success: [],
        errors: []
      };

      // Procesar cada empleado
      for (let i = 0; i < employees.length; i++) {
        try {
          const employeeData = employees[i];
          
          // Usar transacción para asegurar que todo se guarde o nada
          const result = await prisma.$transaction(async (tx) => {
            // Map field names for backward compatibility
            const numeroTrabajador = employeeData.numeroEmpleado || employeeData.numeroTrabajador;
            const apellidoPaterno = employeeData.primerApellido || employeeData.apellidoPaterno;
            const apellidoMaterno = employeeData.segundoApellido || employeeData.apellidoMaterno;
            const nombres = employeeData.nombres;
            const fullName = `${nombres} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim();
            
            // Crear WorkerDetails
            const workerDetails = await tx.workerDetails.create({
              data: {
                companyId: parseInt(companyId),
                numeroTrabajador: parseInt(numeroTrabajador),
                nombres: nombres,
                apellidoPaterno: apellidoPaterno,
                apellidoMaterno: apellidoMaterno,
                fechaNacimiento: new Date(employeeData.fechaNacimiento),
                sexo: employeeData.genero === 'M' ? 'MASCULINO' : employeeData.genero === 'F' ? 'FEMENINO' : null,
                estadoCivil: employeeData.estadocivil === 'S' ? 'SOLTERO' : 'CASADO',
                rfc: employeeData.rfc.toUpperCase(),
                curp: employeeData.curp.toUpperCase(),
                nss: employeeData.nss
              }
            });

            // Crear WorkerAddress
            if (employeeData.calle || employeeData.codigoPostal) {
              await tx.workerAddress.create({
                data: {
                  workerDetailsId: workerDetails.id,
                  correoElectronico: employeeData.email,
                  telefonoCelular: employeeData.telefono || '0000000000',
                  codigoPostal: employeeData.codigoPostal,
                  pais: 'México',
                  entidadFederativa: employeeData.estado || '',
                  municipioAlcaldia: employeeData.municipioAlcaldia || '',
                  colonia: employeeData.colonia,
                  calle: employeeData.calle,
                  numeroExterior: employeeData.numeroExterior,
                  numeroInterior: employeeData.numeroInterior
                }
              });
            }

            // Obtener ID del puesto si existe
            let puestoId = null;
            let areaId = null;
            let departamentoId = null;
            
            if (employeeData.puesto) {
              const puesto = await tx.puesto.findFirst({
                where: {
                  empresaId: parseInt(companyId),
                  nombre: employeeData.puesto,
                  activo: true
                }
              });
              
              if (puesto) {
                puestoId = puesto.id;
                areaId = puesto.areaId;
                departamentoId = puesto.departamentoId;
              }
            }

            // Crear WorkerContractCondition
            await tx.workerContractCondition.create({
              data: {
                workerDetailsId: workerDetails.id,
                positionId: puestoId,
                areaId: areaId,
                departmentId: departamentoId,
                sucursal: employeeData.sucursal || 'MATRIZ',
                regimenContratacion: employeeData.regimenContratacion || 'SUELDOS',
                zonaGeografica: employeeData.zonaGeografica || 'RESTO_PAIS',
                tipoSalario: employeeData.tipoSalario || 'FIJO',
                fechaIngreso: new Date(employeeData.fechaIngreso),
                fechaAntiguedad: employeeData.fechaAntiguedad ? new Date(employeeData.fechaAntiguedad) : new Date(employeeData.fechaIngreso),
                salarioDiario: parseFloat(employeeData.salarioDiario),
                sueldoBaseCotizacion: parseFloat(employeeData.sueldoBaseCotizacion || employeeData.salarioDiario),
                registroPatronal: employeeData.registroPatronal || '',
                claseRiesgo: employeeData.claseRiesgoIMSS || 'CLASE_II',
                tipoContrato: employeeData.tipoContrato ? mapTipoContrato(employeeData.tipoContrato) : 'TIEMPO_INDETERMINADO',
                tipoTrabajador: employeeData.tipoTrabajador || 'CONFIANZA',
                situacionContractual: employeeData.situacionContractual || 'PERMANENTE',
                duracionContrato: employeeData.duracionContrato ? parseInt(employeeData.duracionContrato) : null,
                calendarioNomina: employeeData.calendario || 'QUINCENAL',
                tipoJornada: employeeData.tipoJornada || 'DIURNA',
                modalidadTrabajo: employeeData.modalidadTrabajo || 'PRESENCIAL',
                presentaDeclaracionAnual: employeeData.presentaDeclaracionAnual === 'SI'
              }
            });

            // Crear WorkerPaymentData
            if (employeeData.metodoPagoNomina) {
              await tx.workerPaymentData.create({
                data: {
                  workerDetailsId: workerDetails.id,
                  metodoPago: employeeData.metodoPagoNomina === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'EFECTIVO',
                  institucionFinanciera: employeeData.institucionFinancieraNomina,
                  cuentaBancaria: employeeData.cuentaBancariaNomina,
                  cuentaClabe: employeeData.clabeNomina,
                  numeroTarjeta: employeeData.tarjetaNomina
                }
              });
            }

            // Procesar créditos Infonavit
            if (employeeData.aplicaCreditoInfonavit === 'SI' && employeeData.numeroCreditoInfonavit) {
              await tx.workerInfonavitCredit.create({
                data: {
                  workerDetailsId: workerDetails.id,
                  numeroCredito: employeeData.numeroCreditoInfonavit,
                  tipoDescuento: employeeData.tipoDescuentoInfonavit || 'PORCENTAJE',
                  valor: parseFloat(employeeData.montoDescuentoInfonavit || '0'),
                  fechaInicio: employeeData.fechaInicioInfonavit ? new Date(employeeData.fechaInicioInfonavit) : new Date(),
                  fechaTermino: employeeData.fechaTerminoInfonavit ? new Date(employeeData.fechaTerminoInfonavit) : null
                }
              });
            }

            // Procesar créditos Fonacot
            if (employeeData.aplicaCreditofonacot === 'SI' && employeeData.numeroCreditoFonacot) {
              await tx.workerFonacotCredit.create({
                data: {
                  workerDetailsId: workerDetails.id,
                  numeroCredito: employeeData.numeroCreditoFonacot,
                  tipoDescuento: 'PORCENTAJE',
                  valor: parseFloat(employeeData.retencionMensualFonacot || '0'),
                  fechaInicio: employeeData.fechaInicioFonacot ? new Date(employeeData.fechaInicioFonacot) : new Date(),
                  fechaTermino: employeeData.fechaTerminoFonacot ? new Date(employeeData.fechaTerminoFonacot) : null
                }
              });
            }

            // Procesar pensión alimenticia
            if (employeeData.aplicaPensionAlimenticia === 'SI' && employeeData.numeroJuicioPension) {
              await tx.workerAlimony.create({
                data: {
                  workerDetailsId: workerDetails.id,
                  numeroJuicio: employeeData.numeroJuicioPension,
                  tipoDescuento: employeeData.tipoDescuentoPension || 'PORCENTAJE',
                  valor: parseFloat(employeeData.valorDescuentoPension || '0'),
                  fechaInicio: employeeData.fechaInicioPension ? new Date(employeeData.fechaInicioPension) : new Date(),
                  nombreBeneficiario: employeeData.nombreBeneficiarioPension,
                  formaPago: employeeData.formaPagoPension || 'TRANSFERENCIA',
                  institucionFinanciera: employeeData.institucionFinancieraPension,
                  cuentaBancaria: employeeData.cuentaBancariaPension,
                  cuentaClabe: employeeData.clabePension,
                  numeroTarjeta: employeeData.tarjetaPension
                }
              });
            }
            
            // Crear usuario para el empleado
            if (employeeData.email) {
              try {
                // Verificar si el email ya existe
                const existingUser = await tx.user.findUnique({
                  where: { email: employeeData.email.toLowerCase() }
                });
                
                if (!existingUser) {
                  // Generar un password temporal aleatorio
                  
                  await tx.user.create({
                    data: {
                      email: employeeData.email.toLowerCase(),
                      password: '',
                      role: 'EMPLOYEE',
                      companyId: parseInt(companyId),
                      workerDetailsId: workerDetails.id,
                      phone: employeeData.telefono || null,
                      isActive: false
                    }
                  });
                  
                  // Nota: En un sistema real, aquí deberías enviar un email al empleado
                  // con su contraseña temporal e instrucciones para cambiarla
                  // Por ahora, el usuario puede usar "Olvidé mi contraseña" para establecer una nueva
                }
              } catch (userError) {
                // Si hay un error al crear el usuario (por ejemplo, email duplicado),
                // continuar sin crear el usuario pero el empleado sí se crea
                logger.warn(`No se pudo crear usuario para empleado ${fullName}: ${userError}`);
              }
            }
            
            // Retornar el empleado creado si todo salió bien
            return { workerDetails, fullName };
          });

          // Si la transacción fue exitosa, agregar a resultados exitosos
          results.success.push({
            row: i + 1,
            employeeNumber: employeeData.numeroEmpleado || '',
            name: result.fullName
          });

        } catch (error) {
          logger.error(`Error creating employee row ${i + 1}:`, error);
          
          // Log adicional para debugging
          if (error instanceof Error) {
            logger.error(`Error details: ${error.message}`);
            logger.error(`Error stack: ${error.stack}`);
          }
          
          // Traducir el error a un mensaje amigable
          const friendlyError = translatePrismaError(error);
          
          results.errors.push({
            row: i + 1,
            employeeNumber: employees[i].numeroEmpleado || employees[i].numeroTrabajador || '',
            error: friendlyError.message
          });
        }
      }

      // Determinar si el proceso fue exitoso o no
      const hasErrors = results.errors.length > 0;
      const allFailed = results.success.length === 0 && results.errors.length > 0;
      
      res.status(hasErrors ? (allFailed ? 400 : 207) : 200).json({
        success: !allFailed,
        message: `Proceso completado. ${results.success.length} empleados creados, ${results.errors.length} errores`,
        data: results
      });

    } catch (error) {
      logger.error('Error in bulk employee creation:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la carga masiva de empleados'
      });
    }
  },

  // Crear un solo trabajador con todos sus datos relacionados
  async createSingleWorker(req: Request, res: Response) {
    try {
      const data = req.body;
      
      const result = await prisma.$transaction(async (tx) => {
        // Crear WorkerDetails
        const worker = await tx.workerDetails.create({
          data: {
            companyId: data.companyId,
            numeroTrabajador: data.numeroTrabajador,
            nombres: data.nombres,
            apellidoPaterno: data.apellidoPaterno,
            apellidoMaterno: data.apellidoMaterno,
            fechaNacimiento: new Date(data.fechaNacimiento),
            sexo: data.sexo,
            nacionalidad: data.nacionalidad,
            estadoCivil: data.estadoCivil,
            rfc: data.rfc,
            curp: data.curp,
            nss: data.nss,
            umf: data.umf
          }
        });

        // Crear dirección si se proporciona
        if (data.address) {
          await tx.workerAddress.create({
            data: {
              workerDetailsId: worker.id,
              correoElectronico: data.address.correoElectronico,
              telefonoCelular: data.address.telefonoCelular,
              codigoPostal: data.address.codigoPostal,
              pais: data.address.pais,
              entidadFederativa: data.address.entidadFederativa,
              municipioAlcaldia: data.address.municipioAlcaldia,
              colonia: data.address.colonia,
              calle: data.address.calle,
              numeroExterior: data.address.numeroExterior,
              numeroInterior: data.address.numeroInterior
            }
          });
        }

        // Crear condiciones contractuales si se proporcionan
        if (data.contractConditions) {
          // Validar relación área-departamento-puesto
          if (data.contractConditions.areaId && data.contractConditions.departmentId) {
            const department = await tx.departamento.findUnique({
              where: { id: data.contractConditions.departmentId }
            });
            
            if (department && department.areaId && department.areaId !== data.contractConditions.areaId) {
              throw new Error('El departamento seleccionado no pertenece al área especificada');
            }
          }
          
          if (data.contractConditions.positionId) {
            const position = await tx.puesto.findUnique({
              where: { id: data.contractConditions.positionId }
            });
            
            if (position) {
              if (position.areaId && data.contractConditions.areaId && position.areaId !== data.contractConditions.areaId) {
                throw new Error('El puesto seleccionado no pertenece al área especificada');
              }
              if (position.departamentoId && data.contractConditions.departmentId && position.departamentoId !== data.contractConditions.departmentId) {
                throw new Error('El puesto seleccionado no pertenece al departamento especificado');
              }
            }
          }

          await tx.workerContractCondition.create({
            data: {
              workerDetailsId: worker.id,
              sucursal: data.contractConditions.sucursal || 'MATRIZ',
              areaId: data.contractConditions.areaId,
              departmentId: data.contractConditions.departmentId,
              positionId: data.contractConditions.positionId,
              regimenContratacion: data.contractConditions.regimenContratacion,
              zonaGeografica: data.contractConditions.zonaGeografica,
              tipoSalario: data.contractConditions.tipoSalario,
              fechaIngreso: new Date(data.contractConditions.fechaIngreso),
              fechaAntiguedad: new Date(data.contractConditions.fechaAntiguedad),
              salarioDiario: data.contractConditions.salarioDiario,
              sueldoBaseCotizacion: data.contractConditions.sueldoBaseCotizacion,
              registroPatronal: data.contractConditions.registroPatronal,
              claseRiesgo: data.contractConditions.claseRiesgo,
              tipoContrato: data.contractConditions.tipoContrato,
              tipoTrabajador: data.contractConditions.tipoTrabajador,
              situacionContractual: data.contractConditions.situacionContractual,
              duracionContrato: data.contractConditions.duracionContrato,
              calendarioNomina: data.contractConditions.calendarioNomina,
              tipoJornada: data.contractConditions.tipoJornada,
              horarioId: data.contractConditions.horarioId,
              modalidadTrabajo: data.contractConditions.modalidadTrabajo,
              observacion: data.contractConditions.observacion,
              presentaDeclaracionAnual: data.contractConditions.presentaDeclaracionAnual
            }
          });
        }

        // Crear datos de pago si se proporcionan
        if (data.paymentData) {
          await tx.workerPaymentData.create({
            data: {
              workerDetailsId: worker.id,
              metodoPago: data.paymentData.metodoPago,
              institucionFinanciera: data.paymentData.institucionFinanciera,
              cuentaBancaria: data.paymentData.cuentaBancaria,
              cuentaClabe: data.paymentData.cuentaClabe,
              numeroTarjeta: data.paymentData.numeroTarjeta
            }
          });
        }

        // Crear usuario automáticamente si hay email
        if (data.address?.correoElectronico) {
          try {
            // Verificar si el email ya existe
            const existingUser = await tx.user.findUnique({
              where: { email: data.address.correoElectronico.toLowerCase() }
            });
            
            if (!existingUser) {
              await tx.user.create({
                data: {
                  email: data.address.correoElectronico.toLowerCase(),
                  password: '',
                  role: 'EMPLOYEE',
                  companyId: data.companyId,
                  workerDetailsId: worker.id,
                  phone: data.address.telefonoCelular || null,
                  isActive: false
                }
              });

              // Enviar email con credenciales si se configuró el servicio de email
              if (process.env.EMAIL_SERVICE_ENABLED === 'true') {
                await sendEmail({
                  to: data.address.correoElectronico,
                  subject: 'Bienvenido al Portal de Empleados',
                  html: `
                    <h2>Bienvenido ${data.nombres}</h2>
                    <p>Se ha creado tu cuenta en el portal de empleados.</p>
                    <p>Tus credenciales de acceso son:</p>
                    <ul>
                      <li><strong>Email:</strong> ${data.address.correoElectronico}</li>
                    </ul>
                    <p>Por favor cambia tu contraseña al iniciar sesión por primera vez.</p>
                  `
                });
              }
            }
          } catch (userError) {
            logger.warn(`No se pudo crear usuario para trabajador ${data.nombres}: ${userError}`);
          }
        }

        return worker;
      });

      res.status(201).json({
        success: true,
        message: 'Trabajador creado exitosamente',
        data: result
      });
    } catch (error) {
      logger.error('Error creating single worker:', error);
      const translatedError = translatePrismaError(error);
      res.status(400).json({
        success: false,
        message: translatedError.message,
        code: translatedError.code
      });
    }
  },

  // Enviar invitación al portal
  async sendPortalInvitation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const worker = await prisma.workerDetails.findUnique({
        where: { id: parseInt(id) },
        include: {
          address: true,
          user: true
        }
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Trabajador no encontrado'
        });
      }

      if (!worker.address?.correoElectronico) {
        return res.status(400).json({
          success: false,
          message: 'El trabajador no tiene correo electrónico registrado'
        });
      }

      // Si el usuario ya existe y está activo, no permitir reenvío
      if (worker.user && worker.user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'El trabajador ya tiene una cuenta activa'
        });
      }
      
      // Si ya se envió una invitación pero el usuario no está activo, permitir reenvío
      if (worker.invitationSentAt && (!worker.user || !worker.user.isActive)) {
        logger.info(`Reenviando invitación para trabajador ${worker.id}`);
      }

      // Generar token de invitación
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 72); // 72 horas de validez

      await prisma.invitationToken.create({
        data: {
          token,
          email: worker.address.correoElectronico,
          companyId: worker.companyId,
          expiresAt,
          metadata: {
            name: `${worker.nombres} ${worker.apellidoPaterno} ${worker.apellidoMaterno || ''}`.trim(),
            workerDetailsId: worker.id,
            type: 'employee_portal',
            role: "EMPLOYEE"
          }
        }
      });

      // Enviar email
      const invitationUrl = `${process.env.FRONTEND_URL}/setup-account?token=${token}`;
      
      // Obtener el nombre de la empresa
      const company = await prisma.company.findUnique({
        where: { id: worker.companyId },
        select: { legalName: true }
      });

      // Usar el nuevo template de email para empleados
      const { emailService } = await import('../services/emailService');
      await emailService.sendEmployeePortalInvitationEmail(
        worker.address.correoElectronico,
        `${worker.nombres} ${worker.apellidoPaterno} ${worker.apellidoMaterno || ''}`.trim(),
        company?.legalName || 'Tu Empresa',
        invitationUrl
      );

      // Actualizar el estado de invitación enviada
      await prisma.workerDetails.update({
        where: { id: worker.id },
        data: { invitationSentAt: true }
      });

      res.json({
        success: true,
        message: 'Invitación enviada exitosamente'
      });
    } catch (error) {
      logger.error('Error sending portal invitation:', error);
      res.status(500).json({
        success: false,
        message: 'Error al enviar invitación'
      });
    }
  },

  // Subir foto del trabajador
  async uploadPhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const worker = await prisma.workerDetails.findUnique({
        where: { id: parseInt(id) },
        include: { user: true }
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Trabajador no encontrado'
        });
      }

      // Construir URL de la foto
      const photoUrl = `/resources/photos/${req.file.filename}`;

      // Actualizar el usuario asociado si existe
      if (worker.user) {
        await prisma.user.update({
          where: { id: worker.user.id },
          data: { photoUrl }
        });
      }

      res.json({
        success: true,
        message: 'Foto subida exitosamente',
        data: { photoUrl }
      });
    } catch (error) {
      logger.error('Error uploading photo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir foto'
      });
    }
  },

  // Eliminar foto del trabajador
  async deletePhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const worker = await prisma.workerDetails.findUnique({
        where: { id: parseInt(id) },
        include: { user: true }
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Trabajador no encontrado'
        });
      }

      // Eliminar foto del usuario asociado si existe
      if (worker.user && worker.user.photoUrl) {
        const filePath = path.join(__dirname, '../../public', worker.user.photoUrl);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        await prisma.user.update({
          where: { id: worker.user.id },
          data: { photoUrl: null }
        });
      }

      res.json({
        success: true,
        message: 'Foto eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error deleting photo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar foto'
      });
    }
  },

  // Obtener departamentos por área
  async getDepartmentsByArea(req: Request, res: Response) {
    try {
      const { companyId, areaId } = req.params;
      
      const departments = await prisma.departamento.findMany({
        where: {
          empresaId: parseInt(companyId),
          areaId: areaId ? parseInt(areaId) : undefined,
          activo: true
        },
        select: {
          id: true,
          nombre: true,
          descripcion: true
        },
        orderBy: { nombre: 'asc' }
      });

      res.json({
        success: true,
        data: departments
      });
    } catch (error) {
      logger.error('Error fetching departments:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener departamentos'
      });
    }
  },

  // Obtener puestos por área y/o departamento
  async getPositions(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { areaId, departmentId } = req.query;
      
      const where: any = {
        empresaId: parseInt(companyId),
        activo: true
      };

      if (areaId) {
        where.areaId = parseInt(areaId as string);
      }

      if (departmentId) {
        where.departamentoId = parseInt(departmentId as string);
      }

      const positions = await prisma.puesto.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          areaId: true,
          departamentoId: true
        },
        orderBy: { nombre: 'asc' }
      });

      res.json({
        success: true,
        data: positions
      });
    } catch (error) {
      logger.error('Error fetching positions:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener puestos'
      });
    }
  },

  // Generar plantilla de empleados con catálogos
  async getEmployeeTemplate(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      // Crear libro de Excel
      const workbook = new ExcelJS.Workbook();
      
      // Hoja de instrucciones (primera hoja)
      const instructionSheet = workbook.addWorksheet('Instrucciones');
      instructionSheet.getCell('A1').value = 'INSTRUCCIONES PARA EL LLENADO DE LA PLANTILLA';
      instructionSheet.getCell('A1').font = { bold: true, size: 16 };
      
      const instructions = [
        '',
        'CAMPOS OBLIGATORIOS:',
        '- numeroEmpleado: Solo dígitos numéricos',
        '- nombres, primerApellido: Nombre(s) y apellido del empleado',
        '- rfc: RFC válido (ejemplo: PEGA800101XXX)',
        '- curp: CURP válido de 18 caracteres',
        '- nss: Número de Seguridad Social (11 dígitos)',
        '- fechaNacimiento: Formato YYYY-MM-DD',
        '- genero: M, F u O',
        '- estadocivil: S o C',
        '- email: Correo electrónico válido',
        '- codigoPostal: 5 dígitos',
        '- puesto: Debe especificarse siempre',
        '- fechaIngreso: Formato YYYY-MM-DD',
        '- salarioDiario: Número decimal',
        '',
        'VALIDACIONES DE CAMPOS:',
        '- Número de empleado: Solo dígitos',
        '- Teléfono: Entre 10 y 15 dígitos',
        '- Código postal: Exactamente 5 dígitos',
        '- Género: M (Masculino), F (Femenino), O (Otro)',
        '- Estado civil: S (Soltero), C (Casado)',
        '- Tipo de contrato: Consulte la hoja "Catálogo_TipoContrato"',
        '- Tipo trabajador: Consulte la hoja "Catálogo_TipoTrabajador"',
        '- Situación contractual: Consulte la hoja "Catálogo_SituacionContractual"',
        '- Calendario: Consulte la hoja "Catálogo_Calendarios"',
        '- Tipo jornada: Consulte la hoja "Catálogo_TipoJornada"',
        '- Modalidad trabajo: Consulte la hoja "Catálogo_ModalidadTrabajo"',
        '- Zona geográfica: Consulte la hoja "Catálogo_ZonaGeografica"',
        '- Tipo salario: Consulte la hoja "Catálogo_TipoSalario"',
        '- Régimen contratación: Consulte la hoja "Catálogo_RegimenContratacion"',
        '- Registro patronal: Número de registro patronal (texto libre)',
        '- Clase riesgo IMSS: CLASE_I, CLASE_II, CLASE_III, CLASE_IV, CLASE_V',
        '- Presenta declaración anual: SI, NO',
        '- Método pago nómina: TRANSFERENCIA, EFECTIVO, CHEQUE',
        '',
        'CAMPOS DE CRÉDITOS Y DESCUENTOS:',
        '- aplicaCreditoInfonavit: SI o NO',
        '- tipoDescuentoInfonavit: PORCENTAJE, VSM, MONTO',
        '- aplicaCreditofonacot: SI o NO',
        '- aplicaPensionAlimenticia: SI o NO',
        '- tipoDescuentoPension: PORCENTAJE, MONTO',
        '- formaPagoPension: TRANSFERENCIA, EFECTIVO, CHEQUE',
        '',
        'FECHAS:',
        '- Todas las fechas deben estar en formato YYYY-MM-DD',
        '- fechaAntiguedad: Si no se especifica, se usará la fecha de ingreso',
        '- sueldoBaseCotizacion: Si no se especifica, se usará el salario diario',
        '',
        'CATÁLOGOS:',
        '- Área: Consulte la hoja "Catálogo_Areas"',
        '- Departamento: Consulte la hoja "Catálogo_Departamentos"',
        '- Puesto: Consulte la hoja "Catálogo_Puestos"',
        '- Modalidad de trabajo: Consulte la hoja "Catálogo_ModalidadTrabajo"',
        '- Tipo de jornada: Consulte la hoja "Catálogo_TipoJornada"',
        '- Situación contractual: Consulte la hoja "Catálogo_SituacionContractual"',
        '- Tipo de trabajador: Consulte la hoja "Catálogo_TipoTrabajador"',
        '- Tipo de salario: Consulte la hoja "Catálogo_TipoSalario"',
        '- Zona geográfica: Consulte la hoja "Catálogo_ZonaGeografica"',
        '- Tipo de contrato: Consulte la hoja "Catálogo_TipoContrato"',
        '- Régimen de contratación: Consulte la hoja "Catálogo_RegimenContratacion"',
        '',
        'IMPORTANTE:',
        '- No modifique los nombres de las columnas en la hoja "Empleados"',
        '- Los campos vacíos pueden dejarse en blanco',
        '- Para campos de SI/NO, use exactamente "SI" o "NO" en mayúsculas',
        '- Los montos deben ser números sin símbolos de moneda'
      ];
      
      instructions.forEach((instruction, index) => {
        instructionSheet.getCell(`A${index + 3}`).value = instruction;
        if (instruction.startsWith('CAMPOS OBLIGATORIOS:') || 
            instruction.startsWith('VALIDACIONES DE CAMPOS:') || 
            instruction.startsWith('CAMPOS DE CRÉDITOS Y DESCUENTOS:') ||
            instruction.startsWith('FECHAS:') ||
            instruction.startsWith('CATÁLOGOS:') ||
            instruction.startsWith('IMPORTANTE:')) {
          instructionSheet.getCell(`A${index + 3}`).font = { bold: true };
        }
      });
      
      instructionSheet.getColumn('A').width = 80;
      
      // Hoja de empleados (segunda hoja)
      const employeeSheet = workbook.addWorksheet('Empleados');
      
      // Definir columnas completas
      const columns = [
        { header: 'numeroEmpleado', key: 'numeroEmpleado', width: 18 },
        { header: 'nombres', key: 'nombres', width: 20 },
        { header: 'primerApellido', key: 'primerApellido', width: 20 },
        { header: 'segundoApellido', key: 'segundoApellido', width: 20 },
        { header: 'rfc', key: 'rfc', width: 15 },
        { header: 'curp', key: 'curp', width: 20 },
        { header: 'nss', key: 'nss', width: 15 },
        { header: 'fechaNacimiento', key: 'fechaNacimiento', width: 18 },
        { header: 'genero', key: 'genero', width: 10 },
        { header: 'estadocivil', key: 'estadocivil', width: 15 },
        { header: 'email', key: 'email', width: 25 },
        { header: 'telefono', key: 'telefono', width: 15 },
        { header: 'calle', key: 'calle', width: 25 },
        { header: 'numeroExterior', key: 'numeroExterior', width: 15 },
        { header: 'numeroInterior', key: 'numeroInterior', width: 15 },
        { header: 'colonia', key: 'colonia', width: 20 },
        { header: 'municipioAlcaldia', key: 'municipioAlcaldia', width: 20 },
        { header: 'estado', key: 'estado', width: 15 },
        { header: 'codigoPostal', key: 'codigoPostal', width: 12 },
        { header: 'area', key: 'area', width: 20 },
        { header: 'departamento', key: 'departamento', width: 20 },
        { header: 'puesto', key: 'puesto', width: 20 },
        { header: 'sucursal', key: 'sucursal', width: 20 },
        { header: 'fechaIngreso', key: 'fechaIngreso', width: 18 },
        { header: 'fechaAntiguedad', key: 'fechaAntiguedad', width: 18 },
        { header: 'salarioDiario', key: 'salarioDiario', width: 15 },
        { header: 'sueldoBaseCotizacion', key: 'sueldoBaseCotizacion', width: 20 },
        { header: 'tipoContrato', key: 'tipoContrato', width: 18 },
        { header: 'tipoTrabajador', key: 'tipoTrabajador', width: 18 },
        { header: 'situacionContractual', key: 'situacionContractual', width: 22 },
        { header: 'duracionContrato', key: 'duracionContrato', width: 18 },
        { header: 'calendario', key: 'calendario', width: 15 },
        { header: 'tipoJornada', key: 'tipoJornada', width: 15 },
        { header: 'modalidadTrabajo', key: 'modalidadTrabajo', width: 20 },
        { header: 'horario', key: 'horario', width: 15 },
        { header: 'regimenContratacion', key: 'regimenContratacion', width: 22 },
        { header: 'zonaGeografica', key: 'zonaGeografica', width: 18 },
        { header: 'tipoSalario', key: 'tipoSalario', width: 15 },
        { header: 'registroPatronal', key: 'registroPatronal', width: 18 },
        { header: 'claseRiesgoIMSS', key: 'claseRiesgoIMSS', width: 18 },
        { header: 'presentaDeclaracionAnual', key: 'presentaDeclaracionAnual', width: 25 },
        { header: 'metodoPagoNomina', key: 'metodoPagoNomina', width: 20 },
        { header: 'institucionFinancieraNomina', key: 'institucionFinancieraNomina', width: 28 },
        { header: 'cuentaBancariaNomina', key: 'cuentaBancariaNomina', width: 22 },
        { header: 'clabeNomina', key: 'clabeNomina', width: 20 },
        { header: 'tarjetaNomina', key: 'tarjetaNomina', width: 18 },
        { header: 'aplicaCreditoInfonavit', key: 'aplicaCreditoInfonavit', width: 22 },
        { header: 'numeroCreditoInfonavit', key: 'numeroCreditoInfonavit', width: 22 },
        { header: 'tipoDescuentoInfonavit', key: 'tipoDescuentoInfonavit', width: 22 },
        { header: 'montoDescuentoInfonavit', key: 'montoDescuentoInfonavit', width: 24 },
        { header: 'fechaInicioInfonavit', key: 'fechaInicioInfonavit', width: 20 },
        { header: 'fechaTerminoInfonavit', key: 'fechaTerminoInfonavit', width: 22 },
        { header: 'aplicaCreditofonacot', key: 'aplicaCreditofonacot', width: 20 },
        { header: 'numeroCreditoFonacot', key: 'numeroCreditoFonacot', width: 20 },
        { header: 'retencionMensualFonacot', key: 'retencionMensualFonacot', width: 24 },
        { header: 'fechaInicioFonacot', key: 'fechaInicioFonacot', width: 20 },
        { header: 'fechaTerminoFonacot', key: 'fechaTerminoFonacot', width: 20 },
        { header: 'aplicaPensionAlimenticia', key: 'aplicaPensionAlimenticia', width: 24 },
        { header: 'numeroJuicioPension', key: 'numeroJuicioPension', width: 20 },
        { header: 'tipoDescuentoPension', key: 'tipoDescuentoPension', width: 22 },
        { header: 'valorDescuentoPension', key: 'valorDescuentoPension', width: 22 },
        { header: 'fechaInicioPension', key: 'fechaInicioPension', width: 20 },
        { header: 'nombreBeneficiarioPension', key: 'nombreBeneficiarioPension', width: 26 },
        { header: 'formaPagoPension', key: 'formaPagoPension', width: 18 },
        { header: 'institucionFinancieraPension', key: 'institucionFinancieraPension', width: 28 },
        { header: 'cuentaBancariaPension', key: 'cuentaBancariaPension', width: 22 },
        { header: 'clabePension', key: 'clabePension', width: 18 },
        { header: 'tarjetaPension', key: 'tarjetaPension', width: 18 }
      ];
      
      employeeSheet.columns = columns;
      
      // Agregar estilos a los encabezados
      employeeSheet.getRow(1).font = { bold: true };
      employeeSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      employeeSheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      
      // Agregar fila de ejemplo
      employeeSheet.addRow({
        numeroEmpleado: '001',
        nombres: 'Juan',
        primerApellido: 'Pérez',
        segundoApellido: 'García',
        rfc: 'PEGA800101XXX',
        curp: 'PEGA800101HDFXXX01',
        nss: '12345678901',
        fechaNacimiento: '1980-01-01',
        genero: 'M',
        estadocivil: 'S',
        email: 'juan.perez@empresa.com',
        telefono: '5512345678',
        calle: 'Av. Principal',
        numeroExterior: '123',
        numeroInterior: 'A',
        colonia: 'Centro',
        municipioAlcaldia: 'Benito Juárez',
        estado: 'CDMX',
        codigoPostal: '01234',
        area: 'Administración',
        departamento: 'Recursos Humanos',
        puesto: 'Analista',
        sucursal: 'Matriz',
        fechaIngreso: '2024-01-15',
        fechaAntiguedad: '2024-01-15',
        salarioDiario: '500',
        sueldoBaseCotizacion: '500',
        tipoContrato: 'INDEFINIDO',
        tipoTrabajador: 'CONFIANZA',
        situacionContractual: 'PERMANENTE',
        duracionContrato: '',
        calendario: '',
        tipoJornada: 'DIURNA',
        modalidadTrabajo: 'PRESENCIAL',
        horario: '09:00-18:00',
        regimenContratacion: 'SUELDOS',
        zonaGeografica: 'RESTO_PAIS',
        tipoSalario: 'FIJO',
        registroPatronal: '',
        claseRiesgoIMSS: 'CLASE_III',
        presentaDeclaracionAnual: 'NO',
        metodoPagoNomina: 'TRANSFERENCIA',
        institucionFinancieraNomina: 'BBVA',
        cuentaBancariaNomina: '1234567890',
        clabeNomina: '012180012345678901',
        tarjetaNomina: '',
        aplicaCreditoInfonavit: 'NO',
        numeroCreditoInfonavit: '',
        tipoDescuentoInfonavit: '',
        montoDescuentoInfonavit: '',
        fechaInicioInfonavit: '',
        fechaTerminoInfonavit: '',
        aplicaCreditofonacot: 'NO',
        numeroCreditoFonacot: '',
        retencionMensualFonacot: '',
        fechaInicioFonacot: '',
        fechaTerminoFonacot: '',
        aplicaPensionAlimenticia: 'NO',
        numeroJuicioPension: '',
        tipoDescuentoPension: '',
        valorDescuentoPension: '',
        fechaInicioPension: '',
        nombreBeneficiarioPension: '',
        formaPagoPension: '',
        institucionFinancieraPension: '',
        cuentaBancariaPension: '',
        clabePension: '',
        tarjetaPension: ''
      });
      
      // Obtener todos los catálogos necesarios
      const [
        areas,
        departments,
        positions,
        payrollCalendars,
        modalidadTrabajo,
        tipoJornada,
        situacionContractual,
        tipoTrabajador,
        tipoSalario,
        zonaGeografica,
        tipoContrato,
        regimenContratacion
      ] = await Promise.all([
        // Catálogos de la empresa
        prisma.area.findMany({
          where: { empresaId: parseInt(companyId), activo: true },
          select: { id: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.departamento.findMany({
          where: { empresaId: parseInt(companyId), activo: true },
          select: { id: true, nombre: true, areaId: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.puesto.findMany({
          where: { empresaId: parseInt(companyId), activo: true },
          select: { id: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        // Calendarios de nómina de la empresa
        prisma.payrollCalendar.findMany({
          where: { companyId: parseInt(companyId) },
          select: { id: true, name: true, payFrequency: true },
          orderBy: { name: 'asc' }
        }),
        // Catálogos generales
        prisma.catalogoModalidadTrabajo.findMany({
          where: { activo: true },
          select: { codigo: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.catalogoTipoJornada.findMany({
          where: { activo: true },
          select: { codigo: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.catalogoSituacionContractual.findMany({
          where: { activo: true },
          select: { codigo: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.catalogoTipoTrabajador.findMany({
          where: { activo: true },
          select: { codigo: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.catalogoTipoSalario.findMany({
          where: { activo: true },
          select: { codigo: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.catalogoZonaGeografica.findMany({
          where: { activo: true },
          select: { codigo: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.catalogoTipoContrato.findMany({
          where: { activo: true },
          select: { codigo: true, nombre: true },
          orderBy: { nombre: 'asc' }
        }),
        prisma.catalogoRegimenContratacion.findMany({
          where: { activo: true },
          select: { codigo: true, nombre: true },
          orderBy: { nombre: 'asc' }
        })
      ]);
      
      // Crear hojas de catálogos
      const catalogos = [
        { nombre: 'Catálogo_ModalidadTrabajo', datos: modalidadTrabajo },
        { nombre: 'Catálogo_TipoJornada', datos: tipoJornada },
        { nombre: 'Catálogo_SituacionContractual', datos: situacionContractual },
        { nombre: 'Catálogo_TipoTrabajador', datos: tipoTrabajador },
        { nombre: 'Catálogo_TipoSalario', datos: tipoSalario },
        { nombre: 'Catálogo_ZonaGeografica', datos: zonaGeografica },
        { nombre: 'Catálogo_TipoContrato', datos: tipoContrato },
        { nombre: 'Catálogo_RegimenContratacion', datos: regimenContratacion }
      ];

      // Crear hoja para cada catálogo
      catalogos.forEach(catalogo => {
        const catalogSheet = workbook.addWorksheet(catalogo.nombre);
        
        // Encabezados
        catalogSheet.getCell('A1').value = 'Código';
        catalogSheet.getCell('B1').value = 'Nombre';
        catalogSheet.getRow(1).font = { bold: true };
        catalogSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        
        // Datos
        catalogo.datos.forEach((item, index) => {
          catalogSheet.getCell(`A${index + 2}`).value = item.codigo;
          catalogSheet.getCell(`B${index + 2}`).value = item.nombre;
        });
        
        // Ajustar anchos
        catalogSheet.getColumn('A').width = 30;
        catalogSheet.getColumn('B').width = 50;
      });

      // Hoja de catálogo de Áreas
      const areasSheet = workbook.addWorksheet('Catálogo_Areas');
      areasSheet.getCell('A1').value = 'ID';
      areasSheet.getCell('B1').value = 'Nombre';
      areasSheet.getRow(1).font = { bold: true };
      areasSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      areas.forEach((area, index) => {
        areasSheet.getCell(`A${index + 2}`).value = area.id;
        areasSheet.getCell(`B${index + 2}`).value = area.nombre;
      });
      
      areasSheet.getColumn('A').width = 15;
      areasSheet.getColumn('B').width = 40;
      
      // Hoja de catálogo de Departamentos
      const departmentsSheet = workbook.addWorksheet('Catálogo_Departamentos');
      departmentsSheet.getCell('A1').value = 'ID';
      departmentsSheet.getCell('B1').value = 'Nombre';
      departmentsSheet.getRow(1).font = { bold: true };
      departmentsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      departments.forEach((dept, index) => {
        departmentsSheet.getCell(`A${index + 2}`).value = dept.id;
        departmentsSheet.getCell(`B${index + 2}`).value = dept.nombre;
      });
      
      departmentsSheet.getColumn('A').width = 15;
      departmentsSheet.getColumn('B').width = 40;
      
      // Hoja de catálogo de Puestos
      const positionsSheet = workbook.addWorksheet('Catálogo_Puestos');
      positionsSheet.getCell('A1').value = 'ID';
      positionsSheet.getCell('B1').value = 'Nombre';
      positionsSheet.getRow(1).font = { bold: true };
      positionsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      positions.forEach((position, index) => {
        positionsSheet.getCell(`A${index + 2}`).value = position.id;
        positionsSheet.getCell(`B${index + 2}`).value = position.nombre;
      });
      
      positionsSheet.getColumn('A').width = 15;
      positionsSheet.getColumn('B').width = 40;
      
      // Hoja de catálogo de Calendarios
      const calendarsSheet = workbook.addWorksheet('Catálogo_Calendarios');
      calendarsSheet.getCell('A1').value = 'ID';
      calendarsSheet.getCell('B1').value = 'Nombre';
      calendarsSheet.getCell('C1').value = 'Frecuencia';
      calendarsSheet.getRow(1).font = { bold: true };
      calendarsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      payrollCalendars.forEach((calendar, index) => {
        calendarsSheet.getCell(`A${index + 2}`).value = calendar.id;
        calendarsSheet.getCell(`B${index + 2}`).value = calendar.name;
        calendarsSheet.getCell(`C${index + 2}`).value = calendar.payFrequency;
      });
      
      calendarsSheet.getColumn('A').width = 15;
      calendarsSheet.getColumn('B').width = 40;
      calendarsSheet.getColumn('C').width = 20;

      // Configurar validaciones dropdown en la hoja de empleados
      const totalRows = 1000; // Número de filas para aplicar validaciones
      
      // Validación para género
      for (let row = 2; row <= totalRows; row++) {
        employeeSheet.getCell(`I${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"M,F,O"']
        };
      }
      
      // Validación para estado civil
      for (let row = 2; row <= totalRows; row++) {
        employeeSheet.getCell(`J${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"S,C"']
        };
      }
      
      // Validación para área (columna T)
      if (areas.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`T${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_Areas'!$B$2:$B$${areas.length + 1}`]
          };
        }
      }
      
      // Validación para departamento (columna U)
      if (departments.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`U${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_Departamentos'!$B$2:$B$${departments.length + 1}`]
          };
        }
      }
      
      // Validación para puesto (columna V)
      if (positions.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`V${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_Puestos'!$B$2:$B$${positions.length + 1}`]
          };
        }
      }
      
      // Validación para calendario (usando calendarios de la empresa)
      if (payrollCalendars.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AF${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_Calendarios'!$B$2:$B$${payrollCalendars.length + 1}`]
          };
        }
      }
      
      // Validación para modalidad de trabajo
      if (modalidadTrabajo.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AH${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_ModalidadTrabajo'!$A$2:$A$${modalidadTrabajo.length + 1}`]
          };
        }
      }
      
      // Validación para tipo de jornada
      if (tipoJornada.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AG${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_TipoJornada'!$A$2:$A$${tipoJornada.length + 1}`]
          };
        }
      }
      
      // Validación para situación contractual
      if (situacionContractual.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AD${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_SituacionContractual'!$A$2:$A$${situacionContractual.length + 1}`]
          };
        }
      }
      
      // Validación para tipo de trabajador
      if (tipoTrabajador.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AC${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_TipoTrabajador'!$A$2:$A$${tipoTrabajador.length + 1}`]
          };
        }
      }
      
      // Validación para tipo de salario
      if (tipoSalario.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AL${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_TipoSalario'!$A$2:$A$${tipoSalario.length + 1}`]
          };
        }
      }
      
      // Validación para zona geográfica
      if (zonaGeografica.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AK${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_ZonaGeografica'!$A$2:$A$${zonaGeografica.length + 1}`]
          };
        }
      }
      
      // Validación para tipo de contrato
      if (tipoContrato.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AB${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_TipoContrato'!$A$2:$A$${tipoContrato.length + 1}`]
          };
        }
      }
      
      // Validación para régimen de contratación
      if (regimenContratacion.length > 0) {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`AJ${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Catálogo_RegimenContratacion'!$A$2:$A$${regimenContratacion.length + 1}`]
          };
        }
      }
      
      // Columna AM (registroPatronal) - NO es dropdown, es texto libre
      // No aplicar validación aquí
      
      // Validación para clase de riesgo IMSS (columna AN)
      for (let row = 2; row <= totalRows; row++) {
        employeeSheet.getCell(`AN${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"CLASE_I,CLASE_II,CLASE_III,CLASE_IV,CLASE_V"']
        };
      }
      
      // Columna AO (presentaDeclaracionAnual) - validación SI/NO
      for (let row = 2; row <= totalRows; row++) {
        employeeSheet.getCell(`AO${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"SI,NO"']
        };
      }
      
      // Validación para método de pago nómina (columna AP)
      for (let row = 2; row <= totalRows; row++) {
        employeeSheet.getCell(`AP${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"TRANSFERENCIA,EFECTIVO,CHEQUE"']
        };
      }
      
      // Validaciones para créditos SI/NO
      const siNoColumns = ['AT', 'AZ', 'BF']; // aplicaCreditoInfonavit, aplicaCreditofonacot, aplicaPensionAlimenticia
      siNoColumns.forEach(col => {
        for (let row = 2; row <= totalRows; row++) {
          employeeSheet.getCell(`${col}${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"SI,NO"']
          };
        }
      });
      
      // Validación para tipo descuento Infonavit
      for (let row = 2; row <= totalRows; row++) {
        employeeSheet.getCell(`AV${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"PORCENTAJE,VSM,MONTO"']
        };
      }
      
      // Validación para tipo descuento pensión
      for (let row = 2; row <= totalRows; row++) {
        employeeSheet.getCell(`BH${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"PORCENTAJE,MONTO"']
        };
      }
      
      // Validación para forma pago pensión
      for (let row = 2; row <= totalRows; row++) {
        employeeSheet.getCell(`BL${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"TRANSFERENCIA,EFECTIVO,CHEQUE"']
        };
      }
      
      // Configurar respuesta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla_empleados_con_catalogos.xlsx');
      
      // Enviar archivo
      await workbook.xlsx.write(res);
      res.end();
      
    } catch (error) {
      logger.error('Error generating employee template:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar plantilla de empleados'
      });
    }
  }
};