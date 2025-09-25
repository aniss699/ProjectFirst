/**
 * Système de Correspondance Simple - SwipDEAL
 * Matching basé sur mots-clés et catégories (sans NLP complexe)
 */

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
}

class SimpleMatchingEngine {
  private basicWeights = {
    skills_match: 0.35,     // Le plus important
    category_match: 0.20,   // Correspondance domaine
    experience: 0.20,       // Expérience
    budget_fit: 0.15,       // Adéquation prix
    quality: 0.10          // Note globale
  };

  // Synonymes basiques pour skills matching
  private skillSynonyms: { [key: string]: string[] } = {
    'javascript': ['js', 'node', 'nodejs', 'react', 'vue', 'angular'],
    'python': ['django', 'flask', 'fastapi'],
    'design': ['ui', 'ux', 'interface', 'figma', 'sketch'],
    'web': ['website', 'site', 'frontend', 'backend'],
    'mobile': ['app', 'application', 'ios', 'android', 'flutter'],
    'marketing': ['seo', 'ads', 'campaign', 'analytics']
  };

  async performDeepMatching(request: MatchingRequest): Promise<MatchingResult[]> {
    console.log('🎯 Simple Matching: Processing mission with', request.providers.length, 'providers');
    
    const results: MatchingResult[] = [];

    for (const provider of request.providers) {
      const matchResult = this.calculateBasicMatch(request.mission, provider, request.matching_preferences);
      results.push(matchResult);
    }

    // Tri par score avec boost préférences
    results.sort((a, b) => {
      let scoreA = a.overall_match_score;
      let scoreB = b.overall_match_score;
      
      if (request.matching_preferences?.prioritize_quality) {
        scoreA += a.match_breakdown.quality_score * 0.15;
        scoreB += b.match_breakdown.quality_score * 0.15;
      }
      
      if (request.matching_preferences?.prioritize_price) {
        scoreA += a.match_breakdown.budget_fit * 0.15;
        scoreB += b.match_breakdown.budget_fit * 0.15;
      }
      
      return scoreB - scoreA;
    });

    console.log(`✅ Simple Matching: Processed ${results.length} matches`);
    return results;
  }

  private calculateBasicMatch(mission: any, provider: any, preferences: any): MatchingResult {
    // 1. Match basique des compétences (35%)
    const skills_compatibility = this.calculateSimpleSkillsMatch(mission.skills_required, provider.skills);
    
    // 2. Match catégorie (20%)
    const category_match = this.calculateCategoryMatch(mission.category, provider.categories);
    
    // 3. Expérience (20%)
    const experience_alignment = this.calculateExperienceScore(provider);
    
    // 4. Adéquation budget (15%)
    const budget_fit = this.calculateBudgetMatch(mission, provider);
    
    // 5. Score qualité (10%)
    const quality_score = this.calculateQualityScore(provider);
    
    // Calculs complémentaires
    const availability_match = provider.availability || 0.8;
    const location_bonus = this.calculateLocationBonus(mission, provider);
    
    // Pseudo-sémantique basique (comptage mots-clés)
    const semantic_similarity = this.calculateKeywordSimilarity(mission, provider);

    // Score global pondéré
    const overall_match_score = (
      skills_compatibility * this.basicWeights.skills_match +
      category_match * this.basicWeights.category_match +
      experience_alignment * this.basicWeights.experience +
      budget_fit * this.basicWeights.budget_fit +
      quality_score * this.basicWeights.quality
    );

    // Analyse de compatibilité basique
    const compatibility_analysis = this.generateBasicAnalysis(mission, provider, {
      skills_compatibility,
      category_match,
      experience_alignment,
      budget_fit,
      quality_score
    });

    // Niveau de recommandation
    const recommendation_level = this.classifyRecommendation(overall_match_score);

    return {
      provider_id: provider.id,
      overall_match_score: Math.round(overall_match_score * 100) / 100,
      confidence_level: this.calculateConfidence(overall_match_score, skills_compatibility),
      match_breakdown: {
        semantic_similarity,
        skills_compatibility,
        experience_alignment,
        budget_fit,
        quality_score,
        availability_match,
        location_bonus
      },
      compatibility_analysis,
      recommendation_level,
      explanation: this.generateSimpleExplanation(mission, provider, compatibility_analysis),
      collaboration_prediction: this.predictBasicCollaboration(overall_match_score, provider)
    };
  }

