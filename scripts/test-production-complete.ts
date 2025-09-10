
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, missions } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
  duration: number;
}

class ProductionTester {
  private pool: Pool;
  private db: any;
  private results: TestResult[] = [];
  private testUserId: number | null = null;
  private testMissionId: number | null = null;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
    });
    this.db = drizzle(this.pool);
  }

  async runCompleteTest(): Promise<void> {
    console.log('🚀 TEST PRODUCTION COMPLET - CRÉATION MISSIONS & COMPTES');
    console.log('=' .repeat(70));

    try {
      await this.testDatabaseConnection();
      await this.testAccountCreation();
      await this.testAccountLogin();
      await this.testMissionCreation();
      await this.testMissionRetrieval();
      await this.testAPIEndpoints();
      await this.testDataConsistency();
      await this.cleanup();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Erreur critique:', error);
      this.addResult('CRITICAL_ERROR', false, `Erreur fatale: ${error.message}`, null, 0);
    } finally {
      await this.pool.end();
    }
  }

  private async testDatabaseConnection(): Promise<void> {
    const start = Date.now();
    console.log('🔍 1. Test connexion base de données...');

    try {
      await this.db.select().from(users).limit(1);
      this.addResult('DATABASE_CONNECTION', true, 'Connexion DB réussie', null, Date.now() - start);
    } catch (error) {
      this.addResult('DATABASE_CONNECTION', false, `Erreur DB: ${error.message}`, null, Date.now() - start);
      throw error;
    }
  }

  private async testAccountCreation(): Promise<void> {
    const start = Date.now();
    console.log('👤 2. Test création de compte...');

    const timestamp = Date.now();
    const testUser = {
      email: `test-prod-${timestamp}@swideal.com`,
      password: 'TestProd2024!',
      name: `Test Production ${timestamp}`,
      role: 'CLIENT' as const
    };

    try {
      // Test via API
      const response = await fetch('http://0.0.0.0:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Register failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.user?.id) {
        throw new Error(`Création compte échouée: ${JSON.stringify(result)}`);
      }

      this.testUserId = result.user.id;
      
      // Vérifier en base
      const userInDb = await this.db
        .select()
        .from(users)
        .where(eq(users.id, this.testUserId))
        .limit(1);

      if (userInDb.length === 0) {
        throw new Error('Utilisateur non trouvé en base après création');
      }

      this.addResult('ACCOUNT_CREATION', true, `Compte créé: ID ${this.testUserId}`, {
        userId: this.testUserId,
        email: testUser.email,
        dbVerified: true
      }, Date.now() - start);

    } catch (error) {
      this.addResult('ACCOUNT_CREATION', false, `Erreur création compte: ${error.message}`, null, Date.now() - start);
      throw error;
    }
  }

  private async testAccountLogin(): Promise<void> {
    const start = Date.now();
    console.log('🔐 3. Test connexion compte...');

    if (!this.testUserId) {
      throw new Error('Pas d\'ID utilisateur pour tester la connexion');
    }

    try {
      // Récupérer les données utilisateur pour le login
      const userInDb = await this.db
        .select()
        .from(users)
        .where(eq(users.id, this.testUserId))
        .limit(1);

      if (userInDb.length === 0) {
        throw new Error('Utilisateur non trouvé pour test login');
      }

      const user = userInDb[0];

      // Test login via API
      const response = await fetch('http://0.0.0.0:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: 'TestProd2024!'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Login failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.user) {
        throw new Error(`Login échoué: ${JSON.stringify(result)}`);
      }

      this.addResult('ACCOUNT_LOGIN', true, `Login réussi pour user ${this.testUserId}`, {
        userId: result.user.id,
        email: result.user.email
      }, Date.now() - start);

    } catch (error) {
      this.addResult('ACCOUNT_LOGIN', false, `Erreur login: ${error.message}`, null, Date.now() - start);
      throw error;
    }
  }

  private async testMissionCreation(): Promise<void> {
    const start = Date.now();
    console.log('📋 4. Test création mission...');

    if (!this.testUserId) {
      throw new Error('Pas d\'ID utilisateur pour créer une mission');
    }

    const timestamp = Date.now();
    const testMission = {
      title: `Mission Test Production ${timestamp}`,
      description: `Mission créée en test de production le ${new Date().toLocaleString()}. Cette mission teste la création complète avec toutes les validations nécessaires.`,
      category: 'developpement',
      budget: '2500',
      location: 'Paris, France',
      postal_code: '75001',
      remote_allowed: true,
      userId: this.testUserId
    };

    try {
      // Test création via API
      const response = await fetch('http://0.0.0.0:5000/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMission)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Mission creation failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.ok || !result.id) {
        throw new Error(`Création mission échouée: ${JSON.stringify(result)}`);
      }

      this.testMissionId = result.id;
      
      // Vérifier en base
      const missionInDb = await this.db
        .select()
        .from(missions)
        .where(eq(missions.id, this.testMissionId))
        .limit(1);

      if (missionInDb.length === 0) {
        throw new Error('Mission non trouvée en base après création');
      }

      const mission = missionInDb[0];

      // Vérifications de cohérence
      const checks = {
        title_match: mission.title === testMission.title,
        user_id_match: mission.user_id === this.testUserId,
        status_published: mission.status === 'published',
        budget_correct: mission.budget_value_cents === 250000, // 2500 * 100
        postal_code_saved: mission.postal_code === testMission.postal_code
      };

      const failedChecks = Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([check, _]) => check);

      if (failedChecks.length > 0) {
        throw new Error(`Vérifications échouées: ${failedChecks.join(', ')}`);
      }

      this.addResult('MISSION_CREATION', true, `Mission créée: ID ${this.testMissionId}`, {
        missionId: this.testMissionId,
        title: mission.title,
        status: mission.status,
        budget_cents: mission.budget_value_cents,
        checks_passed: Object.keys(checks).length
      }, Date.now() - start);

    } catch (error) {
      this.addResult('MISSION_CREATION', false, `Erreur création mission: ${error.message}`, null, Date.now() - start);
      throw error;
    }
  }

  private async testMissionRetrieval(): Promise<void> {
    const start = Date.now();
    console.log('🔍 5. Test récupération mission...');

    if (!this.testMissionId) {
      throw new Error('Pas d\'ID mission pour tester la récupération');
    }

    try {
      // Test récupération via API
      const response = await fetch(`http://0.0.0.0:5000/api/missions/${this.testMissionId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Mission retrieval failed: ${response.status} - ${errorText}`);
      }

      const mission = await response.json();
      
      if (!mission.id || mission.id !== this.testMissionId) {
        throw new Error(`Mission récupérée incorrecte: ${JSON.stringify(mission)}`);
      }

      // Vérifier les champs essentiels
      const requiredFields = ['title', 'description', 'category', 'budget', 'status'];
      const missingFields = requiredFields.filter(field => !mission[field]);

      if (missingFields.length > 0) {
        throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
      }

      this.addResult('MISSION_RETRIEVAL', true, `Mission récupérée correctement`, {
        missionId: mission.id,
        title: mission.title,
        fields_count: Object.keys(mission).length
      }, Date.now() - start);

    } catch (error) {
      this.addResult('MISSION_RETRIEVAL', false, `Erreur récupération mission: ${error.message}`, null, Date.now() - start);
      throw error;
    }
  }

  private async testAPIEndpoints(): Promise<void> {
    const start = Date.now();
    console.log('🌐 6. Test endpoints API...');

    const endpoints = [
      { url: '/api/health', name: 'Health Check' },
      { url: '/api/missions', name: 'Missions List' },
      { url: '/api/missions/health', name: 'Missions Health' },
      { url: '/api/auth/demo-users', name: 'Demo Users' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://0.0.0.0:5000${endpoint.url}`);
        
        if (response.ok) {
          results.push({ ...endpoint, status: 'OK' });
        } else {
          results.push({ ...endpoint, status: `ERROR ${response.status}` });
        }
      } catch (error) {
        results.push({ ...endpoint, status: `FAILED: ${error.message}` });
      }
    }

    const failedEndpoints = results.filter(r => r.status !== 'OK');

    if (failedEndpoints.length > 0) {
      this.addResult('API_ENDPOINTS', false, `${failedEndpoints.length} endpoints échoués`, {
        failed: failedEndpoints,
        total: endpoints.length
      }, Date.now() - start);
    } else {
      this.addResult('API_ENDPOINTS', true, `Tous les endpoints fonctionnels`, {
        tested: endpoints.length
      }, Date.now() - start);
    }
  }

  private async testDataConsistency(): Promise<void> {
    const start = Date.now();
    console.log('🔄 7. Test cohérence des données...');

    try {
      // Vérifier que l'utilisateur et sa mission sont liés
      if (!this.testUserId || !this.testMissionId) {
        throw new Error('IDs de test manquants pour vérifier la cohérence');
      }

      const userMissions = await this.db
        .select()
        .from(missions)
        .where(eq(missions.user_id, this.testUserId));

      const testMissionFound = userMissions.find(m => m.id === this.testMissionId);

      if (!testMissionFound) {
        throw new Error('Mission non trouvée dans les missions de l\'utilisateur');
      }

      // Test via API users missions
      const response = await fetch(`http://0.0.0.0:5000/api/missions/users/${this.testUserId}/missions`);

      if (!response.ok) {
        throw new Error(`API user missions failed: ${response.status}`);
      }

      const apiUserMissions = await response.json();
      const apiMissionFound = apiUserMissions.find((m: any) => m.id === this.testMissionId);

      if (!apiMissionFound) {
        throw new Error('Mission non trouvée dans l\'API user missions');
      }

      this.addResult('DATA_CONSISTENCY', true, `Cohérence données vérifiée`, {
        user_missions_count: userMissions.length,
        api_missions_count: apiUserMissions.length,
        test_mission_found: true
      }, Date.now() - start);

    } catch (error) {
      this.addResult('DATA_CONSISTENCY', false, `Erreur cohérence: ${error.message}`, null, Date.now() - start);
    }
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 8. Nettoyage des données de test...');

    try {
      // Supprimer la mission de test
      if (this.testMissionId) {
        await this.db.delete(missions).where(eq(missions.id, this.testMissionId));
        console.log(`   ✅ Mission ${this.testMissionId} supprimée`);
      }

      // Supprimer l'utilisateur de test
      if (this.testUserId) {
        await this.db.delete(users).where(eq(users.id, this.testUserId));
        console.log(`   ✅ Utilisateur ${this.testUserId} supprimé`);
      }

    } catch (error) {
      console.log(`   ⚠️ Erreur nettoyage: ${error.message}`);
    }
  }

  private addResult(test: string, success: boolean, message: string, data: any = null, duration: number): void {
    this.results.push({ test, success, message, data, duration });
    console.log(`   ${success ? '✅' : '❌'} ${message}`);
  }

  private printResults(): void {
    console.log('\n📊 RÉSULTATS DU TEST PRODUCTION');
    console.log('=' .repeat(50));

    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;

    console.log(`Tests réussis: ${successful}/${total}`);
    console.log(`Taux de réussite: ${Math.round((successful / total) * 100)}%`);

    if (successful === total) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
      console.log('✅ Le système est prêt pour la production');
      console.log('✅ Création de comptes fonctionnelle');
      console.log('✅ Création de missions fonctionnelle');
      console.log('✅ APIs cohérentes et stables');
    } else {
      console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`❌ ${result.test}: ${result.message}`);
      });
    }

    console.log('\n⏱️ Durées d\'exécution:');
    this.results.forEach(result => {
      console.log(`   ${result.test}: ${result.duration}ms`);
    });
  }
}

// Fonction principale
export async function runProductionTest(): Promise<void> {
  const tester = new ProductionTester();
  await tester.runCompleteTest();
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runProductionTest().catch(console.error);
}
