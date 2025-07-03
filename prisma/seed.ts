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

  console.log('✅ Seed completado exitosamente');
  console.log(`📊 Creados: ${companies.length} empresas, ${users.length} usuarios, ${employees.length} empleados`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });