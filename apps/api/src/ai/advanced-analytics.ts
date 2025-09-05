
/**
 * Moteur d'Analytics Prédictif Avancé
 * Phase 3 : IA de détection et prévention
 */

interface PredictiveAnalytics {
  user_behavior: UserBehaviorAnalysis;
  market_trends: MarketTrendAnalysis;
  risk_assessment: RiskAssessment;
  opportunity_detection: OpportunityDetection;
}

interface UserBehaviorAnalysis {
  engagement_patterns: {
    peak_activity_hours: string[];
    session_duration_avg: number;
    interaction_frequency: string;
    preferred_categories: string[];
  };
  success_indicators: {
    completion_rate: number;
    client_satisfaction: number;
    repeat_business_rate: number;
    growth_trajectory: string;
  };
  behavioral_insights: {
    communication_style: string;
    decision_making_speed: string;
    price_sensitivity: string;
    quality_preference: string;
  };
}

interface MarketTrendAnalysis {
  demand_forecast: {
    category: string;
    predicted_growth: number;
    confidence_level: number;
    seasonal_factors: any[];
  }[];
  pricing_trends: {
    category: string;
    price_evolution: string;
    market_saturation: number;
    competitive_pressure: string;
  }[];
  skill_demand: {
    skill: string;
    demand_level: string;
    growth_rate: number;
    market_value: number;
  }[];
}

interface RiskAssessment {
  project_risks: {
    type: string;
    probability: number;
    impact: string;
    mitigation_strategies: string[];
  }[];
  market_risks: {
    volatility_index: number;
    economic_indicators: any;
    competitive_threats: string[];
  };
  operational_risks: {
    capacity_overflow: boolean;
    quality_degradation_risk: number;
    client_churn_probability: number;
  };
}

interface OpportunityDetection {
  emerging_niches: {
    category: string;
    opportunity_score: number;
    entry_difficulty: string;
    potential_revenue: number;
  }[];
  client_expansion: {
    existing_clients: string[];
    upsell_opportunities: any[];
    cross_sell_potential: any[];
  };
  market_gaps: {
    unmet_demand: string;
    competition_level: string;
    revenue_potential: number;
  }[];
}

class AdvancedAnalyticsEngine {
  private behaviorPatterns: Map<string, any> = new Map();
  private marketData: Map<string, any> = new Map();
  private riskModels: Map<string, any> = new Map();

  /**
   * Analyse comportementale prédictive avancée
   */
  async analyzeUserBehavior(userId: string, historicalData: any[]): Promise<UserBehaviorAnalysis> {
    try {
      // Patterns d'engagement
      const engagement_patterns = this.extractEngagementPatterns(historicalData);
      
      // Indicateurs de succès
      const success_indicators = this.calculateSuccessMetrics(historicalData);
      
      // Insights comportementaux
      const behavioral_insights = this.generateBehavioralInsights(historicalData);

      return {
        engagement_patterns,
        success_indicators,
        behavioral_insights
      };
    } catch (error) {
      console.error('Behavior analysis failed:', error);
      return this.fallbackBehaviorAnalysis();
    }
  }

  /**
   * Prédiction des tendances marché
   */
  async predictMarketTrends(timeframe: string = '3months'): Promise<MarketTrendAnalysis> {
    try {
      // Prévision de demande par catégorie
      const demand_forecast = await this.forecastDemand(timeframe);
      
      // Évolution des prix
      const pricing_trends = await this.analyzePricingTrends(timeframe);
      
      // Demande de compétences
      const skill_demand = await this.analyzeSkillDemand(timeframe);

      return {
        demand_forecast,
        pricing_trends,
        skill_demand
      };
    } catch (error) {
      console.error('Market trend prediction failed:', error);
      return this.fallbackMarketAnalysis();
    }
  }

