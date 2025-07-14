import { config } from '../config';
import { emailService } from '../services/emailService';

console.log('🔍 Verificando configuración de correo...\n');

console.log('📧 Configuración SMTP actual:');
console.log('   Host:', config.smtp.host);
console.log('   Puerto:', config.smtp.port);
console.log('   Usuario:', config.smtp.user);
console.log('   De:', config.smtp.from);

if (config.smtp.host.includes('mailtrap')) {
  console.log('\n⚠️  ATENCIÓN: Estás usando Mailtrap');
  console.log('   Mailtrap es un servicio de PRUEBA que captura emails');
  console.log('   Los correos NO llegarán a las bandejas reales\n');
  
  console.log('📮 Para ver los correos enviados:');
  console.log('   1. Ve a https://mailtrap.io');
  console.log('   2. Inicia sesión con tus credenciales');
  console.log('   3. Ve a tu inbox');
  console.log('   4. Allí verás todos los correos capturados\n');
  
  console.log('💡 Para enviar correos REALES necesitas:');
  console.log('   1. Cambiar las credenciales SMTP en el archivo .env');
  console.log('   2. Usar uno de estos servicios:');
  console.log('      - SendGrid (https://sendgrid.com)');
  console.log('      - AWS SES (https://aws.amazon.com/ses)');
  console.log('      - Mailgun (https://mailgun.com)');
  console.log('      - Tu propio servidor SMTP');
  console.log('   3. Actualizar las variables en .env:');
  console.log('      SMTP_HOST=smtp.sendgrid.net (ejemplo)');
  console.log('      SMTP_PORT=587');
  console.log('      SMTP_USER=tu_usuario');
  console.log('      SMTP_PASS=tu_contraseña');
  console.log('      SMTP_FROM=noreply@tudominio.com\n');
} else {
  console.log('\n✅ Configurado para envío de correos reales');
  console.log('   Los correos se enviarán a las direcciones especificadas');
}

console.log('\n🧪 Probando conexión SMTP...');

// Intentar enviar un correo de prueba
try {
  const testResult = await emailService.sendEmail({
    to: 'test@example.com',
    subject: 'Prueba de configuración SMTP',
    html: '<p>Este es un correo de prueba para verificar la configuración SMTP</p>'
  });
  
  if (testResult) {
    console.log('✅ Conexión SMTP exitosa');
    if (config.smtp.host.includes('mailtrap')) {
      console.log('📮 El correo de prueba fue capturado por Mailtrap');
    }
  } else {
    console.log('❌ Error en la conexión SMTP');
  }
} catch (error) {
  console.log('❌ Error al probar SMTP:', error);
}

process.exit(0);