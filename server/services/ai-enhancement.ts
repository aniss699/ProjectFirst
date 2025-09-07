import { getPricingSuggestion, enhanceBrief } from "../../apps/api/src/ai/aiOrchestrator.js";
import { geminiCall } from "../../apps/api/src/ai/adapters/geminiAdapter.js";
import { aiLearningEngine } from "../../apps/api/src/ai/learning-engine.js";

export interface PriceSuggestion {
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  factors: string[];
  confidence: number;
}

export interface EnhancedDescription {
  improvedTitle: string;
  detailedDescription: string;
  suggestedRequirements: string[];
  estimatedTimeline: string;
  complexity: 'simple' | 'medium' | 'complex';
}

export class AIEnhancementService {

  /**
   * Suggère des prix basés sur l'analyse du marché et de la description du projet
   */
  async suggestPricing(
    projectTitle: string,
    description: string,
    category: string
  ): Promise<PriceSuggestion> {
    try {
      // Utilise l'orchestrateur AI avec logging unifié
      const prompt = {
        projectTitle,
        description,
        category,
        guidance: this.getCategoryPricingGuidance(category),
        expertise: this.getCategoryExpertise(category)
      };

      const result = await getPricingSuggestion(prompt);

      // Validation et correction des prix retournés par l'IA
      const minPrice = Math.max(500, result.minPrice || 1000); // Minimum 500€
      const maxPrice = Math.max(minPrice * 1.5, result.maxPrice || 3000); // Au moins 1.5x le min

      return {
        minPrice,
        maxPrice,
        averagePrice: result.averagePrice || Math.round((minPrice + maxPrice) / 2),
        factors: Array.isArray(result.factors) ? result.factors : this.getDetailedFallbackFactors(category, minPrice, maxPrice),
        confidence: Math.max(0.0, Math.min(1.0, result.confidence || 0.7))
      };

    } catch (error) {
      console.error('Erreur suggestion prix:', error);

      // Fallback basé sur la catégorie avec tarifs réalistes 2025
      const prices = this.getFallbackPrices(category);

      return {
        minPrice: prices.min,
        maxPrice: prices.max,
        averagePrice: prices.avg,
        factors: this.getDetailedFallbackFactors(category, prices.min, prices.max),
        confidence: 0.6
      };
    }
  }

  /**
   * Améliore une description vague de projet en une description détaillée et structurée
   */
  async enhanceProjectDescription(
    vagueDescription: string,
    category: string,
    additionalInfo?: string
  ): Promise<EnhancedDescription> {
    try {
      const categorySpecificPrompt = this.getCategorySpecificPrompt(category, vagueDescription, additionalInfo);

      const prompt = `En tant qu'expert en ${this.getCategoryExpertise(category)}, aidez un client à clarifier et structurer sa demande.

DEMANDE INITIALE:
"${vagueDescription}"

Catégorie: ${category}
${additionalInfo ? `Infos supplémentaires: ${additionalInfo}` : ''}

${categorySpecificPrompt}

Transformez cette demande en brief professionnel concis et clair. Maximum 120 mots.

Répondez au format JSON strict:
{
  "improvedTitle": "Titre professionnel clair et spécifique",
  "detailedDescription": "Description concise avec les éléments clés de la catégorie ${category}",
  "suggestedRequirements": ["exigence spécifique 1", "exigence métier 2", "contrainte 3"],
  "estimatedTimeline": "délai réaliste selon la catégorie",
  "complexity": "simple"
}

La complexity doit être "simple", "medium" ou "complex".`;

      const vertexResponse = await geminiCall('brief_enhance', { prompt });
      const result = vertexResponse.output;

      return {
        improvedTitle: result.improvedTitle || 'Projet amélioré',
        detailedDescription: result.detailedDescription || vagueDescription,
        suggestedRequirements: Array.isArray(result.suggestedRequirements) ? result.suggestedRequirements : [],
        estimatedTimeline: result.estimatedTimeline || '2-4 semaines',
        complexity: ['simple', 'medium', 'complex'].includes(result.complexity)
          ? result.complexity
          : 'medium'
      };

    } catch (error) {
      console.error('Erreur amélioration description:', error);

      return {
        improvedTitle: 'Projet à préciser',
        detailedDescription: `Demande initiale : ${vagueDescription}\n\nCette demande nécessite des précisions supplémentaires pour être mieux comprise par les prestataires.`,
        suggestedRequirements: ['À définir selon les spécifications'],
        estimatedTimeline: 'À déterminer',
        complexity: 'medium'
      };
    }
  }

