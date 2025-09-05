import { CategoryMarketDataMap } from '../types/mission.js';

export interface PricingAnalysisRequest {
  category: string;
  description: string;
  location?: string;
  complexity: number;
  urgency: 'low' | 'medium' | 'high';
}

export interface PricingAnalysisResponse {
  recommendedBudget: {
    min: number;
    optimal: number;
    max: number;
    reasoning: string;
  };
  marketInsights: {
    categoryDemand: string;
    competitionLevel: string;
    seasonalTrend: string;
    availableProviders: number;
    averageBudget: number;
    estimatedInterestedProviders: number;
    suggestedDuration: number;
  };
  recommendations: string[];
}

export class PricingAnalysisService {
  private static categoryMarketData: CategoryMarketDataMap = {
    'developpement': {
      avgBudget: 3500, priceRange: [800, 15000], avgDuration: 21, 
      availableProviders: 850, competitionLevel: 'high',
      seasonalMultiplier: 1.2, urgencyPremium: 0.3,
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'PHP'],
      demandTrend: 'growing', clientSatisfactionRate: 0.87
    },
    'design': {
      avgBudget: 1500, priceRange: [300, 5000], avgDuration: 14,
      availableProviders: 620, competitionLevel: 'medium',
      seasonalMultiplier: 0.9, urgencyPremium: 0.1,
      skills: ['Figma', 'Photoshop', 'UX/UI', 'Illustrator'],
      demandTrend: 'stable', clientSatisfactionRate: 0.91
    },
    'marketing': {
      avgBudget: 1200, priceRange: [200, 4000], avgDuration: 10,
      availableProviders: 470, competitionLevel: 'medium',
      seasonalMultiplier: 1.1, urgencyPremium: 0.2,
      skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Content'],
      demandTrend: 'growing', clientSatisfactionRate: 0.83
    },
    'travaux': {
      avgBudget: 2800, priceRange: [500, 20000], avgDuration: 28,
      availableProviders: 1200, competitionLevel: 'high',
      seasonalMultiplier: 1.3, urgencyPremium: 0.4,
      skills: ['Plomberie', 'Électricité', 'Peinture', 'Maçonnerie'],
      demandTrend: 'seasonal', clientSatisfactionRate: 0.89
    },
    'services_personne': {
      avgBudget: 800, priceRange: [100, 2000], avgDuration: 7,
      availableProviders: 950, competitionLevel: 'high',
      seasonalMultiplier: 1.0, urgencyPremium: 0.5,
      skills: ['Ménage', 'Garde enfants', 'Aide domicile'],
      demandTrend: 'stable', clientSatisfactionRate: 0.94
    },
    'jardinage': {
      avgBudget: 600, priceRange: [80, 1500], avgDuration: 5,
      availableProviders: 380, competitionLevel: 'medium',
      seasonalMultiplier: 1.8, urgencyPremium: 0.1,
      skills: ['Élagage', 'Tonte', 'Plantation', 'Paysagisme'],
      demandTrend: 'seasonal', clientSatisfactionRate: 0.88
    },
    'transport': {
      avgBudget: 400, priceRange: [50, 1200], avgDuration: 3,
      availableProviders: 320, competitionLevel: 'medium',
      seasonalMultiplier: 1.1, urgencyPremium: 0.6,
      skills: ['Permis B', 'Véhicule utilitaire', 'Manutention'],
      demandTrend: 'stable', clientSatisfactionRate: 0.85
    },
    'beaute_bienetre': {
      avgBudget: 300, priceRange: [30, 800], avgDuration: 4,
      availableProviders: 280, competitionLevel: 'low',
      seasonalMultiplier: 0.8, urgencyPremium: 0.0,
      skills: ['Coiffure', 'Esthétique', 'Massage', 'Manucure'],
      demandTrend: 'stable', clientSatisfactionRate: 0.92
    },
    'services_pro': {
      avgBudget: 2500, priceRange: [500, 10000], avgDuration: 14,
      availableProviders: 420, competitionLevel: 'low',
      seasonalMultiplier: 1.0, urgencyPremium: 0.2,
      skills: ['Comptabilité', 'Juridique', 'Conseil', 'Formation'],
      demandTrend: 'stable', clientSatisfactionRate: 0.90
    },
    'evenementiel': {
      avgBudget: 1800, priceRange: [300, 8000], avgDuration: 21,
      availableProviders: 180, competitionLevel: 'low',
      seasonalMultiplier: 1.5, urgencyPremium: 0.3,
      skills: ['Organisation', 'Traiteur', 'Décoration', 'Animation'],
      demandTrend: 'seasonal', clientSatisfactionRate: 0.86
    },
    'enseignement': {
      avgBudget: 900, priceRange: [200, 3000], avgDuration: 30,
      availableProviders: 650, competitionLevel: 'medium',
      seasonalMultiplier: 1.4, urgencyPremium: 0.1,
      skills: ['Pédagogie', 'Français', 'Mathématiques', 'Langues'],
      demandTrend: 'seasonal', clientSatisfactionRate: 0.91
    },
    'animaux': {
      avgBudget: 250, priceRange: [20, 600], avgDuration: 5,
      availableProviders: 150, competitionLevel: 'low',
      seasonalMultiplier: 1.0, urgencyPremium: 0.4,
      skills: ['Vétérinaire', 'Garde animaux', 'Toilettage', 'Dressage'],
      demandTrend: 'stable', clientSatisfactionRate: 0.93
    }
  };

  static async performPricingAnalysis(request: PricingAnalysisRequest): Promise<PricingAnalysisResponse> {
    const { category, description, location, complexity, urgency } = request;

    const marketData = this.categoryMarketData[category] || this.categoryMarketData['developpement'];

    // Calcul de prix intelligent basé sur multiples facteurs
    let baseBudget = marketData.avgBudget;

    // Ajustement complexité (1-10)
    const complexityMultiplier = 0.7 + (complexity * 0.06); // 0.7 à 1.3
    baseBudget *= complexityMultiplier;

    // Ajustement urgence
    const urgencyMultiplier = urgency === 'high' ? (1 + marketData.urgencyPremium) : 
                             urgency === 'medium' ? 1.05 : 1.0;
    baseBudget *= urgencyMultiplier;

    // Ajustement saisonnier
    baseBudget *= marketData.seasonalMultiplier;

    // Calcul du nombre de prestataires potentiellement intéressés
    const descriptionQuality = Math.min(1.0, description.length / 200);
    const budgetAttractiveness = baseBudget > marketData.avgBudget ? 1.2 : 0.8;
    const urgencyFactor = urgency === 'high' ? 0.7 : 1.0; // Moins de prestataires dispo en urgence

    const estimatedInterestedProviders = Math.round(
      marketData.availableProviders * 
      descriptionQuality * 
      budgetAttractiveness * 
      urgencyFactor * 
      0.05 // 5% des prestataires généralement intéressés par une mission
    );

    // Délai suggéré intelligent
    let suggestedDuration = marketData.avgDuration;

    // Ajustement complexité
    suggestedDuration += (complexity - 5) * 2;

    // Ajustement urgence
    if (urgency === 'high') suggestedDuration *= 0.7;
    else if (urgency === 'medium') suggestedDuration *= 0.9;

    suggestedDuration = Math.max(1, Math.round(suggestedDuration));

    const recommendations: string[] = [];

    if (baseBudget < marketData.priceRange[0]) {
      recommendations.push(`Budget recommandé insuffisant. Minimum conseillé: ${marketData.priceRange[0]}€`);
    }

    if (urgency === 'high' && estimatedInterestedProviders < 5) {
      recommendations.push('Projet urgent avec peu de prestataires disponibles. Considérez augmenter le budget.');
    }

    if (description.length < 100) {
      recommendations.push('Description trop courte. Ajoutez plus de détails pour attirer plus de prestataires.');
    }

    if (marketData.competitionLevel === 'high') {
      recommendations.push('Marché très concurrentiel. Un budget attractif et une description détaillée sont essentiels.');
    }

    return {
      recommendedBudget: {
        min: Math.round(baseBudget * 0.8),
        optimal: Math.round(baseBudget),
        max: Math.round(baseBudget * 1.3),
        reasoning: `Basé sur ${marketData.avgBudget}€ (moyenne ${category}), ajusté pour complexité (x${complexityMultiplier.toFixed(2)}) et urgence (x${urgencyMultiplier.toFixed(2)})`
      },
      marketInsights: {
        categoryDemand: marketData.demandTrend,
        competitionLevel: marketData.competitionLevel,
        seasonalTrend: marketData.seasonalMultiplier > 1.2 ? 'haute saison' : 
                      marketData.seasonalMultiplier < 0.9 ? 'basse saison' : 'stable',
        availableProviders: marketData.availableProviders,
        averageBudget: marketData.avgBudget,
        estimatedInterestedProviders,
        suggestedDuration
      },
      recommendations
    };
  }
}