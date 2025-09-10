
import { db } from '../server/database.js';

async function verifyDatabaseSchema(): Promise<void> {
  console.log('🔍 VÉRIFICATION DU SCHÉMA DE BASE DE DONNÉES');
  console.log('===========================================\n');

  try {
    // Vérifier les colonnes de la table missions
    console.log('📋 Vérification table missions...');
    const missionsColumns = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'missions' 
      ORDER BY ordinal_position
    `);

    console.log('✅ Colonnes missions:', missionsColumns.rows.length);
    missionsColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Vérifier les colonnes de la table announcements
    console.log('\n📢 Vérification table announcements...');
    const announcementsColumns = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'announcements' 
      ORDER BY ordinal_position
    `);

    console.log('✅ Colonnes announcements:', announcementsColumns.rows.length);
    announcementsColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Vérifier les colonnes de la table bids
    console.log('\n💰 Vérification table bids...');
    const bidsColumns = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bids' 
      ORDER BY ordinal_position
    `);

    console.log('✅ Colonnes bids:', bidsColumns.rows.length);
    bidsColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Test de création simple
    console.log('\n🧪 Test création mission...');
    const testMission = {
      title: 'Test Schema Verification',
      description: 'Mission de test pour vérifier que toutes les colonnes fonctionnent correctement',
      category: 'test',
      status: 'published',
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    const { missions } = await import('../shared/schema.js');
    const result = await db.insert(missions).values(testMission).returning();
    
    if (result.length > 0) {
      console.log('✅ Création mission test réussie, ID:', result[0].id);
      
      // Supprimer la mission test
      await db.delete(missions).where({ id: result[0].id } as any);
      console.log('✅ Mission test supprimée');
    }

    console.log('\n🎉 Vérification du schéma terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du schéma:', error);
    throw error;
  }
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyDatabaseSchema()
    .then(() => {
      console.log('✅ Vérification terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}
