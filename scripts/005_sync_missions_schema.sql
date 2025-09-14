
-- Migration pour synchroniser la table missions avec le schéma TypeScript
DO $$
BEGIN
    -- Ajouter la colonne tags si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'tags') THEN
        ALTER TABLE missions ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Colonne tags ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne skills_required si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'skills_required') THEN
        ALTER TABLE missions ADD COLUMN skills_required TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Colonne skills_required ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne requirements si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'requirements') THEN
        ALTER TABLE missions ADD COLUMN requirements TEXT;
        RAISE NOTICE 'Colonne requirements ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne deliverables si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'deliverables') THEN
        ALTER TABLE missions ADD COLUMN deliverables JSONB DEFAULT '[]';
        RAISE NOTICE 'Colonne deliverables ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne search_vector si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'search_vector') THEN
        ALTER TABLE missions ADD COLUMN search_vector TEXT;
        RAISE NOTICE 'Colonne search_vector ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne budget_value_cents si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'budget_value_cents') THEN
        ALTER TABLE missions ADD COLUMN budget_value_cents INTEGER;
        RAISE NOTICE 'Colonne budget_value_cents ajoutée à la table missions';
    END IF;

    -- Migrer les données de budget vers budget_value_cents si nécessaire
    UPDATE missions 
    SET budget_value_cents = budget * 100 
    WHERE budget_value_cents IS NULL AND budget IS NOT NULL;

    -- Ajouter la colonne currency si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'currency') THEN
        -- Créer d'abord l'enum currency_code s'il n'existe pas
        DO $currency$ BEGIN
            CREATE TYPE currency_code AS ENUM ('EUR', 'USD', 'GBP', 'CHF');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $currency$;
        
        ALTER TABLE missions ADD COLUMN currency currency_code DEFAULT 'EUR';
        RAISE NOTICE 'Colonne currency ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne location_raw si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'location_raw') THEN
        ALTER TABLE missions ADD COLUMN location_raw TEXT;
        RAISE NOTICE 'Colonne location_raw ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne city si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'city') THEN
        ALTER TABLE missions ADD COLUMN city TEXT;
        RAISE NOTICE 'Colonne city ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne country si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'country') THEN
        ALTER TABLE missions ADD COLUMN country TEXT DEFAULT 'France';
        RAISE NOTICE 'Colonne country ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne postal_code si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'postal_code') THEN
        ALTER TABLE missions ADD COLUMN postal_code TEXT;
        RAISE NOTICE 'Colonne postal_code ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne client_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'client_id') THEN
        ALTER TABLE missions ADD COLUMN client_id INTEGER REFERENCES users(id);
        RAISE NOTICE 'Colonne client_id ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne urgency si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'urgency') THEN
        ALTER TABLE missions ADD COLUMN urgency TEXT DEFAULT 'medium';
        RAISE NOTICE 'Colonne urgency ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne remote_allowed si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'remote_allowed') THEN
        ALTER TABLE missions ADD COLUMN remote_allowed BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonne remote_allowed ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne is_team_mission si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'is_team_mission') THEN
        ALTER TABLE missions ADD COLUMN is_team_mission BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne is_team_mission ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne team_size si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'team_size') THEN
        ALTER TABLE missions ADD COLUMN team_size INTEGER DEFAULT 1;
        RAISE NOTICE 'Colonne team_size ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne deadline si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'deadline') THEN
        ALTER TABLE missions ADD COLUMN deadline TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne deadline ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne latitude si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'latitude') THEN
        ALTER TABLE missions ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE 'Colonne latitude ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne longitude si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'longitude') THEN
        ALTER TABLE missions ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE 'Colonne longitude ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne provider_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'provider_id') THEN
        ALTER TABLE missions ADD COLUMN provider_id INTEGER REFERENCES users(id);
        RAISE NOTICE 'Colonne provider_id ajoutée à la table missions';
    END IF;

    -- Ajouter la colonne excerpt si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'excerpt') THEN
        ALTER TABLE missions ADD COLUMN excerpt TEXT;
        RAISE NOTICE 'Colonne excerpt ajoutée à la table missions';
        
        -- Remplir les excerpts pour les missions existantes
        UPDATE missions 
        SET excerpt = CASE 
          WHEN LENGTH(description) <= 200 THEN description
          WHEN POSITION('.' IN SUBSTRING(description, 1, 200)) > 120 THEN 
            SUBSTRING(description, 1, POSITION('.' IN SUBSTRING(description, 1, 200))) 
          ELSE 
            SUBSTRING(description, 1, 200) || '...'
        END
        WHERE excerpt IS NULL AND description IS NOT NULL;
    END IF;

    -- Supprimer les anciennes colonnes budget_min_cents et budget_max_cents si elles existent
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'missions' AND column_name = 'budget_min_cents') THEN
        ALTER TABLE missions DROP COLUMN budget_min_cents;
        RAISE NOTICE 'Colonne budget_min_cents supprimée de la table missions';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'missions' AND column_name = 'budget_max_cents') THEN
        ALTER TABLE missions DROP COLUMN budget_max_cents;
        RAISE NOTICE 'Colonne budget_max_cents supprimée de la table missions';
    END IF;

    -- Vérifier les colonnes de budget
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'budget_type') THEN
        ALTER TABLE missions ADD COLUMN budget_type TEXT DEFAULT 'fixed';
        RAISE NOTICE 'Colonne budget_type ajoutée à la table missions';
    END IF;

    -- Ajouter les colonnes de timestamps si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'published_at') THEN
        ALTER TABLE missions ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne published_at ajoutée à la table missions';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'expires_at') THEN
        ALTER TABLE missions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne expires_at ajoutée à la table missions';
    END IF;

END $$;

-- Vérifier les colonnes de la table missions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'missions' 
ORDER BY ordinal_position;
