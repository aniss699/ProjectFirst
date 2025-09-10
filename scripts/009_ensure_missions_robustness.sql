
-- Migration 009: Assurer la robustesse de la table missions
-- Date: 2024-01-26
-- Description: S'assurer que toutes les colonnes nécessaires existent

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Vérifier et ajouter les index pour les performances
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category);

-- S'assurer que les contraintes sont en place
ALTER TABLE missions 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL,
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL;

-- Mettre à jour les missions existantes sans excerpt
UPDATE missions 
SET excerpt = CASE 
  WHEN LENGTH(description) <= 200 THEN description
  WHEN POSITION('.' IN SUBSTRING(description, 1, 200)) > 120 THEN 
    SUBSTRING(description, 1, POSITION('.' IN SUBSTRING(description, 1, 200))) 
  ELSE 
    SUBSTRING(description, 1, 200) || '...'
END
WHERE excerpt IS NULL AND description IS NOT NULL;

-- Log de la migration
INSERT INTO migrations_log (migration_name, executed_at, description) 
VALUES ('009_ensure_missions_robustness', NOW(), 'Added robustness constraints and indexes to missions table')
ON CONFLICT (migration_name) DO NOTHING;
