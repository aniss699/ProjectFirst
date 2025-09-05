import { 
  AIAnalysisRequest, 
  AIAnalysisResponse, 
  SkillPricingMap, 
  DemandFactorsMap, 
  PriceRange, 
  MarketInsights 
} from '../types/mission.js';

export class AIAnalysisService {
  private static skillPricing: SkillPricingMap = {
    'développement web': { 
      keywords: ['site', 'web', 'react', 'vue', 'angular', 'javascript', 'typescript', 'node', 'php', 'python', 'django', 'flask'], 
      basePrice: 2000, 
      complexity: 0.8 
    },
    'application mobile': { 
      keywords: ['app', 'mobile', 'ios', 'android', 'flutter', 'react native'], 
      basePrice: 3500, 
      complexity: 1.2 
    },
    'design graphique': { 
      keywords: ['logo', 'graphique', 'design', 'photoshop', 'illustrator', 'figma', 'ui', 'ux'], 
      basePrice: 800, 
      complexity: 0.6 
    },
    'marketing digital': { 
      keywords: ['seo', 'adwords', 'facebook', 'instagram', 'social', 'marketing', 'publicité'], 
      basePrice: 1200, 
      complexity: 0.7 
    },
    'rédaction': { 
      keywords: ['article', 'blog', 'contenu', 'copywriting', 'texte'], 
      basePrice: 500, 
      complexity: 0.4 
    },
    'e-commerce': { 
      keywords: ['boutique', 'e-commerce', 'vente', 'shop', 'prestashop', 'woocommerce', 'magento'], 
      basePrice: 2500, 
      complexity: 1.0 
    },
    'intelligence artificielle': { 
      keywords: ['ia', 'machine learning', 'ai', 'chatbot', 'automation', 'data science'], 
      basePrice: 5000, 
      complexity: 1.5 
    },
    'construction': { 
      keywords: ['maison', 'bâtiment', 'travaux', 'construction', 'rénovation', 'plomberie', 'électricité', 'peinture'], 
      basePrice: 3000, 
      complexity: 1.1 
    },
    'service à la personne': { 
      keywords: ['aide', 'domicile', 'ménage', 'enfant', 'personne âgée', 'jardinage'], 
      basePrice: 600, 
      complexity: 0.3 
    },
    'transport': { 
      keywords: ['livraison', 'déménagement', 'transport', 'colis'], 
      basePrice: 400, 
      complexity: 0.3 
    },
    'création de site web': { 
      keywords: ['création site web', 'site vitrine', 'site institutionnel'], 
      basePrice: 1500, 
      complexity: 0.7 
    }
  };

  private static demandFactors: DemandFactorsMap = {
    'développement web': 45,
    'design graphique': 35,
    'marketing digital': 25,
    'rédaction': 20,
    'application mobile': 30,
    'e-commerce': 40,
    'intelligence artificielle': 15,
    'construction': 30,
    'service à la personne': 20,
    'transport': 15,
    'création de site web': 35
  };

  static async performQuickAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const { description, title, category } = request;

    // Analyse plus sophistiquée avec calcul de prix
    const words = description.toLowerCase().split(' ');
    const complexity = Math.min(Math.floor(words.length / 10) + 3, 10);
    const qualityScore = Math.min(Math.floor(words.length * 2) + 60, 100);

    let detectedCategory = 'autre';
    let basePrice = 1000;
    let complexityMultiplier = 0.8;
    const detectedSkills: string[] = [];

    // Analyser le contenu pour détecter la catégorie et calculer le prix
    Object.entries(this.skillPricing).forEach(([skill, config]) => {
      const matches = config.keywords.filter(keyword => 
        description.toLowerCase().includes(keyword) || 
        (title && title.toLowerCase().includes(keyword))
      );

      if (matches.length > 0) {
        detectedSkills.push(skill);
        if (matches.length > 1) { // Priorité aux catégories avec plus de matches
          detectedCategory = skill;
          basePrice = config.basePrice;
          complexityMultiplier = config.complexity;
        } else if (detectedCategory === 'autre') { // Si aucune catégorie prioritaire trouvée
          detectedCategory = skill;
          basePrice = config.basePrice;
          complexityMultiplier = config.complexity;
        }
      }
    });

    // Calcul intelligent du prix basé sur la complexité et le contenu
    const wordComplexityBonus = Math.min(words.length / 50, 2); // Bonus basé sur la longueur
    const urgencyDetected = /urgent|rapide|vite|asap|pressé|immédiat/i.test(description);
    const urgencyMultiplier = urgencyDetected ? 1.3 : 1;

    const estimatedPrice = Math.round(
      basePrice * complexityMultiplier * (1 + wordComplexityBonus * 0.2) * urgencyMultiplier
    );

    // Fourchette de prix
    const priceRange: PriceRange = {
      min: Math.round(estimatedPrice * 0.7),
      max: Math.round(estimatedPrice * 1.4)
    };

    // Estimation du délai basée sur la complexité
    const estimatedDelay = Math.max(
      Math.round(complexity * complexityMultiplier * 3 + (urgencyDetected ? -2 : 2)),
      3
    );

    // Nombre de prestataires intéressés basé sur la demande
    const estimatedProviders = this.demandFactors[detectedCategory] || Math.floor(Math.random() * 30) + 15;

    // Génération d'une description optimisée
    let optimizedDescription = description;
    const improvements: string[] = [];

    if (!description.toLowerCase().includes('budget') && !description.toLowerCase().includes('€') && !description.toLowerCase().includes('prix')) {
      improvements.push('Précisez votre budget pour attirer des prestataires qualifiés');
      optimizedDescription += `\n\n💰 Budget estimé : ${estimatedPrice}€`;
    }

    if (!description.toLowerCase().includes('délai') && !description.toLowerCase().includes('livraison') && !description.toLowerCase().includes('quand')) {
      improvements.push('Indiquez vos délais pour une meilleure planification');
      optimizedDescription += `\n⏰ Délai souhaité : ${estimatedDelay} jours`;
    }

    if (detectedSkills.length > 0 && !description.toLowerCase().includes('compétences') && !description.toLowerCase().includes('technique')) {
      improvements.push('Listez les compétences techniques requises');
      optimizedDescription += `\n🔧 Compétences requises : ${detectedSkills.slice(0, 3).join(', ')}`;
    }

    if (description.length < 150) {
      improvements.push('Ajoutez plus de détails pour clarifier vos besoins');
      optimizedDescription += `\n\n📋 Détails importants :\n- Objectifs spécifiques du projet\n- Contraintes techniques ou préférences\n- Critères de sélection du prestataire`;
    }

    if (detectedCategory !== 'autre' && !description.toLowerCase().includes('catégorie')) {
      improvements.push(`Confirmez la catégorie du projet : ${detectedCategory}`);
    }

    const market_insights: MarketInsights = {
      estimated_providers_interested: estimatedProviders,
      competition_level: estimatedProviders > 30 ? 'forte' : estimatedProviders > 15 ? 'moyenne' : 'faible',
      demand_level: detectedCategory !== 'autre' ? 'forte' : 'moyenne',
      category_detected: detectedCategory,
      urgency_detected: urgencyDetected,
      suggested_budget_range: priceRange
    };

    return {
      qualityScore,
      brief_quality_score: qualityScore,
      detectedSkills,
      estimatedComplexity: complexity,
      price_suggested_med: estimatedPrice,
      price_range_min: priceRange.min,
      price_range_max: priceRange.max,
      delay_suggested_days: estimatedDelay,
      optimizedDescription: optimizedDescription !== description ? optimizedDescription : null,
      improvements,
      market_insights
    };
  }
}