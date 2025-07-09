// prisma/seed-empresa-completa.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { faker } = require('@faker-js/faker/locale/es_MX');

// Configurar la semilla para obtener datos consistentes
faker.seed(98765); // Semilla diferente al seed principal

// Función principal de seed
async function main() {
  console.log('🌱 Iniciando seed adicional para empresa completa...');

  // ================================
  // 1. Crear empresa
  // ================================
  console.log('🏢 Creando empresa adicional...');
  const company = await prisma.company.create({
    data: {
      name: 'Servicios Profesionales del Centro',
      rfc: 'SPC210530RK2',
      legalName: 'Servicios Profesionales del Centro S.A. de C.V.',
      address: 'Blvd. Insurgentes 789, Col. Centro, Querétaro',
      email: 'contacto@servicioscentro.com.mx',
      phone: '44 2367 8901',
      status: 'IN_SETUP',
      paymentMethod: 'TRANSFERENCIA',
      bankAccount: '987654321098765432',
      taxRegime: '601',
      employeesCount: 10
    }
  });
  
  console.log(`✅ Empresa adicional creada con ID: ${company.id}`);

  // ================================
  // 2. Crear wizard status
  // ================================
  console.log('🧙‍♂️ Inicializando wizard de configuración...');
  const wizardStatus = await prisma.wizardStatus.create({
    data: {
      companyId: company.id,
      currentSection: 1,
      currentStep: 1,
      isCompleted: false,
      startedAt: new Date(),
      sectionProgress: {
        create: [
          // Sección 1: Datos Generales
          {
            sectionNumber: 1,
            name: 'Datos Generales',
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
            steps: {
              create: [
                {
                  stepNumber: 1,
                  name: 'Información Fiscal',
                  status: 'COMPLETED',
                  startedAt: new Date(),
                  completedAt: new Date(),
                  data: {
                    fiscalName: company.legalName,
                    rfc: company.rfc,
                    fiscalAddress: company.address
                  }
                }
              ]
            }
          },
          // Sección 2: Obligaciones
          {
            sectionNumber: 2,
            name: 'Obligaciones',
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
            steps: {
              create: [
                {
                  stepNumber: 1,
                  name: 'Registro Patronal',
                  status: 'COMPLETED',
                  startedAt: new Date(),
                  completedAt: new Date(),
                  data: {
                    registroPatronal: 'Y9876543210',
                    claseRiesgo: 'CLASE_II'
                  }
                },
                {
                  stepNumber: 2,
                  name: 'Obligaciones Fiscales',
                  status: 'COMPLETED',
                  startedAt: new Date(),
                  completedAt: new Date(),
                  data: {
                    regimenFiscal: '601',
                    obligaciones: ['ISR', 'IVA', 'IMSS']
                  }
                }
              ]
            }
          },
          // Sección 3: Bancos
          {
            sectionNumber: 3,
            name: 'Bancos',
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
            steps: {
              create: [
                {
                  stepNumber: 1,
                  name: 'Tipos de Bancos',
                  status: 'COMPLETED',
                  startedAt: new Date(),
                  completedAt: new Date(),
                  data: {
                    banks: ['HSBC', 'Scotiabank', 'Banamex']
                  }
                }
              ]
            }
          },
          // Sección 4: Sellos Digitales
          {
            sectionNumber: 4,
            name: 'Sellos Digitales',
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
            steps: {
              create: [
                {
                  stepNumber: 1,
                  name: 'Certificados Digitales',
                  status: 'COMPLETED',
                  startedAt: new Date(),
                  completedAt: new Date(),
                  data: {
                    certificateFile: 'certificado_spc.cer',
                    keyFile: 'llave_privada_spc.key',
                    certificatePassword: '********'
                  }
                }
              ]
            }
          },
          // Sección 5: Estructura Organizacional (completaremos luego)
          {
            sectionNumber: 5,
            name: 'Estructura Organizacional',
            status: 'PENDING',
            steps: {
              create: [
                {
                  stepNumber: 1,
                  name: 'Areas',
                  status: 'PENDING'
                },
                {
                  stepNumber: 2,
                  name: 'Departamentos',
                  status: 'PENDING'
                },
                {
                  stepNumber: 3,
                  name: 'Puestos',
                  status: 'PENDING'
                }
              ]
            }
          },
          // Sección 6: Prestaciones
          {
            sectionNumber: 6,
            name: 'Prestaciones',
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
            steps: {
              create: [
                {
                  stepNumber: 1,
                  name: 'Prestaciones de Ley',
                  status: 'COMPLETED',
                  startedAt: new Date(),
                  completedAt: new Date(),
                  data: {
                    aguinaldo: 16,
                    vacaciones: true,
                    primavacacional: 30
                  }
                },
                {
                  stepNumber: 2,
                  name: 'Gestión de Grupo de Prestaciones',
                  status: 'COMPLETED',
                  startedAt: new Date(),
                  completedAt: new Date(),
                  data: {
                    gruposPrestaciones: [
                      { nombre: 'Directivos', diasVacaciones: 14, primaVacacional: 30, diasAguinaldo: 25 },
                      { nombre: 'Generales', diasVacaciones: 8, primaVacacional: 30, diasAguinaldo: 18 }
                    ]
                  }
                }
              ]
            }
          },
          // Sección 7: Nómina
          {
            sectionNumber: 7,
            name: 'Nómina',
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
            steps: {
              create: [
                {
                  stepNumber: 1,
                  name: 'Calendario',
                  status: 'COMPLETED',
                  startedAt: new Date(),
                  completedAt: new Date(),
                  data: {
                    periodos: 'Semanal',
                    diasPago: [5],
                    diasFestivos: ['2024-01-01', '2024-02-05', '2024-03-18', '2024-09-16']
                  }
                }
              ]
            }
          },
          // Sección 8: Talento Humano (completaremos luego)
          {
            sectionNumber: 8,
            name: 'Talento Humano',
            status: 'PENDING',
            steps: {
              create: [
                {
                  stepNumber: 1,
                  name: 'Horarios',
                  status: 'PENDING'
                },
                {
                  stepNumber: 2,
                  name: 'Alta Trabajadores',
                  status: 'PENDING'
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log(`✅ Wizard inicializado para la empresa adicional`);

  // ================================
  // 3. Crear áreas (3)
  // ================================
  console.log('🏢 Creando estructura organizacional - Áreas...');
  
  const areas = await Promise.all([
    prisma.organizationalArea.create({
      data: {
        name: 'Dirección',
        description: 'Área de dirección y gestión estratégica',
        companyId: company.id
      }
    }),
    prisma.organizationalArea.create({
      data: {
        name: 'Servicios',
        description: 'Área de prestación de servicios profesionales',
        companyId: company.id
      }
    }),
    prisma.organizationalArea.create({
      data: {
        name: 'Soporte',
        description: 'Área de apoyo y soporte interno',
        companyId: company.id
      }
    })
  ]);

  console.log(`✅ Creadas ${areas.length} áreas`);

  // ================================
  // 4. Crear departamentos (4)
  // ================================
  console.log('🏢 Creando estructura organizacional - Departamentos...');
  
  const departamentos = await Promise.all([
    // Departamentos del área de Dirección
    prisma.organizationalDepartment.create({
      data: {
        name: 'Dirección General',
        description: 'Dirección estratégica',
        areaId: areas[0].id,
        companyId: company.id
      }
    }),
    // Departamentos del área de Servicios
    prisma.organizationalDepartment.create({
      data: {
        name: 'Consultoría',
        description: 'Servicios de consultoría profesional',
        areaId: areas[1].id,
        companyId: company.id
      }
    }),
    prisma.organizationalDepartment.create({
      data: {
        name: 'Capacitación',
        description: 'Servicios de capacitación y entrenamiento',
        areaId: areas[1].id,
        companyId: company.id
      }
    }),
    // Departamentos del área de Soporte
    prisma.organizationalDepartment.create({
      data: {
        name: 'Administración',
        description: 'Servicios administrativos internos',
        areaId: areas[2].id,
        companyId: company.id
      }
    })
  ]);

  console.log(`✅ Creados ${departamentos.length} departamentos`);

  // ================================
  // 5. Crear puestos (5)
  // ================================
  console.log('🏢 Creando estructura organizacional - Puestos...');
  
  const puestos = await Promise.all([
    // Puestos del departamento de Dirección General
    prisma.organizationalPosition.create({
      data: {
        name: 'Director General',
        description: 'Dirección estratégica de la empresa',
        baseSalary: 45000.00,
        hierarchyLevel: 'Directivo',
        departmentId: departamentos[0].id,
        companyId: company.id
      }
    }),
    // Puestos del departamento de Consultoría
    prisma.organizationalPosition.create({
      data: {
        name: 'Consultor Senior',
        description: 'Consultoría especializada para clientes',
        baseSalary: 30000.00,
        hierarchyLevel: 'Medio',
        departmentId: departamentos[1].id,
        companyId: company.id
      }
    }),
    prisma.organizationalPosition.create({
      data: {
        name: 'Consultor Junior',
        description: 'Apoyo en servicios de consultoría',
        baseSalary: 18000.00,
        hierarchyLevel: 'Operativo',
        departmentId: departamentos[1].id,
        companyId: company.id
      }
    }),
    // Puestos del departamento de Capacitación
    prisma.organizationalPosition.create({
      data: {
        name: 'Instructor',
        description: 'Impartición de cursos y talleres',
        baseSalary: 22000.00,
        hierarchyLevel: 'Medio',
        departmentId: departamentos[2].id,
        companyId: company.id
      }
    }),
    // Puestos del departamento de Administración
    prisma.organizationalPosition.create({
      data: {
        name: 'Asistente Administrativo',
        description: 'Apoyo en tareas administrativas',
        baseSalary: 14000.00,
        hierarchyLevel: 'Operativo',
        departmentId: departamentos[3].id,
        companyId: company.id
      }
    })
  ]);

  console.log(`✅ Creados ${puestos.length} puestos`);

  // ================================
  // 6. Actualizar estado del wizard para estructura organizacional
  // ================================
  console.log('🧙‍♂️ Actualizando estado del wizard para estructura organizacional...');
  
  await prisma.sectionProgress.update({
    where: {
      id: (await prisma.sectionProgress.findFirst({
        where: { 
          wizardStatusId: wizardStatus.id,
          sectionNumber: 5
        }
      })).id
    },
    data: {
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date(),
      steps: {
        updateMany: {
          where: {},
          data: {
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date()
          }
        }
      }
    }
  });

  // ================================
  // 7. Crear horarios de trabajo
  // ================================
  console.log('🕒 Creando horarios de trabajo...');
  
  const horarios = await Promise.all([
    prisma.workSchedule.create({
      data: {
        name: 'Horario Estándar',
        startTime: '08:30',
        endTime: '17:30',
        workDays: [1, 2, 3, 4, 5], // Lunes a viernes
        breakHours: 1,
        companyId: company.id
      }
    }),
    prisma.workSchedule.create({
      data: {
        name: 'Horario Flexible',
        startTime: '07:00',
        endTime: '15:00',
        workDays: [1, 2, 3, 4, 5], // Lunes a viernes
        breakHours: 0,
        companyId: company.id
      }
    }),
    prisma.workSchedule.create({
      data: {
        name: 'Horario Fin de Semana',
        startTime: '09:00',
        endTime: '14:00',
        workDays: [6, 0], // Sábado y domingo
        breakHours: 0,
        companyId: company.id
      }
    })
  ]);

  console.log(`✅ Creados ${horarios.length} horarios`);

  // ================================
  // 8. Actualizar estado del wizard para horarios
  // ================================
  console.log('🧙‍♂️ Actualizando estado del wizard para horarios...');
  
  await prisma.stepProgress.update({
    where: {
      id: (await prisma.stepProgress.findFirst({
        where: {
          sectionProgressId: (await prisma.sectionProgress.findFirst({
            where: { 
              wizardStatusId: wizardStatus.id,
              sectionNumber: 8
            }
          })).id,
          stepNumber: 1
        }
      })).id
    },
    data: {
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date(),
      data: {
        horarios: horarios.map(h => h.id)
      }
    }
  });

  // ================================
  // 9. Crear calendario de nómina
  // ================================
  console.log('📅 Creando calendario de nómina...');
  
  const calendario = await prisma.calendar.create({
    data: {
      name: 'Calendario Laboral 2024',
      year: 2024,
      workDays: [1, 2, 3, 4, 5], // Lunes a viernes
      holidays: [
        { date: '2024-01-01', name: 'Año Nuevo' },
        { date: '2024-02-05', name: 'Día de la Constitución' },
        { date: '2024-03-18', name: 'Natalicio de Benito Juárez' },
        { date: '2024-05-01', name: 'Día del Trabajo' },
        { date: '2024-09-16', name: 'Día de la Independencia' },
        { date: '2024-11-20', name: 'Revolución Mexicana' },
        { date: '2024-12-12', name: 'Día de la Virgen de Guadalupe' },
        { date: '2024-12-25', name: 'Navidad' }
      ],
      isDefault: true,
      companyId: company.id
    }
  });

  console.log(`✅ Creado calendario de nómina`);

  // ================================
  // 10. Crear 10 trabajadores
  // ================================
  console.log('👥 Creando trabajadores...');

  // Función para generar un RFC mexicano válido
  function generateRFC() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let rfc = '';
    // 4 letras iniciales
    for (let i = 0; i < 4; i++) {
      rfc += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // 6 dígitos (fecha)
    const year = (Math.floor(Math.random() * 40) + 60).toString().padStart(2, '0'); // 60-99
    const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0'); // 01-12
    const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'); // 01-28
    
    rfc += year + month + day;
    
    // 3 caracteres alfanuméricos para homoclave
    for (let i = 0; i < 3; i++) {
      const chars = letters + numbers;
      rfc += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return rfc;
  }

  // Función para generar un CURP mexicano válido
  function generateCURP() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    const numbers = '0123456789';
    const states = ['AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH', 'DF', 'DG', 'GT', 'GR', 'HG', 'JC', 'MC', 'MN', 'MS', 'NT', 'NL', 'OC', 'PL', 'QT', 'QR', 'SP', 'SL', 'SR', 'TC', 'TS', 'TL', 'VZ', 'YN', 'ZS'];
    
    let curp = '';
    
    // 4 letras iniciales (como en RFC)
    for (let i = 0; i < 4; i++) {
      curp += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // 6 dígitos (fecha)
    const year = (Math.floor(Math.random() * 40) + 60).toString().padStart(2, '0'); // 60-99
    const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0'); // 01-12
    const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'); // 01-28
    
    curp += year + month + day;
    
    // Sexo (H o M)
    curp += Math.random() > 0.5 ? 'H' : 'M';
    
    // Estado (2 letras)
    curp += states[Math.floor(Math.random() * states.length)];
    
    // 3 consonantes
    for (let i = 0; i < 3; i++) {
      curp += consonants.charAt(Math.floor(Math.random() * consonants.length));
    }
    
    // Caracter alfanumérico
    curp += (Math.random() > 0.5 ? numbers : letters).charAt(Math.floor(Math.random() * (Math.random() > 0.5 ? numbers : letters).length));
    
    // Dígito
    curp += Math.floor(Math.random() * 10);
    
    return curp;
  }

  // Función para generar un NSS mexicano válido
  function generateNSS() {
    let nss = '';
    for (let i = 0; i < 11; i++) {
      nss += Math.floor(Math.random() * 10);
    }
    return nss;
  }

  // Función para crear un trabajador
  async function createWorker(index, positionIndex, departmentIndex, areaIndex) {
    const workerNumber = index + 1;
    const firstName = faker.person.firstName();
    const lastName1 = faker.person.lastName();
    const lastName2 = faker.person.lastName();
    
    // Crear empleado con un número diferente para evitar conflictos
    const employeeNumber = `SPC${workerNumber.toString().padStart(3, '0')}`;
    
    // Crear empleado
    const employee = await prisma.employee.create({
      data: {
        employeeNumber: employeeNumber,
        name: `${firstName} ${lastName1} ${lastName2}`,
        email: faker.internet.email({firstName, lastName: lastName1}).toLowerCase(),
        rfc: generateRFC(),
        position: puestos[positionIndex].name,
        department: departamentos[departmentIndex].name,
        status: 'ACTIVE',
        hireDate: faker.date.past({years: 3}),
        contractType: 'INDEFINITE',
        workSchedule: horarios[Math.floor(Math.random() * horarios.length)].name,
        baseSalary: puestos[positionIndex].baseSalary,
        dateOfBirth: faker.date.birthdate({min: 20, max: 60, mode: 'age'}),
        address: faker.location.streetAddress(),
        phone: faker.phone.number('##########'),
        emergencyContact: `${faker.person.fullName()}: ${faker.phone.number()}`,
        bankName: ['HSBC', 'Scotiabank', 'Banamex'][Math.floor(Math.random() * 3)],
        bankAccount: faker.finance.accountNumber(),
        clabe: faker.finance.accountNumber(18),
        taxRegime: '605',
        companyId: company.id
      }
    });
    
    // Crear detalles del trabajador
    const workerDetails = await prisma.workerDetails.create({
      data: {
        employeeId: employee.id,
        companyId: company.id,
        numeroTrabajador: workerNumber + 100, // Sumamos 100 para evitar conflictos
        nombres: firstName,
        apellidoPaterno: lastName1,
        apellidoMaterno: lastName2,
        fechaNacimiento: employee.dateOfBirth,
        sexo: Math.random() > 0.5 ? 'MASCULINO' : 'FEMENINO',
        nacionalidad: 'MEXICANA',
        estadoCivil: ['SOLTERO', 'CASADO', 'DIVORCIADO', 'UNION_LIBRE'][Math.floor(Math.random() * 4)],
        rfc: employee.rfc,
        curp: generateCURP(),
        nss: generateNSS(),
        umf: Math.floor(Math.random() * 100) + 1,
        fotografia: null
      }
    });
    
    // Crear domicilio
    await prisma.workerAddress.create({
      data: {
        workerDetailsId: workerDetails.id,
        correoElectronico: employee.email,
        telefonoCelular: employee.phone.substring(0, 10),
        codigoPostal: faker.location.zipCode('#####'),
        pais: 'México',
        entidadFederativa: faker.location.state(),
        municipioAlcaldia: faker.location.city(),
        colonia: faker.location.street(),
        calle: faker.location.street(),
        numeroExterior: faker.location.buildingNumber(),
        numeroInterior: Math.random() > 0.5 ? faker.location.buildingNumber() : null
      }
    });
    
    // Crear condiciones de contratación
    await prisma.workerContractCondition.create({
      data: {
        workerDetailsId: workerDetails.id,
        sucursal: 'MATRIZ',
        areaId: areas[areaIndex].id,
        departmentId: departamentos[departmentIndex].id,
        positionId: puestos[positionIndex].id,
        regimenContratacion: 'SUELDOS',
        zonaGeografica: 'RESTO_PAIS',
        tipoSalario: 'FIJO',
        fechaIngreso: employee.hireDate,
        fechaAntiguedad: employee.hireDate,
        salarioDiario: employee.baseSalary / 30,
        sueldoBaseCotizacion: employee.baseSalary / 30,
        registroPatronal: 'Y9876543210',
        claseRiesgo: 'CLASE_II',
        tipoContrato: 'TIEMPO_INDETERMINADO',
        tipoTrabajador: puestos[positionIndex].hierarchyLevel === 'Operativo' ? 'PRACTICANTE' : 'CONFIANZA',
        situacionContractual: 'PERMANENTE',
        calendarioNomina: calendario.name,
        tipoJornada: 'DIURNA',
        horarioId: horarios[Math.floor(Math.random() * horarios.length)].id,
        modalidadTrabajo: 'PRESENCIAL',
        presentaDeclaracionAnual: Math.random() > 0.5
      }
    });
    
    // Crear datos de pago
    await prisma.workerPaymentData.create({
      data: {
        workerDetailsId: workerDetails.id,
        metodoPago: 'TRANSFERENCIA',
        institucionFinanciera: employee.bankName,
        cuentaBancaria: employee.bankAccount,
        cuentaClabe: employee.clabe,
        numeroTarjeta: faker.finance.creditCardNumber('################')
      }
    });
    
    // Crear familiares (0-2 por trabajador)
    const numFamiliares = Math.floor(Math.random() * 3);
    for (let i = 0; i < numFamiliares; i++) {
      const parentescos = ['ESPOSA', 'ESPOSO', 'HIJA', 'HIJO', 'MADRE', 'PADRE'];
      const parentesco = parentescos[Math.floor(Math.random() * parentescos.length)];
      
      await prisma.workerFamilyMember.create({
        data: {
          workerDetailsId: workerDetails.id,
          nombreCompleto: faker.person.fullName(),
          parentesco: parentesco,
          tipoDocumento: parentesco === 'ESPOSA' || parentesco === 'ESPOSO' ? 'ACTA_MATRIMONIO' : 
                        (parentesco === 'HIJA' || parentesco === 'HIJO' ? 'ACTA_NACIMIENTO' : 'INE'),
          documentoUrl: null
        }
      });
    }
    
    // Algunos trabajadores con créditos INFONAVIT (30% de probabilidad)
    if (Math.random() < 0.3) {
      await prisma.workerInfonavitCredit.create({
        data: {
          workerDetailsId: workerDetails.id,
          numeroCredito: faker.finance.accountNumber(),
          tipoDescuento: 'PORCENTAJE',
          valor: parseFloat((Math.random() * 15 + 5).toFixed(2)),
          fechaInicio: faker.date.past({years: 2}),
          fechaTermino: faker.date.future({years: 10})
        }
      });
    }
    
    // Algunos trabajadores con documentos (80% de probabilidad)
    if (Math.random() < 0.8) {
      const documentTypes = [
        'IDENTIFICACION_OFICIAL',
        'COMPROBANTE_DOMICILIO',
        'CURP',
        'RFC'
      ];
      
      const randomDocType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      
      await prisma.workerDocument.create({
        data: {
          workerDetailsId: workerDetails.id,
          tipoDocumento: randomDocType,
          documentoUrl: `documentos/${employee.employeeNumber}/${randomDocType.toLowerCase()}.pdf`,
          fechaModificacion: new Date()
        }
      });
    }
    
    return employee;
  }

  // Distribución de trabajadores por puesto
  const distributions = [
    { position: 0, department: 0, area: 0 }, // Director General - Dirección General - Dirección
    { position: 1, department: 1, area: 1 }, // Consultor Senior - Consultoría - Servicios
    { position: 1, department: 1, area: 1 }, // Consultor Senior - Consultoría - Servicios
    { position: 2, department: 1, area: 1 }, // Consultor Junior - Consultoría - Servicios
    { position: 2, department: 1, area: 1 }, // Consultor Junior - Consultoría - Servicios
    { position: 3, department: 2, area: 1 }, // Instructor - Capacitación - Servicios
    { position: 3, department: 2, area: 1 }, // Instructor - Capacitación - Servicios
    { position: 3, department: 2, area: 1 }, // Instructor - Capacitación - Servicios
    { position: 4, department: 3, area: 2 }, // Asistente Administrativo - Administración - Soporte
    { position: 4, department: 3, area: 2 }  // Asistente Administrativo - Administración - Soporte
  ];

  // Crear los 10 trabajadores
  const trabajadores = [];
  for (let i = 0; i < 10; i++) {
    const dist = distributions[i];
    const trabajador = await createWorker(i, dist.position, dist.department, dist.area);
    trabajadores.push(trabajador);
  }

  console.log(`✅ Creados ${trabajadores.length} trabajadores`);

  // ================================
  // 11. Actualizar estado del wizard para alta de trabajadores
  // ================================
  console.log('🧙‍♂️ Actualizando estado del wizard para alta de trabajadores...');
  
  await prisma.stepProgress.update({
    where: {
      id: (await prisma.stepProgress.findFirst({
        where: {
          sectionProgressId: (await prisma.sectionProgress.findFirst({
            where: { 
              wizardStatusId: wizardStatus.id,
              sectionNumber: 8
            }
          })).id,
          stepNumber: 2
        }
      })).id
    },
    data: {
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date(),
      data: {
        trabajadoresCount: trabajadores.length
      }
    }
  });

  // Actualizar sección completa
  await prisma.sectionProgress.update({
    where: {
      id: (await prisma.sectionProgress.findFirst({
        where: { 
          wizardStatusId: wizardStatus.id,
          sectionNumber: 8
        }
      })).id
    },
    data: {
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date()
    }
  });

  // ================================
  // 12. Finalizar el wizard
  // ================================
  console.log('🧙‍♂️ Finalizando wizard de configuración...');
  
  await prisma.wizardStatus.update({
    where: { id: wizardStatus.id },
    data: {
      isCompleted: true,
      completedAt: new Date()
    }
  });

  // Actualizar estado de la empresa
  await prisma.company.update({
    where: { id: company.id },
    data: {
      status: 'ACTIVE'
    }
  });

  console.log('✅ Wizard completado con éxito!');
  console.log('✅ Seed adicional ejecutado correctamente!');
  
  // Resumen
  console.log('\n📊 Resumen:');
  console.log(`- Empresa Adicional: ${company.name} (${company.rfc})`);
  console.log(`- Áreas: ${areas.length}`);
  console.log(`- Departamentos: ${departamentos.length}`);
  console.log(`- Puestos: ${puestos.length}`);
  console.log(`- Horarios: ${horarios.length}`);
  console.log(`- Trabajadores: ${trabajadores.length}`);
  console.log(`- Estado del wizard: Completado`);
}

// Ejecutar el seed
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });