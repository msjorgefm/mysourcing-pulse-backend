import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { validateEmployee } from '../middleware/validation';
import { translatePrismaError } from '../utils/errorTranslator';

const prisma = new PrismaClient();

export const employeeController = {
  // Obtener todos los empleados
  async getAllEmployees(req: Request, res: Response) {
    try {
      const employees = await prisma.employee.findMany({
        include: {
          company: true,
          incidences: true
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: employees,
        count: employees.length
      });
    } catch (error) {
      logger.error('Error fetching all employees:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener empleados'
      });
    }
  },

  // Obtener todos los empleados de una empresa
  async getEmployeesByCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      const employees = await prisma.employee.findMany({
        where: { companyId: parseInt(companyId) },
        include: {
          company: true,
          incidences: true
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: employees,
        count: employees.length
      });
    } catch (error) {
      logger.error('Error fetching employees by company:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener empleados de la empresa'
      });
    }
  },

  // Obtener un empleado por ID
  async getEmployeeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(id) },
        include: {
          company: true,
          incidences: {
            orderBy: { date: 'desc' }
          }
        }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado'
        });
      }

      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      logger.error('Error fetching employee by id:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener empleado'
      });
    }
  },

  // Crear un nuevo empleado
  async createEmployee(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const employeeData = req.body;

      // Validar datos del empleado
      const validation = validateEmployee(employeeData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        });
      }

      const employee = await prisma.employee.create({
        data: {
          ...employeeData,
          companyId: parseInt(companyId),
          hireDate: new Date(employeeData.hireDate),
          dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth) : null
        },
        include: {
          company: true
        }
      });

      res.status(201).json({
        success: true,
        data: employee,
        message: 'Empleado creado exitosamente'
      });
    } catch (error) {
      logger.error('Error creating employee:', error);
      
      // Traducir el error a un mensaje amigable
      const friendlyError = translatePrismaError(error);
      
      res.status(500).json({
        success: false,
        message: friendlyError
      });
    }
  },

  // Actualizar un empleado
  async updateEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const employeeData = req.body;

      const employee = await prisma.employee.update({
        where: { id: parseInt(id) },
        data: {
          ...employeeData,
          hireDate: employeeData.hireDate ? new Date(employeeData.hireDate) : undefined,
          dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth) : undefined
        },
        include: {
          company: true
        }
      });

      res.json({
        success: true,
        data: employee,
        message: 'Empleado actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error updating employee:', error);
      
      // Traducir el error a un mensaje amigable
      const friendlyError = translatePrismaError(error);
      
      res.status(500).json({
        success: false,
        message: friendlyError
      });
    }
  },

  // Eliminar un empleado
  async deleteEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar que el empleado existe
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(id) }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado'
        });
      }

      // Usar transacción para eliminar el empleado y todos sus registros relacionados
      await prisma.$transaction(async (tx) => {
        // Primero obtener el workerDetails asociado
        const workerDetails = await tx.workerDetails.findFirst({
          where: { employeeId: parseInt(id) }
        });

        if (workerDetails) {
          // Eliminar todos los registros relacionados con workerDetails
          await tx.workerAlimony.deleteMany({
            where: { workerDetailsId: workerDetails.id }
          });
          
          await tx.workerFonacotCredit.deleteMany({
            where: { workerDetailsId: workerDetails.id }
          });
          
          await tx.workerInfonavitCredit.deleteMany({
            where: { workerDetailsId: workerDetails.id }
          });
          
          await tx.workerPaymentData.deleteMany({
            where: { workerDetailsId: workerDetails.id }
          });
          
          await tx.workerContractCondition.deleteMany({
            where: { workerDetailsId: workerDetails.id }
          });
          
          await tx.workerAddress.deleteMany({
            where: { workerDetailsId: workerDetails.id }
          });
          
          // Eliminar workerDetails
          await tx.workerDetails.delete({
            where: { id: workerDetails.id }
          });
        }

        // Eliminar incidencias del empleado
        await tx.incidence.deleteMany({
          where: { employeeId: parseInt(id) }
        });

        // Finalmente eliminar el empleado
        await tx.employee.delete({
          where: { id: parseInt(id) }
        });
      });

      res.json({
        success: true,
        message: 'Empleado eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error deleting employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar empleado'
      });
    }
  },

  // Validar empleados antes de guardar
  async validateBulkEmployees(req: Request, res: Response) {
    try {
      const { employees } = req.body;

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
      employees.forEach((emp, index) => {
        if (emp.numeroEmpleado) {
          if (!employeeNumbers.has(emp.numeroEmpleado)) {
            employeeNumbers.set(emp.numeroEmpleado, []);
          }
          employeeNumbers.get(emp.numeroEmpleado)!.push(index + 1);
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
          { field: 'salarioDiario', name: 'Salario diario' }
        ];

        for (const { field, name } of requiredFields) {
          if (!employee[field] || employee[field] === '') {
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
            validValues: ['INDEFINITE', 'FIXED_TERM', 'PART_TIME', 'CONTRACTOR', 'INTERN'],
            errorMsg: 'Tipo de contrato inválido'
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
          if (employee[field] && !validValues.includes(employee[field])) {
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
          const existingRFC = await prisma.employee.findFirst({
            where: { rfc: employee.rfc.toUpperCase() }
          });
          if (existingRFC) {
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
            where: { curp: employee.curp.toUpperCase() }
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

        if (employee.numeroEmpleado) {
          const existingEmployee = await prisma.employee.findFirst({
            where: { 
              employeeNumber: String(employee.numeroEmpleado),
              companyId: parseInt(req.params.companyId)
            }
          });
          if (existingEmployee) {
            validationResults.errors.push({
              row,
              field: 'numeroEmpleado',
              error: 'El número de empleado ya existe en esta empresa'
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

  // Crear empleados masivamente
  async createBulkEmployees(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { employees } = req.body;

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
            // Crear el empleado principal
            const employee = await tx.employee.create({
              data: {
                companyId: parseInt(companyId),
                employeeNumber: employeeData.numeroEmpleado,
                name: `${employeeData.nombres} ${employeeData.primerApellido} ${employeeData.segundoApellido || ''}`.trim(),
                email: employeeData.email,
                rfc: employeeData.rfc,
                position: employeeData.puesto,
                department: employeeData.departamento || 'Sin departamento',
                hireDate: new Date(employeeData.fechaIngreso),
                contractType: employeeData.tipoContrato || 'INDEFINITE',
                workSchedule: employeeData.horario,
                baseSalary: parseFloat(employeeData.salarioDiario),
                dateOfBirth: employeeData.fechaNacimiento ? new Date(employeeData.fechaNacimiento) : null,
                address: `${employeeData.calle || ''} ${employeeData.numeroExterior || ''} ${employeeData.numeroInterior || ''} ${employeeData.colonia || ''}`.trim(),
                phone: employeeData.telefono,
                bankName: employeeData.institucionFinancieraNomina,
                bankAccount: employeeData.cuentaBancariaNomina,
                clabe: employeeData.clabeNomina,
                taxRegime: employeeData.regimenContratacion
              }
            });

            // Crear WorkerDetails
            const workerDetails = await tx.workerDetails.create({
              data: {
                employeeId: employee.id,
                companyId: parseInt(companyId),
                numeroTrabajador: parseInt(employeeData.numeroEmpleado),
                nombres: employeeData.nombres,
                apellidoPaterno: employeeData.primerApellido,
                apellidoMaterno: employeeData.segundoApellido,
                fechaNacimiento: new Date(employeeData.fechaNacimiento),
                sexo: employeeData.genero === 'M' ? 'MASCULINO' : employeeData.genero === 'F' ? 'FEMENINO' : null,
                estadoCivil: employeeData.estadocivil === 'S' ? 'SOLTERO' : 'CASADO',
                rfc: employeeData.rfc,
                curp: employeeData.curp,
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

            // Crear WorkerContractCondition
            await tx.workerContractCondition.create({
              data: {
                workerDetailsId: workerDetails.id,
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
                tipoContrato: (() => {
                  // Mapear ContractType a TipoContrato
                  const contractTypeMap: Record<string, string> = {
                    'INDEFINITE': 'TIEMPO_INDETERMINADO',
                    'FIXED_TERM': 'OBRA_TIEMPO_DETERMINADO',
                    'PART_TIME': 'TIEMPO_INDETERMINADO', // No hay equivalente directo
                    'CONTRACTOR': 'OBRA_TIEMPO_DETERMINADO',
                    'INTERN': 'PRACTICAS_PROFESIONALES'
                  };
                  return contractTypeMap[employeeData.tipoContrato] || employeeData.tipoContrato || 'TIEMPO_INDETERMINADO';
                })(),
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
                  tipoDescuento: employeeData.tipoDescuentoPension || 'MONTO',
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
            
            // Retornar el empleado creado si todo salió bien
            return employee;
          });

          // Si la transacción fue exitosa, agregar a resultados exitosos
          results.success.push({
            row: i + 1,
            employeeNumber: employeeData.numeroEmpleado,
            name: result.name
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
            employeeNumber: employees[i].numeroEmpleado,
            error: friendlyError
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
  }
};