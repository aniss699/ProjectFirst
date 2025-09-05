
/**
 * AI Concierge - Assistant IA pour transformation d'idées en briefs structurés
 * Génération automatique de cahiers des charges et questions intelligentes
 */

interface BriefTransformation {
  originalIdea: string;
  structuredBrief: {
    title: string;
    description: string;
    objectives: string[];
    deliverables: string[];
    technicalRequirements: string[];
    constraints: string[];
    successCriteria: string[];
  };
  estimatedBudget: {
    min: number;
    max: number;
    justification: string;
  };
  suggestedTimeline: {
    phases: Array<{
      name: string;
      duration: number;
      deliverables: string[];
    }>;
    totalDuration: number;
  };
  clarifyingQuestions: string[];
  riskAssessment: {
    technicalRisks: string[];
    businessRisks: string[];
    mitigationStrategies: string[];
  };
}

interface ConciergeContext {
  clientProfile?: any;
  industryKnowledge?: any;
  previousProjects?: any[];
  marketConditions?: any;
}

class AIConciergeEngine {
  private questionTemplates = new Map<string, string[]>();
  private industryPatterns = new Map<string, any>();

  constructor() {
    this.initializeTemplates();
    this.loadIndustryPatterns();
  }

  /**
   * Transforme une idée floue en brief structuré
   */
  async transformIdeaToBrief(
    userInput: string, 
    context: ConciergeContext = {}
  ): Promise<BriefTransformation> {
    try {
      // 1. Analyse sémantique de l'idée
      const semanticAnalysis = this.analyzeSemanticContent(userInput);
      
      // 2. Extraction des intentions et objectifs
      const intentions = this.extractIntentions(userInput, semanticAnalysis);
      
      // 3. Génération du brief structuré
      const structuredBrief = this.generateStructuredBrief(intentions, context);
      
      // 4. Estimation budget et timeline
      const budgetEstimation = this.estimateBudgetAndTimeline(structuredBrief, context);
      
      // 5. Génération des questions clarifiantes
      const clarifyingQuestions = this.generateClarifyingQuestions(structuredBrief, userInput);
      
      // 6. Évaluation des risques
      const riskAssessment = this.assessProjectRisks(structuredBrief, context);

      return {
        originalIdea: userInput,
        structuredBrief,
        estimatedBudget: budgetEstimation.budget,
        suggestedTimeline: budgetEstimation.timeline,
        clarifyingQuestions,
        riskAssessment
      };
    } catch (error) {
      console.error('AI Concierge transformation failed:', error);
      return this.generateFallbackBrief(userInput);
    }
  }

  /**
   * Génère des questions intelligentes pour compléter un brief
   */
  async generateIntelligentQuestions(
    briefData: any,
    completionLevel: number = 0.5
  ): Promise<string[]> {
    const questions: string[] = [];
    
    // Questions basées sur les lacunes détectées
    if (!briefData.title || briefData.title.length < 10) {
      questions.push("Pouvez-vous préciser le titre ou l'objectif principal de votre projet ?");
    }
    
    if (!briefData.targetAudience) {
      questions.push("Qui est votre audience cible ou vos utilisateurs finaux ?");
    }
    
    if (!briefData.budget || briefData.budget === 0) {
      questions.push("Quel est votre budget approximatif pour ce projet ?");
    }
    
    if (!briefData.timeline) {
      questions.push("Dans quels délais souhaitez-vous voir ce projet réalisé ?");
    }
    
    if (!briefData.technicalConstraints || briefData.technicalConstraints.length === 0) {
      questions.push("Avez-vous des contraintes techniques particulières ou des technologies préférées ?");
    }
    
    // Questions contextuelles intelligentes
    const contextualQuestions = this.generateContextualQuestions(briefData);
    questions.push(...contextualQuestions);
    
    return questions.slice(0, 5); // Limiter à 5 questions max
  }

  /**
   * Améliore progressivement un brief basé sur les réponses
   */
  async improveBriefIteratively(
    currentBrief: any,
    userAnswers: Array<{ question: string; answer: string }>
  ): Promise<any> {
    let improvedBrief = { ...currentBrief };
    
    for (const qa of userAnswers) {
      improvedBrief = this.incorporateAnswer(improvedBrief, qa);
    }
    
    // Recalcul des estimations
    const updatedEstimations = this.recalculateEstimations(improvedBrief);
    
    return {
      ...improvedBrief,
      ...updatedEstimations,
      completionScore: this.calculateCompletionScore(improvedBrief),
      lastUpdated: new Date().toISOString()
    };
  }

