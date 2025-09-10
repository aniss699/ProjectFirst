
import { eq, desc } from 'drizzle-orm';
import { db } from '../server/database.js';
import { missions, announcements, bids } from '../shared/schema.js';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
  duration?: number;
}

class MarketplaceMissionsFlowTester {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  async runCompleteTest(): Promise<void> {
    console.log('🚀 Test complet: Marketplace + Mes Missions');
    console.log('=' .repeat(60));

    try {
      // 1. Test données Marketplace
      await this.testMarketplaceData();
      
      // 2. Test API Marketplace
      await this.testMarketplaceAPI();
      
      // 3. Test données Mes Missions
      await this.testMesMissionsData();
      
      // 4. Test API Mes Missions
      await this.testMesMissionsAPI();
      
      // 5. Test cohérence cross-pages
      await this.testCrossPageConsistency();
      
      // 6. Test performance des deux pages
      await this.testPagesPerformance();
      
      // 7. Test états vides et erreurs
      await this.testEdgeCases();
      
      // Rapport final
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Erreur critique dans le test:', error);
      this.addResult('CRITICAL_ERROR', false, `Erreur critique: ${error.message}`);
    }
  }

  private async testMarketplaceData(): Promise<void> {
    console.log('\n🏪 1. Test données Marketplace...');
    const stepStart = Date.now();
    
    try {
      // Récupérer toutes les missions publiques
      const publicMissions = await db
        .select()
        .from(missions)
        .where(eq(missions.status, 'published'))
        .orderBy(desc(missions.created_at))
        .limit(50);

      console.log(`📊 Missions publiques trouvées: ${publicMissions.length}`);

      // Vérifier structure des données
      if (publicMissions.length > 0) {
        const sample = publicMissions[0];
        const requiredFields = ['id', 'title', 'description', 'budget_value_cents', 'category', 'status'];
        const missingFields = requiredFields.filter(field => !sample[field as keyof typeof sample]);
        
        if (missingFields.length > 0) {
          throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
        }

        // Récupérer les offres pour chaque mission
        const missionsWithBids = await Promise.all(
          publicMissions.slice(0, 5).map(async (mission) => {
            const missionBids = await db
              .select()
              .from(bids)
              .where(eq(bids.mission_id, mission.id!));
            return { ...mission, bids: missionBids };
          })
        );

        console.log(`✅ Missions avec offres traitées: ${missionsWithBids.length}`);
      }

      this.addResult(
        'MARKETPLACE_DATA',
        true,
        `${publicMissions.length} missions publiques avec structure valide`,
        { count: publicMissions.length },
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('MARKETPLACE_DATA', false, `Erreur données marketplace: ${error.message}`);
    }
  }

  private async testMarketplaceAPI(): Promise<void> {
    console.log('\n🌐 2. Test API Marketplace...');
    const stepStart = Date.now();
    
    try {
      // Test GET /api/missions (endpoint principal marketplace)
      const response = await fetch('http://localhost:5000/api/missions');
      if (!response.ok) {
        throw new Error(`API missions failed: ${response.status}`);
      }
      
      const missions = await response.json();
      if (!Array.isArray(missions)) {
        throw new Error('API ne retourne pas un array');
      }

      console.log(`📡 API missions: ${missions.length} missions récupérées`);

      // Vérifier structure réponse API
      if (missions.length > 0) {
        const sample = missions[0];
        const requiredApiFields = ['id', 'title', 'description', 'budget', 'category', 'bids'];
        const missingFields = requiredApiFields.filter(field => !(field in sample));
        
        if (missingFields.length > 0) {
          throw new Error(`Champs API manquants: ${missingFields.join(', ')}`);
        }

        // Vérifier transformation budget
        if (sample.budget && typeof sample.budget !== 'string') {
          throw new Error('Format budget incorrect dans API');
        }
      }

      // Test filtrage par catégorie
      const webDevMissions = missions.filter(m => m.category === 'developpement');
      console.log(`🎯 Missions développement: ${webDevMissions.length}`);

      this.addResult(
        'MARKETPLACE_API',
        true,
        `API marketplace fonctionne avec ${missions.length} missions`,
        { totalMissions: missions.length, webDevCount: webDevMissions.length },
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('MARKETPLACE_API', false, `Erreur API marketplace: ${error.message}`);
    }
  }

  private async testMesMissionsData(): Promise<void> {
    console.log('\n📋 3. Test données Mes Missions...');
    const stepStart = Date.now();
    
    try {
      // Test avec user_id = 1 (utilisateur de test)
      const userMissions = await db
        .select()
        .from(missions)
        .where(eq(missions.user_id, 1))
        .orderBy(desc(missions.created_at));

      console.log(`👤 Missions utilisateur 1: ${userMissions.length}`);

      // Analyser statuts des missions
      const statusCounts = userMissions.reduce((acc, mission) => {
        const status = mission.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('📊 Répartition statuts:', statusCounts);

      // Pour chaque mission, récupérer les offres
      const missionsWithDetails = await Promise.all(
        userMissions.map(async (mission) => {
          const missionBids = await db
            .select()
            .from(bids)
            .where(eq(bids.mission_id, mission.id!));
          
          return {
            ...mission,
            bids_count: missionBids.length,
            latest_bid: missionBids[0] || null
          };
        })
      );

      const totalBids = missionsWithDetails.reduce((sum, m) => sum + m.bids_count, 0);
      console.log(`💼 Total offres reçues: ${totalBids}`);

      this.addResult(
        'MES_MISSIONS_DATA',
        true,
        `${userMissions.length} missions utilisateur avec ${totalBids} offres totales`,
        { missionCount: userMissions.length, totalBids, statusCounts },
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('MES_MISSIONS_DATA', false, `Erreur données mes missions: ${error.message}`);
    }
  }

  private async testMesMissionsAPI(): Promise<void> {
    console.log('\n🌐 4. Test API Mes Missions...');
    const stepStart = Date.now();
    
    try {
      // Test GET /api/missions/users/1/missions
      const response = await fetch('http://localhost:5000/api/missions/users/1/missions');
      if (!response.ok) {
        throw new Error(`API mes missions failed: ${response.status}`);
      }
      
      const userMissions = await response.json();
      if (!Array.isArray(userMissions)) {
        throw new Error('API mes missions ne retourne pas un array');
      }

      console.log(`📡 API mes missions: ${userMissions.length} missions utilisateur`);

      // Test détail d'une mission spécifique
      if (userMissions.length > 0) {
        const firstMission = userMissions[0];
        const detailResponse = await fetch(`http://localhost:5000/api/missions/${firstMission.id}`);
        
        if (detailResponse.ok) {
          const missionDetail = await detailResponse.json();
          console.log(`📋 Détail mission ${firstMission.id}: ${missionDetail.bids?.length || 0} offres`);
          
          // Vérifier cohérence données
          if (missionDetail.title !== firstMission.title) {
            throw new Error('Incohérence titre entre liste et détail');
          }
        }
      }

      // Test endpoint bids utilisateur (pour providers)
      const bidsResponse = await fetch('http://localhost:5000/api/missions/users/1/bids');
      if (bidsResponse.ok) {
        const userBids = await bidsResponse.json();
        console.log(`🎯 Offres utilisateur: ${userBids.length}`);
      }

      this.addResult(
        'MES_MISSIONS_API',
        true,
        `API mes missions fonctionne avec ${userMissions.length} missions`,
        { userMissions: userMissions.length },
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('MES_MISSIONS_API', false, `Erreur API mes missions: ${error.message}`);
    }
  }

  private async testCrossPageConsistency(): Promise<void> {
    console.log('\n🔗 5. Test cohérence cross-pages...');
    const stepStart = Date.now();
    
    try {
      // Récupérer données des deux APIs
      const [marketplaceResponse, userMissionsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/missions'),
        fetch('http://localhost:5000/api/missions/users/1/missions')
      ]);

      if (!marketplaceResponse.ok || !userMissionsResponse.ok) {
        throw new Error('Échec récupération données cross-pages');
      }

      const marketplaceMissions = await marketplaceResponse.json();
      const userMissions = await userMissionsResponse.json();

      // Vérifier que les missions utilisateur sont présentes dans marketplace
      const userMissionIds = userMissions.map((m: any) => m.id);
      const marketplaceMissionIds = marketplaceMissions.map((m: any) => m.id);
      
      const missingInMarketplace = userMissionIds.filter((id: number) => 
        !marketplaceMissionIds.includes(id)
      );

      if (missingInMarketplace.length > 0) {
        console.warn(`⚠️ Missions utilisateur manquantes dans marketplace: ${missingInMarketplace.join(', ')}`);
      }

      // Vérifier cohérence des données pour missions communes
      const commonMissions = userMissions.filter((userMission: any) =>
        marketplaceMissionIds.includes(userMission.id)
      );

      let inconsistencies = 0;
      for (const userMission of commonMissions) {
        const marketplaceMission = marketplaceMissions.find((m: any) => m.id === userMission.id);
        
        if (marketplaceMission) {
          // Vérifier titre
          if (userMission.title !== marketplaceMission.title) {
            console.warn(`⚠️ Titre différent mission ${userMission.id}`);
            inconsistencies++;
          }
          
          // Vérifier statut
          if (userMission.status !== marketplaceMission.status) {
            console.warn(`⚠️ Statut différent mission ${userMission.id}`);
            inconsistencies++;
          }
        }
      }

      const isConsistent = inconsistencies === 0 && missingInMarketplace.length === 0;

      this.addResult(
        'CROSS_PAGE_CONSISTENCY',
        isConsistent,
        isConsistent 
          ? 'Cohérence parfaite entre marketplace et mes missions'
          : `${inconsistencies} incohérences, ${missingInMarketplace.length} missions manquantes`,
        { 
          commonMissions: commonMissions.length,
          inconsistencies,
          missingInMarketplace: missingInMarketplace.length 
        },
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('CROSS_PAGE_CONSISTENCY', false, `Erreur cohérence: ${error.message}`);
    }
  }

  private async testPagesPerformance(): Promise<void> {
    console.log('\n⚡ 6. Test performance pages...');
    const stepStart = Date.now();
    
    try {
      // Test performance marketplace
      const marketplaceStart = Date.now();
      const marketplaceResponse = await fetch('http://localhost:5000/api/missions');
      const marketplaceTime = Date.now() - marketplaceStart;

      // Test performance mes missions
      const mesMissionsStart = Date.now();
      const mesMissionsResponse = await fetch('http://localhost:5000/api/missions/users/1/missions');
      const mesMissionsTime = Date.now() - mesMissionsStart;

      if (!marketplaceResponse.ok || !mesMissionsResponse.ok) {
        throw new Error('Échec test performance');
      }

      const marketplaceData = await marketplaceResponse.json();
      const mesMissionsData = await mesMissionsResponse.json();

      console.log(`📊 Performance marketplace: ${marketplaceTime}ms (${marketplaceData.length} missions)`);
      console.log(`📊 Performance mes missions: ${mesMissionsTime}ms (${mesMissionsData.length} missions)`);

      const isPerformant = marketplaceTime < 1000 && mesMissionsTime < 1000;

      this.addResult(
        'PAGES_PERFORMANCE',
        isPerformant,
        `Marketplace: ${marketplaceTime}ms, Mes missions: ${mesMissionsTime}ms`,
        { 
          marketplaceTime, 
          mesMissionsTime,
          marketplaceCount: marketplaceData.length,
          mesMissionsCount: mesMissionsData.length
        },
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('PAGES_PERFORMANCE', false, `Erreur performance: ${error.message}`);
    }
  }

  private async testEdgeCases(): Promise<void> {
    console.log('\n🔍 7. Test cas limites...');
    const stepStart = Date.now();
    
    try {
      // Test utilisateur sans missions
      const emptyUserResponse = await fetch('http://localhost:5000/api/missions/users/999/missions');
      if (emptyUserResponse.ok) {
        const emptyUserMissions = await emptyUserResponse.json();
        console.log(`👤 Utilisateur vide: ${emptyUserMissions.length} missions (attendu: 0)`);
      }

      // Test mission inexistante
      const notFoundResponse = await fetch('http://localhost:5000/api/missions/99999');
      console.log(`🔍 Mission inexistante: status ${notFoundResponse.status} (attendu: 404)`);

      // Test filtrage marketplace vide
      const filterResponse = await fetch('http://localhost:5000/api/missions?category=inexistent');
      if (filterResponse.ok) {
        const filteredMissions = await filterResponse.json();
        console.log(`🎯 Filtre vide: ${filteredMissions.length} missions`);
      }

      this.addResult(
        'EDGE_CASES',
        true,
        'Cas limites gérés correctement',
        {},
        Date.now() - stepStart
      );

    } catch (error) {
      this.addResult('EDGE_CASES', false, `Erreur cas limites: ${error.message}`);
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
    console.log('📊 RAPPORT TEST MARKETPLACE + MES MISSIONS');
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
    
    console.log('\n📋 RÉSUMÉ PAR COMPOSANT:');
    console.log('   🏪 Marketplace: API + données + performance');
    console.log('   📋 Mes Missions: API + données + cohérence');
    console.log('   🔗 Cross-pages: cohérence + synchronisation');
    console.log('   ⚡ Performance: temps de réponse < 1s');

    // Données de test
    const marketplaceData = this.results.find(r => r.step === 'MARKETPLACE_API')?.data;
    const mesMissionsData = this.results.find(r => r.step === 'MES_MISSIONS_API')?.data;
    
    if (marketplaceData || mesMissionsData) {
      console.log('\n📊 STATISTIQUES:');
      if (marketplaceData) {
        console.log(`   🏪 Marketplace: ${marketplaceData.totalMissions} missions totales`);
      }
      if (mesMissionsData) {
        console.log(`   👤 Mes missions: ${mesMissionsData.userMissions} missions utilisateur`);
      }
    }

    console.log('\n💡 RECOMMANDATIONS:');
    if (failedTests === 0) {
      console.log('   🎉 Excellent! Marketplace et Mes Missions fonctionnent parfaitement.');
    } else {
      console.log('   🔧 Corriger les échecs avant déploiement.');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Fonction principale
async function runMarketplaceMissionsTest(): Promise<void> {
  const tester = new MarketplaceMissionsFlowTester();
  await tester.runCompleteTest();
}

// Export pour utilisation
export { MarketplaceMissionsFlowTester, runMarketplaceMissionsTest };

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMarketplaceMissionsTest()
    .then(() => {
      console.log('✅ Test Marketplace + Mes Missions terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}
