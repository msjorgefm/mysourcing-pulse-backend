# Imagen base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache dumb-init

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mysourcing -u 1001

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY --chown=mysourcing:nodejs . .

# Generar Prisma client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Crear directorios necesarios
RUN mkdir -p logs && chown -R mysourcing:nodejs logs

# Cambiar a usuario no root
USER mysourcing

# Exponer puerto
EXPOSE 3001

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando por defecto usando dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]