import { PrismaClient } from '@prisma/client';
import { emailService } from '../services/emailService';
import { config } from '../config';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function sendDepartmentHeadInvitation() {
  const email = process.argv[2] || 'miguel.torres@empresademo.com';
  
  try {
    console.log('🔍 Buscando empleado con email:', email);
    
    // Buscar empleado
    const employee = await prisma.employee.findFirst({
      where: { email: email },
      include: { 
        company: true
      }
    });
    
    if (!employee) {
      console.log('❌ No se encontró ningún empleado con ese email');
      process.exit(1);
    }
    
    console.log('✅ Empleado encontrado:');
    console.log('   Nombre:', employee.name);
    console.log('   Empresa:', employee.company.name);
    console.log('   Departamento:', employee.department);
    console.log('   Puesto:', employee.position);
    
    // Verificar si ya tiene un usuario con rol DEPARTMENT_HEAD
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (existingUser && existingUser.role === 'DEPARTMENT_HEAD') {
      console.log('\n⚠️  Este empleado ya tiene una cuenta de jefe de departamento');
      console.log('   Nombre de usuario:', existingUser.username);
      
      if (existingUser.password) {
        console.log('   La cuenta ya está configurada con contraseña');
        console.log('   ¿Deseas enviar una nueva invitación de todos modos?');
      }
    }
    
    // Crear token de invitación
    const tokenPayload = {
      email: email,
      employeeId: employee.id,
      companyId: employee.companyId,
      role: 'DEPARTMENT_HEAD',
      type: 'department_head_invitation'
    };
    
    const invitationToken = jwt.sign(
      tokenPayload,
      config.jwt.secret,
      { expiresIn: '48h' }
    );
    
    // Guardar token en la base de datos
    await prisma.invitationToken.create({
      data: {
        token: invitationToken,
        email: email,
        companyId: employee.companyId,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
        metadata: {
          role: 'DEPARTMENT_HEAD',
          employeeId: employee.id,
          department: employee.department,
          createdAt: new Date().toISOString()
        }
      }
    });
    
    // Crear enlace de invitación
    const invitationLink = `${config.frontend.url}/setup-department-head?token=${invitationToken}`;
    
    console.log('\n📧 Enviando invitación de jefe de departamento...');
    console.log('   Para:', email);
    console.log('   Empresa:', employee.company.name);
    console.log('   Departamento:', employee.department);
    console.log('   Link:', invitationLink);
    
    // Enviar email
    const result = await emailService.sendDepartmentHeadInvitationEmail(
      email,
      employee.company.name,
      employee.department || 'No especificado',
      invitationLink
    );
    
    if (result) {
      console.log('\n✅ Invitación enviada exitosamente');
      
      if (config.smtp.host.includes('mailtrap')) {
        console.log('\n📮 IMPORTANTE:');
        console.log('   El correo fue capturado por Mailtrap');
        console.log('   Revísalo en: https://mailtrap.io/inboxes');
        console.log('   La invitación se puede ver allí');
      }
      
      // Crear o actualizar usuario si no existe
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: email,
            name: employee.name,
            firstName: employee.name.split(' ')[0],
            lastName: employee.name.split(' ').slice(1).join(' '),
            role: 'DEPARTMENT_HEAD',
            companyId: employee.companyId,
            isActive: true,
            // Sin contraseña hasta que configure su cuenta
          }
        });
        console.log('✅ Usuario de jefe de departamento creado (pendiente de configuración)');
      }
      
      // Verificar si ya tiene vinculaciones
      const vinculaciones = await prisma.managerEmployeeRelation.findMany({
        where: { 
          managerId: employee.id,
          isActive: true
        }
      });
      
      if (vinculaciones.length > 0) {
        console.log(`\n✅ Este jefe ya tiene ${vinculaciones.length} empleados a su cargo`);
      } else {
        console.log('\n⚠️  Este jefe aún no tiene empleados asignados');
        console.log('   Los empleados se pueden asignar desde el portal del operador');
      }
      
    } else {
      console.log('❌ Error al enviar la invitación');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

sendDepartmentHeadInvitation();