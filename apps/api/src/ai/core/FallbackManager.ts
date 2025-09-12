/**
 * Gestionnaire de fallbacks centralisé et réutilisable
 * Unifie tous les patterns de error handling fragmentés
 */

import { aiConfig } from './AIConfig';

export interface FallbackOptions {
  maxRetries?: number;
  backoffMultiplier?: number;
  timeout?: number;
  circuitBreaker?: boolean;
  fallbackData?: any;
  logErrors?: boolean;
}

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  lastError?: Error;
  startTime: number;
  operation: string;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = aiConfig.fallback.circuitBreakerThreshold,
    private resetTimeout: number = 60000 // 1 minute
  ) {}

  canExecute(): boolean {
    if (this.state === 'closed') return true;
    
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }
    
    return true; // half-open
  }

  onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      threshold: this.threshold
    };
  }
}

export class FallbackManager {
  private static instance: FallbackManager;
  private circuitBreakers = new Map<string, CircuitBreaker>();

  private constructor() {}

  public static getInstance(): FallbackManager {
    if (!FallbackManager.instance) {
      FallbackManager.instance = new FallbackManager();
    }
    return FallbackManager.instance;
  }

  /**
   * Exécution avec fallback automatique et circuit breaker
   */
  async executeWithFallback<T>(
    operation: string,
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T> | T,
    options: FallbackOptions = {}
  ): Promise<T> {
    const config = {
      maxRetries: options.maxRetries ?? aiConfig.fallback.maxRetries,
      backoffMultiplier: options.backoffMultiplier ?? aiConfig.fallback.backoffMultiplier,
      timeout: options.timeout ?? 30000,
      circuitBreaker: options.circuitBreaker ?? true,
      logErrors: options.logErrors ?? true,
      ...options
    };

    const circuitBreaker = this.getCircuitBreaker(operation);
    
    if (config.circuitBreaker && !circuitBreaker.canExecute()) {
      if (config.logErrors) {
        console.warn(`Circuit breaker open for ${operation}, using fallback immediately`);
      }
      return this.executeFallback(fallbackFn, options.fallbackData);
    }

    const context: RetryContext = {
      attempt: 0,
      maxAttempts: config.maxRetries + 1,
      startTime: Date.now(),
      operation
    };

    return this.executeWithRetry(primaryFn, fallbackFn, config, context, circuitBreaker);
  }

