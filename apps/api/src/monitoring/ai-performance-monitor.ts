/**
 * Moniteur de performance IA - AppelsPro
 * Surveille et optimise les performances de tous les moteurs IA
 */

interface AIEngineMetrics {
  engine_name: string;
  total_requests: number;
  avg_response_time_ms: number;
  success_rate: number;
  accuracy_score: number;
  cache_hit_rate: number;
  memory_usage_mb: number;
  last_update: string;
  status: 'healthy' | 'degraded' | 'critical';
}

interface SystemMetrics {
  total_ai_requests: number;
  avg_system_latency: number;
  error_rate: number;
  cache_efficiency: number;
  ml_service_status: boolean;
  uptime_hours: number;
}

export class AIPerformanceMonitor {
  private metrics: Map<string, AIEngineMetrics> = new Map();
  private systemMetrics: SystemMetrics;
  private startTime: number;
  private alertThresholds = {
    max_response_time: 100, // ms
    min_success_rate: 95, // %
    min_accuracy: 85, // %
    max_error_rate: 5 // %
  };

  constructor() {
    this.startTime = Date.now();
    this.systemMetrics = {
      total_ai_requests: 0,
      avg_system_latency: 0,
      error_rate: 0,
      cache_efficiency: 0,
      ml_service_status: false,
      uptime_hours: 0
    };

    // Initialisation des métriques pour chaque moteur
    this.initializeEngineMetrics();
    
    // Vérification périodique de la santé
    setInterval(() => this.performHealthCheck(), 30000); // Toutes les 30s
  }

  /**
   * Enregistre une requête IA
   */
  recordRequest(engineName: string, responseTime: number, success: boolean, accuracy?: number) {
    const engine = this.metrics.get(engineName);
    if (!engine) return;

    // Mise à jour des métriques du moteur
    engine.total_requests++;
    engine.avg_response_time_ms = 
      (engine.avg_response_time_ms + responseTime) / 2;
    
    if (success) {
      engine.success_rate = 
        ((engine.success_rate * (engine.total_requests - 1)) + 100) / engine.total_requests;
    } else {
      engine.success_rate = 
        ((engine.success_rate * (engine.total_requests - 1)) + 0) / engine.total_requests;
    }

    if (accuracy !== undefined) {
      engine.accuracy_score = 
        (engine.accuracy_score + accuracy) / 2;
    }

    engine.last_update = new Date().toISOString();
    engine.status = this.calculateEngineStatus(engine);

    // Mise à jour des métriques système
    this.updateSystemMetrics();

    // Vérification des seuils d'alerte
    this.checkAlerts(engineName, engine);
  }

  /**
   * Enregistre un hit de cache
   */
  recordCacheHit(engineName: string) {
    const engine = this.metrics.get(engineName);
    if (engine) {
      const totalRequests = engine.total_requests + 1;
      const cacheHits = Math.round(engine.cache_hit_rate * engine.total_requests / 100) + 1;
      engine.cache_hit_rate = (cacheHits / totalRequests) * 100;
    }
  }

  /**
   * Obtient toutes les métriques
   */
  getAllMetrics(): {
    engines: AIEngineMetrics[];
    system: SystemMetrics;
    alerts: string[];
  } {
    const engines = Array.from(this.metrics.values());
    const alerts = this.getActiveAlerts();

    return {
      engines,
      system: {
        ...this.systemMetrics,
        uptime_hours: (Date.now() - this.startTime) / (1000 * 60 * 60)
      },
      alerts
    };
  }

  /**
   * Optimise automatiquement les performances
   */
  async optimizePerformance(): Promise<string[]> {
    const optimizations: string[] = [];

    for (const [engineName, metrics] of this.metrics) {
      // Optimisation du cache si le taux est faible
      if (metrics.cache_hit_rate < 60) {
        optimizations.push(`${engineName}: Cache strategy needs improvement (${metrics.cache_hit_rate.toFixed(1)}%)`);
      }

      // Optimisation de la latence
      if (metrics.avg_response_time_ms > this.alertThresholds.max_response_time) {
        optimizations.push(`${engineName}: Response time optimization needed (${metrics.avg_response_time_ms.toFixed(1)}ms)`);
      }

      // Optimisation de la précision
      if (metrics.accuracy_score < this.alertThresholds.min_accuracy) {
        optimizations.push(`${engineName}: Model accuracy needs retraining (${metrics.accuracy_score.toFixed(1)}%)`);
      }
    }

    return optimizations;
  }

