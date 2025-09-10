
-- =========================================
-- MIGRATION: Table missions industrialisée
-- =========================================

-- 1. Créer le type ENUM pour les statuts
CREATE TYPE mission_status AS ENUM (
  'draft',
  'published', 
  'awarded',
  'in_progress',
  'completed',
  'cancelled',
  'expired'
);

-- 2. Créer le type ENUM pour les devises
CREATE TYPE currency_code AS ENUM ('EUR', 'USD', 'GBP', 'CHF');

-- 3. Créer le type ENUM pour l'urgence
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- 4. Table missions principale
CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  
  -- Métadonnées de base
  title TEXT NOT NULL CHECK (length(trim(title)) >= 3),
  description TEXT NOT NULL CHECK (length(trim(description)) >= 10),
  excerpt TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN length(description) > 200 
      THEN left(description, 197) || '...'
      ELSE description
    END
  ) STORED,
  
  -- Catégorisation
  category TEXT NOT NULL DEFAULT 'developpement',
  tags TEXT[] DEFAULT '{}',
  skills_required TEXT[] DEFAULT '{}',
  
  -- Budget (en centimes) - prix unique
  budget_value_cents INTEGER NOT NULL CHECK (budget_value_cents >= 1000), -- Minimum 10€
  currency currency_code NOT NULL DEFAULT 'EUR',
  
  -- Localisation
  location_raw TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  remote_allowed BOOLEAN DEFAULT true,
  
  -- Ownership & relations
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Contrainte : client_id = user_id par défaut
  CONSTRAINT client_is_user CHECK (client_id = user_id),
  
  -- Statut et timing
  status mission_status NOT NULL DEFAULT 'draft',
  urgency urgency_level DEFAULT 'medium',
  deadline TIMESTAMPTZ,
  
  -- Équipe
  is_team_mission BOOLEAN DEFAULT false,
  team_size INTEGER DEFAULT 1 CHECK (team_size >= 1),
  
  -- Contrainte : team_size > 1 si is_team_mission
  CONSTRAINT team_size_valid CHECK (
    (NOT is_team_mission) OR (team_size > 1)
  ),
  
  -- Métadonnées
  requirements TEXT,
  deliverables JSONB DEFAULT '[]',
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Recherche full-text
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(array_to_string(tags, ' '), '')), 'C') ||
    setweight(to_tsvector('french', coalesce(array_to_string(skills_required, ' '), '')), 'D')
  ) STORED
);

-- 5. Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-set published_at when status changes to published
  IF OLD.status != 'published' AND NEW.status = 'published' THEN
    NEW.published_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER missions_updated_at_trigger
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

-- 6. Index recommandés
-- Index principal pour les requêtes courantes
CREATE INDEX idx_missions_status_created ON missions(status, created_at DESC);
CREATE INDEX idx_missions_user_status ON missions(user_id, status);
CREATE INDEX idx_missions_category_status ON missions(category, status) WHERE status = 'published';

-- Index géospatial (si PostGIS disponible, sinon B-tree composite)
CREATE INDEX idx_missions_location ON missions(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index pour les tags et skills (GIN)
CREATE INDEX idx_missions_tags_gin ON missions USING GIN(tags);
CREATE INDEX idx_missions_skills_gin ON missions USING GIN(skills_required);

-- Index full-text search
CREATE INDEX idx_missions_search_vector ON missions USING GIN(search_vector);

-- Index pour les requêtes de budget
CREATE INDEX idx_missions_budget ON missions(budget_value_cents, currency) WHERE status = 'published';

-- Index pour les missions d'équipe
CREATE INDEX idx_missions_team ON missions(is_team_mission, team_size) WHERE is_team_mission = true;

-- Index pour les deadlines
CREATE INDEX idx_missions_deadline ON missions(deadline) WHERE deadline IS NOT NULL AND status IN ('published', 'awarded');

-- 7. Quelques contraintes métier supplémentaires
-- Empêcher modification après attribution
CREATE OR REPLACE FUNCTION prevent_mission_edit_after_award()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('awarded', 'completed') AND 
     (NEW.title != OLD.title OR NEW.description != OLD.description OR NEW.budget_value_cents != OLD.budget_value_cents) THEN
    RAISE EXCEPTION 'Cannot modify mission content after award or completion';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER missions_prevent_edit_after_award
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_mission_edit_after_award();

COMMENT ON TABLE missions IS 'Table principale des missions avec contraintes métier et indexation optimisée';
