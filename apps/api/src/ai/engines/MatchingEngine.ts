/**
 * Moteur de matching sémantique unifié
 * Centralise la logique de matching intelligent avec IA
 */

import { aiCache } from '../core/AICache';
import { fallbackManager, FallbackManager } from '../core/FallbackManager';
import { geminiClient } from '../core/GeminiClient';

export interface MatchingRequest {
  mission: {
    title: string;
    description: string;
    category: string;
    skills_required: string[];
    complexity: number;
    budget: number;
    location?: string;
    remote_allowed?: boolean;
  };
  providers: Array<{
    id: string;
    name: string;
    description: string;
    skills: string[];
    categories: string[];
    portfolio_projects: string[];
    rating: number;
    completed_projects: number;
    location?: string;
    remote_preference?: boolean;
    hourly_rate?: number;
    availability?: number;
  }>;
  matching_preferences?: {
    prioritize_quality: boolean;
    prioritize_price: boolean;
    prioritize_location: boolean;
    min_rating: number;
    max_budget_variance: number;
  };
}

export interface MatchingResult {
  provider_id: string;
  overall_match_score: number;
  confidence_level: number;
  match_breakdown: {
    semantic_similarity: number;
    skills_compatibility: number;
    experience_alignment: number;
    budget_fit: number;
    quality_score: number;
    availability_match: number;
    location_bonus: number;
  };
  compatibility_analysis: {
    strengths: string[];
    potential_concerns: string[];
    synergy_indicators: string[];
  };
  recommendation_level: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
  explanation: {
    why_recommended: string[];
    risk_factors: string[];
    success_indicators: string[];
  };
  collaboration_prediction: {
    success_probability: number;
    communication_fit: number;
    technical_alignment: number;
    timeline_feasibility: number;
  };
  gemini_analysis?: any;
}

export class MatchingEngine {
  private static instance: MatchingEngine;

  private semanticWeights = {
    content_similarity: 0.25,
    skills_match: 0.30,
    experience: 0.20,
    budget_fit: 0.15,
    quality: 0.10
  };

