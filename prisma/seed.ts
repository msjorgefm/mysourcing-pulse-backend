import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedPostalCodes } from './seeds/postalCodes';
import { seedStates } from './seeds/states';
import { seedLocations } from './seeds/locations';
import { seedImssRiskClasses } from './seeders/imssRiskClass';
import { seedBanks } from './seeders/banks';
import { seedIMSSDelegaciones } from './seeders/imssDelegaciones';
import { seedIMSSOrigenMovimiento } from './seeders/imssOrigenMovimiento';
import { seedIMSSSubdelegaciones } from './seeders/imssSubdelegaciones';
import { seedEmployeeCatalogs } from './seeders/employeeCatalogs';

const prisma = new PrismaClient();

async function seedCatalogs() {
  console.log('📚 Seeding catalogs...');
  
  // Seed Tax Regimes
  const taxRegimes = [
    // Personas Morales
    { code: '601', name: 'General de Ley Personas Morales', tipoPersona: 'MORAL' },
    { code: '603', name: 'Personas Morales con Fines no Lucrativos', tipoPersona: 'MORAL' },
    { code: '607', name: 'Régimen de Enajenación o Adquisición de Bienes', tipoPersona: 'MORAL' },
    { code: '609', name: 'Consolidación', tipoPersona: 'MORAL' },
    { code: '610', name: 'Residentes en el Extranjero sin Establecimiento Permanente en México', tipoPersona: 'MORAL' },
    { code: '622', name: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', tipoPersona: 'MORAL' },
    { code: '623', name: 'Opcional para Grupos de Sociedades', tipoPersona: 'MORAL' },
    { code: '624', name: 'Coordinados', tipoPersona: 'MORAL' },
    { code: '628', name: 'Hidrocarburos', tipoPersona: 'MORAL' },
    
    // Personas Físicas
    { code: '605', name: 'Sueldos y Salarios e Ingresos Asimilados a Salarios', tipoPersona: 'FISICA' },
    { code: '606', name: 'Arrendamiento', tipoPersona: 'FISICA' },
    { code: '608', name: 'Demás ingresos', tipoPersona: 'FISICA' },
    { code: '611', name: 'Ingresos por Dividendos (socios y accionistas)', tipoPersona: 'FISICA' },
    { code: '612', name: 'Personas Físicas con Actividades Empresariales y Profesionales', tipoPersona: 'FISICA' },
    { code: '614', name: 'Ingresos por intereses', tipoPersona: 'FISICA' },
    { code: '615', name: 'Régimen de los ingresos por obtención de premios', tipoPersona: 'FISICA' },
    { code: '616', name: 'Sin obligaciones fiscales', tipoPersona: 'FISICA' },
    { code: '621', name: 'Incorporación Fiscal', tipoPersona: 'FISICA' },
    { code: '625', name: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', tipoPersona: 'FISICA' },
    { code: '626', name: 'Régimen Simplificado de Confianza', tipoPersona: 'FISICA' },
  ];

  for (const regime of taxRegimes) {
    await prisma.taxRegime.upsert({
      where: { code: regime.code },
      update: { name: regime.name, tipoPersona: regime.tipoPersona },
      create: regime,
    });
  }

  // Seed Economic Activities
  const economicActivities = [
    { code: '11', name: 'Agricultura, cría y explotación de animales, aprovechamiento forestal, pesca y caza' },
    { code: '21', name: 'Minería' },
    { code: '22', name: 'Generación, transmisión, distribución y comercialización de energía eléctrica, suministro de agua y de gas' },
    { code: '23', name: 'Construcción' },
    { code: '31-33', name: 'Industrias manufactureras' },
    { code: '43', name: 'Comercio al por mayor' },
    { code: '46', name: 'Comercio al por menor' },
    { code: '48-49', name: 'Transportes, correos y almacenamiento' },
    { code: '51', name: 'Información en medios masivos' },
    { code: '52', name: 'Servicios financieros y de seguros' },
    { code: '53', name: 'Servicios inmobiliarios y de alquiler de bienes muebles e intangibles' },
    { code: '54', name: 'Servicios profesionales, científicos y técnicos' },
    { code: '55', name: 'Corporativos' },
    { code: '56', name: 'Servicios de apoyo a los negocios y manejo de residuos, y servicios de remediación' },
    { code: '61', name: 'Servicios educativos' },
    { code: '62', name: 'Servicios de salud y de asistencia social' },
    { code: '71', name: 'Servicios de esparcimiento culturales y deportivos, y otros servicios recreativos' },
    { code: '72', name: 'Servicios de alojamiento temporal y de preparación de alimentos y bebidas' },
    { code: '81', name: 'Otros servicios excepto actividades gubernamentales' },
    { code: '93', name: 'Actividades legislativas, gubernamentales, de impartición de justicia y de organismos internacionales' },
  ];

  for (const activity of economicActivities) {
    await prisma.economicActivity.upsert({
      where: { code: activity.code },
      update: { name: activity.name },
      create: activity,
    });
  }

  console.log('✅ Catalogs seeded successfully!');
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Primero, seed de los catálogos
  await seedCatalogs();
  
  // Seed de tipos de identificación
  console.log('🆔 Seeding identification types...');
  const identificationTypes = [
    { code: 'INE', nombre: 'INE (Instituto Nacional Electoral)' },
    { code: 'PASAPORTE', nombre: 'Pasaporte' },
    { code: 'CEDULA', nombre: 'Cédula Profesional' },
    { code: 'LICENCIA', nombre: 'Licencia de Conducir' },
    { code: 'CARTILLA', nombre: 'Cartilla del Servicio Militar' },
    { code: 'FM3', nombre: 'Forma Migratoria (FM3)' },
    { code: 'RESIDENCIA', nombre: 'Tarjeta de Residencia' },
  ];

  for (const idType of identificationTypes) {
    await prisma.identificationType.upsert({
      where: { code: idType.code },
      update: { nombre: idType.nombre },
      create: idType,
    });
  }
  
  // Seed de estados
  await seedStates();
  
  // Seed de locations (municipios, ciudades, colonias)
  await seedLocations();
  
  // Seed de códigos postales
  await seedPostalCodes();
  
  // Seed de clases de riesgo IMSS
  await seedImssRiskClasses();
  
  // Seed de catálogo de bancos
  await seedBanks();

  // Seed IMSS Catalogs
  await seedIMSSOrigenMovimiento();
  await seedIMSSDelegaciones();
  await seedIMSSSubdelegaciones();
  
  // Seed catálogos de empleados
  await seedEmployeeCatalogs();

  // Crear contraseñas hasheadas
  const adminPassword = await bcrypt.hash('admin123', 12);
  const operatorPassword = await bcrypt.hash('operator123', 12);
  const clientPassword = await bcrypt.hash('client123', 12);
  const employeePassword = await bcrypt.hash('employee123', 12);
  
  // Primero crear el usuario administrador principal
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mysourcing.mx' },
    update: {
      password: adminPassword,
      username: 'Administrador Principal',
      firstName: 'Admin',
      lastName: 'Principal',
      role: 'ADMIN',
      isActive: true
    },
    create: {
      email: 'admin@mysourcing.mx',
      password: adminPassword,
      username: 'Administrador Principal',
      firstName: 'Admin',
      lastName: 'Principal',
      role: 'ADMIN',
      isActive: true
    }
  });
  
  console.log('✅ Usuario administrador creado');

  // Crear o actualizar empresas
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { rfc: 'TCM850101A1B' },
      update: {
        name: 'TechCorp México',
        legalName: 'Tecnología Corporativa de México SA de CV',
        address: 'Av. Reforma 123, Col. Centro, CDMX',
        email: 'admin@techcorp.mx',
        phone: '55-1234-5678',
        status: 'ACTIVE',
        employeesCount: 45,
        managedByAdminId: adminUser.id // Vincular al admin
      },
      create: {
        name: 'TechCorp México',
        rfc: 'TCM850101A1B',
        legalName: 'Tecnología Corporativa de México SA de CV',
        address: 'Av. Reforma 123, Col. Centro, CDMX',
        email: 'admin@techcorp.mx',
        phone: '55-1234-5678',
        status: 'ACTIVE',
        employeesCount: 45,
        managedByAdminId: adminUser.id // Vincular al admin
      }
    }),
    prisma.company.upsert({
      where: { rfc: 'RSL900215C2D' },
      update: {
        name: 'Retail Solutions SA',
        legalName: 'Retail Solutions Sociedad Anónima',
        address: 'Blvd. Avila Camacho 456, Naucalpan, EdoMex',
        email: 'contacto@retailsolutions.mx',
        phone: '55-9876-5432',
        status: 'CONFIGURED',
        employeesCount: 120,
        managedByAdminId: adminUser.id // Vincular al admin
      },
      create: {
        name: 'Retail Solutions SA',
        rfc: 'RSL900215C2D',
        legalName: 'Retail Solutions Sociedad Anónima',
        address: 'Blvd. Avila Camacho 456, Naucalpan, EdoMex',
        email: 'contacto@retailsolutions.mx',
        phone: '55-9876-5432',
        status: 'CONFIGURED',
        employeesCount: 120,
        managedByAdminId: adminUser.id // Vincular al admin
      }
    }),
    // Agregar Empresa Demo con RFC EDE2401010A1
    prisma.company.upsert({
      where: { rfc: 'EDE2401010A1' },
      update: {
        name: 'Empresa Demo S.A. de C.V.',
        legalName: 'Empresa Demostrativa Sociedad Anónima de Capital Variable',
        address: 'Av. Reforma 123, Col. Centro, CDMX',
        email: 'contacto@empresademo.com',
        phone: '5551234567',
        status: 'CONFIGURED',
        employeesCount: 10,
        managedByAdminId: adminUser.id // Vincular al admin
      },
      create: {
        name: 'Empresa Demo S.A. de C.V.',
        rfc: 'EDE2401010A1',
        legalName: 'Empresa Demostrativa Sociedad Anónima de Capital Variable',
        address: 'Av. Reforma 123, Col. Centro, CDMX',
        email: 'contacto@empresademo.com',
        phone: '5551234567',
        status: 'CONFIGURED',
        employeesCount: 10,
        managedByAdminId: adminUser.id // Vincular al admin
      }
    })
  ]);

  // Crear operadores asignados al administrador
  const operators = await Promise.all([
    prisma.user.upsert({
      where: { email: 'carlos@mysourcing.mx' },
      update: {
        password: operatorPassword,
        username: 'carlos.mendoza',
        firstName: 'Carlos',
        lastName: 'Mendoza',
        role: 'OPERATOR',
        managedByAdminId: adminUser.id // Vincular al admin
      },
      create: {
        email: 'carlos@mysourcing.mx',
        password: operatorPassword,
        username: 'carlos.mendoza',
        firstName: 'Carlos',
        lastName: 'Mendoza',
        role: 'OPERATOR',
        managedByAdminId: adminUser.id // Vincular al admin
      }
    }),
    prisma.user.upsert({
      where: { email: 'maria@mysourcing.mx' },
      update: {
        password: operatorPassword,
        username: 'maria.garcia',
        firstName: 'María',
        lastName: 'García',
        role: 'OPERATOR',
        managedByAdminId: adminUser.id // Vincular al admin
      },
      create: {
        email: 'maria@mysourcing.mx',
        password: operatorPassword,
        username: 'maria.garcia',
        firstName: 'María',
        lastName: 'García',
        role: 'OPERATOR',
        managedByAdminId: adminUser.id // Vincular al admin
      }
    })
  ]);
  
  console.log(`✅ ${operators.length} operadores creados y vinculados al administrador`);
  
  // Crear usuarios clientes
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ana@techcorp.mx' },
      update: {
        password: clientPassword,
        username: 'ana.rivera',
        firstName: 'Ana',
        lastName: 'Rivera',
        role: 'CLIENT',
        companyId: companies[0].id
      },
      create: {
        email: 'ana@techcorp.mx',
        password: clientPassword,
        username: 'ana.rivera',
        firstName: 'Ana',
        lastName: 'Rivera',
        role: 'CLIENT',
        companyId: companies[0].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'juan.perez@techcorp.mx' },
      update: {
        password: employeePassword,
        username: 'juan.perez',
        firstName: 'Juan',
        lastName: 'Perez',
        role: 'EMPLOYEE',
        companyId: companies[0].id
      },
      create: {
        email: 'juan.perez@techcorp.mx',
        password: employeePassword,
        username: 'juan.perez',
        firstName: 'Juan',
        lastName: 'Perez',
        role: 'EMPLOYEE',
        companyId: companies[0].id
      }
    }),
    // Usuario cliente para Empresa Demo
    prisma.user.upsert({
      where: { email: 'contacto@empresademo.com' },
      update: {
        password: clientPassword,
        username: 'Administrador Demo',
        role: 'CLIENT',
        companyId: companies[2].id // Empresa Demo es la tercera empresa
      },
      create: {
        email: 'contacto@empresademo.com',
        password: clientPassword,
        username: 'Administrador Demo',
        role: 'CLIENT',
        companyId: companies[2].id
      }
    })
  ]);
  
  // Asignar operadores a las empresas mediante OperatorCompany
  await Promise.all([
    // Carlos maneja TechCorp y Empresa Demo
    prisma.operatorCompany.upsert({
      where: {
        operatorId_companyId: {
          operatorId: operators[0].id,
          companyId: companies[0].id
        }
      },
      update: {
        isActive: true,
        assignedBy: adminUser.id
      },
      create: {
        operatorId: operators[0].id,
        companyId: companies[0].id,
        assignedBy: adminUser.id,
        isActive: true
      }
    }),
    prisma.operatorCompany.upsert({
      where: {
        operatorId_companyId: {
          operatorId: operators[0].id,
          companyId: companies[2].id // Empresa Demo
        }
      },
      update: {
        isActive: true,
        assignedBy: adminUser.id
      },
      create: {
        operatorId: operators[0].id,
        companyId: companies[2].id, // Empresa Demo
        assignedBy: adminUser.id,
        isActive: true
      }
    }),
    // María maneja Retail Solutions
    prisma.operatorCompany.upsert({
      where: {
        operatorId_companyId: {
          operatorId: operators[1].id,
          companyId: companies[1].id
        }
      },
      update: {
        isActive: true,
        assignedBy: adminUser.id
      },
      create: {
        operatorId: operators[1].id,
        companyId: companies[1].id,
        assignedBy: adminUser.id,
        isActive: true
      }
    })
  ]);
  
  console.log('✅ Operadores asignados a empresas');

  // Crear trabajadores para TechCorp
  const workers: any[] = [];
  for (let i = 1; i <= 45; i++) {
    const numeroTrabajador = i;
    const worker = await prisma.workerDetails.upsert({
      where: {
        companyId_numeroTrabajador: {
          companyId: companies[0].id,
          numeroTrabajador
        }
      },
      update: {
        nombres: `Trabajador TechCorp ${i}`,
        apellidoPaterno: `Apellido${i}`,
        apellidoMaterno: `Materno${i}`,
        fechaNacimiento: new Date(`${1980 + Math.floor(Math.random() * 20)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`),
        estadoCivil: 'SOLTERO',
        rfc: `ETC${i.toString().padStart(7, '0')}H1A`,
        curp: `AAAA${i.toString().padStart(6, '0')}HDFAAA0${i % 10}`,
        nss: `${i.toString().padStart(11, '0')}`
      },
      create: {
        companyId: companies[0].id,
        numeroTrabajador,
        nombres: `Trabajador TechCorp ${i}`,
        apellidoPaterno: `Apellido${i}`,
        apellidoMaterno: `Materno${i}`,
        fechaNacimiento: new Date(`${1980 + Math.floor(Math.random() * 20)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`),
        sexo: i % 2 === 0 ? 'MASCULINO' : 'FEMENINO',
        nacionalidad: 'MEXICANA',
        estadoCivil: 'SOLTERO',
        rfc: `ETC${i.toString().padStart(7, '0')}H1A`,
        curp: `AAAA${i.toString().padStart(6, '0')}HDFAAA0${i % 10}`,
        nss: `${i.toString().padStart(11, '0')}`,
        umf: Math.floor(Math.random() * 100) + 1,
        activo: true
      }
    });
    workers.push(worker);
  }

  // Asociar primer trabajador con usuario employee
  // Primero verificar si el usuario employee (juan.perez@techcorp.mx) existe
  const employeeUser = users.find(u => u.email === 'juan.perez@techcorp.mx');
  if (employeeUser && workers.length > 0) {
    await prisma.user.update({
      where: { id: employeeUser.id },
      data: { workerDetailsId: workers[0].id }
    });
  }

  // Crear wizards para las empresas
  for (const company of companies) {
    // Verificar si el wizard ya existe
    const existingWizard = await prisma.companyWizard.findUnique({
      where: { companyId: company.id }
    });
    
    const wizard = existingWizard || await prisma.companyWizard.create({
      data: {
        companyId: company.id,
        status: 'IN_PROGRESS',
        currentSection: 1,
        currentStep: 1,
        wizardData: {}
      }
    });

    // Crear secciones del wizard si no existe el wizard previamente
    if (!existingWizard) {
      const sections = [
        { sectionNumber: 1, sectionName: 'Datos Generales', isOptional: false },
        { sectionNumber: 2, sectionName: 'Obligaciones Patronales', isOptional: false },
        { sectionNumber: 3, sectionName: 'Bancos', isOptional: false },
        { sectionNumber: 4, sectionName: 'Sellos Digitales', isOptional: false },
        { sectionNumber: 5, sectionName: 'Estructura Organizacional', isOptional: false },
        { sectionNumber: 6, sectionName: 'Nómina', isOptional: false },
        { sectionNumber: 7, sectionName: 'Talento Humano', isOptional: true }
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
            { stepNumber: 3, stepName: 'Representante Legal', isOptional: false },
            { stepNumber: 4, stepName: 'Poder Notarial', isOptional: false }
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
            { stepNumber: 1, stepName: 'Áreas', isOptional: true },
            { stepNumber: 2, stepName: 'Departamentos', isOptional: true },
            { stepNumber: 3, stepName: 'Puestos', isOptional: false }
          ];
          break;
        case 6:
          steps = [
            { stepNumber: 1, stepName: 'Calendario', isOptional: false }
          ];
          break;
        case 7:
          steps = [
            { stepNumber: 1, stepName: 'Alta Trabajadores', isOptional: false }
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
    }

    // Crear algunos datos de ejemplo para la primera empresa
    if (company.id === companies[0].id) {
      // Paso 1: Información general
      await prisma.companyGeneralInfo.upsert({
        where: { companyId: company.id },
        update: {
          businessName: company.legalName,
          commercialName: company.name,
          rfc: company.rfc,
          taxRegime: '601',
          tipoPersona: 'MORAL',
          actividadEconomica: '54',
          startDate: new Date('2020-01-01')
        },
        create: {
          companyId: company.id,
          businessName: company.legalName,
          commercialName: company.name,
          rfc: company.rfc,
          taxRegime: '601',
          tipoPersona: 'MORAL',
          actividadEconomica: '54',
          startDate: new Date('2020-01-01')
        }
      });

      // Paso 2: Domicilio
      await prisma.companyAddress.upsert({
        where: { companyId: company.id },
        update: {
          tipoDomicilio: 'matriz',
          nombreSucursal: 'Oficina Central',
          street: 'Av. Reforma',
          exteriorNumber: '123',
          interiorNumber: 'Piso 5',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CMX',
          zipCode: '06000',
          municipio: 'Cuauhtémoc'
        },
        create: {
          companyId: company.id,
          tipoDomicilio: 'matriz',
          nombreSucursal: 'Oficina Central',
          street: 'Av. Reforma',
          exteriorNumber: '123',
          interiorNumber: 'Piso 5',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CMX',
          zipCode: '06000',
          municipio: 'Cuauhtémoc'
        }
      });

      // Paso 3: Representante Legal
      // Primero buscar un tipo de identificación
      const tipoIdentificacion = await prisma.identificationType.findFirst({
        where: { code: 'INE' }
      });

      // Buscar un estado para el poder notarial
      const estadoCDMX = await prisma.state.findFirst({
        where: { code: 'CMX' }
      });
      
      // Buscar un municipio de CDMX
      const municipioCuauhtemoc = estadoCDMX ? await prisma.municipio.findFirst({
        where: { 
          stateCode: estadoCDMX.code,
          name: { contains: 'Cuauhtémoc' }
        }
      }) : null;

      await prisma.companyLegalRepresentative.upsert({
        where: { companyId: company.id },
        update: {
          name: 'Roberto',
          primerApellido: 'Hernández',
          segundoApellido: 'López',
          tipoIdentificacionId: tipoIdentificacion?.id || null,
          uriIdentificacion: null
        },
        create: {
          companyId: company.id,
          name: 'Roberto',
          primerApellido: 'Hernández',
          segundoApellido: 'López',
          tipoIdentificacionId: tipoIdentificacion?.id || null,
          uriIdentificacion: null
        }
      });

      // Paso 4: Poder Notarial
      if (estadoCDMX && municipioCuauhtemoc) {
        await prisma.companyNotarialPower.upsert({
          where: { companyId: company.id },
          update: {
            folioPoderNotarial: 'NOT-2024-12345',
            fechaEmision: new Date('2024-01-15'),
            fechaVigencia: new Date('2029-01-15'),
            nombreFederatario: 'Lic. Juan Carlos Martínez Sánchez',
            numeroFederatario: 157,
            estadoId: estadoCDMX.id,
            municipioId: municipioCuauhtemoc.id,
            uriPoderNotarial: null
          },
          create: {
            companyId: company.id,
            folioPoderNotarial: 'NOT-2024-12345',
            fechaEmision: new Date('2024-01-15'),
            fechaVigencia: new Date('2029-01-15'),
            nombreFederatario: 'Lic. Juan Carlos Martínez Sánchez',
            numeroFederatario: 157,
            estadoId: estadoCDMX.id,
            municipioId: municipioCuauhtemoc.id,
            uriPoderNotarial: null
          }
        });
      }

      // Obligaciones patronales
      // Buscar clase de riesgo III
      const claseRiesgoIMSS = await prisma.claseRiesgoIMSS.findFirst({
        where: { codigo: 'III' }
      });

      // Crear o actualizar IMSS Registro Patronal
      await prisma.iMSSRegistroPatronal.upsert({
        where: { companyId: company.id },
        update: {
          clvRegistroPatronal: 'Y1234567890',
          actividadEconomica: '54',
          claseRiesgoId: claseRiesgoIMSS?.id,
          numFraccion: 1,
          numPrismaRiesgo: 3.54,
          fechaVigencia: new Date('2025-12-31'),
          nomDomicilio: 'Av. Reforma 123, Col. Centro, CDMX'
        },
        create: {
          companyId: company.id,
          clvRegistroPatronal: 'Y1234567890',
          actividadEconomica: '54',
          claseRiesgoId: claseRiesgoIMSS?.id,
          numFraccion: 1,
          numPrismaRiesgo: 3.54,
          fechaVigencia: new Date('2025-12-31'),
          nomDomicilio: 'Av. Reforma 123, Col. Centro, CDMX'
        }
      });

      // Crear o actualizar FONACOT
      await prisma.fonacot.upsert({
        where: { companyId: company.id },
        update: {
          registroPatronal: 'FON1234',
          fechaAfiliacion: new Date('2024-01-15'),
          uriArchivoFonacot: null
        },
        create: {
          companyId: company.id,
          registroPatronal: 'FON1234',
          fechaAfiliacion: new Date('2024-01-15'),
          uriArchivoFonacot: null
        }
      });

      // Bancos (ahora es un solo registro por empresa)
      // Buscar el banco BBVA
      const bancoBBVA = await prisma.bank.findFirst({
        where: { codigo: '012' } // BBVA México
      });

      if (bancoBBVA) {
        await prisma.companyBank.upsert({
          where: { companyId: company.id },
          update: {
            nomCuentaBancaria: 'Cuenta Nómina Principal',
            bankId: bancoBBVA.id,
            numCuentaBancaria: '0123456789',
            numClabeInterbancaria: '012180001234567890',
            numSucursal: '1234',
            clvDispersion: 40012,
            desCuentaBancaria: 'Cuenta principal para pago de nómina',
            opcCuentaBancariaPrincipal: true
          },
          create: {
            companyId: company.id,
            nomCuentaBancaria: 'Cuenta Nómina Principal',
            bankId: bancoBBVA.id,
            numCuentaBancaria: '0123456789',
            numClabeInterbancaria: '012180001234567890',
            numSucursal: '1234',
            clvDispersion: 40012,
            desCuentaBancaria: 'Cuenta principal para pago de nómina',
            opcCuentaBancariaPrincipal: true
          }
        });
      }

      // Certificado digital
      await prisma.companyDigitalCertificate.upsert({
        where: { companyId: company.id },
        update: {
          certificateFile: '/certs/cert_techcorp.cer',
          keyFile: '/certs/key_techcorp.key',
          password: 'encrypted_password',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2028-01-01')
        },
        create: {
          companyId: company.id,
          certificateFile: '/certs/cert_techcorp.cer',
          keyFile: '/certs/key_techcorp.key',
          password: 'encrypted_password',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2028-01-01')
        }
      });

      // Áreas
      // Primero eliminar áreas existentes
      await prisma.area.deleteMany({ where: { empresaId: company.id } });
      const areas = await Promise.all([
        prisma.area.create({
          data: {
            empresaId: company.id,
            nombre: 'Tecnología',
            descripcion: 'Área de desarrollo y soporte técnico',
            activo: true
          }
        }),
        prisma.area.create({
          data: {
            empresaId: company.id,
            nombre: 'Ventas',
            descripcion: 'Área comercial y ventas',
            activo: true
          }
        }),
        prisma.area.create({
          data: {
            empresaId: company.id,
            nombre: 'Administración',
            descripcion: 'Área administrativa y finanzas',
            activo: true
          }
        })
      ]);

      // Departamentos
      // Primero eliminar departamentos existentes
      await prisma.departamento.deleteMany({ where: { empresaId: company.id } });
      const departamentos = await Promise.all([
        prisma.departamento.create({
          data: {
            empresaId: company.id,
            areaId: areas[0].id,
            nombre: 'Desarrollo',
            descripcion: 'Desarrollo de software',
            activo: true
          }
        }),
        prisma.departamento.create({
          data: {
            empresaId: company.id,
            areaId: areas[0].id,
            nombre: 'Soporte',
            descripcion: 'Soporte técnico',
            activo: true
          }
        }),
        prisma.departamento.create({
          data: {
            empresaId: company.id,
            areaId: areas[1].id,
            nombre: 'Ventas Directas',
            descripcion: 'Ventas al cliente final',
            activo: true
          }
        })
      ]);

      // Puestos (REQUERIDO - mínimo uno)
      // Primero eliminar puestos existentes
      await prisma.puesto.deleteMany({ where: { empresaId: company.id } });
      await Promise.all([
        prisma.puesto.create({
          data: {
            empresaId: company.id,
            areaId: areas[0].id,
            departamentoId: departamentos[0].id,
            nombre: 'Desarrollador Jr',
            activo: true
          }
        }),
        prisma.puesto.create({
          data: {
            empresaId: company.id,
            areaId: areas[0].id,
            departamentoId: departamentos[0].id,
            nombre: 'Desarrollador Sr',
            activo: true
          }
        }),
        prisma.puesto.create({
          data: {
            empresaId: company.id,
            areaId: areas[1].id,
            departamentoId: departamentos[2].id,
            nombre: 'Ejecutivo de Ventas',
            activo: true
          }
        }),
        prisma.puesto.create({
          data: {
            empresaId: company.id,
            nombre: 'Gerente General',
            activo: true
          }
        })
      ]);


      // Horarios
      // Primero eliminar horarios existentes
      await prisma.companySchedule.deleteMany({ where: { companyId: company.id } });
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
      await prisma.calendar.upsert({
        where: {
          companyId_year: {
            companyId: company.id,
            year: 2025
          }
        },
        update: {
          name: 'Calendario 2025',
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
        },
        create: {
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

      // Políticas de la empresa
      // Primero eliminar políticas existentes
      await prisma.companyPolicy.deleteMany({ where: { companyId: company.id } });
      await prisma.companyPolicy.create({
        data: {
          companyId: company.id,
          name: 'Política de Asistencia',
          type: 'ATTENDANCE',
          description: 'Lineamientos para el control de asistencia',
          content: 'Todos los empleados deben registrar su entrada y salida...',
          isActive: true
        }
      });

      await prisma.companyPolicy.create({
        data: {
          companyId: company.id,
          name: 'Política de Vacaciones',
          type: 'VACATION',
          description: 'Reglas para solicitud y aprobación de vacaciones',
          content: 'Las vacaciones deben solicitarse con al menos 15 días de anticipación...',
          isActive: true
        }
      });
    }
  }
  
  // Crear document checklist para Empresa Demo
  await prisma.companyDocumentChecklist.upsert({
    where: { companyId: companies[2].id },
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
    },
    create: {
      companyId: companies[2].id,
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

  console.log('✅ Seed completado exitosamente');
  console.log(`📊 Resumen:`);
  console.log(`   - 1 Administrador principal`);
  console.log(`   - ${operators.length} Operadores`);
  console.log(`   - ${companies.length} Empresas`);
  console.log(`   - ${users.length} Usuarios clientes`);
  console.log(`   - ${workers.length} Trabajadores`);
  console.log('📚 Catálogos: regímenes fiscales y actividades económicas');
  console.log('🧙‍♂️ Wizards y datos de configuración creados para las empresas');
  console.log('🔗 Jerarquía: Admin → Operadores → Empresas → Clientes/Trabajadores');
  
  console.log('\n📧 CREDENCIALES DE ACCESO:');
  console.log('=====================================');
  console.log('ADMINISTRADOR:');
  console.log('  Email: admin@mysourcing.mx');
  console.log('  Password: admin123');
  console.log('\nOPERADORES:');
  console.log('  Carlos Mendoza:');
  console.log('    Email: carlos@mysourcing.mx');
  console.log('    Password: operator123');
  console.log('    Empresas: TechCorp, Empresa Demo');
  console.log('  ');
  console.log('  María García:');
  console.log('    Email: maria@mysourcing.mx');
  console.log('    Password: operator123');
  console.log('    Empresas: Retail Solutions');
  console.log('\nCLIENTE (TechCorp):');
  console.log('  Email: ana@techcorp.mx');
  console.log('  Password: client123');
  console.log('\nCLIENTE (Empresa Demo):');
  console.log('  Email: contacto@empresademo.com');
  console.log('  Password: client123');
  console.log('\nEMPLEADO:');
  console.log('  Email: juan.perez@techcorp.mx');
  console.log('  Password: employee123');
  console.log('=====================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });