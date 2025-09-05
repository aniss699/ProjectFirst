
/**
 * Neural Pricing Engine - Optimisation prix temps réel avec IA
 */

export interface PricingRequest {
  mission: {
    id: string;
    category: string;
    complexity: number;
    description: string;
    current_budget?: number;
    duration_weeks: number;
    urgency: string;
    skills_required: string[];
  };
  market_data: {
    demand_level: number;
    competition_intensity: number;
    average_market_price: number;
    price_volatility: number;
    seasonal_multiplier: number;
  };
  provider_context?: {
    rating: number;
    experience_level: string;
    portfolio_quality: number;
    availability: number;
  };
  bidding_context?: {
    current_bids: number[];
    bid_count: number;
    time_remaining_hours: number;
  };
}

export interface PricingResponse {
  optimal_price: number;
  price_confidence: number;
  price_ranges: {
    conservative: { min: number; max: number };
    competitive: { min: number; max: number };
    aggressive: { min: number; max: number };
  };
  elasticity_analysis: {
    demand_elasticity: number;
    price_sensitivity: number;
    optimal_margin: number;
  };
  real_time_adjustments: {
    market_premium: number;
    urgency_multiplier: number;
    competition_discount: number;
    final_adjustment: number;
  };
  winning_probability: {
    at_optimal_price: number;
    at_market_price: number;
    at_budget_limit: number;
  };
  negotiation_strategy: {
    initial_offer: number;
    fallback_prices: number[];
    negotiation_room: number;
    strategy_type: 'aggressive' | 'balanced' | 'conservative';
  };
  market_insights: {
    price_trend: 'rising' | 'stable' | 'falling';
    demand_forecast: string;
    optimal_timing: string;
    competitive_positioning: string;
  };
}

class NeuralPricingEngine {
  private basePriceModels = {
    'web-development': { base: 45, complexity_factor: 1.2, market_factor: 1.1 },
    'mobile-development': { base: 55, complexity_factor: 1.4, market_factor: 1.3 },
    'design': { base: 40, complexity_factor: 1.0, market_factor: 0.9 },
    'marketing': { base: 50, complexity_factor: 1.1, market_factor: 1.0 },
    'default': { base: 45, complexity_factor: 1.1, market_factor: 1.0 }
  };

  private elasticityFactors = {
    high_demand: 0.3,    // Prix moins sensible
    medium_demand: 0.6,  // Sensibilité normale
    low_demand: 0.9      // Prix très sensible
  };

  async calculateOptimalPricing(request: PricingRequest): Promise<PricingResponse> {
    // 1. Calcul du prix de base neural
    const base_pricing = this.calculateBasePricing(request);
    
    // 2. Ajustements temps réel
    const real_time_adjustments = this.calculateRealTimeAdjustments(request);
    
    // 3. Analyse d'élasticité
    const elasticity_analysis = this.analyzeElasticity(request, base_pricing);
    
    // 4. Prix optimal neural
    const optimal_price = this.calculateOptimalPrice(base_pricing, real_time_adjustments, elasticity_analysis);
    
    // 5. Plages de prix stratégiques
    const price_ranges = this.calculatePriceRanges(optimal_price, elasticity_analysis);
    
    // 6. Probabilités de gain
    const winning_probability = this.calculateWinningProbabilities(optimal_price, request);
    
    // 7. Stratégie de négociation
    const negotiation_strategy = this.generateNegotiationStrategy(optimal_price, request);
    
    // 8. Insights marché
    const market_insights = this.generateMarketInsights(request, optimal_price);

    return {
      optimal_price: Math.round(optimal_price),
      price_confidence: this.calculatePriceConfidence(request, optimal_price),
      price_ranges,
      elasticity_analysis,
      real_time_adjustments,
      winning_probability,
      negotiation_strategy,
      market_insights
    };
  }

  private calculateBasePricing(request: PricingRequest) {
    const model = this.basePriceModels[request.mission.category] || this.basePriceModels['default'];
    
    // Prix horaire de base ajusté par complexité
    const base_hourly_rate = model.base * (1 + (request.mission.complexity - 5) * 0.1);
    
    // Estimation des heures
    const estimated_hours = this.estimateHours(request.mission);
    
    // Prix de base
    const base_price = base_hourly_rate * estimated_hours;
    
    // Facteur marché
    const market_adjusted_price = base_price * model.market_factor;

    return {
      base_hourly_rate,
      estimated_hours,
      base_price,
      market_adjusted_price,
      complexity_factor: model.complexity_factor
    };
  }

