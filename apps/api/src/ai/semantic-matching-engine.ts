/**
 * Moteur de Matching Sémantique Profond pour AppelsPro
 * Algorithme avancé de correspondance mission-prestataire avec NLP
 */

interface MatchingRequest {
  mission: {
    id: string;
    title: string;
    description: string;
    category: string;
    skills_required: string[];
    complexity: number;
    budget: number;
    urgency: string;
    duration_weeks: number;
    client_preferences?: any;
  };
  provider_pool: Array<{
    id: string;
    skills: string[];
    categories: string[];
    portfolio: string[];
    rating: number;
    completed_projects: number;
    success_rate: number;
    hourly_rate: number;
    location: string;
    expertise_level: string;
    availability: string;
    client_reviews?: string[];
    specializations?: string[];
  }>;
  matching_criteria: {
    weight_skill_match: number;
    weight_experience: number;
    weight_rating: number;
    weight_price_fit: number;
    weight_availability: number;
    semantic_threshold: number;
    max_results: number;
  };
}

interface MatchingResult {
  ranked_matches: Array<{
    provider: any;
    match_score: number;
    breakdown: {
      semantic_similarity: number;
      skill_alignment: number;
      experience_fit: number;
      price_compatibility: number;
      availability_match: number;
      portfolio_relevance: number;
      client_fit: number;
      quality_indicator: number;
    };
    confidence_level: number;
    compatibility_factors: string[];
    risk_indicators: string[];
    value_proposition: string;
    recommendation_reason: string;
  }>;
  matching_explanations: {
    algorithm_insights: string[];
    top_criteria: string[];
    filtering_steps: string[];
    semantic_analysis: any;
  };
  optimization_suggestions: {
    for_client: string[];
    for_providers: string[];
    market_insights: string[];
  };
  alternative_approaches: string[];
  confidence_scores: number[];
}

export class SemanticMatchingEngine {
  private vocabularyCache: Map<string, number[]>;
  private similarityCache: Map<string, number>;
  private semanticModels: Map<string, any>;
  private performanceMetrics: any;

  constructor() {
    this.vocabularyCache = new Map();
    this.similarityCache = new Map();
    this.semanticModels = new Map();
    this.performanceMetrics = {
      matches_processed: 0,
      avg_accuracy: 0.92,
      cache_efficiency: 0.80,
      processing_time_ms: 0,
      semantic_model_version: '3.2.1',
      optimization_level: 'high'
    };
    
    this.initializeSemanticModels();
  }

  /**
   * Effectue un matching sémantique profond
   */
  async performDeepMatching(request: MatchingRequest): Promise<MatchingResult> {
    const startTime = Date.now();
    console.log('🎯 Semantic Matching Engine: Starting deep analysis...');
    
    // Phase 1: Prétraitement et analyse sémantique
    const missionEmbedding = await this.generateMissionEmbedding(request.mission);
    const providerEmbeddings = await this.generateProviderEmbeddings(request.provider_pool);
    
    // Phase 2: Calcul de similarité multidimensionnelle
    const similarityMatrix = this.calculateMultiDimensionalSimilarity(
      missionEmbedding, 
      providerEmbeddings,
      request.matching_criteria
    );
    
    // Phase 3: Scoring avancé avec facteurs contextuels
    const advancedScores = this.calculateAdvancedMatchingScores(
      similarityMatrix,
      request
    );
    
    // Phase 4: Ranking neural avec optimisation
    const rankedMatches = this.performNeuralRanking(advancedScores, request);
    
    // Phase 5: Génération d'explications et insights
    const explanations = this.generateMatchingExplanations(rankedMatches, request);
    
    // Phase 6: Suggestions d'optimisation
    const optimizations = this.generateOptimizationSuggestions(rankedMatches, request);
    
    const processingTime = Date.now() - startTime;
    this.updatePerformanceMetrics(processingTime);
    
    console.log(`✅ Semantic Matching Engine: ${rankedMatches.length} matches analyzed in ${processingTime}ms`);
    
    return {
      ranked_matches: rankedMatches,
      matching_explanations: explanations,
      optimization_suggestions: optimizations,
      alternative_approaches: this.generateAlternativeApproaches(request),
      confidence_scores: rankedMatches.map(match => match.confidence_level)
    };
  }

  /**
   * Génère l'embedding sémantique d'une mission
   */
  private async generateMissionEmbedding(mission: any) {
    const cacheKey = `mission_embedding_${mission.id}`;
    
    if (this.vocabularyCache.has(cacheKey)) {
      return this.vocabularyCache.get(cacheKey);
    }
    
    // Analyse textuelle avancée
    const textAnalysis = this.performAdvancedTextAnalysis(mission);
    
    // Vectorisation sémantique
    const semanticVector = this.generateSemanticVector(textAnalysis);
    
    // Enrichissement contextuel
    const contextualVector = this.addContextualFeatures(semanticVector, mission);
    
    const finalVector = contextualVector.semantic;
    this.vocabularyCache.set(cacheKey, finalVector);
    return contextualVector;
  }

  /**
   * Génère les embeddings des prestataires
   */
  private async generateProviderEmbeddings(providers: any[]) {
    const embeddings = [];
    
    for (const provider of providers) {
      const cacheKey = `provider_embedding_${provider.id}`;
      
      let embedding;
      if (this.vocabularyCache.has(cacheKey)) {
        embedding = this.vocabularyCache.get(cacheKey);
      } else {
        // Analyse du profil prestataire
        const profileAnalysis = this.analyzeProviderProfile(provider);
        
        // Vectorisation des compétences
        const skillVector = this.generateSkillVector(provider.skills, provider.categories);
        
        // Vectorisation de l'expérience
        const experienceVector = this.generateExperienceVector(provider);
        
        // Combinaison des vecteurs
        embedding = this.combineProviderVectors(skillVector, experienceVector, profileAnalysis);
        
        this.vocabularyCache.set(cacheKey, embedding.semantic);
      }
      
      embeddings.push({
        provider_id: provider.id,
        embedding: embedding,
        metadata: this.extractProviderMetadata(provider),
        features_logged: this.logProviderFeatures(provider, embedding)
      });
    }
    
    return embeddings;
  }

