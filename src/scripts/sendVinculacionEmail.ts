import { PrismaClient } from '@prisma/client';
import { emailServiceEnhanced as emailService } from '../services/emailServiceEnhanced';
import { config } from '../config';

const prisma = new PrismaClient();

async function sendVinculacionEmail() {
  const email = process.argv[2] || 'carmen.gutierrez@empresademo.com';
  
  try {
    console.log('🔍 Buscando vinculación para:', email);
    
    // Buscar el usuario con vinculación de jefe
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        company: true,
        employee: true
      }
    });
    
    if (!user) {
      console.log('❌ No se encontró usuario con ese email');
      process.exit(1);
    }
    
    if (user.role !== 'DEPARTMENT_HEAD') {
      console.log('❌ El usuario no tiene rol de DEPARTMENT_HEAD');
      process.exit(1);
    }
    
    if (!user.setupToken) {
      console.log('❌ El usuario no tiene token de configuración');
      console.log('   Esto puede significar que ya configuró su cuenta');
      process.exit(1);
    }
    
    // Buscar la vinculación de jefe
    const vinculacion = await prisma.vinculacionJefe.findFirst({
      where: {
        usuarioId: user.id,
        activo: true
      },
      include: {
        areas: {
          include: {
            area: true
          }
        },
        departamentos: {
          include: {
            departamento: true
          }
        },
        empleadosACargo: {
          where: { activo: true }
        }
      }
    });
    
    if (!vinculacion) {
      console.log('❌ No se encontró vinculación de jefe activa');
      process.exit(1);
    }
    
    console.log('✅ Vinculación encontrada:');
    console.log('   Nombre:', user.name);
    console.log('   Empresa:', user.company.name);
    console.log('   Areas:', vinculacion.areas.map(a => a.area.name).join(', '));
    console.log('   Empleados a cargo:', vinculacion.empleadosACargo.length);
    console.log('   Token expira:', user.setupTokenExpiry);
    
    // Crear el enlace de configuración
    const setupLink = `${config.frontend.url}/setup-department-head?token=${user.setupToken}`;
    
    console.log('\n📧 Enviando correo de vinculación de jefe...');
    console.log('   Para:', email);
    console.log('   Link:', setupLink);
    
    // Enviar el correo
    const result = await emailService.sendVinculacionJefeEmail(
      email,
      user.name,
      user.company.name,
      setupLink,
      vinculacion.areas.map(a => a.area.name),
      vinculacion.departamentos.map(d => d.departamento.name),
      vinculacion.empleadosACargo.length
    );
    
    if (result) {
      console.log('\n✅ Correo enviado exitosamente');
      
      if (config.smtp.host.includes('mailtrap')) {
        console.log('\n📮 IMPORTANTE:');
        console.log('   El correo fue capturado por Mailtrap (no llegará a tu bandeja real)');
        console.log('   Revísalo en: https://mailtrap.io/inboxes');
        console.log('   Credentials: 6e8889c30d55cb');
        console.log('\n💡 Para enviar correos reales, necesitas:');
        console.log('   1. Cambiar las credenciales SMTP en el archivo .env');
        console.log('   2. Usar un servicio como SendGrid, AWS SES, o un servidor SMTP real');
      }
    } else {
      console.log('❌ Error al enviar el correo');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

sendVinculacionEmail();