  /**
   * Génère des facteurs détaillés pour le fallback
   */
  private getDetailedFallbackFactors(category: string, minPrice: number, maxPrice: number): string[] {
    const avgPrice = Math.round((minPrice + maxPrice) / 2);
    const estimatedHours = Math.round(avgPrice / 50); // Estimation à 50€/h moyenne

    const categoryFactors = {
      'développement': [
        `Développement ${category} : ${estimatedHours}h estimées à 45-80€/h selon complexité`,
        `Tarifs marché 2025 France : ${minPrice}-${maxPrice}€ incluant tests et déploiement`,
        `Maintenance post-livraison (3-6 mois) et révisions client incluses`
      ],
      'travaux': [
        `Main d'œuvre spécialisée : ${estimatedHours}h à 35-55€/h + matériaux selon projet`,
        `Tarifs France 2025 : ${minPrice}-${maxPrice}€ avec assurances et garanties incluses`,
        `Déplacements, outillage professionnel et nettoyage final inclus`
      ],
      'design': [
        `Création graphique : ${Math.round(estimatedHours/2)} jours créatifs à 50-80€/h`,
        `Forfait ${minPrice}-${maxPrice}€ incluant 3-5 propositions et révisions illimitées`,
        `Fichiers sources haute définition et déclinaisons formats inclus`
      ],
      'marketing': [
        `Stratégie digitale : ${estimatedHours}h conseil à 60-100€/h (hors budget média)`,
        `Mission ${minPrice}-${maxPrice}€ incluant audit, création contenu et reporting KPIs`,
        `Formation équipe, templates réutilisables et suivi 3 mois inclus`
      ],
      'conseil': [
        `Conseil expert : ${Math.round(estimatedHours/8)} jours mission à 80-150€/h`,
        `Prestation ${minPrice}-${maxPrice}€ incluant audit, recommandations et plan d'action`,
        `Présentation dirigeants, documents stratégiques et suivi mise en œuvre`
      ],
      'rédaction': [
        `Rédaction professionnelle : ${estimatedHours*100} mots à 0,15-0,30€/mot`,
        `Prestation ${minPrice}-${maxPrice}€ incluant recherches, optimisation SEO et révisions`,
        `Formats multiples, images libres de droits et planning éditorial inclus`
      ],
      'services': [
        `Services professionnels : ${estimatedHours}h prestation à 40-80€/h selon expertise`,
        `Forfait ${minPrice}-${maxPrice}€ adapté aux standards du secteur français 2025`,
        `Déplacements, outils professionnels et garantie résultat inclus`
      ]
    };

    return categoryFactors[category as keyof typeof categoryFactors] || [
      `Prestation professionnelle : ${estimatedHours}h à 50-80€/h selon expertise requise`,
      `Tarifs marché France 2025 : ${minPrice}-${maxPrice}€ incluant conseils et suivi`,
      `Garantie qualité, révisions incluses et accompagnement personnalisé`
    ];
  }

  /**
   * Retourne l'expertise spécifique à la catégorie
   */
  private getCategoryExpertise(category: string): string {
    const expertises = {
      'développement': 'développement web et applications',
      'design': 'design graphique et UX/UI',
      'marketing': 'marketing digital et communication',
      'conseil': 'conseil en stratégie d\'entreprise',
      'rédaction': 'rédaction et création de contenu',
      'travaux': 'travaux et rénovation',
      'services': 'services professionnels'
    };
    return expertises[category as keyof typeof expertises] || 'gestion de projet';
  }

