#!/bin/bash

echo "🔧 Forzando construcción en arquitectura x86..."

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores..."
docker-compose down -v

# Limpiar imágenes anteriores
echo "🧹 Limpiando imágenes anteriores..."
docker image rm mysourcing-pulse-backend_backend 2>/dev/null || true

echo ""
echo "====================================="
echo "🏗️ MÉTODO 1: Docker Build con --platform"
echo "====================================="

# Construir específicamente para x86
echo "🔨 Construyendo imagen para linux/amd64..."
docker build --platform linux/amd64 -t mysourcing-backend .

if [ $? -eq 0 ]; then
    echo "✅ Imagen construida exitosamente"
    
    # Etiquetar la imagen para docker-compose
    docker tag mysourcing-backend mysourcing-pulse-backend_backend
    
    # Iniciar solo la base de datos primero
    echo "🗄️ Iniciando base de datos..."
    docker-compose up -d postgres redis
    sleep 10
    
    # Iniciar el backend con la imagen ya construida
    echo "🚀 Iniciando backend..."
    docker-compose up -d backend
    
    sleep 15
    
    # Verificar que funciona
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "🎉 ¡La aplicación funciona en x86!"
        echo "📊 Logs:"
        docker-compose logs --tail=10 backend
        exit 0
    else
        echo "⚠️ La imagen se construyó pero la app no responde"
        echo "📋 Verificando logs..."
        docker-compose logs backend
    fi
else
    echo "❌ Falló la construcción con --platform, probando método 2..."
fi

echo ""
echo "====================================="
echo "🏗️ MÉTODO 2: Buildx con multi-platform"
echo "====================================="

# Verificar si buildx está disponible
if docker buildx version >/dev/null 2>&1; then
    echo "🔧 Buildx disponible, creando builder..."
    
    # Crear builder multi-platform si no existe
    docker buildx create --name mybuilder --use 2>/dev/null || docker buildx use mybuilder
    
    # Construir para x86
    echo "🔨 Construyendo con buildx para linux/amd64..."
    docker buildx build --platform linux/amd64 --load -t mysourcing-backend .
    
    if [ $? -eq 0 ]; then
        echo "✅ Buildx exitoso"
        
        # Etiquetar para docker-compose
        docker tag mysourcing-backend mysourcing-pulse-backend_backend
        
        # Iniciar servicios
        echo "🚀 Iniciando servicios..."
        docker-compose up -d
        
        sleep 15
        
        # Verificar
        if curl -f http://localhost:3001/health 2>/dev/null; then
            echo "🎉 ¡Éxito con buildx!"
            docker-compose logs --tail=10 backend
            exit 0
        else
            echo "⚠️ Buildx funcionó pero app no responde"
            docker-compose logs backend
        fi
    else
        echo "❌ Buildx falló, probando método 3..."
    fi
else
    echo "⚠️ Buildx no disponible, saltando al método 3..."
fi

echo ""
echo "====================================="
echo "🏗️ MÉTODO 3: Docker Compose con variable"
echo "====================================="

# Usar variable de entorno para forzar arquitectura
echo "🔧 Usando variable de entorno DOCKER_DEFAULT_PLATFORM..."
export DOCKER_DEFAULT_PLATFORM=linux/amd64

# Construir con docker-compose
echo "🔨 Construyendo con DOCKER_DEFAULT_PLATFORM=linux/amd64..."
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build --no-cache backend

if [ $? -eq 0 ]; then
    echo "✅ Construcción exitosa con variable de entorno"
    
    # Iniciar servicios
    echo "🚀 Iniciando servicios..."
    DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose up -d
    
    sleep 15
    
    # Verificar
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "🎉 ¡Éxito con variable de entorno!"
        docker-compose logs --tail=10 backend
        exit 0
    else
        echo "⚠️ Se construyó pero app no responde"
        docker-compose logs backend
    fi
else
    echo "❌ Método 3 falló"
fi

echo ""
echo "❌ Todos los métodos de forzar x86 fallaron"
echo ""
echo "💡 Alternativas:"
echo "   1. Usar el Dockerfile ultra-minimal (funciona en cualquier arquitectura)"
echo "   2. Actualizar Docker Desktop a versión más reciente"
echo "   3. Verificar configuración de red/proxy"
echo ""
echo "🔄 Ejecutando Dockerfile ultra-minimal como fallback..."

# Fallback al Dockerfile ultra-minimal
cat > Dockerfile << 'EOF'
FROM node:18-slim
WORKDIR /app
USER node
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
ENV PRISMA_CLI_BINARY_TARGETS="native,debian-openssl-3.0.x"
RUN npm ci --only=production && npm cache clean --force
COPY --chown=node:node . .
RUN npx prisma generate
RUN npm run build
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
CMD ["npm", "start"]
EOF

echo "🔨 Construyendo con Dockerfile ultra-minimal..."
docker-compose build --no-cache --network=host backend

if [ $? -eq 0 ]; then
    echo "✅ Dockerfile ultra-minimal funcionó"
    docker-compose up -d
    sleep 15
    
    if curl -f http://localhost:3001/health 2>/dev/null; then
        echo "🎉 ¡Aplicación funcionando con Dockerfile minimal!"
        docker-compose logs --tail=10 backend
    else
        echo "📋 Verificando logs del contenedor..."
        docker-compose logs backend
    fi
else
    echo "❌ Incluso el Dockerfile minimal falló"
    echo "🆘 Problema grave de conectividad o configuración de Docker"
fi