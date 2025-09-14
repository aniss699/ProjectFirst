
import { db } from '../server/database';
import { missions, users } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

async function debugMarketplaceLoading() {
  console.log('🔍 DIAGNOSTIC CHARGEMENT MARKETPLACE');
  console.log('=====================================');

  try {
    // 1. Test de connexion base de données
    console.log('\n1. Test connexion base de données...');
    const dbTest = await db.execute(sql`SELECT NOW() as current_time`);
    console.log(`✅ Base connectée: ${dbTest[0]?.current_time}`);

    // 2. Vérifier la structure de la table missions
    console.log('\n2. Structure table missions...');
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'missions' 
      ORDER BY ordinal_position
    `);
    console.log('Colonnes disponibles:', tableInfo.map(col => `${col.column_name} (${col.data_type})`));

    // 3. Compter les missions
    console.log('\n3. Comptage des missions...');
    const missionCount = await db.execute(sql`SELECT COUNT(*) as total FROM missions`);
    console.log(`Total missions: ${missionCount[0]?.total}`);

    // 4. Tester quelques missions
    console.log('\n4. Test récupération missions...');
    const sampleMissions = await db.execute(sql`
      SELECT id, title, excerpt, category, budget_value_cents, status, created_at 
      FROM missions 
      WHERE status = 'published' 
      LIMIT 5
    `);
    console.log('Missions échantillon:', sampleMissions.map(m => ({
      id: m.id,
      title: m.title?.substring(0, 30) + '...',
      excerpt: m.excerpt ? 'OK' : 'MISSING',
      budget: m.budget_value_cents,
      status: m.status
    })));

    // 5. Test API endpoint
    console.log('\n5. Test endpoint API missions...');
    try {
      const apiResponse = await fetch('http://localhost:5000/api/missions?limit=3');
      if (apiResponse.ok) {
        const missions = await apiResponse.json();
        console.log(`✅ API répond: ${missions.length || 0} missions récupérées`);
      } else {
        console.log(`❌ API erreur: ${apiResponse.status} ${apiResponse.statusText}`);
      }
    } catch (apiError) {
      console.log(`❌ Erreur API: ${apiError.message}`);
    }

    // 6. Vérifier les missions sans excerpt
    console.log('\n6. Missions sans excerpt...');
    const noExcerpt = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM missions 
      WHERE excerpt IS NULL OR excerpt = ''
    `);
    console.log(`Missions sans excerpt: ${noExcerpt[0]?.count}`);

    if (Number(noExcerpt[0]?.count) > 0) {
      console.log('🔧 Correction des excerpts manquants...');
      await db.execute(sql`
        UPDATE missions 
        SET excerpt = CASE 
          WHEN LENGTH(description) <= 200 THEN description
          WHEN POSITION('.' IN SUBSTRING(description, 1, 200)) > 120 THEN 
            SUBSTRING(description, 1, POSITION('.' IN SUBSTRING(description, 1, 200))) 
          ELSE 
            SUBSTRING(description, 1, 200) || '...'
        END
        WHERE excerpt IS NULL OR excerpt = ''
      `);
      console.log('✅ Excerpts corrigés');
    }

    console.log('\n✅ DIAGNOSTIC TERMINÉ');

  } catch (error) {
    console.error('❌ Erreur during diagnostic:', error);
    console.error('Stack:', error.stack);
  }
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  debugMarketplaceLoading()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur:', error);
      process.exit(1);
    });
}

export { debugMarketplaceLoading };
