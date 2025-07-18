import { PrismaClient, UserRole, CompanyStatus, IncidenceType, IncidenceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete seed...');

  // Clear existing data
  console.log('🧹 Cleaning database...');
  await prisma.$transaction([
    prisma.incidence.deleteMany(),
    prisma.workerDocument.deleteMany(),
    prisma.workerFonacotCredit.deleteMany(),
    prisma.workerInfonavitCredit.deleteMany(),
    prisma.workerAlimony.deleteMany(),
    prisma.workerFamilyMember.deleteMany(),
    prisma.workerPaymentData.deleteMany(),
    prisma.workerContractCondition.deleteMany(),
    prisma.workerAddress.deleteMany(),
    prisma.workerDetails.deleteMany(),
    prisma.vinculacionJefeEmpleado.deleteMany(),
    prisma.vinculacionJefePuesto.deleteMany(),
    prisma.vinculacionJefeDepartamento.deleteMany(),
    prisma.vinculacionJefeArea.deleteMany(),
    prisma.vinculacionJefe.deleteMany(),
    prisma.companyWizardStep.deleteMany(),
    prisma.companyWizardSection.deleteMany(),
    prisma.companyWizard.deleteMany(),
    prisma.companyDocument.deleteMany(),
    prisma.companyDocumentChecklist.deleteMany(),
    prisma.companyPolicy.deleteMany(),
    prisma.companySchedule.deleteMany(),
    prisma.companyBenefitGroup.deleteMany(),
    prisma.companyBenefit.deleteMany(),
    prisma.puesto.deleteMany(),
    prisma.departamento.deleteMany(),
    prisma.area.deleteMany(),
    prisma.companyDigitalCertificate.deleteMany(),
    prisma.companyBank.deleteMany(),
    prisma.fonacot.deleteMany(),
    prisma.iMSSDomicilio.deleteMany(),
    prisma.iMSSRegistroPatronal.deleteMany(),
    prisma.companyNotarialPower.deleteMany(),
    prisma.companyLegalRepresentative.deleteMany(),
    prisma.companyAddress.deleteMany(),
    prisma.companyGeneralInfo.deleteMany(),
    prisma.payrollCalendar.deleteMany(),
    prisma.calendar.deleteMany(),
    prisma.operatorCompany.deleteMany(),
    prisma.company.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Password hash for all users (password: "Password123!")
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. CREATE ALL USER PROFILES
  console.log('👥 Creating user profiles...');

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mysourcing.com.mx',
      password: hashedPassword,
      username: 'admin',
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: UserRole.ADMIN,
      phone: '5551234567',
    }
  });

  // Operator User
  const operatorUser = await prisma.user.create({
    data: {
      email: 'operador@mysourcing.com.mx',
      password: hashedPassword,
      username: 'operador1',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: UserRole.OPERATOR,
      phone: '5552345678',
      managedByAdminId: adminUser.id
    }
  });

  // 2. CREATE COMPANY
  console.log('🏢 Creating company...');
  const company = await prisma.company.create({
    data: {
      name: 'Tecnología Innovadora S.A. de C.V.',
      rfc: 'TIN020304ABC',
      legalName: 'Tecnología Innovadora Sociedad Anónima de Capital Variable',
      address: 'Av. Reforma 123, Col. Juárez, Ciudad de México',
      email: 'contacto@techinnovadora.com',
      phone: '5551112222',
      status: CompanyStatus.ACTIVE,
      employeesCount: 10,
      managedByAdminId: adminUser.id,
    }
  });

  // Assign operator to company
  await prisma.operatorCompany.create({
    data: {
      operatorId: operatorUser.id,
      companyId: company.id,
      assignedBy: adminUser.id,
      isActive: true
    }
  });

  // Client User
  const clientUser = await prisma.user.create({
    data: {
      email: 'cliente@techinnovadora.com',
      password: hashedPassword,
      username: 'cliente1',
      firstName: 'María',
      lastName: 'González',
      role: UserRole.CLIENT,
      phone: '5553456789',
      companyId: company.id
    }
  });

  // 3. COMPLETE COMPANY WIZARD
  console.log('🧙 Completing company wizard...');

  // General Info
  await prisma.companyGeneralInfo.create({
    data: {
      companyId: company.id,
      businessName: company.legalName,
      commercialName: company.name,
      rfc: company.rfc,
      tipoPersona: 'MORAL',
      actividadEconomica: '6201',
      taxRegime: '601',
      startDate: new Date('2020-01-15')
    }
  });

  // Company Address
  await prisma.companyAddress.create({
    data: {
      companyId: company.id,
      tipoDomicilio: 'matriz',
      nombreSucursal: 'Matriz',
      street: 'Av. Reforma',
      exteriorNumber: '123',
      interiorNumber: 'Piso 5',
      neighborhood: 'Juárez',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06600',
      municipio: 'Cuauhtémoc'
    }
  });

  // Legal Representative
  await prisma.companyLegalRepresentative.create({
    data: {
      companyId: company.id,
      name: 'Roberto',
      primerApellido: 'Martínez',
      segundoApellido: 'López',
    }
  });

  // IMSS Registration
  await prisma.iMSSRegistroPatronal.create({
    data: {
      companyId: company.id,
      nomDomicilio: 'Matriz',
      actividadEconomica: 'Desarrollo de software',
      clvRegistroPatronal: 'Y62-12345-10-9',
      numFraccion: 1,
      numPrismaRiesgo: 0.54355,
      fechaVigencia: new Date('2025-01-01')
    }
  });

  // FONACOT
  await prisma.fonacot.create({
    data: {
      companyId: company.id,
      registroPatronal: '1234567',
      fechaAfiliacion: new Date('2020-06-01')
    }
  });

  // Bank (First create bank catalog if needed)
  const bank = await prisma.bank.findFirst({ where: { codigo: 'BANAMEX' } }) || 
    await prisma.bank.create({
      data: {
        codigo: 'BANAMEX',
        nombre: 'Banco Nacional de México, S.A.',
        nombreCorto: 'Banamex'
      }
    });

  await prisma.companyBank.create({
    data: {
      companyId: company.id,
      bankId: bank.id,
      nomCuentaBancaria: 'Cuenta Nómina Principal',
      numCuentaBancaria: '123456789',
      numClabeInterbancaria: '002180123456789012',
      numSucursal: '180',
      clvDispersion: 1,
      desCuentaBancaria: 'Cuenta para pago de nómina',
      opcCuentaBancariaPrincipal: true
    }
  });

  // Digital Certificate
  await prisma.companyDigitalCertificate.create({
    data: {
      companyId: company.id,
      certificateFile: '/certs/cert.cer',
      keyFile: '/certs/key.key',
      password: 'encrypted_password',
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2028-01-01')
    }
  });

  // 4. CREATE ORGANIZATIONAL STRUCTURE
  console.log('🏗️ Creating organizational structure...');

  // Areas (3)
  const areaTI = await prisma.area.create({
    data: {
      empresaId: company.id,
      nombre: 'Tecnología de la Información',
      descripcion: 'Área encargada del desarrollo y mantenimiento de sistemas'
    }
  });

  const areaRH = await prisma.area.create({
    data: {
      empresaId: company.id,
      nombre: 'Recursos Humanos',
      descripcion: 'Área encargada de la gestión del talento humano'
    }
  });

  const areaFinanzas = await prisma.area.create({
    data: {
      empresaId: company.id,
      nombre: 'Finanzas',
      descripcion: 'Área encargada de la gestión financiera y contable'
    }
  });

  // Departments (4)
  const deptoDesarrollo = await prisma.departamento.create({
    data: {
      empresaId: company.id,
      areaId: areaTI.id,
      nombre: 'Desarrollo de Software',
      descripcion: 'Departamento de desarrollo de aplicaciones'
    }
  });

  const deptoInfraestructura = await prisma.departamento.create({
    data: {
      empresaId: company.id,
      areaId: areaTI.id,
      nombre: 'Infraestructura',
      descripcion: 'Departamento de infraestructura y redes'
    }
  });

  const deptoNomina = await prisma.departamento.create({
    data: {
      empresaId: company.id,
      areaId: areaRH.id,
      nombre: 'Nómina',
      descripcion: 'Departamento de gestión de nómina'
    }
  });

  const deptoContabilidad = await prisma.departamento.create({
    data: {
      empresaId: company.id,
      areaId: areaFinanzas.id,
      nombre: 'Contabilidad',
      descripcion: 'Departamento de contabilidad general'
    }
  });

  // Positions (5)
  const puestoGerente = await prisma.puesto.create({
    data: {
      empresaId: company.id,
      areaId: areaTI.id,
      departamentoId: deptoDesarrollo.id,
      nombre: 'Gerente de Desarrollo'
    }
  });

  const puestoDesarrollador = await prisma.puesto.create({
    data: {
      empresaId: company.id,
      areaId: areaTI.id,
      departamentoId: deptoDesarrollo.id,
      nombre: 'Desarrollador Senior'
    }
  });

  const puestoAnalista = await prisma.puesto.create({
    data: {
      empresaId: company.id,
      areaId: areaRH.id,
      departamentoId: deptoNomina.id,
      nombre: 'Analista de Nómina'
    }
  });

  const puestoContador = await prisma.puesto.create({
    data: {
      empresaId: company.id,
      areaId: areaFinanzas.id,
      departamentoId: deptoContabilidad.id,
      nombre: 'Contador General'
    }
  });

  const puestoAuxiliar = await prisma.puesto.create({
    data: {
      empresaId: company.id,
      areaId: areaFinanzas.id,
      departamentoId: deptoContabilidad.id,
      nombre: 'Auxiliar Contable'
    }
  });

  // 5. CREATE BENEFITS
  console.log('💰 Creating benefits...');
  await prisma.companyBenefit.createMany({
    data: [
      {
        companyId: company.id,
        name: 'Aguinaldo',
        type: 'DAYS',
        isLegal: true,
        amount: 15,
        description: 'Aguinaldo de ley - 15 días'
      },
      {
        companyId: company.id,
        name: 'Vacaciones',
        type: 'DAYS',
        isLegal: true,
        amount: 6,
        description: 'Vacaciones primer año - 6 días'
      },
      {
        companyId: company.id,
        name: 'Prima Vacacional',
        type: 'PERCENTAGE',
        isLegal: true,
        percentage: 25,
        description: 'Prima vacacional 25%'
      },
      {
        companyId: company.id,
        name: 'Vales de Despensa',
        type: 'FIXED_AMOUNT',
        isLegal: false,
        amount: 1000,
        description: 'Vales de despensa mensuales'
      }
    ]
  });

  // 6. CREATE SCHEDULES
  console.log('⏰ Creating work schedules...');
  const schedule = await prisma.workSchedule.create({
    data: {
      companyId: company.id,
      name: 'Horario Estándar',
      startTime: '09:00',
      endTime: '18:00',
      workDays: [1, 2, 3, 4, 5], // Lunes a Viernes
      breakHours: 1
    }
  });

  // 7. CREATE PAYROLL CALENDAR
  console.log('📅 Creating payroll calendar...');
  const payrollCalendar = await prisma.payrollCalendar.create({
    data: {
      companyId: company.id,
      name: 'Calendario Quincenal 2025',
      payFrequency: 'quincenal',
      daysBeforeClose: 3,
      startDate: new Date('2025-01-01'),
      periodNumber: 1,
      payNaturalDays: false
    }
  });

  // 8. CREATE EMPLOYEES (10)
  console.log('👷 Creating employees...');

  const employees = [];
  const employeeData = [
    // Department Head (will have DEPARTMENT_HEAD role)
    {
      numeroTrabajador: 1,
      nombres: 'Carlos',
      apellidoPaterno: 'Hernández',
      apellidoMaterno: 'García',
      email: 'jefe.desarrollo@techinnovadora.com',
      role: UserRole.DEPARTMENT_HEAD,
      positionId: puestoGerente.id,
      departmentId: deptoDesarrollo.id,
      areaId: areaTI.id,
      salarioDiario: 1500
    },
    // Regular employees
    {
      numeroTrabajador: 2,
      nombres: 'Ana',
      apellidoPaterno: 'López',
      apellidoMaterno: 'Martín',
      email: 'empleado1@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoDesarrollador.id,
      departmentId: deptoDesarrollo.id,
      areaId: areaTI.id,
      salarioDiario: 800
    },
    {
      numeroTrabajador: 3,
      nombres: 'Luis',
      apellidoPaterno: 'García',
      apellidoMaterno: 'Rojas',
      email: 'empleado2@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoDesarrollador.id,
      departmentId: deptoDesarrollo.id,
      areaId: areaTI.id,
      salarioDiario: 800
    },
    {
      numeroTrabajador: 4,
      nombres: 'Patricia',
      apellidoPaterno: 'Ramírez',
      apellidoMaterno: 'Cruz',
      email: 'empleado3@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoAnalista.id,
      departmentId: deptoNomina.id,
      areaId: areaRH.id,
      salarioDiario: 600
    },
    {
      numeroTrabajador: 5,
      nombres: 'Miguel',
      apellidoPaterno: 'Torres',
      apellidoMaterno: 'Flores',
      email: 'empleado4@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoContador.id,
      departmentId: deptoContabilidad.id,
      areaId: areaFinanzas.id,
      salarioDiario: 900
    },
    {
      numeroTrabajador: 6,
      nombres: 'Sandra',
      apellidoPaterno: 'Morales',
      apellidoMaterno: 'Díaz',
      email: 'empleado5@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoAuxiliar.id,
      departmentId: deptoContabilidad.id,
      areaId: areaFinanzas.id,
      salarioDiario: 400
    },
    {
      numeroTrabajador: 7,
      nombres: 'Roberto',
      apellidoPaterno: 'Jiménez',
      apellidoMaterno: 'Luna',
      email: 'empleado6@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoDesarrollador.id,
      departmentId: deptoDesarrollo.id,
      areaId: areaTI.id,
      salarioDiario: 800
    },
    {
      numeroTrabajador: 8,
      nombres: 'Diana',
      apellidoPaterno: 'Vargas',
      apellidoMaterno: 'Soto',
      email: 'empleado7@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoDesarrollador.id,
      departmentId: deptoDesarrollo.id,
      areaId: areaTI.id,
      salarioDiario: 800
    },
    {
      numeroTrabajador: 9,
      nombres: 'Fernando',
      apellidoPaterno: 'Castillo',
      apellidoMaterno: 'Peña',
      email: 'empleado8@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoAnalista.id,
      departmentId: deptoNomina.id,
      areaId: areaRH.id,
      salarioDiario: 600
    },
    {
      numeroTrabajador: 10,
      nombres: 'Gabriela',
      apellidoPaterno: 'Mendoza',
      apellidoMaterno: 'Silva',
      email: 'empleado9@techinnovadora.com',
      role: UserRole.EMPLOYEE,
      positionId: puestoAuxiliar.id,
      departmentId: deptoContabilidad.id,
      areaId: areaFinanzas.id,
      salarioDiario: 400
    }
  ];

  for (const empData of employeeData) {
    // Create worker details
    const rfc = `HEGG900115${empData.numeroTrabajador.toString().padStart(2, '0')}A`;
    const curp = `HEGG900115H${empData.numeroTrabajador % 2 === 0 ? 'M' : 'H'}DFAA${empData.numeroTrabajador.toString().padStart(2, '0')}`;
    const nss = `123456789${empData.numeroTrabajador.toString().padStart(2, '0')}`;
    
    console.log(`Creating employee ${empData.numeroTrabajador}:`);
    console.log(`  RFC (${rfc.length} chars): ${rfc}`);
    console.log(`  CURP (${curp.length} chars): ${curp}`);
    console.log(`  NSS (${nss.length} chars): ${nss}`);
    
    const worker = await prisma.workerDetails.create({
      data: {
        companyId: company.id,
        numeroTrabajador: empData.numeroTrabajador,
        nombres: empData.nombres,
        apellidoPaterno: empData.apellidoPaterno,
        apellidoMaterno: empData.apellidoMaterno,
        fechaNacimiento: new Date('1990-01-15'),
        sexo: empData.numeroTrabajador % 2 === 0 ? 'FEMENINO' : 'MASCULINO',
        nacionalidad: 'MEXICANA',
        estadoCivil: 'SOLTERO',
        rfc: rfc,
        curp: curp,
        nss: nss,
        umf: 21,
        activo: true
      }
    });

    // Create address
    await prisma.workerAddress.create({
      data: {
        workerDetailsId: worker.id,
        correoElectronico: empData.email,
        telefonoCelular: `555${1000000 + empData.numeroTrabajador}`,
        codigoPostal: '06600',
        pais: 'México',
        entidadFederativa: 'Ciudad de México',
        municipioAlcaldia: 'Cuauhtémoc',
        colonia: 'Juárez',
        calle: 'Calle Ejemplo',
        numeroExterior: empData.numeroTrabajador.toString(),
      }
    });

    // Create contract conditions
    await prisma.workerContractCondition.create({
      data: {
        workerDetailsId: worker.id,
        sucursal: 'MATRIZ',
        areaId: empData.areaId,
        departmentId: empData.departmentId,
        positionId: empData.positionId,
        regimenContratacion: 'SUELDOS',
        zonaGeografica: 'RESTO_PAIS',
        tipoSalario: 'FIJO',
        fechaIngreso: new Date('2020-01-15'),
        fechaAntiguedad: new Date('2020-01-15'),
        salarioDiario: empData.salarioDiario,
        sueldoBaseCotizacion: empData.salarioDiario * 1.0452, // With benefits
        registroPatronal: 'Y62-12345-10-9',
        claseRiesgo: 'CLASE_I',
        tipoContrato: 'TIEMPO_INDETERMINADO',
        tipoTrabajador: 'CONFIANZA',
        situacionContractual: 'PERMANENTE',
        calendarioNomina: payrollCalendar.name,
        tipoJornada: 'DIURNA',
        horarioId: schedule.id,
        modalidadTrabajo: 'PRESENCIAL',
        presentaDeclaracionAnual: empData.salarioDiario > 400
      }
    });

    // Create payment data
    await prisma.workerPaymentData.create({
      data: {
        workerDetailsId: worker.id,
        metodoPago: 'TRANSFERENCIA',
        institucionFinanciera: 'BANAMEX',
        cuentaBancaria: `00${empData.numeroTrabajador.toString().padStart(2, '0')}123456789`,
        cuentaClabe: `002180000012345${empData.numeroTrabajador.toString().padStart(3, '0')}`,
      }
    });

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: empData.email,
        password: hashedPassword,
        username: `empleado${empData.numeroTrabajador}`,
        firstName: empData.nombres,
        lastName: `${empData.apellidoPaterno} ${empData.apellidoMaterno}`,
        role: empData.role,
        companyId: company.id,
        workerDetailsId: worker.id,
        phone: `555${1000000 + empData.numeroTrabajador}`
      }
    });

    // If this is the department head, create the vinculacion
    if (empData.role === UserRole.DEPARTMENT_HEAD) {
      const vinculacion = await prisma.vinculacionJefe.create({
        data: {
          empresaId: company.id,
          usuarioId: user.id,
          workerDetailsId: worker.id,
          activo: true
        }
      });

      // Link to department
      await prisma.vinculacionJefeDepartamento.create({
        data: {
          vinculacionJefeId: vinculacion.id,
          departamentoId: deptoDesarrollo.id
        }
      });

      // Link to employees in the same department
      const developmentEmployees = await prisma.workerDetails.findMany({
        where: {
          companyId: company.id,
          contractConditions: {
            departmentId: deptoDesarrollo.id
          },
          id: { not: worker.id }
        }
      });

      for (const emp of developmentEmployees) {
        await prisma.vinculacionJefeEmpleado.create({
          data: {
            vinculacionJefeId: vinculacion.id,
            workerDetailsId: emp.id,
            activo: true
          }
        });
      }
    }

    employees.push({ worker, user });
  }

  // 9. CREATE SAMPLE INCIDENCES
  console.log('📋 Creating sample incidences...');
  const incidenceTypes = [
    { type: IncidenceType.FALTAS, quantity: 1, amount: 800 },
    { type: IncidenceType.TIEMPO_EXTRA, quantity: 2, amount: 300 },
    { type: IncidenceType.BONOS, quantity: 1, amount: 1000 },
  ];

  for (let i = 0; i < 3; i++) {
    const employee = employees[i];
    const incidence = incidenceTypes[i];
    
    await prisma.incidence.create({
      data: {
        type: incidence.type,
        date: new Date(),
        quantity: incidence.quantity,
        amount: incidence.amount,
        description: `Incidencia de prueba - ${incidence.type}`,
        status: IncidenceStatus.APPROVED,
        employeeId: employee.worker.id,
        companyId: company.id,
        payrollCalendarId: payrollCalendar.id,
        createdBy: 'CLIENT',
        createdByUserId: clientUser.id,
        approvedBy: operatorUser.id,
        approvalDate: new Date()
      }
    });
  }

  // 10. CREATE DOCUMENT CHECKLIST
  console.log('📄 Completing document checklist...');
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

  // Create sample documents
  const documentTypes = [
    'CONSTANCIA_SITUACION_FISCAL',
    'ALTA_PATRONAL',
    'ALTA_FONACOT',
    'SELLOS_DIGITALES',
    'ACTA_CONSTITUTIVA'
  ];

  for (const docType of documentTypes) {
    await prisma.companyDocument.create({
      data: {
        companyId: company.id,
        documentType: docType as any,
        fileName: `${docType.toLowerCase()}.pdf`,
        filePath: `/uploads/company-documents/${company.id}/${docType.toLowerCase()}.pdf`,
        fileSize: 1024000, // 1MB
        mimeType: 'application/pdf',
        uploadedBy: UserRole.OPERATOR,
        uploadedByUserId: operatorUser.id,
        notes: `Documento ${docType} cargado correctamente`,
        isActive: true
      }
    });
  }

  // 11. COMPLETE WIZARD STATUS
  console.log('✅ Marking wizard as completed...');
  const wizard = await prisma.companyWizard.create({
    data: {
      companyId: company.id,
      status: 'COMPLETED',
      currentSection: 9,
      currentStep: 1,
      completedAt: new Date(),
      wizardData: {
        completedSections: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      }
    }
  });

  // Create section progress
  const sections = [
    'Datos Generales',
    'Obligaciones Patronales',
    'Bancos',
    'Sellos Digitales',
    'Estructura Organizacional',
    'Prestaciones',
    'Nómina',
    'Talento Humano',
    'Documentos'
  ];

  for (let i = 0; i < sections.length; i++) {
    await prisma.companyWizardSection.create({
      data: {
        wizardId: wizard.id,
        sectionNumber: i + 1,
        sectionName: sections[i],
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('================================');
  console.log('ADMIN:');
  console.log('Email: admin@mysourcing.com.mx');
  console.log('Password: Password123!');
  console.log('\nOPERATOR:');
  console.log('Email: operador@mysourcing.com.mx');
  console.log('Password: Password123!');
  console.log('\nCLIENT:');
  console.log('Email: cliente@techinnovadora.com');
  console.log('Password: Password123!');
  console.log('\nDEPARTMENT HEAD:');
  console.log('Email: jefe.desarrollo@techinnovadora.com');
  console.log('Password: Password123!');
  console.log('\nEMPLOYEES:');
  console.log('Emails: empleado1@techinnovadora.com to empleado9@techinnovadora.com');
  console.log('Password: Password123!');
  console.log('================================\n');
}

main()
  .catch((e) => {
    console.error('Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });