BEGIN;

-- Create enum type if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'niveau') THEN
        CREATE TYPE "Niveau" AS ENUM ('MEDIOCRE','FAIBLE','MOYEN','FORT','TRES_FORT');
    END IF;
END$$;

-- Add a temporary column with the enum type (default MEDIOCRE)
ALTER TABLE "Player" ADD COLUMN niveau_new "Niveau" DEFAULT 'MEDIOCRE';

-- Map existing textual values into the enum column safely
UPDATE "Player" SET niveau_new = CASE
  WHEN niveau IS NULL OR niveau = '' THEN 'MEDIOCRE'
  WHEN lower(niveau) IN ('mediocre','médiocre') THEN 'MEDIOCRE'
  WHEN lower(niveau) = 'faible' THEN 'FAIBLE'
  WHEN lower(niveau) = 'moyen' THEN 'MOYEN'
  WHEN lower(niveau) = 'fort' THEN 'FORT'
  WHEN lower(niveau) IN ('très fort','tres fort','tres_fort','tres-fort') THEN 'TRES_FORT'
  ELSE 'MEDIOCRE'
END;

-- Drop the old column and rename the new one
ALTER TABLE "Player" DROP COLUMN niveau;
ALTER TABLE "Player" RENAME COLUMN niveau_new TO niveau;

COMMIT;
