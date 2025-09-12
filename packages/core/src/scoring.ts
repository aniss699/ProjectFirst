/**
 * Système de scoring multicritère partagé
 */

export interface ScoringWeights {
  price: number;
  quality: number;
  fit: number;
  delay: number;
  risk: number;
  completion_probability: number;
}

export interface ScoringFactors {
  priceRatio: number;
  providerRating: number;
  experienceMatch: number;
  skillsMatch: number;
  responseTime: number;
  successRate: number;
  complexityLevel: 'low' | 'medium' | 'high';
  urgencyLevel: 'low' | 'medium' | 'high';
}

// Interface pour les options de scoring, incluant les nouveaux paramètres IA
export interface ScoringOptions {
  boostNewProviders?: boolean;
  penalizeHighRisk?: boolean;
  favorLocalProviders?: boolean;
  // Nouveaux paramètres IA
  brief_quality_score?: number;    // 0-1
  richness_score?: number;         // 0-1
  missing_info_count?: number;     // Nombre d'infos manquantes
  loc_score?: number;              // 0-1, probabilité d'aboutissement
}

// Interface pour le résultat de scoring, incluant les améliorations IA
export interface ScoringResult {
  totalScore: number;
  breakdown: {
    price: number;
    quality: number;
    fit: number;
    time: number;
    risk: number;
    loc: number;  // Nouveau score LOC
  };
  explanations: string[];
  confidence: number;
  recommendations?: string[];
  anomalies?: string[];
  marketInsights?: any;
  aiEnhancements?: {
    brief_quality_boost: number;
    richness_boost: number;
    missing_info_penalty: number;
    loc_integration: boolean;
  };
}

export class UnifiedScoringEngine {
  private defaultWeights: ScoringWeights = {
    price: 0.25,
    quality: 0.20,
    fit: 0.20,
    delay: 0.15,
    risk: 0.10,
    completion_probability: 0.10
  };

