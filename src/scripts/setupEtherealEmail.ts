import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

async function setupEtherealEmail() {
  console.log('🔧 Configurando Ethereal Email (servicio de prueba gratuito)...\n');
  
  try {
    // Crear cuenta de prueba en Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Cuenta de prueba creada exitosamente!\n');
    console.log('📧 Credenciales generadas:');
    console.log('   Usuario:', testAccount.user);
    console.log('   Contraseña:', testAccount.pass);
    console.log('   Host:', testAccount.smtp.host);
    console.log('   Puerto:', testAccount.smtp.port);
    console.log('   Seguro:', testAccount.smtp.secure);
    console.log('\n🔗 Ver correos enviados en:');
    console.log('   URL: https://ethereal.email/messages');
    console.log('   Usuario:', testAccount.user);
    console.log('   Contraseña:', testAccount.pass);
    
    // Actualizar archivo .env
    const envPath = path.join(__dirname, '../../.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Reemplazar configuración SMTP
    envContent = envContent.replace(
      /SMTP_HOST=.*/,
      `SMTP_HOST=${testAccount.smtp.host}`
    );
    envContent = envContent.replace(
      /SMTP_PORT=.*/,
      `SMTP_PORT=${testAccount.smtp.port}`
    );
    envContent = envContent.replace(
      /SMTP_USER=.*/,
      `SMTP_USER=${testAccount.user}`
    );
    envContent = envContent.replace(
      /SMTP_PASS=.*/,
      `SMTP_PASS=${testAccount.pass}`
    );
    
    // Agregar comentario sobre Ethereal
    envContent = envContent.replace(
      /# Email configuration.*/,
      `# Email configuration (Using Ethereal Email - Free testing service)\n# View sent emails at: https://ethereal.email/messages\n# Login: ${testAccount.user} / ${testAccount.pass}`
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Archivo .env actualizado correctamente');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Reinicia el servidor backend para aplicar los cambios');
    console.log('   2. Los correos se podrán ver en https://ethereal.email/messages');
    console.log('   3. Usa las credenciales mostradas arriba para iniciar sesión');
    console.log('\n💡 Ethereal es un servicio gratuito sin límites de correos');
    console.log('   Los correos no se envían realmente, solo se capturan para pruebas');
    
    // Probar conexión
    console.log('\n🧪 Probando conexión...');
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    await transporter.verify();
    console.log('✅ Conexión exitosa!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupEtherealEmail();