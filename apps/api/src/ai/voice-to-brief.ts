
/**
 * Système Voice-to-Brief et Vision-to-Brief
 * Phase 4 : Révolution - Interface naturelle
 */

interface VoiceToBriefResult {
  transcription: string;
  structured_brief: StructuredBrief;
  confidence: number;
  suggested_improvements: string[];
  missing_elements: string[];
  estimated_processing_time: number;
}

interface VisionToBriefResult {
  detected_elements: DetectedElement[];
  generated_description: string;
  technical_requirements: TechnicalRequirement[];
  estimated_complexity: number;
  suggested_technologies: string[];
  confidence: number;
}

interface StructuredBrief {
  title: string;
  description: string;
  objectives: string[];
  deliverables: string[];
  constraints: string[];
  budget_range: {
    min: number;
    max: number;
    confidence: number;
  };
  timeline: {
    estimated_weeks: number;
    confidence: number;
  };
  skills_required: string[];
  category: string;
  priority_level: string;
}

interface DetectedElement {
  type: 'ui_component' | 'layout' | 'content' | 'navigation' | 'form' | 'media';
  description: string;
  position: { x: number; y: number; width: number; height: number };
  confidence: number;
  suggested_implementation: string;
}

interface TechnicalRequirement {
  requirement: string;
  category: 'frontend' | 'backend' | 'database' | 'api' | 'security' | 'performance';
  complexity: number;
  estimated_hours: number;
}

class VoiceToBriefEngine {
  private voicePatterns: Map<string, any> = new Map();
  private contextualHints: Map<string, string[]> = new Map();

  /**
   * Conversion voix vers brief structuré
   */
  async convertVoiceToBrief(audioData: {
    audio_url?: string;
    audio_base64?: string;
    duration_seconds: number;
    language?: string;
  }): Promise<VoiceToBriefResult> {
    try {
      // Transcription audio
      const transcription = await this.transcribeAudio(audioData);
      
      // Analyse et structuration
      const structured_brief = await this.structureFromTranscription(transcription);
      
      // Évaluation de la confiance
      const confidence = this.calculateTranscriptionConfidence(transcription, structured_brief);
      
      // Suggestions d'amélioration
      const suggested_improvements = this.generateImprovementSuggestions(structured_brief);
      
      // Éléments manquants
      const missing_elements = this.identifyMissingElements(structured_brief);

      return {
        transcription,
        structured_brief,
        confidence,
        suggested_improvements,
        missing_elements,
        estimated_processing_time: audioData.duration_seconds * 0.3
      };
    } catch (error) {
      console.error('Voice to brief conversion failed:', error);
      return this.fallbackVoiceToBrief(audioData);
    }
  }

  /**
   * Transcription audio intelligente
   */
  private async transcribeAudio(audioData: any): Promise<string> {
    try {
      // Simulation d'appel à service de transcription (Whisper, Google Speech-to-Text, etc.)
      const response = await fetch('http://localhost:8001/audio/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_data: audioData.audio_base64 || audioData.audio_url,
          language: audioData.language || 'fr-FR',
          context: 'business_brief'
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error('Transcription service unavailable');
      }

      const result = await response.json();
      return result.transcription;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      return this.fallbackTranscription(audioData);
    }
  }

  /**
   * Structuration intelligente depuis transcription
   */
  private async structureFromTranscription(transcription: string): Promise<StructuredBrief> {
    // Extraction d'entités et intentions
    const entities = this.extractEntities(transcription);
    const intentions = this.extractIntentions(transcription);
    
    // Génération du brief structuré
    const title = this.generateTitle(entities, intentions);
    const description = this.enhanceDescription(transcription, entities);
    const objectives = this.extractObjectives(transcription, intentions);
    const deliverables = this.inferDeliverables(entities, intentions);
    const constraints = this.extractConstraints(transcription);
    const budget_range = this.estimateBudget(entities, intentions);
    const timeline = this.estimateTimeline(entities, intentions);
    const skills_required = this.identifyRequiredSkills(entities, intentions);
    const category = this.categorizeProject(entities, intentions);
    const priority_level = this.assessPriority(transcription);

    return {
      title,
      description,
      objectives,
      deliverables,
      constraints,
      budget_range,
      timeline,
      skills_required,
      category,
      priority_level
    };
  }

