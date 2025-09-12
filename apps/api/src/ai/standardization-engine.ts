/**
 * Moteur de Standardisation Intelligent pour AppelsPro
 * Système avancé de normalisation et structuration des briefs clients
 */

interface ProjectData {
  title: string;
  description: string;
  category?: string;
  budget?: number;
  urgency?: string;
  timeline?: string;
  skills_required?: string[];
  constraints?: string[];
  client_history?: any;
}

interface StandardizationResult {
  title_std: string;
  summary_std: string;
  acceptance_criteria: string[];
  category_std: string;
  sub_category_std: string;
  tags_std: string[];
  skills_std: string[];
  constraints_std: string[];
  brief_quality_score: number;
  richness_score: number;
  missing_info: any[];
  price_suggested_min?: number;
  price_suggested_med?: number;
  price_suggested_max?: number;
  delay_suggested_days?: number;
  loc_uplift_reco?: any;
  technical_complexity: number;
  business_value_indicator: number;
  market_positioning_suggestion: string;
  optimization_recommendations: string[];
}

export class StandardizationEngine {
  private categoryPatterns: Map<string, RegExp[]>;
  private skillsDatabase: Map<string, string[]>;
  private complexityIndicators: string[];
  private qualityMetrics: string[];

  constructor() {
    this.initializePatterns();
    this.initializeSkillsDatabase();
    this.complexityIndicators = [
      'architecture', 'microservices', 'machine learning', 'blockchain', 'intelligence artificielle',
      'big data', 'cloud', 'scalability', 'performance', 'sécurité avancée', 'intégration complexe',
      'api rest', 'graphql', 'websockets', 'temps réel', 'analytics', 'dashboard',
      'multi-tenant', 'internationalisation', 'responsive', 'progressive web app'
    ];
    
    this.qualityMetrics = [
      'objectifs', 'contraintes', 'livrables', 'critères', 'spécifications',
      'fonctionnalités', 'besoins', 'utilisateurs', 'cible', 'contexte',
      'délai', 'budget', 'technologies', 'plateformes', 'maintenance'
    ];
  }

  /**
   * Standardise un projet de manière intelligente
   */
  async standardizeProject(projectData: ProjectData): Promise<StandardizationResult> {
    console.log('🔄 Standardization Engine: Analyzing project...');
    
    // Analyse multi-phase du projet
    const analysisResults = await this.performDeepAnalysis(projectData);
    
    // Génération de la standardisation
    const standardization = this.generateStandardization(projectData, analysisResults);
    
    // Optimisations et recommandations
    const optimizations = this.generateOptimizations(standardization, analysisResults);
    
    console.log('✅ Standardization Engine: Project analyzed and standardized');
    
    return {
      ...standardization,
      ...optimizations
    };
  }

  /**
   * Analyse profonde multi-dimensionnelle
   */
  private async performDeepAnalysis(projectData: ProjectData) {
    const { title, description } = projectData;
    const fullText = `${title} ${description}`.toLowerCase();

    return {
      // Analyse linguistique
      linguistic: await this.analyzeLinguisticStructure(fullText),
      
      // Analyse technique
      technical: this.analyzeTechnicalComplexity(fullText),
      
      // Analyse business
      business: this.analyzeBusinessValue(fullText),
      
      // Analyse de marché
      market: this.analyzeMarketContext(projectData),
      
      // Analyse de qualité
      quality: this.analyzeBriefQuality(projectData),
      
      // Analyse sémantique
      semantic: this.performSemanticAnalysis(fullText)
    };
  }

  /**
   * Analyse linguistique avancée
   */
  private async analyzeLinguisticStructure(text: string) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const words = text.split(/\s+/).filter(w => w.length > 2);
    const uniqueWords = new Set(words);
    
    // Analyse de complexité linguistique
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const vocabularyRichness = uniqueWords.size / words.length;
    const structuralComplexity = this.analyzeStructuralElements(text);
    
