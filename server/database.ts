import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Get database URL from environment
const isPreviewMode = process.env.PREVIEW_MODE === 'true' || process.env.NODE_ENV === 'production';
const databaseUrl = isPreviewMode 
  ? (process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING)
  : (process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING || 'postgresql://localhost:5432/swideal');

// Create connection pool
const pool = new Pool({ 
  connectionString: databaseUrl 
});

// Create drizzle database instance
export const db = drizzle(pool);

// Log database configuration
console.log('🔗 Database connection established:', {
  databaseUrl: databaseUrl ? '***configured***' : 'missing',
  isCloudSQL: databaseUrl?.includes('/cloudsql/') || false
});