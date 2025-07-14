import { PrismaClient } from '@prisma/client';
import { InvitationService } from '../services/invitationService';
import { config } from '../config';

const prisma = new PrismaClient();

async function resendInvitation() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Por favor proporciona un email');
    console.log('   Uso: node dist/scripts/resendCompanyInvitation.js email@ejemplo.com');
    process.exit(1);
  }
  
  try {
    console.log('🔍 Buscando empresa con email:', email);
    
    // Buscar empresa por email
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { email: email },
          { generalInfo: { contactEmail: email } }
        ]
      },
      include: {
        generalInfo: true
      }
    });
    
    if (!company) {
      console.log('❌ No se encontró ninguna empresa con ese email');
      
      // Buscar empleado con ese email
      const employee = await prisma.employee.findFirst({
        where: { email: email },
        include: { company: true }
      });
      
      if (employee) {
        console.log('ℹ️  Ese email pertenece a un empleado:');
        console.log('   Nombre:', employee.name);
        console.log('   Empresa:', employee.company.name);
        console.log('   Email de la empresa:', employee.company.email);
        console.log('\n💡 Para enviar invitación al administrador, usa el email de la empresa');
      }
      
      process.exit(1);
    }
    
    console.log('✅ Empresa encontrada:', company.name);
    console.log('   ID:', company.id);
    console.log('   RFC:', company.rfc);
    console.log('   Estado:', company.status);
    
    // Verificar si ya tiene un usuario administrador
    const adminUser = await prisma.user.findFirst({
      where: {
        companyId: company.id,
        role: 'CLIENT'
      }
    });
    
    if (adminUser && adminUser.password) {
      console.log('\n⚠️  Esta empresa ya tiene un administrador configurado:');
      console.log('   Email:', adminUser.email);
      console.log('   Nombre:', adminUser.name);
      console.log('   ¿Deseas enviar la invitación de todos modos? (La invitación anterior será invalidada)');
    }
    
    console.log('\n📧 Enviando invitación...');
    
    // Reenviar invitación
    const result = await InvitationService.resendInvitation(company.id, email);
    
    if (result.sent) {
      console.log('✅', result.message);
      
      if (config.smtp.host.includes('mailtrap')) {
        console.log('\n📮 IMPORTANTE:');
        console.log('   El correo fue capturado por Mailtrap');
        console.log('   Revísalo en: https://mailtrap.io/inboxes');
        console.log('   La invitación se puede ver allí');
      }
    } else {
      console.log('❌', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resendInvitation();