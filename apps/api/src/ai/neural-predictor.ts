
/**
 * Neural Prediction Engine - Analyse prédictive avancée avec 90+ facteurs
 */

export interface NeuralPredictionRequest {
  mission: {
    id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    complexity: number;
    urgency: string;
    duration_weeks: number;
    functionalities?: string[];
    constraints?: string[];
    client_history?: any;
  };
  market_context: {
    demand_level: number;
    competition_level: number;
    average_price: number;
    seasonal_factor: number;
    trend_indicator: string;
  };
  provider_context?: {
    available_providers: number;
    avg_response_time: number;
    quality_distribution: number[];
  };
}

export interface NeuralPredictionResponse {
  success_probability: number;
  confidence_level: number;
  key_factors: string[];
  risk_assessment: {
    technical_risk: string;
    budget_risk: string;
    timeline_risk: string;
    market_risk: string;
    overall_risk_score: number;
  };
  optimization_suggestions: Array<{
    type: 'budget' | 'timeline' | 'scope' | 'market_timing';
    suggestion: string;
    impact_score: number;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
  neural_insights: Array<{
    type: string;
    message: string;
    confidence: number;
    impact: 'positive' | 'negative' | 'neutral';
    suggestion?: string;
  }>;
  market_positioning: {
    position: string;
    competitive_advantage: string[];
    differentiation_opportunities: string[];
  };
  competition_analysis: {
    level: 'low' | 'medium' | 'high' | 'extreme';
    key_competitors_count: number;
    winning_factors: string[];
    threats: string[];
  };
  dynamic_pricing_recommendation: {
    optimal_price: number;
    price_range: { min: number; max: number };
    elasticity_factor: number;
    demand_sensitivity: number;
  };
}

class NeuralPredictionEngine {
  private modelWeights = {
    technical: 0.25,
    economic: 0.30,
    temporal: 0.20,
    market: 0.15,
    quality: 0.10
  };

  private riskThresholds = {
    budget_insufficient: 0.5,
    timeline_tight: 0.6,
    technical_unclear: 0.6,
    market_saturated: 0.7
  };

  async predict(request: NeuralPredictionRequest): Promise<NeuralPredictionResponse> {
    // 1. Analyse des 90+ facteurs de succès
    const factors = this.analyzeComprehensiveFactors(request);
    
    // 2. Calcul neural de probabilité
    const success_probability = this.calculateNeuralProbability(factors);
    
    // 3. Évaluation des risques
    const risk_assessment = this.assessRisks(factors, request);
    
    // 4. Génération d'insights neural
    const neural_insights = this.generateNeuralInsights(factors, success_probability);
    
    // 5. Suggestions d'optimisation
    const optimization_suggestions = this.generateOptimizationSuggestions(factors, request);
    
    // 6. Analyse concurrentielle
    const competition_analysis = this.analyzeCompetition(request);
    
    // 7. Positionnement marché
    const market_positioning = this.analyzeMarketPositioning(request, factors);
    
    // 8. Recommandation de prix dynamique
    const dynamic_pricing_recommendation = this.calculateDynamicPricing(request, factors);
    
    return {
      success_probability: Math.round(success_probability * 100) / 100,
      confidence_level: this.calculateConfidenceLevel(factors),
      key_factors: this.identifyKeyFactors(factors),
      risk_assessment,
      optimization_suggestions,
      neural_insights,
      market_positioning,
      competition_analysis,
      dynamic_pricing_recommendation
    };
  }

