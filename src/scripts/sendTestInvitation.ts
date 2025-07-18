import { emailServiceEnhanced as emailService } from '../services/emailServiceEnhanced';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function sendTestInvitation() {
  const email = process.argv[2] || 'miguel.torres@empresademo.com';
  const invitationType = process.argv[3] || 'department_head'; // 'company' or 'department_head'
  
  if (invitationType === 'department_head') {
    // Buscar empleado
    const employee = await prisma.employee.findFirst({
      where: { email: email },
      include: { company: true }
    });
    
    if (!employee) {
      console.log('❌ No se encontró ningún empleado con ese email');
      process.exit(1);
    }
    
    console.log('✅ Empleado encontrado:');
    console.log('   Nombre:', employee.name);
    console.log('   Empresa:', employee.company.name);
    console.log('   Departamento:', employee.department);
    
    // Crear token
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
    
    // Guardar token
    await prisma.invitationToken.create({
      data: {
        token: invitationToken,
        email: email,
        companyId: employee.companyId,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        metadata: {
          role: 'DEPARTMENT_HEAD',
          employeeId: employee.id,
          department: employee.department
        }
      }
    });
    
    const invitationLink = `${config.frontend.url}/setup-department-head?token=${invitationToken}`;
    
    console.log('\n📧 Enviando invitación de jefe de departamento...');
    console.log('   Para:', email);
    console.log('   Empresa:', employee.company.name);
    console.log('   Departamento:', employee.department);
    console.log('   Link:', invitationLink);
    console.log('\n');
    
    try {
      const result = await emailService.sendDepartmentHeadInvitationEmail(
        email,
        employee.company.name,
        employee.department || 'No especificado',
        invitationLink
      );
      
      if (result) {
        console.log('✅ Invitación de jefe de departamento enviada exitosamente');
        
        // Crear usuario si no existe
        const existingUser = await prisma.user.findUnique({
          where: { email: email }
        });
        
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: email,
              name: employee.name,
              firstName: employee.name.split(' ')[0],
              lastName: employee.name.split(' ').slice(1).join(' '),
              role: 'DEPARTMENT_HEAD',
              companyId: employee.companyId,
              isActive: true
            }
          });
          console.log('✅ Usuario de jefe de departamento creado (pendiente de configuración)');
        }
        
        if (config.smtp.host.includes('mailtrap')) {
          console.log('\n📮 IMPORTANTE:');
          console.log('   El correo fue capturado por Mailtrap');
          console.log('   Revísalo en: https://mailtrap.io/inboxes');
        }
      } else {
        console.log('❌ Error al enviar la invitación');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  } else {
    // Invitación de empresa original
    const companyName = 'Empresa Demo S.A. de C.V.';
    const invitationLink = `${config.frontend.url}/setup-account?token=test-token-123`;
    
    console.log('📧 Enviando invitación de empresa...');
    console.log('   Para:', email);
    console.log('   Empresa:', companyName);
    console.log('   Link:', invitationLink);
    console.log('\n');
    
    try {
      const result = await emailService.sendInvitationEmail(email, companyName, invitationLink);
      
      if (result) {
        console.log('✅ Invitación enviada exitosamente');
        
        if (config.smtp.host.includes('mailtrap')) {
          console.log('\n📮 IMPORTANTE:');
          console.log('   El correo fue capturado por Mailtrap');
          console.log('   Revísalo en: https://mailtrap.io/inboxes');
          console.log('   Usuario: 6e8889c30d55cb');
        }
      } else {
        console.log('❌ Error al enviar la invitación');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  await prisma.$disconnect();
  process.exit(0);
}

sendTestInvitation();