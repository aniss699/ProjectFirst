
import { eq, desc } from 'drizzle-orm';
import { db } from '../server/database.js';
import { missions, announcements, bids } from '../shared/schema.js';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  duration: number;
}

export class DataConsistencyTester {
  private results: TestResult[] = [];

  async runCompleteTest(): Promise<void> {
    console.log('🔍 DÉMARRAGE DU TEST DE COHÉRENCE DES DONNÉES');
    console.log('================================================\n');

    await this.testMissionCreationFlow();
    await this.testDatabaseToAPIConsistency();
    await this.testCrossTableReferences();
    await this.testFeedSynchronization();
    await this.testUserMissionsConsistency();

    this.printResults();
  }

  private async testMissionCreationFlow(): Promise<void> {
    console.log('📝 1. Test du flux de création de mission...');
    const stepStart = Date.now();

    try {
      // Créer une mission de test via l'API
      const testMissionData = {
        title: 'Mission Test Cohérence',
        description: 'Test de cohérence des données lors de la création de mission avec une description suffisamment longue pour valider tous les champs.',
        category: 'developpement',
        budget: 250000, // 2500€ en centimes
        budget_min: 200000,
        budget_max: 300000,
        currency: 'EUR',
        location: 'Paris, France',
        city: 'Paris',
        country: 'France',
        urgency: 'medium',
        status: 'published',
        userId: 1,
        tags: ['test', 'coherence'],
        skills_required: ['TypeScript', 'Node.js'],
        remote_allowed: true,
        is_team_mission: false,
        team_size: 1
      };

      console.log('📤 Création mission via API...');
      const apiResponse = await fetch('http://localhost:5000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMissionData)
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`API Error: ${apiResponse.status} - ${errorText}`);
      }

      const createdMission = await apiResponse.json();
      console.log('✅ Mission créée:', createdMission.id);

      // Vérifier dans la base de données
      await new Promise(resolve => setTimeout(resolve, 500)); // Attendre la propagation

      const missionInDb = await db
        .select()
        .from(missions)
        .where(eq(missions.id, createdMission.id))
        .limit(1);

      if (missionInDb.length === 0) {
        throw new Error('Mission non trouvée en base après création');
      }

      const dbMission = missionInDb[0];

      // Vérifier la cohérence des données
      const inconsistencies = [];

      // Vérifier les champs texte
      if (dbMission.title !== testMissionData.title) {
        inconsistencies.push(`Titre: API="${testMissionData.title}" vs DB="${dbMission.title}"`);
      }

      if (dbMission.description !== testMissionData.description) {
        inconsistencies.push(`Description: longueurs différentes`);
      }

      // Vérifier les champs numériques (budget)
      if (dbMission.budget_value_cents !== testMissionData.budget) {
        inconsistencies.push(`Budget: API="${testMissionData.budget}" vs DB="${dbMission.budget_value_cents}"`);
      }

      // Vérifier les relations
      if (dbMission.user_id !== testMissionData.userId) {
        inconsistencies.push(`User ID: API="${testMissionData.userId}" vs DB="${dbMission.user_id}"`);
      }

      if (dbMission.client_id !== testMissionData.userId) {
        inconsistencies.push(`Client ID devrait égaler User ID`);
      }

      // Vérifier les arrays
      if (JSON.stringify(dbMission.tags?.sort()) !== JSON.stringify(testMissionData.tags.sort())) {
        inconsistencies.push(`Tags: API="${testMissionData.tags}" vs DB="${dbMission.tags}"`);
      }

      if (inconsistencies.length > 0) {
        this.addResult(
          'MISSION_CREATION_FLOW',
          false,
          `Incohérences détectées: ${inconsistencies.join('; ')}`,
          { inconsistencies, missionId: createdMission.id },
          Date.now() - stepStart
        );
      } else {
        this.addResult(
          'MISSION_CREATION_FLOW',
          true,
          'Données cohérentes entre API et DB',
          { missionId: createdMission.id },
          Date.now() - stepStart
        );
      }

      // Nettoyer la mission de test
      await db.delete(missions).where(eq(missions.id, createdMission.id));

    } catch (error) {
      this.addResult('MISSION_CREATION_FLOW', false, `Erreur: ${error.message}`);
    }
  }

  private async testDatabaseToAPIConsistency(): Promise<void> {
    console.log('\n🔄 2. Test cohérence DB vers API...');
    const stepStart = Date.now();

    try {
      // Récupérer quelques missions en base
      const missionsInDb = await db
        .select()
        .from(missions)
        .limit(3);

      if (missionsInDb.length === 0) {
        throw new Error('Aucune mission en base pour tester');
      }

      // Récupérer les mêmes missions via API
      const apiResponse = await fetch('http://localhost:5000/api/missions');
      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }

      const missionsFromApi = await apiResponse.json();
      const inconsistencies = [];

      for (const dbMission of missionsInDb) {
        const apiMission = missionsFromApi.find((m: any) => m.id === dbMission.id);
        
        if (!apiMission) {
          inconsistencies.push(`Mission ${dbMission.id} présente en DB mais pas dans l'API`);
          continue;
        }

        // Vérifier les champs critiques
        if (dbMission.title !== apiMission.title) {
          inconsistencies.push(`Mission ${dbMission.id}: titre différent`);
        }

        if (dbMission.status !== apiMission.status) {
          inconsistencies.push(`Mission ${dbMission.id}: statut différent`);
        }

        if (dbMission.budget_value_cents?.toString() !== apiMission.budget_value_cents?.toString()) {
          inconsistencies.push(`Mission ${dbMission.id}: budget différent (${dbMission.budget_value_cents} vs ${apiMission.budget_value_cents})`);
        }

        // Vérifier que les relations sont cohérentes
        if (dbMission.user_id !== apiMission.user_id) {
          inconsistencies.push(`Mission ${dbMission.id}: user_id différent`);
        }
      }

      if (inconsistencies.length > 0) {
        this.addResult(
          'DB_TO_API_CONSISTENCY',
          false,
          `${inconsistencies.length} incohérences trouvées`,
          { inconsistencies: inconsistencies.slice(0, 5) },
          Date.now() - stepStart
        );
      } else {
        this.addResult(
          'DB_TO_API_CONSISTENCY',
          true,
          `${missionsInDb.length} missions cohérentes entre DB et API`,
          {},
          Date.now() - stepStart
        );
      }

    } catch (error) {
      this.addResult('DB_TO_API_CONSISTENCY', false, `Erreur: ${error.message}`);
    }
  }

  private async testCrossTableReferences(): Promise<void> {
    console.log('\n🔗 3. Test cohérence des références cross-tables...');
    const stepStart = Date.now();

    try {
      // Vérifier que les bids référencent des missions existantes
      const orphanBids = await db.execute(`
        SELECT b.id as bid_id, b.mission_id, b.provider_id
        FROM bids b
        LEFT JOIN missions m ON b.mission_id = m.id
        WHERE m.id IS NULL
        LIMIT 5
      `);

      // Vérifier que les missions référencent des users existants
      const orphanMissions = await db.execute(`
        SELECT m.id as mission_id, m.user_id, m.client_id
        FROM missions m
        LEFT JOIN users u1 ON m.user_id = u1.id
        LEFT JOIN users u2 ON m.client_id = u2.id
        WHERE u1.id IS NULL OR u2.id IS NULL
        LIMIT 5
      `);

      const issues = [];
      
      if (orphanBids.rows.length > 0) {
        issues.push(`${orphanBids.rows.length} bids orphelins (missions supprimées)`);
      }

      if (orphanMissions.rows.length > 0) {
        issues.push(`${orphanMissions.rows.length} missions avec références utilisateurs invalides`);
      }

      // Vérifier cohérence user_id vs client_id
      const inconsistentUserClient = await db.execute(`
        SELECT id, user_id, client_id
        FROM missions
        WHERE user_id != client_id
        LIMIT 5
      `);

      if (inconsistentUserClient.rows.length > 0) {
        issues.push(`${inconsistentUserClient.rows.length} missions avec user_id != client_id`);
      }

      if (issues.length > 0) {
        this.addResult(
          'CROSS_TABLE_REFERENCES',
          false,
          `Problèmes de références: ${issues.join('; ')}`,
          { 
            orphanBids: orphanBids.rows.slice(0, 3),
            orphanMissions: orphanMissions.rows.slice(0, 3),
            inconsistentUserClient: inconsistentUserClient.rows.slice(0, 3)
          },
          Date.now() - stepStart
        );
      } else {
        this.addResult(
          'CROSS_TABLE_REFERENCES',
          true,
          'Références cross-tables cohérentes',
          {},
          Date.now() - stepStart
        );
      }

    } catch (error) {
      this.addResult('CROSS_TABLE_REFERENCES', false, `Erreur: ${error.message}`);
    }
  }

  private async testFeedSynchronization(): Promise<void> {
    console.log('\n📡 4. Test synchronisation avec le feed...');
    const stepStart = Date.now();

    try {
      // Récupérer missions publiques
      const publicMissions = await db
        .select({
          id: missions.id,
          title: missions.title,
          status: missions.status,
          created_at: missions.created_at
        })
        .from(missions)
        .where(eq(missions.status, 'published'))
        .limit(10);

      // Récupérer announcements correspondantes
      const feedAnnouncements = await db
        .select({
          id: announcements.id,
          title: announcements.title,
          status: announcements.status,
          created_at: announcements.created_at
        })
        .from(announcements)
        .limit(15);

      const syncIssues = [];

      for (const mission of publicMissions) {
        const announcement = feedAnnouncements.find(a => a.id === mission.id);
        
        if (!announcement) {
          syncIssues.push(`Mission publiée ${mission.id} manquante dans announcements`);
        } else {
          // Vérifier cohérence des données
          if (mission.title !== announcement.title) {
            syncIssues.push(`Mission ${mission.id}: titre différent dans announcements`);
          }
        }
      }

      // Vérifier les announcements orphelines
      for (const announcement of feedAnnouncements) {
        const mission = publicMissions.find(m => m.id === announcement.id);
        if (!mission) {
          // Vérifier si la mission existe mais n'est plus publique
          const missionExists = await db
            .select({ id: missions.id, status: missions.status })
            .from(missions)
            .where(eq(missions.id, announcement.id))
            .limit(1);

          if (missionExists.length === 0) {
            syncIssues.push(`Announcement ${announcement.id} référence une mission supprimée`);
          } else if (missionExists[0].status !== 'published') {
            syncIssues.push(`Announcement ${announcement.id} pour mission non-publique (${missionExists[0].status})`);
          }
        }
      }

      if (syncIssues.length > 0) {
        this.addResult(
          'FEED_SYNCHRONIZATION',
          false,
          `${syncIssues.length} problèmes de sync trouvés`,
          { issues: syncIssues.slice(0, 5) },
          Date.now() - stepStart
        );
      } else {
        this.addResult(
          'FEED_SYNCHRONIZATION',
          true,
          `Feed synchronisé: ${publicMissions.length} missions publiques`,
          { missionCount: publicMissions.length, announcementCount: feedAnnouncements.length },
          Date.now() - stepStart
        );
      }

    } catch (error) {
      this.addResult('FEED_SYNCHRONIZATION', false, `Erreur: ${error.message}`);
    }
  }

  private async testUserMissionsConsistency(): Promise<void> {
    console.log('\n👤 5. Test cohérence missions utilisateur...');
    const stepStart = Date.now();

    try {
      // Tester avec l'utilisateur 1
      const userId = 1;

      // Récupérer via l'endpoint spécialisé
      const userMissionsResponse = await fetch(`http://localhost:5000/api/missions/users/${userId}/missions`);
      if (!userMissionsResponse.ok) {
        throw new Error(`Endpoint utilisateur error: ${userMissionsResponse.status}`);
      }

      const userMissionsFromApi = await userMissionsResponse.json();

      // Récupérer directement en base
      const userMissionsFromDb = await db
        .select()
        .from(missions)
        .where(eq(missions.user_id, userId));

      const issues = [];

      // Vérifier le nombre
      if (userMissionsFromApi.length !== userMissionsFromDb.length) {
        issues.push(`Nombre différent: API=${userMissionsFromApi.length} vs DB=${userMissionsFromDb.length}`);
      }

      // Vérifier la cohérence des données pour chaque mission
      for (const apiMission of userMissionsFromApi) {
        const dbMission = userMissionsFromDb.find(m => m.id === apiMission.id);
        
        if (!dbMission) {
          issues.push(`Mission ${apiMission.id} dans API mais pas en DB`);
          continue;
        }

        // Vérifier les champs critiques
        if (dbMission.title !== apiMission.title) {
          issues.push(`Mission ${apiMission.id}: titre différent`);
        }

        if (dbMission.status !== apiMission.status) {
          issues.push(`Mission ${apiMission.id}: statut différent`);
        }

        // Vérifier la conversion budget
        const expectedBudget = dbMission.budget_value_cents?.toString() || dbMission.budget_min_cents?.toString() || '0';
        if (apiMission.budget !== expectedBudget) {
          issues.push(`Mission ${apiMission.id}: budget mal converti (${apiMission.budget} vs ${expectedBudget})`);
        }
      }

      if (issues.length > 0) {
        this.addResult(
          'USER_MISSIONS_CONSISTENCY',
          false,
          `${issues.length} incohérences utilisateur`,
          { issues: issues.slice(0, 5), userId },
          Date.now() - stepStart
        );
      } else {
        this.addResult(
          'USER_MISSIONS_CONSISTENCY',
          true,
          `${userMissionsFromApi.length} missions utilisateur cohérentes`,
          { count: userMissionsFromApi.length, userId },
          Date.now() - stepStart
        );
      }

    } catch (error) {
      this.addResult('USER_MISSIONS_CONSISTENCY', false, `Erreur: ${error.message}`);
    }
  }

  private addResult(test: string, success: boolean, message: string, details?: any, duration: number = 0): void {
    this.results.push({ test, success, message, details, duration });
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTATS DU TEST DE COHÉRENCE DES DONNÉES');
    console.log('='.repeat(60));

    let successCount = 0;
    let totalDuration = 0;

    for (const result of this.results) {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration > 0 ? ` (${result.duration}ms)` : '';
      
      console.log(`${status} ${result.test}: ${result.message}${duration}`);
      
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   📋 Détails:`, JSON.stringify(result.details, null, 2).split('\n').slice(0, 10).join('\n   '));
      }
      
      if (result.success) successCount++;
      totalDuration += result.duration;
    }

    console.log('\n' + '-'.repeat(60));
    console.log(`📈 BILAN: ${successCount}/${this.results.length} tests réussis`);
    console.log(`⏱️  Durée totale: ${totalDuration}ms`);
    
    if (successCount === this.results.length) {
      console.log('🎉 TOUTES LES DONNÉES SONT COHÉRENTES !');
    } else {
      console.log('⚠️  DES INCOHÉRENCES ONT ÉTÉ DÉTECTÉES - CORRECTION NÉCESSAIRE');
    }
    console.log('='.repeat(60));
  }
}

// Export pour utilisation
export async function runDataConsistencyTest(): Promise<void> {
  const tester = new DataConsistencyTester();
  await tester.runCompleteTest();
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runDataConsistencyTest()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur lors du test:', error);
      process.exit(1);
    });
}
