
-- Script pour synchroniser la structure de la table missions avec le schéma
DO $$ 
BEGIN
    -- Ajouter user_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='user_id') THEN
        ALTER TABLE missions ADD COLUMN user_id INTEGER REFERENCES users(id);
        RAISE NOTICE 'Colonne user_id ajoutée';
    END IF;
    
    -- Ajouter client_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='client_id') THEN
        ALTER TABLE missions ADD COLUMN client_id INTEGER REFERENCES users(id);
        RAISE NOTICE 'Colonne client_id ajoutée';
    END IF;
    
    -- Ajouter budget si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='budget') THEN
        ALTER TABLE missions ADD COLUMN budget INTEGER;
        RAISE NOTICE 'Colonne budget ajoutée';
    END IF;
    
    -- Ajouter budget_min si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='budget_min') THEN
        ALTER TABLE missions ADD COLUMN budget_min INTEGER;
        RAISE NOTICE 'Colonne budget_min ajoutée';
    END IF;
    
    -- Ajouter budget_max si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='budget_max') THEN
        ALTER TABLE missions ADD COLUMN budget_max INTEGER;
        RAISE NOTICE 'Colonne budget_max ajoutée';
    END IF;
    
    -- Ajouter urgency si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='urgency') THEN
        ALTER TABLE missions ADD COLUMN urgency TEXT;
        RAISE NOTICE 'Colonne urgency ajoutée';
    END IF;
    
    -- Ajouter tags si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='tags') THEN
        ALTER TABLE missions ADD COLUMN tags TEXT[];
        RAISE NOTICE 'Colonne tags ajoutée';
    END IF;
    
    -- Ajouter requirements si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='requirements') THEN
        ALTER TABLE missions ADD COLUMN requirements TEXT;
        RAISE NOTICE 'Colonne requirements ajoutée';
    END IF;
    
    -- Ajouter deadline si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='deadline') THEN
        ALTER TABLE missions ADD COLUMN deadline TIMESTAMP;
        RAISE NOTICE 'Colonne deadline ajoutée';
    END IF;
    
    -- Ajouter provider_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='provider_id') THEN
        ALTER TABLE missions ADD COLUMN provider_id INTEGER REFERENCES users(id);
        RAISE NOTICE 'Colonne provider_id ajoutée';
    END IF;
    
    -- Ajouter skills_required si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='skills_required') THEN
        ALTER TABLE missions ADD COLUMN skills_required TEXT[];
        RAISE NOTICE 'Colonne skills_required ajoutée';
    END IF;
    
    -- Ajouter is_team_mission si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='is_team_mission') THEN
        ALTER TABLE missions ADD COLUMN is_team_mission BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne is_team_mission ajoutée';
    END IF;
    
    -- Ajouter team_size si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='team_size') THEN
        ALTER TABLE missions ADD COLUMN team_size INTEGER DEFAULT 1;
        RAISE NOTICE 'Colonne team_size ajoutée';
    END IF;
    
    -- Ajouter remote_allowed si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='remote_allowed') THEN
        ALTER TABLE missions ADD COLUMN remote_allowed BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonne remote_allowed ajoutée';
    END IF;
    
    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='updated_at') THEN
        ALTER TABLE missions ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée';
    END IF;
    
    -- Synchroniser client_id avec user_id pour les missions existantes
    UPDATE missions SET client_id = user_id WHERE client_id IS NULL AND user_id IS NOT NULL;
    UPDATE missions SET user_id = client_id WHERE user_id IS NULL AND client_id IS NOT NULL;
    
    RAISE NOTICE 'Migration terminée avec succès!';
    
END $$;
