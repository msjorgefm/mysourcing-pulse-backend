-- Update CompanyGeneralInfo - make startDate optional
ALTER TABLE "company_general_info" ALTER COLUMN "startDate" DROP NOT NULL;

-- Update CompanyNotarialPower - make fields optional
ALTER TABLE "company_notarial_power" ALTER COLUMN "folioPoderNotarial" DROP NOT NULL;
ALTER TABLE "company_notarial_power" ALTER COLUMN "fechaEmision" DROP NOT NULL;
ALTER TABLE "company_notarial_power" ALTER COLUMN "fechaVigencia" DROP NOT NULL;
ALTER TABLE "company_notarial_power" ALTER COLUMN "nombreFederatario" DROP NOT NULL;
ALTER TABLE "company_notarial_power" ALTER COLUMN "numeroFederatario" DROP NOT NULL;
ALTER TABLE "company_notarial_power" ALTER COLUMN "estadoId" DROP NOT NULL;
ALTER TABLE "company_notarial_power" ALTER COLUMN "municipioId" DROP NOT NULL;

-- Update CompanyBank - make fields optional
ALTER TABLE "company_banks" ALTER COLUMN "numSucursal" DROP NOT NULL;
ALTER TABLE "company_banks" ALTER COLUMN "clvDispersion" DROP NOT NULL;
ALTER TABLE "company_banks" ALTER COLUMN "opcCuentaBancariaPrincipal" DROP NOT NULL;

-- Update CompanyDigitalCertificate - make fields optional
ALTER TABLE "company_digital_certificates" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "company_digital_certificates" ALTER COLUMN "validFrom" DROP NOT NULL;
ALTER TABLE "company_digital_certificates" ALTER COLUMN "validUntil" DROP NOT NULL;