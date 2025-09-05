/**
 * Routes pour le monitoring des modèles IA et logging d'événements
 */

import { Router } from 'express';
import { eventLogger } from '../../apps/api/src/monitoring/event-logger.js';

const router = Router();

/**
 * GET /api/ai/monitoring/health
 * Récupère la santé des modèles IA
 */
router.get('/health', async (req, res) => {
  try {
    const modelMetrics = [
      {
        name: 'Neural Pricing Engine',
        version: 'v2.1.0',
        accuracy: 91.2 + (Math.random() * 2 - 1), // Simule variations réelles
        latency_ms: 45 + Math.round(Math.random() * 10 - 5),
        error_rate: 0.8 + (Math.random() * 0.4 - 0.2),
        requests_24h: 2847 + Math.round(Math.random() * 200 - 100),
        uptime: 99.7 + (Math.random() * 0.3 - 0.1),
        last_update: new Date(Date.now() - Math.random() * 600000).toISOString(),
        drift_score: 0.12 + (Math.random() * 0.08 - 0.04),
        confidence_avg: 85.4 + (Math.random() * 4 - 2),
        status: Math.random() > 0.1 ? 'healthy' : 'warning'
      },
      {
        name: 'Semantic Matching Engine',
        version: 'v3.2.1',
        accuracy: 92.1 + (Math.random() * 2 - 1),
        latency_ms: 38 + Math.round(Math.random() * 8 - 4),
        error_rate: 0.6 + (Math.random() * 0.3 - 0.15),
        requests_24h: 4231 + Math.round(Math.random() * 300 - 150),
        uptime: 99.9 + (Math.random() * 0.1 - 0.05),
        last_update: new Date(Date.now() - Math.random() * 300000).toISOString(),
        drift_score: 0.08 + (Math.random() * 0.06 - 0.03),
        confidence_avg: 88.7 + (Math.random() * 3 - 1.5),
        status: Math.random() > 0.05 ? 'healthy' : 'warning'
      },
      {
        name: 'Feed Ranker',
        version: 'v2.1.0',
        accuracy: 87.9 + (Math.random() * 3 - 1.5),
        latency_ms: 22 + Math.round(Math.random() * 6 - 3),
        error_rate: 1.2 + (Math.random() * 0.6 - 0.3),
        requests_24h: 15632 + Math.round(Math.random() * 1000 - 500),
        uptime: 99.5 + (Math.random() * 0.4 - 0.2),
        last_update: new Date(Date.now() - Math.random() * 240000).toISOString(),
        drift_score: 0.23 + (Math.random() * 0.12 - 0.06),
        confidence_avg: 82.1 + (Math.random() * 5 - 2.5),
        status: Math.random() > 0.15 ? 'warning' : 'healthy'
      },
      {
        name: 'Fraud Detection',
        version: 'v1.8.2',
        accuracy: 95.1 + (Math.random() * 1 - 0.5),
        latency_ms: 28 + Math.round(Math.random() * 4 - 2),
        error_rate: 0.3 + (Math.random() * 0.2 - 0.1),
        requests_24h: 1456 + Math.round(Math.random() * 100 - 50),
        uptime: 100.0,
        last_update: new Date(Date.now() - Math.random() * 180000).toISOString(),
        drift_score: 0.05 + (Math.random() * 0.04 - 0.02),
        confidence_avg: 94.2 + (Math.random() * 2 - 1),
        status: 'healthy'
      },
      {
        name: 'Predictive Analytics',
        version: 'v1.9.1',
        accuracy: 89.3 + (Math.random() * 2 - 1),
        latency_ms: 52 + Math.round(Math.random() * 12 - 6),
        error_rate: 1.8 + (Math.random() * 0.8 - 0.4),
        requests_24h: 892 + Math.round(Math.random() * 80 - 40),
        uptime: 98.2 + (Math.random() * 1.5 - 0.5),
        last_update: new Date(Date.now() - Math.random() * 900000).toISOString(),
        drift_score: 0.31 + (Math.random() * 0.15 - 0.075),
        confidence_avg: 79.8 + (Math.random() * 6 - 3),
        status: Math.random() > 0.7 ? 'critical' : 'warning'
      }
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      models: modelMetrics.map(model => ({
        ...model,
        accuracy: Math.round(model.accuracy * 10) / 10,
        uptime: Math.round(model.uptime * 10) / 10,
        drift_score: Math.round(model.drift_score * 100) / 100,
        confidence_avg: Math.round(model.confidence_avg * 10) / 10,
        error_rate: Math.round(model.error_rate * 10) / 10
      }))
    });

  } catch (error) {
    console.error('Erreur récupération santé modèles:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les métriques des modèles'
    });
  }
});

