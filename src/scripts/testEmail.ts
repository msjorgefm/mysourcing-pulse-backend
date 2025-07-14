import { emailService } from '../services/emailService';
import { config } from '../config';

async function testEmailService() {
  console.log('🚀 Iniciando prueba de servicio de correo...\n');
  
  // Email de prueba - usa el argumento de línea de comandos o un default
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📧 Configuración actual:');
  console.log('   SMTP Host:', config.smtp.host);
  console.log('   SMTP Port:', config.smtp.port);
  console.log('   SMTP User:', config.smtp.user);
  console.log('   From:', config.smtp.from);
  console.log('\n📧 Enviando correo de prueba a:', testEmail);
  console.log('⏳ Por favor espera...\n');
  
  try {
    const result = await emailService.sendEmail({
      to: testEmail,
      subject: 'Prueba de MySourcing Pulse - Servicio de Correo',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Prueba de Correo</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9f9f9; border-radius: 10px; padding: 30px;">
            <h1 style="color: #4F46E5;">¡Prueba Exitosa!</h1>
            <p>Este es un correo de prueba desde MySourcing Pulse.</p>
            <p>Si estás recibiendo este correo, significa que el servicio de email está funcionando correctamente.</p>
            <hr style="margin: 20px 0;">
            <p><strong>Información de la prueba:</strong></p>
            <ul>
              <li>Fecha: ${new Date().toLocaleString('es-MX')}</li>
              <li>Servicio: MySourcing Pulse Email Service</li>
              <li>Estado: ✅ Funcionando</li>
            </ul>
          </div>
        </body>
        </html>
      `
    });
    
    if (result) {
      console.log('✅ ¡Correo enviado exitosamente!');
      console.log('📨 Revisa tu bandeja de entrada (y spam) para:', testEmail);
    } else {
      console.log('❌ No se pudo enviar el correo');
      console.log('🔍 Revisa los logs anteriores para más detalles');
    }
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
  }
  
  console.log('\n🏁 Prueba completada');
  process.exit(0);
}

// Ejecutar la prueba
testEmailService();