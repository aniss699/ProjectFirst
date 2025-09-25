/**
 * Moteur de Prix Simplifié pour SwipDEAL
 * Système de tarification basé sur des règles simples
 */

interface PricingRequest {
  mission: {
    id: string;
    title: string;
    description: string;
    category: string;
    complexity: number;
    urgency: string;
    duration_weeks: number;
    skills_required: string[];
    client_id: string;
    budget?: number;
    geographic_zone?: string;
  };
  market_data: {
    category_avg_price: number;
    demand_level: 'low' | 'medium' | 'high';
    supply_level: 'low' | 'medium' | 'high';
    seasonal_factor: number;
    competition_density: number;
    price_trend: 'decreasing' | 'stable' | 'increasing';
  };
  provider_context?: {
    id: string;
    rating: number;
    completed_projects: number;
    success_rate: number;
    expertise_level: 'junior' | 'intermediate' | 'senior' | 'expert';
    hourly_rate: number;
    location: string;
  };
  realtime_factors?: {
    active_bids_count: number;
    time_remaining_hours: number;
    client_engagement_level: number;
    market_volatility: number;
  };
}

interface PricingResult {
  optimal_price: number;
  price_range: {
    minimum: number;
    conservative: number;
    aggressive: number;
    premium: number;
  };
  confidence_score: number;
  pricing_strategy: string;
  market_positioning: string;
  win_probability: {
    conservative: number;
    aggressive: number;
    premium: number;
  };
  risk_assessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation_strategies: string[];
  };
  optimization_insights?: any;
  neural_factors?: any;
  dynamic_adjustments?: any;
  recommendations: string[];
  pricing_reasoning: string[];
}

export class SimplePricingEngine {
  private basePrices: Map<string, number>;

  constructor() {
    // Prix de base par catégorie (en euros)
    this.basePrices = new Map([
      ['web-development', 500],
      ['mobile-development', 800],
      ['design', 300],
      ['marketing', 400],
      ['content-writing', 200],
      ['consulting', 600],
      ['data-analysis', 700],
      ['other', 400]
    ]);
  }

  /**
   * Calcule le prix optimal avec des règles simples
   * Basé sur catégorie, complexité et urgence
   */
  async calculateOptimalPricing(request: PricingRequest): Promise<PricingResult> {
    console.log('💰 Simple Pricing Engine: Calculating price...');
    
    const basePrice = this.getBasePrice(request.mission.category);
    const complexityMultiplier = this.getComplexityMultiplier(request.mission.complexity);
    const urgencyMultiplier = this.getUrgencyMultiplier(request.mission.urgency);
    const durationMultiplier = Math.max(1, request.mission.duration_weeks / 4); // Par mois
    
    const optimalPrice = Math.round(basePrice * complexityMultiplier * urgencyMultiplier * durationMultiplier);
    
    // Génération de la fourchette de prix
    const priceRange = {
      minimum: Math.round(optimalPrice * 0.7),
      conservative: Math.round(optimalPrice * 0.9),
      aggressive: optimalPrice,
      premium: Math.round(optimalPrice * 1.3)
    };

    // Calcul simple des probabilités de victoire
    const winProbability = {
      conservative: 0.85,
      aggressive: 0.65,
      premium: 0.40
    };

    // Évaluation des risques simple
    const riskLevel = this.assessRiskLevel(request);
    const riskFactors = this.getRiskFactors(request, riskLevel);

    // Recommandations basiques
    const recommendations = this.generateRecommendations(request, optimalPrice, riskLevel);
    const pricingReasoning = this.generatePricingReasoning(request, basePrice, complexityMultiplier, urgencyMultiplier);

    return {
      optimal_price: optimalPrice,
      price_range: priceRange,
      confidence_score: 0.8, // Confiance fixe pour simplicité
      pricing_strategy: this.getPricingStrategy(request),
      market_positioning: this.getMarketPositioning(optimalPrice, request.market_data.category_avg_price),
      win_probability: winProbability,
      risk_assessment: {
        level: riskLevel,
        factors: riskFactors,
        mitigation_strategies: this.getMitigationStrategies(riskLevel)
      },
      recommendations: recommendations,
      pricing_reasoning: pricingReasoning
    };
  }

  private getBasePrice(category: string): number {
    return this.basePrices.get(category) || this.basePrices.get('other')!;
  }

  private getComplexityMultiplier(complexity: number): number {
    if (complexity <= 3) return 1.0;
    if (complexity <= 6) return 1.3;
    if (complexity <= 8) return 1.6;
    return 2.0;
  }

