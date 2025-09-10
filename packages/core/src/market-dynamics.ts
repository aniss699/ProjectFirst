
/**
 * Market Dynamics - Analyse temps réel de la tension du marché
 */

export interface MarketMetrics {
  category: string;
  region?: string;
  activeProjects: number;
  availableProviders: number;
  avgResponseTime: number; // heures
  completionRate: number; // %
  avgBudget: number;
  priceVariation: number; // %
  demandTrend: number; // -1 à +1
}

export interface MarketHeatData {
  heatScore: number; // 0-100
  tension: 'low' | 'medium' | 'high' | 'extreme';
  priceImpact: number; // multiplicateur prix
  opportunityLevel: number; // 0-100
  trendIndicator: 'falling' | 'stable' | 'rising' | 'surging';
  recommendations: string[];
  insights: string[];
}

export class MarketDynamicsEngine {
  private baselineTension = 0.5; // Rapport projets/prestataires équilibré
  
  /**
   * Calcule le Market Heat Score pour une catégorie/région
   */
  calculateMarketHeat(metrics: MarketMetrics): MarketHeatData {
    // 1. Calcul du ratio offre/demande
    const demandSupplyRatio = metrics.activeProjects / Math.max(1, metrics.availableProviders);
    
    // 2. Score de base (tension du marché)
    let heatScore = this.calculateBaseTension(demandSupplyRatio);
    
    // 3. Ajustements selon d'autres facteurs
    heatScore += this.calculateResponseTimeImpact(metrics.avgResponseTime);
    heatScore += this.calculateCompletionImpact(metrics.completionRate);
    heatScore += this.calculateTrendImpact(metrics.demandTrend);
    
    // 4. Normalisation 0-100
    heatScore = Math.max(0, Math.min(100, heatScore));
    
    // 5. Classification de la tension
    const tension = this.classifyTension(heatScore);
    
    // 6. Impact sur les prix (modèle élasticité)
    const priceImpact = this.calculatePriceImpact(heatScore, metrics.priceVariation);
    
    // 7. Niveau d'opportunité pour prestataires
    const opportunityLevel = this.calculateOpportunityLevel(heatScore, demandSupplyRatio);
    
    // 8. Indicateur de tendance
    const trendIndicator = this.getTrendIndicator(metrics.demandTrend, heatScore);
    
    // 9. Génération insights & recommandations
    const insights = this.generateMarketInsights(metrics, heatScore, tension);
    const recommendations = this.generateRecommendations(tension, opportunityLevel, metrics);
    
    return {
      heatScore: Math.round(heatScore),
      tension,
      priceImpact: Math.round(priceImpact * 100) / 100,
      opportunityLevel: Math.round(opportunityLevel),
      trendIndicator,
      recommendations,
      insights
    };
  }

  private calculateBaseTension(ratio: number): number {
    // Score logarithmique pour éviter les valeurs extrêmes
    const normalizedRatio = Math.log(ratio + 1) / Math.log(5); // Normalisation sur base log(5)
    return normalizedRatio * 60; // Base jusqu'à 60 points
  }

  private calculateResponseTimeImpact(avgResponseTime: number): number {
    // Temps de réponse rapide = marché tendu
    if (avgResponseTime <= 2) return 15; // Très réactif
    if (avgResponseTime <= 6) return 10; // Réactif
    if (avgResponseTime <= 24) return 5; // Normal
    return -5; // Lent = marché détendu
  }

  private calculateCompletionImpact(completionRate: number): number {
    // Taux d'aboutissement élevé = marché sain mais peut-être tendu
    if (completionRate >= 90) return 10;
    if (completionRate >= 80) return 5;
    if (completionRate >= 70) return 0;
    return -10; // Faible taux = problèmes marché
  }

  private calculateTrendImpact(demandTrend: number): number {
    // Tendance de demande (-1 = baisse, +1 = hausse)
    return demandTrend * 15;
  }

  private classifyTension(heatScore: number): 'low' | 'medium' | 'high' | 'extreme' {
    if (heatScore <= 25) return 'low';
    if (heatScore <= 50) return 'medium';
    if (heatScore <= 80) return 'high';
    return 'extreme';
  }

  private calculatePriceImpact(heatScore: number, currentVariation: number): number {
    // Modèle d'élasticité des prix selon tension marché
    const basePriceMultiplier = 1.0;
    const tensionImpact = (heatScore - 50) / 100; // -0.5 à +0.5
    
    // Impact logarithmique pour éviter les prix extrêmes
    const priceMultiplier = basePriceMultiplier + (tensionImpact * 0.3);
    
    return Math.max(0.7, Math.min(1.8, priceMultiplier));
  }

  private calculateOpportunityLevel(heatScore: number, demandSupplyRatio: number): number {
    // Plus le marché est tendu, plus il y a d'opportunités pour prestataires
    let opportunityScore = heatScore * 0.8; // Base sur heat score
    
    // Bonus si ratio très favorable
    if (demandSupplyRatio > 2) {
      opportunityScore += 15;
    } else if (demandSupplyRatio > 1.5) {
      opportunityScore += 10;
    }
    
    return Math.min(100, opportunityScore);
  }

  private getTrendIndicator(demandTrend: number, heatScore: number): 'falling' | 'stable' | 'rising' | 'surging' {
    if (demandTrend < -0.3) return 'falling';
    if (demandTrend < 0.2) return 'stable';
    if (demandTrend < 0.7 || heatScore < 80) return 'rising';
    return 'surging';
  }

  private generateMarketInsights(metrics: MarketMetrics, heatScore: number, tension: string): string[] {
    const insights: string[] = [];
    
    const ratio = metrics.activeProjects / Math.max(1, metrics.availableProviders);
    
    if (tension === 'extreme') {
      insights.push(`🔥 Marché en surchauffe : ${ratio.toFixed(1)} projets par prestataire disponible`);
    } else if (tension === 'high') {
      insights.push(`⚡ Forte demande : ${metrics.activeProjects} projets actifs pour ${metrics.availableProviders} prestataires`);
    } else if (tension === 'low') {
      insights.push(`📉 Marché calme : Plus d'offre que de demande actuellement`);
    }

    if (metrics.avgResponseTime <= 2) {
      insights.push(`⚡ Réactivité maximale : réponses en ${metrics.avgResponseTime}h en moyenne`);
    }

    if (metrics.completionRate >= 90) {
      insights.push(`✅ Excellente qualité : ${metrics.completionRate}% de projets menés à terme`);
    }

    return insights;
  }

  private generateRecommendations(tension: string, opportunityLevel: number, metrics: MarketMetrics): string[] {
    const recommendations: string[] = [];
    
    if (tension === 'extreme') {
      recommendations.push("🚀 Opportunité exceptionnelle : candidatez rapidement aux projets");
      recommendations.push("💰 Prix premium justifiés par la forte demande");
      recommendations.push("⏱️ Répondez sous 30min pour maximiser vos chances");
    } else if (tension === 'high') {
      recommendations.push("📈 Marché favorable : augmentez vos tarifs de 10-15%");
      recommendations.push("🎯 Concentrez-vous sur vos projets de prédilection");
    } else if (tension === 'medium') {
      recommendations.push("⚖️ Marché équilibré : maintenez vos prix standards");
      recommendations.push("🔍 Différenciez-vous par la qualité de vos propositions");
    } else {
      recommendations.push("📉 Marché détendu : proposez des prix attractifs");
      recommendations.push("💡 Moment idéal pour développer de nouvelles compétences");
      recommendations.push("🤝 Investissez dans les relations clients long terme");
    }

    return recommendations;
  }

  /**
   * Calcule l'élasticité prix pour un projet spécifique
   */
  calculatePriceElasticity(projectBudget: number, marketData: MarketHeatData, category: string): {
    acceptanceProbability: number;
    optimalPriceRange: { min: number; optimal: number; max: number };
    competitiveAdvantage: string;
  } {
    // Modèle simplifié d'élasticité
    const baseAcceptanceRate = 0.7; // 70% base
    const priceAdjustment = marketData.priceImpact;
    
    const optimalPrice = projectBudget * priceAdjustment;
    const acceptanceProbability = Math.max(0.1, baseAcceptanceRate * (2 - priceAdjustment));
    
    let competitiveAdvantage = "standard";
    if (marketData.tension === 'extreme') competitiveAdvantage = "premium_positioning";
    else if (marketData.tension === 'high') competitiveAdvantage = "strong_leverage";
    else if (marketData.tension === 'low') competitiveAdvantage = "price_competitive";
    
    return {
      acceptanceProbability: Math.round(acceptanceProbability * 100) / 100,
      optimalPriceRange: {
        min: Math.round(optimalPrice * 0.9),
        optimal: Math.round(optimalPrice),
        max: Math.round(optimalPrice * 1.1)
      },
      competitiveAdvantage
    };
  }
}

export const marketDynamicsEngine = new MarketDynamicsEngine();

/**
 * Service de notifications temps réel basé sur la tension marché
 */
export class MarketNotificationService {
  private heatThresholds = {
    surge: 85, // Marché en surchauffe
    opportunity: 70, // Belle opportunité
    cooling: 25 // Marché qui se refroidit
  };

  generateRealTimeNotifications(
    currentHeat: MarketHeatData, 
    previousHeat: MarketHeatData, 
    userCategories: string[]
  ): Array<{
    type: 'surge' | 'opportunity' | 'cooling' | 'trend_change';
    message: string;
    actionable: boolean;
    urgency: 'low' | 'medium' | 'high';
  }> {
    const notifications = [];
    
    // Détection de surchauffe soudaine
    if (currentHeat.heatScore >= this.heatThresholds.surge && 
        previousHeat.heatScore < this.heatThresholds.surge) {
      notifications.push({
        type: 'surge' as const,
        message: `🔥 Surchauffe détectée ! Forte demande en ${userCategories[0]} - Vos chances ×${currentHeat.priceImpact}`,
        actionable: true,
        urgency: 'high' as const
      });
    }
    
    // Détection d'opportunité
    if (currentHeat.opportunityLevel >= this.heatThresholds.opportunity) {
      notifications.push({
        type: 'opportunity' as const,
        message: `⚡ Opportunité ${currentHeat.opportunityLevel}% - ${currentHeat.insights[0]}`,
        actionable: true,
        urgency: 'medium' as const
      });
    }
    
    return notifications;
  }
}

export const marketNotificationService = new MarketNotificationService();
