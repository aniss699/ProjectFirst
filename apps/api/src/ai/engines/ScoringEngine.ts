/**
 * Moteur de scoring unifié
 * Consolide la logique entre packages/core/src/scoring.ts et aiService.calculateComprehensiveScore
 */

import { UnifiedScoringEngine, ScoringFactors, ScoringResult, ScoringOptions } from '../../../../../packages/core/src/scoring';
import { aiCache } from '../core/AICache';
import { fallbackManager, FallbackManager } from '../core/FallbackManager';
import { geminiClient } from '../core/GeminiClient';

export interface AIScoreRequest {
  mission: {
    id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    client_id: string;
    skills_required: string[];
    urgency: string;
    complexity: string;
    duration_weeks: number;
  };
  provider: {
    id: string;
    skills: string[];
    rating: number;
    completed_projects: number;
    location: string;
    hourly_rate: number;
    categories: string[];
    response_time: number;
    success_rate: number;
  };
  bid?: {
    id: string;
    mission_id: string;
    provider_id: string;
    price: number;
    timeline: string;
    proposal: string;
    created_at: string;
  };
}

export interface AIScoreResponse {
  total_score: number;
  breakdown: {
    price: number;
    quality: number;
    fit: number;
    delay: number;
    risk: number;
    completion_probability: number;
  };
  explanations: string[];
  confidence: number;
  gemini_insights?: any;
  market_context?: any;
}

export class ScoringEngine {
  private static instance: ScoringEngine;
  private unifiedEngine: UnifiedScoringEngine;

  private constructor() {
    this.unifiedEngine = new UnifiedScoringEngine();
  }

  public static getInstance(): ScoringEngine {
    if (!ScoringEngine.instance) {
      ScoringEngine.instance = new ScoringEngine();
    }
    return ScoringEngine.instance;
  }

  /**
   * Calcul de score compréhensif avec IA et fallback
   */
  async calculateComprehensiveScore(request: AIScoreRequest): Promise<AIScoreResponse> {
    const cacheKey = `comprehensive_score_${request.mission.id}_${request.provider.id}`;

    return fallbackManager.executeWithFallback(
      'comprehensive_scoring',
      () => this.performAIScoring(request, cacheKey),
      () => this.calculateScoreFallback(request),
      { 
        maxRetries: 2, 
        logErrors: true,
        fallbackData: FallbackManager.CommonFallbacks.calculateScoreFallback(request)
      }
    );
  }

  /**
   * Scoring principal avec enrichissement IA
   */
  private async performAIScoring(request: AIScoreRequest, cacheKey: string): Promise<AIScoreResponse> {
    return aiCache.getCachedOrFetch(cacheKey, async () => {
      // 1. Conversion vers format unifié
      const factors = this.convertToScoringFactors(request);
      
      // 2. Enrichissement Gemini en parallèle
      const geminiInsightsPromise = this.getGeminiInsights(request);
      
      // 3. Calcul base avec moteur unifié
      const baseResult = this.unifiedEngine.calculateScore(
        factors,
        undefined, // weights par défaut
        undefined, // market context sera ajouté
        undefined, // standardization data
        this.extractScoringOptions(request)
      );

      // 4. Attendre insights Gemini
      const geminiInsights = await geminiInsightsPromise;
      
      // 5. Enrichissement avec IA
      const enrichedResult = this.enrichWithAI(baseResult, geminiInsights, request);
      
      return this.convertToAIResponse(enrichedResult, geminiInsights);
    }, 300000); // Cache 5 minutes
  }

  /**
   * Enrichissement Gemini pour améliorer le scoring
   */
  private async getGeminiInsights(request: AIScoreRequest): Promise<any> {
    try {
      const prompt = {
        mission: {
          title: request.mission.title,
          description: request.mission.description,
          category: request.mission.category,
          budget: request.mission.budget,
          skills: request.mission.skills_required
        },
        provider: {
          skills: request.provider.skills,
          rating: request.provider.rating,
          experience: request.provider.completed_projects,
          response_time: request.provider.response_time
        },
        task: "Analyse la correspondance entre cette mission et ce prestataire. Identifie les points forts, faiblesses et risques. Donne une note globale de 0 à 100."
      };

      const response = await geminiClient.generateContent({
        prompt: JSON.stringify(prompt),
        phase: 'scoring',
        options: { useCache: true }
      });

      if (response.success && response.parsed) {
        return response.parsed;
      }
      
      return null;
    } catch (error) {
      console.warn('Gemini insights failed for scoring:', error.message);
      return null;
    }
  }

