
-- =========================================
-- SCRIPT DE NETTOYAGE COMPLET DES MISSIONS
-- =========================================

-- 1. Sauvegarder les données avant suppression (optionnel)
-- CREATE TABLE missions_backup AS SELECT * FROM missions;
-- CREATE TABLE bids_backup AS SELECT * FROM bids;

-- 2. Supprimer les offres (bids) liées aux missions
DELETE FROM bids WHERE mission_id IS NOT NULL;

-- 3. Supprimer toutes les missions
DELETE FROM missions;

-- 4. Réinitialiser les séquences auto-increment
ALTER SEQUENCE missions_id_seq RESTART WITH 1;
ALTER SEQUENCE bids_id_seq RESTART WITH 1;

-- 5. Supprimer les contraintes et index liés aux missions (si nécessaire)
-- DROP INDEX IF EXISTS idx_missions_status_created;
-- DROP INDEX IF EXISTS idx_missions_user_status;
-- DROP INDEX IF EXISTS idx_missions_category_status;

-- 6. Nettoyer les tables de cache ou autres données liées
-- DELETE FROM project_standardizations WHERE project_id IN (SELECT id FROM projects WHERE type = 'mission');

-- 7. Vérifier que les tables sont vides
SELECT 'missions' as table_name, COUNT(*) as count FROM missions
UNION ALL
SELECT 'bids' as table_name, COUNT(*) as count FROM bids WHERE mission_id IS NOT NULL;

-- 8. Message de confirmation
SELECT 'Nettoyage des missions terminé' as status;
