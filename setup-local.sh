#!/bin/bash

echo "🚀 CONFIGURACIÓN LOCAL - SIN DOCKER PARA BACKEND"
echo "=================================================="

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias
echo "🔍 Verificando dependencias..."

if ! command_exists node; then
    echo "❌ Node.js no está instalado. Instálalo desde https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm no está disponible"
    exit 1
fi

if ! command_exists docker; then
    echo "❌ Docker no está instalado. Solo lo necesitamos para PostgreSQL"
    exit 1
fi

echo "✅ Todas las dependencias están disponibles"

# Paso 1: Limpiar instalación anterior
echo ""
echo "🧹 Limpiando instalación anterior..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf dist
rm -rf prisma/generated

# Paso 2: Instalar dependencias
echo ""
echo "📦 Instalando dependencias de Node.js..."
npm cache clean --force
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias. Verifica tu conexión a internet."
    exit 1
fi

# Paso 3: Solo levantar PostgreSQL con Docker
echo ""
echo "🗄️ Levantando solo PostgreSQL con Docker..."

# Crear docker-compose mínimo solo para PostgreSQL
cat > docker-compose.db.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: mysourcing-db-local
    environment:
      POSTGRES_DB: mysourcing_pulse
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_local:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data_local:
EOF

# Detener contenedores anteriores
docker-compose -f docker-compose.db.yml down -v 2>/dev/null || true

# Levantar solo PostgreSQL
docker-compose -f docker-compose.db.yml up -d

if [ $? -ne 0 ]; then
    echo "❌ Error levantando PostgreSQL. Verifica Docker."
    exit 1
fi

echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar que PostgreSQL está funcionando
echo "🔍 Verificando conexión a PostgreSQL..."
for i in {1..30}; do
    if docker exec mysourcing-db-local pg_isready -U postgres >/dev/null 2>&1; then
        echo "✅ PostgreSQL está listo"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL no responde después de 30 segundos"
        exit 1
    fi
    echo "⏳ Esperando PostgreSQL... ($i/30)"
    sleep 1
done

# Paso 4: Configurar variables de entorno
echo ""
echo "🔧 Configurando variables de entorno..."

cat > .env << 'EOF'
# Base de datos
DATABASE_URL="postgresql://postgres:password123@localhost:5432/mysourcing_pulse?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-local"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-local"

# Servidor
NODE_ENV=development
PORT=3001

# Frontend
FRONTEND_URL=http://localhost:3000

# Configuración de red
NPM_CONFIG_STRICT_SSL=false
NODE_TLS_REJECT_UNAUTHORIZED=0
EOF

echo "✅ Variables de entorno configuradas"

# Paso 5: Configurar Prisma
echo ""
echo "🔄 Configurando Prisma..."

# Generar cliente de Prisma
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Error generando cliente de Prisma"
    exit 1
fi

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "⚠️ Las migraciones fallaron, intentando migrate dev..."
    npx prisma migrate dev --name init
fi

# Paso 6: Compilar TypeScript
echo ""
echo "🔨 Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error compilando TypeScript"
    exit 1
fi

# Paso 7: Crear script de inicio
echo ""
echo "📝 Creando scripts de ayuda..."

cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando Mysourcing Pulse Server..."

# Verificar que PostgreSQL esté corriendo
if ! docker ps | grep mysourcing-db-local >/dev/null; then
    echo "🗄️ Iniciando PostgreSQL..."
    docker-compose -f docker-compose.db.yml up -d
    sleep 5
fi

# Iniciar servidor
echo "🌐 Iniciando servidor en http://localhost:3001"
npm run dev
EOF

cat > status.sh << 'EOF'
#!/bin/bash
echo "📊 Estado de Mysourcing Pulse:"
echo "================================"

# Estado de PostgreSQL
if docker ps | grep mysourcing-db-local >/dev/null; then
    echo "✅ PostgreSQL: Funcionando"
else
    echo "❌ PostgreSQL: Detenido"
fi

# Estado del servidor
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Backend API: Funcionando"
    echo "🌐 URL: http://localhost:3001"
else
    echo "❌ Backend API: Detenido"
fi

# Estado de la base de datos
if docker exec mysourcing-db-local psql -U postgres -d mysourcing_pulse -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Base de datos: Conectada"
else
    echo "❌ Base de datos: Error de conexión"
fi
EOF

cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Deteniendo Mysourcing Pulse..."

# Detener servidor si está corriendo
echo "🔄 Deteniendo procesos de Node.js..."
pkill -f "node.*app.js" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

# Detener PostgreSQL
echo "🗄️ Deteniendo PostgreSQL..."
docker-compose -f docker-compose.db.yml down

echo "✅ Todo detenido"
EOF

# Hacer scripts ejecutables
chmod +x start.sh status.sh stop.sh

echo ""
echo "✅ ¡CONFIGURACIÓN COMPLETADA!"
echo "================================"
echo ""
echo "🎯 COMANDOS DISPONIBLES:"
echo "  ./start.sh     - Iniciar servidor"
echo "  ./status.sh    - Ver estado"
echo "  ./stop.sh      - Detener todo"
echo ""
echo "📊 URLS:"
echo "  🌐 API: http://localhost:3001/api"
echo "  🔍 Health: http://localhost:3001/health"
echo "  🖥️ Prisma Studio: npm run prisma:studio"
echo ""
echo "🗄️ BASE DE DATOS:"
echo "  Host: localhost:5432"
echo "  DB: mysourcing_pulse"
echo "  User: postgres"
echo "  Pass: password123"
echo ""
echo "🚀 INICIAR AHORA:"
echo "  ./start.sh"