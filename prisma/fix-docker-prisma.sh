#!/bin/bash

echo "🔧 Solucionando problemas de Prisma en Docker..."

# Detener y limpiar contenedores existentes
echo "📦 Limpiando contenedores existentes..."
docker-compose down -v
docker system prune -f

# Limpiar caché de npm y node_modules
echo "🧹 Limpiando caché local..."
rm -rf node_modules
rm -rf package-lock.json
npm cache clean --force

# Reinstalar dependencias
echo "📦 Reinstalando dependencias..."
npm install

# Regenerar Prisma client localmente
echo "🔄 Regenerando Prisma client..."
npx prisma generate

# Construir imagen sin caché
echo "🏗️ Construyendo imagen Docker..."
docker-compose build --no-cache

# Verificar que la base de datos esté lista
echo "🛠️ Iniciando servicios..."
docker-compose up -d postgres redis

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
docker-compose run --rm backend npx prisma migrate deploy

# Iniciar todos los servicios
echo "🚀 Iniciando aplicación..."
docker-compose up -d

echo "✅ ¡Proceso completado! La aplicación debería estar disponible en http://localhost:3001"
echo "📊 Para ver logs: docker-compose logs -f backend"
echo "🔍 Para verificar salud: curl http://localhost:3001/health"