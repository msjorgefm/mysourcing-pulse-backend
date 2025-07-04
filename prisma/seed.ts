import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios
  const operatorPassword = await bcrypt.hash('operator123', 12);
  const clientPassword = await bcrypt.hash('client123', 12);
  const employeePassword = await bcrypt.hash('employee123', 12);

  // Crear empresas
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp México',
        rfc: 'TCM850101A1B',
        legalName: 'Tecnología Corporativa de México SA de CV',
        address: 'Av. Reforma 123, Col. Centro, CDMX',
        email: 'admin@techcorp.mx',
        phone: '55-1234-5678',
        status: 'ACTIVE',
        employeesCount: 45
      }
    }),
    prisma.company.create({
      data: {
        name: 'Retail Solutions SA',
        rfc: 'RSL900215C2D',
        legalName: 'Retail Solutions Sociedad Anónima',
        address: 'Blvd. Avila Camacho 456, Naucalpan, EdoMex',
        email: 'contacto@retailsolutions.mx',
        phone: '55-9876-5432',
        status: 'CONFIGURED',
        employeesCount: 120
      }
    })
  ]);

  // Crear usuarios
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'carlos@mysourcing.mx',
        password: operatorPassword,
        name: 'Carlos Mendoza',
        role: 'OPERATOR'
      }
    }),
    prisma.user.create({
      data: {
        email: 'ana@techcorp.mx',
        password: clientPassword,
        name: 'Ana Rivera',
        role: 'CLIENT',
        companyId: companies[0].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'juan.perez@techcorp.mx',
        password: employeePassword,
        name: 'Juan Pérez García',
        role: 'EMPLOYEE',
        companyId: companies[0].id
      }
    })
  ]);

  // Crear empleados para TechCorp
  const employees = [];
  for (let i = 1; i <= 45; i++) {
    const employee = await prisma.employee.create({
      data: {
        employeeNumber: `TC${i.toString().padStart(3, '0')}`,
        name: `Empleado TechCorp ${i}`,
        email: `empleado${i}@techcorp.mx`,
        rfc: `ETC${i.toString().padStart(6, '0')}H1A`,
        position: i <= 15 ? 'Desarrollador' : i <= 30 ? 'Analista' : 'Gerente',
        department: i <= 20 ? 'Tecnología' : i <= 35 ? 'Ventas' : 'Administración',
        baseSalary: 15000 + (i * 500),
        hireDate: new Date(`2023-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`),
        contractType: 'INDEFINITE',
        status: 'ACTIVE',
        companyId: companies[0].id
      }
    });
    employees.push(employee);
  }

  // Asociar primer empleado con usuario employee
  await prisma.user.update({
    where: { id: users[2].id },
    data: { employeeId: employees[0].id }
  });

  // Crear wizards para las empresas
  for (const company of companies) {
    const wizard = await prisma.companyWizard.create({
      data: {
        companyId: company.id,
        status: 'IN_PROGRESS',
        currentSection: 1,
        currentStep: 1,
        wizardData: {}
      }
    });

    // Crear secciones del wizard
    const sections = [
      { sectionNumber: 1, sectionName: 'Datos Generales', isOptional: false },
      { sectionNumber: 2, sectionName: 'Obligaciones Patronales', isOptional: false },
      { sectionNumber: 3, sectionName: 'Bancos', isOptional: false },
      { sectionNumber: 4, sectionName: 'Sellos Digitales', isOptional: false },
      { sectionNumber: 5, sectionName: 'Estructura Organizacional', isOptional: false },
      { sectionNumber: 6, sectionName: 'Prestaciones', isOptional: false },
      { sectionNumber: 7, sectionName: 'Nómina', isOptional: false },
      { sectionNumber: 8, sectionName: 'Talento Humano', isOptional: true }
    ];

    for (const section of sections) {
      const wizardSection = await prisma.companyWizardSection.create({
        data: {
          wizardId: wizard.id,
          ...section,
          status: section.sectionNumber === 1 ? 'IN_PROGRESS' : 'PENDING'
        }
      });

      // Crear pasos para cada sección
      let steps: Array<{ stepNumber: number; stepName: string; isOptional: boolean }> = [];
      switch (section.sectionNumber) {
        case 1:
          steps = [
            { stepNumber: 1, stepName: 'Información General', isOptional: false },
            { stepNumber: 2, stepName: 'Domicilio', isOptional: false },
            { stepNumber: 3, stepName: 'Representante Legal', isOptional: false }
          ];
          break;
        case 2:
          steps = [
            { stepNumber: 1, stepName: 'Registro IMSS', isOptional: false },
            { stepNumber: 2, stepName: 'FONACOT', isOptional: true }
          ];
          break;
        case 3:
          steps = [
            { stepNumber: 1, stepName: 'Cuentas Bancarias', isOptional: false }
          ];
          break;
        case 4:
          steps = [
            { stepNumber: 1, stepName: 'Certificados SAT', isOptional: false }
          ];
          break;
        case 5:
          steps = [
            { stepNumber: 1, stepName: 'Áreas', isOptional: false },
            { stepNumber: 2, stepName: 'Departamentos', isOptional: false },
            { stepNumber: 3, stepName: 'Puestos', isOptional: false }
          ];
          break;
        case 6:
          steps = [
            { stepNumber: 1, stepName: 'Prestaciones', isOptional: false },
            { stepNumber: 2, stepName: 'Grupos de Prestaciones', isOptional: true }
          ];
          break;
        case 7:
          steps = [
            { stepNumber: 1, stepName: 'Calendario Laboral', isOptional: false },
            { stepNumber: 2, stepName: 'Configuración de Nómina', isOptional: false }
          ];
          break;
        case 8:
          steps = [
            { stepNumber: 1, stepName: 'Horarios', isOptional: false },
            { stepNumber: 2, stepName: 'Políticas', isOptional: true }
          ];
          break;
      }

      for (const step of steps) {
        await prisma.companyWizardStep.create({
          data: {
            sectionId: wizardSection.id,
            ...step,
            status: section.sectionNumber === 1 && step.stepNumber === 1 ? 'IN_PROGRESS' : 'PENDING',
            stepData: {}
          }
        });
      }
    }

    // Crear algunos datos de ejemplo para la primera empresa
    if (company.id === companies[0].id) {
      // Información general
      await prisma.companyGeneralInfo.create({
        data: {
          companyId: company.id,
          businessName: company.legalName,
          commercialName: company.name,
          rfc: company.rfc,
          taxRegime: '601 - General de Ley Personas Morales',
          startDate: new Date('2020-01-01'),
          street: 'Av. Reforma',
          exteriorNumber: '123',
          interiorNumber: 'Piso 5',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '06000',
          country: 'México',
          legalRepName: 'Roberto Hernández López',
          legalRepRFC: 'HELR850215HDF',
          legalRepCurp: 'HELR850215HDFLPR08',
          legalRepPosition: 'Representante Legal',
          notarialPower: 'Escritura Pública No. 12345',
          notaryNumber: '45',
          notaryName: 'Lic. María González'
        }
      });

      // Obligaciones patronales
      await prisma.companyTaxObligations.create({
        data: {
          companyId: company.id,
          imssRegistration: 'Y12-34567-89-0',
          imssClassification: 'Clase III',
          imssRiskClass: '3.54',
          imssAddress: 'Av. Reforma 123',
          imssCity: 'Ciudad de México',
          imssState: 'CDMX',
          imssZipCode: '06000',
          fonacotRegistration: 'FON123456',
          fonacotCenter: 'Centro CDMX'
        }
      });

      // Bancos
      await prisma.companyBank.create({
        data: {
          companyId: company.id,
          bankName: 'BBVA México',
          bankType: 'PAYROLL',
          accountNumber: '0123456789',
          clabe: '012180001234567890',
          isPrimary: true
        }
      });

      // Certificado digital
      await prisma.companyDigitalCertificate.create({
        data: {
          companyId: company.id,
          certificateFile: '/certs/cert_techcorp.cer',
          keyFile: '/certs/key_techcorp.key',
          password: 'encrypted_password',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2028-01-01')
        }
      });

      // Áreas
      const areas = await Promise.all([
        prisma.companyArea.create({
          data: {
            companyId: company.id,
            name: 'Tecnología',
            description: 'Área de desarrollo y soporte técnico',
            isActive: true
          }
        }),
        prisma.companyArea.create({
          data: {
            companyId: company.id,
            name: 'Ventas',
            description: 'Área comercial y ventas',
            isActive: true
          }
        }),
        prisma.companyArea.create({
          data: {
            companyId: company.id,
            name: 'Administración',
            description: 'Área administrativa y finanzas',
            isActive: true
          }
        })
      ]);

      // Departamentos
      const departments = await Promise.all([
        prisma.companyDepartment.create({
          data: {
            companyId: company.id,
            areaId: areas[0].id,
            name: 'Desarrollo',
            description: 'Desarrollo de software',
            isActive: true
          }
        }),
        prisma.companyDepartment.create({
          data: {
            companyId: company.id,
            areaId: areas[0].id,
            name: 'Soporte',
            description: 'Soporte técnico',
            isActive: true
          }
        }),
        prisma.companyDepartment.create({
          data: {
            companyId: company.id,
            areaId: areas[1].id,
            name: 'Ventas Directas',
            description: 'Ventas al cliente final',
            isActive: true
          }
        })
      ]);

      // Puestos
      await Promise.all([
        prisma.companyPosition.create({
          data: {
            companyId: company.id,
            departmentId: departments[0].id,
            name: 'Desarrollador Jr',
            description: 'Desarrollador nivel junior',
            minSalary: 15000,
            maxSalary: 25000,
            isActive: true
          }
        }),
        prisma.companyPosition.create({
          data: {
            companyId: company.id,
            departmentId: departments[0].id,
            name: 'Desarrollador Sr',
            description: 'Desarrollador nivel senior',
            minSalary: 30000,
            maxSalary: 50000,
            isActive: true
          }
        })
      ]);

      // Prestaciones
      const benefits = await Promise.all([
        prisma.companyBenefit.create({
          data: {
            companyId: company.id,
            name: 'Aguinaldo',
            type: 'DAYS',
            isLegal: true,
            amount: 15,
            description: 'Días de aguinaldo por ley'
          }
        }),
        prisma.companyBenefit.create({
          data: {
            companyId: company.id,
            name: 'Prima Vacacional',
            type: 'PERCENTAGE',
            isLegal: true,
            percentage: 25,
            description: 'Prima vacacional del 25%'
          }
        }),
        prisma.companyBenefit.create({
          data: {
            companyId: company.id,
            name: 'Vales de Despensa',
            type: 'FIXED_AMOUNT',
            isLegal: false,
            amount: 2000,
            description: 'Vales de despensa mensuales'
          }
        })
      ]);

      // Grupo de prestaciones
      await prisma.companyBenefitGroup.create({
        data: {
          companyId: company.id,
          name: 'Paquete Básico',
          description: 'Prestaciones básicas de ley',
          benefits: benefits.map(b => b.id)
        }
      });

      // Horarios
      await prisma.companySchedule.create({
        data: {
          companyId: company.id,
          name: 'Horario Oficina',
          startTime: '09:00',
          endTime: '18:00',
          breakTime: 60,
          workDays: [1, 2, 3, 4, 5] // Lunes a Viernes
        }
      });

      // Calendario laboral
      await prisma.calendar.create({
        data: {
          companyId: company.id,
          name: 'Calendario 2025',
          year: 2025,
          workDays: [1, 2, 3, 4, 5],
          holidays: [
            { date: '2025-01-01', name: 'Año Nuevo' },
            { date: '2025-02-03', name: 'Día de la Constitución' },
            { date: '2025-03-17', name: 'Natalicio de Benito Juárez' },
            { date: '2025-05-01', name: 'Día del Trabajo' },
            { date: '2025-09-16', name: 'Día de la Independencia' },
            { date: '2025-11-17', name: 'Revolución Mexicana' },
            { date: '2025-12-25', name: 'Navidad' }
          ],
          isDefault: true
        }
      });
    }
  }

  console.log('✅ Seed completado exitosamente');
  console.log(`📊 Creados: ${companies.length} empresas, ${users.length} usuarios, ${employees.length} empleados`);
  console.log('🧙‍♂️ Wizards y datos de configuración creados para las empresas');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });