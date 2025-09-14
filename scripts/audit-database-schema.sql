
-- Audit et correction complète du schéma missions
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    -- Vérifier la structure actuelle de la table missions
    RAISE NOTICE '🔍 AUDIT SCHÉMA MISSIONS - Début';
    
    -- 1. Lister toutes les colonnes existantes
    FOR rec IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'missions' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   Colonne: % (%) % - Défaut: %', 
            rec.column_name, 
            rec.data_type, 
            CASE WHEN rec.is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END,
            COALESCE(rec.column_default, 'NONE');
    END LOOP;

    -- 2. Ajouter les colonnes manquantes critiques
    -- Vérifier et ajouter budget_value_cents
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='budget_value_cents') THEN
        ALTER TABLE missions ADD COLUMN budget_value_cents INTEGER;
        RAISE NOTICE '✅ Colonne budget_value_cents ajoutée';
    END IF;

    -- Vérifier et ajouter location_data (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='location_data') THEN
        ALTER TABLE missions ADD COLUMN location_data JSONB;
        RAISE NOTICE '✅ Colonne location_data ajoutée';
    END IF;

    -- Vérifier et ajouter excerpt
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='excerpt') THEN
        ALTER TABLE missions ADD COLUMN excerpt TEXT;
        RAISE NOTICE '✅ Colonne excerpt ajoutée';
    END IF;

    -- 3. Migrer les données existantes si nécessaire
    -- Migrer budget vers budget_value_cents (en centimes)
    UPDATE missions 
    SET budget_value_cents = CASE 
        WHEN budget IS NOT NULL AND budget::text ~ '^[0-9]+$' 
        THEN (budget::integer * 100)
        ELSE 100000 
    END
    WHERE budget_value_cents IS NULL;

    -- Créer location_data à partir des champs existants
    UPDATE missions 
    SET location_data = jsonb_build_object(
        'raw', COALESCE(location_raw, location, 'Remote'),
        'city', COALESCE(city, 'Remote'),
        'address', postal_code,
        'country', COALESCE(country, 'France'),
        'remote_allowed', COALESCE(remote_allowed, true)
    )
    WHERE location_data IS NULL;

    -- Générer excerpt à partir de description
    UPDATE missions 
    SET excerpt = LEFT(description, 200) || 
        CASE WHEN LENGTH(description) > 200 THEN '...' ELSE '' END
    WHERE excerpt IS NULL AND description IS NOT NULL;

    -- 4. Statistiques finales
    SELECT COUNT(*) INTO rec FROM missions;
    RAISE NOTICE '📊 Total missions: %', rec;
    
    SELECT COUNT(*) INTO rec FROM missions WHERE status = 'open';
    RAISE NOTICE '📊 Missions ouvertes: %', rec;

    RAISE NOTICE '✅ AUDIT TERMINÉ - Schéma missions corrigé';

END $$;

-- Vérifier les contraintes et index
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at);
