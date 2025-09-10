
-- Migration pour renommer project_id en mission_id dans la table bids
DO $$
BEGIN
    -- Vérifier si la colonne project_id existe et mission_id n'existe pas
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bids' AND column_name = 'project_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bids' AND column_name = 'mission_id') THEN
        
        -- Renommer la colonne
        ALTER TABLE bids RENAME COLUMN project_id TO mission_id;
        
        RAISE NOTICE 'Colonne project_id renommée en mission_id dans la table bids';
    ELSE
        RAISE NOTICE 'Migration déjà appliquée ou structure différente';
    END IF;
END $$;

-- Vérifier que la migration a fonctionné
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bids' AND column_name IN ('mission_id', 'project_id');