  private stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on',
    'ce', 'cette', 'ces', 'ceux', 'celle', 'celles',
    'pour', 'par', 'avec', 'sans', 'sous', 'sur', 'dans', 'vers', 'chez',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
  ]);

  private skillSynonyms = {
    'javascript': ['js', 'node', 'nodejs', 'react', 'vue', 'angular'],
    'python': ['django', 'flask', 'fastapi', 'pytorch', 'tensorflow'],
    'design': ['ui', 'ux', 'interface', 'wireframe', 'mockup', 'figma', 'sketch'],
    'web': ['website', 'site', 'webapp', 'frontend', 'backend'],
    'mobile': ['app', 'application', 'ios', 'android', 'react-native', 'flutter'],
    'marketing': ['seo', 'sem', 'ads', 'campaign', 'growth', 'analytics']
  };

  private constructor() {}

  public static getInstance(): MatchingEngine {
    if (!MatchingEngine.instance) {
      MatchingEngine.instance = new MatchingEngine();
    }
    return MatchingEngine.instance;
  }

  /**
   * Matching sémantique profond avec IA
   */
  async performDeepMatching(request: MatchingRequest): Promise<MatchingResult[]> {
    const cacheKey = `deep_matching_${JSON.stringify(request.mission)}_${request.providers.length}`;

    return fallbackManager.executeWithFallback(
      'semantic_matching',
      () => this.performAIMatching(request, cacheKey),
      () => this.semanticMatchingFallback(request),
      {
        maxRetries: 2,
        logErrors: true,
        fallbackData: FallbackManager.CommonFallbacks.semanticMatchingFallback(request)
      }
    );
  }

  /**
   * Matching principal avec enrichissement IA
   */
  private async performAIMatching(request: MatchingRequest, cacheKey: string): Promise<MatchingResult[]> {
    return aiCache.getCachedOrFetch(cacheKey, async () => {
      const results: MatchingResult[] = [];

      // Traitement en parallèle avec limite de concurrence
      const batchSize = 5;
      for (let i = 0; i < request.providers.length; i += batchSize) {
        const batch = request.providers.slice(i, i + batchSize);
        const batchPromises = batch.map(provider => 
          this.calculateProviderMatch(request.mission, provider, request.matching_preferences)
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Tri par score global avec boost qualité si demandé
      results.sort((a, b) => {
        let scoreA = a.overall_match_score;
        let scoreB = b.overall_match_score;
        
        if (request.matching_preferences?.prioritize_quality) {
          scoreA += a.match_breakdown.quality_score * 0.2;
          scoreB += b.match_breakdown.quality_score * 0.2;
        }
        
        return scoreB - scoreA;
      });

      return results;
    }, 600000); // Cache 10 minutes pour matching
  }

  /**
   * Calcul du match pour un prestataire
   */
  private async calculateProviderMatch(mission: any, provider: any, preferences: any): Promise<MatchingResult> {
    // 1. Analyse sémantique profonde
    const semanticSimilarity = this.calculateSemanticSimilarity(mission, provider);
    
    // 2. Compatibilité des compétences avec synonymes
    const skillsCompatibility = this.calculateSkillsCompatibility(mission.skills_required, provider.skills);
    
    // 3. Alignement expérience
    const experienceAlignment = this.calculateExperienceAlignment(mission, provider);
    
    // 4. Adéquation budget
    const budgetFit = this.calculateBudgetFit(mission, provider);
    
    // 5. Score qualité
    const qualityScore = this.calculateQualityScore(provider);
    
    // 6. Disponibilité
    const availabilityMatch = this.calculateAvailabilityMatch(provider);
    
    // 7. Bonus localisation
    const locationBonus = this.calculateLocationBonus(mission, provider);

    // Score global pondéré
    const overallMatchScore = this.calculateOverallScore({
      semanticSimilarity,
      skillsCompatibility,
      experienceAlignment,
      budgetFit,
      qualityScore,
      availabilityMatch,
      locationBonus
    });

    // 8. Enrichissement Gemini en parallèle
    const geminiAnalysisPromise = this.getGeminiMatchingAnalysis(mission, provider);

    // 9. Analyse de compatibilité
    const compatibilityAnalysis = this.analyzeCompatibility(mission, provider, {
      semanticSimilarity,
      skillsCompatibility,
      experienceAlignment,
      budgetFit,
      qualityScore
    });

    // 10. Niveau de recommandation
    const recommendationLevel = this.determineRecommendationLevel(overallMatchScore, qualityScore);

    // 11. Explications détaillées
    const explanation = this.generateExplanations(mission, provider, {
      semanticSimilarity,
      skillsCompatibility,
      experienceAlignment,
      budgetFit,
      qualityScore,
      overallMatchScore
    });

    // 12. Prédiction collaboration
    const collaborationPrediction = this.predictCollaboration(mission, provider, {
      skillsCompatibility,
      experienceAlignment,
      qualityScore,
      semanticSimilarity
    });

    // 13. Attendre analyse Gemini
    const geminiAnalysis = await geminiAnalysisPromise;

    // 14. Enrichissement final avec IA
    const enrichedResult = this.enrichWithGeminiAnalysis({
      provider_id: provider.id,
      overall_match_score: overallMatchScore,
      confidence_level: this.calculateConfidence(semanticSimilarity, skillsCompatibility, qualityScore),
      match_breakdown: {
        semantic_similarity: semanticSimilarity,
        skills_compatibility: skillsCompatibility,
        experience_alignment: experienceAlignment,
        budget_fit: budgetFit,
        quality_score: qualityScore,
        availability_match: availabilityMatch,
        location_bonus: locationBonus
      },
      compatibility_analysis: compatibilityAnalysis,
      recommendation_level: recommendationLevel,
      explanation,
      collaboration_prediction: collaborationPrediction
    }, geminiAnalysis);

    return enrichedResult;
  }

  /**
   * Analyse Gemini pour enrichir le matching
   */
  private async getGeminiMatchingAnalysis(mission: any, provider: any): Promise<any> {
    try {
      const prompt = {
        mission: {
          title: mission.title,
          description: mission.description,
          category: mission.category,
          skills: mission.skills_required,
          complexity: mission.complexity
        },
        provider: {
          name: provider.name,
          description: provider.description,
          skills: provider.skills,
          experience: provider.completed_projects,
          rating: provider.rating,
          portfolio: provider.portfolio_projects?.slice(0, 3) // Top 3 projets
        },
        task: "Analyse la compatibilité entre cette mission et ce prestataire. Identifie les synergies, les risques potentiels et donne une recommandation. Format: { compatibility_score: number, synergies: string[], risks: string[], recommendation: string }"
      };

      const response = await geminiClient.generateContent({
        prompt: JSON.stringify(prompt),
        phase: 'matching',
        options: { useCache: true }
      });

      if (response.success && response.parsed) {
        return response.parsed;
      }
      
      return null;
    } catch (error) {
      console.warn('Gemini matching analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Enrichissement avec analyse Gemini
   */
  private enrichWithGeminiAnalysis(baseResult: MatchingResult, geminiAnalysis: any): MatchingResult {
    if (!geminiAnalysis) {
      return { ...baseResult, gemini_analysis: null };
    }

    const enriched = { ...baseResult };

    // Ajustement du score avec insights Gemini
    if (geminiAnalysis.compatibility_score) {
      const geminiWeight = 0.15; // 15% d'influence
      enriched.overall_match_score = Math.round(
        enriched.overall_match_score * (1 - geminiWeight) + 
        geminiAnalysis.compatibility_score * geminiWeight
      );
    }

    // Enrichissement des analyses de compatibilité
    if (geminiAnalysis.synergies?.length > 0) {
      enriched.compatibility_analysis.synergy_indicators.push(
        ...geminiAnalysis.synergies.slice(0, 2).map((s: string) => `🤖 ${s}`)
      );
    }

    if (geminiAnalysis.risks?.length > 0) {
      enriched.compatibility_analysis.potential_concerns.push(
        ...geminiAnalysis.risks.slice(0, 2).map((r: string) => `⚠️ ${r}`)
      );
    }

    // Enrichissement des explications
    if (geminiAnalysis.recommendation) {
      enriched.explanation.why_recommended.unshift(`🤖 IA: ${geminiAnalysis.recommendation}`);
    }

    // Ajustement confiance
    if (geminiAnalysis.confidence) {
      enriched.confidence_level = Math.round((enriched.confidence_level + geminiAnalysis.confidence) / 2);
    }

    enriched.gemini_analysis = geminiAnalysis;
    return enriched;
  }

  /**
   * Calculs de matching (méthodes existantes optimisées)
   */
  private calculateSemanticSimilarity(mission: any, provider: any): number {
    const missionText = `${mission.title} ${mission.description}`.toLowerCase();
    const providerText = `${provider.description} ${provider.portfolio_projects?.join(' ') || ''}`.toLowerCase();
    
    return this.calculateTFIDFSimilarity(missionText, providerText);
  }

  private calculateSkillsCompatibility(requiredSkills: string[], providerSkills: string[]): number {
    if (!requiredSkills?.length) return 80;
    if (!providerSkills?.length) return 20;

    let matchedSkills = 0;
    const requiredLower = requiredSkills.map(s => s.toLowerCase());
    const providerLower = providerSkills.map(s => s.toLowerCase());

    for (const required of requiredLower) {
      // Match direct
      if (providerLower.some(p => p.includes(required) || required.includes(p))) {
        matchedSkills++;
        continue;
      }

      // Match avec synonymes
      for (const [skill, synonyms] of Object.entries(this.skillSynonyms)) {
        if (required.includes(skill) || synonyms.some(syn => required.includes(syn))) {
          if (providerLower.some(p => p.includes(skill) || synonyms.some(syn => p.includes(syn)))) {
            matchedSkills++;
            break;
          }
        }
      }
    }

    return Math.round((matchedSkills / requiredSkills.length) * 100);
  }

  private calculateExperienceAlignment(mission: any, provider: any): number {
    let score = 0;
    
    // Correspondance catégorie
    if (provider.categories?.includes(mission.category)) score += 30;
    
    // Bonus projets complétés
    score += Math.min(40, provider.completed_projects * 3);
    
    // Bonus rating
    if (provider.rating >= 4.5) score += 20;
    else if (provider.rating >= 4.0) score += 10;
    
    // Correspondance portfolio
    if (provider.portfolio_projects?.length > 0) {
      const portfolioMatch = provider.portfolio_projects.some((project: string) => 
        project.toLowerCase().includes(mission.category.toLowerCase())
      );
      if (portfolioMatch) score += 10;
    }

    return Math.min(100, score);
  }

  private calculateBudgetFit(mission: any, provider: any): number {
    if (!provider.hourly_rate || !mission.budget) return 70;
    
    const estimatedCost = provider.hourly_rate * 40; // 40h estimées
    const ratio = estimatedCost / mission.budget;
    
    if (ratio <= 0.8) return 95; // Très compétitif
    if (ratio <= 1.0) return 85; // Dans le budget
    if (ratio <= 1.2) return 70; // Légèrement au-dessus
    if (ratio <= 1.5) return 50; // Cher
    return 25; // Très cher
  }

  private calculateQualityScore(provider: any): number {
    let score = 0;
    
    // Score rating (50% du total)
    score += (provider.rating / 5) * 50;
    
    // Score expérience (30% du total)
    score += Math.min(30, provider.completed_projects * 2);
    
    // Score portfolio (20% du total)
    if (provider.portfolio_projects?.length > 0) {
      score += Math.min(20, provider.portfolio_projects.length * 4);
    }

    return Math.round(score);
  }

  private calculateAvailabilityMatch(provider: any): number {
    if (provider.availability === undefined) return 80;
    return provider.availability * 100;
  }

  private calculateLocationBonus(mission: any, provider: any): number {
    if (!mission.location || !provider.location) return 0;
    
    const sameLocation = mission.location.toLowerCase().includes(provider.location.toLowerCase());
    if (sameLocation) return 10;
    
    // Bonus pour préférence remote
    if (mission.remote_allowed && provider.remote_preference) return 5;
    
    return 0;
  }

  private calculateOverallScore(scores: any): number {
    return Math.round(
      scores.semanticSimilarity * this.semanticWeights.content_similarity +
      scores.skillsCompatibility * this.semanticWeights.skills_match +
      scores.experienceAlignment * this.semanticWeights.experience +
      scores.budgetFit * this.semanticWeights.budget_fit +
      scores.qualityScore * this.semanticWeights.quality +
      scores.availabilityMatch * 0.05 +
      scores.locationBonus
    );
  }

  /**
   * Utilitaires et méthodes auxiliaires
   */
  private calculateTFIDFSimilarity(text1: string, text2: string): number {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return Math.round((intersection.length / union.length) * 100);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  private analyzeCompatibility(mission: any, provider: any, scores: any) {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const synergies: string[] = [];

    if (scores.skillsCompatibility > 80) {
      strengths.push("Excellente correspondance des compétences");
    }
    
    if (scores.qualityScore > 80) {
      strengths.push("Prestataire de haute qualité");
    }
    
    if (scores.budgetFit > 85) {
      strengths.push("Prix compétitif");
    }

    if (scores.skillsCompatibility < 60) {
      concerns.push("Correspondance partielle des compétences");
    }
    
    if (scores.budgetFit < 50) {
      concerns.push("Prix potentiellement élevé");
    }

    if (scores.semanticSimilarity > 70 && scores.experienceAlignment > 70) {
      synergies.push("Forte synergie expérience-projet");
    }

    return { strengths, potential_concerns: concerns, synergy_indicators: synergies };
  }

  private determineRecommendationLevel(overallScore: number, qualityScore: number): 'excellent' | 'very_good' | 'good' | 'fair' | 'poor' {
    if (overallScore >= 85 && qualityScore >= 80) return 'excellent';
    if (overallScore >= 75) return 'very_good';
    if (overallScore >= 65) return 'good';
    if (overallScore >= 50) return 'fair';
    return 'poor';
  }

  private generateExplanations(mission: any, provider: any, scores: any) {
    const whyRecommended: string[] = [];
    const riskFactors: string[] = [];
    const successIndicators: string[] = [];

    if (scores.skillsCompatibility > 75) {
      whyRecommended.push("Compétences alignées avec les besoins");
      successIndicators.push("Maîtrise technique confirmée");
    }

    if (scores.qualityScore > 80) {
      whyRecommended.push("Profil prestataire excellent");
      successIndicators.push("Historique de qualité éprouvé");
    }

    if (scores.budgetFit < 60) {
      riskFactors.push("Prix potentiellement au-dessus du budget");
    }

    if (provider.completed_projects < 5) {
      riskFactors.push("Expérience limitée du prestataire");
    }

    return {
      why_recommended: whyRecommended,
      risk_factors: riskFactors,
      success_indicators: successIndicators
    };
  }

  private predictCollaboration(mission: any, provider: any, scores: any) {
    const successProbability = (scores.skillsCompatibility + scores.qualityScore + scores.experienceAlignment) / 300;
    
    return {
      success_probability: Math.round(successProbability * 100) / 100,
      communication_fit: provider.rating >= 4.5 ? 0.85 : 0.70,
      technical_alignment: scores.skillsCompatibility / 100,
      timeline_feasibility: provider.availability || 0.80
    };
  }

  private calculateConfidence(semantic: number, skills: number, quality: number): number {
    const factors = [semantic, skills, quality];
    const avg = factors.reduce((sum, val) => sum + val, 0) / factors.length;
    return Math.round(Math.min(95, Math.max(30, avg * 0.8 + 20)));
  }

  /**
   * Fallback de matching
   */
  private semanticMatchingFallback(request: MatchingRequest): MatchingResult[] {
    return FallbackManager.CommonFallbacks.semanticMatchingFallback(request);
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

export const matchingEngine = MatchingEngine.getInstance();