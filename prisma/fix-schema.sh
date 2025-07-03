#!/bin/bash

echo "🔧 Corrigiendo schema.prisma..."

# Hacer backup del archivo actual
cp prisma/schema.prisma prisma/schema.prisma.backup
echo "📦 Backup creado en prisma/schema.prisma.backup"

# Verificar que tenemos el archivo correcto
if [ ! -f "schema.prisma" ]; then
    echo "❌ Error: No se encontró el archivo prisma/schema.prisma"
    exit 1
fi

echo "🛠️ Aplicando correcciones..."

# Detener contenedores si están ejecutándose
docker-compose down

# Limpiar caché de Prisma
rm -rf node_modules/.prisma
rm -rf prisma/generated

echo "🔄 Regenerando Prisma client..."
npx prisma generate

echo "✅ Schema corregido exitosamente!"
echo ""
echo "📋 Cambios aplicados:"
echo "   ✓ Agregados binaryTargets al generator"
echo "   ✓ Movidos índices a sus modelos correspondientes"
echo "   ✓ Corregida sintaxis de índices"
echo ""
echo "🚀 Ahora puedes ejecutar:"
echo "   docker-compose up -d"
echo ""
echo "📝 Si hay problemas, restaura el backup:"
echo "   cp prisma/schema.prisma.backup prisma/schema.prisma"