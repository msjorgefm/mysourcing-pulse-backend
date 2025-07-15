-- Step 1: Create new enum type
CREATE TYPE "ContractType_new" AS ENUM ('INDEFINIDO', 'TIEMPO_DETERMINADO', 'MEDIO_TIEMPO', 'CONTRATISTA', 'PRACTICANTE');

-- Step 2: Add temporary column
ALTER TABLE "employees" ADD COLUMN "contractType_new" "ContractType_new";

-- Step 3: Update values to new enum
UPDATE "employees" 
SET "contractType_new" = 
  CASE "contractType"
    WHEN 'INDEFINITE' THEN 'INDEFINIDO'::"ContractType_new"
    WHEN 'FIXED_TERM' THEN 'TIEMPO_DETERMINADO'::"ContractType_new"
    WHEN 'PART_TIME' THEN 'MEDIO_TIEMPO'::"ContractType_new"
    WHEN 'CONTRACTOR' THEN 'CONTRATISTA'::"ContractType_new"
    WHEN 'INTERN' THEN 'PRACTICANTE'::"ContractType_new"
  END;

-- Step 4: Drop old column
ALTER TABLE "employees" DROP COLUMN "contractType";

-- Step 5: Rename new column
ALTER TABLE "employees" RENAME COLUMN "contractType_new" TO "contractType";

-- Step 6: Drop old enum type
DROP TYPE "ContractType";

-- Step 7: Rename new enum type
ALTER TYPE "ContractType_new" RENAME TO "ContractType";