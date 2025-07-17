import { ImapFlow } from 'imapflow';
import { config } from '../config';

async function checkImapFolders() {
  console.log('🔍 Verificando carpetas IMAP en', config.imap.host);
  
  const client = new ImapFlow({
    host: config.imap.host,
    port: config.imap.port,
    secure: config.imap.secure,
    auth: {
      user: config.imap.user,
      pass: config.imap.pass,
    },
    logger: false
  });

  try {
    await client.connect();
    console.log('✅ Conectado a IMAP');

    const mailboxes = await client.list();
    
    console.log('\n📁 Carpetas disponibles:');
    
    function printMailboxes(boxes: any, indent = '') {
      for (const box of boxes) {
        console.log(`${indent}• ${box.path}`);
        if (box.flags) {
          console.log(`${indent}  Flags:`, box.flags);
        }
        if (box.specialUse) {
          console.log(`${indent}  Uso especial:`, box.specialUse);
        }
        if (box.folders && box.folders.length > 0) {
          printMailboxes(box.folders, indent + '  ');
        }
      }
    }
    
    printMailboxes(mailboxes);
    
    // Buscar carpeta de enviados
    console.log('\n🔍 Buscando carpeta de enviados...');
    const possibleNames = [
      'Sent', 'Sent Items', 'Sent Mail', 'Enviados', 
      'Elementos enviados', 'INBOX.Sent', 'INBOX/Sent',
      'INBOX.Sent Items', 'Sent Messages'
    ];
    
    for (const name of possibleNames) {
      try {
        await client.mailboxOpen(name);
        console.log(`✅ Encontrada: "${name}" - Actualiza IMAP_SENT_FOLDER=${name} en tu .env`);
        await client.mailboxClose();
        break;
      } catch (err) {
        // Continuar buscando
      }
    }

    await client.logout();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkImapFolders().catch(console.error);
}

export { checkImapFolders };