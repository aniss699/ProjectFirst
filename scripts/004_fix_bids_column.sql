
-- Migration pour renommer mission_id en project_id dans la table bids
DO $$
BEGIN
    -- Vérifier si la colonne mission_id existe et project_id n'existe pas
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bids' AND column_name = 'mission_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bids' AND column_name = 'project_id') THEN
        
        -- Renommer la colonne
        ALTER TABLE bids RENAME COLUMN mission_id TO project_id;
        
        RAISE NOTICE 'Colonne mission_id renommée en project_id dans la table bids';
    ELSE
        RAISE NOTICE 'Migration déjà appliquée ou structure différente';
    END IF;
END $$;

-- Vérifier que la migration a fonctionné
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bids' AND column_name IN ('project_id', 'mission_id');
