-- Check if imss_risk_class exists and rename it, or create clase_riesgo_imss
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imss_risk_class') THEN
        ALTER TABLE "imss_risk_class" RENAME TO "clase_riesgo_imss";
        ALTER TABLE "clase_riesgo_imss" RENAME COLUMN "code" TO "codigo";
        ALTER TABLE "clase_riesgo_imss" RENAME COLUMN "name" TO "nombre";
        ALTER TABLE "clase_riesgo_imss" RENAME COLUMN "description" TO "descripcion";
    ELSE
        -- Create clase_riesgo_imss if it doesn't exist
        CREATE TABLE IF NOT EXISTS "clase_riesgo_imss" (
            "id" SERIAL NOT NULL,
            "codigo" TEXT NOT NULL,
            "nombre" TEXT NOT NULL,
            "descripcion" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "clase_riesgo_imss_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "clase_riesgo_imss_codigo_key" ON "clase_riesgo_imss"("codigo");
    END IF;
END $$;

-- Create new IMSSRegistroPatronal table
CREATE TABLE "imss_registro_patronal" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "nomDomicilio" TEXT,
    "actividadEconomica" TEXT,
    "clvRegistroPatronal" TEXT,
    "claseRiesgoId" INTEGER,
    "numFraccion" INTEGER,
    "numPrismaRiesgo" DECIMAL(5,2),
    "fechaVigencia" TIMESTAMP(3),
    "uriRegistroPatronal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imss_registro_patronal_pkey" PRIMARY KEY ("id")
);

-- Create unique index
CREATE UNIQUE INDEX "imss_registro_patronal_companyId_key" ON "imss_registro_patronal"("companyId");

-- Migrate data from company_tax_obligations to imss_registro_patronal only if columns exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'company_tax_obligations' 
        AND column_name IN ('nomDomicilio', 'actividadEconomica', 'clvRegistroPatronal', 'imssRiskClassId')
    ) THEN
        INSERT INTO "imss_registro_patronal" (
            "companyId",
            "nomDomicilio",
            "actividadEconomica",
            "clvRegistroPatronal",
            "claseRiesgoId",
            "numFraccion",
            "numPrismaRiesgo",
            "fechaVigencia",
            "uriRegistroPatronal",
            "createdAt",
            "updatedAt"
        )
        SELECT 
            "companyId",
            "nomDomicilio",
            "actividadEconomica",
            "clvRegistroPatronal",
            "imssRiskClassId",
            "numFraccion",
            "numPrismaRiesgo",
            "fechaVigencia",
            "uriRegistroPatronal",
            "createdAt",
            "updatedAt"
        FROM "company_tax_obligations"
        WHERE "clvRegistroPatronal" IS NOT NULL 
           OR "actividadEconomica" IS NOT NULL 
           OR "imssRiskClassId" IS NOT NULL;
    END IF;
END $$;

-- Drop the old columns from company_tax_obligations if they exist
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "nomDomicilio";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "actividadEconomica";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "clvRegistroPatronal";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "imssRiskClassId";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "numFraccion";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "numPrismaRiesgo";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "fechaVigencia";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "uriRegistroPatronal";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "imssRegistration";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "imssClassification";
ALTER TABLE "company_tax_obligations" DROP COLUMN IF EXISTS "imssRiskClass";

-- Add foreign key constraints
ALTER TABLE "imss_registro_patronal" ADD CONSTRAINT "imss_registro_patronal_companyId_fkey" 
    FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "imss_registro_patronal" ADD CONSTRAINT "imss_registro_patronal_claseRiesgoId_fkey" 
    FOREIGN KEY ("claseRiesgoId") REFERENCES "clase_riesgo_imss"("id") ON DELETE SET NULL ON UPDATE CASCADE;