  /**
   * Réinitialise toutes les métriques
   */
  resetMetrics() {
    this.initializeEngineMetrics();
    this.systemMetrics = {
      total_ai_requests: 0,
      avg_system_latency: 0,
      error_rate: 0,
      cache_efficiency: 0,
      ml_service_status: false,
      uptime_hours: 0
    };
    console.log('📊 AI Performance Monitor: Metrics reset');
  }

  // Méthodes privées

  private initializeEngineMetrics() {
    const engines = [
      'neural-pricing',
      'semantic-matching', 
      'predictive-analytics',
      'fraud-detection',
      'trust-scoring'
    ];

    engines.forEach(name => {
      this.metrics.set(name, {
        engine_name: name,
        total_requests: 0,
        avg_response_time_ms: 0,
        success_rate: 100,
        accuracy_score: 90,
        cache_hit_rate: 0,
        memory_usage_mb: 0,
        last_update: new Date().toISOString(),
        status: 'healthy'
      });
    });
  }

  private calculateEngineStatus(metrics: AIEngineMetrics): 'healthy' | 'degraded' | 'critical' {
    const issues: string[] = [];

    if (metrics.avg_response_time_ms > this.alertThresholds.max_response_time) issues.push('latency');
    if (metrics.success_rate < this.alertThresholds.min_success_rate) issues.push('reliability');
    if (metrics.accuracy_score < this.alertThresholds.min_accuracy) issues.push('accuracy');

    if (issues.length >= 2) return 'critical';
    if (issues.length === 1) return 'degraded';
    return 'healthy';
  }

  private updateSystemMetrics() {
    const engines = Array.from(this.metrics.values());
    
    this.systemMetrics.total_ai_requests = engines.reduce((sum, e) => sum + e.total_requests, 0);
    this.systemMetrics.avg_system_latency = engines.reduce((sum, e) => sum + e.avg_response_time_ms, 0) / engines.length;
    this.systemMetrics.cache_efficiency = engines.reduce((sum, e) => sum + e.cache_hit_rate, 0) / engines.length;
    
    const successfulRequests = engines.reduce((sum, e) => sum + (e.total_requests * e.success_rate / 100), 0);
    this.systemMetrics.error_rate = this.systemMetrics.total_ai_requests > 0 ? 
      ((this.systemMetrics.total_ai_requests - successfulRequests) / this.systemMetrics.total_ai_requests) * 100 : 0;
  }

  private async performHealthCheck() {
    try {
      // Vérification du service ML Python
      const response = await fetch('http://localhost:8001/health');
      this.systemMetrics.ml_service_status = response.ok;
    } catch (error) {
      this.systemMetrics.ml_service_status = false;
    }
  }

  private checkAlerts(engineName: string, metrics: AIEngineMetrics) {

    if (metrics.avg_response_time_ms > this.alertThresholds.max_response_time) {
      console.warn(`⚠️  ${engineName}: High latency detected (${metrics.avg_response_time_ms.toFixed(1)}ms)`);
    }

    if (metrics.success_rate < this.alertThresholds.min_success_rate) {
      console.error(`🚨 ${engineName}: Low success rate (${metrics.success_rate.toFixed(1)}%)`);
    }

    if (metrics.accuracy_score < this.alertThresholds.min_accuracy) {
      console.warn(`⚠️  ${engineName}: Low accuracy (${metrics.accuracy_score.toFixed(1)}%)`);
    }
  }

  private getActiveAlerts(): string[] {
    const alerts: string[] = [];
    
    for (const [name, metrics] of this.metrics) {
      if (metrics.status === 'critical') {
        alerts.push(`${name}: Critical performance issues detected`);
      } else if (metrics.status === 'degraded') {
        alerts.push(`${name}: Performance degradation detected`);
      }
    }

    if (!this.systemMetrics.ml_service_status) {
      alerts.push('ML Service: Python service unavailable');
    }

    return alerts;
  }
}

export const aiPerformanceMonitor = new AIPerformanceMonitor();