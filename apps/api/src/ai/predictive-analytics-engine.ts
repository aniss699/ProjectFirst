/**
 * Moteur d'Analytics Simplifié pour SwipDEAL
 * Système basique de statistiques et métriques
 */

interface AnalyticsRequest {
  time_range: {
    start_date: string;
    end_date: string;
    granularity: 'hour' | 'day' | 'week' | 'month';
  };
  scope: {
    categories?: string[];
    regions?: string[];
    user_segments?: string[];
    price_ranges?: Array<{min: number, max: number}>;
  };
  metrics: string[];
  prediction_horizon: number; // jours dans le futur
}

interface SimpleAnalytics {
  // Métriques simples
  basic_metrics: {
    total_missions: number;
    total_providers: number;
    total_clients: number;
    average_mission_value: number;
    mission_success_rate: number;
    platform_revenue: number;
  };
  
  // Analytics par catégorie
  category_stats: Array<{
    category: string;
    mission_count: number;
    avg_price: number;
    completion_rate: number;
    demand_trend: 'up' | 'down' | 'stable';
  }>;
  
  // Métriques temps réel basiques
  realtime_metrics: {
    active_missions: number;
    active_providers: number;
    daily_new_missions: number;
    daily_completed_missions: number;
  };
  
  // Tendances simples (basées sur comparaison période précédente)
  simple_trends: {
    missions_growth_percent: number;
    revenue_growth_percent: number;
    provider_growth_percent: number;
    client_satisfaction_avg: number;
  };
  