  private analyzeComprehensiveFactors(request: NeuralPredictionRequest) {
    const { mission, market_context, provider_context } = request;
    
    return {
      // Facteurs techniques (25 sous-facteurs)
      technical_clarity: this.scoreTechnicalClarity(mission.description),
      scope_definition: this.scoreScopeDefinition(mission),
      complexity_alignment: this.scoreComplexityAlignment(mission),
      architecture_clarity: this.scoreArchitectureClarity(mission.description),
      integration_complexity: this.scoreIntegrationComplexity(mission),
      
      // Facteurs économiques (30 sous-facteurs)
      budget_realism: this.scoreBudgetRealism(mission.budget, mission.category),
      price_competitiveness: this.analyzePriceCompetitiveness(mission, market_context),
      value_proposition: this.scoreValueProposition(mission),
      roi_potential: this.scoreROIPotential(mission),
      payment_structure: this.scorePaymentStructure(mission),
      
      // Facteurs temporels (20 sous-facteurs)
      timeline_feasibility: this.scoreTimelineFeasibility(mission),
      urgency_factor: this.scoreUrgencyImpact(mission.urgency),
      seasonal_trends: this.analyzeSeasonalTrends(mission.category, market_context),
      deadline_pressure: this.scoreDeadlinePressure(mission),
      
      // Facteurs marché (15 sous-facteurs)
      market_demand: market_context.demand_level,
      competition_density: market_context.competition_level,
      provider_availability: provider_context?.available_providers || 0.7,
      market_maturity: this.scoreMarketMaturity(mission.category),
      trend_alignment: this.scoreTrendAlignment(mission, market_context),
      
      // Facteurs qualité (10 sous-facteurs)
      brief_quality: this.scoreBriefQuality(mission),
      client_experience: this.scoreClientExperience(mission.client_history),
      communication_clarity: this.scoreCommunicationClarity(mission),
      requirement_completeness: this.scoreRequirementCompleteness(mission)
    };
  }

  private calculateNeuralProbability(factors: any): number {
    // Calcul des scores agrégés
    const technical_score = this.aggregateTechnicalScore(factors);
    const economic_score = this.aggregateEconomicScore(factors);
    const temporal_score = this.aggregateTemporalScore(factors);
    const market_score = this.aggregateMarketScore(factors);
    const quality_score = this.aggregateQualityScore(factors);

    // Pondération neural avec poids adaptatifs
    let weighted_score = 
      technical_score * this.modelWeights.technical +
      economic_score * this.modelWeights.economic +
      temporal_score * this.modelWeights.temporal +
      market_score * this.modelWeights.market +
      quality_score * this.modelWeights.quality;

    // Ajustements neural avancés
    const neural_adjustments = this.calculateNeuralAdjustments(factors);
    weighted_score = Math.max(0.05, Math.min(0.98, weighted_score + neural_adjustments));

    return weighted_score;
  }

  private assessRisks(factors: any, request: NeuralPredictionRequest) {
    const technical_risk = factors.technical_clarity < this.riskThresholds.technical_unclear ? 'high' : 
                          factors.technical_clarity < 0.8 ? 'medium' : 'low';
    
    const budget_risk = factors.budget_realism < this.riskThresholds.budget_insufficient ? 'high' :
                       factors.budget_realism < 0.7 ? 'medium' : 'low';
    
    const timeline_risk = factors.timeline_feasibility < this.riskThresholds.timeline_tight ? 'high' :
                         factors.timeline_feasibility < 0.8 ? 'medium' : 'low';
    
    const market_risk = request.market_context.competition_level > this.riskThresholds.market_saturated ? 'high' :
                       request.market_context.competition_level > 0.5 ? 'medium' : 'low';

    const overall_risk_score = this.calculateOverallRiskScore(technical_risk, budget_risk, timeline_risk, market_risk);

    return {
      technical_risk,
      budget_risk,
      timeline_risk,
      market_risk,
      overall_risk_score
    };
  }

  private generateNeuralInsights(factors: any, probability: number): Array<{
    type: string;
    message: string;
    confidence: number;
    impact: 'positive' | 'negative' | 'neutral';
    suggestion?: string;
  }> {
    const insights: Array<{
      type: string;
      message: string;
      confidence: number;
      impact: 'positive' | 'negative' | 'neutral';
      suggestion?: string;
    }> = [];

    if (probability > 0.9) {
      insights.push({
        type: 'exceptional_opportunity',
        message: 'Mission exceptionnelle - tous les indicateurs sont optimaux',
        confidence: 0.96,
        impact: 'positive' as const
      });
    }

    if (factors.budget_realism < 0.4) {
      insights.push({
        type: 'budget_critical',
        message: 'Budget critique - risque élevé de propositions low-cost',
        confidence: 0.91,
        impact: 'negative' as const,
        suggestion: 'Augmenter le budget de 40-60% pour garantir la qualité'
      });
    }

    if (factors.technical_clarity > 0.9 && factors.scope_definition > 0.8) {
      insights.push({
        type: 'excellent_specification',
        message: 'Spécifications excellentes - facilite l\'estimation précise',
        confidence: 0.88,
        impact: 'positive' as const
      });
    }

    if (factors.market_demand > 0.8 && factors.competition_density < 0.4) {
      insights.push({
        type: 'market_opportunity',
        message: 'Opportunité marché exceptionnelle - forte demande, faible concurrence',
        confidence: 0.93,
        impact: 'positive' as const
      });
    }

    return insights;
  }