  /**
   * Retourne le prompt spécifique à chaque catégorie
   */
  private getCategorySpecificPrompt(category: string, description: string, additionalInfo?: string): string {
    switch (category) {
      case 'travaux':
        return `SPÉCIFICITÉS TRAVAUX - Précisez obligatoirement :
- Durée estimée des travaux (jours/semaines)
- Achat des matériaux : inclus dans le devis OU à la charge du client
- Surface concernée (m² si applicable)
- Type d'intervention (neuf, rénovation, entretien)
- Contraintes d'accès ou techniques
- Période souhaitée (saison, planning)`;

      case 'développement':
        return `SPÉCIFICITÉS DÉVELOPPEMENT - Précisez obligatoirement :
- Durée de développement estimée (semaines/mois)
- Technologies souhaitées ou contraintes techniques
- Nombre d'utilisateurs attendus
- Type d'application (web, mobile, desktop)
- Intégrations nécessaires (API, bases de données)
- Maintenance post-livraison incluse ou non`;

      case 'design':
        return `SPÉCIFICITÉS DESIGN - Précisez obligatoirement :
- Durée du projet créatif (jours/semaines)
- Nombre de déclinaisons/formats souhaités
- Support final (print, digital, vidéo)
- Charte graphique existante ou création complète
- Nombre de révisions incluses
- Fichiers sources inclus ou non`;

      case 'marketing':
        return `SPÉCIFICITÉS MARKETING - Précisez obligatoirement :
- Durée de la campagne ou mission (mois)
- Budget média inclus ou non (si pub payante)
- Canaux prioritaires (réseaux sociaux, SEO, etc.)
- Secteur d\'activité et cible
- Objectifs mesurables (leads, ventes, notoriété)
- Reporting inclus (fréquence, KPIs)`;

      case 'conseil':
        return `SPÉCIFICITÉS CONSEIL - Précisez obligatoirement :
- Durée de la mission (jours/mois)
- Nombre de séances/ateliers inclus
- Livrables attendus (rapport, présentation, plan d\'action)
- Secteur d\'activité et taille de l\'entreprise
- Niveau d\'accompagnement (audit, stratégie, mise en œuvre)
- Déplacements inclus ou facturés en sus`;

      case 'rédaction':
        return `SPÉCIFICITÉS RÉDACTION - Précisez obligatoirement :
- Volume de contenu (nombre de mots, pages, articles)
- Délai de livraison souhaité
- Type de contenu (web, print, technique, commercial)
- Recherches documentaires incluses ou non
- Nombre de révisions incluses
- SEO et optimisation web inclus ou non`;

      default:
        return `Précisez la durée estimée, les livrables attendus et les contraintes spécifiques à cette catégorie.`;
    }
  }

  /**
   * Retourne les guides tarifaires spécifiques à chaque catégorie
   */
  private getCategoryPricingGuidance(category: string): string {
    switch (category) {
      case 'travaux':
        return `TARIFS TRAVAUX 2025 (France) :
- Peinture : 25-45€/m² (matériaux INCLUS) ou 20-30€/h + matériaux
- Électricité : 45-65€/h + matériaux (comptez 20-30% du coût main d'œuvre)
- Plomberie : 40-60€/h + matériaux (comptez 25-35% du coût main d'œuvre)
- Carrelage : 30-60€/m² (matériaux INCLUS) ou 25-40€/h + matériaux
- Menuiserie : 35-55€/h + matériaux (bois représente 40-60% du coût)
- Déplacements : 0,50-0,65€/km ou forfait 50-150€ selon distance

CONSIDÉRATIONS IMPORTANTES :
- MATÉRIAUX : Précisez si inclus (prix 40-70% plus élevé) ou en sus
- Durée réaliste : 1-3j (petits travaux), 1-4 semaines (rénovation)
- Contraintes : accès difficile, étage, période (+10-20%)
- Garanties décennales et assurances incluses`;

      case 'développement':
        return `TARIFS DÉVELOPPEMENT 2025 (France) :
- Développement web : 45-80€/h (projets : 3000-25000€)
- Applications mobile : 50-90€/h (projets : 8000-40000€)
- E-commerce : 40-70€/h (projets : 5000-20000€)
- Intégration API : 55-85€/h (projets : 2000-10000€)

DURÉES RÉALISTES :
- Site vitrine : 2-4 semaines (80-150h)
- E-commerce : 6-12 semaines (200-500h)
- App mobile : 8-16 semaines (300-800h)
- Maintenance : 10-20% du coût initial/an`;

      case 'design':
        return `TARIFS DESIGN 2025 (France) :
- Logo + charte : 1500-5000€ (3-6 semaines)
- Site web (maquettes) : 50-80€/h (projets : 2000-8000€)
- Print (flyers, brochures) : 300-1500€/création
- Packaging : 2000-8000€ selon complexité

DURÉES TYPIQUES :
- Logo : 2-3 semaines (3-5 propositions + révisions)
- Charte graphique : 3-4 semaines
- Maquettes web : 2-6 semaines selon nombre de pages`;

      case 'marketing':
        return `TARIFS MARKETING 2025 (France) :
- Community management : 800-2500€/mois (hors budget pub)
- SEO/référencement : 60-100€/h ou 1500-5000€/mois
- Campagnes Google Ads : 15-20% du budget pub + setup 800-2000€
- Stratégie digitale : 2000-8000€ (audit + plan d\'actions)

BUDGETS PUBLICITAIRES :
- Google Ads : 500-5000€/mois minimum
- Facebook/Instagram : 300-3000€/mois minimum
- Précisez si budget média inclus dans la prestation ou en sus`;

      case 'conseil':
        return `TARIFS CONSEIL 2025 (France) :
- Conseil stratégique : 80-150€/h ou 1200-2500€/jour
- Audit d'entreprise : 3000-15000€ selon taille
- Formation : 1500-3000€/jour + préparation
- Coaching dirigeant : 150-300€/h

DURÉES MISSIONS :
- Audit express : 5-10 jours
- Mission stratégique : 20-60 jours étalés
- Accompagnement : 3-12 mois (suivi régulier)`;

      case 'rédaction':
        return `TARIFS RÉDACTION 2025 (France) :
- Articles web : 0,10-0,30€/mot (SEO : +20-40%)
- Pages site : 150-500€/page selon complexité
- Fiches produits : 15-50€/fiche
- Livre blanc : 2000-8000€ selon longueur
- Newsletter : 200-800€/édition

VOLUMES TYPIQUES :
- Article blog : 800-1500 mots
- Page site : 300-800 mots
- Délais : 2-7 jours/1000 mots selon recherches`;

      default:
        return `TARIFS SERVICES GÉNÉRAUX 2025 :
- Prestations intellectuelles : 50-120€/h
- Projets forfaitaires : 1500-8000€ selon complexité
- Déplacements : 0,50€/km + temps facturé
- Révisions incluses : 2-3 allers-retours standard`;
    }
  }

