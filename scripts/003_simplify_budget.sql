
-- Migration pour simplifier le budget à un prix unique
BEGIN;

-- Supprimer les contraintes liées aux colonnes budget_min/max
ALTER TABLE missions DROP CONSTRAINT IF EXISTS budget_range_valid;

-- Migrer les données existantes vers budget_value_cents
UPDATE missions 
SET budget_value_cents = COALESCE(budget_value_cents, budget_min_cents, budget_max_cents)
WHERE budget_value_cents IS NULL;

-- Supprimer les colonnes inutiles
ALTER TABLE missions DROP COLUMN IF EXISTS budget_type;
ALTER TABLE missions DROP COLUMN IF EXISTS budget_min_cents;
ALTER TABLE missions DROP COLUMN IF EXISTS budget_max_cents;

-- Rendre budget_value_cents obligatoire avec contrainte minimum
ALTER TABLE missions ALTER COLUMN budget_value_cents SET NOT NULL;
ALTER TABLE missions ADD CONSTRAINT budget_minimum CHECK (budget_value_cents >= 1000);

COMMIT;
