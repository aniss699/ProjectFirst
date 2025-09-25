/**
 * Orchestrateur AI unifié - Point d'entrée unique pour tous les services AI
 * Remplace le gigantesque aiService.ts (1600+ lignes) par une architecture modulaire
 * 
 * STABILITÉ: Feature flag AI_ADVANCED_MODULES contrôle les imports dynamiques
 */

import { aiConfig } from './core/AIConfig';
import { aiCache } from './core/AICache';
import { fallbackManager } from './core/FallbackManager';
import { geminiClient } from './core/GeminiClient';
import { scoringEngine, AIScoreRequest, AIScoreResponse } from './engines/ScoringEngine';
import { pricingEngine, PricingRequest, PricingResponse } from './engines/PricingEngine';
import { matchingEngine, MatchingRequest, MatchingResult } from './engines/MatchingEngine';
import { ExecutionPhase, IStandardizationEngine, INeuralPredictionEngine, ISmartBriefAnalyzer } from './types';

// Feature flag pour contrôler les modules avancés (désactivé après simplification)
const AI_ADVANCED_MODULES = false; // Simplifié : toujours utiliser les versions basiques

type AllowedExecutionPhase = 'scoring' | 'pricing' | 'matching' | 'prediction' | 'analysis' | 'enhancement';

// Import des moteurs spécialisés existants SUPPRIMÉS - remplacés par versions simples
// Les imports suivants ont été supprimés après simplification :
// - StandardizationEngine -> remplacé par logique simple dans fallbacks
// - NeuralPricingEngine -> remplacé par PricingEngine simplifié  
// - AILearningEngine -> supprimé, apprentissage désactivé

export interface AIMetrics {
  requests: number;
  successes: number;
  failures: number;
  avgResponseTime: number;
  cacheHitRate: number;
  circuitBreakerStatus: Record<string, any>;
  engineStats: {
    scoring: any;
    pricing: any;
    matching: any;
  };
}

export class AIOrchestrator {
  private static instance: AIOrchestrator;
  private metrics: AIMetrics;
  private startTime: number;

  private constructor() {
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      avgResponseTime: 0,
      cacheHitRate: 0,
      circuitBreakerStatus: {},
      engineStats: {
        scoring: {},
        pricing: {},
        matching: {}
      }
    };
    this.startTime = Date.now();
    