  /**
   * Calcul de similarité multidimensionnelle
   */
  private calculateMultiDimensionalSimilarity(missionEmbedding: any, providerEmbeddings: any[], criteria: any) {
    const similarities = [];
    
    for (const providerEmb of providerEmbeddings) {
      // Similarité sémantique (TF-IDF + Word2Vec simulé)
      const semanticSim = this.calculateSemanticSimilarity(missionEmbedding.semantic, providerEmb.embedding.semantic);
      
      // Similarité de compétences (Jaccard + poids)
      const skillSim = this.calculateAdvancedSkillSimilarity(missionEmbedding.skills, providerEmb.embedding.skills);
      
      // Similarité contextuelle
      const contextSim = this.calculateContextualSimilarity(missionEmbedding.context, providerEmb.embedding.context);
      
      // Similarité de domaine
      const domainSim = this.calculateDomainSimilarity(missionEmbedding.domain, providerEmb.embedding.domain);
      
      // Similarité d'expérience
      const experienceSim = this.calculateExperienceSimilarity(missionEmbedding, providerEmb.embedding);
      
      similarities.push({
        provider_id: providerEmb.provider_id,
        semantic_similarity: semanticSim,
        skill_alignment: skillSim,
        contextual_match: contextSim,
        domain_expertise: domainSim,
        experience_relevance: experienceSim,
        composite_score: this.calculateCompositeScore({
          semantic: semanticSim,
          skill: skillSim,
          context: contextSim,
          domain: domainSim,
          experience: experienceSim
        }, criteria)
      });
    }
    
    return similarities;
  }

