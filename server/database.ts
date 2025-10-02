
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../shared/schema.js';
import { users, missions, bids, announcements } from '../shared/schema.js';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/swideal';

// Create connection pool with error handling
const pool = new Pool({ 
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 20
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', {
    message: err.message,
    code: (err as any).code,
    timestamp: new Date().toISOString()
  });
  
  // Ne pas logger le stack complet en production
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
});

pool.on('connect', () => {
  console.log('✅ Database connection established');
});

// Retry logic pour les connexions
pool.on('remove', () => {
  console.log('🔄 Database connection removed from pool');
});


// Create drizzle database instance with schema
export const db = drizzle(pool, { schema });


// Export initialization functions for explicit calling
export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        rating_mean DECIMAL(3, 2),
        rating_count INTEGER DEFAULT 0,
        profile_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        client_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        excerpt TEXT,
        category TEXT NOT NULL,
        location_data JSONB,
        budget_value_cents INTEGER NOT NULL,
        currency TEXT DEFAULT 'EUR',
        urgency TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'draft',
        quality_target TEXT DEFAULT 'standard',
        deadline TIMESTAMP,
        tags JSONB,
        skills_required JSONB,
        requirements TEXT,
        is_team_mission BOOLEAN DEFAULT false,
        team_size INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS open_teams (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        creator_id INTEGER REFERENCES users(id) NOT NULL,
        estimated_budget INTEGER,
        estimated_timeline_days INTEGER,
        members JSONB,
        required_roles JSONB,
        max_members INTEGER DEFAULT 5,
        status TEXT DEFAULT 'recruiting',
        visibility TEXT DEFAULT 'public',
        auto_accept BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) NOT NULL,
        provider_id INTEGER REFERENCES users(id) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        timeline_days INTEGER,
        message TEXT,
        score_breakdown JSONB,
        is_leading BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'pending',
        bid_type TEXT DEFAULT 'individual',
        team_composition JSONB,
        team_lead_id INTEGER REFERENCES users(id),
        open_team_id INTEGER REFERENCES open_teams(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        priority INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'active',
        category TEXT,
        budget INTEGER,
        location TEXT,
        user_id INTEGER REFERENCES users(id),
        sponsored BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS feed_feedback (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        feedback_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS feed_seen (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        seen_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_events (
        id TEXT PRIMARY KEY,
        phase TEXT NOT NULL,
        provider TEXT NOT NULL,
        model_family TEXT NOT NULL,
        model_name TEXT NOT NULL,
        allow_training BOOLEAN NOT NULL,
        input_redacted JSONB,
        output JSONB,
        confidence TEXT,
        tokens INTEGER,
        latency_ms INTEGER,
        provenance TEXT NOT NULL,
        prompt_hash TEXT,
        accepted BOOLEAN,
        rating INTEGER,
        edits JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful:', result.rows[0]);
  } catch (error) {
    console.error('❌ Database connection test failed:', {
      message: (error as Error).message,
      code: (error as any).code,
      detail: (error as any).detail
    });
  }
}

// Log database configuration
console.log('🔗 Database connection established:', {
  databaseUrl: databaseUrl ? '***configured***' : 'missing',
  isCloudSQL: databaseUrl?.includes('/cloudsql/') || false
});

export { pool };