  /**
   * Calcule un score unifié selon les critères métier avec ajustements standardisation
   */
  calculateScore(
    factors: ScoringFactors,
    weights?: Partial<ScoringWeights>,
    marketContext?: any,
    standardizationData?: {
      brief_quality_score?: number;
      richness_score?: number;
      missing_info_count?: number;
    },
    // Ajout de l'option pour les améliorations IA
    options?: ScoringOptions
  ): ScoringResult {
    const finalWeights = this.getAdaptiveWeights(factors, weights, marketContext);

    let scores = {
      price: this.calculatePriceScore(factors.priceRatio, marketContext),
      quality: this.calculateQualityScore(factors.providerRating, factors.experienceMatch),
      fit: this.calculateFitScore(factors.skillsMatch),
      delay: this.calculateDelayScore(factors.responseTime),
      risk: this.calculateRiskScore(factors.successRate, factors.providerRating),
      completion_probability: this.calculateCompletionScore(factors)
    };

    // Ajustements standardisation si disponibles
    if (standardizationData) {
      scores = this.applyStandardizationAdjustments(scores, standardizationData);
    }

    // Ajustements dynamiques basés sur l'apprentissage
    const adjustedScores = this.applyMLAdjustments(scores, factors, marketContext);

    // Intégration des améliorations IA
    let finalScores = { ...adjustedScores };
    let aiEnhancements = {};

    if (options) {
      // Boost qualité basé sur brief_quality_score
      if (options.brief_quality_score !== undefined) {
        const qualityBoost = 1 + 0.20 * (options.brief_quality_score - 0.5);
        finalScores.quality = Math.min(100, finalScores.quality * qualityBoost);
        aiEnhancements['brief_quality_boost'] = (options.brief_quality_score - 0.5) * 0.20;
      }

      // Boost correspondance basé sur richness_score
      if (options.richness_score !== undefined) {
        const fitnessBoost = 1 + 0.15 * (options.richness_score - 0.5);
        finalScores.fit = Math.min(100, finalScores.fit * fitnessBoost);
        aiEnhancements['richness_boost'] = (options.richness_score - 0.5) * 0.15;
      }

      // Pénalité pour informations manquantes dans le délai
      if (options.missing_info_count !== undefined && options.missing_info_count > 0) {
        const missingInfoPenaltyDelay = 0.03 * options.missing_info_count * 100;
        finalScores.delay = Math.max(0, finalScores.delay - missingInfoPenaltyDelay);
        aiEnhancements['missing_info_penalty'] = (aiEnhancements['missing_info_penalty'] || 0) + missingInfoPenaltyDelay;
      }

      // Pénalité pour informations manquantes dans le risque
      if (options.missing_info_count !== undefined && options.missing_info_count > 0) {
        const missingInfoPenaltyRisk = 0.05 * options.missing_info_count * 100;
        finalScores.risk = Math.max(0, finalScores.risk - missingInfoPenaltyRisk);
        aiEnhancements['missing_info_penalty'] = (aiEnhancements['missing_info_penalty'] || 0) + missingInfoPenaltyRisk;
      }

      // Score LOC si disponible
      let locScore = finalScores.risk; // Par défaut, utilise le score de risque
      if (options.loc_score !== undefined) {
        locScore = options.loc_score * 100; // LOC est entre 0-1, on le convertit en 0-100
        aiEnhancements['loc_integration'] = true;
      } else {
        // Si pas de loc_score, on utilise le score de complétion existant pour le poids LOC
        locScore = finalScores.completion_probability;
      }

      // Calcul du score total pondéré avec LOC
      const adjustedWeights = {
        ...finalWeights,
        loc: 0.10 // Nouveau poids pour LOC
      };

      // Normalisation des poids pour inclure LOC
      const totalWeight = Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0);
      Object.keys(adjustedWeights).forEach(key => {
        adjustedWeights[key] = adjustedWeights[key] / totalWeight;
      });

      const totalScore = Math.round(
        finalScores.price * adjustedWeights.price +
        finalScores.quality * adjustedWeights.quality +
        finalScores.fit * adjustedWeights.fit +
        finalScores.delay * adjustedWeights.delay +
        finalScores.risk * adjustedWeights.risk +
        locScore * adjustedWeights.loc
      );

      // Génération d'explanations enrichies avec IA
      const explanations = this.generateExplanations(adjustedScores, factors, anomalies);
      if (options.brief_quality_score !== undefined && options.brief_quality_score > 0.8) {
        explanations.push("✅ Bonus qualité: Brief client détaillé et structuré");
      }
      if (options.richness_score !== undefined && options.richness_score > 0.8) {
        explanations.push("✅ Bonus correspondance: Projet riche en informations techniques");
      }
      if (options.missing_info_count !== undefined && options.missing_info_count > 0) {
        explanations.push(`⚠️ Pénalité: ${options.missing_info_count} informations manquantes dans le brief`);
      }
      if (options.loc_score !== undefined) {
        explanations.push(`🎯 Probabilité d'aboutissement: ${Math.round(options.loc_score * 100)}%`);
      }

      return {
        totalScore: Math.round(totalScore),
        breakdown: {
          price: Math.round(finalScores.price),
          quality: Math.round(finalScores.quality),
          fit: Math.round(finalScores.fit),
          time: Math.round(finalScores.delay), // Correspond au score de délai
          risk: Math.round(finalScores.risk),
          loc: Math.round(locScore) // Ajout du score LOC
        },
        explanations,
        confidence: this.calculateAdvancedConfidence(factors, anomalies),
        recommendations: this.generateSmartRecommendations(finalScores, factors, marketContext),
        anomalies,
        marketInsights: this.generateMarketInsights(marketContext),
        aiEnhancements: aiEnhancements as any // Cast pour la compatibilité
      };

    } else {
      // Si pas d'options IA, on utilise le calcul standard
      const totalScore = Object.entries(adjustedScores).reduce(
        (sum, [key, score]) => sum + score * finalWeights[key as keyof ScoringWeights],
        0
      );

      // Détection d'anomalies
      const anomalies = this.detectAnomalies(adjustedScores, factors);

      return {
        totalScore: Math.round(totalScore),
        breakdown: adjustedScores,
        explanations: this.generateExplanations(adjustedScores, factors, anomalies),
        confidence: this.calculateAdvancedConfidence(factors, anomalies),
        recommendations: this.generateSmartRecommendations(adjustedScores, factors, marketContext),
        anomalies,
        marketInsights: this.generateMarketInsights(marketContext)
      };
    }
  }

  /**
   * Poids adaptatifs basés sur le contexte
   */
  private getAdaptiveWeights(factors: ScoringFactors, customWeights?: Partial<ScoringWeights>, marketContext?: any): ScoringWeights {
    let weights = { ...this.defaultWeights, ...customWeights };

    // Ajustement selon l'urgence
    if (factors.urgencyLevel === 'high') {
      weights.delay *= 1.5;
      weights.price *= 0.8;
      weights = this.normalizeWeights(weights);
    }

    // Ajustement selon la complexité
    if (factors.complexityLevel === 'high') {
      weights.quality *= 1.3;
      weights.fit *= 1.2;
      weights.risk *= 1.4;
      weights = this.normalizeWeights(weights);
    }

    // Ajustement selon le marché
    if (marketContext?.tension === 'high') {
      weights.price *= 1.2;
      weights.delay *= 1.3;
      weights = this.normalizeWeights(weights);
    }

    return weights;
  }

  /**
   * Ajustements ML basés sur l'historique
   */
  private applyMLAdjustments(scores: Record<string, number>, factors: ScoringFactors, marketContext?: any): Record<string, number> {
    const adjustedScores = { ...scores };

    // Modèle simplifié d'apprentissage basé sur les patterns historiques
    if (factors.providerRating > 4.8 && factors.experienceMatch > 20) {
      adjustedScores.quality = Math.min(100, adjustedScores.quality * 1.1);
      adjustedScores.completion_probability = Math.min(100, adjustedScores.completion_probability * 1.15);
    }

    // Détection de sur-performance consistante
    if (factors.successRate > 0.95 && factors.responseTime < 2) {
      adjustedScores.risk = Math.min(100, adjustedScores.risk * 1.2);
    }

    // Pénalité pour prix suspects
    if (factors.priceRatio < 0.4) {
      adjustedScores.completion_probability *= 0.7;
      adjustedScores.risk *= 0.8;
    }

    return adjustedScores;
  }

  /**
   * Détection d'anomalies sophistiquée
   */
  private detectAnomalies(scores: Record<string, number>, factors: ScoringFactors): string[] {
    const anomalies: string[] = [];

    // Prix anormalement bas
    if (factors.priceRatio < 0.3) {
      anomalies.push('PRIX_SUSPECT_DUMPING');
    }

    // Profil trop parfait (possible fraude)
    if (factors.providerRating === 5 && factors.successRate === 1 && factors.responseTime < 0.5) {
      anomalies.push('PROFIL_SUSPECT_ARTIFICIEL');
    }

    // Incohérence expérience/prix
    if (factors.experienceMatch > 50 && factors.priceRatio < 0.5) {
      anomalies.push('INCOHERENCE_EXPERIENCE_PRIX');
    }

    // Variance scores élevée
    const scoreValues = Object.values(scores);
    const variance = this.calculateVariance(scoreValues);
    if (variance > 800) {
      anomalies.push('SCORES_INCOHERENTS');
    }

    return anomalies;
  }

  private normalizeWeights(weights: ScoringWeights): ScoringWeights {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const normalized = {} as ScoringWeights;

    Object.entries(weights).forEach(([key, value]) => {
      normalized[key as keyof ScoringWeights] = value / total;
    });

    return normalized;
  }

  /**
   * Applique les ajustements basés sur la standardisation du brief
   */
  private applyStandardizationAdjustments(
    scores: Record<string, number>,
    standardizationData: {
      brief_quality_score?: number;
      richness_score?: number;
      missing_info_count?: number;
    }
  ): Record<string, number> {
    const adjustedScores = { ...scores };

    // Paramètres d'ajustement
    const λq = 0.20; // Impact brief quality
    const λr = 0.15; // Impact richness

    // Ajustement Quality Score
    if (standardizationData.brief_quality_score !== undefined) {
      const qualityAdjustment = 1 + λq * ((standardizationData.brief_quality_score / 100) - 0.5);
      adjustedScores.quality = Math.min(100, adjustedScores.quality * qualityAdjustment);
    }

    // Ajustement Fit Score
    if (standardizationData.richness_score !== undefined) {
      const richnessAdjustment = 1 + λr * ((standardizationData.richness_score / 100) - 0.5);
      adjustedScores.fit = Math.min(100, adjustedScores.fit * richnessAdjustment);
    }

    // Pénalités pour informations manquantes
    if (standardizationData.missing_info_count && standardizationData.missing_info_count > 0) {
      const missingInfoPenalty = standardizationData.missing_info_count * 0.05;
      adjustedScores.risk = Math.max(0, adjustedScores.risk - (missingInfoPenalty * 100));
      adjustedScores.delay = Math.max(0, adjustedScores.delay - 3);
    }

    return adjustedScores;
  }


  private calculateAdvancedConfidence(factors: ScoringFactors, anomalies: string[]): number {
    let confidence = 75;

    // Bonus pour expérience élevée
    if (factors.experienceMatch > 20) confidence += 15;
    if (factors.providerRating >= 4.5) confidence += 10;

    // Malus pour anomalies
    confidence -= anomalies.length * 10;

    // Bonus pour cohérence des données
    if (factors.priceRatio > 0.6 && factors.priceRatio < 1.2) confidence += 10;

    return Math.max(30, Math.min(95, confidence));
  }

  private generateMarketInsights(marketContext?: any): any {
    if (!marketContext) return null;

    return {
      tension: marketContext.tension || 'normal',
      priceVolatility: marketContext.priceVolatility || 'stable',
      demandTrend: marketContext.demandTrend || 'steady',
      competitionLevel: marketContext.competitionLevel || 'medium',
      recommendations: this.getMarketRecommendations(marketContext)
    };
  }

  private getMarketRecommendations(marketContext: any): string[] {
    const recommendations: string[] = [];

    if (marketContext.tension === 'high') {
      recommendations.push('Marché tendu - Privilégier la rapidité de réponse');
    }

    if (marketContext.priceVolatility === 'high') {
      recommendations.push('Prix volatils - Ajuster la stratégie tarifaire');
    }

    return recommendations;
  }

  private calculatePriceScore(priceRatio: number): number {
    if (priceRatio < 0.5) return 20; // Suspicieusement bas
    if (priceRatio < 0.8) return 95; // Très compétitif
    if (priceRatio <= 1.0) return 85; // Compétitif
    if (priceRatio <= 1.2) return 70; // Acceptable
    return Math.max(30, 70 - (priceRatio - 1.2) * 100); // Cher
  }

  private calculateQualityScore(rating: number, experience: number): number {
    const ratingScore = (rating / 5.0) * 60;
    const experienceScore = Math.min(40, experience * 2);
    return ratingScore + experienceScore;
  }

  private calculateFitScore(skillsMatch: number): number {
    return skillsMatch; // Déjà en pourcentage
  }

  private calculateDelayScore(responseTime: number): number {
    // Score basé sur le temps de réponse en heures
    if (responseTime <= 1) return 100;
    if (responseTime <= 4) return 90;
    if (responseTime <= 24) return 75;
    return Math.max(30, 75 - responseTime);
  }

  private calculateRiskScore(successRate: number, rating: number): number {
    const successScore = successRate * 60;
    const ratingScore = (rating / 5.0) * 40;
    return successScore + ratingScore;
  }

  private calculateCompletionScore(factors: ScoringFactors): number {
    let score = factors.successRate * 70;

    // Ajustements selon complexité et urgence
    const complexityPenalty = { low: 0, medium: -5, high: -10 }[factors.complexityLevel] || 0;
    const urgencyPenalty = { low: 5, medium: 0, high: -10 }[factors.urgencyLevel] || 0;

    score += complexityPenalty + urgencyPenalty;

    return Math.max(10, Math.min(95, score));
  }

  private generateSmartRecommendations(scores: Record<string, number>, factors: ScoringFactors, marketContext?: any): string[] {
    const recommendations: string[] = [];

    if (scores.price < 60) {
      if (factors.priceRatio < 0.4) {
        recommendations.push("Prix potentiellement trop bas - vérifiez la faisabilité");
      } else {
        recommendations.push("Négocier le prix en mettant en avant la qualité");
      }
    }

    if (scores.quality < 70) {
      recommendations.push("Demander des références supplémentaires au prestataire");
    }

    if (scores.fit < 70) {
      recommendations.push("Organiser un entretien technique pour valider les compétences");
    }

    if (scores.completion_probability < 60) {
      recommendations.push("Prévoir un accompagnement renforcé et des jalons fréquents");
    }

    // Recommandations contextuelles
    if (marketContext?.tension === 'high') {
      recommendations.push("Marché tendu - Prioriser la rapidité de décision");
    }

    if (factors.urgencyLevel === 'high' && scores.delay < 80) {
      recommendations.push("Projet urgent - Confirmer la disponibilité immédiate");
    }

    return recommendations.slice(0, 4); // Max 4 recommandations
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    return variance;
  }

  private generateExplanations(scores: Record<string, number>, factors: ScoringFactors, anomalies?: string[]): string[] {
    const explanations: string[] = [];

    if (scores.price >= 85) {
      explanations.push("Prix très compétitif par rapport au marché");
    } else if (scores.price <= 40) {
      explanations.push("Prix potentiellement problématique (trop bas ou trop élevé)");
    }

    if (scores.quality >= 80) {
      explanations.push("Profil prestataire de haute qualité");
    } else if (scores.quality <= 50) {
      explanations.push("Expérience limitée du prestataire");
    }

    if (scores.fit >= 80) {
      explanations.push("Excellente correspondance des compétences");
    } else if (scores.fit <= 50) {
      explanations.push("Correspondance partielle des compétences requises");
    }

    if (scores.completion_probability >= 80) {
      explanations.push("Forte probabilité de succès du projet");
    } else if (scores.completion_probability <= 50) {
      explanations.push("Risques identifiés pour l'aboutissement");
    }

    return explanations;
  }

  private calculateConfidence(factors: ScoringFactors): number {
    let confidence = 75; // Base

    // Ajustements selon la qualité des données
    if (factors.experienceMatch > 10) confidence += 10; // Beaucoup d'expérience
    if (factors.providerRating >= 4.5) confidence += 10; // Excellente note
    if (factors.skillsMatch >= 80) confidence += 5; // Bon match compétences

    return Math.min(95, confidence);
  }

  private generateRecommendations(scores: Record<string, number>, factors: ScoringFactors): string[] {
    const recommendations: string[] = [];

    if (scores.price < 60) {
      recommendations.push("Vérifier la justification du prix proposé");
    }

    if (scores.quality < 70) {
      recommendations.push("Évaluer l'expérience du prestataire pour ce type de projet");
    }

    if (scores.fit < 70) {
      recommendations.push("S'assurer que les compétences correspondent aux besoins");
    }

    if (scores.completion_probability < 60) {
      recommendations.push("Prévoir des jalons et un suivi renforcé");
    }

    return recommendations;
  }
}

export const scoringEngine = new UnifiedScoringEngine();

/**
 * Utilitaires pour les constantes métier
 */
export const SCORING_CONSTANTS = {
  WEIGHTS: {
    DEFAULT: {
      price: 0.25,
      quality: 0.20,
      fit: 0.20,
      delay: 0.15,
      risk: 0.10,
      completion_probability: 0.10
    },
    CLIENT_FOCUSED: {
      price: 0.35,
      quality: 0.25,
      fit: 0.15,
      delay: 0.15,
      risk: 0.05,
      completion_probability: 0.05
    },
    QUALITY_FOCUSED: {
      price: 0.15,
      quality: 0.30,
      fit: 0.25,
      delay: 0.10,
      risk: 0.10,
      completion_probability: 0.10
    }
  },
  THRESHOLDS: {
    EXCELLENT: 85,
    GOOD: 70,
    AVERAGE: 55,
    POOR: 40
  },
  COMPETITION_LEVELS: {
    LOW: { threshold: 3, multiplier: 1.1 },
    MEDIUM: { threshold: 8, multiplier: 0.95 },
    HIGH: { threshold: 15, multiplier: 0.85 }
  }
} as const;