  /**
   * Extraction d'entités nommées
   */
  private extractEntities(text: string): Map<string, string[]> {
    const entities = new Map();
    
    // Technologies mentionnées
    const techKeywords = ['react', 'angular', 'vue', 'node', 'python', 'php', 'wordpress', 'shopify', 'woocommerce'];
    const mentionedTech = techKeywords.filter(tech => 
      text.toLowerCase().includes(tech)
    );
    entities.set('technologies', mentionedTech);
    
    // Plateformes
    const platforms = ['mobile', 'web', 'desktop', 'ios', 'android', 'responsive'];
    const mentionedPlatforms = platforms.filter(platform => 
      text.toLowerCase().includes(platform)
    );
    entities.set('platforms', mentionedPlatforms);
    
    // Types de projets
    const projectTypes = ['site', 'application', 'app', 'e-commerce', 'vitrine', 'blog', 'marketplace'];
    const mentionedTypes = projectTypes.filter(type => 
      text.toLowerCase().includes(type)
    );
    entities.set('project_types', mentionedTypes);
    
    // Montants et délais
    const budgetMatches = text.match(/\d+\s*(?:euros?|€|\$|dollars?)/gi) || [];
    entities.set('budget_mentions', budgetMatches);
    
    const timeMatches = text.match(/\d+\s*(?:semaines?|mois|jours?|weeks?|months?|days?)/gi) || [];
    entities.set('time_mentions', timeMatches);

    return entities;
  }

  /**
   * Extraction d'intentions
   */
  private extractIntentions(text: string): string[] {
    const intentions = [];
    
    // Intentions de création
    if (/(?:créer|développer|construire|faire|réaliser)/i.test(text)) {
      intentions.push('create');
    }
    
    // Intentions de refonte
    if (/(?:refaire|modifier|améliorer|moderniser|refonte)/i.test(text)) {
      intentions.push('redesign');
    }
    
    // Intentions de maintenance
    if (/(?:maintenir|corriger|réparer|debug|optimize)/i.test(text)) {
      intentions.push('maintain');
    }
    
    // Intentions de consultation
    if (/(?:conseiller|audit|analyse|stratégie|consulting)/i.test(text)) {
      intentions.push('consult');
    }

    return intentions;
  }