  /**
   * Match simple des compétences avec synonymes basiques
   */
  private calculateSimpleSkillsMatch(required: string[], providerSkills: string[]): number {
    if (required.length === 0) return 1; // Pas d'exigences = match parfait
    
    let matchCount = 0;
    const normalizedRequired = required.map(skill => skill.toLowerCase());
    const normalizedProvider = providerSkills.map(skill => skill.toLowerCase());

    for (const requiredSkill of normalizedRequired) {
      let found = false;
      
      // Match direct
      if (normalizedProvider.some(p => p.includes(requiredSkill) || requiredSkill.includes(p))) {
        matchCount++;
        found = true;
      }
      
      // Match par synonymes basiques
      if (!found) {
        for (const [baseSkill, synonyms] of Object.entries(this.skillSynonyms)) {
          if (requiredSkill.includes(baseSkill) || synonyms.some(syn => requiredSkill.includes(syn))) {
            if (normalizedProvider.some(p => 
              p.includes(baseSkill) || synonyms.some(syn => p.includes(syn))
            )) {
              matchCount += 0.8; // Match partiel via synonyme
              found = true;
              break;
            }
          }
        }
      }
    }

    return Math.min(1, matchCount / normalizedRequired.length);
  }

  /**
   * Match simple de catégorie
   */
  private calculateCategoryMatch(missionCategory: string, providerCategories: string[]): number {
    const missionCat = missionCategory.toLowerCase();
    const providerCats = providerCategories.map(cat => cat.toLowerCase());
    
    // Match exact
    if (providerCats.includes(missionCat)) return 1;
    
    // Match partiel (sous-chaîne)
    if (providerCats.some(cat => cat.includes(missionCat) || missionCat.includes(cat))) {
      return 0.7;
    }
    
    // Catégories proches basiques
    const categoryProximity = {
      'web': ['developpement', 'frontend', 'backend'],
      'design': ['graphisme', 'ui', 'ux'],
      'marketing': ['communication', 'publicite', 'seo']
    };
    
    for (const [base, related] of Object.entries(categoryProximity)) {
      if (missionCat.includes(base) || related.some(r => missionCat.includes(r))) {
        if (providerCats.some(cat => cat.includes(base) || related.some(r => cat.includes(r)))) {
          return 0.5;
        }
      }
    }
    
    return 0.2; // Score minimum
  }

  /**
   * Score d'expérience basique
   */
  private calculateExperienceScore(provider: any): number {
    let score = 0;
    
    // Score basé sur projets complétés
    const projectScore = Math.min(1, provider.completed_projects / 20);
    score += projectScore * 0.6;
    
    // Score basé sur rating
    const ratingScore = Math.min(1, provider.rating / 5);
    score += ratingScore * 0.4;
    
    return score;
  }

  /**
   * Adéquation budget simplifiée
   */
  private calculateBudgetMatch(mission: any, provider: any): number {
    if (!provider.hourly_rate || !mission.budget) return 0.7; // Score neutre
    
    // Estimation simple : budget / taux horaire = heures disponibles
    const estimatedHours = mission.budget / provider.hourly_rate;
    
    // Score optimal entre 20-80h de travail
    if (estimatedHours >= 20 && estimatedHours <= 80) return 1;
    if (estimatedHours >= 10 && estimatedHours <= 100) return 0.8;
    if (estimatedHours >= 5 && estimatedHours <= 120) return 0.6;
    
    return 0.4; // Pas optimal mais possible
  }

  /**
   * Score qualité basique
   */
  private calculateQualityScore(provider: any): number {
    let score = 0;
    
    // Rating (60%)
    score += (provider.rating / 5) * 0.6;
    
    // Nombre de projets complétés (40%)
    const projectScore = Math.min(1, provider.completed_projects / 15);
    score += projectScore * 0.4;
    
    return score;
  }