  private calculateRealTimeAdjustments(request: PricingRequest) {
    const { market_data, bidding_context } = request;
    
    // Premium de marché (demande vs offre)
    const demand_ratio = market_data.demand_level / Math.max(0.1, 1 - market_data.competition_intensity);
    const market_premium = Math.min(0.4, (demand_ratio - 1) * 0.2);
    
    // Multiplicateur d'urgence
    const urgency_multiplier = request.mission.urgency === 'high' ? 0.25 : 
                              request.mission.urgency === 'medium' ? 0.1 : 0;
    
    // Remise concurrentielle
    let competition_discount = 0;
    if (bidding_context && bidding_context.bid_count > 5) {
      competition_discount = Math.min(0.15, (bidding_context.bid_count - 5) * 0.02);
    }
    
    // Ajustement temporel (fin d'enchère)
    let temporal_adjustment = 0;
    if (bidding_context && bidding_context.time_remaining_hours < 24) {
      temporal_adjustment = -0.05; // Légère baisse pour urgence
    }
    
    const final_adjustment = market_premium + urgency_multiplier - competition_discount + temporal_adjustment;

    return {
      market_premium: Math.round(market_premium * 1000) / 1000,
      urgency_multiplier: Math.round(urgency_multiplier * 1000) / 1000,
      competition_discount: Math.round(competition_discount * 1000) / 1000,
      final_adjustment: Math.round(final_adjustment * 1000) / 1000
    };
  }

  private analyzeElasticity(request: PricingRequest, base_pricing: any) {
    const { market_data } = request;
    
    // Élasticité de la demande basée sur l'intensité concurrentielle
    let demand_elasticity = this.elasticityFactors.medium_demand;
    if (market_data.competition_intensity > 0.7) {
      demand_elasticity = this.elasticityFactors.high_demand;
    } else if (market_data.competition_intensity < 0.3) {
      demand_elasticity = this.elasticityFactors.low_demand;
    }
    
    // Sensibilité prix selon catégorie
    const category_sensitivity = this.getCategorySensitivity(request.mission.category);
    const price_sensitivity = (demand_elasticity + category_sensitivity) / 2;
    
    // Marge optimale
    const optimal_margin = this.calculateOptimalMargin(price_sensitivity, market_data.demand_level);

    return {
      demand_elasticity: Math.round(demand_elasticity * 1000) / 1000,
      price_sensitivity: Math.round(price_sensitivity * 1000) / 1000,
      optimal_margin: Math.round(optimal_margin * 1000) / 1000
    };
  }

  private calculateOptimalPrice(base_pricing: any, adjustments: any, elasticity: any): number {
    // Prix de départ
    let optimal_price = base_pricing.market_adjusted_price;
    
    // Application des ajustements temps réel
    optimal_price *= (1 + adjustments.final_adjustment);
    
    // Optimisation selon élasticité
    const elasticity_factor = 1 + (elasticity.optimal_margin - 0.5) * 0.3;
    optimal_price *= elasticity_factor;
    
    return optimal_price;
  }

  private calculatePriceRanges(optimal_price: number, elasticity: any) {
    const elasticity_spread = elasticity.price_sensitivity * 0.2;
    
    return {
      conservative: {
        min: Math.round(optimal_price * (1 - elasticity_spread * 0.5)),
        max: Math.round(optimal_price * (1 + elasticity_spread * 0.3))
      },
      competitive: {
        min: Math.round(optimal_price * (1 - elasticity_spread)),
        max: Math.round(optimal_price * (1 + elasticity_spread))
      },
      aggressive: {
        min: Math.round(optimal_price * (1 - elasticity_spread * 1.5)),
        max: Math.round(optimal_price * (1 + elasticity_spread * 1.5))
      }
    };
  }

  private calculateWinningProbabilities(optimal_price: number, request: PricingRequest) {
    const market_price = request.market_data.average_market_price;
    const budget_limit = request.mission.current_budget || optimal_price * 1.2;
    
    // Modèle probabiliste basé sur la distance au prix marché
    const at_optimal_price = this.calculateWinProbability(optimal_price, market_price, request);
    const at_market_price = this.calculateWinProbability(market_price, market_price, request);
    const at_budget_limit = this.calculateWinProbability(budget_limit, market_price, request);

    return {
      at_optimal_price: Math.round(at_optimal_price * 100) / 100,
      at_market_price: Math.round(at_market_price * 100) / 100,
      at_budget_limit: Math.round(at_budget_limit * 100) / 100
    };
  }