  /**
   * Génération de titre intelligent
   */
  private generateTitle(entities: Map<string, string[]>, intentions: string[]): string {
    const projectTypes = entities.get('project_types') || [];
    const platforms = entities.get('platforms') || [];
    const techs = entities.get('technologies') || [];
    
    let title = '';
    
    // Intention + Type + Plateforme
    if (intentions.includes('create')) {
      title = 'Création';
    } else if (intentions.includes('redesign')) {
      title = 'Refonte';
    } else {
      title = 'Développement';
    }
    
    if (projectTypes.length > 0) {
      title += ` ${projectTypes[0]}`;
    } else {
      title += ' application';
    }
    
    if (platforms.length > 0) {
      title += ` ${platforms[0]}`;
    }
    
    if (techs.length > 0) {
      title += ` (${techs[0]})`;
    }

    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  /**
   * Amélioration de description
   */
  private enhanceDescription(transcription: string, entities: Map<string, string[]>): string {
    let enhanced = transcription;
    
    // Nettoyage du texte parlé
    enhanced = enhanced.replace(/euh+|hum+|ben+/gi, '');
    enhanced = enhanced.replace(/\s+/g, ' ').trim();
    
    // Structuration en phrases
    enhanced = enhanced.replace(/([.!?])\s*(\w)/g, '$1 $2');
    
    // Ajout de contexte technique si manquant
    const techs = entities.get('technologies') || [];
    if (techs.length > 0 && !enhanced.toLowerCase().includes('technique')) {
      enhanced += `\n\nExigences techniques : ${techs.join(', ')}.`;
    }
    
    return enhanced;
  }

  // Méthodes d'estimation et d'inférence

  private extractObjectives(text: string, intentions: string[]): string[] {
    const objectives = [];
    
    // Objectifs basés sur les intentions
    if (intentions.includes('create')) {
      objectives.push('Créer une solution fonctionnelle et moderne');
    }
    if (intentions.includes('redesign')) {
      objectives.push('Améliorer l\'expérience utilisateur existante');
    }
    
    // Objectifs mentionnés explicitement
    const objectivePatterns = [
      /objectif\s+(?:est\s+de\s+|:?\s*)([^.!?]+)/gi,
      /(?:je veux|j'aimerais|il faut)\s+([^.!?]+)/gi,
      /pour\s+([^.!?]+)/gi
    ];
    
    objectivePatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length > 10) {
          objectives.push(match[1].trim());
        }
      });
    });
    
    return objectives.length > 0 ? objectives : ['Objectif à préciser'];
  }

  private inferDeliverables(entities: Map<string, string[]>, intentions: string[]): string[] {
    const deliverables = [];
    const projectTypes = entities.get('project_types') || [];
    const platforms = entities.get('platforms') || [];
    
    // Livrables selon le type de projet
    if (projectTypes.includes('site') || projectTypes.includes('web')) {
      deliverables.push('Site web fonctionnel');
      deliverables.push('Code source');
      deliverables.push('Documentation technique');
    }
    
    if (projectTypes.includes('application') || projectTypes.includes('app')) {
      deliverables.push('Application fonctionnelle');
      deliverables.push('Code source documenté');
      if (platforms.includes('mobile')) {
        deliverables.push('Publication sur stores');
      }
    }
    
    if (projectTypes.includes('e-commerce')) {
      deliverables.push('Plateforme e-commerce complète');
      deliverables.push('Gestion des paiements');
      deliverables.push('Interface d\'administration');
    }
    
    // Livrables génériques si aucun spécifique
    if (deliverables.length === 0) {
      deliverables.push('Solution fonctionnelle');
      deliverables.push('Documentation');
      deliverables.push('Formation utilisateur');
    }
    
    return deliverables;
  }

  private extractConstraints(text: string): string[] {
    const constraints = [];
    
    // Contraintes temporelles
    const urgencyPattern = /(?:urgent|rapidement|vite|asap|deadline)/i;
    if (urgencyPattern.test(text)) {
      constraints.push('Délai serré');
    }
    
    // Contraintes budgétaires
    const budgetPattern = /(?:budget\s+serré|pas\s+cher|économique|limité)/i;
    if (budgetPattern.test(text)) {
      constraints.push('Budget limité');
    }
    
    // Contraintes techniques
    const techConstraints = text.match(/(?:doit être|il faut|obligatoire|requis)\s+([^.!?]+)/gi) || [];
    techConstraints.forEach(constraint => {
      constraints.push(constraint.replace(/(?:doit être|il faut|obligatoire|requis)\s+/i, '').trim());
    });
    
    return constraints;
  }

  private estimateBudget(entities: Map<string, string[]>, intentions: string[]): {
    min: number;
    max: number;
    confidence: number;
  } {
    const budgetMentions = entities.get('budget_mentions') || [];
    const projectTypes = entities.get('project_types') || [];
    const platforms = entities.get('platforms') || [];
    
    // Budget explicitement mentionné
    if (budgetMentions.length > 0) {
      const amounts = budgetMentions.map(mention => {
        const match = mention.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      });
      const maxMentioned = Math.max(...amounts);
      return {
        min: maxMentioned * 0.8,
        max: maxMentioned * 1.2,
        confidence: 0.8
      };
    }
    
    // Estimation basée sur le type de projet
    let baseBudget = 2000; // Défaut
    
    if (projectTypes.includes('e-commerce')) baseBudget = 5000;
    else if (projectTypes.includes('application') || projectTypes.includes('app')) baseBudget = 4000;
    else if (projectTypes.includes('site')) baseBudget = 2500;
    
    // Ajustement plateforme
    if (platforms.includes('mobile')) baseBudget *= 1.5;
    if (platforms.includes('web') && platforms.includes('mobile')) baseBudget *= 2;
    
    return {
      min: baseBudget * 0.7,
      max: baseBudget * 1.8,
      confidence: 0.6
    };
  }

  private estimateTimeline(entities: Map<string, string[]>, intentions: string[]): {
    estimated_weeks: number;
    confidence: number;
  } {
    const timeMentions = entities.get('time_mentions') || [];
    const projectTypes = entities.get('project_types') || [];
    
    // Délai explicitement mentionné
    if (timeMentions.length > 0) {
      const timeValues = timeMentions.map(mention => {
        const match = mention.match(/\d+/);
        const value = match ? parseInt(match[0]) : 4;
        
        if (mention.toLowerCase().includes('jour')) return value / 7;
        if (mention.toLowerCase().includes('mois')) return value * 4;
        return value; // semaines
      });
      
      const avgWeeks = timeValues.reduce((sum, val) => sum + val, 0) / timeValues.length;
      return {
        estimated_weeks: Math.round(avgWeeks),
        confidence: 0.8
      };
    }
    
    // Estimation basée sur le type
    let baseWeeks = 4;
    
    if (projectTypes.includes('e-commerce')) baseWeeks = 8;
    else if (projectTypes.includes('application')) baseWeeks = 6;
    else if (projectTypes.includes('site')) baseWeeks = 3;
    
    return {
      estimated_weeks: baseWeeks,
      confidence: 0.5
    };
  }

  private identifyRequiredSkills(entities: Map<string, string[]>, intentions: string[]): string[] {
    const skills = new Set<string>();
    
    // Compétences basées sur technologies mentionnées
    const techs = entities.get('technologies') || [];
    techs.forEach(tech => skills.add(tech.charAt(0).toUpperCase() + tech.slice(1)));
    
    // Compétences basées sur types de projet
    const projectTypes = entities.get('project_types') || [];
    const platforms = entities.get('platforms') || [];
    
    if (projectTypes.includes('site') || platforms.includes('web')) {
      skills.add('HTML/CSS');
      skills.add('JavaScript');
    }
    
    if (platforms.includes('mobile')) {
      skills.add('Développement mobile');
    }
    
    if (projectTypes.includes('e-commerce')) {
      skills.add('E-commerce');
      skills.add('Paiements en ligne');
    }
    
    // Compétences génériques
    if (skills.size === 0) {
      skills.add('Développement web');
      skills.add('UI/UX Design');
    }
    
    return Array.from(skills);
  }

  private categorizeProject(entities: Map<string, string[]>, intentions: string[]): string {
    const projectTypes = entities.get('project_types') || [];
    const platforms = entities.get('platforms') || [];
    
    if (projectTypes.includes('e-commerce')) return 'e-commerce';
    if (platforms.includes('mobile') || projectTypes.includes('app')) return 'mobile-development';
    if (projectTypes.includes('site') || platforms.includes('web')) return 'web-development';
    if (intentions.includes('consult')) return 'consulting';
    
    return 'web-development'; // Défaut
  }

  private assessPriority(text: string): string {
    if (/urgent|asap|rapidement|vite/i.test(text)) return 'high';
    if (/quand\s+(?:vous\s+)?(?:pouvez|voulez)|pas\s+pressé/i.test(text)) return 'low';
    return 'medium';
  }

  // Méthodes de validation et amélioration

  private calculateTranscriptionConfidence(transcription: string, structured: StructuredBrief): number {
    let confidence = 0.5;
    
    // Longueur de transcription
    if (transcription.length > 100) confidence += 0.2;
    if (transcription.length > 300) confidence += 0.1;
    
    // Complétude du brief structuré
    if (structured.objectives.length > 1) confidence += 0.1;
    if (structured.deliverables.length > 2) confidence += 0.1;
    if (structured.budget_range.confidence > 0.7) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  private generateImprovementSuggestions(structured: StructuredBrief): string[] {
    const suggestions = [];
    
    if (structured.budget_range.confidence < 0.7) {
      suggestions.push('Préciser la fourchette budgétaire pour des propositions plus adaptées');
    }
    
    if (structured.timeline.confidence < 0.7) {
      suggestions.push('Indiquer les contraintes de délai et échéances importantes');
    }
    
    if (structured.deliverables.length < 3) {
      suggestions.push('Détailler davantage les livrables attendus');
    }
    
    if (structured.constraints.length === 0) {
      suggestions.push('Mentionner les contraintes techniques ou fonctionnelles');
    }
    
    return suggestions;
  }

  private identifyMissingElements(structured: StructuredBrief): string[] {
    const missing = [];
    
    if (!structured.title || structured.title.length < 10) {
      missing.push('Titre descriptif du projet');
    }
    
    if (structured.budget_range.confidence < 0.5) {
      missing.push('Budget ou fourchette budgétaire');
    }
    
    if (structured.objectives.length === 0 || structured.objectives[0] === 'Objectif à préciser') {
      missing.push('Objectifs clairs du projet');
    }
    
    if (structured.skills_required.length < 2) {
      missing.push('Compétences techniques requises');
    }
    
    return missing;
  }

  // Fallbacks

  private fallbackTranscription(audioData: any): string {
    return `[Transcription automatique indisponible - Durée: ${audioData.duration_seconds}s]
    
Veuillez décrire votre projet en détail :
- Objectif principal
- Type de solution souhaitée
- Budget approximatif
- Délai souhaité
- Contraintes spécifiques`;
  }

  private fallbackVoiceToBrief(audioData: any): VoiceToBriefResult {
    return {
      transcription: this.fallbackTranscription(audioData),
      structured_brief: {
        title: 'Projet à définir',
        description: 'Description à compléter depuis l\'audio',
        objectives: ['Objectif à préciser'],
        deliverables: ['Livrables à définir'],
        constraints: [],
        budget_range: { min: 1000, max: 5000, confidence: 0.3 },
        timeline: { estimated_weeks: 4, confidence: 0.3 },
        skills_required: ['Compétences à déterminer'],
        category: 'web-development',
        priority_level: 'medium'
      },
      confidence: 0.3,
      suggested_improvements: [
        'Fournir plus de détails sur le projet',
        'Préciser le budget et les délais',
        'Détailler les fonctionnalités souhaitées'
      ],
      missing_elements: [
        'Description détaillée',
        'Budget précis',
        'Contraintes techniques'
      ],
      estimated_processing_time: audioData.duration_seconds * 0.5
    };
  }
}

