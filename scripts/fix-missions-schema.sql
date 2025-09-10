
-- Script pour ajouter la colonne client_id si elle n'existe pas
DO $$ 
BEGIN
    -- Ajouter client_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='client_id') THEN
        ALTER TABLE missions ADD COLUMN client_id INTEGER REFERENCES users(id);
    END IF;
    
    -- Ajouter budget si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='budget') THEN
        ALTER TABLE missions ADD COLUMN budget INTEGER;
    END IF;
    
    -- Ajouter tags si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='tags') THEN
        ALTER TABLE missions ADD COLUMN tags TEXT[];
    END IF;
    
    -- Ajouter requirements si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='missions' AND column_name='requirements') THEN
        ALTER TABLE missions ADD COLUMN requirements TEXT;
    END IF;
    
    -- Synchroniser client_id avec user_id pour les missions existantes
    UPDATE missions SET client_id = user_id WHERE client_id IS NULL AND user_id IS NOT NULL;
    
END $$;