  // Méthodes privées d'analyse et génération

  private analyzeSemanticContent(input: string) {
    const keywords = this.extractKeywords(input);
    const entities = this.extractEntities(input);
    const sentiment = this.analyzeSentiment(input);
    const complexity = this.assessComplexity(input);
    
    return {
      keywords,
      entities,
      sentiment,
      complexity,
      category: this.categorizeProject(keywords, entities)
    };
  }

  private extractIntentions(input: string, analysis: any) {
    const intentions = {
      primaryGoal: this.extractPrimaryGoal(input),
      secondaryGoals: this.extractSecondaryGoals(input),
      userNeeds: this.extractUserNeeds(input),
      businessObjectives: this.extractBusinessObjectives(input),
      constraints: this.extractConstraints(input)
    };
    
    return intentions;
  }

  private generateStructuredBrief(intentions: any, context: ConciergeContext) {
    return {
      title: this.generateTitle(intentions),
      description: this.generateDescription(intentions),
      objectives: this.generateObjectives(intentions),
      deliverables: this.generateDeliverables(intentions),
      technicalRequirements: this.generateTechnicalRequirements(intentions, context),
      constraints: this.generateConstraints(intentions),
      successCriteria: this.generateSuccessCriteria(intentions)
    };
  }

  private estimateBudgetAndTimeline(brief: any, context: ConciergeContext) {
    const complexity = this.assessBriefComplexity(brief);
    const category = this.categorizeBrief(brief);
    
    // Base estimates par catégorie
    const baseEstimates = this.getBaseEstimates(category);
    
    // Ajustements selon la complexité
    const complexityMultiplier = this.getComplexityMultiplier(complexity);
    
    const budget = {
      min: Math.round(baseEstimates.budget.min * complexityMultiplier),
      max: Math.round(baseEstimates.budget.max * complexityMultiplier),
      justification: this.generateBudgetJustification(complexity, category)
    };
    
    const timeline = {
      phases: this.generateTimelinePhases(brief, complexity),
      totalDuration: Math.round(baseEstimates.timeline * complexityMultiplier)
    };
    
    return { budget, timeline };
  }

  private generateClarifyingQuestions(brief: any, originalInput: string): string[] {
    const questions: string[] = [];
    
    // Questions sur les aspects manquants
    if (!brief.objectives || brief.objectives.length < 2) {
      questions.push("Quels sont vos objectifs spécifiques pour ce projet ?");
    }
    
    if (!brief.technicalRequirements || brief.technicalRequirements.length === 0) {
      questions.push("Avez-vous des préférences techniques ou des contraintes d'intégration ?");
    }
    
    // Questions métier
    questions.push("Qui utilisera principalement cette solution ?");
    questions.push("Comment mesurez-vous le succès de ce projet ?");
    
    // Questions techniques selon le type de projet
    const projectType = this.detectProjectType(brief);
    const typeSpecificQuestions = this.getTypeSpecificQuestions(projectType);
    questions.push(...typeSpecificQuestions.slice(0, 2));
    
    return questions.slice(0, 5);
  }

  private assessProjectRisks(brief: any, context: ConciergeContext) {
    return {
      technicalRisks: this.identifyTechnicalRisks(brief),
      businessRisks: this.identifyBusinessRisks(brief, context),
      mitigationStrategies: this.generateMitigationStrategies(brief)
    };
  }