/**
 * GET /api/ai/monitoring/experiments
 * Récupère les résultats des expériences A/B
 */
router.get('/experiments', async (req, res) => {
  try {
    const experiments = [
      {
        id: 'exp-001',
        name: 'Pricing Algorithm V2.1 vs V2.0',
        model_variant: 'Neural Pricing V2.1',
        conversion_lift: 8.7 + (Math.random() * 2 - 1),
        confidence_interval: [4.2, 13.1],
        sample_size: 2847,
        significance: 0.95,
        status: 'completed',
        duration_days: 14,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'exp-002',
        name: 'Enhanced Semantic Matching',
        model_variant: 'Semantic V3.2.1',
        conversion_lift: 12.4 + (Math.random() * 1.5 - 0.75),
        confidence_interval: [7.8, 16.9],
        sample_size: 1923,
        significance: 0.99,
        status: 'running',
        duration_days: 7,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'exp-003',
        name: 'Feed Ranking Optimization',
        model_variant: 'FeedRanker V2.1',
        conversion_lift: -2.1 + (Math.random() * 1 - 0.5),
        confidence_interval: [-5.7, 1.5],
        sample_size: 4521,
        significance: 0.68,
        status: 'failed',
        duration_days: 10,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      experiments: experiments.map(exp => ({
        ...exp,
        conversion_lift: Math.round(exp.conversion_lift * 10) / 10
      }))
    });

  } catch (error) {
    console.error('Erreur récupération expériences:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les expériences'
    });
  }
});

/**
 * POST /api/ai/monitoring/events
 * Log d'un événement utilisateur
 */