  /**
   * Exécution avec retry et backoff exponentiel
   */
  private async executeWithRetry<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T> | T,
    config: Required<FallbackOptions>,
    context: RetryContext,
    circuitBreaker: CircuitBreaker
  ): Promise<T> {
    while (context.attempt < context.maxAttempts) {
      try {
        context.attempt++;
        
        if (config.logErrors && context.attempt > 1) {
          console.log(`${context.operation}: Retry attempt ${context.attempt}/${context.maxAttempts}`);
        }

        // Timeout pour l'opération
        const result = await this.withTimeout(primaryFn(), config.timeout);
        
        circuitBreaker.onSuccess();
        
        if (config.logErrors && context.attempt > 1) {
          console.log(`${context.operation}: Succeeded on attempt ${context.attempt}`);
        }
        
        return result;
        
      } catch (error) {
        context.lastError = error;
        circuitBreaker.onFailure();
        
        if (config.logErrors) {
          console.error(`${context.operation}: Attempt ${context.attempt} failed:`, error.message);
        }

        // Si c'est le dernier essai, utiliser le fallback
        if (context.attempt >= context.maxAttempts) {
          if (config.logErrors) {
            console.warn(`${context.operation}: All attempts failed, using fallback`);
          }
          return this.executeFallback(fallbackFn, config.fallbackData);
        }

        // Attendre avant le prochain essai (backoff exponentiel)
        const delay = this.calculateBackoffDelay(context.attempt, config.backoffMultiplier);
        await this.sleep(delay);
      }
    }

    // Ne devrait jamais arriver, mais au cas où
    return this.executeFallback(fallbackFn, config.fallbackData);
  }

  /**
   * Exécution du fallback avec gestion d'erreur
   */
  private async executeFallback<T>(
    fallbackFn: () => Promise<T> | T,
    fallbackData?: any
  ): Promise<T> {
    try {
      const result = await fallbackFn();
      return result;
    } catch (fallbackError) {
      console.error('Fallback function also failed:', fallbackError);
      
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      
      throw new Error('Both primary and fallback operations failed');
    }
  }

  /**
   * Timeout wrapper
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  }

  /**
   * Calcul du délai de backoff exponentiel
   */
  private calculateBackoffDelay(attempt: number, multiplier: number): number {
    const baseDelay = 1000; // 1 seconde
    const maxDelay = 30000;  // 30 secondes max
    
    const delay = baseDelay * Math.pow(multiplier, attempt - 1);
    return Math.min(delay, maxDelay);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Récupération ou création du circuit breaker
   */
  private getCircuitBreaker(operation: string): CircuitBreaker {
    if (!this.circuitBreakers.has(operation)) {
      this.circuitBreakers.set(operation, new CircuitBreaker());
    }
    return this.circuitBreakers.get(operation)!;
  }

  /**
   * Fallbacks prêts à l'emploi pour les opérations courantes
   */
  static readonly CommonFallbacks = {
    // Scoring fallback
    calculateScoreFallback: (request: any) => ({
      total_score: 65,
      breakdown: {
        price: 70,
        quality: 60,
        fit: 65,
        delay: 70,
        risk: 60,
        completion_probability: 65
      },
      explanations: ['Score calculé en mode fallback - données limitées'],
      confidence: 50
    }),

    // Price recommendation fallback
    recommendPriceFallback: (request: any) => {
      const baseBudget = request.mission?.budget || 3000;
      return {
        price_range: {
          min: Math.round(baseBudget * 0.8),
          recommended: baseBudget,
          max: Math.round(baseBudget * 1.2)
        },
        confidence: 50,
        reasoning: ['Prix basé sur budget initial', 'Calcul en mode fallback'],
        market_position: 'competitive'
      };
    },

    // Semantic matching fallback
    semanticMatchingFallback: (request: any) => {
      const results = request.providers?.map((provider: any, index: number) => ({
        provider_id: provider.id,
        overall_match_score: 60 + Math.random() * 20,
        confidence_level: 40,
        match_breakdown: {
          semantic_similarity: 60,
          skills_compatibility: 65,
          experience_alignment: 60,
          budget_fit: 70,
          quality_score: 60,
          availability_match: 80,
          location_bonus: 0
        },
        recommendation_level: 'fair' as const,
        explanation: {
          why_recommended: ['Calcul en mode fallback'],
          risk_factors: ['Données limitées pour l\'analyse'],
          success_indicators: ['Profil basique validé']
        }
      })) || [];

      return results.sort((a: any, b: any) => b.overall_match_score - a.overall_match_score);
    },

    // Project standardization fallback
    standardizeProjectFallback: (projectData: any) => ({
      title_std: projectData.title || 'Projet sans titre',
      summary_std: projectData.description?.substring(0, 200) || 'Description manquante',
      acceptance_criteria: ['Livraison conforme aux attentes'],
      category_std: projectData.category || 'general',
      sub_category_std: 'undefined',
      tags_std: [],
      skills_std: projectData.skills_required || [],
      constraints_std: [],
      brief_quality_score: 40,
      richness_score: 30,
      missing_info: ['budget', 'timeline', 'specific_requirements'],
      technical_complexity: 5,
      business_value_indicator: 50,
      market_positioning_suggestion: 'standard',
      optimization_recommendations: ['Ajouter plus de détails au brief']
    }),

    // Neural pricing fallback
    neuralPricingFallback: (request: any) => {
      const budget = request.mission?.budget || 3000;
      return {
        optimal_price: budget,
        price_confidence: 40,
        price_ranges: {
          conservative: { min: Math.round(budget * 0.9), max: Math.round(budget * 1.1) },
          competitive: { min: Math.round(budget * 0.8), max: budget },
          aggressive: { min: Math.round(budget * 0.7), max: Math.round(budget * 0.9) }
        },
        winning_probability: {
          at_optimal_price: 0.6,
          at_market_price: 0.7,
          at_budget_limit: 0.8
        },
        market_insights: {
          price_trend: 'stable' as const,
          demand_forecast: 'Analyse limitée en mode fallback',
          optimal_timing: 'immediate',
          competitive_positioning: 'standard'
        }
      };
    }
  };

  /**
   * Métriques des circuit breakers
   */
  getCircuitBreakerMetrics() {
    const metrics: Record<string, any> = {};
    
    for (const [operation, breaker] of this.circuitBreakers) {
      metrics[operation] = breaker.getState();
    }
    
    return metrics;
  }

  /**
   * Reset d'un circuit breaker spécifique
   */
  resetCircuitBreaker(operation: string): boolean {
    const breaker = this.circuitBreakers.get(operation);
    if (breaker) {
      breaker.onSuccess();
      return true;
    }
    return false;
  }

  /**
   * Reset de tous les circuit breakers
   */
  resetAllCircuitBreakers(): void {
    for (const breaker of this.circuitBreakers.values()) {
      breaker.onSuccess();
    }
  }
}

export const fallbackManager = FallbackManager.getInstance();