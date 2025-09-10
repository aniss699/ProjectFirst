
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
