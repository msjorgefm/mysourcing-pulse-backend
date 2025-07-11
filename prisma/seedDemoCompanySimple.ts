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
        name: 'Admin Operador',
        firstName: 'Admin',
        lastName: 'Operador',
        role: 'OPERATOR',
        isActive: true
      }
    });
    console.log('✅ Operador creado');
  }

  // 2. Crear empresa
  const company = await prisma.company.create({
    data: {
      name: 'Empresa Demo S.A. de C.V.',
      legalName: 'Empresa Demostrativa Sociedad Anónima de Capital Variable',
      rfc: 'EDE2401010A1',
      email: 'contacto@empresademo.com',
      phone: '5551234567',
      address: 'Av. Reforma 123, Col. Centro, CDMX',
      status: 'CONFIGURED',
      employeesCount: 10
    }
  });
  console.log('✅ Empresa creada:', company.name);

  // 3. Crear usuario cliente e invitación
  const clientEmail = 'cliente@empresademo.com';
  const hashedPassword = await bcrypt.hash('cliente123', 10);
  
  const client = await prisma.user.create({
    data: {
      email: clientEmail,
      password: hashedPassword,
      name: 'María García',
      firstName: 'María',
      lastName: 'García',
      role: 'CLIENT',
      isActive: true,
      companyId: company.id
    }
  });

  // Crear token de invitación (ya usado)
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
  console.log('✅ Cliente creado con invitación');

  // 4. Crear información general de la empresa
  await prisma.companyGeneralInfo.create({
    data: {
      companyId: company.id,
      businessName: 'Empresa Demostrativa S.A. de C.V.',
      commercialName: 'Empresa Demo',
      rfc: 'EDE2401010A1',
      taxRegime: '601',
      startDate: new Date('2020-01-15'),
      tipoPersona: 'MORAL',
      actividadEconomica: 'Servicios de Tecnología'
    }
  });

  // 5. Crear representante legal
  await prisma.companyLegalRepresentative.create({
    data: {
      companyId: company.id,
      name: 'Juan',
      primerApellido: 'Pérez',
      segundoApellido: 'González'
    }
  });

  // 6. Crear checklist de documentos completado
  await prisma.companyDocumentChecklist.create({
    data: {
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
    }
  });
  console.log('✅ Checklist de documentos completado');

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
  await prisma.calendar.create({
    data: {
      companyId: company.id,
      year: 2024,
      name: 'Calendario 2024',
      workDays: [1, 2, 3, 4, 5],
      holidays: [
        { date: '2024-01-01', name: 'Año Nuevo' },
        { date: '2024-02-05', name: 'Día de la Constitución' }
      ],
      isDefault: true
    }
  });
  console.log('✅ Calendario de nómina creado');

  // 9. Crear áreas organizacionales
  const areas = await Promise.all([
    prisma.organizationalArea.create({
      data: {
        companyId: company.id,
        name: 'Dirección General',
        description: 'Área de dirección y estrategia'
      }
    }),
    prisma.organizationalArea.create({
      data: {
        companyId: company.id,
        name: 'Administración',
        description: 'Área administrativa y financiera'
      }
    }),
    prisma.organizationalArea.create({
      data: {
        companyId: company.id,
        name: 'Operaciones',
        description: 'Área de operaciones y producción'
      }
    })
  ]);
  console.log('✅ 3 Áreas creadas');

  // 10. Crear departamentos
  const departments = await Promise.all([
    prisma.organizationalDepartment.create({
      data: {
        companyId: company.id,
        areaId: areas[0].id,
        name: 'Dirección General',
        description: 'Departamento de dirección'
      }
    }),
    prisma.organizationalDepartment.create({
      data: {
        companyId: company.id,
        areaId: areas[1].id,
        name: 'Recursos Humanos',
        description: 'Gestión de personal'
      }
    }),
    prisma.organizationalDepartment.create({
      data: {
        companyId: company.id,
        areaId: areas[1].id,
        name: 'Finanzas',
        description: 'Control financiero y contabilidad'
      }
    }),
    prisma.organizationalDepartment.create({
      data: {
        companyId: company.id,
        areaId: areas[2].id,
        name: 'Producción',
        description: 'Departamento de producción'
      }
    })
  ]);
  console.log('✅ 4 Departamentos creados');

  // 11. Crear puestos
  const positions = await Promise.all([
    prisma.organizationalPosition.create({
      data: {
        companyId: company.id,
        departmentId: departments[0].id,
        name: 'Director General',
        description: 'Dirección de la empresa',
        hierarchyLevel: '1',
        baseSalary: 100000
      }
    }),
    prisma.organizationalPosition.create({
      data: {
        companyId: company.id,
        departmentId: departments[1].id,
        name: 'Gerente de Recursos Humanos',
        description: 'Gestión del área de RH',
        hierarchyLevel: '2',
        baseSalary: 50000
      }
    }),
    prisma.organizationalPosition.create({
      data: {
        companyId: company.id,
        departmentId: departments[2].id,
        name: 'Contador General',
        description: 'Contabilidad de la empresa',
        hierarchyLevel: '3',
        baseSalary: 37500
      }
    }),
    prisma.organizationalPosition.create({
      data: {
        companyId: company.id,
        departmentId: departments[3].id,
        name: 'Supervisor de Producción',
        description: 'Supervisión de línea de producción',
        hierarchyLevel: '3',
        baseSalary: 30000
      }
    }),
    prisma.organizationalPosition.create({
      data: {
        companyId: company.id,
        departmentId: departments[3].id,
        name: 'Operador',
        description: 'Operación de maquinaria',
        hierarchyLevel: '4',
        baseSalary: 15000
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

  for (const empData of employeesData) {
    await prisma.employee.create({
      data: {
        companyId: company.id,
        employeeNumber: empData.employeeNumber,
        name: empData.name,
        email: empData.email,
        rfc: empData.rfc,
        phone: empData.phone,
        position: empData.position,
        department: empData.department,
        baseSalary: empData.baseSalary,
        hireDate: empData.hireDate,
        contractType: empData.contractType as any,
        dateOfBirth: empData.dateOfBirth,
        address: empData.address,
        emergencyContact: empData.emergencyContact,
        bankName: empData.bankName,
        bankAccount: empData.bankAccount,
        clabe: empData.clabe,
        taxRegime: empData.taxRegime,
        workSchedule: schedule.name,
        status: 'ACTIVE'
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