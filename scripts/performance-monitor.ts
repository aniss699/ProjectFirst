
#!/usr/bin/env tsx

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTimes: Map<string, number> = new Map();

  startTimer(name: string): void {
    const startTime = Date.now();
    this.startTimes.set(name, startTime);
    console.log(`⏱️  Started: ${name}`);
  }

  endTimer(name: string, success: boolean = true, error?: string): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.error(`❌ Timer '${name}' was not started`);
      return 0;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    this.metrics.push({
      name,
      startTime,
      endTime,
      duration,
      success,
      error
    });

    this.startTimes.delete(name);

    const status = success ? '✅' : '❌';
    console.log(`${status} Completed: ${name} (${duration}ms)`);
    
    return duration;
  }

  generateReport(): void {
    console.log('\n📊 RAPPORT DE PERFORMANCE');
    console.log('='.repeat(50));

    const totalMetrics = this.metrics.length;
    const successCount = this.metrics.filter(m => m.success).length;
    const failureCount = totalMetrics - successCount;

    console.log(`📈 Total des tests: ${totalMetrics}`);
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Échecs: ${failureCount}`);
    console.log(`📊 Taux de succès: ${((successCount / totalMetrics) * 100).toFixed(1)}%`);

    console.log('\n⏱️  TEMPS DE RÉPONSE:');
    this.metrics.forEach(metric => {
      if (metric.duration) {
        const status = metric.success ? '✅' : '❌';
        const performance = metric.duration < 200 ? '🚀' : metric.duration < 500 ? '⚡' : '🐌';
        console.log(`  ${status} ${performance} ${metric.name}: ${metric.duration}ms`);
        if (metric.error) {
          console.log(`     ↳ Error: ${metric.error}`);
        }
      }
    });

    // Analyse des performances
    const durations = this.metrics.filter(m => m.duration).map(m => m.duration!);
    if (durations.length > 0) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      console.log('\n📊 STATISTIQUES:');
      console.log(`  Temps moyen: ${avgDuration.toFixed(1)}ms`);
      console.log(`  Temps min: ${minDuration}ms`);
      console.log(`  Temps max: ${maxDuration}ms`);

      // Alertes de performance
      if (avgDuration > 500) {
        console.log('⚠️  ALERTE: Temps de réponse moyen élevé (>500ms)');
      }
      if (maxDuration > 1000) {
        console.log('🚨 ALERTE: Temps de réponse maximum critique (>1s)');
      }
    }

    console.log('\n' + '='.repeat(50));
  }

  async testMissionCreation(): Promise<void> {
    const API_BASE = 'http://0.0.0.0:5000';
    
    try {
      // Test 1: Health Check
      this.startTimer('health_check');
      const healthResponse = await fetch(`${API_BASE}/api/health`);
      this.endTimer('health_check', healthResponse.ok);

      // Test 2: Mission Creation
      this.startTimer('mission_creation');
      const missionData = {
        title: 'Test Performance Mission',
        description: 'Mission créée pour tester les performances du système',
        category: 'developpement',
        budget: 1500,
        location: 'Remote',
        userId: 1,
        urgency: 'medium',
        isTeamMode: false
      };

      const createResponse = await fetch(`${API_BASE}/api/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missionData)
      });

      const success = createResponse.ok;
      let error: string | undefined;
      
      if (!success) {
        const errorText = await createResponse.text();
        error = `HTTP ${createResponse.status}: ${errorText}`;
      }

      this.endTimer('mission_creation', success, error);

      // Test 3: Mission Retrieval
      if (success) {
        this.startTimer('mission_retrieval');
        const mission = await createResponse.json();
        
        const retrieveResponse = await fetch(`${API_BASE}/api/missions/${mission.id}`);
        this.endTimer('mission_retrieval', retrieveResponse.ok);
      }

      // Test 4: Missions Listing
      this.startTimer('missions_listing');
      const listResponse = await fetch(`${API_BASE}/api/missions`);
      this.endTimer('missions_listing', listResponse.ok);

    } catch (error) {
      console.error('❌ Test error:', error);
    }
  }

  async runPerformanceTests(): Promise<void> {
    console.log('🚀 DÉBUT DES TESTS DE PERFORMANCE');
    console.log('='.repeat(50));

    // Test la création de mission plusieurs fois
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔄 Test batch ${i}/3`);
      await this.testMissionCreation();
      
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.generateReport();
  }
}

// Exécution du monitoring
async function main() {
  const monitor = new PerformanceMonitor();
  await monitor.runPerformanceTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { PerformanceMonitor };
