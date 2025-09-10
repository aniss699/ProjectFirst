/**
 * Service de logging d'événements complet pour AppelsPro
 * Capture tous les événements utilisateurs et système pour l'apprentissage IA
 */

interface EventData {
  event_type: 'view' | 'save' | 'proposal' | 'win' | 'dispute' | 'skip' | 'click' | 'dwell' | 'conversion';
  user_id?: string;
  mission_id?: string;
  provider_id?: string;
  timestamp: string;
  session_id: string;
  metadata: {
    [key: string]: any;
  };
}

interface PerformanceMetrics {
  ai_latency_ms: number;
  accuracy_score?: number;
  confidence_level?: number;
  model_version: string;
  features_used: string[];
  prediction_outcome?: 'success' | 'failure' | 'pending';
}

interface UserBehaviorMetrics {
  dwell_time_ms: number;
  click_depth: number;
  scroll_percentage: number;
  interaction_quality: 'low' | 'medium' | 'high';
  conversion_funnel_stage: string;
}

interface BusinessMetrics {
  proposal_value?: number;
  time_to_decision_hours?: number;
  client_satisfaction_score?: number;
  project_completion_rate?: number;
  dispute_resolution_time_hours?: number;
}

export class EventLogger {
  private eventBuffer: EventData[] = [];
  private performanceCache: Map<string, PerformanceMetrics> = new Map();
  private batchSize = 50;
  private flushInterval = 30000; // 30 secondes
  
  constructor() {
    this.startAutoFlush();
  }

  /**
   * Log d'événement d'erreur système
   */
  logErrorEvent(
    error: Error,
    userId: string,
    sessionId: string,
    context: any = {}
  ): void {
    const event: EventData = {
      event_type: 'click', // Using existing type for error tracking
      user_id: userId,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      metadata: {
        error_type: 'system_error',
        error_message: error.message,
        error_stack: error.stack,
        context: context,
        severity: 'high'
      }
    };

    this.addToBuffer(event);
    console.log('🚨 [ERROR_LOGGED]', JSON.stringify({
      error: error.message,
      user: userId,
      session: sessionId,
      timestamp: event.timestamp
    }));
  }

  /**
   * Log d'événement utilisateur générique
   */
  logUserEvent(
    eventType: EventData['event_type'],
    userId: string,
    sessionId: string,
    metadata: any = {}
  ): void {
    const event: EventData = {
      event_type: eventType,
      user_id: userId,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      metadata: {
        ...metadata,
        user_agent: metadata.user_agent || 'unknown',
        ip_address: metadata.ip_address || 'unknown',
        platform: metadata.platform || 'web'
      }
    };

    this.addToBuffer(event);
    console.log('📊 [EVENT_LOGGED]', JSON.stringify({
      type: eventType,
      user: userId,
      session: sessionId,
      timestamp: event.timestamp
    }));
  }

  /**
   * Log d'événement de vue d'annonce
   */
  logAnnouncementView(
    userId: string,
    missionId: string,
    sessionId: string,
    dwellTime: number,
    metadata: UserBehaviorMetrics & any = {}
  ): void {
    const event: EventData = {
      event_type: 'view',
      user_id: userId,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      metadata: {
        dwell_time_ms: dwellTime,
        click_depth: metadata.click_depth || 0,
        scroll_percentage: metadata.scroll_percentage || 0,
        interaction_quality: this.calculateInteractionQuality(dwellTime, metadata),
        device_type: metadata.device_type || 'desktop',
        referrer: metadata.referrer || 'direct',
        feed_position: metadata.feed_position || 0,
        recommendation_score: metadata.recommendation_score || 0
      }
    };

    this.addToBuffer(event);
    this.logPerformanceMetrics('view_recommendation', {
      ai_latency_ms: metadata.recommendation_latency || 0,
      confidence_level: metadata.recommendation_score || 0,
      model_version: 'feed_ranker_v2.1',
      features_used: ['relevance', 'quality', 'freshness', 'price']
    });
  }