  private getUrgencyMultiplier(urgency: string): number {
    switch (urgency.toLowerCase()) {
      case 'low':
      case 'flexible':
        return 0.9;
      case 'medium':
      case 'normal':
        return 1.0;
      case 'high':
      case 'urgent':
        return 1.3;
      case 'critical':
      case 'emergency':
        return 1.6;
      default:
        return 1.0;
    }
  }

  private getPricingStrategy(request: PricingRequest): string {
    const { mission, market_data } = request;
    
    if (mission.urgency === 'high' || mission.urgency === 'critical') {
      return 'premium_urgency';
    }
    if (market_data.demand_level === 'high' && market_data.supply_level === 'low') {
      return 'market_advantage';
    }
    if (mission.complexity >= 7) {
      return 'specialist_premium';
    }
    return 'competitive_standard';
  }

  private getMarketPositioning(optimalPrice: number, categoryAvg: number): string {
    const ratio = optimalPrice / categoryAvg;
    if (ratio > 1.2) return 'premium';
    if (ratio > 0.9) return 'competitive';
    return 'budget';
  }

  private assessRiskLevel(request: PricingRequest): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    // Complexité élevée = plus de risque
    if (request.mission.complexity >= 8) riskScore += 2;
    else if (request.mission.complexity >= 6) riskScore += 1;
    
    // Urgence élevée = plus de risque
    if (request.mission.urgency === 'critical') riskScore += 2;
    else if (request.mission.urgency === 'high') riskScore += 1;
    
    // Marché difficile = plus de risque
    if (request.market_data.demand_level === 'low') riskScore += 1;
    if (request.market_data.supply_level === 'high') riskScore += 1;
    
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  private getRiskFactors(request: PricingRequest, riskLevel: 'low' | 'medium' | 'high'): string[] {
    const factors: string[] = [];
    
    if (request.mission.complexity >= 7) {
      factors.push('Projet très complexe');
    }
    if (request.mission.urgency === 'high' || request.mission.urgency === 'critical') {
      factors.push('Délais très serrés');
    }
    if (request.market_data.supply_level === 'high') {
      factors.push('Forte concurrence');
    }
    if (request.mission.duration_weeks > 12) {
      factors.push('Projet long terme');
    }
    
    return factors;
  }

  private getMitigationStrategies(riskLevel: 'low' | 'medium' | 'high'): string[] {
    switch (riskLevel) {
      case 'high':
        return [
          'Demander un acompte important',
          'Définir clairement le scope',
          'Prévoir des jalons réguliers',
          'Inclure une clause de révision'
        ];
      case 'medium':
        return [
          'Clarifier les attentes',
          'Prévoir une marge de sécurité',
          'Définir des livrables précis'
        ];
      default:
        return [
          'Maintenir une communication régulière'
        ];
    }
  }

  private generateRecommendations(request: PricingRequest, optimalPrice: number, riskLevel: 'low' | 'medium' | 'high'): string[] {
    const recommendations: string[] = [];
    
    if (request.market_data.demand_level === 'high') {
      recommendations.push('Positionnement premium recommandé');
    }
    
    if (request.mission.urgency === 'high') {
      recommendations.push('Appliquer un surcoût urgence');
    }
    
    if (riskLevel === 'high') {
      recommendations.push('Négocier des conditions de paiement sécurisées');
    }
    
    if (request.mission.complexity >= 7) {
      recommendations.push('Mettre en avant votre expertise technique');
    }
    
    return recommendations;
  }

  private generatePricingReasoning(request: PricingRequest, basePrice: number, complexityMultiplier: number, urgencyMultiplier: number): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Prix de base pour ${request.mission.category}: ${basePrice}€`);
    
    if (complexityMultiplier > 1) {
      reasoning.push(`Complexité élevée (${request.mission.complexity}/10): +${Math.round((complexityMultiplier - 1) * 100)}%`);
    }
    
    if (urgencyMultiplier > 1) {
      reasoning.push(`Urgence (${request.mission.urgency}): +${Math.round((urgencyMultiplier - 1) * 100)}%`);
    }
    
    if (request.mission.duration_weeks > 4) {
      reasoning.push(`Projet long terme (${request.mission.duration_weeks} semaines)`);
    }
    
    return reasoning;
  }
}

// Export compatible avec l'ancien système
export const neuralPricingEngine = new SimplePricingEngine();
export default neuralPricingEngine;