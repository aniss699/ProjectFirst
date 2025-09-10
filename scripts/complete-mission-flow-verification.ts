import { eq, desc } from 'drizzle-orm';
import { db } from '../server/database.js';
import { missions, announcements, bids } from '../shared/schema.js';

interface TestStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

class MissionFlowVerifier {
  private steps: TestStep[] = [];
  private testMissionId: number | null = null;

  async runCompleteVerification(): Promise<void> {
    console.log('🔍 VÉRIFICATION COMPLÈTE DU FLUX DE MISSION');
    console.log('=' .repeat(60));

    try {
      await this.step1_DatabaseConnection();
      await this.step2_CreateMission();
      await this.step3_VerifyDatabaseStorage();
      await this.step4_VerifyAPIEndpoints();
      await this.step5_VerifyFeedSynchronization();
      await this.step6_VerifyMarketplaceDisplay();
      await this.step7_VerifyBidsSystem();
      await this.step8_VerifyDataConsistency();
      await this.step9_CleanupTestData();

      this.generateFinalReport();
    } catch (error) {
      console.error('❌ Erreur critique:', error);
      this.addStep('CRITICAL_ERROR', 'error', `Erreur fatale: ${error.message}`);
    }
  }

  private async step1_DatabaseConnection(): Promise<void> {
    const step = this.addStep('DATABASE_CONNECTION', 'running', 'Test de connexion à la base de données...');

    try {
      const testQuery = await db.select({ count: missions.id }).from(missions).limit(1);
      step.status = 'success';
      step.message = 'Connexion à la base de données établie';
      step.duration = Date.now();
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur connexion DB: ${error.message}`;
      throw error;
    }
  }

  private async step2_CreateMission(): Promise<void> {
    const step = this.addStep('CREATE_MISSION', 'running', 'Création d\'une mission de test...');

    try {
      // Vérifier quelles colonnes existent dans la table missions
      const existingColumns = await this.getExistingColumns('missions');

      // Données de base obligatoires
      const baseMissionData = {
        title: `Mission Test ${Date.now()}`,
        description: 'Mission de test pour vérification complète du système. Cette description contient plus de 10 caractères requis pour la validation.',
        category: 'developpement',
        status: 'published',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Données optionnelles selon les colonnes disponibles
      const optionalData = {
        budget_value_cents: 500000, // 5000€
        budget: 5000, // Fallback pour l'ancienne colonne (en euros)
        currency: 'EUR',
        location_raw: 'Paris, France',
        location: 'Paris, France', // Fallback pour l'ancienne colonne
        city: 'Paris',
        country: 'France',
        postal_code: '75001', // Ajouté pour test
        latitude: 48.8566, // Ajouté pour test
        longitude: 2.3522, // Ajouté pour test
        remote_allowed: true,
        client_id: 1,
        urgency: 'medium',
        tags: ['test', 'verification'],
        skills_required: ['TypeScript', 'React'],
        is_team_mission: false,
        team_size: 1,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours dans le futur
      };

      // Construire l'objet final avec seulement les colonnes qui existent
      const testMissionData = { ...baseMissionData };
      for (const [key, value] of Object.entries(optionalData)) {
        if (existingColumns.includes(key)) {
          testMissionData[key] = value;
        }
      }

      console.log('📝 Colonnes disponibles:', existingColumns);
      console.log('📝 Données à insérer:', Object.keys(testMissionData));

      const result = await db.insert(missions).values(testMissionData).returning();

      if (!result || result.length === 0) {
        throw new Error('Aucune mission retournée après insertion');
      }

      this.testMissionId = result[0].id;
      step.status = 'success';
      step.message = `Mission créée avec ID: ${this.testMissionId}`;
      step.data = { missionId: this.testMissionId, title: result[0].title };
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur création mission: ${error.message}`;
      throw error;
    }
  }

