/**
 * Assistant Simple de Création de Briefs - SwipDEAL
 * Aide basique pour structurer les idées de projets (sans IA complexe)
 */

interface SimpleBriefStructure {
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

interface SimpleAssistantContext {
  category?: string;
  estimatedComplexity?: 'simple' | 'medium' | 'complex';
  userExperience?: 'beginner' | 'experienced';
}

class SimpleBriefAssistant {
  private categoryTemplates = new Map<string, any>();
  private basicQuestions: string[] = [];

  constructor() {
    this.initializeBasicTemplates();
  }

  /**
   * Structuration simple d'une idée en brief (pas d'IA)
   */
  async createStructuredBrief(
    userInput: string, 
    context: SimpleAssistantContext = {}
  ): Promise<SimpleBriefStructure> {
    console.log('📝 Simple Brief Assistant: Creating structured brief...');

    try {
      // 1. Détection simple de catégorie
      const detectedCategory = this.detectSimpleCategory(userInput);
      const category = context.category || detectedCategory;
      
      // 2. Génération du brief basé sur des templates
      const template = this.getTemplate(category);
      const structuredBrief = this.fillTemplate(template, userInput);
      
      // 3. Estimation simple budget/délais
      const estimations = this.getSimpleEstimations(category, userInput.length);
      
      // 4. Questions basiques pour compléter
      const questions = this.getBasicQuestions(category, structuredBrief);
      
      // 5. Évaluation simple des risques
      const risks = this.getBasicRisks(category);

      return {
        originalIdea: userInput,
        structuredBrief,
        estimatedBudget: estimations.budget,
        suggestedTimeline: estimations.timeline,
        clarifyingQuestions: questions,
        riskAssessment: risks
      };
    } catch (error) {
      console.error('Brief structuring failed:', error);
      return this.generateFallbackBrief(userInput);
    }
  }

  /**
   * Questions d'aide simple basées sur les manques détectés
   */
  async generateHelpfulQuestions(briefData: any): Promise<string[]> {
    console.log('❓ Generating helpful questions...');
    
    const questions: string[] = [];
    
    // Questions basiques selon les champs manquants
    if (!briefData.title || briefData.title.length < 5) {
      questions.push("Comment pourriez-vous résumer votre projet en une phrase ?");
    }
    
    if (!briefData.targetAudience) {
      questions.push("Qui sont vos utilisateurs cibles ?");
    }
    
    if (!briefData.budget) {
      questions.push("Quel budget aproximatif avez-vous prévu ?");
    }
    
    if (!briefData.deadline) {
      questions.push("Avez-vous une échéance particulière ?");
    }
    
    if (!briefData.technicalPreferences) {
      questions.push("Avez-vous des préférences techniques (technologies, plateformes) ?");
    }

    // Questions contextuelles simples
    if (questions.length < 3) {
      questions.push("Quelles sont vos attentes prioritaires pour ce projet ?");
      questions.push("Y a-t-il des contraintes particulières à prendre en compte ?");
    }
    
    return questions.slice(0, 5); // Max 5 questions
  }