    return {
      sentence_count: sentences.length,
      avg_sentence_length: Math.round(avgSentenceLength),
      vocabulary_richness: Math.round(vocabularyRichness * 100) / 100,
      structural_complexity: structuralComplexity,
      readability_score: this.calculateReadabilityScore(sentences, words),
      information_density: this.calculateInformationDensity(text)
    };
  }

  /**
   * Analyse de complexité technique
   */
  private analyzeTechnicalComplexity(text: string) {
    let complexityScore = 0;
    let detectedTechnologies: string[] = [];
    let architectureIndicators: string[] = [];

    // Détection des technologies
    const techPatterns = {
      'Frontend': ['react', 'vue', 'angular', 'frontend', 'ui/ux', 'interface'],
      'Backend': ['node.js', 'python', 'java', 'backend', 'api', 'serveur'],
      'Database': ['mysql', 'postgresql', 'mongodb', 'base de données', 'bdd'],
      'Cloud': ['aws', 'azure', 'gcp', 'cloud', 'hébergement'],
      'Mobile': ['react native', 'flutter', 'ios', 'android', 'mobile'],
      'AI/ML': ['intelligence artificielle', 'machine learning', 'ia', 'algorithme'],
      'DevOps': ['docker', 'kubernetes', 'ci/cd', 'déploiement', 'devops']
    };

    Object.entries(techPatterns).forEach(([category, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        detectedTechnologies.push(category);
        complexityScore += 1;
      }
    });

    // Indicateurs d'architecture
    this.complexityIndicators.forEach(indicator => {
      if (text.includes(indicator)) {
        architectureIndicators.push(indicator);
        complexityScore += 0.5;
      }
    });

    // Calcul de complexité finale
    const finalComplexity = Math.min(10, Math.max(1, complexityScore));

    return {
      complexity_score: finalComplexity,
      detected_technologies: detectedTechnologies,
      architecture_indicators: architectureIndicators,
      integration_complexity: this.analyzeIntegrationComplexity(text),
      scalability_requirements: this.analyzeScalabilityNeeds(text),
      performance_requirements: this.analyzePerformanceNeeds(text)
    };
  }

  /**
   * Analyse de valeur business
   */
  private analyzeBusinessValue(text: string) {
    const valueIndicators = [
      'chiffre d\'affaires', 'revenus', 'rentabilité', 'roi', 'conversion',
      'utilisateurs', 'clients', 'croissance', 'marché', 'concurrence',
      'innovation', 'efficacité', 'automatisation', 'optimisation'
    ];

    const strategicKeywords = [
      'stratégie', 'transformation', 'digital', 'numérique', 'modernisation',
      'amélioration', 'expansion', 'développement', 'lancement', 'pivot'
    ];

    let businessScore = 0;
    let strategicScore = 0;

    valueIndicators.forEach(indicator => {
      if (text.includes(indicator)) businessScore += 1;
    });

    strategicKeywords.forEach(keyword => {
      if (text.includes(keyword)) strategicScore += 1;
    });

    return {
      business_value_score: Math.min(10, businessScore),
      strategic_importance: Math.min(10, strategicScore),
      market_impact_potential: this.calculateMarketImpact(text),
      user_benefit_clarity: this.analyzeUserBenefits(text),
      competitive_advantage: this.analyzeCompetitiveAdvantage(text)
    };
  }

  /**
   * Analyse du contexte marché
   */
  private analyzeMarketContext(projectData: ProjectData) {
    const category = projectData.category || 'general';
    const budget = projectData.budget || 0;
    
    // Simulation d'analyse de marché avancée
    const marketData = this.getMarketIntelligence(category);
    const competitionLevel = this.assessCompetitionLevel(category, budget);
    const demandForecast = this.forecastDemand(category);

    return {
      market_data: marketData,
      competition_level: competitionLevel,
      demand_forecast: demandForecast,
      price_positioning: this.analyzePricePositioning(budget, category),
      trend_analysis: this.analyzeTrends(category),
      opportunity_assessment: this.assessOpportunity(projectData)
    };
  }

  /**
   * Analyse de qualité du brief
   */
  private analyzeBriefQuality(projectData: ProjectData) {
    const { title, description } = projectData;
    const fullText = `${title} ${description}`;
    
    // Métriques de qualité
    const completenessScore = this.calculateCompleteness(projectData);
    const clarityScore = this.calculateClarity(fullText);
    const structureScore = this.calculateStructure(fullText);
    const specificityScore = this.calculateSpecificity(fullText);
    
    // Score global de qualité
    const overallQuality = (completenessScore + clarityScore + structureScore + specificityScore) / 4;
    
    return {
      completeness_score: completenessScore,
      clarity_score: clarityScore,
      structure_score: structureScore,
      specificity_score: specificityScore,
      overall_quality: Math.round(overallQuality * 100),
      improvement_areas: this.identifyImprovementAreas(projectData),
      quality_indicators: this.getQualityIndicators(fullText)
    };
  }

  /**
   * Analyse sémantique avancée
   */
  private performSemanticAnalysis(text: string) {
    // Extraction d'entités nommées
    const entities = this.extractNamedEntities(text);
    
    // Analyse des intentions
    const intentions = this.analyzeIntentions(text);
    
    // Analyse des concepts
    const concepts = this.extractConcepts(text);
    
    return {
      named_entities: entities,
      user_intentions: intentions,
      key_concepts: concepts,
      semantic_coherence: this.calculateSemanticCoherence(text),
      domain_specificity: this.analyzeDomainSpecificity(text),
      context_richness: this.analyzeContextRichness(text)
    };
  }

  /**
   * Génération de la standardisation
   */
  private generateStandardization(projectData: ProjectData, analysis: any): StandardizationResult {
    const { title, description, budget } = projectData;
    
    // Titre standardisé
    const title_std = this.standardizeTitle(title, analysis);
    
    // Résumé standardisé
    const summary_std = this.generateStandardSummary(description, analysis);
    
    // Critères d'acceptation intelligents
    const acceptance_criteria = this.generateAcceptanceCriteria(projectData, analysis);
    
    // Catégorisation intelligente
    const categorization = this.performIntelligentCategorization(projectData, analysis);
    
    // Extraction de compétences
    const skills_std = this.extractStandardizedSkills(description, analysis);
    
    // Contraintes standardisées
    const constraints_std = this.extractStandardizedConstraints(projectData, analysis);
    
    // Scores de qualité
    const brief_quality_score = analysis.quality.overall_quality;
    const richness_score = this.calculateRichnessScore(analysis);
    
    // Informations manquantes
    const missing_info = this.identifyMissingInformation(projectData, analysis);
    
    // Suggestions de prix intelligentes
    const pricingSuggestions = this.generateIntelligentPricing(projectData, analysis);
    
    return {
      title_std,
      summary_std,
      acceptance_criteria,
      category_std: categorization.main_category,
      sub_category_std: categorization.sub_category,
      tags_std: categorization.tags,
      skills_std,
      constraints_std,
      brief_quality_score,
      richness_score,
      missing_info,
      ...pricingSuggestions,
      technical_complexity: analysis.technical.complexity_score,
      business_value_indicator: analysis.business.business_value_score,
      market_positioning_suggestion: analysis.market.price_positioning,
      optimization_recommendations: this.generateOptimizationRecommendations(projectData, analysis)
    };
  }

  /**
   * Standardisation du titre
   */
  private standardizeTitle(title: string, analysis: any): string {
    // Nettoyage de base
    let standardTitle = title.trim().replace(/\s+/g, ' ');
    
    // Capitalisation intelligente
    standardTitle = this.applyIntelligentCapitalization(standardTitle);
    
    // Enrichissement contextuel
    if (analysis.technical.detected_technologies.length > 0 && !standardTitle.includes('développement')) {
      const mainTech = analysis.technical.detected_technologies[0];
      standardTitle += ` - Développement ${mainTech}`;
    }
    
    // Limitation de longueur
    if (standardTitle.length > 80) {
      standardTitle = standardTitle.substring(0, 77) + '...';
    }
    
    return standardTitle;
  }

  /**
   * Génération de résumé standardisé
   */
  private generateStandardSummary(description: string, analysis: any): string {
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Sélection des phrases les plus informatives
    const keySesentences = this.selectKeySesentences(sentences, analysis);
    
    // Construction du résumé structuré
    let summary = keySesentences.join('. ');
    
    // Enrichissement avec informations d'analyse
    if (analysis.technical.detected_technologies.length > 0) {
      const techs = analysis.technical.detected_technologies.slice(0, 3).join(', ');
      summary += ` Technologies impliquées: ${techs}.`;
    }
    
    // Limitation à 300 caractères
    if (summary.length > 300) {
      summary = summary.substring(0, 297) + '...';
    }
    
    return summary;
  }

  /**
   * Génération de critères d'acceptation intelligents
   */
  private generateAcceptanceCriteria(projectData: ProjectData, analysis: any): string[] {
    const criteria: string[] = [];
    
    // Critères de base
    criteria.push('Livrable conforme aux spécifications détaillées');
    criteria.push('Respect des délais convenus avec jalons intermédiaires');
    criteria.push('Tests et validation fonctionnelle complète');
    criteria.push('Documentation technique et utilisateur fournie');
    
    // Critères spécifiques à la technologie
    if (analysis.technical.detected_technologies.includes('Frontend')) {
      criteria.push('Interface utilisateur responsive et accessible');
      criteria.push('Compatibilité multi-navigateurs validée');
    }
    
    if (analysis.technical.detected_technologies.includes('Backend')) {
      criteria.push('API sécurisée et performante');
      criteria.push('Gestion d\'erreurs et logs implémentée');
    }
    
    if (analysis.technical.detected_technologies.includes('Mobile')) {
      criteria.push('Application compatible iOS et Android');
      criteria.push('Performance optimisée sur mobile');
    }
    
    // Critères business
    if (analysis.business.business_value_score > 5) {
      criteria.push('Indicateurs de performance (KPI) mesurables');
      criteria.push('Formation utilisateur si nécessaire');
    }
    
    // Critères de qualité avancée
    if (projectData.budget && projectData.budget > 5000) {
      criteria.push('Code review et optimisation des performances');
      criteria.push('Plan de maintenance et évolution');
    }
    
    return criteria.slice(0, 8); // Maximum 8 critères
  }

  /**
   * Catégorisation intelligente
   */
  private performIntelligentCategorization(projectData: ProjectData, analysis: any) {
    const text = `${projectData.title} ${projectData.description}`.toLowerCase();
    
    // Catégorie principale par analyse sémantique
    let mainCategory = 'other';
    let subCategory = 'general';
    let confidence = 0;

    for (const [category, patterns] of this.categoryPatterns.entries()) {
      const matches = patterns.filter(pattern => pattern.test(text)).length;
      const categoryConfidence = matches / patterns.length;
      
      if (categoryConfidence > confidence) {
        confidence = categoryConfidence;
        mainCategory = category;
      }
    }

    // Sous-catégorie par analyse technique
    if (mainCategory === 'web-development') {
      if (analysis.technical.detected_technologies.includes('Frontend')) {
        subCategory = 'frontend-development';
      } else if (analysis.technical.detected_technologies.includes('Backend')) {
        subCategory = 'backend-development';
      } else if (text.includes('fullstack') || text.includes('full-stack')) {
        subCategory = 'fullstack-development';
      }
    } else if (mainCategory === 'mobile-development') {
      if (text.includes('ios')) subCategory = 'ios-development';
      else if (text.includes('android')) subCategory = 'android-development';
      else subCategory = 'cross-platform';
    }

    // Tags intelligents
    const tags = this.generateIntelligentTags(projectData, analysis, mainCategory);

    return {
      main_category: mainCategory,
      sub_category: subCategory,
      confidence_score: Math.round(confidence * 100),
      tags: tags
    };
  }

  /**
   * Extraction de compétences standardisées
   */
  private extractStandardizedSkills(description: string, analysis: any): string[] {
    const text = description.toLowerCase();
    const extractedSkills = new Set<string>();

    // Extraction basée sur patterns
    for (const [skillCategory, skills] of this.skillsDatabase.entries()) {
      skills.forEach(skill => {
        if (text.includes(skill.toLowerCase()) || 
            this.fuzzyMatch(text, skill.toLowerCase())) {
          extractedSkills.add(skill);
        }
      });
    }

    // Enrichissement par analyse technique
    analysis.technical.detected_technologies.forEach((tech: string) => {
      const relatedSkills = this.skillsDatabase.get(tech) || [];
      relatedSkills.forEach(skill => extractedSkills.add(skill));
    });

    // Priorisation par pertinence
    const prioritizedSkills = Array.from(extractedSkills)
      .map(skill => ({
        skill,
        relevance: this.calculateSkillRelevance(skill, text)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 12) // Maximum 12 compétences
      .map(item => item.skill);

    return prioritizedSkills;
  }

  /**
   * Prix intelligent avec analyse de marché
   */
  private generateIntelligentPricing(projectData: ProjectData, analysis: any) {
    const complexity = analysis.technical.complexity_score;
    const businessValue = analysis.business.business_value_score;
    const marketPosition = analysis.market.price_positioning;
    
    // Base de calcul
    let basePrice = complexity * 800; // 800€ par point de complexité
    
    // Ajustements par valeur business
    if (businessValue > 7) basePrice *= 1.3;
    else if (businessValue > 5) basePrice *= 1.15;
    
    // Ajustements par positionnement marché
    const marketMultipliers = {
      'premium': 1.4,
      'standard-plus': 1.2,
      'standard': 1.0,
      'budget': 0.8
    };
    
    basePrice *= (marketMultipliers as any)[marketPosition] || 1.0;
    
    // Fourchette intelligente
    const price_suggested_min = Math.round(basePrice * 0.8);
    const price_suggested_med = Math.round(basePrice);
    const price_suggested_max = Math.round(basePrice * 1.3);
    
    // Délai intelligent
    const delay_suggested_days = Math.max(7, Math.round(complexity * 5 + (businessValue > 6 ? 7 : 0)));
    
    return {
      price_suggested_min,
      price_suggested_med,
      price_suggested_max,
      delay_suggested_days,
      pricing_reasoning: this.generatePricingReasoning(complexity, businessValue, marketPosition),
      loc_uplift_reco: this.generateLOCRecommendations(basePrice, complexity)
    };
  }

  /**
   * Identification des informations manquantes
   */
  private identifyMissingInformation(projectData: ProjectData, analysis: any): any[] {
    const missing: any[] = [];
    const { description, budget, timeline } = projectData;
    
    // Analyse intelligente des manques
    if (!budget || budget === 0) {
      missing.push({
        type: 'budget_range',
        description: 'Budget ou fourchette budgétaire',
        priority: 'high',
        suggestion: `Budget suggéré: ${analysis.market?.price_positioning === 'premium' ? '5000-15000€' : '1500-5000€'}`,
        impact: 'Essentiel pour recevoir des propositions adaptées',
        examples: ['Budget fixe: 3000€', 'Fourchette: 2000-4000€']
      });
    }
    
    if (!timeline && !description.includes('délai') && !description.includes('urgent')) {
      missing.push({
        type: 'timeline',
        description: 'Délai ou échéance du projet',
        priority: 'high',
        suggestion: `Délai suggéré: ${Math.round(analysis.technical?.complexity_score * 5 || 14)} jours`,
        impact: 'Nécessaire pour planification et évaluation faisabilité',
        examples: ['Livraison avant le 15 décembre', 'Délai maximum: 6 semaines']
      });
    }
    
    if (analysis.quality.specificity_score < 60) {
      missing.push({
        type: 'technical_specifications',
        description: 'Spécifications techniques détaillées',
        priority: 'medium',
        suggestion: 'Préciser les technologies, plateformes et contraintes techniques',
        impact: 'Améliore la précision des propositions',
        examples: ['Technologies: React + Node.js', 'Compatibilité: tous navigateurs modernes']
      });
    }
    
    if (!projectData.skills_required?.length && analysis.technical.detected_technologies.length === 0) {
      missing.push({
        type: 'skills_requirements',
        description: 'Compétences et expertise requises',
        priority: 'medium',
        suggestion: 'Lister les compétences clés attendues',
        impact: 'Facilite la sélection des prestataires qualifiés',
        examples: ['Expertise React.js requise', 'Expérience UX/UI obligatoire']
      });
    }
    
    if (analysis.business.user_benefit_clarity < 0.5) {
      missing.push({
        type: 'business_context',
        description: 'Contexte business et objectifs',
        priority: 'low',
        suggestion: 'Expliquer la valeur attendue et les objectifs business',
        impact: 'Permet aux prestataires de proposer des solutions optimales',
        examples: ['Objectif: augmenter les conversions de 25%', 'Contexte: modernisation du site existant']
      });
    }
    
    return missing;
  }

  /**
   * Recommandations d'optimisation
   */
  private generateOptimizations(standardization: any, analysis: any) {
    const recommendations = this.generateOptimizationRecommendations(standardization, analysis);
    
    return {
      optimization_recommendations: recommendations
    };
  }

  /**
   * Génère des recommandations d'optimisation détaillées
   */
  private generateOptimizationRecommendations(projectData: any, analysis: any): string[] {
    const recommendations: string[] = [];
    
    // Optimisations techniques
    if (analysis.technical.complexity_score > 7) {
      recommendations.push('Découper le projet en phases pour réduire les risques');
      recommendations.push('Prévoir des revues techniques régulières');
      recommendations.push('Mettre en place une architecture modulaire');
    }
    
    // Optimisations business
    if (analysis.business.business_value_score > 6) {
      recommendations.push('Définir des KPI mesurables pour valider le succès');
      recommendations.push('Planifier une phase de tests utilisateurs');
      recommendations.push('Prévoir un plan de déploiement progressif');
    }
    
    // Optimisations marché
    if (analysis.market.competition_level === 'high') {
      recommendations.push('Différenciation par la qualité plutôt que le prix');
      recommendations.push('Valoriser l\'expertise spécialisée');
      recommendations.push('Proposer des garanties étendues');
    }

    // Optimisations qualité
    if (analysis.quality.overall_quality < 70) {
      recommendations.push('Enrichir le brief avec plus de détails techniques');
      recommendations.push('Clarifier les objectifs et contraintes');
    }

    // Optimisations budgétaires
    if (!projectData.budget || projectData.budget < 1000) {
      recommendations.push('Revoir le budget pour attirer des profils qualifiés');
      recommendations.push('Considérer un paiement échelonné');
    }
    
    return recommendations;
  }

  // ==== MÉTHODES UTILITAIRES ====

  private initializePatterns() {
    this.categoryPatterns = new Map([
      ['web-development', [
        /site web|website|web app|application web/i,
        /frontend|backend|fullstack|full-stack/i,
        /react|vue|angular|javascript|typescript/i,
        /html|css|responsive|interface/i
      ]],
      ['mobile-development', [
        /application mobile|app mobile|mobile app/i,
        /ios|android|react native|flutter/i,
        /smartphone|tablette|mobile/i
      ]],
      ['design', [
        /design|graphisme|ui\/ux|interface utilisateur/i,
        /logo|identité visuelle|charte graphique/i,
        /adobe|figma|sketch|photoshop/i,
        /maquette|wireframe|prototype/i
      ]],
      ['marketing', [
        /marketing|publicité|communication/i,
        /seo|référencement|google ads|facebook ads/i,
        /social media|réseaux sociaux|content marketing/i,
        /campagne|stratégie marketing|brand/i
      ]],
      ['ecommerce', [
        /e-commerce|ecommerce|boutique en ligne|vente en ligne/i,
        /shopify|woocommerce|prestashop|magento/i,
        /paiement|panier|commande|catalogue/i
      ]],
      ['data-science', [
        /data science|machine learning|intelligence artificielle/i,
        /analyse de données|big data|dashboard|reporting/i,
        /python|r|sql|tableau|power bi/i
      ]]
    ]);
  }

  private initializeSkillsDatabase() {
    this.skillsDatabase = new Map([
      ['Frontend', [
        'React.js', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript',
        'HTML5', 'CSS3', 'SASS', 'Responsive Design', 'UI/UX'
      ]],
      ['Backend', [
        'Node.js', 'Python', 'Java', 'PHP', 'Express.js',
        'API REST', 'GraphQL', 'Microservices', 'WebSockets'
      ]],
      ['Database', [
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
        'Database Design', 'Query Optimization', 'Data Modeling'
      ]],
      ['Mobile', [
        'React Native', 'Flutter', 'iOS Development', 'Android Development',
        'Cross-platform', 'Mobile UI/UX', 'App Store Optimization'
      ]],
      ['Cloud', [
        'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes',
        'CI/CD', 'DevOps', 'Cloud Architecture', 'Serverless'
      ]],
      ['Design', [
        'Adobe Creative Suite', 'Figma', 'Sketch', 'Prototyping',
        'User Research', 'Wireframing', 'Brand Design', 'Logo Design'
      ]]
    ]);
  }

  // Méthodes d'analyse détaillées (implémentation simplifiée)
  private analyzeStructuralElements(text: string): number {
    const hasLists = /(\d+\.|•|-|₋)/g.test(text);
    const hasSections = /\n\s*\n/g.test(text);
    const hasQuestions = text.includes('?');
    
    let score = 0;
    if (hasLists) score += 30;
    if (hasSections) score += 20;
    if (hasQuestions) score += 10;
    
    return Math.min(100, score + 40); // Base de 40
  }

  private calculateReadabilityScore(sentences: string[], words: string[]): number {
    const avgWordsPerSentence = words.length / sentences.length;
    const complexWords = words.filter(w => w.length > 6).length;
    const complexityRatio = complexWords / words.length;
    
    // Score de lisibilité simplifié
    let score = 100;
    if (avgWordsPerSentence > 20) score -= 20;
    if (complexityRatio > 0.3) score -= 15;
    
    return Math.max(0, score);
  }

  private calculateInformationDensity(text: string): number {
    const informativeWords = this.qualityMetrics.filter(metric => 
      text.includes(metric)
    ).length;
    
    return Math.min(100, informativeWords * 8);
  }

  private analyzeIntegrationComplexity(text: string): number {
    const integrationKeywords = ['api', 'intégration', 'synchronisation', 'import', 'export', 'webhook'];
    const matches = integrationKeywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(10, matches * 2);
  }

  private analyzeScalabilityNeeds(text: string): number {
    const scalabilityKeywords = ['scalabilité', 'montée en charge', 'performance', 'croissance', 'évolutif'];
    const matches = scalabilityKeywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(10, matches * 2);
  }

  private analyzePerformanceNeeds(text: string): number {
    const performanceKeywords = ['performance', 'rapide', 'optimisation', 'temps de chargement', 'vitesse'];
    const matches = performanceKeywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(10, matches * 2);
  }

  private calculateMarketImpact(text: string): number {
    const impactKeywords = ['innovation', 'révolutionnaire', 'première', 'unique', 'disruptif'];
    const matches = impactKeywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(10, matches * 2 + 3);
  }

  private analyzeUserBenefits(text: string): number {
    const benefitKeywords = ['utilisateur', 'client', 'bénéfice', 'avantage', 'valeur ajoutée'];
    const matches = benefitKeywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(1, matches * 0.2 + 0.3);
  }

  private analyzeCompetitiveAdvantage(text: string): number {
    const advantageKeywords = ['unique', 'différenciation', 'avantage', 'innovation', 'exclusif'];
    const matches = advantageKeywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(1, matches * 0.25 + 0.2);
  }

  // Méthodes utilitaires (implémentation simplifiée pour le prototype)
  private getMarketIntelligence(category: string) {
    return {
      demand_level: 'medium',
      supply_level: 'high',
      price_trend: 'stable',
      growth_rate: '5-10%'
    };
  }

  private assessCompetitionLevel(category: string, budget: number): string {
    if (budget > 10000) return 'low';
    if (budget > 3000) return 'medium';
    return 'high';
  }

  private forecastDemand(category: string) {
    return {
      current: 'medium',
      trend: 'increasing',
      seasonal_factor: 1.0
    };
  }

  private analyzePricePositioning(budget: number, category: string): string {
    if (budget > 10000) return 'premium';
    if (budget > 3000) return 'standard-plus';
    if (budget > 1000) return 'standard';
    return 'budget';
  }

  private analyzeTrends(category: string) {
    return {
      technology_trends: ['AI Integration', 'Mobile-First', 'Cloud Native'],
      market_trends: ['Remote Work', 'Digital Transformation', 'Sustainability']
    };
  }

  private assessOpportunity(projectData: ProjectData) {
    return {
      market_size: 'large',
      growth_potential: 'high',
      competition_intensity: 'medium'
    };
  }

  private calculateCompleteness(projectData: ProjectData): number {
    let score = 0;
    if (projectData.title) score += 15;
    if (projectData.description && projectData.description.length > 50) score += 25;
    if (projectData.budget) score += 20;
    if (projectData.timeline) score += 15;
    if (projectData.skills_required?.length) score += 15;
    if (projectData.constraints?.length) score += 10;
    return score;
  }

  private calculateClarity(text: string): number {
    const sentences = text.split(/[.!?]+/);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    if (avgLength < 50) return 90;
    if (avgLength < 100) return 75;
    if (avgLength < 150) return 60;
    return 45;
  }

  private calculateStructure(text: string): number {
    let score = 40;
    if (/\d+\./g.test(text)) score += 20;
    if (/•|-/g.test(text)) score += 15;
    if (/\n\s*\n/g.test(text)) score += 15;
    if (text.includes('objectif')) score += 10;
    return Math.min(100, score);
  }

  private calculateSpecificity(text: string): number {
    const specificTerms = ['exactement', 'précisément', 'spécifiquement', 'notamment', 'par exemple'];
    const matches = specificTerms.filter(term => text.includes(term)).length;
    const numbers = (text.match(/\d+/g) || []).length;
    
    return Math.min(100, (matches * 15) + (numbers * 5) + 30);
  }

  private identifyImprovementAreas(projectData: ProjectData): string[] {
    const areas: string[] = [];
    
    if (!projectData.budget) areas.push('Définir une fourchette budgétaire');
    if (!projectData.timeline) areas.push('Préciser les contraintes temporelles');
    if (projectData.description.length < 100) areas.push('Enrichir la description du besoin');
    if (!projectData.skills_required?.length) areas.push('Spécifier les compétences requises');
    
    return areas;
  }

  private getQualityIndicators(text: string): string[] {
    const indicators: string[] = [];
    
    if (text.length > 200) indicators.push('Description détaillée');
    if (/\d+/g.test(text)) indicators.push('Éléments quantifiés');
    if (this.qualityMetrics.some(metric => text.includes(metric))) {
      indicators.push('Vocabulaire structuré');
    }
    
    return indicators;
  }

  private extractNamedEntities(text: string): Array<{type: string, value: string, confidence: number}> {
    // Extraction simplifiée d'entités
    const entities: Array<{type: string, value: string, confidence: number}> = [];
    
    // Technologies
    const techMatches = text.match(/(react|vue|angular|node\.js|python|java)/gi) || [];
    techMatches.forEach(match => {
      entities.push({ type: 'TECHNOLOGY', value: match, confidence: 0.9 });
    });
    
    // Entreprises/Brands
    const brandMatches = text.match(/(google|microsoft|apple|adobe|figma)/gi) || [];
    brandMatches.forEach(match => {
      entities.push({ type: 'BRAND', value: match, confidence: 0.8 });
    });
    
    return entities;
  }

  private analyzeIntentions(text: string): string[] {
    const intentions: string[] = [];
    
    if (/créer|développer|construire|faire/i.test(text)) intentions.push('creation');
    if (/améliorer|optimiser|moderniser/i.test(text)) intentions.push('improvement');
    if (/réparer|corriger|résoudre/i.test(text)) intentions.push('maintenance');
    if (/analyser|étudier|comprendre/i.test(text)) intentions.push('analysis');
    
    return intentions;
  }

  private extractConcepts(text: string): string[] {
    const concepts: string[] = [];
    
    this.complexityIndicators.forEach(indicator => {
      if (text.includes(indicator)) concepts.push(indicator);
    });
    
    return concepts.slice(0, 10); // Top 10 concepts
  }

  private calculateSemanticCoherence(text: string): number {
    // Analyse simplifiée de cohérence sémantique
    const concepts = this.extractConcepts(text);
    const conceptDensity = concepts.length / text.split(' ').length * 100;
    
    return Math.min(100, conceptDensity * 10 + 50);
  }

  private analyzeDomainSpecificity(text: string): number {
    let specificityScore = 0;
    
    // Analyse par domaine
    Object.values(this.skillsDatabase).forEach(skills => {
      const matches = skills.filter(skill => 
        text.toLowerCase().includes(skill.toLowerCase())
      ).length;
      specificityScore += matches;
    });
    
    return Math.min(100, specificityScore * 5);
  }

  private analyzeContextRichness(text: string): number {
    const contextWords = ['contexte', 'pourquoi', 'objectif', 'besoin', 'problème', 'solution'];
    const matches = contextWords.filter(word => text.includes(word)).length;
    
    return Math.min(100, matches * 15 + 25);
  }

  private selectKeySesentences(sentences: string[], analysis: any): string[] {
    // Sélection des phrases les plus informatives
    return sentences
      .filter(s => s.trim().length > 20)
      .map(s => ({
        sentence: s.trim(),
        score: this.scoreSentenceImportance(s, analysis)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence);
  }

  private scoreSentenceImportance(sentence: string, analysis: any): number {
    let score = 0;
    
    // Mots-clés techniques
    if (analysis.technical.detected_technologies.some((tech: string) => 
      sentence.toLowerCase().includes(tech.toLowerCase()))) {
      score += 20;
    }
    
    // Informations business
    if (/objectif|besoin|résultat|valeur/i.test(sentence)) score += 15;
    
    // Contraintes et spécifications
    if (/délai|budget|contrainte|spécification/i.test(sentence)) score += 12;
    
    return score;
  }

  private applyIntelligentCapitalization(title: string): string {
    const words = title.split(' ');
    const stopWords = ['de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'et', 'ou', 'pour', 'avec'];
    
    return words.map((word, index) => {
      if (index === 0 || !stopWords.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    }).join(' ');
  }

  private generateIntelligentTags(projectData: ProjectData, analysis: any, mainCategory: string): string[] {
    const tags = new Set<string>();
    
    // Tags de catégorie
    tags.add(mainCategory);
    
    // Tags technologiques
    analysis.technical.detected_technologies.forEach((tech: string) => {
      tags.add(tech.toLowerCase().replace(/\s+/g, '-'));
    });
    
    // Tags de complexité
    if (analysis.technical.complexity_score > 7) tags.add('projet-complexe');
    if (analysis.technical.complexity_score < 3) tags.add('projet-simple');
    
    // Tags business
    if (analysis.business.business_value_score > 6) tags.add('forte-valeur-ajoutée');
    if (analysis.business.strategic_importance > 5) tags.add('stratégique');
    
    // Tags de marché
    if (analysis.market.competition_level === 'high') tags.add('marché-concurrentiel');
    if (analysis.market.demand_forecast.trend === 'increasing') tags.add('secteur-porteur');
    
    return Array.from(tags).slice(0, 10);
  }

  private calculateSkillRelevance(skill: string, text: string): number {
    const directMatch = text.includes(skill.toLowerCase()) ? 10 : 0;
    const relatedWords = this.skillsDatabase.get(skill) || [];
    const relatedMatches = relatedWords.filter(related => 
      text.includes(related.toLowerCase())
    ).length;
    
    return directMatch + relatedMatches * 2;
  }

  private extractStandardizedConstraints(projectData: ProjectData, analysis: any): string[] {
    const constraints: string[] = [];
    const text = `${projectData.title} ${projectData.description}`.toLowerCase();
    
    // Contraintes temporelles
    if (text.includes('urgent') || text.includes('rapidement')) {
      constraints.push('Délai serré - livraison prioritaire');
    }
    
    // Contraintes budgétaires
    if (text.includes('budget serré') || text.includes('petit budget')) {
      constraints.push('Budget optimisé - solution économique');
    }
    
    // Contraintes techniques
    if (text.includes('compatible') || text.includes('compatibilité')) {
      constraints.push('Compatibilité multi-plateforme requise');
    }
    
    if (text.includes('sécurit') || text.includes('sécuris')) {
      constraints.push('Sécurité renforcée obligatoire');
    }
    
    // Contraintes existantes du projet
    if (projectData.constraints?.length) {
      constraints.push(...projectData.constraints);
    }
    
    return [...new Set(constraints)].slice(0, 8);
  }

  private calculateRichnessScore(analysis: any): number {
    const linguisticScore = analysis.linguistic.information_density;
    const technicalScore = analysis.technical.complexity_score * 10;
    const businessScore = analysis.business.business_value_score * 10;
    const semanticScore = analysis.semantic.context_richness;
    
    return Math.round((linguisticScore + technicalScore + businessScore + semanticScore) / 4);
  }

  private generatePricingReasoning(complexity: number, businessValue: number, marketPosition: string): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Complexité technique: ${complexity}/10 points`);
    reasoning.push(`Valeur business: ${businessValue}/10 points`);
    reasoning.push(`Positionnement marché: ${marketPosition}`);
    
    if (complexity > 7) {
      reasoning.push('Expertise technique avancée requise');
    }
    
    if (businessValue > 6) {
      reasoning.push('Fort impact business justifiant un prix premium');
    }
    
    return reasoning;
  }

  private generateLOCRecommendations(basePrice: number, complexity: number) {
    const currentLoc = Math.min(0.9, 0.5 + (complexity * 0.05));
    const recommendedBudget = Math.round(basePrice * 1.15);
    const recommendedDelay = Math.round(complexity * 6);
    const expectedImprovement = Math.min(0.25, 0.1 + (complexity * 0.02));
    
    return {
      current_loc: currentLoc,
      recommended_budget: recommendedBudget,
      recommended_delay: recommendedDelay,
      expected_loc_improvement: expectedImprovement,
      optimization_strategy: complexity > 6 ? 'phases' : 'direct'
    };
  }

  private fuzzyMatch(text: string, pattern: string, threshold: number = 0.8): boolean {
    // Implémentation simplifiée de matching flou
    const commonChars = pattern.split('').filter(char => text.includes(char)).length;
    const similarity = commonChars / pattern.length;
    return similarity >= threshold;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }
}

// Instance singleton pour utilisation dans l'application
export const standardizationEngine = new StandardizationEngine();