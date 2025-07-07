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

    // Puerto 465 requiere secure: true
    const isSecure = config.smtp.port === 465;
    
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
      console.log('📧 Intentando enviar email a:', options.to);
      console.log('📧 Asunto:', options.subject);
      
      // Modo desarrollo sin transporter
      if (!this.transporter) {
        console.log('🔧 MODO DESARROLLO - Email simulado:');
        console.log('   Para:', options.to);
        console.log('   De:', config.smtp.from);
        console.log('   Asunto:', options.subject);
        console.log('   ---');
        console.log('   El email se habría enviado en producción.');
        console.log('   Configura las credenciales SMTP para envío real.');
        return true;
      }
      
      const mailOptions = {
        from: config.smtp.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente');
      console.log('   Message ID:', info.messageId);
      console.log('   Response:', info.response);
      return true;
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
    const subject = `Invitación para ser Jefe de Departamento en ${companyName}`;
    
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
            <h2>¡Has sido invitado como Jefe de Departamento!</h2>
            
            <p>Hola,</p>
            
            <p>La empresa <strong>${companyName}</strong> te ha invitado a formar parte de su equipo como Jefe de Departamento.</p>
            
            <div class="department-info">
              <strong>Departamento asignado:</strong> ${departmentName}
            </div>
            
            <p>Como Jefe de Departamento, tendrás las siguientes responsabilidades:</p>
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
}

export const emailService = new EmailService();