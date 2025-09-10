
-- Migration 007: Create bids table
-- Date: 2025-01-10

CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  provider_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  message TEXT,
  delivery_days INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_bids_mission_id ON bids(mission_id);
CREATE INDEX IF NOT EXISTS idx_bids_provider_id ON bids(provider_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_bids_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_bids_updated_at();

COMMENT ON TABLE bids IS 'Table des offres/propositions pour les missions';
