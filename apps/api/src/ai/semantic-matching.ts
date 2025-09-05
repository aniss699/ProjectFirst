
/**
 * Semantic Deep Matching Engine - NLP avancé pour matching ultra-précis
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

class SemanticMatchingEngine {
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

  async performDeepMatching(request: MatchingRequest): Promise<MatchingResult[]> {
    const results: MatchingResult[] = [];

    for (const provider of request.providers) {
      const matchResult = await this.calculateProviderMatch(request.mission, provider, request.matching_preferences);
      results.push(matchResult);
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
  }

  private async calculateProviderMatch(mission: any, provider: any, preferences: any): Promise<MatchingResult> {
    // 1. Analyse sémantique profonde
    const semantic_similarity = this.calculateSemanticSimilarity(mission, provider);
    
    // 2. Compatibilité des compétences avec synonymes
    const skills_compatibility = this.calculateSkillsCompatibility(mission.skills_required, provider.skills);
    
    // 3. Alignement expérience
    const experience_alignment = this.calculateExperienceAlignment(mission, provider);
    
    // 4. Adéquation budget
    const budget_fit = this.calculateBudgetFit(mission, provider);
    
    // 5. Score qualité
    const quality_score = this.calculateQualityScore(provider);
    
    // 6. Disponibilité
    const availability_match = this.calculateAvailabilityMatch(provider);
    
    // 7. Bonus localisation
    const location_bonus = this.calculateLocationBonus(mission, provider);

    // Score global pondéré
    const overall_match_score = this.calculateOverallScore({
      semantic_similarity,
      skills_compatibility,
      experience_alignment,
      budget_fit,
      quality_score,
      availability_match,
      location_bonus
    });

    // Analyse de compatibilité
    const compatibility_analysis = this.analyzeCompatibility(mission, provider, {
      semantic_similarity,
      skills_compatibility,
      experience_alignment,
      budget_fit,
      quality_score
    });

    // Niveau de recommandation
    const recommendation_level = this.determineRecommendationLevel(overall_match_score);

    // Explication détaillée
    const explanation = this.generateExplanation(mission, provider, {
      semantic_similarity,
      skills_compatibility,
      experience_alignment,
      budget_fit,
      quality_score
    });

    // Prédiction de collaboration
    const collaboration_prediction = this.predictCollaborationSuccess(mission, provider, overall_match_score);

    return {
      provider_id: provider.id,
      overall_match_score: Math.round(overall_match_score * 100) / 100,
      confidence_level: this.calculateConfidenceLevel(mission, provider),
      match_breakdown: {
        semantic_similarity: Math.round(semantic_similarity * 100) / 100,
        skills_compatibility: Math.round(skills_compatibility * 100) / 100,
        experience_alignment: Math.round(experience_alignment * 100) / 100,
        budget_fit: Math.round(budget_fit * 100) / 100,
        quality_score: Math.round(quality_score * 100) / 100,
        availability_match: Math.round(availability_match * 100) / 100,
        location_bonus: Math.round(location_bonus * 100) / 100
      },
      compatibility_analysis,
      recommendation_level,
      explanation,
      collaboration_prediction
    };
  }

  private calculateSemanticSimilarity(mission: any, provider: any): number {
    // Tokenisation et nettoyage
    const missionTokens = this.tokenizeAndClean(mission.description + ' ' + mission.title);
    const providerTokens = this.tokenizeAndClean(provider.description + ' ' + provider.portfolio_projects.join(' '));
    
    // TF-IDF amélioré avec synonymes
    const missionTfidf = this.calculateTFIDF(missionTokens);
    const providerTfidf = this.calculateTFIDF(providerTokens);
    
    // Similarité cosinus avec boost synonymes
    const cosineSimilarity = this.calculateCosineSimilarity(missionTfidf, providerTfidf);
    
    // Boost pour mots-clés métier spécifiques
    const domainBoost = this.calculateDomainSpecificBoost(mission, provider);
    
    return Math.min(1.0, cosineSimilarity + domainBoost);
  }

  private calculateSkillsCompatibility(requiredSkills: string[], providerSkills: string[]): number {
    if (!requiredSkills || requiredSkills.length === 0) return 0.5;
    
    const normalizedRequired = requiredSkills.map(skill => skill.toLowerCase());
    const normalizedProvider = providerSkills.map(skill => skill.toLowerCase());
    
    let matchScore = 0;
    let totalWeight = 0;
    
    for (const required of normalizedRequired) {
      let skillWeight = 1.0;
      let bestMatch = 0;
      
      // Match exact
      if (normalizedProvider.includes(required)) {
        bestMatch = 1.0;
      } else {
        // Recherche synonymes
        const synonyms = this.getSkillSynonyms(required);
        for (const synonym of synonyms) {
          if (normalizedProvider.some(skill => skill.includes(synonym) || synonym.includes(skill))) {
            bestMatch = Math.max(bestMatch, 0.8);
          }
        }
        
        // Match partiel (sous-chaînes)
        for (const providerSkill of normalizedProvider) {
          const partialMatch = this.calculatePartialMatch(required, providerSkill);
          bestMatch = Math.max(bestMatch, partialMatch * 0.6);
        }
      }
      
      matchScore += bestMatch * skillWeight;
      totalWeight += skillWeight;
    }
    
    return totalWeight > 0 ? matchScore / totalWeight : 0;
  }

  private calculateExperienceAlignment(mission: any, provider: any): number {
    let score = 0;
    
    // Score basé sur le nombre de projets
    const projectScore = Math.min(1.0, provider.completed_projects / 20);
    score += projectScore * 0.4;
    
    // Score basé sur le rating
    const ratingScore = provider.rating / 5;
    score += ratingScore * 0.3;
    
    // Alignement catégorie
    const categoryMatch = provider.categories.includes(mission.category) ? 1.0 : 0.5;
    score += categoryMatch * 0.3;
    
    return Math.min(1.0, score);
  }

  private calculateBudgetFit(mission: any, provider: any): number {
    if (!provider.hourly_rate || !mission.budget) return 0.5;
    
    const estimatedCost = provider.hourly_rate * this.estimateProjectHours(mission);
    const ratio = mission.budget / estimatedCost;
    
    // Courbe optimale : meilleur score entre 0.8 et 1.3
    if (ratio >= 0.8 && ratio <= 1.3) return 1.0;
    if (ratio >= 0.6 && ratio <= 1.6) return 0.8;
    if (ratio >= 0.4 && ratio <= 2.0) return 0.6;
    return 0.3;
  }

  private calculateQualityScore(provider: any): number {
    let score = 0;
    
    // Rating (40%)
    score += (provider.rating / 5) * 0.4;
    
    // Expérience (30%)
    score += Math.min(1.0, provider.completed_projects / 30) * 0.3;
    
    // Portfolio richesse (30%)
    const portfolioScore = Math.min(1.0, provider.portfolio_projects.length / 10);
    score += portfolioScore * 0.3;
    
    return score;
  }

  private calculateAvailabilityMatch(provider: any): number {
    return provider.availability || 0.7; // Défaut 70%
  }

  private calculateLocationBonus(mission: any, provider: any): number {
    if (!mission.location || !provider.location) return 0;
    
    // Bonus si même ville/région
    if (mission.location.toLowerCase() === provider.location.toLowerCase()) return 0.2;
    
    // Bonus partiel si même pays/région
    if (this.isSameRegion(mission.location, provider.location)) return 0.1;
    
    // Pas de bonus si remote accepté
    if (mission.remote_allowed) return 0;
    
    return 0;
  }

  private calculateOverallScore(scores: any): number {
    return (
      scores.semantic_similarity * this.semanticWeights.content_similarity +
      scores.skills_compatibility * this.semanticWeights.skills_match +
      scores.experience_alignment * this.semanticWeights.experience +
      scores.budget_fit * this.semanticWeights.budget_fit +
      scores.quality_score * this.semanticWeights.quality +
      scores.availability_match * 0.05 +
      scores.location_bonus * 0.05
    );
  }

  private analyzeCompatibility(mission: any, provider: any, scores: any) {
    const strengths = [];
    const potential_concerns = [];
    const synergy_indicators = [];

    // Analyse des forces
    if (scores.skills_compatibility > 0.8) {
      strengths.push('Compétences techniques parfaitement alignées');
    }
    if (scores.quality_score > 0.8) {
      strengths.push('Prestataire expérimenté avec excellent historique');
    }
    if (scores.budget_fit > 0.8) {
      strengths.push('Adéquation budgétaire optimale');
    }
    if (scores.semantic_similarity > 0.7) {
      strengths.push('Compréhension profonde du domaine métier');
    }

    // Analyse des préoccupations
    if (scores.budget_fit < 0.5) {
      potential_concerns.push('Décalage potentiel entre budget et tarifs');
    }
    if (scores.skills_compatibility < 0.6) {
      potential_concerns.push('Compétences partiellement alignées');
    }
    if (provider.completed_projects < 5) {
      potential_concerns.push('Expérience limitée sur projets similaires');
    }

    // Indicateurs de synergie
    if (scores.semantic_similarity > 0.8 && scores.skills_compatibility > 0.8) {
      synergy_indicators.push('Excellente compréhension technique et métier');
    }
    if (provider.rating > 4.5 && scores.budget_fit > 0.7) {
      synergy_indicators.push('Qualité premium dans l\'enveloppe budgétaire');
    }

    return { strengths, potential_concerns, synergy_indicators };
  }

  private determineRecommendationLevel(score: number): 'excellent' | 'very_good' | 'good' | 'fair' | 'poor' {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.75) return 'very_good';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    return 'poor';
  }

  private generateExplanation(mission: any, provider: any, scores: any) {
    const why_recommended = [];
    const risk_factors = [];
    const success_indicators = [];

    // Pourquoi recommandé
    if (scores.skills_compatibility > 0.8) {
      why_recommended.push(`Maîtrise ${Math.round(scores.skills_compatibility * 100)}% des compétences requises`);
    }
    if (provider.rating > 4.0) {
      why_recommended.push(`Note client excellente (${provider.rating}/5)`);
    }
    if (scores.semantic_similarity > 0.7) {
      why_recommended.push('Expérience démontrée sur projets similaires');
    }

    // Facteurs de risque
    if (scores.budget_fit < 0.6) {
      risk_factors.push('Tarifs potentiellement au-dessus du budget');
    }
    if (provider.completed_projects < 10) {
      risk_factors.push('Portfolio encore en construction');
    }

    // Indicateurs de succès
    if (scores.quality_score > 0.8) {
      success_indicators.push('Historique de livraison de qualité');
    }
    if (scores.semantic_similarity > 0.8) {
      success_indicators.push('Compréhension approfondie du secteur');
    }

    return { why_recommended, risk_factors, success_indicators };
  }

  private predictCollaborationSuccess(mission: any, provider: any, overallScore: number) {
    const success_probability = Math.min(0.95, overallScore * 1.1);
    
    const communication_fit = this.calculateCommunicationFit(mission, provider);
    const technical_alignment = this.calculateTechnicalAlignment(mission, provider);
    const timeline_feasibility = this.calculateTimelineFeasibility(mission, provider);

    return {
      success_probability: Math.round(success_probability * 100) / 100,
      communication_fit: Math.round(communication_fit * 100) / 100,
      technical_alignment: Math.round(technical_alignment * 100) / 100,
      timeline_feasibility: Math.round(timeline_feasibility * 100) / 100
    };
  }

  // Méthodes utilitaires
  private tokenizeAndClean(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  private calculateTFIDF(tokens: string[]): Map<string, number> {
    const termFreq = new Map<string, number>();
    const total = tokens.length;
    
    // Calcul TF
    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    }
    
    // Normalisation TF
    const tfidf = new Map<string, number>();
    for (const [term, freq] of termFreq) {
      tfidf.set(term, freq / total);
    }
    
    return tfidf;
  }

  private calculateCosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
    const commonTerms = [...vec1.keys()].filter(term => vec2.has(term));
    
    if (commonTerms.length === 0) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const term of commonTerms) {
      const val1 = vec1.get(term) || 0;
      const val2 = vec2.get(term) || 0;
      dotProduct += val1 * val2;
    }
    
    for (const val of vec1.values()) {
      norm1 += val * val;
    }
    for (const val of vec2.values()) {
      norm2 += val * val;
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private calculateDomainSpecificBoost(mission: any, provider: any): number {
    const missionDomain = this.extractDomainKeywords(mission.description + ' ' + mission.category);
    const providerDomain = this.extractDomainKeywords(provider.description + ' ' + provider.categories.join(' '));
    
    const commonDomains = missionDomain.filter(domain => providerDomain.includes(domain));
    
    return Math.min(0.2, commonDomains.length * 0.05);
  }

  private extractDomainKeywords(text: string): string[] {
    const domains = ['ecommerce', 'fintech', 'healthcare', 'education', 'saas', 'marketplace', 'iot', 'blockchain'];
    return domains.filter(domain => text.toLowerCase().includes(domain));
  }

  private getSkillSynonyms(skill: string): string[] {
    for (const [key, synonyms] of Object.entries(this.skillSynonyms)) {
      if (key === skill || synonyms.includes(skill)) {
        return [key, ...synonyms];
      }
    }
    return [skill];
  }

  private calculatePartialMatch(skill1: string, skill2: string): number {
    const longer = skill1.length > skill2.length ? skill1 : skill2;
    const shorter = skill1.length > skill2.length ? skill2 : skill1;
    
    if (longer.includes(shorter)) return 0.8;
    if (shorter.includes(longer)) return 0.8;
    
    // Levenshtein distance approximation
    const distance = this.levenshteinDistance(skill1, skill2);
    const maxLength = Math.max(skill1.length, skill2.length);
    
    return Math.max(0, 1 - distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private estimateProjectHours(mission: any): number {
    const baseHours = {
      'web-development': 40,
      'mobile-development': 60,
      'design': 25,
      'marketing': 30
    };
    
    const base = baseHours[mission.category] || 35;
    const complexityMultiplier = mission.complexity ? (mission.complexity / 5) : 1;
    
    return Math.round(base * complexityMultiplier);
  }

  private isSameRegion(location1: string, location2: string): boolean {
    // Simplification : même pays si même suffixe (Paris, France vs Lyon, France)
    const parts1 = location1.split(',').map(p => p.trim().toLowerCase());
    const parts2 = location2.split(',').map(p => p.trim().toLowerCase());
    
    return parts1.length > 1 && parts2.length > 1 && 
           parts1[parts1.length - 1] === parts2[parts2.length - 1];
  }

  private calculateConfidenceLevel(mission: any, provider: any): number {
    let confidence = 0.6; // Base
    
    if (mission.description.length > 100) confidence += 0.1;
    if (provider.portfolio_projects.length > 3) confidence += 0.1;
    if (provider.completed_projects > 10) confidence += 0.1;
    if (mission.skills_required.length > 0) confidence += 0.1;
    
    return Math.round(Math.min(0.95, confidence) * 100) / 100;
  }

  private calculateCommunicationFit(mission: any, provider: any): number {
    // Simulation basée sur longueur description et rating
    const descriptionQuality = Math.min(1, provider.description.length / 200);
    const ratingBonus = provider.rating / 5;
    
    return (descriptionQuality + ratingBonus) / 2;
  }

  private calculateTechnicalAlignment(mission: any, provider: any): number {
    // Simulation basée sur catégories et compétences
    const categoryMatch = provider.categories.includes(mission.category) ? 1.0 : 0.5;
    const skillsMatch = this.calculateSkillsCompatibility(mission.skills_required, provider.skills);
    
    return (categoryMatch + skillsMatch) / 2;
  }

  private calculateTimelineFeasibility(mission: any, provider: any): number {
    // Simulation basée sur availability et complexité
    const availability = provider.availability || 0.7;
    const complexityFactor = mission.complexity ? Math.max(0.5, 1 - (mission.complexity - 5) * 0.1) : 0.8;
    
    return (availability + complexityFactor) / 2;
  }
}

export const semanticMatchingEngine = new SemanticMatchingEngine();
