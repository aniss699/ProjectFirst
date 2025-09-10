
-- Migration pour renommer client_id en user_id dans la table missions
ALTER TABLE missions RENAME COLUMN client_id TO user_id;

-- Vérifier que la migration a fonctionné
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'missions' AND column_name IN ('user_id', 'client_id');
