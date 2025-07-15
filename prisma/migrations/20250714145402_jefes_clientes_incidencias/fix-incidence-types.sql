-- Script para agregar los nuevos tipos de incidencia
-- Ejecutar este script en la base de datos PostgreSQL

-- Verificar los valores actuales del enum
SELECT unnest(enum_range(NULL::"IncidenceType")) AS current_values;

-- Agregar los nuevos valores al enum IncidenceType
ALTER TYPE "IncidenceType" ADD VALUE IF NOT EXISTS 'INCENTIVOS';
ALTER TYPE "IncidenceType" ADD VALUE IF NOT EXISTS 'PRIMA_DOMINICAL';
ALTER TYPE "IncidenceType" ADD VALUE IF NOT EXISTS 'INCAPACIDADES';
ALTER TYPE "IncidenceType" ADD VALUE IF NOT EXISTS 'OTROS';

-- Verificar que se agregaron correctamente
SELECT unnest(enum_range(NULL::"IncidenceType")) AS updated_values;