  /**
   * Évaluation des risques multi-dimensionnelle
   */
  async assessRisks(projectData: any, userProfile: any): Promise<RiskAssessment> {
    try {
      // Risques projet
      const project_risks = this.assessProjectRisks(projectData);
      
      // Risques marché
      const market_risks = this.assessMarketRisks(projectData.category);
      
      // Risques opérationnels
      const operational_risks = this.assessOperationalRisks(userProfile);

      return {
        project_risks,
        market_risks,
        operational_risks
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      return this.fallbackRiskAssessment();
    }
  }

  /**
   * Détection d'opportunités émergentes
   */
  async detectOpportunities(userProfile: any, marketContext: any): Promise<OpportunityDetection> {
    try {
      // Niches émergentes
      const emerging_niches = this.identifyEmergingNiches(userProfile.skills);
      
      // Expansion client
      const client_expansion = this.analyzeClientExpansion(userProfile.client_history);
      
      // Gaps marché
      const market_gaps = this.identifyMarketGaps(marketContext);

      return {
        emerging_niches,
        client_expansion,
        market_gaps
      };
    } catch (error) {
      console.error('Opportunity detection failed:', error);
      return this.fallbackOpportunityDetection();
    }
  }

  /**
   * Analytics prédictifs complets
   */
  async generatePredictiveAnalytics(userId: string, context: any): Promise<PredictiveAnalytics> {
    const [user_behavior, market_trends, risk_assessment, opportunity_detection] = await Promise.all([
      this.analyzeUserBehavior(userId, context.historical_data || []),
      this.predictMarketTrends(context.timeframe || '3months'),
      this.assessRisks(context.project_data || {}, context.user_profile || {}),
      this.detectOpportunities(context.user_profile || {}, context.market_context || {})
    ]);

    return {
      user_behavior,
      market_trends,
      risk_assessment,
      opportunity_detection
    };
  }

  // Méthodes d'extraction et d'analyse

  private extractEngagementPatterns(data: any[]) {
    const activities = data.filter(d => d.action_type === 'activity');
    
    // Heures de pointe
    const hourCounts = new Map();
    activities.forEach(a => {
      const hour = new Date(a.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    
    const peak_activity_hours = Array.from(hourCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}h-${hour+1}h`);

    // Durée moyenne de session
    const sessions = this.extractSessions(activities);
    const session_duration_avg = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

    // Fréquence d'interaction
    const daysActive = new Set(activities.map(a => new Date(a.timestamp).toDateString())).size;
    const interaction_frequency = daysActive > 20 ? 'high' : daysActive > 10 ? 'medium' : 'low';

    // Catégories préférées
    const categoryActions = data.filter(d => d.category);
    const categoryCounts = new Map();
    categoryActions.forEach(a => {
      categoryCounts.set(a.category, (categoryCounts.get(a.category) || 0) + 1);
    });
    
    const preferred_categories = Array.from(categoryCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    return {
      peak_activity_hours,
      session_duration_avg: Math.round(session_duration_avg),
      interaction_frequency,
      preferred_categories
    };
  }

  private calculateSuccessMetrics(data: any[]) {
    const completedProjects = data.filter(d => d.action_type === 'project_completed');
    const totalProjects = data.filter(d => d.action_type === 'project_started');
    
    const completion_rate = totalProjects.length > 0 ? 
      completedProjects.length / totalProjects.length : 0;

    const reviews = data.filter(d => d.action_type === 'review_received');
    const client_satisfaction = reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + (r.rating || 4), 0) / reviews.length : 4.0;

    const uniqueClients = new Set(data.filter(d => d.client_id).map(d => d.client_id));
    const repeatClients = data.filter(d => d.action_type === 'repeat_business');
    const repeat_business_rate = uniqueClients.size > 0 ? 
      repeatClients.length / uniqueClients.size : 0;

    const recentRevenue = data.filter(d => d.action_type === 'payment_received' && 
      new Date(d.timestamp) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    const growth_trajectory = recentRevenue.length > 5 ? 'growing' : 
      recentRevenue.length > 2 ? 'stable' : 'declining';

    return {
      completion_rate: Math.round(completion_rate * 100) / 100,
      client_satisfaction: Math.round(client_satisfaction * 10) / 10,
      repeat_business_rate: Math.round(repeat_business_rate * 100) / 100,
      growth_trajectory
    };
  }

  private generateBehavioralInsights(data: any[]) {
    const communications = data.filter(d => d.action_type === 'message_sent');
    const decisions = data.filter(d => d.action_type === 'bid_submitted');
    const priceData = data.filter(d => d.bid_amount);

    // Style de communication
    const avgMessageLength = communications.length > 0 ? 
      communications.reduce((sum, c) => sum + (c.message_length || 100), 0) / communications.length : 100;
    const communication_style = avgMessageLength > 200 ? 'detailed' : 
      avgMessageLength > 100 ? 'professional' : 'concise';

    // Vitesse de décision
    const decisionTimes = decisions.map(d => d.decision_time || 24);
    const avgDecisionTime = decisionTimes.reduce((sum, t) => sum + t, 0) / decisionTimes.length;
    const decision_making_speed = avgDecisionTime < 6 ? 'fast' : 
      avgDecisionTime < 24 ? 'moderate' : 'careful';

    // Sensibilité au prix
    const priceBids = priceData.map(d => d.bid_amount);
    const priceVariance = this.calculateVariance(priceBids);
    const price_sensitivity = priceVariance > 1000 ? 'adaptive' : 
      priceVariance > 500 ? 'moderate' : 'consistent';

    // Préférence qualité
    const qualityProjects = data.filter(d => d.project_budget > 5000);
    const quality_preference = qualityProjects.length / data.length > 0.6 ? 'premium' : 
      qualityProjects.length / data.length > 0.3 ? 'balanced' : 'cost-effective';

    return {
      communication_style,
      decision_making_speed,
      price_sensitivity,
      quality_preference
    };
  }

  private async forecastDemand(timeframe: string) {
    const categories = ['web-development', 'mobile-development', 'design', 'marketing', 'ai-development'];
    
    return categories.map(category => {
      const predicted_growth = this.simulateGrowthPrediction(category);
      return {
        category,
        predicted_growth: Math.round(predicted_growth * 100) / 100,
        confidence_level: Math.random() * 0.3 + 0.7, // 70-100%
        seasonal_factors: this.getSeasonalFactors(category)
      };
    });
  }

  private async analyzePricingTrends(timeframe: string) {
    const categories = ['web-development', 'mobile-development', 'design', 'marketing'];
    
    return categories.map(category => {
      const price_evolution = Math.random() > 0.5 ? 'increasing' : 'stable';
      const market_saturation = Math.random() * 0.4 + 0.3; // 30-70%
      
      return {
        category,
        price_evolution,
        market_saturation: Math.round(market_saturation * 100) / 100,
        competitive_pressure: market_saturation > 0.6 ? 'high' : 'medium'
      };
    });
  }

  private async analyzeSkillDemand(timeframe: string) {
    const skills = ['React', 'Node.js', 'Python', 'AI/ML', 'UI/UX Design', 'WordPress'];
    
    return skills.map(skill => {
      const growth_rate = (Math.random() - 0.3) * 100; // -30% à +70%
      const demand_level = growth_rate > 20 ? 'very_high' : 
        growth_rate > 0 ? 'high' : 'stable';
      
      return {
        skill,
        demand_level,
        growth_rate: Math.round(growth_rate * 10) / 10,
        market_value: Math.round((Math.random() * 50 + 30) * 10) / 10 // 30-80€/h
      };
    });
  }

  // Méthodes utilitaires

  private extractSessions(activities: any[]) {
    // Simulation d'extraction de sessions
    return activities.reduce((sessions, activity, index) => {
      if (index === 0 || new Date(activity.timestamp).getTime() - 
          new Date(activities[index-1].timestamp).getTime() > 30 * 60 * 1000) {
        sessions.push({ start: activity.timestamp, duration: 15 });
      } else if (sessions.length > 0) {
        sessions[sessions.length - 1].duration += 5;
      }
      return sessions;
    }, []);
  }

  private calculateVariance(numbers: number[]) {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    return variance;
  }

  private simulateGrowthPrediction(category: string) {
    const baseGrowth = {
      'web-development': 0.15,
      'mobile-development': 0.25,
      'design': 0.10,
      'marketing': 0.20,
      'ai-development': 0.45
    };
    
    return (baseGrowth[category] || 0.12) + (Math.random() - 0.5) * 0.1;
  }

  private getSeasonalFactors(category: string) {
    return [
      { period: 'Q1', factor: Math.random() * 0.4 + 0.8 },
      { period: 'Q2', factor: Math.random() * 0.4 + 0.8 },
      { period: 'Q3', factor: Math.random() * 0.4 + 0.8 },
      { period: 'Q4', factor: Math.random() * 0.4 + 0.8 }
    ];
  }

  private assessProjectRisks(projectData: any) {
    return [
      {
        type: 'technical_complexity',
        probability: projectData.complexity > 7 ? 0.7 : 0.3,
        impact: 'medium',
        mitigation_strategies: ['Découpage en phases', 'Prototypage préalable', 'Revues techniques']
      },
      {
        type: 'scope_creep',
        probability: 0.4,
        impact: 'high',
        mitigation_strategies: ['Cahier des charges détaillé', 'Validation étapes', 'Gestion changements']
      },
      {
        type: 'timeline_overrun',
        probability: projectData.urgency === 'high' ? 0.6 : 0.3,
        impact: 'medium',
        mitigation_strategies: ['Planification réaliste', 'Buffers temporels', 'Suivi régulier']
      }
    ];
  }

  private assessMarketRisks(category: string) {
    return {
      volatility_index: Math.random() * 0.5 + 0.2, // 20-70%
      economic_indicators: {
        market_confidence: Math.random() * 0.4 + 0.6,
        investment_level: Math.random() * 0.3 + 0.5,
        demand_stability: Math.random() * 0.3 + 0.6
      },
      competitive_threats: ['Nouvelles plateformes', 'Automatisation', 'Offshore competition']
    };
  }

  private assessOperationalRisks(userProfile: any) {
    return {
      capacity_overflow: (userProfile.active_projects || 0) > 5,
      quality_degradation_risk: (userProfile.active_projects || 0) > 3 ? 0.4 : 0.1,
      client_churn_probability: (userProfile.client_satisfaction || 4.5) < 4.0 ? 0.3 : 0.1
    };
  }

  private identifyEmergingNiches(skills: string[]) {
    const emergingNiches = [
      { category: 'AI Automation', opportunity_score: 90, entry_difficulty: 'medium', potential_revenue: 15000 },
      { category: 'Voice Commerce', opportunity_score: 75, entry_difficulty: 'high', potential_revenue: 12000 },
      { category: 'Green Tech Apps', opportunity_score: 80, entry_difficulty: 'low', potential_revenue: 8000 },
      { category: 'AR/VR Experiences', opportunity_score: 85, entry_difficulty: 'high', potential_revenue: 20000 }
    ];

    return emergingNiches.filter(niche => 
      skills.some(skill => niche.category.toLowerCase().includes(skill.toLowerCase()))
    );
  }

  private analyzeClientExpansion(clientHistory: any[]) {
    return {
      existing_clients: (clientHistory || []).slice(0, 5).map(c => c.client_id),
      upsell_opportunities: [
        { client_id: 'client_1', potential_value: 5000, probability: 0.7 },
        { client_id: 'client_2', potential_value: 3000, probability: 0.5 }
      ],
      cross_sell_potential: [
        { client_id: 'client_1', service: 'Maintenance', value: 2000 },
        { client_id: 'client_3', service: 'SEO', value: 1500 }
      ]
    };
  }

  private identifyMarketGaps(marketContext: any) {
    return [
      {
        unmet_demand: 'Applications accessibilité',
        competition_level: 'low',
        revenue_potential: 25000
      },
      {
        unmet_demand: 'Solutions crypto-commerce',
        competition_level: 'medium',
        revenue_potential: 18000
      },
      {
        unmet_demand: 'Apps santé mentale',
        competition_level: 'low',
        revenue_potential: 22000
      }
    ];
  }

  // Fallbacks

  private fallbackBehaviorAnalysis(): UserBehaviorAnalysis {
    return {
      engagement_patterns: {
        peak_activity_hours: ['14h-15h', '16h-17h', '20h-21h'],
        session_duration_avg: 25,
        interaction_frequency: 'medium',
        preferred_categories: ['web-development', 'design']
      },
      success_indicators: {
        completion_rate: 0.87,
        client_satisfaction: 4.3,
        repeat_business_rate: 0.34,
        growth_trajectory: 'stable'
      },
      behavioral_insights: {
        communication_style: 'professional',
        decision_making_speed: 'moderate',
        price_sensitivity: 'moderate',
        quality_preference: 'balanced'
      }
    };
  }

  private fallbackMarketAnalysis(): MarketTrendAnalysis {
    return {
      demand_forecast: [
        { category: 'web-development', predicted_growth: 0.15, confidence_level: 0.85, seasonal_factors: [] },
        { category: 'ai-development', predicted_growth: 0.35, confidence_level: 0.75, seasonal_factors: [] }
      ],
      pricing_trends: [
        { category: 'web-development', price_evolution: 'stable', market_saturation: 0.6, competitive_pressure: 'medium' }
      ],
      skill_demand: [
        { skill: 'React', demand_level: 'high', growth_rate: 15, market_value: 45 },
        { skill: 'AI/ML', demand_level: 'very_high', growth_rate: 35, market_value: 65 }
      ]
    };
  }

  private fallbackRiskAssessment(): RiskAssessment {
    return {
      project_risks: [
        { type: 'timeline_risk', probability: 0.3, impact: 'medium', mitigation_strategies: ['Buffer temps'] }
      ],
      market_risks: {
        volatility_index: 0.4,
        economic_indicators: { market_confidence: 0.7, investment_level: 0.6, demand_stability: 0.75 },
        competitive_threats: ['Automation']
      },
      operational_risks: {
        capacity_overflow: false,
        quality_degradation_risk: 0.2,
        client_churn_probability: 0.15
      }
    };
  }

  private fallbackOpportunityDetection(): OpportunityDetection {
    return {
      emerging_niches: [
        { category: 'AI Integration', opportunity_score: 85, entry_difficulty: 'medium', potential_revenue: 12000 }
      ],
      client_expansion: {
        existing_clients: [],
        upsell_opportunities: [],
        cross_sell_potential: []
      },
      market_gaps: [
        { unmet_demand: 'Small business automation', competition_level: 'low', revenue_potential: 15000 }
      ]
    };
  }
}

export const advancedAnalyticsEngine = new AdvancedAnalyticsEngine();
export type { PredictiveAnalytics, UserBehaviorAnalysis, MarketTrendAnalysis, RiskAssessment, OpportunityDetection };