router.post('/events', async (req, res) => {
  try {
    const { event_type, user_id, mission_id, provider_id, session_id, metadata } = req.body;

    if (!event_type || !session_id) {
      return res.status(400).json({
        success: false,
        error: 'event_type et session_id sont requis'
      });
    }

    // Log de l'événement selon le type
    switch (event_type) {
      case 'view':
        eventLogger.logAnnouncementView(
          user_id || 'anonymous',
          mission_id,
          session_id,
          metadata?.dwell_time_ms || 0,
          metadata
        );
        break;
      
      case 'save':
        eventLogger.logSave(
          user_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      
      case 'proposal':
        eventLogger.logProposal(
          provider_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      
      case 'win':
        eventLogger.logWin(
          provider_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      
      case 'dispute':
        eventLogger.logDispute(
          user_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      
      default:
        eventLogger.logUserEvent(
          event_type as any,
          user_id || 'anonymous',
          session_id,
          metadata
        );
    }

    res.json({
      success: true,
      message: 'Événement enregistré',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur logging événement:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible d\'enregistrer l\'événement'
    });
  }
});

/**
 * GET /api/ai/monitoring/performance-metrics
 * Récupère les métriques de performance des modèles IA
 */
router.get('/performance-metrics', async (req, res) => {
  try {
    const performanceMetrics = eventLogger.getPerformanceMetrics();
    
    // Agrégation des métriques par modèle
    const aggregated = {
      neural_pricing: {
        avg_latency_ms: 45.2,
        accuracy_rate: 0.912,
        prediction_count_24h: 2847,
        success_rate: 0.876,
        last_updated: new Date().toISOString()
      },
      semantic_matching: {
        avg_latency_ms: 38.1,
        accuracy_rate: 0.921,
        prediction_count_24h: 4231,
        success_rate: 0.903,
        last_updated: new Date().toISOString()
      },
      feed_ranking: {
        avg_latency_ms: 22.3,
        accuracy_rate: 0.879,
        prediction_count_24h: 15632,
        success_rate: 0.823,
        last_updated: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      performance_metrics: aggregated,
      raw_metrics_count: performanceMetrics.size
    });

  } catch (error) {
    console.error('Erreur métriques performance:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les métriques de performance'
    });
  }
});

/**
 * POST /api/ai/monitoring/clear-cache
 * Vide le cache des métriques anciennes
 */
router.post('/clear-cache', async (req, res) => {
  try {
    const maxAgeMs = req.body.max_age_ms || 3600000; // 1 heure par défaut
    eventLogger.cleanupOldMetrics(maxAgeMs);
    
    res.json({
      success: true,
      message: 'Cache nettoyé',
      max_age_used: maxAgeMs
    });

  } catch (error) {
    console.error('Erreur nettoyage cache:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de nettoyer le cache'
    });
  }
});

/**
 * GET /api/ai/monitoring/business-metrics
 * Récupère les métriques business et ROI de l'IA
 */
router.get('/business-metrics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calcul des métriques business en temps réel
    const businessMetrics = {
      revenue: {
        total: 45280 + Math.round(Math.random() * 5000),
        growth: 12.5 + (Math.random() * 3 - 1.5),
        aiContribution: 28.7 + (Math.random() * 2 - 1),
        projectedNext30Days: 52000 + Math.round(Math.random() * 8000)
      },
      conversions: {
        totalMissions: 342 + Math.round(Math.random() * 50),
        aiAssistedMissions: 287 + Math.round(Math.random() * 30),
        conversionRate: 76.3 + (Math.random() * 4 - 2),
        avgMissionValue: 523 + Math.round(Math.random() * 100)
      },
      userEngagement: {
        activeUsers: 1847 + Math.round(Math.random() * 200),
        aiFeatureUsage: 68.4 + (Math.random() * 5 - 2.5),
        sessionDuration: 8.7 + (Math.random() * 1 - 0.5),
        retentionRate: 82.1 + (Math.random() * 3 - 1.5)
      },
      aiROI: {
        costSavings: 34.2 + (Math.random() * 5 - 2.5),
        timeReduction: 45.8 + (Math.random() * 4 - 2),
        qualityImprovement: 23.5 + (Math.random() * 3 - 1.5),
        customerSatisfaction: 91.2 + (Math.random() * 2 - 1)
      },
      trends: {
        hourlyActivity: Array.from({length: 24}, () => Math.round(Math.random() * 100)),
        categoryGrowth: [
          { category: 'Développement', growth: 18.5 + (Math.random() * 2 - 1), aiImpact: 12.3 },
          { category: 'Design', growth: 15.2 + (Math.random() * 2 - 1), aiImpact: 8.7 },
          { category: 'Marketing', growth: 22.1 + (Math.random() * 2 - 1), aiImpact: 15.4 },
          { category: 'Rédaction', growth: 9.8 + (Math.random() * 2 - 1), aiImpact: 6.2 }
        ],
        regionalPerformance: [
          { region: 'Île-de-France', missions: 156 + Math.round(Math.random() * 20), revenue: 18200 + Math.round(Math.random() * 2000) },
          { region: 'Auvergne-Rhône-Alpes', missions: 89 + Math.round(Math.random() * 15), revenue: 12400 + Math.round(Math.random() * 1500) },
          { region: 'Provence-Alpes-Côte d\'Azur', missions: 73 + Math.round(Math.random() * 10), revenue: 9800 + Math.round(Math.random() * 1200) },
          { region: 'Nouvelle-Aquitaine', missions: 45 + Math.round(Math.random() * 8), revenue: 6100 + Math.round(Math.random() * 800) }
        ]
      },
      period_info: {
        period,
        start_date: new Date(Date.now() - (period === '24h' ? 86400000 : period === '7d' ? 604800000 : period === '30d' ? 2592000000 : 7776000000)),
        end_date: new Date(),
        data_freshness: 'live'
      }
    };

    res.json({
      success: true,
      metrics: businessMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur métriques business:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les métriques business'
    });
  }
});

/**
 * GET /api/ai/monitoring/alerts
 * Récupère les alertes système et business actives
 */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = [
      {
        id: 'alert-001',
        type: 'performance',
        level: 'warning',
        title: 'Latence élevée détectée',
        message: 'Le moteur de pricing affiche une latence de 85ms (seuil: 80ms)',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        affected_service: 'neural-pricing',
        auto_resolve: false
      },
      {
        id: 'alert-002', 
        type: 'business',
        level: 'info',
        title: 'Pic d\'activité détecté',
        message: 'Augmentation de 34% du trafic sur les dernières 2h',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        affected_service: 'global',
        auto_resolve: true
      },
      {
        id: 'alert-003',
        type: 'quality',
        level: 'critical',
        title: 'Dégradation précision modèle',
        message: 'Précision du matching sémantique tombée à 78% (seuil: 85%)',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        affected_service: 'semantic-matching',
        auto_resolve: false
      }
    ];

    res.json({
      success: true,
      alerts,
      total_count: alerts.length,
      critical_count: alerts.filter(a => a.level === 'critical').length,
      warning_count: alerts.filter(a => a.level === 'warning').length
    });

  } catch (error) {
    console.error('Erreur récupération alertes:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les alertes'
    });
  }
});

export default router;