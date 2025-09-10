
#!/usr/bin/env tsx

import { db } from '../server/database.js';
import { missions } from '../shared/schema.js';

async function main() {
  console.log('🔍 Environment Verification');
  console.log('============================');

  // 1. Variables d'environnement
  console.log('\n📋 Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'missing');
  console.log('PORT:', process.env.PORT || 'default');

  // 2. Connexion base de données
  console.log('\n🗄️  Database Connection:');
  try {
    const testQuery = await db.select({ id: missions.id }).from(missions).limit(1);
    console.log('✅ Database connection successful');
    console.log(`📊 Sample query returned ${testQuery.length} result(s)`);
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
  }

  // 3. Structure de table
  console.log('\n📋 Table Structure Check:');
  try {
    const columns = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'missions' 
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Missions table exists with columns:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
  } catch (error) {
    console.log('❌ Table structure check failed:', error.message);
  }

  // 4. Index existants
  console.log('\n📊 Database Indexes:');
  try {
    const indexes = await db.execute(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename = 'missions'
    `);
    
    if (indexes.rows.length > 0) {
      console.log('✅ Found indexes:');
      indexes.rows.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
    } else {
      console.log('⚠️ No indexes found on missions table');
    }
  } catch (error) {
    console.log('❌ Index check failed:', error.message);
  }

  console.log('\n✅ Environment verification complete');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('🚨 Environment verification failed:', error);
    process.exit(1);
  });
}
