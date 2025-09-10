import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Get database URL from environment
const isPreviewMode = process.env.PREVIEW_MODE === 'true' || process.env.NODE_ENV === 'production';
const databaseUrl = isPreviewMode 
  ? (process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING)
  : (process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING || 'postgresql://localhost:5432/swideal');

// Create connection pool with error handling
const pool = new Pool({ 
  connectionString: databaseUrl 
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

pool.on('connect', () => {
  console.log('✅ Database connection established');
});

// Create drizzle database instance
export const db = drizzle(pool);

// Test database connection function
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful');
    client.release();
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
}

// Log database configuration
console.log('🔗 Database connection established:', {
  databaseUrl: databaseUrl ? '***configured***' : 'missing',
  isCloudSQL: databaseUrl?.includes('/cloudsql/') || false
});