import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: '1h',
    refreshExpiresIn: '7d',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || ' Link <noreply@mysourcinglink.com>',
  },
  
  imap: {
    enabled: process.env.IMAP_ENABLED === 'true',
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT || '993', 10),
    user: process.env.IMAP_USER || process.env.SMTP_USER || '',
    pass: process.env.IMAP_PASS || process.env.SMTP_PASS || '',
    sentFolder: process.env.IMAP_SENT_FOLDER || 'Sent',
    secure: true
  },
  
  invitation: {
    expiresInHours: 48,
  },
};