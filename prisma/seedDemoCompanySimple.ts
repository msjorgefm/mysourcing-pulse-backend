import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de empresa demo...');

  // 1. Crear operador (si no existe)
  const operatorEmail = 'operador@mysourcing.com';
  let operator = await prisma.user.findUnique({
    where: { email: operatorEmail }
  });

  if (!operator) {
    operator = await prisma.user.create({
      data: {
        email: operatorEmail,
        password: await bcrypt.hash('password123', 10),
        username: 'admin.operador',
        role: 'OPERATOR',
        isActive: true
      }
    });
    console.log('✅ Operador creado');
  }

  // 2. Verificar si la empresa existe o crearla
  const companyRfc = 'EDE2401010A1';
  let company = await prisma.company.findUnique({
    where: { rfc: companyRfc }
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Empresa Demo S.A. de C.V.',
        legalName: 'Empresa Demostrativa Sociedad Anónima de Capital Variable',
        rfc: companyRfc,
        email: 'contacto@empresademo.com',
        phone: '5551234567',
        address: 'Av. Reforma 123, Col. Centro, CDMX',
        status: 'CONFIGURED',
        employeesCount: 10
      }
    });
    console.log('✅ Empresa creada:', company.name);
  } else {
    console.log('✅ Empresa existente encontrada:', company.name);
    // Limpiar datos anteriores si es necesario
    await prisma.workerContractCondition.deleteMany({ where: { workerDetails: { companyId: company.id } } });
    await prisma.workerPaymentData.deleteMany({ where: { workerDetails: { companyId: company.id } } });
    await prisma.workerAddress.deleteMany({ where: { workerDetails: { companyId: company.id } } });
    await prisma.workerDetails.deleteMany({ where: { companyId: company.id } });
    await prisma.puesto.deleteMany({ where: { empresaId: company.id } });
    await prisma.departamento.deleteMany({ where: { empresaId: company.id } });
    await prisma.area.deleteMany({ where: { empresaId: company.id } });
    await prisma.workSchedule.deleteMany({ where: { companyId: company.id } });
    await prisma.calendar.deleteMany({ where: { companyId: company.id } });
    await prisma.companyPolicy.deleteMany({ where: { companyId: company.id } });
    await prisma.companyWizard.deleteMany({ where: { companyId: company.id } });
    await prisma.notification.deleteMany({ where: { companyId: company.id } });
    console.log('✅ Datos anteriores eliminados');
  }

  // 3. Verificar si el usuario cliente existe o crearlo
  const clientEmail = 'cliente@empresademo.com';
  let client = await prisma.user.findUnique({
    where: { email: clientEmail }
  });
  
  if (!client) {
    const hashedPassword = await bcrypt.hash('cliente123', 10);
    client = await prisma.user.create({
      data: {
        email: clientEmail,
        password: hashedPassword,
        username: 'maria.garcia',
        role: 'CLIENT',
        isActive: true,
        companyId: company.id
      }
    });
    console.log('✅ Cliente creado');
  } else {
    // Actualizar la compañía del cliente si es necesario
    if (client.companyId !== company.id) {
      client = await prisma.user.update({
        where: { id: client.id },
        data: { companyId: company.id }
      });
    }
    console.log('✅ Cliente existente encontrado');
  }

  // Verificar si el token de invitación existe
  const existingToken = await prisma.invitationToken.findUnique({
    where: { token: 'demo-token-123456' }
  });
  
  if (!existingToken) {
    await prisma.invitationToken.create({
      data: {
        token: 'demo-token-123456',
        email: clientEmail,
        companyId: company.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        used: true,
        usedAt: new Date(),
        metadata: { role: 'CLIENT', createdBy: operator.id }
      }
    });
    console.log('✅ Token de invitación creado');
  }

  // 4. Crear información general de la empresa
  const generalInfo = await prisma.companyGeneralInfo.upsert({
    where: { companyId: company.id },
    create: {
      companyId: company.id,
      businessName: 'Empresa Demostrativa S.A. de C.V.',
      commercialName: 'Empresa Demo',
      rfc: 'EDE2401010A1',
      taxRegime: '601',
      startDate: new Date('2020-01-15'),
      tipoPersona: 'MORAL',
      actividadEconomica: 'Servicios de Tecnología'
    },
    update: {
      businessName: 'Empresa Demostrativa S.A. de C.V.',
      commercialName: 'Empresa Demo',
      rfc: 'EDE2401010A1',
      taxRegime: '601',
      startDate: new Date('2020-01-15'),
      tipoPersona: 'MORAL',
      actividadEconomica: 'Servicios de Tecnología'
    }
  });
  console.log('✅ Información general de la empresa:', generalInfo.id ? 'actualizada' : 'creada');

  // 5. Crear representante legal
  const legalRep = await prisma.companyLegalRepresentative.upsert({
    where: { companyId: company.id },
    create: {
      companyId: company.id,
      name: 'Juan',
      primerApellido: 'Pérez',
      segundoApellido: 'González'
    },
    update: {
      name: 'Juan',
      primerApellido: 'Pérez',
      segundoApellido: 'González'
    }
  });
  console.log('✅ Representante legal:', legalRep.id ? 'actualizado' : 'creado');

  // 6. Crear checklist de documentos completado
  const checklist = await prisma.companyDocumentChecklist.upsert({
    where: { companyId: company.id },
    create: {
      companyId: company.id,
      constanciaSituacionFiscal: true,
      altaPatronal: true,
      altaFonacot: true,
      sellosDigitales: true,
      catalogoTrabajadores: true,
      plantillaIncidencias: true,
      identificacion: true,
      cuentaBancaria: true,
      representanteLegal: true,
      actaConstitutiva: true,
      allDocumentsUploaded: true
    },
    update: {
      constanciaSituacionFiscal: true,
      altaPatronal: true,
      altaFonacot: true,
      sellosDigitales: true,
      catalogoTrabajadores: true,
      plantillaIncidencias: true,
      identificacion: true,
      cuentaBancaria: true,
      representanteLegal: true,
      actaConstitutiva: true,
      allDocumentsUploaded: true
    }
  });
  console.log('✅ Checklist de documentos:', checklist.id ? 'actualizado' : 'creado');

  // 7. Crear horario de trabajo
  const schedule = await prisma.workSchedule.create({
    data: {
      companyId: company.id,
      name: 'Horario Regular',
      startTime: '09:00',
      endTime: '18:00',
      workDays: [1, 2, 3, 4, 5], // Lunes a Viernes
      breakHours: 1
    }
  });

  // 8. Crear calendario de nómina
  const calendar = await prisma.calendar.upsert({
    where: {
      companyId_year: {
        companyId: company.id,
        year: 2024
      }
    },
    create: {
      companyId: company.id,
      year: 2024,
      name: 'Calendario 2024',
      workDays: [1, 2, 3, 4, 5],
      holidays: [
        { date: '2024-01-01', name: 'Año Nuevo' },
        { date: '2024-02-05', name: 'Día de la Constitución' }
      ],
      isDefault: true
    },
    update: {
      name: 'Calendario 2024',
      workDays: [1, 2, 3, 4, 5],
      holidays: [
        { date: '2024-01-01', name: 'Año Nuevo' },
        { date: '2024-02-05', name: 'Día de la Constitución' }
      ],
      isDefault: true
    }
  });
  console.log('✅ Calendario de nómina:', calendar.id ? 'actualizado' : 'creado');

  // 9. Crear áreas organizacionales
  const areas = await Promise.all([
    prisma.area.create({
      data: {
        empresaId: company.id,
        nombre: 'Dirección General',
        descripcion: 'Área de dirección y estrategia'
      }
    }),
    prisma.area.create({
      data: {
        empresaId: company.id,
        nombre: 'Administración',
        descripcion: 'Área administrativa y financiera'
      }
    }),
    prisma.area.create({
      data: {
        empresaId: company.id,
        nombre: 'Operaciones',
        descripcion: 'Área de operaciones y producción'
      }
    })
  ]);
  console.log('✅ 3 Áreas creadas');

  // 10. Crear departamentos
  const departments = await Promise.all([
    prisma.departamento.create({
      data: {
        empresaId: company.id,
        areaId: areas[0].id,
        nombre: 'Dirección General',
        descripcion: 'Departamento de dirección'
      }
    }),
    prisma.departamento.create({
      data: {
        empresaId: company.id,
        areaId: areas[1].id,
        nombre: 'Recursos Humanos',
        descripcion: 'Gestión de personal'
      }
    }),
    prisma.departamento.create({
      data: {
        empresaId: company.id,
        areaId: areas[1].id,
        nombre: 'Finanzas',
        descripcion: 'Control financiero y contabilidad'
      }
    }),
    prisma.departamento.create({
      data: {
        empresaId: company.id,
        areaId: areas[2].id,
        nombre: 'Producción',
        descripcion: 'Departamento de producción'
      }
    })
  ]);
  console.log('✅ 4 Departamentos creados');

  // 11. Crear puestos
  const positions = await Promise.all([
    prisma.puesto.create({
      data: {
        empresaId: company.id,
        departamentoId: departments[0].id,
        nombre: 'Director General'
      }
    }),
    prisma.puesto.create({
      data: {
        empresaId: company.id,
        departamentoId: departments[1].id,
        nombre: 'Gerente de Recursos Humanos'
      }
    }),
    prisma.puesto.create({
      data: {
        empresaId: company.id,
        departamentoId: departments[2].id,
        nombre: 'Contador General'
      }
    }),
    prisma.puesto.create({
      data: {
        empresaId: company.id,
        departamentoId: departments[3].id,
        nombre: 'Supervisor de Producción'
      }
    }),
    prisma.puesto.create({
      data: {
        empresaId: company.id,
        departamentoId: departments[3].id,
        nombre: 'Operador'
      }
    })
  ]);
  console.log('✅ 5 Puestos creados');

  // 12. Crear empleados
  const employeesData = [
    {
      employeeNumber: 'EMP001',
      name: 'Carlos Rodríguez López',
      email: 'carlos.rodriguez@empresademo.com',
      rfc: 'ROLC850315ABC',
      phone: '5551234001',
      position: 'Director General',
      department: 'Dirección General',
      baseSalary: 100000,
      hireDate: new Date('2020-01-15'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1985-03-15'),
      address: 'Av. Reforma 500, Col. Centro, CDMX',
      emergencyContact: 'María Rodríguez - 5559876543',
      bankName: 'BBVA',
      bankAccount: '0123456701',
      clabe: '012180001234567901',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP002',
      name: 'Ana Martínez Hernández',
      email: 'ana.martinez@empresademo.com',
      rfc: 'MAHA900210DEF',
      phone: '5551234002',
      position: 'Gerente de Recursos Humanos',
      department: 'Recursos Humanos',
      baseSalary: 50000,
      hireDate: new Date('2020-03-01'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1990-02-10'),
      address: 'Calle Juarez 200, Col. Roma, CDMX',
      emergencyContact: 'Pedro Martínez - 5551112222',
      bankName: 'BBVA',
      bankAccount: '0123456702',
      clabe: '012180001234567902',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP003',
      name: 'Roberto Sánchez García',
      email: 'roberto.sanchez@empresademo.com',
      rfc: 'SAGR880520GHI',
      phone: '5551234003',
      position: 'Contador General',
      department: 'Finanzas',
      baseSalary: 37500,
      hireDate: new Date('2020-06-15'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1988-05-20'),
      address: 'Av. Insurgentes 300, Col. Condesa, CDMX',
      emergencyContact: 'Laura Sánchez - 5553334444',
      bankName: 'BBVA',
      bankAccount: '0123456703',
      clabe: '012180001234567903',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP004',
      name: 'Patricia Flores Mendoza',
      email: 'patricia.flores@empresademo.com',
      rfc: 'FOMP920815JKL',
      phone: '5551234004',
      position: 'Supervisor de Producción',
      department: 'Producción',
      baseSalary: 30000,
      hireDate: new Date('2021-01-10'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1992-08-15'),
      address: 'Calle Morelos 400, Col. Del Valle, CDMX',
      emergencyContact: 'Juan Flores - 5555556666',
      bankName: 'BBVA',
      bankAccount: '0123456704',
      clabe: '012180001234567904',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP005',
      name: 'Miguel Torres Ramírez',
      email: 'miguel.torres@empresademo.com',
      rfc: 'TORM870925MNO',
      phone: '5551234005',
      position: 'Operador',
      department: 'Producción',
      baseSalary: 15000,
      hireDate: new Date('2021-03-15'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1987-09-25'),
      address: 'Av. Universidad 500, Col. Copilco, CDMX',
      emergencyContact: 'Rosa Torres - 5557778888',
      bankName: 'BBVA',
      bankAccount: '0123456705',
      clabe: '012180001234567905',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP006',
      name: 'Laura Jiménez Cruz',
      email: 'laura.jimenez@empresademo.com',
      rfc: 'JICL930112PQR',
      phone: '5551234006',
      position: 'Operador',
      department: 'Producción',
      baseSalary: 15000,
      hireDate: new Date('2021-05-01'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1993-01-12'),
      address: 'Calle Hidalgo 600, Col. Centro, CDMX',
      emergencyContact: 'Carlos Jiménez - 5559990000',
      bankName: 'BBVA',
      bankAccount: '0123456706',
      clabe: '012180001234567906',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP007',
      name: 'José Morales Vargas',
      email: 'jose.morales@empresademo.com',
      rfc: 'MOVJ851230STU',
      phone: '5551234007',
      position: 'Operador',
      department: 'Producción',
      baseSalary: 15000,
      hireDate: new Date('2021-07-15'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1985-12-30'),
      address: 'Av. Revolución 700, Col. San Angel, CDMX',
      emergencyContact: 'Elena Morales - 5551231231',
      bankName: 'BBVA',
      bankAccount: '0123456707',
      clabe: '012180001234567907',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP008',
      name: 'Carmen Gutiérrez Díaz',
      email: 'carmen.gutierrez@empresademo.com',
      rfc: 'GUDC880405VWX',
      phone: '5551234008',
      position: 'Operador',
      department: 'Producción',
      baseSalary: 15000,
      hireDate: new Date('2021-09-01'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1988-04-05'),
      address: 'Calle Allende 800, Col. Coyoacán, CDMX',
      emergencyContact: 'Luis Gutiérrez - 5554564564',
      bankName: 'BBVA',
      bankAccount: '0123456708',
      clabe: '012180001234567908',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP009',
      name: 'Fernando Castillo Rojas',
      email: 'fernando.castillo@empresademo.com',
      rfc: 'CARF860618YZA',
      phone: '5551234009',
      position: 'Operador',
      department: 'Producción',
      baseSalary: 15000,
      hireDate: new Date('2021-11-15'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1986-06-18'),
      address: 'Av. Patriotismo 900, Col. Mixcoac, CDMX',
      emergencyContact: 'María Castillo - 5557897897',
      bankName: 'BBVA',
      bankAccount: '0123456709',
      clabe: '012180001234567909',
      taxRegime: '605'
    },
    {
      employeeNumber: 'EMP010',
      name: 'Mónica Vega Herrera',
      email: 'monica.vega@empresademo.com',
      rfc: 'VEHM910822BCD',
      phone: '5551234010',
      position: 'Operador',
      department: 'Producción',
      baseSalary: 15000,
      hireDate: new Date('2022-01-10'),
      contractType: 'INDEFINITE',
      dateOfBirth: new Date('1991-08-22'),
      address: 'Calle Madero 1000, Col. Polanco, CDMX',
      emergencyContact: 'Roberto Vega - 5553213213',
      bankName: 'BBVA',
      bankAccount: '0123456710',
      clabe: '012180001234567910',
      taxRegime: '605'
    }
  ];

  // Mapeo de nombres de posiciones a IDs
  const positionMap: { [key: string]: number } = {
    'Director General': positions[0].id,
    'Gerente de Recursos Humanos': positions[1].id,
    'Contador General': positions[2].id,
    'Supervisor de Producción': positions[3].id,
    'Operador': positions[4].id
  };

  // Mapeo de nombres de departamentos a IDs
  const departmentMap: { [key: string]: number } = {
    'Dirección General': departments[0].id,
    'Recursos Humanos': departments[1].id,
    'Finanzas': departments[2].id,
    'Producción': departments[3].id
  };

  let workerNumber = 1;
  for (const empData of employeesData) {
    // Separar nombre completo en partes
    const nameParts = empData.name.split(' ');
    const nombres = nameParts[0];
    const apellidoPaterno = nameParts[1] || '';
    const apellidoMaterno = nameParts[2] || '';
    
    // Debug: verificar longitudes
    // CURP tiene formato: 4 letras + 6 dígitos fecha + 1 sexo + 2 entidad + 3 consonantes + 2 homoclave = 18 chars
    const curp = empData.rfc.slice(0, 10) + 'HDF' + empData.rfc.slice(10, 12) + '01';  // CURP de exactamente 18 caracteres
    console.log(`  Procesando empleado ${workerNumber}:`);
    console.log(`    - nombres: ${nombres} (${nombres.length} chars)`);
    console.log(`    - apellidoPaterno: ${apellidoPaterno} (${apellidoPaterno.length} chars)`);
    console.log(`    - apellidoMaterno: ${apellidoMaterno} (${apellidoMaterno.length} chars)`);
    console.log(`    - rfc: ${empData.rfc} (${empData.rfc.length} chars)`);
    console.log(`    - curp: ${curp} (${curp.length} chars)`);
    console.log(`    - nss: ${empData.employeeNumber.replace('EMP', '12345678900').slice(0, 11)} (${empData.employeeNumber.replace('EMP', '12345678900').slice(0, 11).length} chars)`);
    
    const worker = await prisma.workerDetails.create({
      data: {
        companyId: company.id,
        numeroTrabajador: workerNumber++,
        nombres: nombres,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        fechaNacimiento: empData.dateOfBirth,
        sexo: 'MASCULINO', // Por defecto
        nacionalidad: 'MEXICANA',
        estadoCivil: 'SOLTERO',
        rfc: empData.rfc,
        curp: curp,
        nss: empData.employeeNumber.replace('EMP', '12345678900').slice(0, 11), // NSS ficticio
        umf: 1
      }
    });
    
    // Crear la dirección del trabajador
    await prisma.workerAddress.create({
      data: {
        workerDetailsId: worker.id,
        correoElectronico: empData.email,
        telefonoCelular: empData.phone.replace(/[^0-9]/g, '').slice(-10), // Tomar solo los últimos 10 dígitos
        codigoPostal: '01000', // Código postal genérico para CDMX
        pais: 'México',
        entidadFederativa: 'Ciudad de México',
        municipioAlcaldia: 'CDMX',
        colonia: empData.address.split(',')[1]?.trim() || 'Centro',
        calle: empData.address.split(',')[0]?.trim() || 'Calle Principal',
        numeroExterior: '123',
        numeroInterior: null
      }
    });
    
    // Crear datos de pago del trabajador
    await prisma.workerPaymentData.create({
      data: {
        workerDetailsId: worker.id,
        metodoPago: 'TRANSFERENCIA',
        institucionFinanciera: empData.bankName,
        cuentaBancaria: empData.bankAccount,
        cuentaClabe: empData.clabe,
        numeroTarjeta: null
      }
    });
    
    // Crear condiciones contractuales del trabajador
    await prisma.workerContractCondition.create({
      data: {
        workerDetailsId: worker.id,
        positionId: positionMap[empData.position],
        departmentId: departmentMap[empData.department],
        areaId: null,
        regimenContratacion: 'SUELDOS',
        zonaGeografica: 'RESTO_PAIS',
        tipoSalario: 'FIJO',
        fechaIngreso: empData.hireDate,
        fechaAntiguedad: empData.hireDate,
        tipoContrato: empData.contractType === 'INDEFINITE' ? 'TIEMPO_INDETERMINADO' : 'OBRA_TIEMPO_DETERMINADO',
        tipoJornada: 'DIURNA',
        tipoTrabajador: 'CONFIANZA',
        situacionContractual: 'PERMANENTE',
        salarioDiario: empData.baseSalary / 30, // Salario diario aproximado
        sueldoBaseCotizacion: empData.baseSalary / 30, // Mismo que salario diario para este ejemplo
        registroPatronal: 'Y12-34567-10-8',
        claseRiesgo: 'CLASE_II',
        calendarioNomina: 'QUINCENAL',
        modalidadTrabajo: 'PRESENCIAL',
        horarioId: schedule.id
      }
    });
  }
  console.log('✅ 10 Empleados creados');

  // 13. Crear políticas de la empresa
  await prisma.companyPolicy.createMany({
    data: [
      {
        companyId: company.id,
        name: 'Política de Vacaciones',
        type: 'VACATION',
        description: 'Días de vacaciones según antigüedad',
        content: JSON.stringify({
          tabla: [
            { anos: 1, dias: 12 },
            { anos: 2, dias: 14 },
            { anos: 3, dias: 16 },
            { anos: 4, dias: 18 },
            { anos: 5, dias: 20 }
          ]
        }),
        isActive: true
      },
      {
        companyId: company.id,
        name: 'Política de Asistencia',
        type: 'ATTENDANCE',
        description: 'Lineamientos para el control de asistencia',
        content: 'Todos los empleados deben registrar su entrada y salida...',
        isActive: true
      }
    ]
  });

  // 14. Crear wizard completado
  const wizard = await prisma.companyWizard.create({
    data: {
      companyId: company.id,
      currentSection: 9,
      currentStep: 1,
      status: 'COMPLETED',
      sectionProgress: {
        create: [
          {
            sectionNumber: 1,
            sectionName: 'Datos Generales',
            status: 'COMPLETED'
          },
          {
            sectionNumber: 2,
            sectionName: 'Obligaciones Patronales',
            status: 'COMPLETED'
          },
          {
            sectionNumber: 3,
            sectionName: 'Bancos',
            status: 'COMPLETED'
          },
          {
            sectionNumber: 4,
            sectionName: 'Sellos Digitales',
            status: 'COMPLETED'
          },
          {
            sectionNumber: 5,
            sectionName: 'Estructura Organizacional',
            status: 'COMPLETED'
          },
          {
            sectionNumber: 6,
            sectionName: 'Prestaciones',
            status: 'COMPLETED'
          },
          {
            sectionNumber: 7,
            sectionName: 'Nómina',
            status: 'COMPLETED'
          },
          {
            sectionNumber: 8,
            sectionName: 'Talento Humano',
            status: 'COMPLETED'
          },
          {
            sectionNumber: 9,
            sectionName: 'Documentos',
            status: 'COMPLETED'
          }
        ]
      }
    }
  });
  console.log('✅ Wizard completado');

  // 15. Crear notificación de bienvenida
  await prisma.notification.create({
    data: {
      type: 'SYSTEM_ALERT',
      title: 'Bienvenido a MySourcing Pulse',
      message: 'Su empresa ha sido configurada exitosamente. Ya puede comenzar a gestionar su nómina.',
      priority: 'NORMAL',
      companyId: company.id,
      metadata: {
        targetRole: 'CLIENT'
      }
    }
  });

  console.log('✨ Seed completado exitosamente!');
  console.log('\n📧 Credenciales de acceso:');
  console.log('   Operador: operador@mysourcing.com / password123');
  console.log('   Cliente: cliente@empresademo.com / cliente123');
  console.log('\n🏢 Empresa creada: Empresa Demo S.A. de C.V.');
  console.log('   - 3 áreas organizacionales');
  console.log('   - 4 departamentos');
  console.log('   - 5 puestos');
  console.log('   - 10 empleados');
  console.log('   - Wizard completado');
  console.log('   - Todos los documentos marcados como cargados');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });