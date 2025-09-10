
import { eq, desc } from 'drizzle-orm';
import { db } from '../server/database.js';
import { missions, announcements } from '../shared/schema.js';
import { DataConsistencyValidator } from '../server/services/data-consistency-validator.js';
import { validateMissionInput } from '../server/validation/mission-schemas.js';
import { normalizeMission } from '../server/services/mission-normalizer.js';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
  duration?: number;
}

class MissionChainTester {
  private results: TestResult[] = [];
  private testMissionId: number | null = null;
  private startTime: number = Date.now();

  async runCompleteTest(): Promise<void> {
    console.log('🚀 Démarrage du test complet de la chaîne de mission');
    console.log('=' .repeat(60));

    try {
      // 1. Test validation frontend
      await this.testFrontendValidation();
      
      // 2. Test normalisation des données
      await this.testDataNormalization();
      
      // 3. Test insertion en base
      await this.testDatabaseInsertion();
      
      // 4. Test synchronisation feed
      await this.testFeedSynchronization();
      
      // 5. Test API endpoints
      await this.testAPIEndpoints();
      
      // 6. Test cohérence des données
      await this.testDataConsistency();
      
      // 7. Test performance
      await this.testPerformance();
      
      // 8. Nettoyage
      await this.cleanup();
      
      // Rapport final
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Erreur critique dans le test:', error);
      this.addResult('CRITICAL_ERROR', false, `Erreur critique: ${error.message}`);
    }
  }

  private async testFrontendValidation(): Promise<void> {
    console.log('\n📝 1. Test validation frontend...');
    const stepStart = Date.now();
    
    try {
      // Données valides
      const validData = {
        title: 'Mission Test Complète',
        description: 'Description détaillée de la mission de test avec plus de 10 caractères pour validation',
        category: 'developpement',
        budget: {
          valueCents: 50000, // 500€
          currency: 'EUR'
        },
        location: {
          country: 'France',
          city: 'Paris',
          remoteAllowed: true
        },
        urgency: 'medium',
        status: 'draft',
        tags: ['react', 'typescript'],
        skillsRequired: ['JavaScript', 'React']
      };

      // Test validation Zod
      const validated = validateMissionInput(validData);
      
      this.addResult(
        'FRONTEND_VALIDATION',
        true,
        'Validation frontend réussie',
        validated,
        Date.now() - stepStart
      );

      // Test données invalides
      try {
        validateMissionInput({ title: 'aa' }); // Titre trop court
        this.addResult('FRONTEND_VALIDATION_INVALID', false, 'Validation incorrecte acceptée');
      } catch (error) {
        this.addResult('FRONTEND_VALIDATION_INVALID', true, 'Validation incorrecte rejetée correctement');
      }

    } catch (error) {
      this.addResult('FRONTEND_VALIDATION', false, `Erreur validation: ${error.message}`);
    }
  }

  private async testDataNormalization(): Promise<void> {
    console.log('\n🔧 2. Test normalisation des données...');
    const stepStart = Date.now();
    
    try {
      const rawData = {
        title: 'Mission Test Normalisation',
        description: 'Description pour tester la normalisation des données avec validation métier',
        category: 'developpement',
        budget: {
          valueCents: 75000,
          currency: 'EUR'
        },
        location: {
          country: 'France',
          city: 'Lyon',
          remoteAllowed: false
        },
        urgency: 'high',
        status: 'draft'
      };

      const normalized = normalizeMission(rawData, { authUserId: 1 });
      
      // Vérifications
      if (normalized.user_id !== 1) {
        throw new Error('user_id non assigné correctement');
      }
      
      if (normalized.client_id !== 1) {
        throw new Error('client_id non assigné correctement');
      }
      
      if (normalized.budget_value_cents !== 75000) {
        throw new Error('Budget non normalisé correctement');
      }

      this.addResult(
        'DATA_NORMALIZATION',
        true,
        'Normalisation des données réussie',
        normalized,
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('DATA_NORMALIZATION', false, `Erreur normalisation: ${error.message}`);
    }
  }

  private async testDatabaseInsertion(): Promise<void> {
    console.log('\n💾 3. Test insertion en base de données...');
    const stepStart = Date.now();
    
    try {
      const missionData = {
        title: `Mission Test DB ${Date.now()}`,
        description: 'Mission créée pour tester l\'insertion en base de données avec validation complète',
        category: 'developpement',
        budget_value_cents: 100000,
        currency: 'EUR',
        location_raw: 'Paris, France',
        city: 'Paris',
        country: 'France',
        remote_allowed: true,
        user_id: 1,
        client_id: 1,
        status: 'draft',
        urgency: 'medium',
        tags: ['test', 'database'],
        skills_required: ['SQL', 'TypeScript'],
        is_team_mission: false,
        team_size: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await db.insert(missions).values(missionData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Aucune mission retournée par l\'insertion');
      }

      this.testMissionId = result[0].id;
      
      // Vérification que la mission existe
      const verification = await db
        .select()
        .from(missions)
        .where(eq(missions.id, this.testMissionId))
        .limit(1);

      if (verification.length === 0) {
        throw new Error('Mission non trouvée après insertion');
      }

      this.addResult(
        'DATABASE_INSERTION',
        true,
        `Mission insérée avec ID: ${this.testMissionId}`,
        result[0],
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('DATABASE_INSERTION', false, `Erreur insertion DB: ${error.message}`);
    }
  }

  private async testFeedSynchronization(): Promise<void> {
    console.log('\n📡 4. Test synchronisation feed...');
    const stepStart = Date.now();
    
    try {
      if (!this.testMissionId) {
        throw new Error('Aucune mission disponible pour test feed');
      }

      // Récupérer la mission
      const mission = await db
        .select()
        .from(missions)
        .where(eq(missions.id, this.testMissionId))
        .limit(1);

      if (mission.length === 0) {
        throw new Error('Mission non trouvée pour synchronisation');
      }

      // Synchronisation manuelle avec le feed
      const { MissionSyncService } = await import('../server/services/mission-sync.js');
      const syncService = new MissionSyncService(process.env.DATABASE_URL!);
      
      const missionForFeed = {
        id: mission[0].id.toString(),
        title: mission[0].title,
        description: mission[0].description,
        category: mission[0].category || 'developpement',
        budget: mission[0].budget_value_cents?.toString() || '0',
        location: mission[0].location_raw || 'Remote',
        status: (mission[0].status as any) || 'open',
        clientId: mission[0].user_id?.toString() || '1',
        clientName: 'Test Client',
        createdAt: mission[0].created_at?.toISOString() || new Date().toISOString(),
        bids: []
      };

      await syncService.addMissionToFeed(missionForFeed);

      // Vérifier dans le feed
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre sync
      
      const feedItem = await db
        .select()
        .from(announcements)
        .where(eq(announcements.title, mission[0].title))
        .limit(1);

      if (feedItem.length === 0) {
        throw new Error('Mission non trouvée dans le feed');
      }

      this.addResult(
        'FEED_SYNCHRONIZATION',
        true,
        'Synchronisation feed réussie',
        feedItem[0],
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('FEED_SYNCHRONIZATION', false, `Erreur sync feed: ${error.message}`);
    }
  }

  private async testAPIEndpoints(): Promise<void> {
    console.log('\n🌐 5. Test endpoints API...');
    const stepStart = Date.now();
    
    try {
      // Test GET /api/missions
      const getAllResponse = await fetch('http://localhost:5000/api/missions');
      if (!getAllResponse.ok) {
        throw new Error(`GET /api/missions failed: ${getAllResponse.status}`);
      }
      
      const allMissions = await getAllResponse.json();
      if (!Array.isArray(allMissions)) {
        throw new Error('GET /api/missions ne retourne pas un array');
      }

      // Test GET /api/missions/:id
      if (this.testMissionId) {
        const getOneResponse = await fetch(`http://localhost:5000/api/missions/${this.testMissionId}`);
        if (!getOneResponse.ok) {
          throw new Error(`GET /api/missions/${this.testMissionId} failed: ${getOneResponse.status}`);
        }
        
        const mission = await getOneResponse.json();
        if (!mission.id) {
          throw new Error('Mission récupérée sans ID');
        }
      }

      // Test POST /api/missions
      const newMissionData = {
        title: 'Mission API Test',
        description: 'Mission créée via test API endpoint pour validation complète',
        category: 'design',
        budget: 25000,
        userId: 1,
        location: 'Remote',
        urgency: 'low'
      };

      const createResponse = await fetch('http://localhost:5000/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMissionData)
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`POST /api/missions failed: ${createResponse.status} - ${errorText}`);
      }

      const createdMission = await createResponse.json();
      
      this.addResult(
        'API_ENDPOINTS',
        true,
        'Tous les endpoints API fonctionnent',
        { 
          totalMissions: allMissions.length,
          createdMissionId: createdMission.id 
        },
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('API_ENDPOINTS', false, `Erreur API: ${error.message}`);
    }
  }

  private async testDataConsistency(): Promise<void> {
    console.log('\n🔍 6. Test cohérence des données...');
    const stepStart = Date.now();
    
    try {
      if (!this.testMissionId) {
        throw new Error('Aucune mission pour test cohérence');
      }

      // Récupérer données de différentes sources
      const dbMission = await db
        .select()
        .from(missions)
        .where(eq(missions.id, this.testMissionId))
        .limit(1);

      const feedItem = await db
        .select()
        .from(announcements)
        .where(eq(announcements.title, dbMission[0]?.title || ''))
        .limit(1);

      if (dbMission.length === 0) {
        throw new Error('Mission non trouvée en DB');
      }

      // Test cohérence DB → Feed
      if (feedItem.length > 0) {
        const consistencyResult = DataConsistencyValidator.validateDatabaseToFeed(
          dbMission[0],
          feedItem[0]
        );

        if (!consistencyResult.isValid) {
          console.warn('⚠️ Problèmes de cohérence détectés:', consistencyResult.errors);
        }

        this.addResult(
          'DATA_CONSISTENCY',
          consistencyResult.isValid,
          consistencyResult.isValid 
            ? 'Cohérence des données validée' 
            : `Incohérences: ${consistencyResult.errors.join(', ')}`,
          consistencyResult,
          Date.now() - stepStart
        );
      } else {
        this.addResult(
          'DATA_CONSISTENCY',
          false,
          'Impossible de tester cohérence - mission non dans feed'
        );
      }

    } catch (error) {
      this.addResult('DATA_CONSISTENCY', false, `Erreur cohérence: ${error.message}`);
    }
  }

  private async testPerformance(): Promise<void> {
    console.log('\n⚡ 7. Test performance...');
    const stepStart = Date.now();
    
    try {
      // Test performance GET /api/missions
      const perfStart = Date.now();
      const response = await fetch('http://localhost:5000/api/missions');
      const perfEnd = Date.now();
      
      if (!response.ok) {
        throw new Error(`Performance test failed: ${response.status}`);
      }

      const responseTime = perfEnd - perfStart;
      const isPerformant = responseTime < 1000; // moins d'1 seconde

      this.addResult(
        'PERFORMANCE',
        isPerformant,
        `Temps de réponse: ${responseTime}ms ${isPerformant ? '✅' : '⚠️'}`,
        { responseTime, threshold: 1000 },
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('PERFORMANCE', false, `Erreur performance: ${error.message}`);
    }
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 8. Nettoyage...');
    
    try {
      if (this.testMissionId) {
        // Supprimer mission test
        await db.delete(missions).where(eq(missions.id, this.testMissionId));
        
        // Supprimer du feed si présent
        const mission = await db
          .select({ title: missions.title })
          .from(missions)
          .where(eq(missions.id, this.testMissionId))
          .limit(1);
          
        if (mission.length > 0) {
          await db.delete(announcements).where(eq(announcements.title, mission[0].title));
        }
      }

      this.addResult('CLEANUP', true, 'Nettoyage terminé');

    } catch (error) {
      this.addResult('CLEANUP', false, `Erreur nettoyage: ${error.message}`);
    }
  }

  private addResult(step: string, success: boolean, message: string, data?: any, duration?: number): void {
    this.results.push({ step, success, message, data, duration });
    const status = success ? '✅' : '❌';
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(`${status} ${step}: ${message}${durationText}`);
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT DE TEST COMPLET');
    console.log('='.repeat(60));
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const totalDuration = Date.now() - this.startTime;
    
    console.log(`📈 Tests réussis: ${successfulTests}/${totalTests}`);
    console.log(`⏱️ Durée totale: ${totalDuration}ms`);
    console.log(`📊 Taux de réussite: ${((successfulTests/totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ ÉCHECS DÉTECTÉS:');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   • ${result.step}: ${result.message}`);
        });
    }
    
    console.log('\n📋 DÉTAIL PAR ÉTAPE:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`   ${status} ${result.step}${duration}`);
    });

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    if (failedTests === 0) {
      console.log('   🎉 Excellent! Toute la chaîne fonctionne parfaitement.');
    } else {
      console.log('   🔧 Corriger les échecs identifiés avant déploiement.');
    }

    // Performance
    const performanceResult = this.results.find(r => r.step === 'PERFORMANCE');
    if (performanceResult?.data?.responseTime > 500) {
      console.log('   ⚡ Considérer optimisation performance (>500ms).');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Fonction principale
async function runCompleteChainTest(): Promise<void> {
  const tester = new MissionChainTester();
  await tester.runCompleteTest();
}

// Export pour utilisation
export { MissionChainTester, runCompleteChainTest };

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteChainTest()
    .then(() => {
      console.log('✅ Test complet terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}