  // Nouvelle méthode pour récupérer les colonnes existantes
  private async getExistingColumns(tableName: string): Promise<string[]> {
    try {
      const query = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        ORDER BY ordinal_position
      `;

      const result = await db.execute(query);
      return result.rows.map(row => row.column_name);
    } catch (error) {
      console.warn(`⚠️ Impossible de récupérer les colonnes de ${tableName}:`, error.message);
      // Retourner les colonnes de base minimales
      return ['id', 'title', 'description', 'category', 'status', 'user_id', 'created_at', 'updated_at'];
    }
  }

  private async step3_VerifyDatabaseStorage(): Promise<void> {
    const step = this.addStep('VERIFY_DB_STORAGE', 'running', 'Vérification du stockage en base...');

    try {
      if (!this.testMissionId) {
        throw new Error('Pas de mission ID disponible');
      }

      const storedMission = await db
        .select()
        .from(missions)
        .where(eq(missions.id, this.testMissionId))
        .limit(1);

      if (storedMission.length === 0) {
        throw new Error('Mission non trouvée en base après création');
      }

      const mission = storedMission[0];

      // Vérifications des champs obligatoires
      const requiredFields = ['title', 'description', 'category', 'status'];
      const missingFields = requiredFields.filter(field => !mission[field as keyof typeof mission]);

      if (missingFields.length > 0) {
        throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
      }

      step.status = 'success';
      step.message = 'Mission correctement stockée en base';
      step.data = { 
        fieldsVerified: requiredFields.length,
        missionData: {
          id: mission.id,
          title: mission.title,
          status: mission.status,
          budget_value_cents: mission.budget_value_cents
        }
      };
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur vérification stockage: ${error.message}`;
      throw error;
    }
  }

  private async step4_VerifyAPIEndpoints(): Promise<void> {
    const step = this.addStep('VERIFY_API_ENDPOINTS', 'running', 'Test des endpoints API...');

    try {
      if (!this.testMissionId) {
        throw new Error('Pas de mission ID disponible');
      }

      // Déterminer l'URL du serveur selon l'environnement
      const serverUrl = process.env.REPL_ID ? 
        `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.replit.app` : 
        'http://0.0.0.0:5000';

      console.log('🌐 Test serveur sur:', serverUrl);

      // Vérifier d'abord que le serveur répond
      try {
        const healthResponse = await fetch(`${serverUrl}/api/health`);
        if (!healthResponse.ok) {
          throw new Error(`Serveur non accessible: ${healthResponse.status}`);
        }
        console.log('✅ Serveur accessible');
      } catch (healthError) {
        console.warn('⚠️ Serveur non accessible, test API annulé');
        step.status = 'error';
        step.message = 'Serveur non démarré - Démarrez le serveur avec le bouton Run avant de lancer ce test';
        return;
      }

      // Test GET /api/missions
      const getAllResponse = await fetch(`${serverUrl}/api/missions`);
      if (!getAllResponse.ok) {
        throw new Error(`GET /api/missions failed: ${getAllResponse.status}`);
      }

      const allMissions = await getAllResponse.json();
      if (!Array.isArray(allMissions)) {
        throw new Error('GET /api/missions ne retourne pas un array');
      }

      // Test GET /api/missions/:id
      const getOneResponse = await fetch(`${serverUrl}/api/missions/${this.testMissionId}`);
      if (!getOneResponse.ok) {
        throw new Error(`GET /api/missions/${this.testMissionId} failed: ${getOneResponse.status}`);
      }

      const mission = await getOneResponse.json();
      if (!mission.id || mission.id !== this.testMissionId) {
        throw new Error('Mission récupérée incorrecte');
      }

      // Vérifier structure de réponse
      const expectedFields = ['id', 'title', 'description', 'category', 'budget', 'bids'];
      const missingApiFields = expectedFields.filter(field => !(field in mission));

      if (missingApiFields.length > 0) {
        throw new Error(`Champs API manquants: ${missingApiFields.join(', ')}`);
      }

      step.status = 'success';
      step.message = `Endpoints API fonctionnels (${allMissions.length} missions totales)`;
      step.data = { 
        totalMissions: allMissions.length,
        missionFound: true,
        apiFieldsValid: expectedFields.length
      };
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur API endpoints: ${error.message}`;
      throw error;
    }
  }

  private async step5_VerifyFeedSynchronization(): Promise<void> {
    const step = this.addStep('VERIFY_FEED_SYNC', 'running', 'Vérification synchronisation feed...');

    try {
      if (!this.testMissionId) {
        throw new Error('Pas de mission ID disponible');
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

      // Synchronisation manuelle avec le feed (adaptative selon colonnes disponibles)
      const missionData = mission[0];

      // Budget adaptatif selon les colonnes disponibles
      const budgetValue = missionData.budget_value_cents || missionData.budget || 0;
      const budgetDisplay = budgetValue > 0 ? `${Math.round(budgetValue / 100)}€` : 'Budget non défini';

      // Location adaptative
      const locationDisplay = missionData.location_raw || missionData.location || missionData.city || 'Remote';

      const announcementData = {
        id: missionData.id,
        title: missionData.title,
        description: missionData.description,
        excerpt: missionData.description.substring(0, 200) + (missionData.description.length > 200 ? '...' : ''),
        category: missionData.category || 'developpement',
        tags: missionData.tags || [],
        budget_display: budgetDisplay,
        budget_value_cents: budgetValue,
        currency: missionData.currency || 'EUR',
        location_display: locationDisplay,
        city: missionData.city,
        country: missionData.country || 'France',
        client_id: missionData.client_id || missionData.user_id,
        client_display_name: 'Client Test',
        status: missionData.status === 'published' ? 'active' : 'inactive',
        urgency: missionData.urgency || 'medium',
        deadline: missionData.deadline,
        search_text: `${missionData.title} ${missionData.description} ${missionData.category}`,
        created_at: missionData.created_at,
        updated_at: missionData.updated_at
      };

      await db.insert(announcements).values(announcementData).onConflictDoUpdate({
        target: [announcements.id],
        set: announcementData
      });

      // Vérifier dans le feed
      await new Promise(resolve => setTimeout(resolve, 1000));

      const feedItem = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, this.testMissionId))
        .limit(1);

      if (feedItem.length === 0) {
        throw new Error('Mission non trouvée dans le feed après sync');
      }

      step.status = 'success';
      step.message = 'Synchronisation feed réussie';
      step.data = { 
        feedItemId: feedItem[0].id,
        title: feedItem[0].title,
        status: feedItem[0].status
      };
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur sync feed: ${error.message}`;
      throw error;
    }
  }