class VisionToBriefEngine {
  private elementDetectors: Map<string, any> = new Map();
  private uiPatterns: Map<string, any> = new Map();

  /**
   * Analyse d'image/mockup vers brief technique
   */
  async analyzeImageToBrief(imageData: {
    image_url?: string;
    image_base64?: string;
    image_type: string;
    context?: string;
  }): Promise<VisionToBriefResult> {
    try {
      // Détection d'éléments visuels
      const detected_elements = await this.detectUIElements(imageData);
      
      // Génération de description
      const generated_description = this.generateDescription(detected_elements);
      
      // Exigences techniques
      const technical_requirements = this.inferTechnicalRequirements(detected_elements);
      
      // Estimation de complexité
      const estimated_complexity = this.estimateComplexity(detected_elements, technical_requirements);
      
      // Technologies suggérées
      const suggested_technologies = this.suggestTechnologies(detected_elements, technical_requirements);
      
      // Confiance générale
      const confidence = this.calculateVisionConfidence(detected_elements);

      return {
        detected_elements,
        generated_description,
        technical_requirements,
        estimated_complexity,
        suggested_technologies,
        confidence
      };
    } catch (error) {
      console.error('Vision to brief analysis failed:', error);
      return this.fallbackVisionToBrief(imageData);
    }
  }

