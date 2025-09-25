/**
 * Système de Sécurité Simplifié pour SwipDEAL  
 * Vérifications essentielles anti-fraude basiques
 */

interface FraudDetectionResult {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  detected_patterns: FraudPattern[];
  recommendations: string[];
  confidence: number;
  requires_action: boolean;
}

interface FraudPattern {
  type: string;
  description: string;
  severity: number;
  evidence: any[];
  false_positive_probability: number;
}

interface BasicSecurityCheck {
  user_id: string;
  action_type: string;
  context: any;
  historical_data?: any[];
}

class SimpleFraudDetection {
  private recentActions: Map<string, Date[]> = new Map();
  private blacklistedUsers: Set<string> = new Set();
  private suspiciousPatterns: Map<string, number> = new Map();

  /**
   * Vérifications de sécurité essentielles (pas de ML complexe)
   */
  async detectFraud(data: BasicSecurityCheck): Promise<FraudDetectionResult> {
    console.log('🔒 Simple Security: Running basic fraud checks...');

    const checks = [
      this.checkRateLimit(data),
      this.checkBlacklist(data),
      this.checkBasicPatterns(data),
      this.checkBehaviorFlags(data)
    ];

    const results = await Promise.all(checks);
    const detectedPatterns = results.filter(r => r !== null) as FraudPattern[];
    
    const riskScore = this.calculateSimpleRiskScore(detectedPatterns);
    const riskLevel = this.classifyRiskLevel(riskScore);

    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      detected_patterns: detectedPatterns,
      recommendations: this.generateSimpleRecommendations(riskLevel, detectedPatterns),
      confidence: detectedPatterns.length > 0 ? 0.8 : 0.9,
      requires_action: riskLevel === 'high' || riskLevel === 'critical'
    };
  }

  /**
   * Vérification anti-spam/rate limiting basique
   */
  private async checkRateLimit(data: BasicSecurityCheck): Promise<FraudPattern | null> {
    const { user_id, action_type } = data;
    const now = new Date();
    const key = `${user_id}_${action_type}`;
    
    // Récupérer les actions récentes
    const recentActions = this.recentActions.get(key) || [];
    
    // Nettoyer les actions de plus d'une heure
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const filteredActions = recentActions.filter(date => date > oneHourAgo);
    
    // Mettre à jour
    this.recentActions.set(key, [...filteredActions, now]);

    // Vérifier les limites basiques
    const limits = this.getActionLimits(action_type);
    if (filteredActions.length >= limits.hourly) {
      return {
        type: 'rate_limit_exceeded',
        description: `Trop d'actions ${action_type} en 1h (${filteredActions.length}/${limits.hourly})`,
        severity: 7,
        evidence: [{ recent_actions: filteredActions.length, limit: limits.hourly }],
        false_positive_probability: 0.1
      };
    }

    return null;
  }

  /**
   * Vérification liste noire basique
   */
  private async checkBlacklist(data: BasicSecurityCheck): Promise<FraudPattern | null> {
    if (this.blacklistedUsers.has(data.user_id)) {
      return {
        type: 'blacklisted_user',
        description: 'Utilisateur en liste noire',
        severity: 10,
        evidence: [{ user_id: data.user_id }],
        false_positive_probability: 0.05
      };
    }
    return null;
  }

  /**
   * Détection de patterns suspects basiques
   */
  private async checkBasicPatterns(data: BasicSecurityCheck): Promise<FraudPattern | null> {
    const { context } = data;
    
    // Vérifications simples sur le contenu
    if (context.description) {
      const suspiciousKeywords = [
        'urgent', '100% garanti', 'argent facile', 'sans risque',
        'opportunité unique', 'revenus passifs', 'millionnaire'
      ];
      
      const description = context.description.toLowerCase();
      const foundKeywords = suspiciousKeywords.filter(keyword => 
        description.includes(keyword)
      );
      
      if (foundKeywords.length >= 2) {
        return {
          type: 'suspicious_content',
          description: `Contenu potentiellement frauduleux (${foundKeywords.length} mots suspects)`,
          severity: 6,
          evidence: [{ keywords: foundKeywords }],
          false_positive_probability: 0.3
        };
      }
    }

    // Vérification prix suspects
    if (context.price) {
      const price = parseFloat(context.price);
      if (price < 10 || price > 50000) {
        return {
          type: 'suspicious_pricing',
          description: `Prix anormal: ${price}€`,
          severity: 5,
          evidence: [{ price }],
          false_positive_probability: 0.4
        };
      }
    }

    return null;
  }

  /**
   * Vérifications comportementales basiques
   */
  private async checkBehaviorFlags(data: BasicSecurityCheck): Promise<FraudPattern | null> {
    const { user_id, context } = data;
    
    // Vérification création compte récente avec activité intense
    if (context.account_age_days && context.account_age_days < 1 && context.daily_actions > 10) {
      return {
        type: 'new_account_high_activity',
        description: `Compte récent très actif (${context.account_age_days} jour, ${context.daily_actions} actions)`,
        severity: 7,
        evidence: [{ 
          account_age: context.account_age_days, 
          daily_actions: context.daily_actions 
        }],
        false_positive_probability: 0.2
      };
    }

    return null;
  }

  /**
   * Calcul simple du score de risque
   */
  private calculateSimpleRiskScore(patterns: FraudPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const totalSeverity = patterns.reduce((sum, pattern) => sum + pattern.severity, 0);
    const maxSeverity = Math.max(...patterns.map(p => p.severity));
    
    // Score combiné entre 0 et 10
    return Math.min(10, (totalSeverity / patterns.length + maxSeverity) / 2);
  }

  /**
   * Classification simple des niveaux de risque
   */
  private classifyRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high'; 
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Génération de recommandations simples
   */
  private generateSimpleRecommendations(riskLevel: string, patterns: FraudPattern[]): string[] {
    const recommendations: string[] = [];
    
    switch (riskLevel) {
      case 'critical':
        recommendations.push('Bloquer immédiatement le compte');
        recommendations.push('Examiner toutes les transactions récentes');
        break;
      case 'high':
        recommendations.push('Suspendre temporairement le compte');
        recommendations.push('Demander vérification d\'identité');
        break;
      case 'medium':
        recommendations.push('Surveiller étroitement l\'activité');
        recommendations.push('Limiter certaines actions');
        break;
      default:
        recommendations.push('Continuer la surveillance normale');
    }

    // Recommandations spécifiques par type de pattern
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'rate_limit_exceeded':
          recommendations.push('Appliquer un cooldown temporaire');
          break;
        case 'suspicious_content':
          recommendations.push('Modération manuelle du contenu');
          break;
        case 'suspicious_pricing':
          recommendations.push('Validation manuelle du prix');
          break;
      }
    });

    return [...new Set(recommendations)]; // Supprimer les doublons
  }

  /**
   * Limites d'actions par type (anti-spam basique)
   */
  private getActionLimits(actionType: string): { hourly: number } {
    const limits: { [key: string]: { hourly: number } } = {
      'create_mission': { hourly: 5 },
      'submit_bid': { hourly: 20 },
      'send_message': { hourly: 50 },
      'create_account': { hourly: 3 },
      'login_attempt': { hourly: 10 },
      'default': { hourly: 30 }
    };
    
    return limits[actionType] || limits['default'];
  }

  /**
   * Détection de collusion simplifiée
   */
  async detectCollusion(bids: any[], mission: any): Promise<{
    collusion_detected: boolean;
    suspicious_groups: any[];
    evidence: string[];
    confidence: number;
  }> {
    console.log('🔍 Simple Collusion Check: Analyzing bids...');
    
    const suspicious_groups: any[] = [];
    const evidence: string[] = [];

    // Vérification simple: prix trop similaires
    if (bids.length >= 3) {
      const prices = bids.map(bid => bid.price).sort((a, b) => a - b);
      const priceRange = prices[prices.length - 1] - prices[0];
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      if (priceRange < (avgPrice * 0.05)) { // Variation < 5%
        suspicious_groups.push({
          type: 'price_similarity',
          members: bids.map(bid => bid.provider_id),
          evidence: 'Prix anormalement similaires'
        });
        evidence.push('Coordination possible des prix');
      }
    }

    // Vérification timing (soumissions trop rapprochées)
    if (bids.length >= 2) {
      const submissions = bids.map(bid => new Date(bid.created_at)).sort();
      for (let i = 1; i < submissions.length; i++) {
        const timeDiff = submissions[i].getTime() - submissions[i-1].getTime();
        if (timeDiff < 60000) { // Moins d'1 minute
          evidence.push('Soumissions suspectes dans un court intervalle');
          break;
        }
      }
    }

    return {
      collusion_detected: suspicious_groups.length > 0 || evidence.length > 0,
      suspicious_groups,
      evidence,
      confidence: suspicious_groups.length > 0 ? 0.7 : 0.5
    };
  }

  /**
   * Analyse comportementale simplifiée (pour compatibilité)
   */
  async analyzeUserBehavior(behaviorData: any): Promise<any> {
    console.log('📊 Simple Behavior Analysis...');
    
    const riskIndicators: string[] = [];
    let riskScore = 0;

    // Vérifications simples
    if (behaviorData.login_frequency && behaviorData.login_frequency > 50) {
      riskIndicators.push('Connexions très fréquentes');
      riskScore += 2;
    }

    if (behaviorData.failed_login_attempts && behaviorData.failed_login_attempts > 5) {
      riskIndicators.push('Échecs de connexion multiples');
      riskScore += 3;
    }

    if (behaviorData.account_age_hours && behaviorData.account_age_hours < 24) {
      riskIndicators.push('Compte très récent');
      riskScore += 1;
    }

    return {
      riskLevel: riskScore >= 5 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
      confidence: 0.6,
      risk_indicators: riskIndicators,
      risk_score: riskScore,
      behavioral_score: Math.max(0, 10 - riskScore)
    };
  }

  /**
   * Méthode de fallback simple
   */
  private fallbackFraudDetection(): FraudDetectionResult {
    return {
      risk_score: 0,
      risk_level: 'low',
      detected_patterns: [],
      recommendations: ['Surveillance normale'],
      confidence: 0.5,
      requires_action: false
    };
  }

  /**
   * Ajouter utilisateur à la liste noire
   */
  addToBlacklist(userId: string): void {
    this.blacklistedUsers.add(userId);
    console.log(`🚫 User ${userId} added to blacklist`);
  }

  /**
   * Retirer utilisateur de la liste noire  
   */
  removeFromBlacklist(userId: string): void {
    this.blacklistedUsers.delete(userId);
    console.log(`✅ User ${userId} removed from blacklist`);
  }
}

// Export compatible avec l'ancien système
export const fraudDetectionEngine = new SimpleFraudDetection();
export default fraudDetectionEngine;