  /**
   * Améliore n'importe quel texte selon son type
   */
  async enhanceText(
    text: string,
    fieldType: 'title' | 'description' | 'requirements',
    category?: string
  ): Promise<string> {
    if (!text || text.trim().length === 0) {
      console.warn('Texte vide fourni pour l\'amélioration');
      return text;
    }

    try {
      console.log(`🎯 Amélioration ${fieldType} avec IA:`, text.substring(0, 50) + '...');
      
      let prompt = '';
      let expectedFormat = 'text';

      switch (fieldType) {
        case 'title':
          prompt = `Améliorez ce titre de projet pour qu'il soit plus professionnel et accrocheur:
"${text}"

Catégorie: ${category || 'Non spécifiée'}

Répondez au format JSON:
{
  "enhancedText": "titre amélioré ici"
}`;
          expectedFormat = 'json';
          break;

        case 'description':
          prompt = `INSTRUCTIONS : Améliorez cette description de projet (60-80 mots maximum).

Texte à améliorer:
"${text}"

Catégorie: ${category || 'Non spécifiée'}

Créez une description professionnelle qui inclut :
1. L'objectif principal
2. Les attentes essentielles
3. Le contexte professionnel

Répondez au format JSON:
{
  "enhancedText": "description améliorée ici"
}`;
          expectedFormat = 'json';
          break;

        case 'requirements':
          prompt = `Précisez et structurez ces exigences de projet:
"${text}"

Catégorie: ${category || 'Non spécifiée'}

Transformez ces exigences en une liste claire et structurée.

Répondez au format JSON:
{
  "enhancedText": "exigences améliorées ici"
}`;
          expectedFormat = 'json';
          break;
      }

      // D'abord, vérifier si on a appris un pattern pour ce type de demande
      console.log('🧠 Vérification des patterns appris...');
      const learnedSuggestion = await aiLearningEngine.generateImprovedSuggestion(text, fieldType, category);
      
      if (learnedSuggestion) {
        console.log('✨ Suggestion basée sur l\'apprentissage automatique utilisée');
        return learnedSuggestion;
      }

      console.log('📡 Envoi requête Gemini (pas de pattern appris)...');
      const geminiResponse = await geminiCall('text_enhance', { prompt });
      
      console.log('🔍 Réponse Gemini complète:', JSON.stringify(geminiResponse, null, 2));
      
      if (geminiResponse && geminiResponse.output) {
        let enhancedText = '';
        
        // Traiter la réponse Gemini qui peut être directement du texte ou du JSON
        if (typeof geminiResponse.output === 'string') {
          // Essayer de parser le JSON si c'est une chaîne
          try {
            const parsed = JSON.parse(geminiResponse.output);
            enhancedText = parsed.enhancedText || parsed.enhanced_text || parsed.result || geminiResponse.output;
          } catch {
            // Si ce n'est pas du JSON valide, utiliser le texte tel quel
            enhancedText = geminiResponse.output;
          }
        } else if (geminiResponse.output && typeof geminiResponse.output === 'object') {
          // Si c'est déjà un objet
          enhancedText = geminiResponse.output.enhancedText || 
                        geminiResponse.output.enhanced_text ||
                        geminiResponse.output.result ||
                        JSON.stringify(geminiResponse.output);
        }
        
        if (enhancedText && enhancedText.trim().length > 0) {
          console.log('✅ Amélioration Gemini réussie:', enhancedText.substring(0, 100) + '...');
          
          // 🧠 APPRENTISSAGE AUTOMATIQUE : Apprendre de cette réponse réussie
          try {
            await aiLearningEngine.learnFromSuccess(
              text, 
              enhancedText, 
              fieldType, 
              category, 
              'positive'
            );
            console.log('📚 Pattern appris avec succès');
          } catch (learnError) {
            console.warn('⚠️ Erreur apprentissage (non bloquant):', learnError);
          }
          
          return enhancedText.trim();
        }
      }
      
      console.warn('⚠️ Réponse Gemini vide ou non traitée, utilisation du fallback local');
      console.warn('📋 Contenu reçu:', geminiResponse);
      return this.enhanceTextLocal(text, fieldType, category);

    } catch (error) {
      console.error('❌ Erreur amélioration texte IA:', error);
      console.log('🔄 Utilisation du fallback local');
      return this.enhanceTextLocal(text, fieldType, category);
    }
  }

