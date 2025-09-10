
#!/usr/bin/env tsx

import { eq, desc } from 'drizzle-orm';
import { db } from '../server/database.js';
import { missions, announcements, bids, users } from '../shared/schema.js';
import { Pool } from 'pg';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: any;
  response_time?: number;
}

export class ProductionHealthChecker {
  private results: HealthCheckResult[] = [];
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 20
    });
  }

  async runCompleteHealthCheck(): Promise<void> {
    console.log('🏥 DIAGNOSTIC COMPLET PRODUCTION - SwipDEAL');
    console.log('==========================================\n');

    const checks = [
      () => this.checkDatabaseHealth(),
      () => this.checkAPIEndpoints(),
      () => this.checkDataIntegrity(),
      () => this.checkFrontendAssets(),
      () => this.checkEnvironmentVariables(),
      () => this.checkPerformanceMetrics(),
      () => this.checkSecurityHeaders(),
      () => this.checkMissionWorkflow(),
      () => this.checkUserAuthentication(),
      () => this.checkErrorRates()
    ];

    const checkNames = [
      'Database Health',
      'API Endpoints',
      'Data Integrity',
      'Frontend Assets',
      'Environment Variables',
      'Performance Metrics',
      'Security Headers',
      'Mission Workflow',
      'User Authentication',
      'Error Rates'
    ];

    for (let i = 0; i < checks.length; i++) {
      console.log(`🔍 ${i + 1}. ${checkNames[i]}...`);
      try {
        await checks[i]();
      } catch (error) {
        this.addResult(checkNames[i], 'critical', `Erreur: ${error.message}`);
      }
    }

    this.printHealthReport();
  }

  private async checkDatabaseHealth(): Promise<void> {
    const start = Date.now();
    
    try {
      // Test connexion basique
      await this.pool.query('SELECT 1');
      
      // Test des tables critiques
      const missionCount = await db.select().from(missions);
      const userCount = await db.select().from(users);
      const bidCount = await db.select().from(bids);

      // Vérifier la performance
      const responseTime = Date.now() - start;
      
      if (responseTime > 1000) {
        this.addResult('Database Health', 'warning', 
          `Connexion lente (${responseTime}ms)`, 
          { missions: missionCount.length, users: userCount.length, bids: bidCount.length },
          responseTime
        );
      } else {
        this.addResult('Database Health', 'healthy', 
          `Connexion rapide (${responseTime}ms)`, 
          { missions: missionCount.length, users: userCount.length, bids: bidCount.length },
          responseTime
        );
      }

    } catch (error) {
      this.addResult('Database Health', 'critical', `Échec connexion: ${error.message}`);
    }
  }

  private async checkAPIEndpoints(): Promise<void> {
    const endpoints = [
      { path: '/api/health', method: 'GET', expected: 200 },
      { path: '/api/missions', method: 'GET', expected: 200 },
      { path: '/api/missions/users/3/missions', method: 'GET', expected: 200 },
      { path: '/api/debug/missions', method: 'GET', expected: 200 },
      { path: '/api/performance', method: 'GET', expected: 200 }
    ];

    for (const endpoint of endpoints) {
      const start = Date.now();
      try {
        const response = await fetch(`http://localhost:5000${endpoint.path}`, {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' }
        });

        const responseTime = Date.now() - start;
        const isHealthy = response.status === endpoint.expected;
        
        if (isHealthy && responseTime < 500) {
          this.addResult(`API ${endpoint.path}`, 'healthy', 
            `Réponse ${response.status} (${responseTime}ms)`, 
            {}, responseTime
          );
        } else if (isHealthy) {
          this.addResult(`API ${endpoint.path}`, 'warning', 
            `Réponse lente: ${response.status} (${responseTime}ms)`, 
            {}, responseTime
          );
        } else {
          const errorText = await response.text().catch(() => 'Erreur de lecture');
          this.addResult(`API ${endpoint.path}`, 'critical', 
            `Erreur ${response.status}: ${errorText.substring(0, 100)}`, 
            {}, responseTime
          );
        }

      } catch (error) {
        this.addResult(`API ${endpoint.path}`, 'critical', 
          `Échec réseau: ${error.message}`
        );
      }
    }
  }

  private async checkDataIntegrity(): Promise<void> {
    try {
      // Vérifier les relations orphelines
      const orphanBids = await db.execute(`
        SELECT COUNT(*) as count 
        FROM bids b 
        LEFT JOIN missions m ON b.mission_id = m.id 
        WHERE m.id IS NULL
      `);

      const orphanMissions = await db.execute(`
        SELECT COUNT(*) as count 
        FROM missions m 
        LEFT JOIN users u ON m.user_id = u.id 
        WHERE u.id IS NULL
      `);

      // Vérifier la cohérence des données
      const inconsistentUserClient = await db.execute(`
        SELECT COUNT(*) as count 
        FROM missions 
        WHERE user_id != client_id OR client_id IS NULL
      `);

      const issues = [];
      if (Number(orphanBids.rows[0]?.count) > 0) {
        issues.push(`${orphanBids.rows[0].count} bids orphelins`);
      }
      if (Number(orphanMissions.rows[0]?.count) > 0) {
        issues.push(`${orphanMissions.rows[0].count} missions avec utilisateurs manquants`);
      }
      if (Number(inconsistentUserClient.rows[0]?.count) > 0) {
        issues.push(`${inconsistentUserClient.rows[0].count} missions avec user_id/client_id incohérents`);
      }

      if (issues.length > 0) {
        this.addResult('Data Integrity', 'warning', 
          `Problèmes détectés: ${issues.join(', ')}`
        );
      } else {
        this.addResult('Data Integrity', 'healthy', 
          'Toutes les relations sont cohérentes'
        );
      }

    } catch (error) {
      this.addResult('Data Integrity', 'critical', 
        `Erreur de vérification: ${error.message}`
      );
    }
  }

  private async checkFrontendAssets(): Promise<void> {
    try {
      const response = await fetch('http://localhost:5000/');
      if (response.ok) {
        const html = await response.text();
        
        // Vérifier la présence des assets CSS/JS critiques
        const hasReactApp = html.includes('id="root"');
        const hasViteAssets = html.includes('/assets/') || html.includes('type="module"');
        
        if (hasReactApp && hasViteAssets) {
          this.addResult('Frontend Assets', 'healthy', 
            'Assets frontend correctement chargés'
          );
        } else {
          this.addResult('Frontend Assets', 'warning', 
            'Assets frontend potentiellement manquants'
          );
        }
      } else {
        this.addResult('Frontend Assets', 'critical', 
          `Frontend inaccessible: ${response.status}`
        );
      }
    } catch (error) {
      this.addResult('Frontend Assets', 'critical', 
        `Erreur frontend: ${error.message}`
      );
    }
  }

  private async checkEnvironmentVariables(): Promise<void> {
    const requiredVars = ['DATABASE_URL', 'NODE_ENV'];
    const optionalVars = ['GEMINI_API_KEY', 'PORT'];
    const missing = [];
    const present = [];

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        present.push(varName);
      } else {
        missing.push(varName);
      }
    }

    for (const varName of optionalVars) {
      if (process.env[varName]) {
        present.push(`${varName} (optional)`);
      }
    }

    if (missing.length > 0) {
      this.addResult('Environment Variables', 'critical', 
        `Variables manquantes: ${missing.join(', ')}`, 
        { missing, present }
      );
    } else {
      this.addResult('Environment Variables', 'healthy', 
        `Toutes les variables requises sont présentes`, 
        { present }
      );
    }
  }

  private async checkPerformanceMetrics(): Promise<void> {
    try {
      const response = await fetch('http://localhost:5000/api/performance');
      if (response.ok) {
        const metrics = await response.json();
        
        const memoryUsageMB = metrics.memory?.used_mb || 0;
        const uptime = metrics.server_uptime || 0;
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        let message = 'Performance optimale';
        
        if (memoryUsageMB > 512) {
          status = 'warning';
          message = `Usage mémoire élevé: ${memoryUsageMB}MB`;
        }
        
        if (memoryUsageMB > 1024) {
          status = 'critical';
          message = `Usage mémoire critique: ${memoryUsageMB}MB`;
        }
        
        this.addResult('Performance Metrics', status, message, {
          memory_mb: memoryUsageMB,
          uptime_seconds: uptime,
          performance: metrics.performance
        });
        
      } else {
        this.addResult('Performance Metrics', 'warning', 
          'Métriques de performance inaccessibles'
        );
      }
    } catch (error) {
      this.addResult('Performance Metrics', 'critical', 
        `Erreur métriques: ${error.message}`
      );
    }
  }

  private async checkSecurityHeaders(): Promise<void> {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const headers = response.headers;
      
      const securityHeaders = {
        'cache-control': headers.get('cache-control'),
        'content-type': headers.get('content-type'),
        'x-powered-by': headers.get('x-powered-by') // Should be hidden
      };
      
      const issues = [];
      if (securityHeaders['x-powered-by']) {
        issues.push('X-Powered-By header exposed');
      }
      
      if (!securityHeaders['cache-control']) {
        issues.push('Cache-Control header missing');
      }
      
      if (issues.length > 0) {
        this.addResult('Security Headers', 'warning', 
          `Problèmes sécurité: ${issues.join(', ')}`, 
          { headers: securityHeaders }
        );
      } else {
        this.addResult('Security Headers', 'healthy', 
          'Headers de sécurité corrects'
        );
      }
      
    } catch (error) {
      this.addResult('Security Headers', 'critical', 
        `Erreur vérification sécurité: ${error.message}`
      );
    }
  }

  private async checkMissionWorkflow(): Promise<void> {
    try {
      // Test création d'une mission
      const testMissionData = {
        title: `TEST HEALTH CHECK ${Date.now()}`,
        description: 'Mission de test pour vérifier le workflow complet',
        category: 'test',
        budget_min: 100000,
        budget_max: 200000,
        location: 'Test Location',
        user_id: 3, // Admin user
        client_id: 3,
        status: 'draft'
      };

      const response = await fetch('http://localhost:5000/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMissionData)
      });

      if (response.ok) {
        const createdMission = await response.json();
        
        // Vérifier que la mission existe en DB
        const missionInDb = await db
          .select()
          .from(missions)
          .where(eq(missions.id, createdMission.id))
          .limit(1);

        if (missionInDb.length > 0) {
          // Nettoyer la mission de test
          await db.delete(missions).where(eq(missions.id, createdMission.id));
          
          this.addResult('Mission Workflow', 'healthy', 
            'Workflow de création fonctionnel'
          );
        } else {
          this.addResult('Mission Workflow', 'critical', 
            'Mission créée via API mais non trouvée en DB'
          );
        }
      } else {
        const errorText = await response.text();
        this.addResult('Mission Workflow', 'critical', 
          `Échec création mission: ${response.status} - ${errorText.substring(0, 100)}`
        );
      }

    } catch (error) {
      this.addResult('Mission Workflow', 'critical', 
        `Erreur test workflow: ${error.message}`
      );
    }
  }

  private async checkUserAuthentication(): Promise<void> {
    try {
      // Vérifier que l'utilisateur admin existe
      const adminUser = await db
        .select()
        .from(users)
        .where(eq(users.email, 'admin@swideal.com'))
        .limit(1);

      if (adminUser.length > 0 && adminUser[0].role === 'ADMIN') {
        this.addResult('User Authentication', 'healthy', 
          `Utilisateur admin actif (ID: ${adminUser[0].id})`
        );
      } else {
        this.addResult('User Authentication', 'warning', 
          'Utilisateur admin manquant ou rôle incorrect'
        );
      }

    } catch (error) {
      this.addResult('User Authentication', 'critical', 
        `Erreur vérification utilisateur: ${error.message}`
      );
    }
  }

  private async checkErrorRates(): Promise<void> {
    // Simuler quelques requêtes pour vérifier le taux d'erreur
    const testEndpoints = [
      '/api/missions',
      '/api/health',
      '/api/missions/users/3/missions'
    ];

    let successCount = 0;
    let totalRequests = 0;

    for (const endpoint of testEndpoints) {
      for (let i = 0; i < 3; i++) { // 3 requêtes par endpoint
        totalRequests++;
        try {
          const response = await fetch(`http://localhost:5000${endpoint}`);
          if (response.ok) successCount++;
        } catch (error) {
          // Erreur comptée comme échec
        }
      }
    }

    const successRate = (successCount / totalRequests) * 100;
    
    if (successRate >= 95) {
      this.addResult('Error Rates', 'healthy', 
        `Taux de succès: ${successRate.toFixed(1)}%`, 
        { success: successCount, total: totalRequests }
      );
    } else if (successRate >= 80) {
      this.addResult('Error Rates', 'warning', 
        `Taux de succès modéré: ${successRate.toFixed(1)}%`, 
        { success: successCount, total: totalRequests }
      );
    } else {
      this.addResult('Error Rates', 'critical', 
        `Taux d'échec élevé: ${(100 - successRate).toFixed(1)}%`, 
        { success: successCount, total: totalRequests }
      );
    }
  }

  private addResult(component: string, status: 'healthy' | 'warning' | 'critical', message: string, details?: any, responseTime?: number): void {
    this.results.push({ component, status, message, details, response_time: responseTime });
  }

  private printHealthReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT DE SANTÉ PRODUCTION - SwipDEAL');
    console.log('='.repeat(80));

    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    // Grouper par statut
    for (const result of this.results) {
      const icon = {
        'healthy': '✅',
        'warning': '⚠️',
        'critical': '❌'
      }[result.status];

      const timing = result.response_time ? ` (${result.response_time}ms)` : '';
      
      console.log(`${icon} ${result.component}: ${result.message}${timing}`);
      
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   📋 Détails: ${JSON.stringify(result.details)}`);
      }

      if (result.status === 'healthy') healthyCount++;
      else if (result.status === 'warning') warningCount++;
      else criticalCount++;
    }

    console.log('\n' + '-'.repeat(80));
    console.log(`📈 BILAN GLOBAL:`);
    console.log(`   ✅ Sain: ${healthyCount} composants`);
    console.log(`   ⚠️  Attention: ${warningCount} composants`);
    console.log(`   ❌ Critique: ${criticalCount} composants`);

    const totalScore = ((healthyCount * 3 + warningCount * 1) / (this.results.length * 3)) * 100;
    console.log(`   📊 Score de santé: ${totalScore.toFixed(1)}%`);

    if (criticalCount === 0 && warningCount === 0) {
      console.log('\n🎉 SYSTÈME EN PARFAITE SANTÉ !');
    } else if (criticalCount === 0) {
      console.log('\n👍 SYSTÈME OPÉRATIONNEL - Optimisations recommandées');
    } else {
      console.log('\n🚨 ACTIONS CORRECTRICES REQUISES IMMÉDIATEMENT');
    }

    console.log('='.repeat(80));
  }

  async cleanup(): Promise<void> {
    await this.pool.end();
  }
}

// Fonction d'exécution
export async function runProductionHealthCheck(): Promise<void> {
  const checker = new ProductionHealthChecker();
  try {
    await checker.runCompleteHealthCheck();
  } finally {
    await checker.cleanup();
  }
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runProductionHealthCheck()
    .then(() => {
      console.log('\n✅ Diagnostic complet terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur lors du diagnostic:', error);
      process.exit(1);
    });
}
