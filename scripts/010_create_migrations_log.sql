
-- Migration 010: Créer la table migrations_log manquante
-- Date: 2025-01-10
-- Description: Créer la table pour tracer les migrations

CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed'
);

-- Insérer les migrations déjà appliquées
INSERT INTO migrations_log (migration_name, executed_at, description, status) 
VALUES 
  ('009_ensure_missions_robustness', NOW(), 'Added robustness constraints and indexes to missions table', 'completed')
ON CONFLICT (migration_name) DO NOTHING;

-- Log de cette migration
INSERT INTO migrations_log (migration_name, executed_at, description) 
VALUES ('010_create_migrations_log', NOW(), 'Created migrations_log table for tracking schema changes')
ON CONFLICT (migration_name) DO NOTHING;