  /**
   * Amélioration simple du brief basée sur les réponses
   */
  async improveBriefWithAnswers(
    currentBrief: any,
    answers: Array<{ question: string; answer: string }>
  ): Promise<any> {
    console.log('🔧 Improving brief with user answers...');
    
    let improvedBrief = { ...currentBrief };
    
    // Intégration simple des réponses
    answers.forEach(qa => {
      improvedBrief = this.incorporateSimpleAnswer(improvedBrief, qa);
    });
    
    // Recalcul simple du score de complétude
    const completionScore = this.calculateSimpleCompletionScore(improvedBrief);
    
    return {
      ...improvedBrief,
      completionScore,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Méthodes privées - logique simple sans IA
   */

  private initializeBasicTemplates(): void {
    // Templates simples par catégorie
    this.categoryTemplates.set('web_development', {
      objectives: [
        'Créer une présence en ligne professionnelle',
        'Offrir une expérience utilisateur fluide',
        'Assurer la compatibilité multi-appareils'
      ],
      deliverables: [
        'Site web responsive',
        'Documentation technique',
        'Formation utilisateur (si nécessaire)'
      ],
      phases: [
        { name: 'Conception & Design', duration: 1 },
        { name: 'Développement', duration: 3 },
        { name: 'Tests & Déploiement', duration: 1 }
      ]
    });

    this.categoryTemplates.set('mobile_app', {
      objectives: [
        'Développer une application mobile intuitive',
        'Optimiser les performances',
        'Respecter les guidelines des stores'
      ],
      deliverables: [
        'Application mobile native/hybride',
        'Guide utilisateur',
        'Support technique initial'
      ],
      phases: [
        { name: 'UX/UI Design', duration: 2 },
        { name: 'Développement', duration: 4 },
        { name: 'Tests & Publication', duration: 1 }
      ]
    });

    // Template par défaut
    this.categoryTemplates.set('default', {
      objectives: [
        'Répondre aux besoins exprimés',
        'Livrer un travail de qualité',
        'Respecter les délais convenus'
      ],
      deliverables: [
        'Livrable principal selon spécifications',
        'Documentation associée',
        'Support post-livraison'
      ],
      phases: [
        { name: 'Analyse & Planification', duration: 1 },
        { name: 'Réalisation', duration: 2 },
        { name: 'Finalisation & Livraison', duration: 1 }
      ]
    });
  }

  private detectSimpleCategory(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Détection simple par mots-clés
    if (lowerInput.includes('site') || lowerInput.includes('web') || lowerInput.includes('internet')) {
      return 'web_development';
    }
    if (lowerInput.includes('app') || lowerInput.includes('mobile') || lowerInput.includes('smartphone')) {
      return 'mobile_app';
    }
    if (lowerInput.includes('logo') || lowerInput.includes('design') || lowerInput.includes('graphique')) {
      return 'design';
    }
    if (lowerInput.includes('marketing') || lowerInput.includes('publicité') || lowerInput.includes('seo')) {
      return 'marketing';
    }
    
    return 'default';
  }

  private getTemplate(category: string): any {
    return this.categoryTemplates.get(category) || this.categoryTemplates.get('default');
  }

  private fillTemplate(template: any, userInput: string): any {
    // Génération simple du titre
    const title = this.generateSimpleTitle(userInput);
    
    return {
      title,
      description: this.improveDescription(userInput),
      objectives: [...template.objectives],
      deliverables: [...template.deliverables],
      technicalRequirements: this.extractSimpleTechRequirements(userInput),
      constraints: this.extractSimpleConstraints(userInput),
      successCriteria: [
        'Livraison dans les délais',
        'Conformité aux specifications',
        'Satisfaction client'
      ]
    };
  }

  private generateSimpleTitle(input: string): string {
    // Extraction simple du titre depuis les premiers mots
    const words = input.split(' ').slice(0, 8);
    let title = words.join(' ');
    
    // Nettoyage basique
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    
    return title || 'Nouveau Projet';
  }

  private improveDescription(input: string): string {
    // Amélioration basique de la description
    let improved = input.trim();
    
    // Ajouter une conclusion si manquante
    if (!improved.includes('objectif') && !improved.includes('but')) {
      improved += '\n\nObjectif : Réaliser ce projet selon les meilleures pratiques du domaine.';
    }
    
    return improved;
  }

  private extractSimpleTechRequirements(input: string): string[] {
    const requirements: string[] = [];
    const lowerInput = input.toLowerCase();
    
    // Détection simple de besoins techniques
    if (lowerInput.includes('responsive') || lowerInput.includes('mobile')) {
      requirements.push('Compatibilité mobile et desktop');
    }
    if (lowerInput.includes('seo')) {
      requirements.push('Optimisation SEO');
    }
    if (lowerInput.includes('rapide') || lowerInput.includes('performance')) {
      requirements.push('Optimisation des performances');
    }
    if (lowerInput.includes('sécur')) {
      requirements.push('Sécurité renforcée');
    }
    
    return requirements.length > 0 ? requirements : ['À définir selon les besoins'];
  }

  private extractSimpleConstraints(input: string): string[] {
    const constraints: string[] = [];
    const lowerInput = input.toLowerCase();
    
    // Détection de contraintes mentionnées
    if (lowerInput.includes('budget') && lowerInput.includes('limit')) {
      constraints.push('Budget limité');
    }
    if (lowerInput.includes('urgent') || lowerInput.includes('rapidement')) {
      constraints.push('Délais serrés');
    }
    if (lowerInput.includes('existant') && lowerInput.includes('integr')) {
      constraints.push('Intégration avec système existant');
    }
    
    return constraints.length > 0 ? constraints : ['Flexibilité sur les approches'];
  }

  private getSimpleEstimations(category: string, inputLength: number): any {
    // Estimations basiques par catégorie
    const estimates = {
      'web_development': { budgetMin: 800, budgetMax: 3000, duration: 3 },
      'mobile_app': { budgetMin: 2000, budgetMax: 8000, duration: 6 },
      'design': { budgetMin: 300, budgetMax: 1500, duration: 2 },
      'marketing': { budgetMin: 500, budgetMax: 2000, duration: 2 },
      'default': { budgetMin: 500, budgetMax: 2500, duration: 3 }
    };
    
    const baseEst = estimates[category] || estimates['default'];
    
    // Ajustement simple selon longueur de description (complexité supposée)
    const complexityFactor = inputLength > 200 ? 1.3 : inputLength < 100 ? 0.8 : 1;
    
    const template = this.getTemplate(category);
    
    return {
      budget: {
        min: Math.round(baseEst.budgetMin * complexityFactor),
        max: Math.round(baseEst.budgetMax * complexityFactor),
        justification: `Estimation basée sur la catégorie ${category} et la complexité apparente`
      },
      timeline: {
        phases: template.phases.map((phase: any) => ({
          name: phase.name,
          duration: Math.round(phase.duration * complexityFactor),
          deliverables: [`Livrable ${phase.name.toLowerCase()}`]
        })),
        totalDuration: Math.round(baseEst.duration * complexityFactor)
      }
    };
  }

  private getBasicQuestions(category: string, brief: any): string[] {
    const categoryQuestions = {
      'web_development': [
        'Avez-vous déjà un nom de domaine et hébergement ?',
        'Souhaitez-vous un système de gestion de contenu ?',
        'Y a-t-il des fonctionnalités spécifiques importantes ?'
      ],
      'mobile_app': [
        'Ciblé Android, iOS ou les deux ?',
        'L\'application doit-elle fonctionner hors ligne ?',
        'Intégration avec des services tiers nécessaire ?'
      ],
      'design': [
        'Avez-vous une charte graphique existante ?',
        'Formats et utilisations prévus ?',
        'Références visuelles ou style souhaité ?'
      ]
    };
    
    return categoryQuestions[category] || [
      'Quelles sont vos priorités absolues ?',
      'Avez-vous des exemples de référence ?',
      'Y a-t-il des contraintes particulières ?'
    ];
  }

  private getBasicRisks(category: string): any {
    const categoryRisks = {
      'web_development': {
        technicalRisks: ['Compatibilité navigateurs', 'Performance sur mobile'],
        businessRisks: ['Évolution des besoins en cours', 'Retard validation contenu'],
        mitigationStrategies: ['Tests cross-browser', 'Validation étapes progressives']
      },
      'mobile_app': {
        technicalRisks: ['Validation stores', 'Performance appareils anciens'],
        businessRisks: ['Changement guidelines stores', 'Adoption utilisateurs'],
        mitigationStrategies: ['Respect guidelines', 'Tests utilisabilité']
      }
    };
    
    return categoryRisks[category] || {
      technicalRisks: ['Complexité technique imprévue'],
      businessRisks: ['Changement de périmètre'],
      mitigationStrategies: ['Communication régulière', 'Flexibilité planning']
    };
  }

  private incorporateSimpleAnswer(brief: any, qa: { question: string; answer: string }): any {
    const { question, answer } = qa;
    
    // Intégration basique des réponses dans le brief
    if (question.includes('budget')) {
      brief.estimatedBudget = answer;
    } else if (question.includes('délai') || question.includes('échéance')) {
      brief.timeline = answer;
    } else if (question.includes('technique')) {
      if (!brief.technicalRequirements) brief.technicalRequirements = [];
      brief.technicalRequirements.push(answer);
    } else {
      // Ajouter à la description générale
      if (!brief.additionalInfo) brief.additionalInfo = [];
      brief.additionalInfo.push(`${question}: ${answer}`);
    }
    
    return brief;
  }

  private calculateSimpleCompletionScore(brief: any): number {
    const requiredFields = ['title', 'description', 'objectives', 'deliverables'];
    const optionalFields = ['budget', 'timeline', 'technicalRequirements'];
    
    let score = 0;
    let maxScore = 100;
    
    // Champs obligatoires (60% du score)
    requiredFields.forEach(field => {
      if (brief[field] && brief[field].length > 0) {
        score += 15; // 60/4 = 15 points par champ
      }
    });
    
    // Champs optionnels (40% du score)
    optionalFields.forEach(field => {
      if (brief[field] && brief[field].length > 0) {
        score += 13; // 40/3 ≈ 13 points par champ
      }
    });
    
    return Math.min(score, maxScore);
  }

  private generateFallbackBrief(input: string): SimpleBriefStructure {
    return {
      originalIdea: input,
      structuredBrief: {
        title: 'Nouveau Projet',
        description: input,
        objectives: ['Réaliser le projet selon les attentes'],
        deliverables: ['Livrable principal', 'Documentation'],
        technicalRequirements: ['À définir'],
        constraints: ['À préciser'],
        successCriteria: ['Satisfaction client']
      },
      estimatedBudget: {
        min: 500,
        max: 2000,
        justification: 'Estimation préliminaire'
      },
      suggestedTimeline: {
        phases: [
          { name: 'Planification', duration: 1, deliverables: ['Plan projet'] },
          { name: 'Réalisation', duration: 2, deliverables: ['Livrable'] }
        ],
        totalDuration: 3
      },
      clarifyingQuestions: [
        'Pouvez-vous détailler vos attentes ?',
        'Quel est votre budget approximatif ?',
        'Avez-vous une échéance ?'
      ],
      riskAssessment: {
        technicalRisks: ['Complexité technique à évaluer'],
        businessRisks: ['Périmètre à préciser'],
        mitigationStrategies: ['Communication régulière']
      }
    };
  }
}

// Export compatible avec l'ancien système
export const aiConciergeEngine = new SimpleBriefAssistant();
export default aiConciergeEngine;