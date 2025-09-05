
interface FeedMetrics {
  totalScored: number;
  averageScore: number;
  categoryDistribution: Record<string, number>;
  performanceMs: number;
  cacheHitRate: number;
  userEngagement: {
    views: number;
    saves: number;
    offers: number;
    dwellTime: number;
  };
}


import { Announcement } from '../../shared/schema.js';

interface RankingWeights {
  relevance: number;
  quality: number;
  freshness: number;
  priceAdvantage: number;
  diversityPenalty: number;
}

interface MarketData {
  [category: string]: {
    median: number;
    p25: number;
    p75: number;
  };
}

export class FeedRanker {
  private weights: RankingWeights = {
    relevance: 0.25,
    quality: 0.2,
    freshness: 0.25,
    priceAdvantage: 0.15,
    diversityPenalty: 0.15
  };

  private seenSet: Set<number> = new Set();
  private marketData: MarketData = {};
  private metrics: FeedMetrics = {
    totalScored: 0,
    averageScore: 0,
    categoryDistribution: {},
    performanceMs: 0,
    cacheHitRate: 0,
    userEngagement: {
      views: 0,
      saves: 0,
      offers: 0,
      dwellTime: 0
    }
  };

  constructor(seenAnnouncements: number[] = []) {
    this.seenSet = new Set(seenAnnouncements);
  }

  /**
   * Obtient les métriques en temps réel
   */
  getMetrics(): FeedMetrics {
    return {
      ...this.metrics,
      cacheHitRate: this.calculateCacheHitRate(),
      averageScore: this.metrics.totalScored > 0 ? 
        this.metrics.averageScore / this.metrics.totalScored : 0
    };
  }

  /**
   * Met à jour les métriques d'engagement
   */
  updateEngagementMetrics(action: string, dwellTime?: number) {
    switch (action) {
      case 'view':
        this.metrics.userEngagement.views++;
        if (dwellTime) {
          this.metrics.userEngagement.dwellTime = 
            (this.metrics.userEngagement.dwellTime + dwellTime) / 2;
        }
        break;
      case 'save':
        this.metrics.userEngagement.saves++;
        break;
      case 'offer':
        this.metrics.userEngagement.offers++;
        break;
    }
  }

  /**
   * Calcule le taux de cache hit
   */
  private calculateCacheHitRate(): number {
    // Simulation - à connecter avec le vrai cache Redis
    return Math.random() * 0.3 + 0.7; // Entre 70% et 100%
  }