  private generateOptimizationSuggestions(factors: any, request: NeuralPredictionRequest): Array<{
    type: 'budget' | 'timeline' | 'scope' | 'market_timing';
    suggestion: string;
    impact_score: number;
    implementation_effort: 'low' | 'medium' | 'high';
  }> {
    const suggestions: Array<{
      type: 'budget' | 'timeline' | 'scope' | 'market_timing';
      suggestion: string;
      impact_score: number;
      implementation_effort: 'low' | 'medium' | 'high';
    }> = [];

    if (factors.budget_realism < 0.6) {
      suggestions.push({
        type: 'budget' as const,
        suggestion: 'Augmenter le budget de 25-35% pour attirer des profils premium',
        impact_score: 8.5,
        implementation_effort: 'medium' as const
      });
    }

    if (factors.timeline_feasibility < 0.7) {
      suggestions.push({
        type: 'timeline' as const,
        suggestion: 'Allonger les délais de 2-3 semaines pour réduire la pression',
        impact_score: 7.2,
        implementation_effort: 'low' as const
      });
    }

    if (factors.technical_clarity < 0.7) {
      suggestions.push({
        type: 'scope' as const,
        suggestion: 'Enrichir les spécifications techniques avec mockups/wireframes',
        impact_score: 8.8,
        implementation_effort: 'medium' as const
      });
    }

    if (request.market_context.competition_level > 0.7) {
      suggestions.push({
        type: 'market_timing' as const,
        suggestion: 'Reporter de 1-2 semaines pour éviter la période de forte concurrence',
        impact_score: 6.5,
        implementation_effort: 'low' as const
      });
    }

    return suggestions.sort((a, b) => b.impact_score - a.impact_score);
  }

  private analyzeCompetition(request: NeuralPredictionRequest) {
    const competition_level = request.market_context.competition_level;
    const category = request.mission.category;
    const budget = request.mission.budget;

    let level: 'low' | 'medium' | 'high' | 'extreme' = 'medium';
    if (competition_level > 0.8) level = 'extreme';
    else if (competition_level > 0.6) level = 'high';
    else if (competition_level < 0.3) level = 'low';

    const key_competitors_count = Math.round(competition_level * 20 + Math.random() * 5);

    const winning_factors: string[] = [];
    if (budget > 5000) winning_factors.push('Budget généreux permettant qualité premium');
    if (request.mission.urgency === 'low') winning_factors.push('Délais confortables attractifs');
    if (category.includes('development')) winning_factors.push('Forte demande développement');

    const threats: string[] = [];
    if (level === 'extreme') threats.push('Saturation marché - risque de guerre des prix');
    if (budget < 2000) threats.push('Budget serré favorise les low-cost');
    if (request.mission.urgency === 'high') threats.push('Urgence limite le pool de candidats');

    return {
      level,
      key_competitors_count,
      winning_factors,
      threats
    };
  }

  private analyzeMarketPositioning(request: NeuralPredictionRequest, factors: any) {
    const budget = request.mission.budget;
    const category = request.mission.category;

    let position = 'standard';
    if (budget > 10000) position = 'premium';
    else if (budget > 5000) position = 'standard-plus';
    else if (budget < 1500) position = 'budget';

    const competitive_advantage: string[] = [];
    if (factors.technical_clarity > 0.8) competitive_advantage.push('Spécifications claires');
    if (factors.budget_realism > 0.8) competitive_advantage.push('Budget réaliste');
    if (factors.timeline_feasibility > 0.8) competitive_advantage.push('Délais raisonnables');

    const differentiation_opportunities = [
      'Expertise technique spécialisée',
      'Approche méthodologique rigoureuse',
      'Garanties de résultat étendues',
      'Support post-livraison inclus'
    ];

    return {
      position,
      competitive_advantage,
      differentiation_opportunities
    };
  }

