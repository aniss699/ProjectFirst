
-- Nettoyage des champs dynamiques dans la base de données
-- Script: 008_cleanup_dynamic_fields.sql

-- Commenter ou supprimer les colonnes liées aux champs dynamiques si elles existent
-- Note: Ces colonnes n'existent probablement pas dans le schéma actuel,
-- mais ce script assure le nettoyage complet

-- Si des colonnes dynamic_fields existaient dans la table missions
-- ALTER TABLE missions DROP COLUMN IF EXISTS dynamic_fields;

-- Si des colonnes dynamic_fields existaient dans la table announcements  
-- ALTER TABLE announcements DROP COLUMN IF EXISTS dynamic_fields;

-- Nettoyage des éventuelles données sérialisées dans la description
-- qui pourraient contenir des références aux champs dynamiques
UPDATE missions 
SET description = REGEXP_REPLACE(description, E'\n\nInformations spécifiques:\n[^\n]*(\n[^\n]*)*', '', 'g')
WHERE description ~ E'\n\nInformations spécifiques:\n';

UPDATE announcements 
SET description = REGEXP_REPLACE(description, E'\n\nInformations spécifiques:\n[^\n]*(\n[^\n]*)*', '', 'g')
WHERE description ~ E'\n\nInformations spécifiques:\n';

-- Commit des changements
COMMIT;

NOTIFY dynamic_fields_cleanup_completed;
