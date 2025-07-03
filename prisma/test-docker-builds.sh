#!/bin/bash

echo "🐳 Probando diferentes configuraciones de Docker para Prisma..."

# Detener contenedores existentes
docker-compose down -v

# Limpiar imágenes anteriores
docker image rm mysourcing-pulse-backend_backend 2>/dev/null || true

echo ""
echo "====================================="
echo "🧪 OPCIÓN 1: Node Slim con ca-certificates"
echo "====================================="

# Copiar Dockerfile de la opción 1
cp Dockerfile Dockerfile.backup
cat > Dockerfile << 'EOF'
# Imagen base
FROM node:18-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar ca-certificates primero, luego otras dependencias
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends ca-certificates \
    && apt-get update -y \
    && apt-get install -y --no-install-recommends \
        openssl \
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

# Configurar variables de entorno para Prisma
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-3.0.x,debian-openssl-3.0.x,linux-musl-arm64-openssl-3.0.x,linux-arm64-openssl-3.0.x"

# Copiar código fuente
COPY --chown=mysourcing:nodejs . .

# Generar Prisma client con reintentos
RUN npx prisma generate || (echo "Reintentando Prisma generate..." && sleep 5 && npx prisma generate)

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
EOF

echo "Construyendo imagen con node:18-slim..."
if docker-compose build --no-cache backend; then
    echo "✅ ÉXITO: Opción 1 funciona!"
    echo "🚀 Iniciando contenedores..."
    docker-compose up -d
    sleep 10
    
    # Verificar que funciona
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "✅ ¡La aplicación está funcionando correctamente!"
        echo "📊 Logs:"
        docker-compose logs --tail=10 backend
        exit 0
    else
        echo "⚠️ La imagen se construyó pero la aplicación no responde"
        docker-compose down
    fi
else
    echo "❌ Opción 1 falló, probando Opción 2..."
fi

echo ""
echo "====================================="
echo "🧪 OPCIÓN 2: Node Alpine"
echo "====================================="

cat > Dockerfile << 'EOF'
# Imagen base Alpine con configuración correcta
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    ca-certificates \
    openssl \
    dumb-init \
    && update-ca-certificates

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mysourcing -u 1001 -G nodejs

# Copiar archivos de dependencias Y esquema de Prisma ANTES de npm install
COPY package*.json ./
COPY prisma ./prisma/

# Configurar variables de entorno para Prisma (importantes para Alpine ARM64)
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-3.0.x,linux-musl-arm64-openssl-3.0.x"

# Instalar dependencias de Node.js
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY --chown=mysourcing:nodejs . .

# Generar Prisma client con configuración específica para Alpine
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
EOF

echo "Construyendo imagen con node:18-alpine..."
if docker-compose build --no-cache backend; then
    echo "✅ ÉXITO: Opción 2 funciona!"
    echo "🚀 Iniciando contenedores..."
    docker-compose up -d
    sleep 10
    
    # Verificar que funciona
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "✅ ¡La aplicación está funcionando correctamente!"
        echo "📊 Logs:"
        docker-compose logs --tail=10 backend
        exit 0
    else
        echo "⚠️ La imagen se construyó pero la aplicación no responde"
        docker-compose down
    fi
else
    echo "❌ Opción 2 falló, probando Opción 3..."
fi

echo ""
echo "====================================="
echo "🧪 OPCIÓN 3: Node Completo"
echo "====================================="

cat > Dockerfile << 'EOF'
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
EOF

echo "Construyendo imagen con node:18 completo..."
if docker-compose build --no-cache backend; then
    echo "✅ ÉXITO: Opción 3 funciona!"
    echo "🚀 Iniciando contenedores..."
    docker-compose up -d
    sleep 10
    
    # Verificar que funciona
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "✅ ¡La aplicación está funcionando correctamente!"
        echo "📊 Logs:"
        docker-compose logs --tail=10 backend
        exit 0
    else
        echo "⚠️ La imagen se construyó pero la aplicación no responde"
        docker-compose down
    fi
else
    echo "❌ Todas las opciones fallaron"
fi

echo ""
echo "❌ Ninguna opción funcionó. Restaurando Dockerfile original..."
cp Dockerfile.backup Dockerfile
echo "💡 Considera:"
echo "   1. Verificar tu conexión a internet"
echo "   2. Verificar configuración de Docker Desktop"
echo "   3. Probar con platform: linux/amd64 en docker-compose.yml"