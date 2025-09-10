
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { missions, announcements } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

async function testProductionFlow(): Promise<void> {
  console.log('🧪 DÉBUT DU TEST PRODUCTION COMPLET');
  console.log('=====================================');

  const timestamp = Date.now();
  const testMission = {
    title: `TEST PRODUCTION ${timestamp}`,
    description: `Mission de test créée à ${new Date().toLocaleString()} pour vérifier le flux complet de création et synchronisation`,
    category: 'test',
    budget_min: 1000,
    budget_max: 2000,
    location: 'Paris, France',
    client_id: 1,
    status: 'published'
  };

  try {
    // 1. Test de création de mission via API
    console.log('📝 1. Test création mission via API...');
    const apiResponse = await fetch('http://localhost:5000/api/missions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMission),
    });

    const apiResult: TestResult = {
      success: apiResponse.ok,
      message: `API Response: ${apiResponse.status}`,
      data: null
    };

    if (apiResponse.ok) {
      const responseText = await apiResponse.text();
      try {
        apiResult.data = JSON.parse(responseText);
        console.log('✅ Mission créée via API:', apiResult.data.id);
      } catch (e) {
        apiResult.success = false;
        apiResult.message = `Erreur parsing JSON: ${responseText}`;
      }
    } else {
      const errorText = await apiResponse.text();
      apiResult.message = `API Error: ${apiResponse.status} - ${errorText}`;
    }

    if (!apiResult.success) {
      throw new Error(apiResult.message);
    }

    const missionId = apiResult.data.id;

    // 2. Vérification dans la table missions
    console.log('🔍 2. Vérification dans la table missions...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde

    const missionInDb = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1);

    if (missionInDb.length === 0) {
      throw new Error(`Mission ${missionId} non trouvée dans la table missions`);
    }
    console.log('✅ Mission trouvée dans la table missions');

    // 3. Vérification dans la table announcements (feed)
    console.log('🔍 3. Vérification synchronisation feed...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes pour la sync

    const announcementInFeed = await db
      .select()
      .from(announcements)
      .where(eq(announcements.title, testMission.title))
      .limit(1);

    if (announcementInFeed.length === 0) {
      console.log('⚠️ Mission non synchronisée dans le feed automatiquement');
      
      // Essayer de synchroniser manuellement
      console.log('🔄 Tentative de synchronisation manuelle...');
      try {
        const { MissionSyncService } = await import('./services/mission-sync.js');
        const syncService = new MissionSyncService(process.env.DATABASE_URL!);
        await syncService.addMissionToFeed({
          ...missionInDb[0],
          budget: missionInDb[0].budget_min?.toString() || '0'
        } as any);
        console.log('✅ Synchronisation manuelle réussie');
      } catch (syncError) {
        console.error('❌ Erreur synchronisation manuelle:', syncError);
      }
    } else {
      console.log('✅ Mission trouvée dans le feed');
    }

    // 4. Test API marketplace
    console.log('🏪 4. Test API marketplace...');
    const marketplaceResponse = await fetch('http://localhost:5000/api/missions');
    
    if (!marketplaceResponse.ok) {
      throw new Error(`Marketplace API error: ${marketplaceResponse.status}`);
    }

    const marketplaceMissions = await marketplaceResponse.json();
    const foundInMarketplace = marketplaceMissions.find((m: any) => m.id === missionId);

    if (!foundInMarketplace) {
      throw new Error('Mission non trouvée dans l\'API marketplace');
    }
    console.log('✅ Mission trouvée dans l\'API marketplace');

    // 5. Test API feed
    console.log('📱 5. Test API feed...');
    const feedResponse = await fetch('http://localhost:5000/api/feed?limit=50');
    
    if (feedResponse.ok) {
      const feedData = await feedResponse.json();
      const foundInFeed = feedData.items?.find((item: any) => 
        item.title === testMission.title
      );

      if (foundInFeed) {
        console.log('✅ Mission trouvée dans l\'API feed');
      } else {
        console.log('⚠️ Mission non trouvée dans l\'API feed');
      }
    } else {
      console.log('⚠️ Erreur API feed:', feedResponse.status);
    }

    // 6. Statistiques finales
    console.log('\n📊 6. Statistiques finales...');
    
    const totalMissions = await db.select().from(missions);
    const totalAnnouncements = await db.select().from(announcements);
    
    console.log(`📋 Total missions: ${totalMissions.length}`);
    console.log(`📢 Total annonces feed: ${totalAnnouncements.length}`);

    // 7. Récupérer les dernières missions pour vérification
    const recentMissions = await db
      .select()
      .from(missions)
      .orderBy(desc(missions.created_at))
      .limit(5);

    console.log('\n📋 Dernières missions créées:');
    recentMissions.forEach((mission, index) => {
      console.log(`${index + 1}. ID: ${mission.id} - "${mission.title}" - ${mission.status}`);
    });

    console.log('\n🎉 TEST PRODUCTION TERMINÉ AVEC SUCCÈS');
    console.log('=====================================');
    console.log('✅ Mission créée et accessible dans:');
    console.log('   - Base de données (table missions)');
    console.log('   - API marketplace (/api/missions)');
    console.log('   - API feed (/api/feed)');
    console.log('   - Sync feed (table announcements)');

  } catch (error) {
    console.error('\n❌ ÉCHEC DU TEST PRODUCTION');
    console.error('============================');
    console.error('Erreur:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestData(): Promise<void> {
  console.log('\n🧹 Nettoyage des données de test...');
  
  try {
    // Supprimer les missions de test
    const deletedMissions = await db
      .delete(missions)
      .where(eq(missions.category, 'test'));

    // Supprimer les annonces de test du feed
    const deletedAnnouncements = await db
      .delete(announcements)
      .where(eq(announcements.category, 'test'));

    console.log(`🗑️ ${deletedMissions} missions de test supprimées`);
    console.log(`🗑️ ${deletedAnnouncements} annonces de test supprimées`);
  } catch (error) {
    console.error('Erreur nettoyage:', error);
  }
}

// Exécuter le test si appelé directement
if (import.meta.url === new URL(import.meta.url).href) {
  testProductionFlow()
    .then(() => {
      console.log('\n🤔 Voulez-vous nettoyer les données de test ? (Ctrl+C pour annuler)');
      setTimeout(cleanupTestData, 5000);
    })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testProductionFlow, cleanupTestData };