  /**
   * Enrichissement du score avec insights IA
   */
  private enrichWithAI(baseResult: ScoringResult, geminiInsights: any, request: AIScoreRequest): ScoringResult {
    if (!geminiInsights) return baseResult;

    const enriched = { ...baseResult };

    // Ajustement basé sur l'analyse Gemini
    if (geminiInsights.overall_score) {
      const geminiBonus = (geminiInsights.overall_score - 50) * 0.1; // Ajustement léger
      enriched.totalScore = Math.min(100, Math.max(0, enriched.totalScore + geminiBonus));
    }

    // Ajout d'explications IA
    if (geminiInsights.strengths?.length > 0) {
      enriched.explanations.push(`🤖 IA: ${geminiInsights.strengths[0]}`);
    }

    if (geminiInsights.concerns?.length > 0) {
      enriched.explanations.push(`⚠️ IA: ${geminiInsights.concerns[0]}`);
    }

    // Ajustement confiance
    if (geminiInsights.confidence) {
      enriched.confidence = Math.round((enriched.confidence + geminiInsights.confidence) / 2);
    }

    return enriched;
  }

  /**
   * Conversion du format AIScoreRequest vers ScoringFactors
   */
  private convertToScoringFactors(request: AIScoreRequest): ScoringFactors {
    const priceRatio = request.bid 
      ? request.bid.price / request.mission.budget 
      : request.provider.hourly_rate * request.mission.duration_weeks * 40 / request.mission.budget;

    return {
      priceRatio,
      providerRating: request.provider.rating,
      experienceMatch: this.calculateExperienceMatch(request),
      skillsMatch: this.calculateSkillsMatch(request),
      responseTime: request.provider.response_time,
      successRate: request.provider.success_rate,
      complexityLevel: this.mapComplexity(request.mission.complexity),
      urgencyLevel: this.mapUrgency(request.mission.urgency)
    };
  }

  /**
   * Extraction des options de scoring
   */
  private extractScoringOptions(request: AIScoreRequest): ScoringOptions {
    return {
      boostNewProviders: request.provider.completed_projects < 5,
      penalizeHighRisk: request.provider.rating < 4.0,
      favorLocalProviders: this.isSameLocation(request.mission, request.provider)
    };
  }

  /**
   * Conversion vers format de réponse AI
   */
  private convertToAIResponse(result: ScoringResult, geminiInsights?: any): AIScoreResponse {
    return {
      total_score: result.totalScore,
      breakdown: {
        price: result.breakdown.price,
        quality: result.breakdown.quality,
        fit: result.breakdown.fit,
        delay: result.breakdown.time || result.breakdown.delay,
        risk: result.breakdown.risk,
        completion_probability: result.breakdown.completion_probability || 70
      },
      explanations: result.explanations,
      confidence: result.confidence,
      gemini_insights: geminiInsights,
      market_context: result.marketInsights
    };
  }

  /**
   * Fallback de scoring
   */
  private calculateScoreFallback(request: AIScoreRequest): AIScoreResponse {
    const fallback = FallbackManager.CommonFallbacks.calculateScoreFallback(request);
    
    // Ajustements basés sur les données disponibles
    if (request.provider.rating >= 4.5) {
      fallback.breakdown.quality += 10;
      fallback.breakdown.risk += 10;
    }

    if (request.provider.success_rate >= 0.9) {
      fallback.breakdown.completion_probability += 15;
    }

    // Recalcul du score total
    const weights = { price: 0.25, quality: 0.20, fit: 0.20, delay: 0.15, risk: 0.10, completion_probability: 0.10 };
    fallback.total_score = Math.round(
      Object.entries(fallback.breakdown).reduce((sum, [key, value]) => {
        return sum + (value * (weights[key as keyof typeof weights] || 0));
      }, 0)
    );

    return fallback as AIScoreResponse;
  }

  /**
   * Utilitaires de calcul
   */
  private calculateExperienceMatch(request: AIScoreRequest): number {
    const categoryMatch = request.provider.categories.includes(request.mission.category) ? 20 : 0;
    const projectsBonus = Math.min(30, request.provider.completed_projects * 2);
    return categoryMatch + projectsBonus;
  }

  private calculateSkillsMatch(request: AIScoreRequest): number {
    const requiredSkills = request.mission.skills_required;
    const providerSkills = request.provider.skills;
    
    if (requiredSkills.length === 0) return 70;
    
    const matchedSkills = requiredSkills.filter(skill => 
      providerSkills.some(pSkill => 
        pSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(pSkill.toLowerCase())
      )
    );

    return Math.round((matchedSkills.length / requiredSkills.length) * 100);
  }

  private mapComplexity(complexity: string): 'low' | 'medium' | 'high' {
    if (complexity.toLowerCase().includes('high') || complexity.toLowerCase().includes('complex')) return 'high';
    if (complexity.toLowerCase().includes('medium') || complexity.toLowerCase().includes('moderate')) return 'medium';
    return 'low';
  }

  private mapUrgency(urgency: string): 'low' | 'medium' | 'high' {
    if (urgency.toLowerCase().includes('high') || urgency.toLowerCase().includes('urgent')) return 'high';
    if (urgency.toLowerCase().includes('medium') || urgency.toLowerCase().includes('moderate')) return 'medium';
    return 'low';
  }

  private isSameLocation(mission: any, provider: any): boolean {
    return mission.location && provider.location && 
           mission.location.toLowerCase().includes(provider.location.toLowerCase());
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

export const scoringEngine = ScoringEngine.getInstance();