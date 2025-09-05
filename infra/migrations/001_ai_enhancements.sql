
-- Migrations additives pour les améliorations IA
-- Toutes les colonnes sont nullables pour compatibilité

-- Extension pgvector si pas déjà présente
CREATE EXTENSION IF NOT EXISTS vector;

-- Taxonomies hiérarchiques avec synonymes
CREATE TABLE IF NOT EXISTS taxonomies (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES taxonomies(id),
    synonyms JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enrichissements missions (additif)
ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS structured JSONB,
ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sow JSONB,
ADD COLUMN IF NOT EXISTS price_estimation JSONB;

-- Enrichissements providers (additif)
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS radius_km INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS quality_score FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS response_rate FLOAT DEFAULT 0.0;

-- Embeddings pour matching sémantique
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    owner_type VARCHAR(20) CHECK (owner_type IN ('mission', 'provider', 'taxonomy')),
    owner_id INTEGER NOT NULL,
    vector vector(384), -- Dimension pour sentence-transformers
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche vectorielle
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_embeddings_owner ON embeddings (owner_type, owner_id);

-- Offres structurées
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    mission_id INTEGER REFERENCES missions(id),
    provider_id INTEGER REFERENCES providers(id),
    price DECIMAL(10,2),
    breakdown JSONB DEFAULT '{}'::jsonb,
    eta_days INTEGER,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Events pour observabilité
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    ts TIMESTAMP DEFAULT NOW(),
    actor VARCHAR(100),
    type VARCHAR(50),
    payload JSONB DEFAULT '{}'::jsonb
);

-- A/B experiments
CREATE TABLE IF NOT EXISTS experiments (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE,
    variant VARCHAR(50),
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vérifications badges
CREATE TABLE IF NOT EXISTS verifications (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES providers(id),
    type VARCHAR(50), -- 'kbis', 'rge', 'insurance'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    expires_at TIMESTAMP,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seeds taxonomie de base
INSERT INTO taxonomies (label, parent_id, synonyms) VALUES
('Développement web', NULL, '["web", "site internet", "application web"]'::jsonb),
('Design graphique', NULL, '["graphisme", "logo", "identité visuelle"]'::jsonb),
('Marketing digital', NULL, '["publicité", "seo", "réseaux sociaux"]'::jsonb),
('Rédaction', NULL, '["contenu", "copywriting", "articles"]'::jsonb),
('E-commerce', NULL, '["boutique en ligne", "vente", "prestashop"]'::jsonb)
ON CONFLICT DO NOTHING;