  /**
   * Bonus localisation simple
   */
  private calculateLocationBonus(mission: any, provider: any): number {
    if (mission.remote_allowed || provider.remote_preference) return 0.1;
    
    if (mission.location && provider.location) {
      if (mission.location.toLowerCase() === provider.location.toLowerCase()) {
        return 0.2;
      }
    }
    
    return 0;
  }

  /**
   * Similarité "sémantique" basique (comptage mots-clés)
   */
  private calculateKeywordSimilarity(mission: any, provider: any): number {
    const missionText = (mission.title + ' ' + mission.description).toLowerCase();
    const providerText = (provider.name + ' ' + provider.description).toLowerCase();
    
    // Mots-clés basiques importants
    const keywords = ['web', 'mobile', 'design', 'marketing', 'development', 'application', 'site'];
    
    let commonKeywords = 0;
    for (const keyword of keywords) {
      if (missionText.includes(keyword) && providerText.includes(keyword)) {
        commonKeywords++;
      }
    }
    
    return Math.min(1, commonKeywords / 3); // Normalisation
  }

  /**
   * Analyse de compatibilité basique
   */
  private generateBasicAnalysis(mission: any, provider: any, scores: any): any {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const synergies: string[] = [];

    if (scores.skills_compatibility > 0.8) {
      strengths.push('Excellente adéquation des compétences');
    }
    if (scores.category_match > 0.8) {
      strengths.push('Spécialiste du domaine');
    }
    if (scores.experience_alignment > 0.8) {
      strengths.push('Expérience solide');
    }
    if (scores.quality_score > 0.8) {
      strengths.push('Prestataire bien noté');
    }

    if (scores.skills_compatibility < 0.5) {
      concerns.push('Compétences à vérifier');
    }
    if (scores.budget_fit < 0.5) {
      concerns.push('Adéquation budget à négocier');
    }

    // Synergies basiques
    if (scores.skills_compatibility > 0.7 && scores.category_match > 0.7) {
      synergies.push('Profil technique adapté au projet');
    }

    return { strengths, potential_concerns: concerns, synergy_indicators: synergies };
  }

  /**
   * Classification niveau recommandation
   */
  private classifyRecommendation(score: number): 'excellent' | 'very_good' | 'good' | 'fair' | 'poor' {
    if (score >= 0.85) return 'excellent';
    if (score >= 0.70) return 'very_good';
    if (score >= 0.55) return 'good';
    if (score >= 0.40) return 'fair';
    return 'poor';
  }

  /**
   * Calcul confiance basique
   */
  private calculateConfidence(overallScore: number, skillsMatch: number): number {
    // Confiance basée sur score global et adéquation skills
    return Math.min(1, (overallScore + skillsMatch) / 2 + 0.1);
  }

  /**
   * Explication simple
   */
  private generateSimpleExplanation(mission: any, provider: any, analysis: any): any {
    const whyRecommended = analysis.strengths.length > 0 ? analysis.strengths : ['Profil correspondant aux critères de base'];
    const riskFactors = analysis.potential_concerns.length > 0 ? analysis.potential_concerns : ['Risques standards du projet'];
    const successIndicators = analysis.synergy_indicators.length > 0 ? analysis.synergy_indicators : ['Potentiel de collaboration correcte'];

    return {
      why_recommended: whyRecommended,
      risk_factors: riskFactors,
      success_indicators: successIndicators
    };
  }

  /**
   * Prédiction collaboration basique
   */
  private predictBasicCollaboration(overallScore: number, provider: any): any {
    const successProbability = Math.min(0.95, overallScore + 0.1);
    
    return {
      success_probability: Math.round(successProbability * 100) / 100,
      communication_fit: Math.min(1, provider.rating / 5 + 0.1),
      technical_alignment: overallScore,
      timeline_feasibility: provider.availability || 0.8
    };
  }
}

// Export compatible avec l'ancien système
export const semanticMatchingEngine = new SimpleMatchingEngine();
export default semanticMatchingEngine;