  private enhanceTextLocal(
    text: string,
    fieldType: 'title' | 'description' | 'requirements',
    category?: string
  ): string {
    if (!text || text.trim().length === 0) {
      return text;
    }

    switch (fieldType) {
      case 'title':
        return this.enhanceTitleLocal(text, category);
      case 'description':
        return this.enhanceDescriptionLocal(text, category);
      case 'requirements':
        return this.enhanceRequirementsLocal(text, category);
      default:
        return text;
    }
  }

  private enhanceTitleLocal(title: string, category?: string): string {
    let enhanced = title.trim();

    // Capitaliser la première lettre
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

    // Ajouter des mots-clés spécifiques selon la catégorie
    const categoryKeywords = {
      'développement': 'Développement',
      'design': 'Design',
      'marketing': 'Marketing Digital',
      'conseil': 'Conseil',
      'travaux': 'Travaux',
      'services': 'Services'
    };

    const categoryKey = category?.toLowerCase() || '';
    if (categoryKeywords[categoryKey as keyof typeof categoryKeywords] && !enhanced.toLowerCase().includes(categoryKey)) {
      enhanced = `${categoryKeywords[categoryKey as keyof typeof categoryKeywords]} - ${enhanced}`;
    }

    // Ajouter "Professionnel" si le titre est court
    if (enhanced.length < 30 && !enhanced.toLowerCase().includes('professionnel')) {
      enhanced += ' - Service Professionnel';
    }

    return enhanced;
  }

  private enhanceDescriptionLocal(description: string, category?: string): string {
    let enhanced = description.trim();

    // Ajouter un contexte professionnel si manquant
    if (enhanced.length < 100) {
      enhanced += '\n\nCe projet nécessite une approche professionnelle et une expertise confirmée dans le domaine.';
    }

    // Ajouter des détails sur les livrables si non mentionnés
    if (!enhanced.toLowerCase().includes('livrable') && !enhanced.toLowerCase().includes('résultat')) {
      enhanced += '\n\n📋 Livrables attendus :\n- Documentation complète\n- Code source commenté (si applicable)\n- Formation utilisateur si nécessaire';
    }

    // Ajouter des informations sur le budget si non mentionnées
    if (!enhanced.toLowerCase().includes('budget') && !enhanced.toLowerCase().includes('prix')) {
      enhanced += '\n\n💰 Budget flexible selon la qualité de la proposition.';
    }

    // Ajouter des informations sur les délais si non mentionnées
    if (!enhanced.toLowerCase().includes('délai') && !enhanced.toLowerCase().includes('échéance')) {
      enhanced += '\n\n⏰ Délais de livraison à discuter selon la complexité du projet.';
    }

    // Ajouter des critères de sélection
    if (!enhanced.toLowerCase().includes('expérience') && !enhanced.toLowerCase().includes('portfolio')) {
      enhanced += '\n\n🎯 Merci de joindre votre portfolio et vos références pertinentes.';
    }

    return enhanced;
  }