  /**
   * Log d'événement de sauvegarde/favori
   */
  logSave(
    userId: string,
    missionId: string,
    sessionId: string,
    metadata: any = {}
  ): void {
    const event: EventData = {
      event_type: 'save',
      user_id: userId,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      metadata: {
        save_source: metadata.save_source || 'feed', // 'feed', 'detail', 'search'
        user_decision_time_ms: metadata.decision_time || 0,
        mission_rank_in_feed: metadata.feed_position || 0,
        previous_interactions: metadata.previous_interactions || [],
        recommendation_accuracy: 'pending' // Sera mis à jour plus tard
      }
    };

    this.addToBuffer(event);
    this.logConversion('save', userId, missionId, metadata);
  }

  /**
   * Log d'événement de proposition
   */
  logProposal(
    providerId: string,
    missionId: string,
    sessionId: string,
    metadata: BusinessMetrics & any = {}
  ): void {
    const event: EventData = {
      event_type: 'proposal',
      provider_id: providerId,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      metadata: {
        proposal_value: metadata.proposal_value || 0,
        time_to_proposal_hours: metadata.time_to_proposal_hours || 0,
        proposal_rank: metadata.proposal_rank || 0,
        pricing_confidence: metadata.pricing_confidence || 0,
        matching_score: metadata.matching_score || 0,
        bid_strategy: metadata.bid_strategy || 'unknown',
        ai_price_suggestion: metadata.ai_price_suggestion || 0,
        price_deviation_percentage: metadata.price_deviation_percentage || 0
      }
    };

    this.addToBuffer(event);
    this.logPerformanceMetrics('pricing_suggestion', {
      ai_latency_ms: metadata.pricing_latency || 0,
      accuracy_score: metadata.pricing_confidence || 0,
      model_version: 'neural_pricing_v2.1',
      features_used: ['complexity', 'market', 'urgency', 'provider'],
      prediction_outcome: 'pending'
    });
  }

  /**
   * Log d'événement de victoire (projet attribué)
   */
  logWin(
    providerId: string,
    missionId: string,
    sessionId: string,
    metadata: BusinessMetrics & any = {}
  ): void {
    const event: EventData = {
      event_type: 'win',
      provider_id: providerId,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      metadata: {
        final_value: metadata.final_value || 0,
        negotiation_rounds: metadata.negotiation_rounds || 0,
        time_to_decision_hours: metadata.time_to_decision_hours || 0,
        client_satisfaction_prediction: metadata.client_satisfaction_prediction || 0,
        ai_match_score: metadata.ai_match_score || 0,
        ai_price_accuracy: metadata.ai_price_accuracy || 0
      }
    };

    this.addToBuffer(event);
    this.updatePredictionOutcome('pricing_suggestion', missionId, 'success');
    this.updatePredictionOutcome('matching_recommendation', missionId, 'success');
  }

  /**
   * Log d'événement de litige
   */
  logDispute(
    userId: string,
    missionId: string,
    sessionId: string,
    metadata: BusinessMetrics & any = {}
  ): void {
    const event: EventData = {
      event_type: 'dispute',
      user_id: userId,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      metadata: {
        dispute_type: metadata.dispute_type || 'unknown',
        dispute_stage: metadata.dispute_stage || 'initial',
        estimated_resolution_time: metadata.estimated_resolution_time || 0,
        client_satisfaction_drop: metadata.client_satisfaction_drop || 0,
        ai_risk_score: metadata.ai_risk_score || 0,
        preventability_score: metadata.preventability_score || 0
      }
    };

    this.addToBuffer(event);
    this.updatePredictionOutcome('risk_assessment', missionId, 'failure');
  }