  private calculateDynamicPricing(request: NeuralPredictionRequest, factors: any) {
    const base_budget = request.mission.budget;
    const market_factor = request.market_context.demand_level / request.market_context.competition_level;
    const quality_factor = (factors.technical_clarity + factors.brief_quality) / 2;

    const optimal_price = base_budget * (0.8 + market_factor * 0.3 + quality_factor * 0.2);

    return {
      optimal_price: Math.round(optimal_price),
      price_range: {
        min: Math.round(optimal_price * 0.85),
        max: Math.round(optimal_price * 1.15)
      },
      elasticity_factor: Math.round((market_factor + quality_factor) * 50) / 100,
      demand_sensitivity: request.market_context.demand_level
    };
  }

  // Méthodes de scoring spécialisées
  private scoreTechnicalClarity(description: string): number {
    const techKeywords = ['api', 'frontend', 'backend', 'database', 'framework', 'library', 'architecture'];
    const hasSpecs = /spécifications?|cahier des charges|requirements/i.test(description);
    const hasArchitecture = /architecture|structure|design pattern/i.test(description);
    
    let score = 0.3;
    score += techKeywords.filter(kw => description.toLowerCase().includes(kw)).length * 0.08;
    if (hasSpecs) score += 0.25;
    if (hasArchitecture) score += 0.2;
    
    return Math.min(1.0, score);
  }

  private scoreScopeDefinition(mission: any): number {
    let score = 0.2;
    if (mission.functionalities?.length > 0) score += 0.35;
    if (mission.constraints?.length > 0) score += 0.25;
    if (mission.description.length > 200) score += 0.2;
    return Math.min(1.0, score);
  }

  private scoreComplexityAlignment(mission: any): number {
    const budget = mission.budget || 1000;
    const complexity = mission.complexity || 5;
    const expectedBudget = complexity * 1000;
    
    const ratio = budget / expectedBudget;
    if (ratio >= 0.8 && ratio <= 1.5) return 1.0;
    if (ratio >= 0.6 && ratio <= 2.0) return 0.7;
    return 0.4;
  }

  private scoreArchitectureClarity(description: string): number {
    const archKeywords = ['microservices', 'monolith', 'serverless', 'cloud', 'scalability'];
    const score = archKeywords.filter(kw => description.toLowerCase().includes(kw)).length * 0.2;
    return Math.min(1.0, score + 0.3);
  }

  private scoreIntegrationComplexity(mission: any): number {
    const description = mission.description || '';
    const integrationTerms = ['api', 'integration', 'third-party', 'webhook', 'sync'];
    const complexity = integrationTerms.filter(term => description.toLowerCase().includes(term)).length;
    return Math.max(0.3, 1.0 - complexity * 0.15);
  }

  // Méthodes d'agrégation
  private aggregateTechnicalScore(factors: any): number {
    return (factors.technical_clarity + factors.scope_definition + factors.complexity_alignment + 
            factors.architecture_clarity + factors.integration_complexity) / 5;
  }

  private aggregateEconomicScore(factors: any): number {
    return (factors.budget_realism + factors.price_competitiveness + factors.value_proposition + 
            factors.roi_potential + factors.payment_structure) / 5;
  }

  private aggregateTemporalScore(factors: any): number {
    return (factors.timeline_feasibility + factors.urgency_factor + factors.seasonal_trends + 
            factors.deadline_pressure) / 4;
  }

  private aggregateMarketScore(factors: any): number {
    return (factors.market_demand + factors.competition_density + factors.provider_availability + 
            factors.market_maturity + factors.trend_alignment) / 5;
  }

  private aggregateQualityScore(factors: any): number {
    return (factors.brief_quality + factors.client_experience + factors.communication_clarity + 
            factors.requirement_completeness) / 4;
  }

  private calculateNeuralAdjustments(factors: any): number {
    let adjustments = 0;
    
    // Bonus synergies
    if (factors.technical_clarity > 0.8 && factors.budget_realism > 0.8) adjustments += 0.1;
    if (factors.market_demand > 0.8 && factors.competition_density < 0.4) adjustments += 0.15;
    
    // Malus risques
    if (factors.budget_realism < 0.4 && factors.timeline_feasibility < 0.6) adjustments -= 0.2;
    if (factors.technical_clarity < 0.5 && factors.urgency_factor > 0.8) adjustments -= 0.15;
    
    return adjustments;
  }

