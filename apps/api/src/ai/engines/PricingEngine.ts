/**
 * Moteur de pricing unifié avec IA neural
 * Centralise toute la logique de pricing et recommandations
 */

import { aiCache } from '../core/AICache';
import { fallbackManager, FallbackManager } from '../core/FallbackManager';
import { geminiClient } from '../core/GeminiClient';

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
  market_data?: {
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
  gemini_analysis?: any;
}

export class PricingEngine {
  private static instance: PricingEngine;

  private basePriceModels = {
    'web-development': { base: 45, complexity_factor: 1.2, market_factor: 1.1 },
    'mobile-development': { base: 55, complexity_factor: 1.4, market_factor: 1.3 },
    'design': { base: 40, complexity_factor: 1.0, market_factor: 0.9 },
    'marketing': { base: 50, complexity_factor: 1.1, market_factor: 1.0 },
    'default': { base: 45, complexity_factor: 1.1, market_factor: 1.0 }
  };

  private constructor() {}

  public static getInstance(): PricingEngine {
    if (!PricingEngine.instance) {
      PricingEngine.instance = new PricingEngine();
    }
    return PricingEngine.instance;
  }

  /**
   * Calcul de pricing optimal avec IA neural
   */
  async calculateOptimalPricing(request: PricingRequest): Promise<PricingResponse> {
    const cacheKey = `optimal_pricing_${request.mission.id}_${JSON.stringify(request.market_data || {})}`;

    return fallbackManager.executeWithFallback(
      'neural_pricing',
      () => this.performNeuralPricing(request, cacheKey),
      () => this.neuralPricingFallback(request),
      {
        maxRetries: 2,
        logErrors: true,
        fallbackData: FallbackManager.CommonFallbacks.neuralPricingFallback(request)
      }
    );
  }

  /**
   * Pricing neural principal avec enrichissement IA
   */
  private async performNeuralPricing(request: PricingRequest, cacheKey: string): Promise<PricingResponse> {
    return aiCache.getCachedOrFetch(cacheKey, async () => {
      // 1. Calcul du pricing de base
      const basePricing = this.calculateBasePricing(request);
      
      // 2. Enrichissement Gemini en parallèle
      const geminiAnalysisPromise = this.getGeminiPricingAnalysis(request);
      
      // 3. Ajustements temps réel
      const realTimeAdjustments = this.calculateRealTimeAdjustments(request);
      
      // 4. Analyse d'élasticité
      const elasticityAnalysis = this.analyzeElasticity(request, basePricing);
      
      // 5. Prix optimal neural
      const optimalPrice = this.calculateOptimalPrice(basePricing, realTimeAdjustments, elasticityAnalysis);
      
      // 6. Plages de prix stratégiques
      const priceRanges = this.calculatePriceRanges(optimalPrice, elasticityAnalysis);
      
      // 7. Probabilités de gain
      const winningProbability = this.calculateWinningProbabilities(optimalPrice, request);
      
      // 8. Attendre analyse Gemini
      const geminiAnalysis = await geminiAnalysisPromise;
      
      // 9. Stratégie de négociation enrichie par IA
      const negotiationStrategy = this.generateNegotiationStrategy(optimalPrice, request, geminiAnalysis);
      
      // 10. Insights marché enrichis
      const marketInsights = this.generateMarketInsights(request, optimalPrice, geminiAnalysis);

      return {
        optimal_price: Math.round(optimalPrice),
        price_confidence: this.calculatePriceConfidence(request, optimalPrice, geminiAnalysis),
        price_ranges,
        elasticity_analysis,
        real_time_adjustments,
        winning_probability,
        negotiation_strategy,
        market_insights,
        gemini_analysis
      };
    }, 180000); // Cache 3 minutes pour pricing temps réel
  }

