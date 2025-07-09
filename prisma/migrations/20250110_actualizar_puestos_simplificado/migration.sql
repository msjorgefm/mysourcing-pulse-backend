-- Eliminar columnas que ya no se necesitan
ALTER TABLE "puestos" DROP COLUMN IF EXISTS "descripcion";
ALTER TABLE "puestos" DROP COLUMN IF EXISTS "salarioMinimo";
ALTER TABLE "puestos" DROP COLUMN IF EXISTS "salarioMaximo";