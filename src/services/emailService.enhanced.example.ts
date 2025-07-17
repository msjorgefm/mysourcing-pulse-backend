/**
 * EJEMPLO DE MIGRACIÓN AL SERVICIO DE EMAIL MEJORADO
 * 
 * Este archivo muestra cómo migrar del servicio de email básico
 * al servicio mejorado con soporte IMAP.
 */

// ========================================
// OPCIÓN 1: Reemplazar el servicio actual
// ========================================

// En el archivo emailService.ts, puedes importar y re-exportar el servicio mejorado:
/*
export { 
  emailServiceEnhanced as emailService,
  sendEmailEnhanced as sendEmail 
} from './emailServiceEnhanced';
*/

// ========================================
// OPCIÓN 2: Migración gradual
// ========================================

// 1. En los archivos que necesitas IMAP, cambia la importación:
/*
// Antes:
import { emailService } from '../services/emailService';

// Después:
import { emailServiceEnhanced as emailService } from '../services/emailServiceEnhanced';
*/

// 2. El resto del código permanece igual ya que la interfaz es idéntica

// ========================================
// OPCIÓN 3: Configuración condicional
// ========================================

// En emailService.ts, puedes exportar condicionalmente:
/*
import { config } from '../config';
import { emailService as basicService } from './emailServiceBasic';
import { emailServiceEnhanced } from './emailServiceEnhanced';

// Usar el servicio mejorado solo si IMAP está habilitado
export const emailService = config.imap.enabled 
  ? emailServiceEnhanced 
  : basicService;
*/

// ========================================
// EJEMPLO DE USO
// ========================================

import { emailServiceEnhanced } from './emailServiceEnhanced';

async function ejemploEnvioEmail() {
  // El uso es idéntico al servicio anterior
  const enviado = await emailServiceEnhanced.sendEmail({
    to: 'usuario@ejemplo.com',
    subject: 'Asunto del correo',
    html: '<h1>Contenido HTML</h1>',
    text: 'Contenido en texto plano (opcional)'
  });

  if (enviado) {
    console.log('✅ Email enviado y guardado en carpeta IMAP');
  } else {
    console.log('❌ Error al enviar email');
  }
}

// Los métodos específicos también funcionan igual:
async function ejemploInvitacion() {
  await emailServiceEnhanced.sendInvitationEmail(
    'admin@empresa.com',
    'Mi Empresa S.A.',
    'https://app.ejemplo.com/setup/token123'
  );
}

// ========================================
// CONFIGURACIÓN REQUERIDA EN .env
// ========================================
/*
# SMTP (configuración existente)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-aplicacion
SMTP_FROM=MySourcing Pulse <tu-email@gmail.com>

# IMAP (nueva configuración)
IMAP_ENABLED=true
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=tu-email@gmail.com
IMAP_PASS=tu-contraseña-aplicacion
IMAP_SENT_FOLDER=[Gmail]/Sent Mail
*/