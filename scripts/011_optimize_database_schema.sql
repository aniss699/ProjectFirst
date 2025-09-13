
-- Migration 011: Optimisation du schéma de base de données
-- Date: 2024-01-26
-- Description: Correction des redondances et optimisation du schéma

DO $$
BEGIN
    -- 1. UNIFICATION DU BUDGET - Supprimer la redondance budget/budget_value_cents
    -- Migrer les données de 'budget' vers 'budget_value_cents' si nécessaire
    UPDATE missions 
    SET budget_value_cents = budget * 100 
    WHERE budget_value_cents IS NULL AND budget IS NOT NULL;

    -- Supprimer l'ancienne colonne budget redondante
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'missions' AND column_name = 'budget') THEN
        ALTER TABLE missions DROP COLUMN budget;
        RAISE NOTICE 'Colonne budget redondante supprimée';
    END IF;

    -- 2. OPTIMISATION LOCALISATION - Simplifier en structure JSON
    -- Ajouter une colonne location_data JSON pour centraliser
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'location_data') THEN
        ALTER TABLE missions ADD COLUMN location_data JSONB;
        RAISE NOTICE 'Colonne location_data ajoutée';
    END IF;

    -- Migrer les données de localisation existantes vers JSON
    UPDATE missions 
    SET location_data = jsonb_build_object(
        'address', COALESCE(location_raw, location),
        'postal_code', postal_code,
        'city', city,
        'country', COALESCE(country, 'France'),
        'coordinates', CASE 
            WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
            THEN jsonb_build_object('lat', latitude, 'lng', longitude)
            ELSE NULL
        END,
        'remote_allowed', COALESCE(remote_allowed, true)
    )
    WHERE location_data IS NULL;

    -- 3. CONVERSION DES ENUMS EN VRAIS ENUMS PostgreSQL
    -- Créer les types ENUM
    DO $enum_block$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mission_status_enum') THEN
            CREATE TYPE mission_status_enum AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
            RAISE NOTICE 'Type mission_status_enum créé';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_enum') THEN
            CREATE TYPE urgency_enum AS ENUM ('low', 'medium', 'high', 'urgent');
            RAISE NOTICE 'Type urgency_enum créé';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quality_target_enum') THEN
            CREATE TYPE quality_target_enum AS ENUM ('basic', 'standard', 'premium', 'luxury');
            RAISE NOTICE 'Type quality_target_enum créé';
        END IF;
    END $enum_block$;

    -- 4. NETTOYAGE DES COLONNES PEU UTILISÉES
    -- Supprimer les colonnes qui semblent peu utilisées
    ALTER TABLE missions DROP COLUMN IF EXISTS risk_tolerance;
    ALTER TABLE missions DROP COLUMN IF EXISTS geo_required;
    ALTER TABLE missions DROP COLUMN IF EXISTS onsite_radius_km;
    ALTER TABLE missions DROP COLUMN IF EXISTS loc_score;
    
    RAISE NOTICE 'Colonnes peu utilisées supprimées';

    -- 5. AJOUT D'INDEX OPTIMISÉS
    -- Index pour les recherches fréquentes
    CREATE INDEX IF NOT EXISTS idx_missions_status_created_optimized 
    ON missions(status, created_at DESC) WHERE status IN ('open', 'in_progress');

    CREATE INDEX IF NOT EXISTS idx_missions_budget_category 
    ON missions(budget_value_cents, category) WHERE status = 'open';

    CREATE INDEX IF NOT EXISTS idx_missions_location_data_gin 
    ON missions USING GIN(location_data) WHERE location_data IS NOT NULL;

    -- Index partiel pour les missions d'équipe
    CREATE INDEX IF NOT EXISTS idx_missions_team_active 
    ON missions(is_team_mission, team_size, created_at DESC) 
    WHERE is_team_mission = true AND status = 'open';

    RAISE NOTICE 'Index optimisés créés';

    -- 6. CONTRAINTES MÉTIER AMÉLIORÉES
    -- Contrainte budget minimum
    ALTER TABLE missions DROP CONSTRAINT IF EXISTS budget_minimum;
    ALTER TABLE missions ADD CONSTRAINT budget_minimum_optimized 
    CHECK (budget_value_cents >= 1000); -- Minimum 10€

    -- Contrainte team_size cohérente
    ALTER TABLE missions ADD CONSTRAINT team_size_coherence 
    CHECK ((is_team_mission = false AND team_size <= 1) OR 
           (is_team_mission = true AND team_size >= 2));

    RAISE NOTICE 'Contraintes métier améliorées';

    -- 7. TRIGGER POUR MISE À JOUR AUTOMATIQUE
    CREATE OR REPLACE FUNCTION update_missions_search_data()
    RETURNS TRIGGER AS $trigger$
    BEGIN
        -- Mise à jour automatique du search_vector
        NEW.search_vector := to_tsvector('french', 
            COALESCE(NEW.title, '') || ' ' || 
            COALESCE(NEW.description, '') || ' ' || 
            COALESCE(NEW.category, '') || ' ' ||
            COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
            COALESCE(array_to_string(NEW.skills_required, ' '), '')
        );

        -- Mise à jour timestamp
        NEW.updated_at := NOW();

        -- Auto-publication
        IF OLD.status != 'open' AND NEW.status = 'open' THEN
            NEW.published_at := NOW();
        END IF;

        RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS missions_search_update_trigger ON missions;
    CREATE TRIGGER missions_search_update_trigger
        BEFORE UPDATE ON missions
        FOR EACH ROW
        EXECUTE FUNCTION update_missions_search_data();

    RAISE NOTICE 'Triggers de mise à jour automatique créés';

END $$;

-- Log de la migration
INSERT INTO migrations_log (migration_name, executed_at, description) 
VALUES ('011_optimize_database_schema', NOW(), 'Optimisation complète du schéma: unification budget, simplification localisation, ENUMs PostgreSQL, nettoyage colonnes, index optimisés')
ON CONFLICT (migration_name) DO NOTHING;
