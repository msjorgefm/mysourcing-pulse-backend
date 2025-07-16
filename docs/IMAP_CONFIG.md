# Configuración IMAP para Guardar Correos Enviados

Esta documentación explica cómo configurar la funcionalidad IMAP para que los correos enviados desde el sistema se guarden automáticamente en la carpeta de "Enviados" de tu servidor de correo.

## ¿Por qué es necesario?

Por defecto, cuando envías correos usando SMTP, estos no se guardan automáticamente en tu carpeta de "Enviados". Con la configuración IMAP, el sistema puede conectarse a tu servidor de correo después de enviar cada email y guardarlo en la carpeta correspondiente.

## Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Habilitar funcionalidad IMAP
IMAP_ENABLED=true

# Configuración del servidor IMAP
IMAP_HOST=imap.gmail.com        # Cambia según tu proveedor
IMAP_PORT=993                    # Puerto estándar para IMAP SSL
IMAP_USER=tu-email@gmail.com     # Mismo usuario que SMTP
IMAP_PASS=tu-contraseña          # Misma contraseña que SMTP
IMAP_SENT_FOLDER=Sent            # Nombre de la carpeta de enviados
```

### 2. Configuración por Proveedor

#### Gmail
```env
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SENT_FOLDER=[Gmail]/Sent Mail
```

**Nota**: Para Gmail, necesitas:
1. Habilitar IMAP en la configuración de Gmail
2. Usar una contraseña de aplicación (no tu contraseña normal)
3. La carpeta de enviados se llama `[Gmail]/Sent Mail`

#### Outlook/Office 365
```env
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
IMAP_SENT_FOLDER=Sent Items
```

#### Yahoo
```env
IMAP_HOST=imap.mail.yahoo.com
IMAP_PORT=993
IMAP_SENT_FOLDER=Sent
```

#### Servidor Personalizado
```env
IMAP_HOST=mail.tuservidor.com
IMAP_PORT=993
IMAP_SENT_FOLDER=Sent
```

### 3. Uso del Servicio Mejorado

Para usar el servicio con funcionalidad IMAP, actualiza las importaciones en los archivos que envían correos:

```typescript
// Antes
import { emailService } from '../services/emailService';

// Después
import { emailServiceEnhanced } from '../services/emailServiceEnhanced';
```

### 4. Verificación

Al iniciar el servidor, verás mensajes indicando el estado de la conexión IMAP:

```
✅ Servidor SMTP listo para enviar correos
✅ Conexión IMAP establecida
✅ Carpeta de enviados encontrada: [Gmail]/Sent Mail
```

Si hay algún problema:
```
❌ Error configurando IMAP: [detalles del error]
⚠️  Los correos se enviarán pero no se guardarán en la carpeta de enviados
```

## Solución de Problemas

### Error: "Authentication failed"
- Verifica que las credenciales IMAP sean correctas
- Para Gmail, asegúrate de usar una contraseña de aplicación
- Verifica que IMAP esté habilitado en tu cuenta

### Error: "Carpeta de enviados no encontrada"
- El sistema busca automáticamente variaciones comunes del nombre
- Si persiste, verifica el nombre exacto en tu cliente de correo
- Actualiza `IMAP_SENT_FOLDER` con el nombre correcto

### Los correos no se guardan pero se envían
- Verifica que `IMAP_ENABLED=true` esté configurado
- Revisa los logs del servidor para mensajes de error IMAP
- Asegúrate de que tu servidor permite conexiones IMAP

## Desactivar IMAP

Si no necesitas esta funcionalidad o tienes problemas, simplemente configura:

```env
IMAP_ENABLED=false
```

Los correos seguirán enviándose normalmente vía SMTP, solo que no se guardarán en la carpeta de enviados.

## Seguridad

- Las credenciales IMAP deben mantenerse seguras
- Usa variables de entorno, nunca hardcodees credenciales
- En producción, considera usar servicios de correo transaccional (SendGrid, AWS SES) que manejan esto automáticamente
- El sistema usa conexiones SSL/TLS seguras para IMAP

## Limitaciones

- El guardado en IMAP agrega un pequeño retraso después de enviar cada correo
- Si falla el guardado IMAP, el correo ya fue enviado (no se reintenta)
- Algunos servidores tienen límites de conexiones IMAP simultáneas