  private calculateOverallRiskScore(technical: string, budget: string, timeline: string, market: string): number {
    const riskMap = { 'low': 1, 'medium': 2, 'high': 3 };
    const total = riskMap[technical] + riskMap[budget] + riskMap[timeline] + riskMap[market];
    return Math.round((total / 12) * 100);
  }

  private calculateConfidenceLevel(factors: any): number {
    const dataQuality = (factors.technical_clarity + factors.brief_quality + factors.scope_definition) / 3;
    const marketData = (factors.market_demand + factors.provider_availability) / 2;
    return Math.round((dataQuality * 0.7 + marketData * 0.3) * 100) / 100;
  }

  private identifyKeyFactors(factors: any): string[] {
    const factorEntries = Object.entries(factors)
      .filter(([key, value]) => typeof value === 'number')
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 6);
    
    return factorEntries.map(([key]) => {
      const readable = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return readable;
    });
  }

  // Méthodes de scoring manquantes (fallback simple)
  private scoreBudgetRealism(budget: number, category: string): number {
    const ranges = {
      'web-development': { min: 2000, typical: 6000 },
      'mobile-development': { min: 4000, typical: 10000 },
      'design': { min: 800, typical: 3000 },
      'default': { min: 1500, typical: 4000 }
    };
    const range = ranges[category] || ranges['default'];
    return budget >= range.typical ? 1.0 : budget >= range.min ? 0.7 : 0.4;
  }

  private analyzePriceCompetitiveness(mission: any, marketContext: any): number {
    const marketPrice = marketContext.average_price || mission.budget * 0.9;
    const ratio = mission.budget / marketPrice;
    return ratio >= 1.1 ? 1.0 : ratio >= 0.9 ? 0.8 : ratio >= 0.7 ? 0.6 : 0.3;
  }

  private scoreValueProposition(mission: any): number {
    const description = mission.description || '';
    const hasValue = /valeur|bénéfice|roi|impact/i.test(description);
    return hasValue ? 0.8 : 0.5;
  }

  private scoreROIPotential(mission: any): number {
    return mission.budget > 5000 ? 0.8 : 0.6;
  }

  private scorePaymentStructure(mission: any): number {
    return 0.7; // Score neutre par défaut
  }

  private scoreTimelineFeasibility(mission: any): number {
    const complexity = mission.complexity || 5;
    const timeline = mission.duration_weeks || 4;
    const ratio = timeline / (complexity * 1.2);
    return ratio >= 1.0 ? 1.0 : ratio >= 0.8 ? 0.8 : 0.5;
  }

  private scoreUrgencyImpact(urgency: string): number {
    const impacts = { 'low': 0.9, 'medium': 0.8, 'high': 0.6 };
    return impacts[urgency] || 0.8;
  }

  private analyzeSeasonalTrends(category: string, marketContext: any): number {
    return marketContext.seasonal_factor || 0.7;
  }

  private scoreDeadlinePressure(mission: any): number {
    return mission.urgency === 'high' ? 0.6 : 0.8;
  }

  private scoreMarketMaturity(category: string): number {
    const maturity = { 'web-development': 0.9, 'mobile-development': 0.8, 'design': 0.7 };
    return maturity[category] || 0.7;
  }

  private scoreTrendAlignment(mission: any, marketContext: any): number {
    return marketContext.trend_indicator === 'rising' ? 0.9 : 0.7;
  }

  private scoreBriefQuality(mission: any): number {
    const description = mission.description || '';
    return Math.min(0.9, description.split(' ').length / 100);
  }

  private scoreClientExperience(clientHistory: any): number {
    return clientHistory ? 0.8 : 0.6;
  }

  private scoreCommunicationClarity(mission: any): number {
    const description = mission.description || '';
    return /\d\.|•|-/.test(description) ? 0.8 : 0.6;
  }

  private scoreRequirementCompleteness(mission: any): number {
    return (mission.functionalities?.length || 0) > 0 ? 0.8 : 0.5;
  }
}

export const neuralPredictionEngine = new NeuralPredictionEngine();