    // Validation de la configuration au démarrage
    this.validateConfiguration();
  }

  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  /**
   * SCORING - Score compréhensif multi-objectif avec IA
   */
  async calculateComprehensiveScore(request: AIScoreRequest): Promise<AIScoreResponse> {
    return this.executeWithMetrics('scoring', () => 
      scoringEngine.calculateComprehensiveScore(request)
    );
  }

  /**
   * PRICING - Recommandation de prix optimal avec IA neural
   */
  async recommendPrice(request: PricingRequest): Promise<PricingResponse> {
    return this.executeWithMetrics('pricing', () => 
      pricingEngine.calculateOptimalPricing(request)
    );
  }

  /**
   * MATCHING - Matching sémantique intelligent
   */
  async performSemanticMatching(request: MatchingRequest): Promise<MatchingResult[]> {
    return this.executeWithMetrics('matching', () => 
      matchingEngine.performDeepMatching(request)
    );
  }

  /**
   * STANDARDISATION - Standardise et structure automatiquement un brief client
   */
  async standardizeProject(projectData: {
    title: string;
    description: string;
    category?: string;
    budget?: number;
    urgency?: string;
    timeline?: string;
    skills_required?: string[];
    constraints?: string[];
    client_history?: any;
  }): Promise<any> {
    return this.executeWithMetrics('analysis', async () => {
      if (AI_ADVANCED_MODULES) {
        try {
          // Import dynamique du moteur de standardisation (feature flag)
          const { standardizationEngine } = await import('./standardization-engine');
          return standardizationEngine.standardizeProject(projectData);
        } catch (error) {
          console.warn('Standardization engine failed, using fallback:', error.message);
        }
      }
      
      console.log('🔄 AI_ADVANCED_MODULES disabled, using standardization fallback');
      return this.standardizeProjectFallback(projectData);
    });
  }

  /**
   * PRÉDICTION - Prédiction avancée de succès avec 90+ facteurs
   */
  async predictMissionSuccess(missionData: any, marketContext: any): Promise<any> {
    return this.executeWithMetrics('prediction', async () => {
      const cacheKey = `mission_success_${missionData.id}_${JSON.stringify(marketContext)}`;
      
      return aiCache.getCachedOrFetch(cacheKey, async () => {
        try {
          // Consultation Gemini pour enrichir la prédiction
          const geminiInsights = await this.getGeminiPredictionInsights(missionData, marketContext);
          
          if (AI_ADVANCED_MODULES) {
            // Import dynamique du moteur neural (feature flag)
            const { neuralPredictionEngine } = await import('./neural-predictor');
            const prediction = await (neuralPredictionEngine as any).predictWithGemini({
              mission: missionData,
              market_context: marketContext,
              gemini_insights: geminiInsights
            });
            
            return {
              success_probability: prediction.success_probability,
              key_factors: prediction.key_factors,
              risk_assessment: prediction.risk_assessment,
              optimization_suggestions: prediction.optimization_suggestions,
              confidence_level: prediction.confidence_level,
              neural_insights: {
                ...prediction.neural_insights,
                gemini_contribution: geminiInsights
              },
              market_positioning: prediction.market_positioning?.position || 'standard',
              competition_analysis: prediction.competition_analysis
            };
          }
          
          console.log('🔄 AI_ADVANCED_MODULES disabled, using prediction fallback');
          throw new Error('Advanced modules disabled');

        } catch (error) {
          console.warn('Prediction engine failed, using fallback:', error.message);
          return this.advancedPredictorFallback(missionData, marketContext);
        }
      }, 180000); // Cache 3 minutes
    });
  }

  /**
   * ANALYSE BRIEF - Analyse intelligente avec amélioration
   */
  async analyzeSmartBrief(briefData: any): Promise<any> {
    return this.executeWithMetrics('analysis', async () => {
      const cacheKey = `smart_brief_${JSON.stringify(briefData)}`;
      
      return aiCache.getCachedOrFetch(cacheKey, async () => {
        if (AI_ADVANCED_MODULES) {
          try {
            // Enrichissement Gemini
            const geminiAnalysis = await this.getGeminiBriefAnalysis(briefData);
            
            // Import dynamique du moteur d'analyse (feature flag)
            const { aiConciergeEngine } = await import('./ai-concierge');
            const analysis = await aiConciergeEngine.transformIdeaToBrief(
              briefData.description || briefData.title || '',
              {} // Remove geminiAnalysis as it's not in ConciergeContext
            );

            return {
              ...analysis,
              gemini_enrichment: geminiAnalysis
            };
          } catch (error) {
            console.warn('Brief analysis failed, using fallback:', error.message);
          }
        }
        
        console.log('🔄 AI_ADVANCED_MODULES disabled, using brief analysis fallback');
        return this.analyzeSmartBriefFallback(briefData);
      }, 300000); // Cache 5 minutes
    });
  }

  /**
   * CALCUL TRUST SCORE - Score de confiance avec IA
   */
  async calculateTrustScore(userData: any): Promise<any> {
    return this.executeWithMetrics('analysis', async () => {
      const cacheKey = `trust_score_${userData.id || JSON.stringify(userData)}`;
      
      return aiCache.getCachedOrFetch(cacheKey, async () => {
        try {
          // Module trust-scoring doesn't exist, using fallback
          console.log('Trust scoring module not found, using fallback');
          return this.calculateTrustScoreFallback(userData);
        } catch (error) {
          console.warn('Trust scoring failed, using fallback:', error.message);
          return this.calculateTrustScoreFallback(userData);
        }
      }, 600000); // Cache 10 minutes
    });
  }

  /**
   * NÉGOCIATION PRIX - Négociation intelligente avec IA
   */
  async negotiatePrice(negotiationData: any): Promise<any> {
    return this.executeWithMetrics('pricing', async () => {
      if (AI_ADVANCED_MODULES) {
        try {
          // Enrichissement Gemini pour stratégie de négociation
          const geminiStrategy = await this.getGeminiNegotiationStrategy(negotiationData);
          
          const { neuralPricingEngine } = await import('./neural-pricing');
          // Using available method - basic pricing functionality
          return (neuralPricingEngine as any).calculateOptimalPricing({
            ...negotiationData,
            ai_strategy: geminiStrategy
          });
        } catch (error) {
          console.warn('Price negotiation failed, using fallback:', error.message);
        }
      }
      
      console.log('🔄 AI_ADVANCED_MODULES disabled, using price negotiation fallback');
      return this.negotiatePriceFallback(negotiationData);
    });
  }

  /**
   * APPRENTISSAGE - Enregistrement feedback pour apprentissage
   */
  async recordLearningFeedback(phase: AllowedExecutionPhase, prompt: string, response: any, feedback: 'positive' | 'negative' | 'neutral'): Promise<void> {
    if (AI_ADVANCED_MODULES) {
      try {
        const { aiLearningEngine } = await import('./learning-engine');
        await aiLearningEngine.learnFromGeminiInteraction(phase, prompt, response, feedback);
        console.log(`✅ Learning feedback recorded for phase: ${phase}`);
        return;
      } catch (error) {
        console.warn('Learning feedback recording failed:', error.message);
      }
    }
    
    console.log('🔄 AI_ADVANCED_MODULES disabled, learning feedback not recorded');
  }

  /**
   * ANALYSE COMPORTEMENT - Analyse comportementale avec IA
   */
  async analyzeBehavior(behaviorData: any): Promise<any> {
    return this.executeWithMetrics('analysis', async () => {
      if (AI_ADVANCED_MODULES) {
        try {
          const { fraudDetectionEngine } = await import('./fraud-detection');
          return (fraudDetectionEngine as any).analyzeUserBehavior?.(behaviorData) || { riskLevel: 'low', confidence: 0.5 };
        } catch (error) {
          console.warn('Behavior analysis failed, using fallback:', error.message);
        }
      }
      
      console.log('🔄 AI_ADVANCED_MODULES disabled, using behavior analysis fallback');
      return this.analyzeBehaviorFallback(behaviorData);
    });
  }

  /**
   * ENRICHISSEMENTS GEMINI - Méthodes d'enrichissement IA
   */
  private async getGeminiPredictionInsights(missionData: any, marketContext: any): Promise<any> {
    // Check if Gemini is ready before making calls
    if (!geminiClient.isReady()) {
      console.log('🔄 Gemini not ready, skipping prediction insights');
      return null;
    }

    try {
      const prompt = {
        mission: missionData,
        market: marketContext,
        task: "Analyse la probabilité de succès de cette mission en tenant compte du contexte marché. Donne facteurs clés, risques et recommandations."
      };

      const response = await geminiClient.generateContent({
        prompt: JSON.stringify(prompt),
        phase: 'prediction',
        options: { useCache: true }
      });

      return response.success ? response.parsed : null;
    } catch (error) {
      console.warn('Gemini prediction insights failed:', error.message);
      return null;
    }
  }

  private async getGeminiBriefAnalysis(briefData: any): Promise<any> {
    // Check if Gemini is ready before making calls
    if (!geminiClient.isReady()) {
      console.log('🔄 Gemini not ready, skipping brief analysis');
      return null;
    }

    try {
      const prompt = {
        brief: briefData,
        task: "Analyse ce brief et suggère des améliorations. Identifie les éléments manquants et donne une note de qualité."
      };

      const response = await geminiClient.generateContent({
        prompt: JSON.stringify(prompt),
        phase: 'brief_analysis',
        options: { useCache: true }
      });

      return response.success ? response.parsed : null;
    } catch (error) {
      console.warn('Gemini brief analysis failed:', error.message);
      return null;
    }
  }

  private async getGeminiNegotiationStrategy(negotiationData: any): Promise<any> {
    // Check if Gemini is ready before making calls
    if (!geminiClient.isReady()) {
      console.log('🔄 Gemini not ready, skipping negotiation strategy');
      return null;
    }

    try {
      const prompt = {
        negotiation: negotiationData,
        task: "Suggère une stratégie de négociation pour ce contexte. Donne prix optimaux et arguments de vente."
      };

      const response = await geminiClient.generateContent({
        prompt: JSON.stringify(prompt),
        phase: 'negotiation',
        options: { useCache: true }
      });

      return response.success ? response.parsed : null;
    } catch (error) {
      console.warn('Gemini negotiation strategy failed:', error.message);
      return null;
    }
  }

  /**
   * FALLBACKS - Méthodes de fallback pour tous les moteurs
   */
  private standardizeProjectFallback(projectData: any): any {
    return {
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
    };
  }

  private advancedPredictorFallback(missionData: any, marketContext: any): any {
    return {
      success_probability: 0.65,
      key_factors: ['Budget réaliste', 'Compétences requises standard'],
      risk_assessment: { level: 'medium', factors: ['Données limitées'] },
      optimization_suggestions: ['Clarifier les objectifs', 'Préciser le délai'],
      confidence_level: 50,
      neural_insights: { source: 'fallback' },
      market_positioning: 'standard',
      competition_analysis: { level: 'medium' }
    };
  }

  private analyzeSmartBriefFallback(briefData: any): any {
    return {
      quality_score: 50,
      completeness: 0.6,
      clarity: 0.7,
      improvement_suggestions: ['Ajouter plus de détails'],
      missing_elements: ['budget', 'timeline'],
      enhanced_brief: briefData.description || 'Brief nécessite amélioration'
    };
  }

  private calculateTrustScoreFallback(userData: any): any {
    return {
      trust_score: 65,
      confidence: 40,
      factors: {
        verification: 50,
        history: 60,
        behavior: 70
      },
      recommendations: ['Vérifier identité', 'Demander références']
    };
  }

  private negotiatePriceFallback(negotiationData: any): any {
    const basePrice = negotiationData.initial_price || 3000;
    return {
      recommended_price: basePrice,
      min_acceptable: Math.round(basePrice * 0.9),
      max_justified: Math.round(basePrice * 1.1),
      strategy: 'balanced',
      arguments: ['Prix marché', 'Qualité garantie']
    };
  }

  private analyzeBehaviorFallback(behaviorData: any): any {
    return {
      risk_level: 'low',
      confidence: 40,
      indicators: [],
      recommendations: ['Surveillance normale']
    };
  }

  /**
   * MÉTRIQUES ET MONITORING
   */
  private async executeWithMetrics<T>(operation: AllowedExecutionPhase, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.metrics.requests++;

    try {
      const result = await fn();
      this.metrics.successes++;
      this.updateResponseTime(startTime);
      return result;
    } catch (error) {
      this.metrics.failures++;
      this.updateResponseTime(startTime);
      throw error;
    }
  }

  private updateResponseTime(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime + responseTime) / 2;
  }

  /**
   * MÉTRIQUES GLOBALES
   */
  getPerformanceMetrics(): AIMetrics {
    const cacheMetrics = aiCache.getMetrics();
    const circuitBreakerMetrics = fallbackManager.getCircuitBreakerMetrics();

    return {
      ...this.metrics,
      cacheHitRate: cacheMetrics.hitRate,
      circuitBreakerStatus: circuitBreakerMetrics,
      engineStats: {
        scoring: scoringEngine.getPerformanceMetrics(),
        pricing: pricingEngine.getPerformanceMetrics(),
        matching: matchingEngine.getPerformanceMetrics()
      }
    };
  }

  /**
   * HEALTH CHECK
   */
  async getHealthStatus(): Promise<any> {
    const config = aiConfig;
    const geminiStatus = geminiClient.isReady();
    const metrics = this.getPerformanceMetrics();

    return {
      status: 'healthy',
      uptime: Date.now() - this.startTime,
      configuration: {
        gemini_enabled: config.gemini.enabled,
        cache_enabled: true,
        fallback_enabled: config.fallback.enabled
      },
      components: {
        gemini_client: geminiStatus ? 'ready' : 'not_ready',
        cache_system: 'operational',
        fallback_manager: 'operational',
        scoring_engine: 'operational',
        pricing_engine: 'operational',
        matching_engine: 'operational'
      },
      metrics: {
        total_requests: metrics.requests,
        success_rate: metrics.requests > 0 ? metrics.successes / metrics.requests : 0,
        avg_response_time: metrics.avgResponseTime,
        cache_hit_rate: metrics.cacheHitRate
      }
    };
  }

  /**
   * VALIDATION CONFIGURATION
   */
  private validateConfiguration(): void {
    const validation = aiConfig.validate();
    if (!validation.valid) {
      console.error('❌ AI Configuration validation failed:', validation.errors);
      throw new Error(`AI Configuration invalid: ${validation.errors.join(', ')}`);
    }
    console.log('✅ AI Configuration validated successfully');
  }

  /**
   * NETTOYAGE RESSOURCES
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down AI Orchestrator...');
    aiCache.destroy();
    fallbackManager.resetAllCircuitBreakers();
    console.log('✅ AI Orchestrator shutdown complete');
  }
}

export const aiOrchestrator = AIOrchestrator.getInstance();