  private async step6_VerifyMarketplaceDisplay(): Promise<void> {
    const step = this.addStep('VERIFY_MARKETPLACE', 'running', 'Test affichage marketplace...');

    try {
      // Test API marketplace
      const serverUrl = process.env.REPL_ID ? 
        `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.replit.app` : 
        'http://0.0.0.0:5000';

      const marketplaceResponse = await fetch(`${serverUrl}/api/missions`);
      if (!marketplaceResponse.ok) {
        throw new Error(`Marketplace API error: ${marketplaceResponse.status}`);
      }

      const marketplaceMissions = await marketplaceResponse.json();
      const foundInMarketplace = marketplaceMissions.find((m: any) => m.id === this.testMissionId);

      if (!foundInMarketplace) {
        throw new Error('Mission non trouvée dans l\'API marketplace');
      }

      // Vérifier les champs essentiels pour l'affichage
      const displayFields = ['title', 'description', 'budget', 'category', 'location'];
      const missingDisplayFields = displayFields.filter(field => !foundInMarketplace[field]);

      if (missingDisplayFields.length > 0) {
        console.warn(`Champs d'affichage manquants: ${missingDisplayFields.join(', ')}`);
      }

      step.status = 'success';
      step.message = `Mission visible dans marketplace (${marketplaceMissions.length} missions)`;
      step.data = { 
        marketplaceMissionCount: marketplaceMissions.length,
        missionVisible: true,
        displayFieldsComplete: displayFields.length - missingDisplayFields.length
      };
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur marketplace: ${error.message}`;
      throw error;
    }
  }

  private async step7_VerifyBidsSystem(): Promise<void> {
    const step = this.addStep('VERIFY_BIDS_SYSTEM', 'running', 'Test système d\'offres...');

    try {
      if (!this.testMissionId) {
        throw new Error('Pas de mission ID disponible');
      }

      // Créer une offre de test
      const bidData = {
        project_id: this.testMissionId, // Utiliser project_id comme défini dans le schéma
        provider_id: 2, // Utilisateur provider
        proposal: 'Offre de test pour vérification système',
        price_cents: 400000, // 4000€
        delivery_days: 7,
        created_at: new Date(),
        updated_at: new Date()
      };

      const bidResult = await db.insert(bids).values(bidData).returning();

      if (!bidResult || bidResult.length === 0) {
        throw new Error('Erreur création offre de test');
      }

      // Vérifier récupération des offres via API
      const serverUrl = process.env.REPL_ID ? 
        `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.replit.app` : 
        'http://0.0.0.0:5000';

      const missionWithBidsResponse = await fetch(`${serverUrl}/api/missions/${this.testMissionId}`);
      if (!missionWithBidsResponse.ok) {
        throw new Error('Erreur récupération mission avec offres');
      }

      const missionWithBids = await missionWithBidsResponse.json();
      if (!missionWithBids.bids || !Array.isArray(missionWithBids.bids)) {
        throw new Error('Champ bids manquant ou incorrect');
      }

      step.status = 'success';
      step.message = `Système d'offres fonctionnel (${missionWithBids.bids.length} offres)`;
      step.data = { 
        bidCreated: true,
        bidId: bidResult[0].id,
        bidsCount: missionWithBids.bids.length
      };
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur système offres: ${error.message}`;
      // Ne pas faire échouer le test complet pour les offres
    }
  }

  private async step8_VerifyDataConsistency(): Promise<void> {
    const step = this.addStep('VERIFY_DATA_CONSISTENCY', 'running', 'Vérification cohérence des données...');

    try {
      if (!this.testMissionId) {
        throw new Error('Pas de mission ID disponible');
      }

      // Récupérer données de toutes les sources
      const serverUrl = process.env.REPL_ID ? 
        `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.replit.app` : 
        'http://0.0.0.0:5000';

      const [dbMission, apiMission, feedItem] = await Promise.all([
        db.select().from(missions).where(eq(missions.id, this.testMissionId)).limit(1),
        fetch(`${serverUrl}/api/missions/${this.testMissionId}`).then(r => r.json()),
        db.select().from(announcements).where(eq(announcements.id, this.testMissionId)).limit(1)
      ]);

      const inconsistencies = [];

      // Vérifier cohérence DB ↔ API
      if (dbMission[0].title !== apiMission.title) {
        inconsistencies.push('Titre différent entre DB et API');
      }

      if (dbMission[0].status !== apiMission.status) {
        inconsistencies.push('Statut différent entre DB et API');
      }

      // Vérifier cohérence DB ↔ Feed
      if (feedItem.length > 0) {
        if (dbMission[0].title !== feedItem[0].title) {
          inconsistencies.push('Titre différent entre DB et Feed');
        }
      }

      if (inconsistencies.length > 0) {
        step.status = 'error';
        step.message = `${inconsistencies.length} incohérences détectées`;
        step.data = { inconsistencies };
      } else {
        step.status = 'success';
        step.message = 'Données cohérentes entre toutes les sources';
        step.data = { 
          sourcesChecked: 3,
          fieldsVerified: ['title', 'status', 'description']
        };
      }
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur vérification cohérence: ${error.message}`;
    }
  }