  // Recommandations basiques
  basic_recommendations: Array<{
    type: 'category_focus' | 'pricing_adjustment' | 'provider_recruitment';
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export class SimpleAnalyticsEngine {
  private mockData: any;

  constructor() {
    // Données simulées pour les analytics
    this.mockData = {
      categories: ['web-development', 'mobile-development', 'design', 'marketing', 'consulting'],
      missions_per_category: new Map([
        ['web-development', { count: 150, avg_price: 800, completion_rate: 0.85 }],
        ['mobile-development', { count: 80, avg_price: 1200, completion_rate: 0.90 }],
        ['design', { count: 200, avg_price: 400, completion_rate: 0.92 }],
        ['marketing', { count: 120, avg_price: 600, completion_rate: 0.88 }],
        ['consulting', { count: 90, avg_price: 1000, completion_rate: 0.83 }]
      ])
    };
  }

  /**
   * Génère des analytics simples (pas de prédictions complexes)
   */
  async generateSimpleAnalytics(request: AnalyticsRequest): Promise<SimpleAnalytics> {
    console.log('📊 Simple Analytics Engine: Generating basic stats...');
    
    // Métriques basiques simulées
    const basicMetrics = this.calculateBasicMetrics();
    
    // Stats par catégorie
    const categoryStats = this.calculateCategoryStats(request.scope.categories);
    
    // Métriques temps réel simulées
    const realtimeMetrics = this.getRealtimeMetrics();
    
    // Tendances simples (comparaison avec période précédente)
    const simpleTrends = this.calculateSimpleTrends();
    
    // Recommandations basiques
    const basicRecommendations = this.generateBasicRecommendations(categoryStats);

    return {
      basic_metrics: basicMetrics,
      category_stats: categoryStats,
      realtime_metrics: realtimeMetrics,
      simple_trends: simpleTrends,
      basic_recommendations: basicRecommendations
    };
  }

  private calculateBasicMetrics() {
    // Calculs basiques sans IA
    const totalMissions = Array.from(this.mockData.missions_per_category.values())
      .reduce((sum: number, cat: any) => sum + cat.count, 0);
    
    const totalRevenue = Array.from(this.mockData.missions_per_category.values())
      .reduce((sum: number, cat: any) => sum + (cat.count * cat.avg_price * cat.completion_rate), 0);
    
    const avgValue = totalRevenue / totalMissions;
    
    const avgCompletionRate = Array.from(this.mockData.missions_per_category.values())
      .reduce((sum: number, cat: any) => sum + cat.completion_rate, 0) / this.mockData.missions_per_category.size;

    return {
      total_missions: totalMissions,
      total_providers: Math.round(totalMissions * 0.6), // Estimation simple
      total_clients: Math.round(totalMissions * 0.8), // Estimation simple  
      average_mission_value: Math.round(avgValue),
      mission_success_rate: Math.round(avgCompletionRate * 100) / 100,
      platform_revenue: Math.round(totalRevenue)
    };
  }

  private calculateCategoryStats(filteredCategories?: string[]) {
    const categories = filteredCategories || this.mockData.categories;
    
    return categories.map(category => {
      const data = this.mockData.missions_per_category.get(category);
      if (!data) {
        return {
          category,
          mission_count: 0,
          avg_price: 0,
          completion_rate: 0,
          demand_trend: 'stable' as const
        };
      }

      // Tendance simulée basée sur des règles simples
      let demandTrend: 'up' | 'down' | 'stable' = 'stable';
      if (data.completion_rate > 0.90) demandTrend = 'up';
      if (data.completion_rate < 0.80) demandTrend = 'down';

      return {
        category,
        mission_count: data.count,
        avg_price: data.avg_price,
        completion_rate: data.completion_rate,
        demand_trend: demandTrend
      };
    });
  }

  private getRealtimeMetrics() {
    // Métriques temps réel simulées
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isBusinessHours = now.getHours() >= 9 && now.getHours() <= 17;
    
    // Ajustements basiques selon l'heure/jour
    let activityMultiplier = 1.0;
    if (isWeekend) activityMultiplier *= 0.4;
    if (!isBusinessHours) activityMultiplier *= 0.6;

    return {
      active_missions: Math.round(45 * activityMultiplier),
      active_providers: Math.round(120 * activityMultiplier),
      daily_new_missions: Math.round(25 * activityMultiplier),
      daily_completed_missions: Math.round(18 * activityMultiplier)
    };
  }

  private calculateSimpleTrends() {
    // Tendances simulées basées sur des règles simples
    const baseGrowth = Math.random() * 10 - 5; // Entre -5% et +5%
    
    return {
      missions_growth_percent: Math.round((baseGrowth + 2) * 100) / 100, // Léger biais positif
      revenue_growth_percent: Math.round((baseGrowth + 3) * 100) / 100,
      provider_growth_percent: Math.round((baseGrowth + 1) * 100) / 100,
      client_satisfaction_avg: Math.round((4.2 + Math.random() * 0.6) * 100) / 100 // 4.2-4.8
    };
  }

  private generateBasicRecommendations(categoryStats: any[]) {
    const recommendations: Array<{
      type: 'category_focus' | 'pricing_adjustment' | 'provider_recruitment';
      description: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    // Recommandations basées sur les stats de catégories
    const highPerformingCategories = categoryStats.filter(cat => cat.completion_rate > 0.90);
    const lowPerformingCategories = categoryStats.filter(cat => cat.completion_rate < 0.80);

    if (highPerformingCategories.length > 0) {
      recommendations.push({
        type: 'category_focus' as const,
        description: `Focus sur ${highPerformingCategories[0].category} qui performe bien (${Math.round(highPerformingCategories[0].completion_rate * 100)}% de réussite)`,
        priority: 'high' as const
      });
    }

    if (lowPerformingCategories.length > 0) {
      recommendations.push({
        type: 'provider_recruitment' as const,
        description: `Recruter plus de prestataires en ${lowPerformingCategories[0].category} (taux de réussite faible: ${Math.round(lowPerformingCategories[0].completion_rate * 100)}%)`,
        priority: 'medium' as const
      });
    }

    // Recommandation prix si écarts importants
    const highPriceCategories = categoryStats.filter(cat => cat.avg_price > 1000);
    if (highPriceCategories.length > 0) {
      recommendations.push({
        type: 'pricing_adjustment' as const,
        description: `Revoir la stratégie tarifaire pour ${highPriceCategories[0].category} (prix moyen élevé: ${highPriceCategories[0].avg_price}€)`,
        priority: 'low' as const
      });
    }

    return recommendations;
  }

  // Méthode pour compatibilité avec l'ancien système
  async generatePredictiveInsights(request: AnalyticsRequest): Promise<any> {
    console.log('⚠️ Fallback: Using simple analytics instead of predictive insights');
    const simpleAnalytics = await this.generateSimpleAnalytics(request);
    
    // Transformation vers l'ancien format pour compatibilité
    return {
      market_predictions: {
        demand_forecast: [],
        price_trends: simpleAnalytics.category_stats.map(cat => ({
          category: cat.category,
          current_avg: cat.avg_price,
          predicted_avg: cat.avg_price * (1 + Math.random() * 0.1 - 0.05), // ±5% variation
          change_percent: Math.random() * 10 - 5,
          volatility: Math.random() * 0.3
        })),
        competition_analysis: {
          new_providers_forecast: Math.round(Math.random() * 10 + 5),
          market_saturation_risk: Math.random() * 0.5,
          opportunity_windows: []
        }
      },
      business_intelligence: {
        revenue_predictions: [],
        user_behavior_patterns: {
          client_acquisition_rate: Math.random() * 0.15 + 0.05,
          provider_retention_rate: Math.random() * 0.2 + 0.8,
          project_success_probability: simpleAnalytics.basic_metrics.mission_success_rate,
          seasonal_patterns: []
        },
        performance_kpis: {
          platform_efficiency: Math.random() * 0.2 + 0.8,
          matching_accuracy: Math.random() * 0.15 + 0.8,
          client_satisfaction_trend: simpleAnalytics.simple_trends.client_satisfaction_avg,
          provider_satisfaction_trend: Math.random() * 0.3 + 3.8
        }
      },
      strategic_recommendations: {
        market_opportunities: simpleAnalytics.basic_recommendations.map(rec => ({
          description: rec.description,
          potential_impact: rec.priority,
          timeframe: '1-3 months',
          required_actions: ['Analyse approfondie', 'Plan d\'action']
        })),
        risk_alerts: [],
        optimization_suggestions: []
      },
      realtime_metrics: simpleAnalytics.realtime_metrics,
      advanced_insights: {
        neural_predictions: [],
        anomaly_detection: [],
        trend_analysis: {
          emerging_technologies: ['IA', 'Blockchain', 'IoT'],
          declining_categories: [],
          price_movement_drivers: ['Demande', 'Concurrence'],
          seasonal_variations: []
        }
      }
    };
  }
}

// Export compatible avec l'ancien système  
export const predictiveAnalyticsEngine = new SimpleAnalyticsEngine();
export default predictiveAnalyticsEngine;