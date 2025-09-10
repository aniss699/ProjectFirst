
-- Script de migration et harmonisation de la base de données
-- À exécuter pour corriger la structure des tables

-- 1. Sauvegarde des données existantes
CREATE TABLE IF NOT EXISTS missions_backup AS SELECT * FROM missions;

-- 2. Supprimer les contraintes problématiques
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_user_id_users_id_fk;
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_client_id_users_id_fk;
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_provider_id_users_id_fk;

-- 3. Supprimer les colonnes inexistantes ou problématiques
ALTER TABLE missions DROP COLUMN IF EXISTS budget_value_cents;
ALTER TABLE missions DROP COLUMN IF EXISTS budget_min_cents;
ALTER TABLE missions DROP COLUMN IF EXISTS budget_max_cents;
ALTER TABLE missions DROP COLUMN IF EXISTS budget_type;
ALTER TABLE missions DROP COLUMN IF EXISTS excerpt;
ALTER TABLE missions DROP COLUMN IF EXISTS tags;
ALTER TABLE missions DROP COLUMN IF EXISTS skills_required;
ALTER TABLE missions DROP COLUMN IF EXISTS location_raw;
ALTER TABLE missions DROP COLUMN IF EXISTS city;
ALTER TABLE missions DROP COLUMN IF EXISTS postal_code;
ALTER TABLE missions DROP COLUMN IF EXISTS country;
ALTER TABLE missions DROP COLUMN IF EXISTS latitude;
ALTER TABLE missions DROP COLUMN IF EXISTS longitude;
ALTER TABLE missions DROP COLUMN IF EXISTS remote_allowed;
ALTER TABLE missions DROP COLUMN IF EXISTS client_id;
ALTER TABLE missions DROP COLUMN IF EXISTS provider_id;
ALTER TABLE missions DROP COLUMN IF EXISTS urgency;
ALTER TABLE missions DROP COLUMN IF EXISTS deadline;
ALTER TABLE missions DROP COLUMN IF EXISTS is_team_mission;
ALTER TABLE missions DROP COLUMN IF EXISTS team_size;
ALTER TABLE missions DROP COLUMN IF EXISTS requirements;
ALTER TABLE missions DROP COLUMN IF EXISTS deliverables;
ALTER TABLE missions DROP COLUMN IF EXISTS published_at;
ALTER TABLE missions DROP COLUMN IF EXISTS expires_at;
ALTER TABLE missions DROP COLUMN IF EXISTS search_vector;

-- 4. Ajouter les colonnes essentielles manquantes
ALTER TABLE missions ADD COLUMN IF NOT EXISTS budget INTEGER DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE missions ADD COLUMN IF NOT EXISTS location TEXT;

-- 5. Migrer les données des anciennes colonnes vers les nouvelles (si elles existent)
UPDATE missions SET 
  budget = COALESCE(budget_value_cents, budget_min_cents, 0),
  location = COALESCE(location_raw, city, 'Remote')
WHERE budget IS NULL OR location IS NULL;

-- 6. Nettoyer les données
UPDATE missions SET 
  title = TRIM(title),
  description = TRIM(description),
  category = COALESCE(NULLIF(category, ''), 'developpement'),
  status = COALESCE(NULLIF(status, ''), 'published'),
  budget = COALESCE(budget, 0),
  currency = COALESCE(NULLIF(currency, ''), 'EUR')
WHERE title IS NOT NULL;

-- 7. Supprimer les missions invalides
DELETE FROM missions WHERE 
  title IS NULL OR 
  title = '' OR 
  description IS NULL OR 
  description = '' OR
  user_id IS NULL;

-- 8. Recréer les contraintes essentielles
ALTER TABLE missions ADD CONSTRAINT missions_user_id_users_id_fk 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 9. Nettoyer la table bids
UPDATE bids SET mission_id = mission_id WHERE project_id IS NOT NULL AND mission_id IS NULL;
ALTER TABLE bids DROP COLUMN IF EXISTS project_id;

-- 10. Vérifier la cohérence
SELECT 
  'missions' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as valid_titles,
  COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as valid_descriptions,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as valid_user_ids
FROM missions

UNION ALL

SELECT 
  'bids' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN mission_id IS NOT NULL THEN 1 END) as valid_mission_ids,
  COUNT(CASE WHEN provider_id IS NOT NULL THEN 1 END) as valid_provider_ids,
  COUNT(CASE WHEN amount_cents > 0 THEN 1 END) as valid_amounts
FROM bids;

-- 11. Réindexer pour les performances
DROP INDEX IF EXISTS idx_missions_user_id;
DROP INDEX IF EXISTS idx_missions_status;
DROP INDEX IF EXISTS idx_missions_created_at;

CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_created_at ON missions(created_at DESC);
CREATE INDEX idx_bids_mission_id ON bids(mission_id);
CREATE INDEX idx_bids_provider_id ON bids(provider_id);

-- 12. Statistiques finales
SELECT 
  'Migration completed' as status,
  (SELECT COUNT(*) FROM missions) as total_missions,
  (SELECT COUNT(*) FROM bids) as total_bids,
  (SELECT COUNT(*) FROM users) as total_users;
