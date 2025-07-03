# Imagen base completa de Node.js (incluye ca-certificates y herramientas)
FROM node:18

# Establecer directorio de trabajo
WORKDIR /app

# Actualizar sistema e instalar dependencias
RUN apt-get update && apt-get install -y \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Crear usuario no root
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs mysourcing

# Copiar archivos de dependencias Y esquema de Prisma ANTES de npm install
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias de Node.js
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

# Comando por defecto
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