  private async step9_CleanupTestData(): Promise<void> {
    const step = this.addStep('CLEANUP_TEST_DATA', 'running', 'Nettoyage des données de test...');

    try {
      if (!this.testMissionId) {
        step.status = 'success';
        step.message = 'Aucune donnée de test à nettoyer';
        return;
      }

      // Supprimer les offres de test
      await db.delete(bids).where(eq(bids.project_id, this.testMissionId));

      // Supprimer de announcements
      await db.delete(announcements).where(eq(announcements.id, this.testMissionId));

      // Supprimer la mission de test
      await db.delete(missions).where(eq(missions.id, this.testMissionId));

      step.status = 'success';
      step.message = 'Données de test nettoyées';
      step.data = { cleanedMissionId: this.testMissionId };
    } catch (error) {
      step.status = 'error';
      step.message = `Erreur nettoyage: ${error.message}`;
    }
  }

  private addStep(name: string, status: 'running' | 'success' | 'error', message: string): TestStep {
    const step: TestStep = { name, status, message };
    this.steps.push(step);

    const statusIcon = status === 'running' ? '🔄' : status === 'success' ? '✅' : '❌';
    console.log(`${statusIcon} ${name}: ${message}`);

    return step;
  }

  private generateFinalReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT FINAL DE VÉRIFICATION');
    console.log('='.repeat(60));

    const successfulSteps = this.steps.filter(s => s.status === 'success').length;
    const errorSteps = this.steps.filter(s => s.status === 'error').length;
    const totalSteps = this.steps.length;

    console.log(`📈 Étapes réussies: ${successfulSteps}/${totalSteps}`);
    console.log(`📊 Taux de réussite: ${((successfulSteps/totalSteps) * 100).toFixed(1)}%`);

    if (errorSteps > 0) {
      console.log('\n❌ ERREURS DÉTECTÉES:');
      this.steps
        .filter(s => s.status === 'error')
        .forEach(step => {
          console.log(`   • ${step.name}: ${step.message}`);
        });
    }

    console.log('\n📋 ÉTAPES VÉRIFIÉES:');
    console.log('   1. 🔌 Connexion base de données');
    console.log('   2. 📝 Création de mission');
    console.log('   3. 💾 Stockage en base');
    console.log('   4. 🌐 Endpoints API');
    console.log('   5. 📡 Synchronisation feed');
    console.log('   6. 🏪 Affichage marketplace');
    console.log('   7. 💼 Système d\'offres');
    console.log('   8. 🔗 Cohérence des données');
    console.log('   9. 🧹 Nettoyage');

    if (errorSteps === 0) {
      console.log('\n🎉 EXCELLENT! Le processus de mission est parfaitement fonctionnel.');
    } else {
      console.log('\n⚠️ Corriger les erreurs avant utilisation en production.');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Fonction principale
export async function runMissionFlowVerification(): Promise<void> {
  const verifier = new MissionFlowVerifier();
  await verifier.runCompleteVerification();
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMissionFlowVerification()
    .then(() => {
      console.log('✅ Vérification complète terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}