  private calculateWinProbability(price: number, market_price: number, request: PricingRequest): number {
    // Probabilité de base selon position prix
    const price_ratio = price / market_price;
    let base_probability = 0.5;
    
    if (price_ratio <= 0.8) base_probability = 0.9;
    else if (price_ratio <= 0.9) base_probability = 0.8;
    else if (price_ratio <= 1.1) base_probability = 0.7;
    else if (price_ratio <= 1.3) base_probability = 0.5;
    else base_probability = 0.3;
    
    // Ajustements selon contexte
    if (request.provider_context) {
      const provider_bonus = (request.provider_context.rating - 3) * 0.1;
      base_probability += provider_bonus;
    }
    
    // Ajustement concurrentiel
    const competition_factor = 1 - request.market_data.competition_intensity * 0.3;
    base_probability *= competition_factor;
    
    return Math.max(0.1, Math.min(0.95, base_probability));
  }

  private generateNegotiationStrategy(optimal_price: number, request: PricingRequest) {
    const competition_level = request.market_data.competition_intensity;
    
    let strategy_type: 'aggressive' | 'balanced' | 'conservative' = 'balanced';
    if (competition_level > 0.7) strategy_type = 'aggressive';
    else if (competition_level < 0.3) strategy_type = 'conservative';
    
    // Prix d'ouverture selon stratégie
    const opening_multipliers = {
      aggressive: 0.95,
      balanced: 1.05,
      conservative: 1.15
    };
    
    const initial_offer = Math.round(optimal_price * opening_multipliers[strategy_type]);
    
    // Prix de repli
    const fallback_prices = [
      Math.round(optimal_price * 1.1),
      Math.round(optimal_price),
      Math.round(optimal_price * 0.95),
      Math.round(optimal_price * 0.9)
    ];
    
    // Marge de négociation
    const negotiation_room = Math.round((initial_offer - optimal_price * 0.9));

    return {
      initial_offer,
      fallback_prices,
      negotiation_room,
      strategy_type
    };
  }

  private generateMarketInsights(request: PricingRequest, optimal_price: number) {
    const market_data = request.market_data;
    
    // Tendance prix
    let price_trend: 'rising' | 'stable' | 'falling' = 'stable';
    if (market_data.price_volatility > 0.1) {
      price_trend = market_data.demand_level > 0.7 ? 'rising' : 'falling';
    }
    
    // Prévision demande
    const demand_forecast = market_data.demand_level > 0.8 ? 'Forte croissance attendue' :
                           market_data.demand_level > 0.6 ? 'Croissance modérée' :
                           'Demande stable';
    
    // Timing optimal
    const optimal_timing = market_data.competition_intensity < 0.4 ? 
                          'Moment idéal pour postuler' :
                          'Attendre une baisse de la concurrence';
    
    // Positionnement concurrentiel
    const market_ratio = optimal_price / market_data.average_market_price;
    const competitive_positioning = market_ratio > 1.2 ? 'Premium' :
                                   market_ratio > 1.05 ? 'Au-dessus du marché' :
                                   market_ratio > 0.95 ? 'Aligné marché' :
                                   'Compétitif';

    return {
      price_trend,
      demand_forecast,
      optimal_timing,
      competitive_positioning
    };
  }

  private estimateHours(mission: any): number {
    const base_hours = {
      'web-development': 40,
      'mobile-development': 60,
      'design': 25,
      'marketing': 30,
      'default': 35
    };
    
    const base = base_hours[mission.category] || base_hours['default'];
    const complexity_multiplier = 0.5 + (mission.complexity / 10);
    
    return Math.round(base * complexity_multiplier);
  }

  private getCategorySensitivity(category: string): number {
    const sensitivities = {
      'web-development': 0.6,
      'mobile-development': 0.5,
      'design': 0.7,
      'marketing': 0.8,
      'default': 0.6
    };
    return sensitivities[category] || sensitivities['default'];
  }

  private calculateOptimalMargin(price_sensitivity: number, demand_level: number): number {
    // Marge optimale = f(sensibilité, demande)
    const base_margin = 0.5;
    const sensitivity_adjustment = (0.6 - price_sensitivity) * 0.5;
    const demand_adjustment = (demand_level - 0.5) * 0.3;
    
    return Math.max(0.2, Math.min(0.8, base_margin + sensitivity_adjustment + demand_adjustment));
  }

  private calculatePriceConfidence(request: PricingRequest, optimal_price: number): number {
    let confidence = 0.7; // Base
    
    // Bonus selon qualité des données
    if (request.market_data.average_market_price > 0) confidence += 0.1;
    if (request.bidding_context && request.bidding_context.current_bids.length > 3) confidence += 0.1;
    if (request.provider_context) confidence += 0.05;
    
    // Malus selon volatilité
    confidence -= request.market_data.price_volatility * 0.2;
    
    return Math.round(Math.max(0.3, Math.min(0.95, confidence)) * 100) / 100;
  }
}

export const neuralPricingEngine = new NeuralPricingEngine();
