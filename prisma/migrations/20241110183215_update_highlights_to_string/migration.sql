-- First, update existing NULL values to empty array string
UPDATE "Contract"
SET 
    highlights = '[]',
    changes = '[]'
WHERE highlights IS NULL OR changes IS NULL;

-- Then alter the columns to be String with default value
ALTER TABLE "Contract" 
    ALTER COLUMN highlights TYPE TEXT,
    ALTER COLUMN changes TYPE TEXT,
    ALTER COLUMN highlights SET DEFAULT '[]',
    ALTER COLUMN changes SET DEFAULT '[]',
    ALTER COLUMN highlights SET NOT NULL,
    ALTER COLUMN changes SET NOT NULL;