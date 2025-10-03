import { pool } from './database.js';

async function migrateAnnouncementsTable() {
  console.log('🔧 Migration de la table announcements...');
  
  try {
    // 1. Supprimer l'ancienne table si elle existe
    console.log('📄 Suppression de l\'ancienne table...');
    await pool.query('DROP TABLE IF EXISTS announcements CASCADE');
    
    // 2. Créer la nouvelle table avec la bonne structure
    console.log('📄 Création de la nouvelle table announcements...');
    await pool.query(`
      CREATE TABLE announcements (
        id INTEGER PRIMARY KEY,
        
        -- Contenu principal
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        
        -- Catégorisation pour le feed
        category TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        
        -- Budget pour affichage (format display)
        budget_display TEXT NOT NULL,
        budget_value_cents INTEGER,
        currency TEXT DEFAULT 'EUR',
        
        -- Localisation simplifiée
        location_display TEXT,
        city TEXT,
        country TEXT,
        
        -- Métadonnées feed
        client_id INTEGER NOT NULL,
        client_display_name TEXT NOT NULL,
        
        -- Stats engagements
        bids_count INTEGER DEFAULT 0,
        lowest_bid_cents INTEGER,
        views_count INTEGER DEFAULT 0,
        saves_count INTEGER DEFAULT 0,
        
        -- Scoring pour algorithme feed
        quality_score DECIMAL(3,2) DEFAULT 0.0,
        engagement_score DECIMAL(5,2) DEFAULT 0.0,
        freshness_score DECIMAL(3,2) DEFAULT 1.0,
        
        -- Status et timing
        status TEXT NOT NULL DEFAULT 'active',
        urgency TEXT DEFAULT 'medium',
        deadline TIMESTAMPTZ,
        
        -- Metadata pour feed
        is_sponsored BOOLEAN DEFAULT false,
        boost_score DECIMAL(3,2) DEFAULT 0.0,
        
        -- Recherche optimisée
        search_text TEXT NOT NULL,
        search_vector TSVECTOR,
        
        -- Audit
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        synced_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // 3. Créer les index
    console.log('📄 Création des index...');
    await pool.query(`
      CREATE INDEX idx_announcements_feed_ranking 
        ON announcements(status, quality_score DESC, freshness_score DESC, created_at DESC)
    `);
    
    await pool.query(`
      CREATE INDEX idx_announcements_search 
        ON announcements USING GIN(search_vector)
    `);
    
    await pool.query(`
      CREATE INDEX idx_announcements_category_active 
        ON announcements(category, status) WHERE status = 'active'
    `);
    
    await pool.query(`
      CREATE INDEX idx_announcements_budget_range 
        ON announcements(budget_value_cents, currency) WHERE status = 'active'
    `);
    
    // 4. Créer la fonction upsert
    console.log('📄 Création de la fonction upsert_announcement...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION upsert_announcement(
        p_mission_id INTEGER,
        p_title TEXT,
        p_description TEXT,
        p_excerpt TEXT,
        p_category TEXT,
        p_tags TEXT[],
        p_budget_display TEXT,
        p_budget_value_cents INTEGER,
        p_currency TEXT,
        p_location_display TEXT,
        p_city TEXT,
        p_country TEXT,
        p_client_id INTEGER,
        p_client_display_name TEXT,
        p_status TEXT DEFAULT 'active',
        p_urgency TEXT DEFAULT 'medium',
        p_deadline TIMESTAMPTZ DEFAULT NULL,
        p_quality_score DECIMAL DEFAULT 0.0
      ) RETURNS INTEGER AS $$
      DECLARE
        search_text_computed TEXT;
        announcement_id INTEGER;
      BEGIN
        -- Construire le texte de recherche
        search_text_computed := concat_ws(' ',
          p_title,
          p_description,
          p_category,
          array_to_string(p_tags, ' '),
          p_location_display
        );

        -- Upsert avec gestion des conflits
        INSERT INTO announcements (
          id, title, description, excerpt, category, tags,
          budget_display, budget_value_cents, currency,
          location_display, city, country,
          client_id, client_display_name,
          status, urgency, deadline, quality_score,
          search_text, search_vector,
          created_at, updated_at, synced_at
        ) VALUES (
          p_mission_id, p_title, p_description, p_excerpt, p_category, p_tags,
          p_budget_display, p_budget_value_cents, p_currency,
          p_location_display, p_city, p_country,
          p_client_id, p_client_display_name,
          p_status, p_urgency, p_deadline, p_quality_score,
          search_text_computed, to_tsvector('french', search_text_computed),
          NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          excerpt = EXCLUDED.excerpt,
          category = EXCLUDED.category,
          tags = EXCLUDED.tags,
          budget_display = EXCLUDED.budget_display,
          budget_value_cents = EXCLUDED.budget_value_cents,
          currency = EXCLUDED.currency,
          location_display = EXCLUDED.location_display,
          city = EXCLUDED.city,
          country = EXCLUDED.country,
          client_display_name = EXCLUDED.client_display_name,
          status = EXCLUDED.status,
          urgency = EXCLUDED.urgency,
          deadline = EXCLUDED.deadline,
          quality_score = EXCLUDED.quality_score,
          search_text = EXCLUDED.search_text,
          search_vector = EXCLUDED.search_vector,
          updated_at = NOW(),
          synced_at = NOW()
        RETURNING id INTO announcement_id;

        RETURN announcement_id;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    // 5. Créer la fonction de mise à jour des stats
    console.log('📄 Création de la fonction update_announcement_stats...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_announcement_stats(
        p_announcement_id INTEGER,
        p_bids_count INTEGER DEFAULT NULL,
        p_lowest_bid_cents INTEGER DEFAULT NULL,
        p_views_count INTEGER DEFAULT NULL,
        p_saves_count INTEGER DEFAULT NULL
      ) RETURNS VOID AS $$
      BEGIN
        UPDATE announcements SET
          bids_count = COALESCE(p_bids_count, bids_count),
          lowest_bid_cents = COALESCE(p_lowest_bid_cents, lowest_bid_cents),
          views_count = COALESCE(p_views_count, views_count),
          saves_count = COALESCE(p_saves_count, saves_count),
          engagement_score = (
            COALESCE(p_bids_count, bids_count) * 10.0 +
            COALESCE(p_views_count, views_count) * 0.1 +
            COALESCE(p_saves_count, saves_count) * 2.0
          ),
          updated_at = NOW()
        WHERE id = p_announcement_id;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    // 6. Créer le trigger pour freshness_score
    console.log('📄 Création du trigger freshness...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION calculate_freshness_score()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.freshness_score = GREATEST(0.1, 
          1.0 - (EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 86400.0 / 30.0)
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS announcements_freshness_trigger ON announcements
    `);
    
    await pool.query(`
      CREATE TRIGGER announcements_freshness_trigger
        BEFORE INSERT OR UPDATE ON announcements
        FOR EACH ROW
        EXECUTE FUNCTION calculate_freshness_score()
    `);
    
    // 7. Recréer les tables dépendantes
    console.log('📄 Recréation des tables feed_feedback, feed_seen, favorites...');
    
    await pool.query('DROP TABLE IF EXISTS feed_feedback CASCADE');
    await pool.query(`
      CREATE TABLE feed_feedback (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        feedback_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query('DROP TABLE IF EXISTS feed_seen CASCADE');
    await pool.query(`
      CREATE TABLE feed_seen (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        seen_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query('DROP TABLE IF EXISTS favorites CASCADE');
    await pool.query(`
      CREATE TABLE favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Migration réussie !');
    console.log('✅ Table announcements créée/mise à jour');
    console.log('✅ Fonction upsert_announcement créée');
    console.log('✅ Triggers créés');
    console.log('✅ Tables dépendantes recréées');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de migration:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateAnnouncementsTable();