  /**
   * Analyse Gemini pour enrichir le pricing
   */
  private async getGeminiPricingAnalysis(request: PricingRequest): Promise<any> {
    try {
      const prompt = {
        mission: {
          category: request.mission.category,
          description: request.mission.description,
          complexity: request.mission.complexity,
          duration: request.mission.duration_weeks,
          budget: request.mission.current_budget,
          urgency: request.mission.urgency
        },
        market: request.market_data,
        task: "Analyse ce projet et donne une recommandation de prix. Considère la complexité, l'urgence, et le marché. Format: { price_recommendation: number, confidence: number, reasoning: string[], market_position: string }"
      };

      const response = await geminiClient.generateContent({
        prompt: JSON.stringify(prompt),
        phase: 'pricing',
        options: { useCache: true }
      });

      if (response.success && response.parsed) {
        return response.parsed;
      }
      
      return null;
    } catch (error) {
      console.warn('Gemini pricing analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Calcul du pricing de base
   */
  private calculateBasePricing(request: PricingRequest) {
    const model = this.basePriceModels[request.mission.category] || this.basePriceModels['default'];
    
    // Prix horaire de base ajusté par complexité
    const baseHourlyRate = model.base * (1 + (request.mission.complexity - 5) * 0.1);
    
    // Estimation des heures
    const estimatedHours = this.estimateHours(request.mission);
    
    // Prix de base
    const basePrice = baseHourlyRate * estimatedHours;
    
    // Facteur marché
    const marketAdjustedPrice = basePrice * model.market_factor;

    return {
      baseHourlyRate,
      estimatedHours,
      basePrice,
      marketAdjustedPrice,
      complexityFactor: model.complexity_factor
    };
  }

  /**
   * Ajustements temps réel
   */
  private calculateRealTimeAdjustments(request: PricingRequest) {
    const marketData = request.market_data;
    if (!marketData) {
      return {
        market_premium: 0,
        urgency_multiplier: request.mission.urgency === 'high' ? 0.25 : 0,
        competition_discount: 0,
        final_adjustment: request.mission.urgency === 'high' ? 0.25 : 0
      };
    }
    
    // Premium de marché (demande vs offre)
    const demandRatio = marketData.demand_level / Math.max(0.1, 1 - marketData.competition_intensity);
    const marketPremium = Math.min(0.4, (demandRatio - 1) * 0.2);
    
    // Multiplicateur d'urgence
    const urgencyMultiplier = request.mission.urgency === 'high' ? 0.25 : 
                             request.mission.urgency === 'medium' ? 0.10 : 0;
    
    // Remise concurrentielle
    const competitionDiscount = Math.min(0.3, marketData.competition_intensity * 0.4);
    
    const finalAdjustment = marketPremium + urgencyMultiplier - competitionDiscount;

    return {
      market_premium: marketPremium,
      urgency_multiplier: urgencyMultiplier,
      competition_discount: competitionDiscount,
      final_adjustment: finalAdjustment
    };
  }

  /**
   * Analyse d'élasticité
   */
  private analyzeElasticity(request: PricingRequest, basePricing: any) {
    const demandLevel = request.market_data?.demand_level || 0.5;
    
    // Élasticité de la demande (moins sensible si forte demande)
    const demandElasticity = demandLevel > 0.7 ? 0.3 : 
                            demandLevel > 0.4 ? 0.6 : 0.9;
    
    // Sensibilité prix selon complexité
    const priceSensitivity = request.mission.complexity > 7 ? 0.4 : 
                            request.mission.complexity > 4 ? 0.6 : 0.8;
    
    // Marge optimale
    const optimalMargin = (1 - demandElasticity) * 0.4; // 0-40% selon élasticité

    return {
      demand_elasticity: demandElasticity,
      price_sensitivity: priceSensitivity,
      optimal_margin: optimalMargin
    };
  }

  /**
   * Calcul du prix optimal
   */
  private calculateOptimalPrice(basePricing: any, adjustments: any, elasticity: any): number {
    let optimalPrice = basePricing.marketAdjustedPrice;
    
    // Ajustements temps réel
    optimalPrice *= (1 + adjustments.final_adjustment);
    
    // Ajustement élasticité
    optimalPrice *= (1 + elasticity.optimal_margin);
    
    return Math.max(basePricing.basePrice * 0.5, optimalPrice); // Prix minimum = 50% du base
  }

  /**
   * Calcul des plages de prix
   */
  private calculatePriceRanges(optimalPrice: number, elasticity: any) {
    return {
      conservative: {
        min: Math.round(optimalPrice * 0.95),
        max: Math.round(optimalPrice * 1.15)
      },
      competitive: {
        min: Math.round(optimalPrice * 0.85),
        max: Math.round(optimalPrice * 1.05)
      },
      aggressive: {
        min: Math.round(optimalPrice * 0.75),
        max: Math.round(optimalPrice * 0.95)
      }
    };
  }

  /**
   * Probabilités de gain
   */
  private calculateWinningProbabilities(optimalPrice: number, request: PricingRequest) {
    const budgetRatio = request.mission.current_budget ? optimalPrice / request.mission.current_budget : 0.8;
    
    return {
      at_optimal_price: Math.max(0.3, Math.min(0.9, 0.8 - (budgetRatio - 0.8) * 0.5)),
      at_market_price: Math.max(0.4, Math.min(0.95, 0.9 - (budgetRatio - 0.8) * 0.3)),
      at_budget_limit: request.mission.current_budget ? 0.95 : 0.85
    };
  }

  /**
   * Stratégie de négociation enrichie par IA
   */
  private generateNegotiationStrategy(optimalPrice: number, request: PricingRequest, geminiAnalysis?: any) {
    const baseStrategy = {
      initial_offer: Math.round(optimalPrice * 1.1),
      fallback_prices: [
        Math.round(optimalPrice * 1.05),
        optimalPrice,
        Math.round(optimalPrice * 0.95)
      ],
      negotiation_room: Math.round(optimalPrice * 0.15),
      strategy_type: 'balanced' as const
    };

    // Ajustement avec insights Gemini
    if (geminiAnalysis?.market_position === 'strong') {
      baseStrategy.strategy_type = 'aggressive';
      baseStrategy.initial_offer = Math.round(optimalPrice * 1.15);
    } else if (geminiAnalysis?.market_position === 'weak') {
      baseStrategy.strategy_type = 'conservative';
      baseStrategy.initial_offer = Math.round(optimalPrice * 1.05);
    }

    return baseStrategy;
  }

  /**
   * Insights marché enrichis
   */
  private generateMarketInsights(request: PricingRequest, optimalPrice: number, geminiAnalysis?: any) {
    const volatility = request.market_data?.price_volatility || 0.5;
    
    const baseInsights = {
      price_trend: volatility > 0.7 ? 'rising' as const : 
                   volatility < 0.3 ? 'falling' as const : 'stable' as const,
      demand_forecast: geminiAnalysis?.demand_forecast || 'Demande modérée prévue',
      optimal_timing: request.mission.urgency === 'high' ? 'immediate' : 'flexible',
      competitive_positioning: this.getCompetitivePositioning(optimalPrice, request.mission.current_budget)
    };

    return baseInsights;
  }

  /**
   * Utilitaires
   */
  private estimateHours(mission: any): number {
    const baseHours = mission.duration_weeks * 20; // 20h/semaine en moyenne
    const complexityMultiplier = 1 + (mission.complexity - 5) * 0.2;
    return Math.round(baseHours * complexityMultiplier);
  }

  private calculatePriceConfidence(request: PricingRequest, optimalPrice: number, geminiAnalysis?: any): number {
    let confidence = 70;
    
    if (request.market_data) confidence += 15;
    if (request.bidding_context?.current_bids?.length > 0) confidence += 10;
    if (geminiAnalysis?.confidence) confidence = Math.round((confidence + geminiAnalysis.confidence) / 2);
    
    return Math.min(95, confidence);
  }

  private getCompetitivePositioning(optimalPrice: number, budget?: number): string {
    if (!budget) return 'standard';
    
    const ratio = optimalPrice / budget;
    if (ratio > 1.2) return 'premium';
    if (ratio < 0.8) return 'competitive';
    return 'market-aligned';
  }

  /**
   * Fallback de pricing
   */
  private neuralPricingFallback(request: PricingRequest): PricingResponse {
    return FallbackManager.CommonFallbacks.neuralPricingFallback(request);
  }

  /**
   * Métriques de performance
   */
  getPerformanceMetrics() {
    return {
      cache: aiCache.getMetrics(),
      circuitBreakers: fallbackManager.getCircuitBreakerMetrics()
    };
  }
}

export const pricingEngine = PricingEngine.getInstance();