  private enhanceRequirementsLocal(requirements: string, category?: string): string {
    let enhanced = requirements.trim();

    // Structurer les exigences si elles ne le sont pas
    if (!enhanced.includes('-') && !enhanced.includes('•') && !enhanced.includes('\n')) {
      const sentences = enhanced.split('.').filter(s => s.trim().length > 0);
      if (sentences.length > 1) {
        enhanced = sentences.map(s => `• ${s.trim()}`).join('\n');
      }
    }

    // Ajouter des exigences techniques standard selon la catégorie
    const categoryRequirements = {
      'développement': [
        '• Code propre et documenté',
        '• Tests unitaires inclus',
        '• Compatibilité navigateurs modernes'
      ],
      'design': [
        '• Fichiers sources fournis',
        '• Formats d\'export multiples',
        '• Respect de la charte graphique'
      ],
      'marketing': [
        '• Analyse de performance incluse',
        '• Rapport mensuel détaillé',
        '• Suivi des KPIs'
      ]
    };

    const categoryKey = category?.toLowerCase() || '';
    if (categoryRequirements[categoryKey as keyof typeof categoryRequirements]) {
      enhanced += '\n\nExigences techniques standard :\n' +
        categoryRequirements[categoryKey as keyof typeof categoryRequirements].join('\n');
    }

    return enhanced;
  }

  /**
   * Analyse la qualité d'une description de projet et suggère des améliorations
   */
  async analyzeDescriptionQuality(description: string): Promise<{
    score: number;
    suggestions: string[];
    missingElements: string[];
  }> {
    try {
      const prompt = `Analysez la qualité de cette description de projet freelance et suggérez des améliorations:

DESCRIPTION:
"${description}"

Évaluez selon ces critères:
- Clarté des objectifs
- Détails techniques
- Contraintes mentionnées
- Budget/délais précisés
- Informations contextuelles

Répondez au format JSON:
{
  "score": 0.0,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "missingElements": ["élément manquant 1", "élément manquant 2"]
}

Score entre 0.0 (très vague) et 1.0 (très détaillé).`;

      const vertexResponse = await geminiCall('quality_analysis', { prompt });
      const result = vertexResponse.output;

      return {
        score: Math.max(0.0, Math.min(1.0, result.score || 0.5)),
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        missingElements: Array.isArray(result.missingElements) ? result.missingElements : []
      };

    } catch (error) {
      console.error('Erreur analyse qualité:', error);
      return {
        score: this.calculateLocalQualityScore(description), // Utilisation du score local comme fallback
        suggestions: ['Ajoutez plus de détails sur vos objectifs'],
        missingElements: ['Budget indicatif', 'Délais souhaités']
      };
    }
  }

  /**
   * Get fallback prices for a category
   */
  private getFallbackPrices(category: string) {
    const fallbackPrices = {
      'développement': { min: 2500, max: 12000, avg: 6000 },
      'design': { min: 1200, max: 5000, avg: 2800 },
      'marketing': { min: 1800, max: 8000, avg: 4000 },
      'rédaction': { min: 800, max: 3000, avg: 1500 },
      'conseil': { min: 2000, max: 10000, avg: 5000 },
      'services': { min: 1500, max: 6000, avg: 3000 },
      'travaux': { min: 2000, max: 8000, avg: 4500 }
    };

    return fallbackPrices[category as keyof typeof fallbackPrices] || fallbackPrices.conseil;
  }

  /**
   * Calculate local quality score based on description length and content
   */
  private calculateLocalQualityScore(description: string): number {
    let score = 0.3; // Base score

    // Length factor
    if (description.length > 100) score += 0.2;
    if (description.length > 300) score += 0.2;

    // Content factors
    if (description.toLowerCase().includes('budget')) score += 0.1;
    if (description.toLowerCase().includes('délai')) score += 0.1;
    if (description.toLowerCase().includes('expérience')) score += 0.1;

    return Math.min(1.0, score);
  }
}

export const aiEnhancementService = new AIEnhancementService();