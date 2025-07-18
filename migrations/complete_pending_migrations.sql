-- Complete pending migrations for notification types and period status

-- Check if INCIDENCE_REVIEW_REQUEST exists in NotificationType enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'INCIDENCE_REVIEW_REQUEST' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'NotificationType'
        )
    ) THEN
        ALTER TYPE "NotificationType" ADD VALUE 'INCIDENCE_REVIEW_REQUEST';
    END IF;
END $$;

-- Check if FINALIZADO exists in PeriodStatus enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'FINALIZADO' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'PeriodStatus'
        )
    ) THEN
        ALTER TYPE "PeriodStatus" ADD VALUE 'FINALIZADO';
    END IF;
END $$;