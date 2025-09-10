
import { db } from '../server/database.js';
import { missions, bids, users } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

async function verifyDatabase() {
  console.log('🔍 Vérification de la base de données...');

  try {
    // 1. Vérifier la structure des missions
    console.log('\n📋 1. Test de la table missions:');
    const testMissions = await db.select().from(missions).limit(5);
    console.log('✅ Structure missions OK, échantillon:', testMissions.length, 'records');
    
    if (testMissions.length > 0) {
      const sample = testMissions[0];
      console.log('📝 Colonnes disponibles:', Object.keys(sample));
    }

    // 2. Vérifier les relations avec users
    console.log('\n👥 2. Test des relations users:');
    const missionsWithUsers = await db
      .select({
        missionId: missions.id,
        missionTitle: missions.title,
        userId: missions.user_id,
        userName: users.name
      })
      .from(missions)
      .leftJoin(users, eq(missions.user_id, users.id))
      .limit(3);
    
    console.log('✅ Relations missions-users OK:', missionsWithUsers.length);
    missionsWithUsers.forEach(item => {
      console.log(`   Mission ${item.missionId}: "${item.missionTitle}" -> User ${item.userId}: ${item.userName}`);
    });

    // 3. Vérifier les bids
    console.log('\n💰 3. Test de la table bids:');
    const testBids = await db.select().from(bids).limit(5);
    console.log('✅ Structure bids OK, échantillon:', testBids.length, 'records');

    // 4. Test des requêtes principales
    console.log('\n🔍 4. Test des requêtes API principales:');
    
    // Test GET /api/missions
    const allMissions = await db
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        category: missions.category,
        budget: missions.budget,
        currency: missions.currency,
        location: missions.location,
        user_id: missions.user_id,
        status: missions.status,
        created_at: missions.created_at,
        updated_at: missions.updated_at
      })
      .from(missions)
      .orderBy(desc(missions.created_at))
      .limit(10);
    
    console.log('✅ GET /api/missions simulation OK:', allMissions.length, 'missions');

    // Test GET /api/missions/:id avec bids
    if (allMissions.length > 0) {
      const firstMission = allMissions[0];
      const missionBids = await db
        .select()
        .from(bids)
        .where(eq(bids.mission_id, firstMission.id));
      
      console.log(`✅ GET /api/missions/${firstMission.id} simulation OK:`, missionBids.length, 'bids');
    }

    // Test GET /api/users/:userId/missions
    const uniqueUsers = [...new Set(allMissions.map(m => m.user_id).filter(Boolean))];
    if (uniqueUsers.length > 0) {
      const userId = uniqueUsers[0];
      const userMissions = await db
        .select()
        .from(missions)
        .where(eq(missions.user_id, userId!));
      
      console.log(`✅ GET /api/users/${userId}/missions simulation OK:`, userMissions.length, 'missions');
    }

    // 5. Statistiques globales
    console.log('\n📊 5. Statistiques globales:');
    const stats = {
      totalMissions: await db.select().from(missions).then(r => r.length),
      totalBids: await db.select().from(bids).then(r => r.length),
      totalUsers: await db.select().from(users).then(r => r.length),
      publishedMissions: await db.select().from(missions).where(eq(missions.status, 'published')).then(r => r.length)
    };
    
    console.log('📈 Stats:', stats);

    console.log('\n✅ Vérification terminée avec succès!');
    console.log('🎯 La base de données est maintenant harmonisée et compatible avec l\'API missions.');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    console.error('📝 Détails:', error.message);
    process.exit(1);
  }
}

// Exécuter la vérification
verifyDatabase().then(() => {
  console.log('\n🏁 Vérification complète!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Échec de la vérification:', error);
  process.exit(1);
});
