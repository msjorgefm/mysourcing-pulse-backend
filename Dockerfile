# Usar imagen Alpine que maneja mejor las redes corporativas
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Configurar npm para manejar certificados
RUN npm config set strict-ssl false && \
    npm config set registry https://registry.npmjs.org/

# Usar usuario node existente
USER node

# Copiar archivos necesarios
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

# Configurar Prisma para Alpine
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-3.0.x,linux-musl-arm64-openssl-3.0.x"

# Instalar dependencias con configuración de red relajada
RUN npm ci --only=production --unsafe-perm && npm cache clean --force

# Copiar código fuente
COPY --chown=node:node . .

# Generar Prisma client
RUN npx prisma generate

# Compilar aplicación
RUN npm run build

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Exponer puerto
EXPOSE 3001

# Comando simple
CMD ["npm", "start"]