  /**
   * Détection d'éléments UI avancée
   */
  private async detectUIElements(imageData: any): Promise<DetectedElement[]> {
    try {
      // Simulation d'appel à service de vision (OpenAI Vision, Google Vision, etc.)
      const response = await fetch('http://localhost:8001/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: imageData.image_base64 || imageData.image_url,
          analysis_type: 'ui_elements',
          context: 'web_mockup'
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error('Vision analysis service unavailable');
      }

      const result = await response.json();
      return result.detected_elements;
    } catch (error) {
      console.error('Vision analysis failed:', error);
      return this.fallbackElementDetection(imageData);
    }
  }

  /**
   * Génération de description basée sur éléments détectés
   */
  private generateDescription(elements: DetectedElement[]): string {
    const elementCounts = this.countElementTypes(elements);
    let description = 'Interface utilisateur comprenant :\n\n';
    
    // Description des éléments principaux
    if (elementCounts.navigation > 0) {
      description += `• Navigation principale avec ${elementCounts.navigation} éléments\n`;
    }
    
    if (elementCounts.form > 0) {
      description += `• ${elementCounts.form} formulaire(s) interactif(s)\n`;
    }
    
    if (elementCounts.ui_component > 0) {
      description += `• ${elementCounts.ui_component} composants UI spécialisés\n`;
    }
    
    if (elementCounts.content > 0) {
      description += `• ${elementCounts.content} zones de contenu principal\n`;
    }
    
    if (elementCounts.media > 0) {
      description += `• Gestion de ${elementCounts.media} éléments média\n`;
    }
    
    // Analyse de la complexité visuelle
    const layoutComplexity = this.analyzeLayoutComplexity(elements);
    description += `\nComplexité visuelle : ${layoutComplexity.level}\n`;
    description += `Organisation : ${layoutComplexity.organization}\n`;
    
    return description;
  }