  // Méthodes utilitaires

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const stopWords = ['dans', 'avec', 'pour', 'une', 'des', 'les', 'que', 'qui', 'sur', 'par'];
    return words.filter(word => !stopWords.includes(word));
  }

  private extractEntities(text: string): any[] {
    // Détection simple d'entités (technologies, industries, etc.)
    const techTerms = ['web', 'mobile', 'app', 'site', 'api', 'database', 'ai', 'ml', 'react', 'node'];
    const businessTerms = ['ecommerce', 'crm', 'erp', 'marketplace', 'saas', 'b2b', 'b2c'];
    
    const entities = [];
    const lowerText = text.toLowerCase();
    
    techTerms.forEach(term => {
      if (lowerText.includes(term)) {
        entities.push({ type: 'technology', value: term });
      }
    });
    
    businessTerms.forEach(term => {
      if (lowerText.includes(term)) {
        entities.push({ type: 'business', value: term });
      }
    });
    
    return entities;
  }

  private generateTitle(intentions: any): string {
    if (intentions.primaryGoal) {
      return `Développement : ${intentions.primaryGoal}`;
    }
    return "Projet de développement sur mesure";
  }

  private generateDescription(intentions: any): string {
    let description = "Projet visant à ";
    
    if (intentions.primaryGoal) {
      description += intentions.primaryGoal.toLowerCase();
    }
    
    if (intentions.userNeeds && intentions.userNeeds.length > 0) {
      description += ` afin de répondre aux besoins suivants : ${intentions.userNeeds.join(', ')}.`;
    }
    
    return description;
  }

  private generateObjectives(intentions: any): string[] {
    const objectives = [];
    
    if (intentions.primaryGoal) {
      objectives.push(intentions.primaryGoal);
    }
    
    if (intentions.secondaryGoals) {
      objectives.push(...intentions.secondaryGoals.slice(0, 3));
    }
    
    if (objectives.length === 0) {
      objectives.push("Créer une solution fonctionnelle répondant aux besoins exprimés");
    }
    
    return objectives;
  }

  private initializeTemplates() {
    this.questionTemplates.set('web-development', [
      "Avez-vous une charte graphique existante ?",
      "Le site doit-il être responsive (mobile-friendly) ?",
      "Avez-vous besoin d'un système de gestion de contenu (CMS) ?",
      "Faut-il intégrer des services tiers (paiement, analytics, etc.) ?"
    ]);
    
    this.questionTemplates.set('mobile-development', [
      "Cibler vous iOS, Android, ou les deux ?",
      "L'application doit-elle fonctionner hors ligne ?",
      "Avez-vous besoin de notifications push ?",
      "L'app doit-elle s'intégrer avec des APIs existantes ?"
    ]);
  }

  private loadIndustryPatterns() {
    this.industryPatterns.set('ecommerce', {
      commonFeatures: ['catalog', 'cart', 'payment', 'orders', 'inventory'],
      avgBudget: { min: 3000, max: 15000 },
      avgTimeline: 60
    });
    
    this.industryPatterns.set('crm', {
      commonFeatures: ['contacts', 'leads', 'pipeline', 'reporting'],
      avgBudget: { min: 5000, max: 25000 },
      avgTimeline: 90
    });
  }

  private generateFallbackBrief(input: string): BriefTransformation {
    return {
      originalIdea: input,
      structuredBrief: {
        title: "Projet à définir",
        description: input,
        objectives: ["Clarifier les objectifs du projet"],
        deliverables: ["Livrable à définir"],
        technicalRequirements: ["À spécifier"],
        constraints: ["À identifier"],
        successCriteria: ["À établir"]
      },
      estimatedBudget: {
        min: 1000,
        max: 5000,
        justification: "Estimation préliminaire en attente de précisions"
      },
      suggestedTimeline: {
        phases: [
          { name: "Analyse et conception", duration: 7, deliverables: ["Spécifications"] },
          { name: "Développement", duration: 21, deliverables: ["Solution fonctionnelle"] },
          { name: "Tests et livraison", duration: 7, deliverables: ["Livraison finale"] }
        ],
        totalDuration: 35
      },
      clarifyingQuestions: [
        "Pouvez-vous détailler davantage votre besoin ?",
        "Quel est l'objectif principal de ce projet ?",
        "Qui sont les utilisateurs finaux ?",
        "Avez-vous un budget en tête ?",
        "Dans quels délais souhaitez-vous aboutir ?"
      ],
      riskAssessment: {
        technicalRisks: ["Spécifications incomplètes"],
        businessRisks: ["Objectifs flous"],
        mitigationStrategies: ["Clarification progressive des besoins"]
      }
    };
  }

  // Méthodes utilitaires supplémentaires...
  private extractPrimaryGoal(input: string): string {
    if (input.includes('créer') || input.includes('développer')) {
      return 'Créer une solution personnalisée';
    }
    if (input.includes('améliorer') || input.includes('optimiser')) {
      return 'Améliorer un système existant';
    }
    return 'Réaliser un projet sur mesure';
  }

  private extractSecondaryGoals(input: string): string[] {
    const goals = [];
    if (input.includes('mobile')) goals.push('Compatibilité mobile');
    if (input.includes('sécur')) goals.push('Sécurité renforcée');
    if (input.includes('performance')) goals.push('Optimisation performance');
    return goals;
  }

  private extractUserNeeds(input: string): string[] {
    const needs = [];
    if (input.includes('facile') || input.includes('simple')) {
      needs.push('Interface intuitive');
    }
    if (input.includes('rapide') || input.includes('performance')) {
      needs.push('Performance optimale');
    }
    return needs;
  }

  private extractBusinessObjectives(input: string): string[] {
    const objectives = [];
    if (input.includes('vente') || input.includes('revenue')) {
      objectives.push('Augmentation des revenus');
    }
    if (input.includes('productivité') || input.includes('efficacité')) {
      objectives.push('Amélioration de la productivité');
    }
    return objectives;
  }

  private extractConstraints(input: string): string[] {
    const constraints = [];
    if (input.includes('budget') || input.includes('coût')) {
      constraints.push('Contraintes budgétaires');
    }
    if (input.includes('délai') || input.includes('urgent')) {
      constraints.push('Contraintes temporelles');
    }
    return constraints;
  }

  private generateDeliverables(intentions: any): string[] {
    return [
      'Solution fonctionnelle complète',
      'Documentation technique',
      'Guide utilisateur',
      'Code source commenté'
    ];
  }

  private generateTechnicalRequirements(intentions: any, context: ConciergeContext): string[] {
    const requirements = ['Code propre et documenté', 'Tests unitaires'];
    
    if (context.clientProfile?.preferredTech) {
      requirements.push(`Technologies : ${context.clientProfile.preferredTech.join(', ')}`);
    }
    
    return requirements;
  }

  private generateConstraints(intentions: any): string[] {
    return intentions.constraints || ['Respect des délais', 'Qualité du code'];
  }

  private generateSuccessCriteria(intentions: any): string[] {
    return [
      'Fonctionnalités conformes au cahier des charges',
      'Tests de validation réussis',
      'Performance satisfaisante',
      'Satisfaction client'
    ];
  }

  private assessBriefComplexity(brief: any): string {
    const score = brief.objectives.length + brief.deliverables.length + brief.technicalRequirements.length;
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  private categorizeBrief(brief: any): string {
    const description = brief.description.toLowerCase();
    if (description.includes('web') || description.includes('site')) return 'web-development';
    if (description.includes('mobile') || description.includes('app')) return 'mobile-development';
    if (description.includes('design') || description.includes('ui')) return 'design';
    return 'general-development';
  }

  private getBaseEstimates(category: string) {
    const estimates = {
      'web-development': { budget: { min: 2000, max: 8000 }, timeline: 30 },
      'mobile-development': { budget: { min: 5000, max: 15000 }, timeline: 45 },
      'design': { budget: { min: 1000, max: 5000 }, timeline: 15 },
      'general-development': { budget: { min: 1500, max: 6000 }, timeline: 25 }
    };
    
    return estimates[category] || estimates['general-development'];
  }

  private getComplexityMultiplier(complexity: string): number {
    const multipliers = { low: 0.8, medium: 1.0, high: 1.5 };
    return multipliers[complexity] || 1.0;
  }

  private generateBudgetJustification(complexity: string, category: string): string {
    return `Estimation basée sur la complexité ${complexity} pour un projet de type ${category}`;
  }

  private generateTimelinePhases(brief: any, complexity: string) {
    const basePhases = [
      { name: "Conception et analyse", duration: 5, deliverables: ["Cahier des charges détaillé"] },
      { name: "Développement", duration: 15, deliverables: ["Version fonctionnelle"] },
      { name: "Tests et optimisation", duration: 5, deliverables: ["Solution finalisée"] },
      { name: "Livraison et formation", duration: 3, deliverables: ["Livraison finale", "Formation"] }
    ];
    
    const multiplier = this.getComplexityMultiplier(complexity);
    return basePhases.map(phase => ({
      ...phase,
      duration: Math.round(phase.duration * multiplier)
    }));
  }

  private detectProjectType(brief: any): string {
    return this.categorizeBrief(brief);
  }

  private getTypeSpecificQuestions(projectType: string): string[] {
    return this.questionTemplates.get(projectType) || [
      "Avez-vous des références ou exemples similaires ?",
      "Quelles sont vos contraintes techniques principales ?"
    ];
  }

  private identifyTechnicalRisks(brief: any): string[] {
    const risks = [];
    if (brief.technicalRequirements.length === 0) {
      risks.push('Spécifications techniques incomplètes');
    }
    if (brief.constraints.includes('délai')) {
      risks.push('Contraintes de temps serrées');
    }
    return risks;
  }

  private identifyBusinessRisks(brief: any, context: ConciergeContext): string[] {
    const risks = [];
    if (!brief.successCriteria || brief.successCriteria.length === 0) {
      risks.push('Critères de succès non définis');
    }
    return risks;
  }

  private generateMitigationStrategies(brief: any): string[] {
    return [
      'Validation étape par étape',
      'Communication régulière avec le client',
      'Tests fréquents et itératifs',
      'Documentation continue'
    ];
  }

  private generateContextualQuestions(briefData: any): string[] {
    const questions = [];
    
    // Questions sur l'intégration
    if (briefData.existingSystems) {
      questions.push("Comment cette solution s'intégrera-t-elle avec vos systèmes existants ?");
    }
    
    // Questions sur la scalabilité
    if (briefData.expectedUsers > 1000) {
      questions.push("Prévoyez-vous une montée en charge significative ?");
    }
    
    return questions;
  }

  private incorporateAnswer(brief: any, qa: { question: string; answer: string }): any {
    const updatedBrief = { ...brief };
    
    // Logique simple d'incorporation des réponses
    if (qa.question.includes('budget') && qa.answer.match(/\d+/)) {
      const budgetMatch = qa.answer.match(/\d+/);
      if (budgetMatch) {
        updatedBrief.estimatedBudget = parseInt(budgetMatch[0]);
      }
    }
    
    if (qa.question.includes('délai') && qa.answer.match(/\d+/)) {
      const timelineMatch = qa.answer.match(/\d+/);
      if (timelineMatch) {
        updatedBrief.timeline = parseInt(timelineMatch[0]);
      }
    }
    
    // Ajout à la description si réponse pertinente
    if (qa.answer.length > 10) {
      updatedBrief.description += ` ${qa.answer}`;
    }
    
    return updatedBrief;
  }

  private recalculateEstimations(brief: any): any {
    // Recalcul simplifié basé sur les nouvelles informations
    return {
      completionScore: this.calculateCompletionScore(brief),
      confidence: Math.min(95, this.calculateCompletionScore(brief) + 20)
    };
  }

  private calculateCompletionScore(brief: any): number {
    let score = 0;
    
    if (brief.title && brief.title.length > 5) score += 10;
    if (brief.description && brief.description.length > 20) score += 15;
    if (brief.objectives && brief.objectives.length > 0) score += 15;
    if (brief.deliverables && brief.deliverables.length > 0) score += 15;
    if (brief.technicalRequirements && brief.technicalRequirements.length > 0) score += 15;
    if (brief.estimatedBudget && brief.estimatedBudget > 0) score += 15;
    if (brief.timeline && brief.timeline > 0) score += 15;
    
    return Math.min(100, score);
  }

  private analyzeSentiment(text: string): string {
    const positiveWords = ['bon', 'excellent', 'parfait', 'super', 'génial'];
    const negativeWords = ['problème', 'difficile', 'compliqué', 'urgent', 'critique'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private assessComplexity(text: string): string {
    const complexTerms = ['api', 'database', 'intégration', 'sécurité', 'performance', 'scalabilité'];
    const lowerText = text.toLowerCase();
    const complexityScore = complexTerms.filter(term => lowerText.includes(term)).length;
    
    if (complexityScore >= 3) return 'high';
    if (complexityScore >= 1) return 'medium';
    return 'low';
  }

  private categorizeProject(keywords: string[], entities: any[]): string {
    const webTerms = ['site', 'web', 'internet', 'html', 'css'];
    const mobileTerms = ['mobile', 'app', 'application', 'ios', 'android'];
    const designTerms = ['design', 'graphique', 'logo', 'identité', 'charte'];
    
    const hasWebTerms = keywords.some(k => webTerms.includes(k));
    const hasMobileTerms = keywords.some(k => mobileTerms.includes(k));
    const hasDesignTerms = keywords.some(k => designTerms.includes(k));
    
    if (hasWebTerms) return 'web-development';
    if (hasMobileTerms) return 'mobile-development';
    if (hasDesignTerms) return 'design';
    return 'general-development';
  }
}

export const aiConciergeEngine = new AIConciergeEngine();
export type { BriefTransformation, ConciergeContext };
