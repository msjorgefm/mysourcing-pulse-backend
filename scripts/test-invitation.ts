import { InvitationService } from '../src/services/invitationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInvitation() {
  try {
    console.log('🧪 Probando envío de invitación...\n');
    
    // Buscar una empresa existente
    const company = await prisma.company.findFirst({
      where: { status: 'IN_SETUP' }
    });
    
    if (!company) {
      console.log('❌ No se encontró ninguna empresa en estado IN_SETUP');
      console.log('   Crea una empresa primero desde el portal del operador');
      return;
    }
    
    console.log(`📊 Empresa encontrada: ${company.name}`);
    console.log(`📧 Email: ${company.email}\n`);
    
    // Enviar invitación
    await InvitationService.createAndSendInvitation(
      company.id,
      company.email,
      company.name
    );
    
    console.log('\n✅ Prueba completada');
    console.log('   Revisa los logs del servidor para ver el link de invitación');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testInvitation();