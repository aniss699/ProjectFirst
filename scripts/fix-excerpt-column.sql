
-- Script de correction pour la colonne excerpt
DO $$
BEGIN
    -- Vérifier et ajouter la colonne excerpt si elle n'existe pas
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
        
        RAISE NOTICE 'Excerpts générés pour les missions existantes';
    ELSE
        RAISE NOTICE 'Colonne excerpt existe déjà';
        
        -- Mettre à jour les excerpts vides
        UPDATE missions 
        SET excerpt = CASE 
          WHEN LENGTH(description) <= 200 THEN description
          WHEN POSITION('.' IN SUBSTRING(description, 1, 200)) > 120 THEN 
            SUBSTRING(description, 1, POSITION('.' IN SUBSTRING(description, 1, 200))) 
          ELSE 
            SUBSTRING(description, 1, 200) || '...'
        END
        WHERE (excerpt IS NULL OR excerpt = '') AND description IS NOT NULL;
        
        RAISE NOTICE 'Excerpts mis à jour pour les missions avec excerpt vide';
    END IF;
END $$;

-- Vérifier le résultat
SELECT COUNT(*) as total_missions, 
       COUNT(excerpt) as missions_with_excerpt,
       COUNT(*) - COUNT(excerpt) as missions_without_excerpt
FROM missions;
