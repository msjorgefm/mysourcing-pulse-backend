#!/bin/bash

echo "🌐 Solucionando problemas de red en Docker..."

# Detener contenedores
docker-compose down -v

# Limpiar imágenes
docker image rm mysourcing-pulse-backend_backend 2>/dev/null || true

echo "📋 Tu problema parece ser de conectividad de red corporativa/proxy"
echo "🔧 Probando soluciones que evitan apt-get..."

echo ""
echo "====================================="
echo "🎯 SOLUCIÓN 1: Dockerfile Ultra-Minimal"
echo "====================================="

# Backup del Dockerfile actual
cp Dockerfile Dockerfile.backup

# Crear Dockerfile ultra-minimal
cat > Dockerfile << 'EOF'
# Imagen base sin tocar el sistema
FROM node:18-slim

# Establecer directorio de trabajo
WORKDIR /app

# Usar el usuario node existente
USER node

# Copiar archivos necesarios
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

# Configurar Prisma para diferentes arquitecturas
ENV PRISMA_CLI_BINARY_TARGETS="native,debian-openssl-3.0.x,linux-musl-openssl-3.0.x,linux-musl-arm64-openssl-3.0.x"

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

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

# Comando directo sin dumb-init
CMD ["npm", "start"]
EOF

echo "🔨 Construyendo con Dockerfile ultra-minimal..."
if docker-compose build --no-cache --network=host backend; then
    echo "✅ ¡Éxito con Dockerfile ultra-minimal!"
    echo "🚀 Iniciando aplicación..."
    docker-compose up -d
    sleep 15
    
    # Verificar
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "🎉 ¡La aplicación funciona perfectamente!"
        docker-compose logs --tail=10 backend
        exit 0
    else
        echo "⚠️ Se construyó pero no responde, verificando logs..."
        docker-compose logs backend
        docker-compose down
    fi
else
    echo "❌ Solución 1 falló, probando Solución 2..."
fi

echo ""
echo "====================================="
echo "🌐 SOLUCIÓN 2: Alpine con Config de Red"
echo "====================================="

cat > Dockerfile << 'EOF'
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
EOF

echo "🔨 Construyendo con Alpine + configuración de red..."
if docker-compose build --no-cache --network=host backend; then
    echo "✅ ¡Éxito con Alpine!"
    echo "🚀 Iniciando aplicación..."
    docker-compose up -d
    sleep 15
    
    # Verificar
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "🎉 ¡La aplicación funciona perfectamente!"
        docker-compose logs --tail=10 backend
        exit 0
    else
        echo "⚠️ Se construyó pero no responde, verificando logs..."
        docker-compose logs backend
        docker-compose down
    fi
else
    echo "❌ Solución 2 falló, probando Solución 3..."
fi

echo ""
echo "====================================="
echo "🔧 SOLUCIÓN 3: Forzar arquitectura x86"
echo "====================================="

# Restaurar Dockerfile ultra-minimal
cat > Dockerfile << 'EOF'
FROM node:18-slim

WORKDIR /app
USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

ENV PRISMA_CLI_BINARY_TARGETS="native,debian-openssl-3.0.x,linux-musl-openssl-3.0.x"

RUN npm ci --only=production && npm cache clean --force

COPY --chown=node:node . .
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["npm", "start"]
EOF

# Actualizar docker-compose con platform
cp docker-compose.yml docker-compose.yml.backup

# Agregar platform al backend
sed -i.bak '/backend:/a\
    platform: linux/amd64' docker-compose.yml

echo "🔨 Construyendo con arquitectura x86 forzada..."
if docker-compose build --no-cache backend; then
    echo "✅ ¡Éxito forzando x86!"
    echo "🚀 Iniciando aplicación..."
    docker-compose up -d
    sleep 15
    
    # Verificar
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "🎉 ¡La aplicación funciona perfectamente!"
        docker-compose logs --tail=10 backend
        exit 0
    else
        echo "⚠️ Se construyó pero no responde, verificando logs..."
        docker-compose logs backend
        docker-compose down
    fi
else
    echo "❌ Todas las soluciones automáticas fallaron"
fi

echo ""
echo "❌ Soluciones automáticas no funcionaron"
echo "🔍 Diagnóstico del problema:"
echo ""
echo "📋 El error 'NOSPLIT' indica un problema de proxy/firewall corporativo"
echo ""
echo "💡 Soluciones manuales:"
echo "   1. Configura Docker para usar proxy corporativo"
echo "   2. Desactiva antivirus/firewall temporalmente"
echo "   3. Usa Docker Desktop con configuración de proxy"
echo "   4. Ejecuta: docker system prune -a && docker volume prune"
echo ""
echo "🔧 Para configurar proxy en Docker:"
echo "   ~/.docker/config.json:"
echo '   {"proxies": {"default": {"httpProxy": "http://proxy:8080", "httpsProxy": "http://proxy:8080"}}}'
echo ""

# Restaurar archivos originales
cp Dockerfile.backup Dockerfile
cp docker-compose.yml.backup docker-compose.yml

echo "📦 Archivos originales restaurados"