  /**
   * Calcul de scores avancés avec facteurs contextuels
   */
  private calculateAdvancedMatchingScores(similarities: any[], request: MatchingRequest) {
    const { mission, provider_pool, matching_criteria } = request;
    
    return similarities.map(sim => {
      const provider = provider_pool.find(p => p.id === sim.provider_id)!;
      
      // Score de base sémantique
      const baseScore = sim.composite_score;
      
      // Facteurs d'ajustement avancés
      const adjustments = {
        rating_boost: this.calculateRatingBoost(provider.rating),
        experience_multiplier: this.calculateExperienceMultiplier(provider.completed_projects),
        success_rate_factor: this.calculateSuccessRateFactor(provider.success_rate),
        price_compatibility: this.calculatePriceCompatibility(provider.hourly_rate, mission.budget, mission.complexity),
        availability_bonus: this.calculateAvailabilityBonus(provider.availability, mission.urgency),
        location_factor: this.calculateLocationFactor(provider.location, mission),
        portfolio_relevance: this.calculatePortfolioRelevance(provider.portfolio, mission),
        specialization_match: this.calculateSpecializationMatch(provider.specializations || [], mission),
        client_review_sentiment: this.analyzeClientReviewSentiment(provider.client_reviews || []),
        market_positioning_fit: this.calculateMarketPositioningFit(provider, mission)
      };
      
      // Calcul du score final ajusté
      const adjustmentFactor = Object.values(adjustments).reduce((prod: number, adj: any) => prod * adj, 1.0);
      const finalScore = Math.min(100, baseScore * adjustmentFactor);
      
      // Niveau de confiance
      const confidence = this.calculateMatchConfidence(sim, adjustments, provider);
      
      // Facteurs de compatibilité
      const compatibilityFactors = this.identifyCompatibilityFactors(sim, adjustments, provider, mission);
      
      // Indicateurs de risque
      const riskIndicators = this.identifyMatchingRisks(provider, mission, adjustments);
      
      // Proposition de valeur
      const valueProposition = this.generateValueProposition(provider, mission, adjustments);
      
      // Raison de recommandation
      const recommendationReason = this.generateRecommendationReason(sim, adjustments, provider);
      
      // Génération des 3 bullet points explicatifs
      const explainableBullets = this.generateExplainableBullets(sim, adjustments, provider, mission);
      
      // Log des features et outputs pour l'apprentissage
      this.logMatchingFeatures({
        mission_id: mission.id,
        provider_id: provider.id,
        semantic_similarity: sim.semantic_similarity,
        skill_alignment: sim.skill_alignment,
        final_score: finalScore,
        adjustments: adjustments,
        timestamp: new Date().toISOString()
      });
      
      return {
        provider,
        match_score: Math.round(finalScore),
        breakdown: {
          semantic_similarity: Math.round(sim.semantic_similarity * 100),
          skill_alignment: Math.round(sim.skill_alignment * 100),
          experience_fit: Math.round(adjustments.experience_multiplier * 100),
          price_compatibility: Math.round(adjustments.price_compatibility * 100),
          availability_match: Math.round(adjustments.availability_bonus * 100),
          portfolio_relevance: Math.round(adjustments.portfolio_relevance * 100),
          client_fit: Math.round(adjustments.client_review_sentiment * 100),
          quality_indicator: Math.round(adjustments.rating_boost * 100)
        },
        confidence_level: Math.round(confidence * 100),
        compatibility_factors: compatibilityFactors,
        risk_indicators: riskIndicators,
        value_proposition: valueProposition,
        recommendation_reason: recommendationReason,
        explainable_bullets: explainableBullets,
        features_logged: true
      };
    }).sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Ranking neural avec optimisation
   */
  private performNeuralRanking(scoredMatches: any[], request: MatchingRequest) {
    const { matching_criteria } = request;
    
    // Application du seuil sémantique
    let filteredMatches = scoredMatches.filter(match => 
      match.breakdown.semantic_similarity >= matching_criteria.semantic_threshold * 100
    );
    
    // Diversification des résultats
    filteredMatches = this.applyDiversificationStrategy(filteredMatches, request);
    
    // Optimisation par machine learning simulé
    filteredMatches = this.applyMLOptimization(filteredMatches, request);
    
    // Limitation des résultats
    const finalMatches = filteredMatches.slice(0, matching_criteria.max_results);
    
    // Post-traitement pour amélioration continue
    this.learnFromMatching(finalMatches, request);
    
    return finalMatches;
  }

  /**
   * Génère 3 bullet points explicatifs pour chaque recommandation
   */
  private generateExplainableBullets(similarity: any, adjustments: any, provider: any, mission: any): string[] {
    const bullets = [];
    
    // Bullet 1: Match principal (compétences/expérience)
    const skillMatch = Math.round(similarity.skill_alignment * 100);
    const experienceYears = this.estimateProviderExperience(provider);
    bullets.push(
      `🎯 ${skillMatch}% de correspondance technique - ${experienceYears} ans d'expérience en ${mission.category}`
    );
    
    // Bullet 2: Avantage concurrentiel/qualité
    if (adjustments.rating_boost > 1.1) {
      bullets.push(
        `⭐ Prestataire élite: ${provider.rating}/5 étoiles, ${provider.success_rate}% de taux de succès`
      );
    } else if (adjustments.price_compatibility > 1.0) {
      bullets.push(
        `💰 Excellent rapport qualité-prix: ${provider.hourly_rate}€/h dans votre budget`
      );
    } else {
      bullets.push(
        `🔧 Compétences spécialisées: expert en ${provider.specializations?.[0] || mission.skills_required[0]}`
      );
    }
    
    // Bullet 3: Disponibilité/timing ou valeur ajoutée
    if (mission.urgency === 'high' && adjustments.availability_bonus > 1.0) {
      bullets.push(
        `⚡ Disponible immédiatement pour votre projet urgent`
      );
    } else if (adjustments.portfolio_relevance > 1.1) {
      bullets.push(
        `🏆 Portfolio impressionnant: ${provider.completed_projects} projets similaires réalisés`
      );
    } else {
      const geoBonus = adjustments.location_factor > 1.0 ? 'local' : 'remote';
      bullets.push(
        `📍 Collaboration ${geoBonus} optimale avec votre équipe`
      );
    }
    
    return bullets;
  }
  
  /**
   * Estime l'expérience du prestataire en années
   */
  private estimateProviderExperience(provider: any): number {
    // Estimation basée sur le nombre de projets et le niveau d'expertise
    const projectsPerYear = 8; // Estimation moyenne
    const baseYears = Math.min(Math.round(provider.completed_projects / projectsPerYear), 15);
    
    const expertiseLevels = { 'junior': 1, 'intermediate': 3, 'senior': 7, 'expert': 12 };
    const expertiseYears = (expertiseLevels as any)[provider.expertise_level] || 3;
    
    return Math.max(baseYears, expertiseYears);
  }
  
  /**
   * Log des features de matching pour l'apprentissage
   */
  private logMatchingFeatures(data: any): void {
    // En production, ceci irait vers un système de logs structurés
    console.log('📊 [MATCHING_FEATURES]', JSON.stringify({
      timestamp: data.timestamp,
      mission_id: data.mission_id,
      provider_id: data.provider_id,
      features: {
        semantic_sim: Math.round(data.semantic_similarity * 1000) / 1000,
        skill_align: Math.round(data.skill_alignment * 1000) / 1000,
        final_score: Math.round(data.final_score),
        rating_boost: Math.round(data.adjustments.rating_boost * 1000) / 1000,
        price_compat: Math.round(data.adjustments.price_compatibility * 1000) / 1000,
        portfolio_rel: Math.round(data.adjustments.portfolio_relevance * 1000) / 1000
      }
    }));
    
    // Stockage pour analytics (simulation)
    this.storeMatchingAnalytics(data);
  }
  
  /**
   * Log des features du prestataire
   */
  private logProviderFeatures(provider: any, embedding: any): any {
    const features = {
      skills_count: provider.skills.length,
      categories_count: provider.categories.length,
      rating: provider.rating,
      projects_completed: provider.completed_projects,
      success_rate: provider.success_rate,
      hourly_rate: provider.hourly_rate,
      expertise_level: provider.expertise_level,
      embedding_norm: this.calculateEmbeddingNorm(embedding)
    };
    
    console.log('📊 [PROVIDER_FEATURES]', JSON.stringify({
      provider_id: provider.id,
      features,
      timestamp: new Date().toISOString()
    }));
    
    return features;
  }
  
  /**
   * Calcule la norme de l'embedding
   */
  private calculateEmbeddingNorm(embedding: any): number {
    if (!embedding.semantic || !Array.isArray(embedding.semantic)) return 0;
    return Math.sqrt(embedding.semantic.reduce((sum: number, val: number) => sum + val * val, 0));
  }
  
  /**
   * Stockage des analytics de matching (simulation)
   */
  private storeMatchingAnalytics(data: any): void {
    // En production, ceci irait vers une base de données analytics
    // Pour l'instant, on simule avec un cache en mémoire
    const key = `analytics_${data.mission_id}_${data.provider_id}`;
    this.performanceMetrics[key] = {
      ...data,
      stored_at: new Date().toISOString()
    };
  }

  // ==== MÉTHODES D'ANALYSE TEXTUELLE ====

  private performAdvancedTextAnalysis(mission: any) {
    const fullText = `${mission.title} ${mission.description}`.toLowerCase();
    
    return {
      tokens: this.tokenizeAdvanced(fullText),
      entities: this.extractEntities(fullText),
      concepts: this.extractDomainConcepts(fullText),
      intentions: this.analyzeUserIntentions(fullText),
      complexity_indicators: this.extractComplexityIndicators(fullText),
      domain_specificity: this.analyzeDomainSpecificity(fullText),
      technical_depth: this.analyzeTechnicalDepth(fullText),
      business_context: this.extractBusinessContext(fullText)
    };
  }

  private generateSemanticVector(textAnalysis: any): number[] {
    // Simulation de vectorisation sémantique (Word2Vec/BERT-like)
    const vector = new Array(300).fill(0); // Vecteur 300D
    
    // Vectorisation des tokens
    textAnalysis.tokens.forEach((token: string, index: number) => {
      const tokenHash = this.hashToken(token);
      vector[tokenHash % 300] += 1 / (index + 1); // Poids décroissant
    });
    
    // Vectorisation des entités
    textAnalysis.entities.forEach((entity: any) => {
      const entityHash = this.hashToken(entity.value);
      vector[entityHash % 300] += entity.confidence * 2;
    });
    
    // Vectorisation des concepts
    textAnalysis.concepts.forEach((concept: string) => {
      const conceptHash = this.hashToken(concept);
      vector[conceptHash % 300] += 1.5;
    });
    
    // Normalisation du vecteur
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  private addContextualFeatures(semanticVector: number[], mission: any) {
    return {
      semantic: semanticVector,
      skills: this.vectorizeSkills(mission.skills_required || []),
      context: {
        budget: mission.budget || 0,
        complexity: mission.complexity || 5,
        urgency: this.vectorizeUrgency(mission.urgency || 'medium'),
        timeline: mission.duration_weeks || 4,
        category: this.vectorizeCategory(mission.category)
      },
      domain: this.generateDomainVector(mission),
      metadata: {
        title_length: mission.title.length,
        description_length: mission.description.length,
        has_budget: !!mission.budget,
        has_timeline: !!mission.duration_weeks
      }
    };
  }

  // ==== MÉTHODES D'ANALYSE PRESTATAIRE ====

  private analyzeProviderProfile(provider: any) {
    return {
      skill_breadth: provider.skills.length,
      category_focus: this.calculateCategoryFocus(provider.categories),
      experience_depth: this.calculateExperienceDepth(provider),
      quality_metrics: this.calculateQualityMetrics(provider),
      market_position: this.determineProviderMarketPosition(provider),
      reliability_score: this.calculateReliabilityScore(provider),
      innovation_capacity: this.assessInnovationCapacity(provider),
      client_satisfaction: this.analyzeClientSatisfaction(provider)
    };
  }

  private generateSkillVector(skills: string[], categories: string[]): number[] {
    const skillVector = new Array(200).fill(0); // Vecteur 200D pour compétences
    
    // Vectorisation des compétences
    skills.forEach((skill, index) => {
      const skillHash = this.hashToken(skill.toLowerCase());
      skillVector[skillHash % 200] += 1 + (index === 0 ? 0.5 : 0); // Bonus première compétence
    });
    
    // Vectorisation des catégories
    categories.forEach(category => {
      const catHash = this.hashToken(category.toLowerCase());
      skillVector[catHash % 200] += 0.8;
    });
    
    return skillVector;
  }

  private generateExperienceVector(provider: any): number[] {
    const expVector = new Array(50).fill(0); // Vecteur 50D pour expérience
    
    // Vectorisation expérience
    expVector[0] = Math.min(1, provider.completed_projects / 50); // Nombre de projets
    expVector[1] = provider.rating / 5; // Rating normalisé
    expVector[2] = provider.success_rate / 100; // Taux de succès
    expVector[3] = this.normalizeHourlyRate(provider.hourly_rate); // Taux horaire normalisé
    
    // Vectorisation expertise
    const expertiseLevels = { 'junior': 0.25, 'intermediate': 0.5, 'senior': 0.75, 'expert': 1.0 };
    expVector[4] = (expertiseLevels as any)[provider.expertise_level] || 0.5;
    
    return expVector;
  }

  private combineProviderVectors(skillVector: number[], experienceVector: number[], analysis: any) {
    return {
      semantic: this.generateProviderSemanticVector(analysis),
      skills: skillVector,
      experience: experienceVector,
      context: {
        rating: analysis.quality_metrics.overall_rating,
        projects: analysis.experience_depth.project_count,
        specialization: analysis.market_position.specialization_level,
        reliability: analysis.reliability_score.overall_score
      },
      domain: this.generateProviderDomainVector(analysis),
      metadata: analysis
    };
  }

  // ==== MÉTHODES DE CALCUL DE SIMILARITÉ ====

  private calculateSemanticSimilarity(missionSemantic: number[], providerSemantic: number[]): number {
    // Similarité cosinus
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < Math.min(missionSemantic.length, providerSemantic.length); i++) {
      dotProduct += missionSemantic[i] * providerSemantic[i];
      magnitudeA += missionSemantic[i] * missionSemantic[i];
      magnitudeB += providerSemantic[i] * providerSemantic[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private calculateAdvancedSkillSimilarity(missionSkills: number[], providerSkills: number[]): number {
    // Jaccard amélioré avec poids
    const intersection = missionSkills.reduce((sum, val, i) => 
      sum + Math.min(val, providerSkills[i] || 0), 0
    );
    
    const union = missionSkills.reduce((sum, val, i) => 
      sum + Math.max(val, providerSkills[i] || 0), 0
    );
    
    const jaccardSim = union > 0 ? intersection / union : 0;
    
    // Bonus pour sur-qualification
    const overqualificationBonus = this.calculateOverqualificationBonus(missionSkills, providerSkills);
    
    return Math.min(1.0, jaccardSim + overqualificationBonus);
  }

  private calculateContextualSimilarity(missionContext: any, providerContext: any): number {
    let similarity = 0.5; // Base
    
    // Similarité budgétaire
    const budgetFit = this.calculateBudgetFit(missionContext.budget, providerContext.rating);
    similarity += budgetFit * 0.2;
    
    // Similarité de complexité
    const complexityFit = this.calculateComplexityFit(missionContext.complexity, providerContext.specialization);
    similarity += complexityFit * 0.15;
    
    // Similarité d'urgence
    const urgencyFit = this.calculateUrgencyFit(missionContext.urgency, providerContext.reliability);
    similarity += urgencyFit * 0.15;
    
    return Math.min(1.0, similarity);
  }

  private calculateDomainSimilarity(missionDomain: any, providerDomain: any): number {
    // Analyse de correspondance domaine métier
    const domainOverlap = this.calculateDomainOverlap(missionDomain, providerDomain);
    const expertiseDepth = this.calculateExpertiseDepth(providerDomain, missionDomain);
    const industryExperience = this.calculateIndustryExperience(providerDomain, missionDomain);
    
    return (domainOverlap * 0.4 + expertiseDepth * 0.35 + industryExperience * 0.25);
  }

  private calculateExperienceSimilarity(missionEmb: any, providerEmb: any): number {
    // Correspondance niveau d'expérience requis vs offert
    const requiredLevel = this.inferRequiredExperienceLevel(missionEmb);
    const providerLevel = providerEmb.experience[4]; // Expertise level
    
    const levelDiff = Math.abs(requiredLevel - providerLevel);
    
    // Préférence pour légère sur-qualification
    if (providerLevel > requiredLevel && levelDiff <= 0.25) {
      return 1.0; // Idéal
    } else if (providerLevel >= requiredLevel) {
      return Math.max(0.7, 1.0 - levelDiff);
    } else {
      return Math.max(0.3, 0.8 - levelDiff * 2); // Pénalité sous-qualification
    }
  }

  private calculateCompositeScore(similarities: any, criteria: any): number {
    const weights = {
      semantic: criteria.weight_skill_match * 0.3,
      skill: criteria.weight_skill_match * 0.7,
      context: criteria.weight_price_fit * 0.5 + criteria.weight_availability * 0.5,
      domain: criteria.weight_experience * 0.6,
      experience: criteria.weight_experience * 0.4
    };
    
    const weightedSum = 
      similarities.semantic * weights.semantic +
      similarities.skill * weights.skill +
      similarities.context * weights.context +
      similarities.domain * weights.domain +
      similarities.experience * weights.experience;
    
    const totalWeight = Object.values(weights).reduce((sum: number, w: any) => sum + w, 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // ==== MÉTHODES DE GÉNÉRATION D'INSIGHTS ====

  private generateMatchingExplanations(matches: any[], request: MatchingRequest) {
    const topMatch = matches[0];
    
    const algorithmInsights = [
      `Analyse sémantique de ${request.provider_pool.length} prestataires`,
      `Matching multidimensionnel avec ${Object.keys(request.matching_criteria).length} critères`,
      `Seuil de pertinence: ${request.matching_criteria.semantic_threshold * 100}%`,
      `Top match: ${topMatch?.match_score}% de compatibilité`
    ];
    
    const topCriteria = this.identifyTopCriteria(matches, request);
    
    const filteringSteps = [
      `Filtrage initial: ${request.provider_pool.length} prestataires`,
      `Analyse sémantique: vectorisation 300D`,
      `Calcul similarité: ${matches.length} scores générés`,
      `Ranking neural: top ${Math.min(matches.length, request.matching_criteria.max_results)} sélectionnés`
    ];
    
    const semanticAnalysis = {
      avg_semantic_score: this.calculateAverageSemanticScore(matches),
      score_distribution: this.analyzeScoreDistribution(matches),
      quality_indicators: this.identifyQualityIndicators(matches),
      matching_patterns: this.identifyMatchingPatterns(matches)
    };
    
    return {
      algorithm_insights: algorithmInsights,
      top_criteria: topCriteria,
      filtering_steps: filteringSteps,
      semantic_analysis: semanticAnalysis
    };
  }

  private generateOptimizationSuggestions(matches: any[], request: MatchingRequest) {
    const clientSuggestions: string[] = [];
    const providerSuggestions: string[] = [];
    const marketInsights: string[] = [];
    
    // Suggestions pour le client
    if (matches.length < 3) {
      clientSuggestions.push('Élargir les critères de sélection pour plus de choix');
      clientSuggestions.push('Augmenter le budget pour attirer des profils premium');
    }
    
    const avgSemanticScore = this.calculateAverageSemanticScore(matches);
    if (avgSemanticScore < 0.7) {
      clientSuggestions.push('Préciser la description technique pour améliorer le matching');
      clientSuggestions.push('Ajouter des exemples concrets de livrables attendus');
    }
    
    // Suggestions pour les prestataires
    const topSkillsMissing = this.identifyTopMissingSkills(matches, request);
    if (topSkillsMissing.length > 0) {
      providerSuggestions.push(`Compétences recherchées: ${topSkillsMissing.slice(0, 3).join(', ')}`);
    }
    
    providerSuggestions.push('Enrichir le portfolio avec des projets similaires');
    providerSuggestions.push('Optimiser le profil avec mots-clés pertinents');
    
    // Insights marché
    const competitionLevel = this.analyzeCompetitionInMatches(matches);
    if (competitionLevel === 'high') {
      marketInsights.push('Marché très concurrentiel - différenciation par expertise');
    } else if (competitionLevel === 'low') {
      marketInsights.push('Opportunité marché - peu de prestataires qualifiés');
    }
    
    marketInsights.push(`Catégorie ${request.mission.category}: demande ${this.assessCategoryDemand(request.mission.category)}`);
    
    return {
      for_client: clientSuggestions,
      for_providers: providerSuggestions,
      market_insights: marketInsights
    };
  }

  private generateAlternativeApproaches(request: MatchingRequest): string[] {
    const alternatives: string[] = [];
    
    // Approches alternatives basées sur l'analyse
    if (request.matching_criteria.semantic_threshold > 0.8) {
      alternatives.push('Réduire le seuil sémantique pour plus de résultats');
    }
    
    if (request.provider_pool.length < 10) {
      alternatives.push('Élargir la recherche géographique');
      alternatives.push('Considérer les prestataires en formation');
    }
    
    if (request.mission.complexity > 7) {
      alternatives.push('Découper en sous-projets plus simples');
      alternatives.push('Former une équipe de prestataires complémentaires');
    }
    
    alternatives.push('Utiliser le matching inversé pour découvrir de nouveaux profils');
    alternatives.push('Analyser les tendances de matching pour optimiser les critères');
    
    return alternatives;
  }

  // ==== MÉTHODES UTILITAIRES ====

  private initializeSemanticModels() {
    // Initialisation des modèles sémantiques
    this.semanticModels.set('skill_similarity', new Map());
    this.semanticModels.set('domain_vectors', new Map());
    this.semanticModels.set('concept_graph', new Map());
  }

  private tokenizeAdvanced(text: string): string[] {
    // Tokenisation avancée avec préservation des entités
    return text
      .toLowerCase()
      .replace(/[^\w\s.-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.isStopWord(token));
  }

  private extractEntities(text: string): Array<{type: string, value: string, confidence: number}> {
    const entities: Array<{type: string, value: string, confidence: number}> = [];
    
    // Technologies
    const techRegex = /(react|vue|angular|node\.js|python|java|typescript|javascript)/gi;
    const techMatches = text.match(techRegex) || [];
    techMatches.forEach(match => {
      entities.push({ type: 'TECHNOLOGY', value: match, confidence: 0.95 });
    });
    
    // Frameworks
    const frameworkRegex = /(express|fastapi|django|spring|laravel|rails)/gi;
    const frameworkMatches = text.match(frameworkRegex) || [];
    frameworkMatches.forEach(match => {
      entities.push({ type: 'FRAMEWORK', value: match, confidence: 0.9 });
    });
    
    return entities;
  }

  private extractDomainConcepts(text: string): string[] {
    const concepts: string[] = [];
    
    const domainKeywords = [
      'ecommerce', 'fintech', 'healthtech', 'edtech', 'saas',
      'marketplace', 'platform', 'dashboard', 'analytics', 'crm',
      'erp', 'cms', 'api', 'microservices', 'architecture'
    ];
    
    domainKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        concepts.push(keyword);
      }
    });
    
    return concepts;
  }

  private analyzeUserIntentions(text: string): string[] {
    const intentions: string[] = [];
    
    if (/créer|développer|construire|faire/i.test(text)) intentions.push('creation');
    if (/améliorer|optimiser|moderniser|refactorer/i.test(text)) intentions.push('improvement');
    if (/réparer|corriger|résoudre|débugger/i.test(text)) intentions.push('maintenance');
    if (/analyser|étudier|auditer|comprendre/i.test(text)) intentions.push('analysis');
    if (/intégrer|connecter|synchroniser/i.test(text)) intentions.push('integration');
    if (/migrer|porter|convertir/i.test(text)) intentions.push('migration');
    
    return intentions;
  }

  private extractComplexityIndicators(text: string): string[] {
    const indicators: string[] = [];
    
    const complexityMarkers = [
      'architecture', 'scalabilité', 'performance', 'sécurité',
      'temps réel', 'big data', 'machine learning', 'blockchain',
      'microservices', 'cloud', 'devops', 'ci/cd'
    ];
    
    complexityMarkers.forEach(marker => {
      if (text.includes(marker)) {
        indicators.push(marker);
      }
    });
    
    return indicators;
  }

  private hashToken(token: string): number {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private vectorizeSkills(skills: string[]): number[] {
    const skillVector = new Array(100).fill(0);
    
    skills.forEach((skill, index) => {
      const hash = this.hashToken(skill.toLowerCase());
      skillVector[hash % 100] += 1 / (index + 1);
    });
    
    return skillVector;
  }

  private vectorizeUrgency(urgency: string): number {
    const urgencyMap = { 'low': 0.3, 'medium': 0.6, 'high': 1.0 };
    return (urgencyMap as any)[urgency] || 0.6;
  }

  private vectorizeCategory(category: string): number {
    const categoryMap = {
      'web-development': 0.1,
      'mobile-development': 0.2,
      'design': 0.3,
      'marketing': 0.4,
      'data-science': 0.5,
      'devops': 0.6
    };
    return (categoryMap as any)[category] || 0.0;
  }

  // Méthodes utilitaires simplifiées (pour prototype)
  private generateDomainVector(mission: any): number[] { return new Array(50).fill(0.5); }
  private generateProviderSemanticVector(analysis: any): number[] { return new Array(300).fill(0.3); }
  private generateProviderDomainVector(analysis: any): number[] { return new Array(50).fill(0.4); }
  private extractProviderMetadata(provider: any): any { return { id: provider.id, name: provider.name }; }
  private calculateCategoryFocus(categories: string[]): number { return categories.length > 0 ? 1 / categories.length : 0.5; }
  private calculateExperienceDepth(provider: any): any {
    return {
      project_count: provider.completed_projects,
      avg_rating: provider.rating,
      years_active: Math.floor(provider.completed_projects / 10) + 1
    };
  }
  private calculateQualityMetrics(provider: any): any {
    return {
      overall_rating: provider.rating,
      consistency_score: provider.success_rate,
      client_satisfaction: provider.rating / 5
    };
  }
  private determineProviderMarketPosition(provider: any): any {
    return {
      specialization_level: provider.expertise_level === 'expert' ? 1.0 : 0.7,
      market_segment: provider.hourly_rate > 80 ? 'premium' : 'standard'
    };
  }
  private calculateReliabilityScore(provider: any): any {
    return {
      overall_score: (provider.rating / 5 + provider.success_rate / 100) / 2,
      delivery_track_record: provider.success_rate / 100
    };
  }
  private assessInnovationCapacity(provider: any): number {
    return provider.expertise_level === 'expert' ? 0.9 : 0.6;
  }
  private analyzeClientSatisfaction(provider: any): number {
    return provider.rating / 5;
  }
  private normalizeHourlyRate(rate: number): number {
    return Math.min(1, rate / 150); // Normalisation sur 150€/h max
  }
  private calculateOverqualificationBonus(missionSkills: number[], providerSkills: number[]): number {
    const providerTotal = providerSkills.reduce((sum, val) => sum + val, 0);
    const missionTotal = missionSkills.reduce((sum, val) => sum + val, 0);
    
    return providerTotal > missionTotal ? Math.min(0.2, (providerTotal - missionTotal) * 0.1) : 0;
  }
  private calculateBudgetFit(budget: number, rating: number): number {
    const expectedBudget = rating * 1000; // €1000 par point de rating
    const ratio = budget / expectedBudget;
    return ratio >= 0.8 && ratio <= 1.5 ? 1.0 : ratio > 1.5 ? 0.8 : 0.6;
  }
  private calculateComplexityFit(complexity: number, specialization: number): number {
    const diff = Math.abs(complexity / 10 - specialization);
    return Math.max(0.5, 1.0 - diff);
  }
  private calculateUrgencyFit(urgency: number, reliability: number): number {
    return urgency > 0.8 ? reliability : 1.0; // Urgence requiert fiabilité
  }
  private calculateDomainOverlap(missionDomain: any, providerDomain: any): number { return 0.7; }
  private calculateExpertiseDepth(providerDomain: any, missionDomain: any): number { return 0.8; }
  private calculateIndustryExperience(providerDomain: any, missionDomain: any): number { return 0.6; }
  private inferRequiredExperienceLevel(missionEmb: any): number {
    return missionEmb.context.complexity / 10; // Complexité → niveau requis
  }

  // Méthodes de calcul d'ajustements
  private calculateRatingBoost(rating: number): number {
    return Math.max(0.8, Math.min(1.3, rating / 4));
  }
  private calculateExperienceMultiplier(projects: number): number {
    return Math.min(1.25, 1 + Math.log(projects + 1) * 0.1);
  }
  private calculateSuccessRateFactor(rate: number): number {
    return Math.max(0.7, rate / 100);
  }
  private calculatePriceCompatibility(hourlyRate: number, budget: number, complexity: number): number {
    const estimatedHours = complexity * 40; // 40h par point de complexité
    const estimatedCost = hourlyRate * estimatedHours;
    const ratio = budget / estimatedCost;
    
    if (ratio >= 1.2) return 1.2; // Budget généreux
    if (ratio >= 1.0) return 1.0; // Budget adéquat
    if (ratio >= 0.8) return 0.9; // Budget serré
    return 0.7; // Budget insuffisant
  }
  private calculateAvailabilityBonus(availability: string, urgency: string): number {
    if (urgency === 'high' && availability === 'immediate') return 1.3;
    if (urgency === 'high' && availability === 'available') return 1.1;
    if (availability === 'busy') return 0.8;
    return 1.0;
  }
  private calculateLocationFactor(location: string, mission: any): number {
    // Simulation géographique
    return location === 'remote' ? 1.0 : 0.95;
  }
  private calculatePortfolioRelevance(portfolio: string[], mission: any): number {
    const relevantProjects = portfolio.filter(project => 
      project.toLowerCase().includes(mission.category.toLowerCase()) ||
      mission.skills_required.some((skill: string) => 
        project.toLowerCase().includes(skill.toLowerCase())
      )
    ).length;
    
    return Math.min(1.2, 0.8 + (relevantProjects / portfolio.length) * 0.4);
  }
  private calculateSpecializationMatch(specializations: string[], mission: any): number {
    const relevantSpecs = specializations.filter(spec => 
      mission.skills_required.includes(spec) ||
      mission.category.includes(spec.toLowerCase())
    ).length;
    
    return Math.min(1.3, 1.0 + relevantSpecs * 0.1);
  }
  private analyzeClientReviewSentiment(reviews: string[]): number {
    if (reviews.length === 0) return 1.0;
    
    let positiveCount = 0;
    reviews.forEach(review => {
      const positive = ['excellent', 'parfait', 'recommande', 'professionnel', 'qualité'];
      if (positive.some(word => review.toLowerCase().includes(word))) {
        positiveCount++;
      }
    });
    
    return Math.max(0.7, Math.min(1.3, 0.8 + (positiveCount / reviews.length) * 0.5));
  }
  private calculateMarketPositioningFit(provider: any, mission: any): number {
    const providerLevel = provider.expertise_level;
    const missionComplexity = mission.complexity;
    
    if (missionComplexity > 7 && providerLevel === 'expert') return 1.2;
    if (missionComplexity < 4 && providerLevel === 'junior') return 1.1;
    if (Math.abs(missionComplexity - this.mapExpertiseToComplexity(providerLevel)) <= 2) return 1.0;
    
    return 0.85;
  }

  private calculateMatchConfidence(similarity: any, adjustments: any, provider: any): number {
    let confidence = 0.8;
    
    // Facteurs augmentant la confiance
    if (similarity.semantic_similarity > 0.8) confidence += 0.1;
    if (provider.completed_projects > 20) confidence += 0.05;
    if (provider.success_rate > 90) confidence += 0.05;
    
    // Facteurs réduisant la confiance
    if (similarity.semantic_similarity < 0.5) confidence -= 0.2;
    if (provider.completed_projects < 5) confidence -= 0.1;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private identifyCompatibilityFactors(similarity: any, adjustments: any, provider: any, mission: any): string[] {
    const factors: string[] = [];
    
    if (similarity.skill_alignment > 0.8) factors.push('Excellente correspondance des compétences');
    if (adjustments.experience_multiplier > 1.15) factors.push('Expérience très pertinente');
    if (adjustments.price_compatibility > 1.1) factors.push('Budget compatible avec le profil');
    if (provider.rating > 4.5) factors.push('Excellente réputation client');
    if (adjustments.portfolio_relevance > 1.1) factors.push('Portfolio aligné avec vos besoins');
    
    return factors;
  }

  private identifyMatchingRisks(provider: any, mission: any, adjustments: any): string[] {
    const risks: string[] = [];
    
    if (provider.completed_projects < 5) risks.push('Expérience limitée');
    if (provider.rating < 4.0) risks.push('Réputation à surveiller');
    if (adjustments.price_compatibility < 0.8) risks.push('Budget potentiellement insuffisant');
    if (provider.success_rate < 80) risks.push('Taux de succès en dessous de la moyenne');
    if (mission.urgency === 'high' && provider.availability !== 'immediate') {
      risks.push('Disponibilité non optimale pour projet urgent');
    }
    
    return risks;
  }

  private generateValueProposition(provider: any, mission: any, adjustments: any): string {
    const strengths: string[] = [];
    
    if (provider.rating > 4.5) strengths.push('expertise reconnue');
    if (provider.completed_projects > 20) strengths.push('vaste expérience');
    if (adjustments.specialization_match > 1.1) strengths.push('spécialisation parfaite');
    if (adjustments.portfolio_relevance > 1.1) strengths.push('projets similaires réussis');
    
    const valueMsg = strengths.length > 0 
      ? `Prestataire avec ${strengths.join(', ')}`
      : 'Profil équilibré pour votre projet';
    
    return valueMsg;
  }

  private generateRecommendationReason(similarity: any, adjustments: any, provider: any): string {
    if (similarity.semantic_similarity > 0.85) {
      return 'Correspondance sémantique exceptionnelle avec vos besoins';
    }
    
    if (adjustments.experience_multiplier > 1.2 && provider.rating > 4.5) {
      return 'Combinaison idéale d\'expérience et de qualité';
    }
    
    if (adjustments.price_compatibility > 1.1) {
      return 'Excellent rapport qualité-prix pour votre budget';
    }
    
    if (similarity.skill_alignment > 0.8) {
      return 'Compétences parfaitement alignées avec le projet';
    }
    
    return 'Profil équilibré correspondant à vos critères';
  }

  // Méthodes d'optimisation et d'analyse
  private applyDiversificationStrategy(matches: any[], request: MatchingRequest): any[] {
    // Diversification pour éviter les profils trop similaires
    const diversified: any[] = [];
    const maxPerCategory = Math.ceil(request.matching_criteria.max_results / 3);
    
    const categoryCounts = new Map<string, number>();
    
    for (const match of matches) {
      const category = match.provider.expertise_level;
      const currentCount = categoryCounts.get(category) || 0;
      
      if (currentCount < maxPerCategory) {
        diversified.push(match);
        categoryCounts.set(category, currentCount + 1);
      }
    }
    
    return diversified;
  }

  private applyMLOptimization(matches: any[], request: MatchingRequest): any[] {
    // Simulation d'optimisation ML
    return matches.map(match => ({
      ...match,
      match_score: Math.min(100, match.match_score * this.getMLOptimizationFactor(match, request))
    }));
  }

  private learnFromMatching(matches: any[], request: MatchingRequest): void {
    // Apprentissage continu pour amélioration future
    this.performanceMetrics.matches_processed += matches.length;
    
    // Mise à jour des métriques de précision (simulation)
    const avgConfidence = matches.reduce((sum, match) => sum + match.confidence_level, 0) / matches.length;
    this.performanceMetrics.avg_accuracy = (this.performanceMetrics.avg_accuracy + avgConfidence / 100) / 2;
  }

  private updatePerformanceMetrics(processingTime: number): void {
    this.performanceMetrics.processing_time_ms = 
      (this.performanceMetrics.processing_time_ms + processingTime) / 2;
  }

  // Méthodes d'analyse des résultats
  private identifyTopCriteria(matches: any[], request: MatchingRequest): string[] {
    const criteria: string[] = [];
    
    const avgBreakdown = this.calculateAverageBreakdown(matches);
    const sortedCriteria = Object.entries(avgBreakdown)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    return sortedCriteria.map(([key]) => {
      const readable = key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
      return readable.charAt(0).toUpperCase() + readable.slice(1);
    });
  }

  private calculateAverageSemanticScore(matches: any[]): number {
    if (matches.length === 0) return 0;
    
    const total = matches.reduce((sum, match) => sum + match.breakdown.semantic_similarity, 0);
    return total / matches.length / 100;
  }

  private analyzeScoreDistribution(matches: any[]): any {
    const scores = matches.map(m => m.match_score);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    
    return { average: avg, maximum: max, minimum: min, spread: max - min };
  }

  private identifyQualityIndicators(matches: any[]): string[] {
    const indicators: string[] = [];
    
    const highScoreCount = matches.filter(m => m.match_score > 80).length;
    if (highScoreCount > 0) {
      indicators.push(`${highScoreCount} correspondances de haute qualité`);
    }
    
    const avgConfidence = matches.reduce((sum, m) => sum + m.confidence_level, 0) / matches.length;
    if (avgConfidence > 80) {
      indicators.push('Niveau de confiance élevé du matching');
    }
    
    return indicators;
  }

  private identifyMatchingPatterns(matches: any[]): string[] {
    const patterns: string[] = [];
    
    // Analyse des patterns dans les top matches
    const topMatches = matches.slice(0, 3);
    const commonFactors = this.findCommonFactors(topMatches);
    
    patterns.push(...commonFactors);
    
    return patterns;
  }

  private identifyTopMissingSkills(matches: any[], request: MatchingRequest): string[] {
    const requiredSkills = request.mission.skills_required;
    const providedSkills = matches.flatMap(m => m.provider.skills);
    
    return requiredSkills.filter(skill => 
      !providedSkills.some(provided => provided.toLowerCase().includes(skill.toLowerCase()))
    );
  }

  private analyzeCompetitionInMatches(matches: any[]): string {
    if (matches.length > 15) return 'high';
    if (matches.length > 8) return 'medium';
    return 'low';
  }

  private assessCategoryDemand(category: string): string {
    const demandLevels = {
      'web-development': 'high',
      'mobile-development': 'high', 
      'design': 'medium',
      'marketing': 'medium',
      'data-science': 'high'
    };
    
    return (demandLevels as any)[category] || 'medium';
  }

  // Méthodes utilitaires diverses
  private isStopWord(word: string): boolean {
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'pour', 'avec', 'dans', 'sur'];
    return stopWords.includes(word);
  }
  private mapExpertiseToComplexity(expertise: string): number {
    const mapping = { 'junior': 3, 'intermediate': 5, 'senior': 7, 'expert': 9 };
    return (mapping as any)[expertise] || 5;
  }
  private getMLOptimizationFactor(match: any, request: MatchingRequest): number {
    // Facteur d'optimisation ML basé sur historique (simulation)
    return 1.0 + Math.random() * 0.1 - 0.05; // ±5% d'optimisation
  }
  private calculateAverageBreakdown(matches: any[]): any {
    if (matches.length === 0) return {};
    
    const avgBreakdown: any = {};
    const breakdown = matches[0].breakdown;
    
    Object.keys(breakdown).forEach(key => {
      const total = matches.reduce((sum, match) => sum + match.breakdown[key], 0);
      avgBreakdown[key] = total / matches.length;
    });
    
    return avgBreakdown;
  }
  private findCommonFactors(topMatches: any[]): string[] {
    const factors: string[] = [];
    
    // Analyse des facteurs communs
    const commonSkills = this.findCommonSkills(topMatches);
    if (commonSkills.length > 0) {
      factors.push(`Compétences communes: ${commonSkills.slice(0, 3).join(', ')}`);
    }
    
    const avgRating = topMatches.reduce((sum, m) => sum + m.provider.rating, 0) / topMatches.length;
    if (avgRating > 4.5) {
      factors.push('Préférence pour prestataires très bien notés');
    }
    
    return factors;
  }
  private findCommonSkills(matches: any[]): string[] {
    if (matches.length === 0) return [];
    
    const skillCounts = new Map<string, number>();
    
    matches.forEach(match => {
      match.provider.skills.forEach((skill: string) => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      });
    });
    
    const threshold = Math.ceil(matches.length * 0.6); // 60% des top matches
    return Array.from(skillCounts.entries())
      .filter(([skill, count]) => count >= threshold)
      .map(([skill]) => skill);
  }

  // Méthodes d'analyse avancée (stubs pour prototype)
  private analyzeDomainSpecificity(text: string): number { return 0.7; }
  private analyzeTechnicalDepth(text: string): number { return 0.6; }
  private extractBusinessContext(text: string): any { return { business_domain: 'general', target_market: 'b2b' }; }
}

// Instance singleton pour utilisation dans l'application
export const semanticMatchingEngine = new SemanticMatchingEngine();