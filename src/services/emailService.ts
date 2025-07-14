import nodemailer from 'nodemailer';
import { config } from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Modo desarrollo: simular envío de emails
    if (config.env === 'development' && (!config.smtp.user || !config.smtp.pass)) {
      console.log('⚠️  Modo desarrollo: Los emails se simularán, no se enviarán realmente');
      this.transporter = null as any;
      return;
    }

    // Puerto 465 requiere secure: true, Mailtrap usa 2525
    const isSecure = config.smtp.port === 465;
    
    // Detectar si es Mailtrap
    const isMailtrap = config.smtp.host.includes('mailtrap');
    
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: isSecure, // true para puerto 465, false para otros
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
      tls: {
        // No fallar en certificados inválidos (solo para desarrollo)
        rejectUnauthorized: false
      }
    });
    
    if (isMailtrap) {
      console.log('📧 Usando Mailtrap para captura de emails de prueba');
      console.log('🔗 Ve tus emails en: https://mailtrap.io/inboxes');
    }
    
    // Verificar la configuración
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Error en configuración SMTP:', error);
        console.error('⚠️  Los emails no se podrán enviar. Verifica las credenciales SMTP.');
      } else {
        console.log('✅ Servidor SMTP listo para enviar correos');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const isMailtrap = config.smtp.host.includes('mailtrap');
      
      console.log('\n📧 === ENVIANDO EMAIL ===');
      console.log('📧 Para:', options.to);
      console.log('📧 Asunto:', options.subject);
      console.log('📧 Servidor SMTP:', config.smtp.host);
      console.log('📧 Puerto:', config.smtp.port);
      
      // Guardar email localmente siempre
      this.saveEmailLocally(options);
      
      // Modo desarrollo sin transporter o si es Mailtrap con límite alcanzado
      if (!this.transporter || config.smtp.host === 'localhost') {
        console.log('🔧 MODO LOCAL - Email guardado localmente:');
        console.log('   Para:', options.to);
        console.log('   De:', config.smtp.from);
        console.log('   Asunto:', options.subject);
        console.log('   ---');
        console.log('   📁 Email guardado en: emails-sent/');
        console.log('   ✅ Busca el archivo HTML con el contenido completo');
        return true;
      }
      
      const mailOptions = {
        from: config.smtp.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      };

      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email enviado exitosamente');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        
        if (config.smtp.host.includes('mailtrap')) {
          console.log('\n📮 === MAILTRAP INFO ===');
          console.log('🔗 Ve tu email en: https://mailtrap.io/inboxes');
          console.log('📧 El email fue capturado por Mailtrap (no se envió realmente)');
          console.log('✅ Esto es normal en desarrollo\n');
        }
        
        return true;
      } catch (smtpError: any) {
        // Si es error de límite de Mailtrap, continuar sin error
        if (smtpError.message && smtpError.message.includes('email limit is reached')) {
          console.log('⚠️  Límite de Mailtrap alcanzado - Email guardado localmente');
          console.log('📁 Revisa el archivo en: emails-sent/');
          return true;
        }
        throw smtpError;
      }
    } catch (error: any) {
      console.error('❌ Error al enviar email:');
      console.error('   Error:', error.message);
      console.error('   Código:', error.code);
      console.error('   Comando:', error.command);
      if (error.response) {
        console.error('   Respuesta SMTP:', error.response);
      }
      return false;
    }
  }
  
  private saveEmailLocally(options: EmailOptions): void {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const emailsDir = path.join(__dirname, '../../emails-sent');
      if (!fs.existsSync(emailsDir)) {
        fs.mkdirSync(emailsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}_${options.to.replace('@', '_at_')}.html`;
      const filepath = path.join(emailsDir, filename);
      
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${options.subject}</title>
  <style>
    .email-info {
      background: #f0f0f0;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
      font-family: monospace;
    }
    .email-info h2 {
      margin-top: 0;
      color: #333;
    }
    .email-info p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-info">
    <h2>📧 Información del Email</h2>
    <p><strong>Para:</strong> ${options.to}</p>
    <p><strong>De:</strong> ${config.smtp.from}</p>
    <p><strong>Asunto:</strong> ${options.subject}</p>
    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</p>
    <hr>
    <p><em>Este email fue guardado localmente porque el servicio SMTP tiene límites o no está configurado.</em></p>
  </div>
  
  ${options.html}
</body>
</html>
      `;
      
      fs.writeFileSync(filepath, fullHtml);
      console.log(`📁 Email guardado en: ${filename}`);
      
      // Si hay un link de configuración, extraerlo y mostrarlo
      const linkMatch = options.html.match(/href="([^"]*setup[^"]*)"/);
      if (linkMatch) {
        console.log(`🔗 Link de configuración: ${linkMatch[1]}`);
      }
    } catch (err) {
      console.error('Error guardando email localmente:', err);
    }
  }

  async sendInvitationEmail(email: string, companyName: string, invitationLink: string): Promise<boolean> {
    const subject = `Invitación para configurar tu cuenta en MySourcing Pulse`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitación MySourcing Pulse</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #4338CA;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
          }
          .warning {
            background-color: #FEF3C7;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            border-left: 4px solid #F59E0B;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MySourcing Pulse</h1>
            <p>Sistema de Gestión de Nómina</p>
          </div>
          
          <div class="content">
            <h2>¡Bienvenido a MySourcing Pulse!</h2>
            
            <p>Hola,</p>
            
            <p>La empresa <strong>${companyName}</strong> ha sido registrada en nuestro sistema y has sido designado como administrador.</p>
            
            <p>Para completar la configuración de tu cuenta y establecer tus credenciales de acceso, por favor haz clic en el siguiente enlace:</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Configurar mi cuenta</a>
            </div>
            
            <h3>¿Qué sucederá después?</h3>
            <ol>
              <li>Al hacer clic en el enlace, serás dirigido a una página de configuración</li>
              <li>Deberás crear un nombre de usuario único</li>
              <li>Establecerás una contraseña segura</li>
              <li>Una vez completado, podrás acceder al portal de administración</li>
            </ol>
            
            <div class="warning">
              <strong>Importante:</strong> Este enlace es válido por 48 horas. Si expira, deberás solicitar uno nuevo al operador del sistema.
            </div>
            
            <p>Si no esperabas recibir este correo o tienes alguna pregunta, por favor contacta a nuestro equipo de soporte.</p>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; 2024 MySourcing Pulse. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  async sendDepartmentHeadInvitationEmail(
    email: string, 
    companyName: string, 
    departmentName: string, 
    invitationLink: string
  ): Promise<boolean> {
    const subject = `Invitación para Vinculación de Jefe en ${companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitación MySourcing Pulse</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #4338CA;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
          }
          .warning {
            background-color: #FEF3C7;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            border-left: 4px solid #F59E0B;
          }
          .department-info {
            background-color: #EBF8FF;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #3182CE;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MySourcing Pulse</h1>
            <p>Sistema de Gestión de Nómina</p>
          </div>
          
          <div class="content">
            <h2>¡Has sido invitado para una Vinculación de Jefe!</h2>
            
            <p>Hola,</p>
            
            <p>La empresa <strong>${companyName}</strong> te ha invitado a formar parte de su equipo con una Vinculación de Jefe.</p>
            
            <div class="department-info">
              <strong>Departamento asignado:</strong> ${departmentName}
            </div>
            
            <p>Con tu Vinculación de Jefe, tendrás las siguientes responsabilidades:</p>
            <ul>
              <li>Gestionar las incidencias de los empleados a tu cargo</li>
              <li>Revisar y aprobar reportes de tu departamento</li>
              <li>Coordinar con el área de nómina para el procesamiento correcto</li>
            </ul>
            
            <p>Para aceptar esta invitación y configurar tu cuenta, haz clic en el siguiente enlace:</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Aceptar invitación</a>
            </div>
            
            <h3>Próximos pasos:</h3>
            <ol>
              <li>Haz clic en el enlace para aceptar la invitación</li>
              <li>Completa tu información personal</li>
              <li>Crea tu nombre de usuario y contraseña</li>
              <li>Accede al portal y comienza a gestionar tu departamento</li>
            </ol>
            
            <div class="warning">
              <strong>Importante:</strong> Este enlace es válido por 48 horas. Si expira, deberás solicitar uno nuevo al administrador del sistema.
            </div>
            
            <p>Si no esperabas recibir este correo o tienes alguna pregunta, por favor contacta al administrador de ${companyName}.</p>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; 2024 MySourcing Pulse. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
  
  async sendVinculacionJefeEmail(
    email: string,
    employeeName: string,
    companyName: string,
    setupLink: string,
    areasAsignadas: string[] = [],
    departamentosAsignados: string[] = [],
    empleadosACargo: number = 0
  ): Promise<boolean> {
    const subject = `Has sido designado con una Vinculación de Jefe en ${companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Designación como Jefe - MySourcing Pulse</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #6B46C1;
            margin: 0;
          }
          .content {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #6B46C1;
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #553C9A;
          }
          .info-box {
            background-color: #F3F4F6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #6B46C1;
          }
          .responsibility-list {
            background-color: #EDE9FE;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .responsibility-list ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
          }
          .warning {
            background-color: #FEF3C7;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            border-left: 4px solid #F59E0B;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MySourcing Pulse</h1>
            <p>Sistema de Gestión de Nómina</p>
          </div>
          
          <div class="content">
            <h2>¡Felicidades ${employeeName}!</h2>
            
            <p>Has sido designado con una <strong>Vinculación de Jefe</strong> en <strong>${companyName}</strong>.</p>
            
            <div class="info-box">
              <h3>Tu nueva asignación incluye:</h3>
              ${areasAsignadas.length > 0 ? `<p><strong>Áreas:</strong> ${areasAsignadas.join(', ')}</p>` : ''}
              ${departamentosAsignados.length > 0 ? `<p><strong>Departamentos:</strong> ${departamentosAsignados.join(', ')}</p>` : ''}
              <p><strong>Empleados a cargo:</strong> ${empleadosACargo} empleados</p>
            </div>
            
            <div class="responsibility-list">
              <h3>Con tu Vinculación de Jefe podrás:</h3>
              <ul>
                <li>Registrar y gestionar incidencias laborales de tu equipo</li>
                <li>Aprobar solicitudes de permisos y vacaciones</li>
                <li>Visualizar reportes y estadísticas de tu área</li>
                <li>Coordinar con el departamento de nómina</li>
                <li>Gestionar la información de los empleados a tu cargo</li>
              </ul>
            </div>
            
            <p><strong>Para comenzar, necesitas configurar tu acceso al portal de jefes:</strong></p>
            
            <div style="text-align: center;">
              <a href="${setupLink}" class="button">Configurar mi Acceso</a>
            </div>
            
            <h3>¿Qué necesitarás hacer?</h3>
            <ol>
              <li>Hacer clic en el botón "Configurar mi Acceso"</li>
              <li>Crear tu nombre de usuario único</li>
              <li>Establecer una contraseña segura</li>
              <li>Confirmar tu contraseña</li>
              <li>¡Listo! Podrás acceder al portal de jefes</li>
            </ol>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Este enlace es válido por 48 horas. Si expira, contacta al administrador del sistema para solicitar uno nuevo.
            </div>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al departamento de recursos humanos o al administrador del sistema.</p>
            
            <p style="margin-top: 30px;">¡Bienvenido a tu nuevo rol!</p>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>Si no solicitaste este acceso o crees que es un error, contacta inmediatamente al administrador.</p>
            <p>&copy; 2024 MySourcing Pulse. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();