  /**
   * Inférence des exigences techniques
   */
  private inferTechnicalRequirements(elements: DetectedElement[]): TechnicalRequirement[] {
    const requirements: TechnicalRequirement[] = [];
    const elementTypes = new Set(elements.map(e => e.type));
    
    // Exigences frontend de base
    requirements.push({
      requirement: 'Interface responsive moderne',
      category: 'frontend',
      complexity: 3,
      estimated_hours: 8
    });
    
    // Exigences basées sur les éléments détectés
    if (elementTypes.has('form')) {
      requirements.push({
        requirement: 'Gestion de formulaires avec validation',
        category: 'frontend',
        complexity: 4,
        estimated_hours: 12
      });
      
      requirements.push({
        requirement: 'API de traitement des données',
        category: 'backend',
        complexity: 5,
        estimated_hours: 16
      });
    }
    
    if (elementTypes.has('navigation')) {
      requirements.push({
        requirement: 'Système de navigation dynamique',
        category: 'frontend',
        complexity: 3,
        estimated_hours: 6
      });
    }
    
    if (elementTypes.has('media')) {
      requirements.push({
        requirement: 'Gestion et optimisation des médias',
        category: 'backend',
        complexity: 6,
        estimated_hours: 20
      });
      
      requirements.push({
        requirement: 'Stockage et CDN pour médias',
        category: 'api',
        complexity: 4,
        estimated_hours: 8
      });
    }
    
    // Exigences de base de données si formulaires
    if (elementTypes.has('form') || elements.length > 5) {
      requirements.push({
        requirement: 'Base de données relationnelle',
        category: 'database',
        complexity: 4,
        estimated_hours: 10
      });
    }
    
    // Exigences de sécurité
    if (elementTypes.has('form')) {
      requirements.push({
        requirement: 'Sécurité et validation des entrées',
        category: 'security',
        complexity: 5,
        estimated_hours: 12
      });
    }
    
    // Exigences de performance
    if (elements.length > 10) {
      requirements.push({
        requirement: 'Optimisation des performances',
        category: 'performance',
        complexity: 4,
        estimated_hours: 8
      });
    }
    
    return requirements;
  }

  /**
   * Estimation de complexité globale
   */
  private estimateComplexity(elements: DetectedElement[], requirements: TechnicalRequirement[]): number {
    let complexity = 1; // Base
    
    // Complexité basée sur le nombre d'éléments
    complexity += elements.length * 0.2;
    
    // Complexité basée sur la diversité des éléments
    const uniqueTypes = new Set(elements.map(e => e.type));
    complexity += uniqueTypes.size * 0.5;
    
    // Complexité basée sur les exigences techniques
    const avgTechComplexity = requirements.reduce((sum, req) => sum + req.complexity, 0) / requirements.length;
    complexity += avgTechComplexity * 0.3;
    
    // Complexité basée sur les interactions
    const interactiveElements = elements.filter(e => e.type === 'form' || e.type === 'ui_component');
    complexity += interactiveElements.length * 0.4;
    
    return Math.round(Math.min(complexity, 10) * 10) / 10; // 1-10 avec 1 décimale
  }