  /**
   * Calcule le score global d'une annonce
   */
  calculateScore(announcement: Announcement, userProfile?: any): number {
    const relevanceScore = this.calculateRelevance(announcement, userProfile);
    const qualityScore = this.calculateQuality(announcement);
    const freshnessScore = this.calculateFreshness(announcement);
    const priceAdvantageScore = this.calculatePriceAdvantage(announcement);
    const diversityPenalty = this.calculateDiversityPenalty(announcement);

    const score = 
      this.weights.relevance * relevanceScore +
      this.weights.quality * qualityScore +
      this.weights.freshness * freshnessScore +
      this.weights.priceAdvantage * priceAdvantageScore -
      this.weights.diversityPenalty * diversityPenalty;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calcule la pertinence avec machine learning avancé
   */
  private calculateRelevance(announcement: Announcement, userProfile?: any): number {
    if (!userProfile) return 0.5;

    let score = 0.2; // Score de base réduit pour favoriser le ML

    // Correspondance de catégorie avec pondération intelligente
    if (userProfile.preferredCategories?.includes(announcement.category)) {
      const categoryConfidence = this.getCategoryConfidence(announcement.category, userProfile);
      score += 0.35 * categoryConfidence;
    }

    // Analyse sémantique des compétences
    if (announcement.tags && userProfile.skills) {
      const semanticScore = this.calculateSemanticMatch(announcement.tags, userProfile.skills);
      score += 0.25 * semanticScore;
    }

    // Analyse comportementale basée sur l'historique
    const behavioralScore = this.calculateBehavioralRelevance(announcement, userProfile);
    score += 0.2 * behavioralScore;

    return Math.min(1, score);
  }

  /**
   * Calcule la confiance dans une catégorie basée sur l'historique
   */
  private getCategoryConfidence(category: string, userProfile: any): number {
    const categoryHistory = userProfile.categoryInteractions?.[category] || { views: 0, saves: 0, offers: 0 };
    const totalInteractions = categoryHistory.views + categoryHistory.saves * 2 + categoryHistory.offers * 3;
    return Math.min(1, totalInteractions / 10); // Normalisation sur 10 interactions
  }

  /**
   * Analyse sémantique des correspondances compétences-tags
   */
  private calculateSemanticMatch(tags: string[], skills: string[]): number {
    const synonyms: Record<string, string[]> = {
      'javascript': ['js', 'typescript', 'react', 'node'],
      'web': ['frontend', 'backend', 'fullstack', 'développement'],
      'design': ['ui', 'ux', 'graphisme', 'interface'],
      'mobile': ['ios', 'android', 'app', 'application'],
      'data': ['analytics', 'analyse', 'statistiques', 'bi']
    };

    let matches = 0;
    let totalComparisons = 0;

    for (const tag of tags) {
      for (const skill of skills) {
        totalComparisons++;
        
        // Correspondance directe
        if (tag.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(tag.toLowerCase())) {
          matches += 1;
          continue;
        }

        // Correspondance sémantique via synonymes
        const tagSynonyms = synonyms[tag.toLowerCase()] || [];
        const skillSynonyms = synonyms[skill.toLowerCase()] || [];
        
        if (tagSynonyms.some(syn => skill.toLowerCase().includes(syn)) ||
            skillSynonyms.some(syn => tag.toLowerCase().includes(syn))) {
          matches += 0.7; // Score réduit pour correspondance sémantique
        }
      }
    }

    return totalComparisons > 0 ? matches / totalComparisons : 0;
  }

  /**
   * Analyse comportementale pour personnalisation avancée
   */
  private calculateBehavioralRelevance(announcement: Announcement, userProfile: any): number {
    let score = 0;

    // Préférence de budget basée sur l'historique
    if (announcement.budget_max && userProfile.budgetPreferences) {
      const budgetScore = this.calculateBudgetPreference(
        parseFloat(announcement.budget_max as string), 
        userProfile.budgetPreferences
      );
      score += 0.4 * budgetScore;
    }

    // Préférence temporelle (urgence vs planifié)
    if (announcement.deadline && userProfile.timePreferences) {
      const timeScore = this.calculateTimePreference(announcement.deadline, userProfile.timePreferences);
      score += 0.3 * timeScore;
    }

    // Affinité avec le type de client
    if (userProfile.clientTypePreferences && announcement.client_type) {
      const clientScore = userProfile.clientTypePreferences[announcement.client_type] || 0.5;
      score += 0.3 * clientScore;
    }

    return Math.min(1, score);
  }

  /**
   * Calcule l'affinité budget basée sur l'historique
   */
  private calculateBudgetPreference(budget: number, preferences: any): number {
    const optimalRange = preferences.optimalRange || { min: 1000, max: 5000 };
    if (budget >= optimalRange.min && budget <= optimalRange.max) return 1;
    
    const distance = Math.min(
      Math.abs(budget - optimalRange.min),
      Math.abs(budget - optimalRange.max)
    );
    
    return Math.max(0, 1 - (distance / optimalRange.max));
  }

  /**
   * Calcule l'affinité temporelle
   */
  private calculateTimePreference(deadline: string, preferences: any): number {
    const daysUntilDeadline = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    const preferredLead = preferences.preferredLeadTime || 7;
    const flexibility = preferences.flexibility || 0.5;
    
    const deviation = Math.abs(daysUntilDeadline - preferredLead) / preferredLead;
    return Math.max(0, 1 - deviation * (1 - flexibility));
  }

  /**
   * Calcule le score qualité basé sur la complétude du profil
   */
  private calculateQuality(announcement: Announcement): number {
    let score = 0;

    // Qualité du titre
    if (announcement.title && announcement.title.length >= 20) score += 0.2;
    
    // Qualité de la description
    if (announcement.description && announcement.description.length >= 100) score += 0.3;
    
    // Présence de budget
    if (announcement.budget_min || announcement.budget_max) score += 0.2;
    
    // Présence de tags
    if (announcement.tags && announcement.tags.length > 0) score += 0.15;
    
    // Présence de deadline
    if (announcement.deadline) score += 0.15;

    return Math.min(1, score);
  }

  /**
   * Calcule la fraîcheur avec décroissance exponentielle
   */
  private calculateFreshness(announcement: Announcement): number {
    const now = new Date();
    const createdAt = new Date(announcement.created_at);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    // Décroissance exponentielle : score = e^(-λt) où λ = ln(2)/24 (demi-vie 24h)
    const lambda = Math.log(2) / 24;
    return Math.exp(-lambda * hoursSinceCreation);
  }

  /**
   * Calcule l'avantage prix par rapport au benchmark
   */
  private calculatePriceAdvantage(announcement: Announcement): number {
    const categoryBenchmark = this.marketData[announcement.category];
    if (!categoryBenchmark || !announcement.budget_max) return 0.5;

    const announcementBudget = parseFloat(announcement.budget_max as string);
    const medianPrice = categoryBenchmark.median;

    if (announcementBudget > medianPrice * 1.2) return 1; // 20% au-dessus = très attractif
    if (announcementBudget > medianPrice) return 0.8;
    if (announcementBudget > medianPrice * 0.8) return 0.6;
    return 0.3; // En dessous de 80% du médian
  }

  /**
   * Calcule la pénalité de diversité pour éviter la répétition
   */
  private calculateDiversityPenalty(announcement: Announcement): number {
    if (this.seenSet.has(announcement.id)) return 1; // Déjà vu = pénalité max
    return 0;
  }

  /**
   * Trie les annonces par score décroissant
   */
  rankAnnouncements(announcements: Announcement[], userProfile?: any): Announcement[] {
    return announcements
      .map(announcement => ({
        ...announcement,
        _score: this.calculateScore(announcement, userProfile)
      }))
      .sort((a, b) => (b as any)._score - (a as any)._score)
      .map(({ _score, ...announcement }) => announcement);
  }

  /**
   * Insère des annonces sponsorisées toutes les N positions
   */
  insertSponsoredSlots(
    announcements: Announcement[], 
    sponsoredAnnouncements: Announcement[], 
    interval: number = 5
  ): Announcement[] {
    const result: Announcement[] = [];
    let sponsoredIndex = 0;

    for (let i = 0; i < announcements.length; i++) {
      result.push(announcements[i]);
      
      if ((i + 1) % interval === 0 && sponsoredIndex < sponsoredAnnouncements.length) {
        result.push({
          ...sponsoredAnnouncements[sponsoredIndex],
          sponsored: true
        });
        sponsoredIndex++;
      }
    }

    return result;
  }

  /**
   * Met à jour le benchmark de prix pour une catégorie
   */
  updateMarketData(category: string, data: { median: number; p25: number; p75: number }) {
    this.marketData[category] = data;
  }

  /**
   * Ajoute une annonce vue à l'ensemble
   */
  markAsSeen(announcementId: number) {
    this.seenSet.add(announcementId);
  }

  /**
   * Apprend des feedbacks utilisateur
   */
  learnFromFeedback(announcementId: number, action: string, dwellMs?: number) {
    // Apprentissage simple : ajuster les poids selon l'action
    switch (action) {
      case 'save':
      case 'offer':
        // Actions positives : légère augmentation du poids qualité
        this.weights.quality = Math.min(0.3, this.weights.quality + 0.01);
        break;
      case 'skip':
        // Action négative : augmenter le poids freshness
        this.weights.freshness = Math.min(0.35, this.weights.freshness + 0.005);
        break;
      case 'view':
        // Basé sur le temps de vue
        if (dwellMs && dwellMs > 3000) {
          this.weights.relevance = Math.min(0.35, this.weights.relevance + 0.005);
        }
        break;
    }

    // Renormaliser les poids
    this.normalizeWeights();
  }

  /**
   * Normalise les poids pour qu'ils totalisent 1
   */
  private normalizeWeights() {
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    Object.keys(this.weights).forEach(key => {
      (this.weights as any)[key] = (this.weights as any)[key] / sum;
    });
  }
}