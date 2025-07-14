import fs from 'fs';
import path from 'path';

function setupLocalEmail() {
  console.log('🔧 Configurando servicio de correo local (sin envío real)...\n');
  
  const envPath = path.join(__dirname, '../../.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Configurar para modo desarrollo sin SMTP real
  envContent = envContent.replace(
    /SMTP_HOST=.*/,
    `SMTP_HOST=localhost`
  );
  envContent = envContent.replace(
    /SMTP_PORT=.*/,
    `SMTP_PORT=1025`
  );
  envContent = envContent.replace(
    /SMTP_USER=.*/,
    `SMTP_USER=`
  );
  envContent = envContent.replace(
    /SMTP_PASS=.*/,
    `SMTP_PASS=`
  );
  
  // Agregar comentario
  envContent = envContent.replace(
    /# Email configuration.*/,
    `# Email configuration (Local mode - emails are logged to console only)`
  );
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Configuración actualizada para modo local');
  console.log('\n📧 Los correos ahora:');
  console.log('   - Se mostrarán en la consola del servidor');
  console.log('   - No se enviarán realmente');
  console.log('   - Incluirán los enlaces de configuración');
  console.log('\n⚠️  Reinicia el servidor backend para aplicar los cambios');
  
  // Crear archivo para guardar correos localmente
  const emailsDir = path.join(__dirname, '../../emails-sent');
  if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
    console.log('\n📁 Directorio creado: emails-sent/');
    console.log('   Los correos también se guardarán allí como archivos HTML');
  }
}

setupLocalEmail();