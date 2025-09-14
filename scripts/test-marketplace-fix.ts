
import { db } from '../server/database.js';
import { missions } from '../shared/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { mapMission } from '../server/dto/mission-dto.js';

async function testMarketplaceFix() {
  console.log('🧪 Test de la correction du marketplace');
  console.log('=====================================');

  try {
    // 1. Test de la structure de la base de données
    console.log('\n1. 📋 Test de la structure de la base...');
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'missions' 
      ORDER BY ordinal_position
    `);
    console.log(`✅ Table missions a ${tableInfo.length} colonnes`);

    // 2. Test de récupération des missions
    console.log('\n2. 🔍 Test de récupération des missions...');
    const rawMissions = await db
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        excerpt: missions.excerpt,
        category: missions.category,
        budget_value_cents: missions.budget_value_cents,
        currency: missions.currency,
        location_raw: missions.location_raw,
        postal_code: missions.postal_code,
        city: missions.city,
        country: missions.country,
        remote_allowed: missions.remote_allowed,
        user_id: missions.user_id,
        client_id: missions.client_id,
        status: missions.status,
        urgency: missions.urgency,
        deadline: missions.deadline,
        tags: missions.tags,
        skills_required: missions.skills_required,
        requirements: missions.requirements,
        is_team_mission: missions.is_team_mission,
        team_size: missions.team_size,
        created_at: missions.created_at,
        updated_at: missions.updated_at
      })
      .from(missions)
      .where(sql`${missions.status} IN ('open', 'published', 'active')`)
      .orderBy(desc(missions.created_at))
      .limit(10);

    console.log(`✅ ${rawMissions.length} missions récupérées`);

    // 3. Test du DTO mapper
    console.log('\n3. 🔄 Test du DTO mapper...');
    const mappedMissions = rawMissions.map(mission => mapMission(mission));
    console.log(`✅ ${mappedMissions.length} missions mappées avec succès`);

    // 4. Vérification des champs essentiels
    console.log('\n4. ✓ Vérification des champs essentiels...');
    let validMissions = 0;
    mappedMissions.forEach(mission => {
      if (mission.id && mission.title && mission.description) {
        validMissions++;
      }
    });
    console.log(`✅ ${validMissions}/${mappedMissions.length} missions valides`);

    // 5. Test de l'endpoint API
    console.log('\n5. 🌐 Test de l\'endpoint API...');
    try {
      const response = await fetch('http://localhost:5000/api/missions');
      if (response.ok) {
        const apiMissions = await response.json();
        console.log(`✅ API répond correctement avec ${apiMissions.length} missions`);
      } else {
        console.log(`❌ API erreur: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.log(`❌ Erreur réseau API: ${(apiError as Error).message}`);
    }

    // 6. Exemple de mission transformée
    if (mappedMissions.length > 0) {
      console.log('\n6. 📄 Exemple de mission transformée:');
      const example = mappedMissions[0];
      console.log({
        id: example.id,
        title: example.title,
        excerpt: example.excerpt?.substring(0, 50) + '...',
        budget: example.budget,
        location: example.location,
        status: example.status,
        createdAt: example.createdAt
      });
    }

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur pendant le test:', error);
    console.error('Stack:', (error as Error).stack);
  }
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testMarketplaceFix()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

export { testMarketplaceFix };
