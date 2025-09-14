
-- Script de correction du schéma pour le marketplace
-- Exécution : psql $DATABASE_URL -f scripts/fix-marketplace-schema.sql

BEGIN;

-- 1. Ajouter la colonne excerpt si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'excerpt') THEN
        ALTER TABLE missions ADD COLUMN excerpt TEXT;
        RAISE NOTICE 'Colonne excerpt ajoutée';
    ELSE
        RAISE NOTICE 'Colonne excerpt existe déjà';
    END IF;
END $$;

-- 2. Mettre à jour les excerpts manquants
UPDATE missions 
SET excerpt = CASE 
    WHEN LENGTH(description) <= 200 THEN description
    WHEN POSITION('.' IN SUBSTRING(description, 1, 200)) > 120 THEN 
        SUBSTRING(description, 1, POSITION('.' IN SUBSTRING(description, 1, 200))) 
    ELSE 
        SUBSTRING(description, 1, 200) || '...'
END
WHERE excerpt IS NULL OR excerpt = '';

-- 3. S'assurer que les statuts sont cohérents
UPDATE missions 
SET status = 'open' 
WHERE status IS NULL OR status = '';

-- 4. S'assurer que les catégories sont définies
UPDATE missions 
SET category = 'general' 
WHERE category IS NULL OR category = '';

-- 5. Ajouter des valeurs par défaut pour les champs requis
UPDATE missions 
SET 
    currency = COALESCE(currency, 'EUR'),
    country = COALESCE(country, 'France'),
    remote_allowed = COALESCE(remote_allowed, true),
    is_team_mission = COALESCE(is_team_mission, false),
    team_size = COALESCE(team_size, 1),
    urgency = COALESCE(urgency, 'medium')
WHERE currency IS NULL OR country IS NULL OR remote_allowed IS NULL 
   OR is_team_mission IS NULL OR team_size IS NULL OR urgency IS NULL;

-- 6. Vérifier les résultats
SELECT 
    COUNT(*) as total_missions,
    COUNT(CASE WHEN excerpt IS NOT NULL AND excerpt != '' THEN 1 END) as missions_with_excerpt,
    COUNT(CASE WHEN excerpt IS NULL OR excerpt = '' THEN 1 END) as missions_without_excerpt,
    COUNT(CASE WHEN status IN ('open', 'published', 'active') THEN 1 END) as missions_with_valid_status
FROM missions;

COMMIT;

-- Afficher quelques missions pour vérification
SELECT id, title, LEFT(excerpt, 50) as excerpt_preview, status, category, budget_value_cents
FROM missions 
ORDER BY created_at DESC 
LIMIT 5;