  /**
   * Log des métriques de performance IA
   */
  private logPerformanceMetrics(
    modelType: string,
    metrics: PerformanceMetrics
  ): void {
    const key = `${modelType}_${Date.now()}`;
    this.performanceCache.set(key, {
      ...metrics,
      timestamp: new Date().toISOString()
    } as any);

    console.log('🧠 [AI_PERFORMANCE]', JSON.stringify({
      model: modelType,
      latency: metrics.ai_latency_ms,
      confidence: metrics.confidence_level,
      version: metrics.model_version
    }));
  }

  /**
   * Log d'événement de conversion
   */
  private logConversion(
    conversionType: string,
    userId: string,
    missionId: string,
    metadata: any
  ): void {
    const conversionEvent: EventData = {
      event_type: 'conversion',
      user_id: userId,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      session_id: metadata.session_id || 'unknown',
      metadata: {
        conversion_type: conversionType,
        funnel_stage: metadata.funnel_stage || 'unknown',
        conversion_value: metadata.conversion_value || 0,
        time_to_conversion: metadata.time_to_conversion || 0,
        attribution_source: metadata.attribution_source || 'organic'
      }
    };

    this.addToBuffer(conversionEvent);
  }

  /**
   * Calcule la qualité d'interaction
   */
  private calculateInteractionQuality(
    dwellTime: number,
    metadata: any
  ): 'low' | 'medium' | 'high' {
    let score = 0;
    
    // Temps de vue
    if (dwellTime > 10000) score += 3; // > 10s
    else if (dwellTime > 3000) score += 2; // > 3s
    else if (dwellTime > 1000) score += 1; // > 1s
    
    // Profondeur d'interaction
    if (metadata.click_depth > 2) score += 2;
    else if (metadata.click_depth > 0) score += 1;
    
    // Scroll
    if (metadata.scroll_percentage > 75) score += 1;
    
    if (score >= 5) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  /**
   * Met à jour le résultat d'une prédiction
   */
  private updatePredictionOutcome(
    modelType: string,
    missionId: string,
    outcome: 'success' | 'failure'
  ): void {
    // En production, ceci mettrait à jour la base de données
    console.log('📈 [PREDICTION_UPDATE]', JSON.stringify({
      model: modelType,
      mission: missionId,
      outcome,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Ajoute un événement au buffer
   */
  private addToBuffer(event: EventData): void {
    this.eventBuffer.push(event);
    
    if (this.eventBuffer.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Vide le buffer d'événements
   */
  private flushEvents(): void {
    if (this.eventBuffer.length === 0) return;
    
    const events = [...this.eventBuffer];
    this.eventBuffer = [];
    
    // En production, ceci irait vers une base de données/service d'analytics
    console.log('🚀 [EVENTS_FLUSHED]', `${events.length} événements envoyés vers analytics`);
    
    // Simulation d'envoi vers service d'analytics
    this.sendToAnalyticsService(events);
  }

  /**
   * Envoi simulé vers service d'analytics
   */
  private async sendToAnalyticsService(events: EventData[]): Promise<void> {
    // Simulation d'envoi vers Mixpanel, Amplitude, ou autre service d'analytics
    try {
      // await analytics.track(events);
      console.log('✅ Events sent to analytics service');
    } catch (error) {
      console.error('❌ Failed to send events to analytics:', error);
      // Re-ajouter les événements au buffer pour retry
      this.eventBuffer.unshift(...events);
    }
  }

  /**
   * Démarrage du flush automatique
   */
  private startAutoFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Récupération des métriques de performance
   */
  getPerformanceMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.performanceCache);
  }

  /**
   * Nettoyage des métriques anciennes
   */
  cleanupOldMetrics(maxAgeMs: number = 3600000): void { // 1 heure par défaut
    const cutoff = Date.now() - maxAgeMs;
    
    for (const [key, metrics] of this.performanceCache.entries()) {
      const metricTime = new Date((metrics as any).timestamp).getTime();
      if (metricTime < cutoff) {
        this.performanceCache.delete(key);
      }
    }
  }
}

export const eventLogger = new EventLogger();