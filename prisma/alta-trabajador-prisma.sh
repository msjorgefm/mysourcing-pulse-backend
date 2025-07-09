#!/bin/bash

# Script para ejecutar migraciones de Prisma para Alta de Trabajadores en el Wizard

echo "🚀 Iniciando migración para Alta de Trabajadores en Wizard de Configuración..."

# Verificar que estamos en el directorio correcto
if [ ! -d "prisma" ]; then
    echo "❌ Error: No se encontró el directorio 'prisma'. Asegúrate de ejecutar este script desde la raíz del proyecto."
    exit 1
fi

# Verificar si Prisma CLI está instalado
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx no está instalado. Por favor instala Node.js y npm primero."
    exit 1
fi

# Hacer backup del schema actual
echo "📦 Haciendo backup del schema.prisma actual..."
cp prisma/schema.prisma prisma/schema.prisma.backup.$(date +%Y%m%d%H%M%S)

# Crear archivo de migración
echo "📝 Creando archivo de migración..."
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_alta_trabajadores
cp migracion-alta-trabajadores-wizard.sql prisma/migrations/$(date +%Y%m%d%H%M%S)_alta_trabajadores/migration.sql

# Registrar la migración en _prisma_migrations
echo "📋 Registrando la migración en la base de datos..."

# Detener servicios para aplicar migración
echo "🛑 Deteniendo servicios..."
docker-compose down

# Iniciar solo la base de datos
echo "🛠️ Iniciando servicio de base de datos..."
docker-compose up -d postgres

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
docker-compose run --rm backend npx prisma migrate deploy

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
docker-compose run --rm backend npx prisma generate

# Iniciar todos los servicios
echo "🚀 Iniciando todos los servicios..."
docker-compose up -d

# Verificar estado de la migración
if [ $? -eq 0 ]; then
    echo "✅ Migración para Alta de Trabajadores completada con éxito!"
    echo "📊 Se han creado las siguientes tablas en la base de datos:"
    echo "  - wizard_status, section_progress, step_progress (tablas para el control del wizard)"
    echo "  - organizational_areas, organizational_departments, organizational_positions (estructura organizacional)"
    echo "  - work_schedules (horarios)"
    echo "  - worker_details (datos principales del trabajador)"
    echo "  - worker_addresses (domicilio)"
    echo "  - worker_contract_conditions (condiciones de contratación)"
    echo "  - worker_payment_data (datos de pago)"
    echo "  - worker_family_members (familiares)"
    echo "  - worker_alimony (pensión alimenticia)"
    echo "  - worker_infonavit_credits, worker_fonacot_credits (créditos)"
    echo "  - worker_documents (documentación)"
else
    echo "❌ Error durante la migración. Restaurando schema.prisma de backup..."
    cp prisma/schema.prisma.backup.$(date +%Y%m%d%H%M%S) prisma/schema.prisma
    echo "Por favor revisa los logs para más detalles."
    exit 1
fi

echo "🔍 Para verificar la estructura en la interfaz de Prisma, ejecuta: npx prisma studio"
echo "🧪 Puedes probar la funcionalidad accediendo a la sección 8.2 del wizard de configuración."

# Sugerencias post-migración
echo ""
echo "📝 Pasos recomendados después de la migración:"
echo "1. Actualiza los controladores para manejar las nuevas tablas"
echo "2. Implementa los endpoints para el alta de trabajadores"
echo "3. Conecta los endpoints con la interfaz del wizard"
echo "4. Prueba el flujo completo de alta de trabajadores"
echo ""
echo "Si encuentras algún problema, puedes restaurar el backup con:"
echo "cp prisma/schema.prisma.backup.$(date +%Y%m%d%H%M%S) prisma/schema.prisma"
echo "cp prisma/schema.prisma.backup.20250708121106 prisma/schema.prisma para el backup específico antes del alta de trabajadores."