  /**
   * Suggestion de technologies
   */
  private suggestTechnologies(elements: DetectedElement[], requirements: TechnicalRequirement[]): string[] {
    const technologies = new Set<string>();
    const elementTypes = new Set(elements.map(e => e.type));
    const complexity = this.estimateComplexity(elements, requirements);
    
    // Frontend frameworks
    if (complexity > 6 || elementTypes.has('ui_component')) {
      technologies.add('React');
      technologies.add('TypeScript');
    } else if (complexity > 4) {
      technologies.add('Vue.js');
    } else {
      technologies.add('HTML/CSS/JavaScript');
    }
    
    // CSS frameworks
    if (elementTypes.has('layout') || elements.length > 5) {
      technologies.add('Tailwind CSS');
    }
    
    // Backend technologies
    if (requirements.some(r => r.category === 'backend')) {
      if (complexity > 7) {
        technologies.add('Node.js');
        technologies.add('Express');
      } else {
        technologies.add('PHP');
      }
    }
    
    // Database
    if (requirements.some(r => r.category === 'database')) {
      if (complexity > 6) {
        technologies.add('PostgreSQL');
      } else {
        technologies.add('MySQL');
      }
    }
    
    // API
    if (requirements.some(r => r.category === 'api')) {
      technologies.add('REST API');
      if (complexity > 7) {
        technologies.add('GraphQL');
      }
    }
    
    // Déploiement et infrastructure
    if (complexity > 5) {
      technologies.add('Docker');
      technologies.add('CI/CD');
    }
    
    return Array.from(technologies);
  }

  // Méthodes d'analyse et utilitaires

  private countElementTypes(elements: DetectedElement[]): Record<string, number> {
    const counts = {
      ui_component: 0,
      layout: 0,
      content: 0,
      navigation: 0,
      form: 0,
      media: 0
    };
    
    elements.forEach(element => {
      counts[element.type] = (counts[element.type] || 0) + 1;
    });
    
    return counts;
  }

  private analyzeLayoutComplexity(elements: DetectedElement[]): {
    level: string;
    organization: string;
  } {
    const elementCount = elements.length;
    const uniqueTypes = new Set(elements.map(e => e.type)).size;
    
    let level = 'simple';
    if (elementCount > 15 || uniqueTypes > 4) level = 'complexe';
    else if (elementCount > 8 || uniqueTypes > 3) level = 'modérée';
    
    let organization = 'linéaire';
    if (uniqueTypes > 3) organization = 'multi-colonnes';
    if (elements.some(e => e.type === 'navigation') && uniqueTypes > 2) {
      organization = 'hiérarchique';
    }
    
    return { level, organization };
  }

  private calculateVisionConfidence(elements: DetectedElement[]): number {
    if (elements.length === 0) return 0.2;
    
    const avgConfidence = elements.reduce((sum, e) => sum + e.confidence, 0) / elements.length;
    const coverageBonus = Math.min(elements.length / 10, 0.3); // Bonus pour couverture
    
    return Math.min(avgConfidence + coverageBonus, 0.95);
  }

  // Fallbacks

  private fallbackElementDetection(imageData: any): DetectedElement[] {
    // Éléments génériques pour simulation
    return [
      {
        type: 'layout',
        description: 'Zone de layout principal',
        position: { x: 0, y: 0, width: 100, height: 100 },
        confidence: 0.7,
        suggested_implementation: 'Container responsive avec CSS Grid'
      },
      {
        type: 'navigation',
        description: 'Menu de navigation',
        position: { x: 0, y: 0, width: 100, height: 10 },
        confidence: 0.8,
        suggested_implementation: 'Navigation responsive avec menu burger'
      },
      {
        type: 'content',
        description: 'Zone de contenu principal',
        position: { x: 0, y: 10, width: 100, height: 80 },
        confidence: 0.7,
        suggested_implementation: 'Section principale avec typography cohérente'
      }
    ];
  }

  private fallbackVisionToBrief(imageData: any): VisionToBriefResult {
    const fallbackElements = this.fallbackElementDetection(imageData);
    
    return {
      detected_elements: fallbackElements,
      generated_description: 'Interface web standard avec navigation, contenu principal et layout responsive.',
      technical_requirements: [
        {
          requirement: 'Interface responsive',
          category: 'frontend',
          complexity: 3,
          estimated_hours: 8
        },
        {
          requirement: 'Intégration HTML/CSS',
          category: 'frontend',
          complexity: 2,
          estimated_hours: 6
        }
      ],
      estimated_complexity: 3.5,
      suggested_technologies: ['HTML/CSS', 'JavaScript', 'Responsive Design'],
      confidence: 0.6
    };
  }
}

export const voiceToBriefEngine = new VoiceToBriefEngine();
export const visionToBriefEngine = new VisionToBriefEngine();
export type { 
  VoiceToBriefResult, 
  VisionToBriefResult, 
  StructuredBrief, 
  DetectedElement, 
  TechnicalRequirement 
};
