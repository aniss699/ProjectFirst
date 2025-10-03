import { pool } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateAnnouncementsTable() {
  console.log('🔧 Migration de la table announcements...');
  
  try {
    // Lire le fichier SQL de migration
    const sqlPath = path.join(__dirname, '../scripts/002_announcements_upsert.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('📄 Exécution du script SQL...');
    
    // Exécuter le script SQL
    await pool.query(sql);
    
    console.log('✅ Migration réussie !');
    console.log('✅ Table announcements créée/mise à jour');
    console.log('✅ Fonction upsert_announcement créée');
    console.log('✅ Triggers créés');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de migration:', error);
    process.exit(1);
  }
}

migrateAnnouncementsTable();
