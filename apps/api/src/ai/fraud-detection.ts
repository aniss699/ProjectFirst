
/**
 * Système de Détection de Fraude et Abus Avancé
 * Phase 3 : Protection et sécurité intelligente
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

interface BehaviorAnalysis {
  user_id: string;
  behavioral_score: number;
  anomalies: Anomaly[];
  trust_indicators: TrustIndicator[];
  risk_factors: RiskFactor[];
}

interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
  confidence: number;
}

interface TrustIndicator {
  type: string;
  value: number;
  description: string;
  weight: number;
}

interface RiskFactor {
  factor: string;
  impact: number;
  description: string;
  mitigation: string;
}

class FraudDetectionEngine {
  private suspiciousPatterns: Map<string, number> = new Map();
  private behaviorBaselines: Map<string, any> = new Map();
  private blacklistedPatterns: Set<string> = new Set();

  /**
   * Détection principale de fraude
   */
  async detectFraud(data: {
    user_id: string;
    action_type: string;
    context: any;
    historical_data: any[];
  }): Promise<FraudDetectionResult> {
    try {
      // Analyse comportementale
      const behaviorAnalysis = await this.analyzeBehavior(data);
      
      // Détection de patterns suspects
      const suspiciousPatterns = this.detectSuspiciousPatterns(data);
      
      // Calcul du score de risque
      const risk_score = this.calculateRiskScore(behaviorAnalysis, suspiciousPatterns);
      
      // Classification du niveau de risque
      const risk_level = this.classifyRiskLevel(risk_score);
      
      // Génération des recommandations
      const recommendations = this.generateRecommendations(risk_level, suspiciousPatterns);

      return {
        risk_score: Math.round(risk_score * 100) / 100,
        risk_level,
        detected_patterns: suspiciousPatterns,
        recommendations,
        confidence: this.calculateConfidence(behaviorAnalysis, suspiciousPatterns),
        requires_action: risk_level === 'high' || risk_level === 'critical'
      };
    } catch (error) {
      console.error('Fraud detection failed:', error);
      return this.fallbackFraudDetection();
    }
  }

  /**
   * Détection de collusion entre prestataires
   */
  async detectCollusion(bids: any[], mission: any): Promise<{
    collusion_detected: boolean;
    suspicious_groups: any[];
    evidence: string[];
    confidence: number;
  }> {
    try {
      const suspicious_groups: any[] = [];
      const evidence: string[] = [];

      // Analyse des patterns de prix suspects
      const priceClusters = this.analyzePriceClusters(bids);
      if (priceClusters.suspicious) {
        suspicious_groups.push({
          type: 'price_coordination',
          members: priceClusters.members,
          evidence: 'Prix anormalement groupés'
        });
        evidence.push('Coordination suspecte des prix');
      }

      // Analyse des timing suspects
      const timingPatterns = this.analyzeSubmissionTiming(bids);
      if (timingPatterns.suspicious) {
        suspicious_groups.push({
          type: 'timing_coordination',
          members: timingPatterns.members,
          evidence: 'Soumissions coordonnées dans le temps'
        });
        evidence.push('Timing de soumission suspect');
      }

      // Analyse des profils similaires
      const profileSimilarity = this.analyzeProfileSimilarity(bids);
      if (profileSimilarity.suspicious) {
        suspicious_groups.push({
          type: 'profile_similarity',
          members: profileSimilarity.members,
          evidence: 'Profils anormalement similaires'
        });
        evidence.push('Similarité de profils suspecte');
      }

      return {
        collusion_detected: suspicious_groups.length > 0,
        suspicious_groups,
        evidence,
        confidence: this.calculateCollusionConfidence(suspicious_groups)
      };
    } catch (error) {
      console.error('Collusion detection failed:', error);
      return {
        collusion_detected: false,
        suspicious_groups: [],
        evidence: [],
        confidence: 0
      };
    }
  }

  /**
   * Détection de dumping (prix artificiellement bas)
   */
  detectDumping(bids: any[], marketData: any): {
    dumping_detected: boolean;
    suspicious_bids: any[];
    market_threshold: number;
    analysis: string;
  } {
    try {
      const market_threshold = this.calculateMarketThreshold(marketData);
      const suspicious_bids: any[] = [];

      bids.forEach(bid => {
        const dumpingScore = this.calculateDumpingScore(bid, market_threshold, marketData);
        if (dumpingScore > 0.7) {
          suspicious_bids.push({
            ...bid,
            dumping_score: dumpingScore,
            reasons: this.getDumpingReasons(bid, market_threshold)
          });
        }
      });

      const analysis = this.generateDumpingAnalysis(suspicious_bids, market_threshold);

      return {
        dumping_detected: suspicious_bids.length > 0,
        suspicious_bids,
        market_threshold,
        analysis
      };
    } catch (error) {
      console.error('Dumping detection failed:', error);
      return {
        dumping_detected: false,
        suspicious_bids: [],
        market_threshold: 0,
        analysis: 'Analyse échouée'
      };
    }
  }

  /**
   * Analyse comportementale avancée
   */
  private async analyzeBehavior(data: any): Promise<BehaviorAnalysis> {
    const { user_id, historical_data } = data;
    
    // Calcul du score comportemental
    const behavioral_score = this.calculateBehavioralScore(historical_data);
    
    // Détection d'anomalies
    const anomalies = this.detectBehavioralAnomalies(historical_data);
    
    // Indicateurs de confiance
    const trust_indicators = this.calculateTrustIndicators(historical_data);
    
    // Facteurs de risque
    const risk_factors = this.identifyRiskFactors(historical_data);

    return {
      user_id,
      behavioral_score,
      anomalies,
      trust_indicators,
      risk_factors
    };
  }

  /**
   * Détection de patterns suspects
   */
  private detectSuspiciousPatterns(data: any): FraudPattern[] {
    const patterns: FraudPattern[] = [];

    // Pattern: Activité suspecte
    if (this.detectSuspiciousActivity(data)) {
      patterns.push({
        type: 'suspicious_activity',
        description: 'Activité anormalement élevée en peu de temps',
        severity: 0.7,
        evidence: ['Volume élevé', 'Fréquence inhabituelle'],
        false_positive_probability: 0.2
      });
    }

    // Pattern: Informations incohérentes
    if (this.detectInconsistentInfo(data)) {
      patterns.push({
        type: 'inconsistent_information',
        description: 'Informations contradictoires dans le profil',
        severity: 0.8,
        evidence: ['Données conflictuelles', 'Changements fréquents'],
        false_positive_probability: 0.15
      });
    }

    // Pattern: Comportement automatisé
    if (this.detectAutomatedBehavior(data)) {
      patterns.push({
        type: 'automated_behavior',
        description: 'Comportement suggérant une automatisation',
        severity: 0.6,
        evidence: ['Actions répétitives', 'Timing régulier'],
        false_positive_probability: 0.3
      });
    }

    // Pattern: Utilisation multiple comptes
    if (this.detectMultipleAccounts(data)) {
      patterns.push({
        type: 'multiple_accounts',
        description: 'Suspicion d\'utilisation de comptes multiples',
        severity: 0.9,
        evidence: ['IP similaires', 'Patterns communs'],
        false_positive_probability: 0.1
      });
    }

    return patterns;
  }

  /**
   * Calcul du score de risque
   */
  private calculateRiskScore(behaviorAnalysis: BehaviorAnalysis, patterns: FraudPattern[]): number {
    let riskScore = 0;

    // Score comportemental (0-40 points)
    riskScore += (1 - behaviorAnalysis.behavioral_score) * 40;

    // Anomalies détectées (0-30 points)
    const anomalyScore = behaviorAnalysis.anomalies.reduce((sum, anomaly) => {
      const severityWeight = { low: 1, medium: 2, high: 3 }[anomaly.severity];
      return sum + (severityWeight * anomaly.confidence);
    }, 0);
    riskScore += Math.min(anomalyScore * 5, 30);

    // Patterns suspects (0-30 points)
    const patternScore = patterns.reduce((sum, pattern) => {
      return sum + (pattern.severity * (1 - pattern.false_positive_probability));
    }, 0);
    riskScore += Math.min(patternScore * 15, 30);

    return Math.min(riskScore, 100);
  }

  /**
   * Classification du niveau de risque
   */
  private classifyRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Génération de recommandations
   */
  private generateRecommendations(riskLevel: string, patterns: FraudPattern[]): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('Suspension immédiate du compte recommandée');
        recommendations.push('Investigation manuelle approfondie requise');
        recommendations.push('Blocage des transactions en cours');
        break;
      case 'high':
        recommendations.push('Surveillance renforcée du compte');
        recommendations.push('Vérification manuelle des prochaines actions');
        recommendations.push('Limitation temporaire des privilèges');
        break;
      case 'medium':
        recommendations.push('Surveillance automatique accrue');
        recommendations.push('Vérification d\'identité supplémentaire');
        break;
      case 'low':
        recommendations.push('Surveillance normale maintenue');
        break;
    }

    // Recommandations spécifiques aux patterns
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'multiple_accounts':
          recommendations.push('Vérification des liens entre comptes');
          break;
        case 'automated_behavior':
          recommendations.push('Test CAPTCHA ou vérification humaine');
          break;
        case 'inconsistent_information':
          recommendations.push('Validation des informations de profil');
          break;
      }
    });

    return [...new Set(recommendations)]; // Dédoublonnage
  }

  // Méthodes d'analyse spécialisées

  private analyzePriceClusters(bids: any[]) {
    if (bids.length < 3) return { suspicious: false, members: [] };

    const prices = bids.map(b => b.price).sort((a, b) => a - b);
    const clusters: number[][] = [];
    let currentCluster = [prices[0]];

    for (let i = 1; i < prices.length; i++) {
      if (Math.abs(prices[i] - prices[i-1]) / prices[i-1] < 0.05) { // 5% de différence
        currentCluster.push(prices[i]);
      } else {
        if (currentCluster.length > 1) clusters.push([...currentCluster]);
        currentCluster = [prices[i]];
      }
    }
    if (currentCluster.length > 1) clusters.push(currentCluster);

    const suspicious = clusters.some(cluster => cluster.length >= 3);
    const members = suspicious ? clusters.find(c => c.length >= 3) || [] : [];

    return { suspicious, members };
  }

  private analyzeSubmissionTiming(bids: any[]) {
    if (bids.length < 3) return { suspicious: false, members: [] };

    const submissions = bids.map(b => new Date(b.created_at).getTime()).sort();
    const intervals: number[] = [];
    
    for (let i = 1; i < submissions.length; i++) {
      intervals.push(submissions[i] - submissions[i-1]);
    }

    // Détection d'intervalles réguliers suspects
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const regularIntervals = intervals.filter(interval => 
      Math.abs(interval - avgInterval) / avgInterval < 0.1
    );

    const suspicious = regularIntervals.length >= 3 && avgInterval < 300000; // 5 minutes
    const members = suspicious ? bids.slice(0, regularIntervals.length + 1).map(b => b.provider_id) : [];

    return { suspicious, members };
  }

  private analyzeProfileSimilarity(bids: any[]) {
    if (bids.length < 3) return { suspicious: false, members: [] };

    const profiles = bids.map(b => b.provider_profile);
    const similarities: Array<{profiles: number[], similarity: number}> = [];

    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const similarity = this.calculateProfileSimilarity(profiles[i], profiles[j]);
        if (similarity > 0.8) {
          similarities.push({ profiles: [i, j], similarity });
        }
      }
    }

    const suspicious = similarities.length > 0;
    const members = suspicious ? 
      [...new Set(similarities.flatMap(s => s.profiles).map(i => bids[i].provider_id))] : [];

    return { suspicious, members };
  }

  private calculateProfileSimilarity(profile1: any, profile2: any): number {
    let matches = 0;
    let total = 0;

    // Comparaison des compétences
    const skills1 = new Set(profile1.skills || []);
    const skills2 = new Set(profile2.skills || []);
    const skillIntersection = new Set([...skills1].filter(x => skills2.has(x)));
    const skillUnion = new Set([...skills1, ...skills2]);
    
    if (skillUnion.size > 0) {
      matches += skillIntersection.size / skillUnion.size;
      total += 1;
    }

    // Comparaison localisation
    if (profile1.location && profile2.location) {
      matches += profile1.location === profile2.location ? 1 : 0;
      total += 1;
    }

    // Comparaison tarif
    if (profile1.hourly_rate && profile2.hourly_rate) {
      const rateDiff = Math.abs(profile1.hourly_rate - profile2.hourly_rate) / 
        Math.max(profile1.hourly_rate, profile2.hourly_rate);
      matches += rateDiff < 0.1 ? 1 : 0;
      total += 1;
    }

    return total > 0 ? matches / total : 0;
  }

  private calculateMarketThreshold(marketData: any): number {
    const categoryAverages = {
      'web-development': 3000,
      'mobile-development': 5000,
      'design': 1500,
      'marketing': 2000,
      'ai-development': 8000
    };

    const baseThreshold = categoryAverages[marketData.category] || 2500;
    return baseThreshold * 0.6; // 60% du prix moyen = seuil de dumping
  }

  private calculateDumpingScore(bid: any, threshold: number, marketData: any): number {
    if (bid.price >= threshold) return 0;

    const percentBelow = (threshold - bid.price) / threshold;
    let dumpingScore = percentBelow;

    // Facteurs aggravants
    if (bid.provider_profile?.completed_projects > 10) dumpingScore += 0.2; // Expérimenté qui dumpe
    if (bid.proposal?.length < 100) dumpingScore += 0.1; // Proposition bâclée
    if (marketData.competition_level === 'high') dumpingScore += 0.1; // Marché concurrentiel

    return Math.min(dumpingScore, 1.0);
  }

  private getDumpingReasons(bid: any, threshold: number): string[] {
    const reasons = [];
    const percentBelow = ((threshold - bid.price) / threshold * 100).toFixed(0);
    
    reasons.push(`Prix ${percentBelow}% sous le seuil marché`);
    
    if (bid.provider_profile?.completed_projects > 10) {
      reasons.push('Prestataire expérimenté pratiquant des prix anormalement bas');
    }
    
    if (bid.proposal?.length < 100) {
      reasons.push('Proposition insuffisamment détaillée pour le prix proposé');
    }

    return reasons;
  }

  private generateDumpingAnalysis(suspiciousBids: any[], threshold: number): string {
    if (suspiciousBids.length === 0) {
      return 'Aucun dumping détecté. Tous les prix sont dans les normes du marché.';
    }

    const avgDumpingScore = suspiciousBids.reduce((sum, bid) => sum + bid.dumping_score, 0) / suspiciousBids.length;
    const severity = avgDumpingScore > 0.8 ? 'sévère' : avgDumpingScore > 0.6 ? 'modéré' : 'léger';

    return `Dumping ${severity} détecté sur ${suspiciousBids.length} offre(s). ` +
           `Seuil marché: ${threshold}€. Score moyen: ${(avgDumpingScore * 100).toFixed(0)}%.`;
  }

  // Méthodes comportementales

  private calculateBehavioralScore(historicalData: any[]): number {
    if (historicalData.length === 0) return 0.5;

    let score = 0.5;
    
    // Régularité des connexions
    const loginDays = new Set(historicalData
      .filter(d => d.action_type === 'login')
      .map(d => new Date(d.timestamp).toDateString())
    ).size;
    score += Math.min(loginDays / 30, 0.2); // Bonus jusqu'à 0.2

    // Taux de complétion
    const completed = historicalData.filter(d => d.action_type === 'project_completed').length;
    const started = historicalData.filter(d => d.action_type === 'project_started').length;
    if (started > 0) {
      score += (completed / started) * 0.3; // Bonus jusqu'à 0.3
    }

    return Math.min(score, 1.0);
  }

  private detectBehavioralAnomalies(historicalData: any[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Détection de pic d'activité
    const recentActivity = historicalData.filter(d => 
      new Date(d.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    if (recentActivity.length > 50) {
      anomalies.push({
        type: 'activity_spike',
        severity: 'high',
        description: 'Pic d\'activité anormal dans les dernières 24h',
        timestamp: new Date().toISOString(),
        confidence: 0.8
      });
    }

    // Détection de changements de comportement
    const oldBehavior = historicalData.slice(0, historicalData.length / 2);
    const newBehavior = historicalData.slice(historicalData.length / 2);
    
    if (this.detectBehaviorChange(oldBehavior, newBehavior)) {
      anomalies.push({
        type: 'behavior_change',
        severity: 'medium',
        description: 'Changement notable dans les patterns de comportement',
        timestamp: new Date().toISOString(),
        confidence: 0.6
      });
    }

    return anomalies;
  }

  private calculateTrustIndicators(historicalData: any[]): TrustIndicator[] {
    return [
      {
        type: 'account_age',
        value: this.calculateAccountAge(historicalData),
        description: 'Ancienneté du compte',
        weight: 0.2
      },
      {
        type: 'verification_status',
        value: this.getVerificationStatus(historicalData),
        description: 'Statut de vérification',
        weight: 0.3
      },
      {
        type: 'transaction_history',
        value: this.getTransactionScore(historicalData),
        description: 'Historique des transactions',
        weight: 0.3
      },
      {
        type: 'community_reputation',
        value: this.getCommunityScore(historicalData),
        description: 'Réputation communauté',
        weight: 0.2
      }
    ];
  }

  private identifyRiskFactors(historicalData: any[]): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Nouveau compte
    if (this.calculateAccountAge(historicalData) < 30) {
      factors.push({
        factor: 'new_account',
        impact: 0.3,
        description: 'Compte récent avec peu d\'historique',
        mitigation: 'Surveillance renforcée pendant période probatoire'
      });
    }

    // Peu de vérifications
    if (this.getVerificationStatus(historicalData) < 0.5) {
      factors.push({
        factor: 'low_verification',
        impact: 0.4,
        description: 'Niveau de vérification insuffisant',
        mitigation: 'Demander vérifications supplémentaires'
      });
    }

    return factors;
  }

  // Méthodes utilitaires

  private detectSuspiciousActivity(data: any): boolean {
    return data.historical_data.filter(d => 
      new Date(d.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
    ).length > 20; // Plus de 20 actions en 1h
  }

  private detectInconsistentInfo(data: any): boolean {
    const profile = data.context.user_profile || {};
    return profile.location && profile.skills && 
           profile.skills.some(skill => skill.toLowerCase().includes('remote')) &&
           profile.location !== 'Remote';
  }

  private detectAutomatedBehavior(data: any): boolean {
    const actions = data.historical_data.filter(d => d.action_type === 'bid_submitted');
    if (actions.length < 5) return false;
    
    const intervals: number[] = [];
    for (let i = 1; i < actions.length; i++) {
      intervals.push(new Date(actions[i].timestamp).getTime() - new Date(actions[i-1].timestamp).getTime());
    }
    
    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    const variance = intervals.reduce((sum, int) => sum + Math.pow(int - avgInterval, 2), 0) / intervals.length;
    
    return variance < avgInterval * 0.1; // Très faible variance = comportement robotique
  }

  private detectMultipleAccounts(data: any): boolean {
    // Simulation de détection basée sur IP, device fingerprint, etc.
    return Math.random() < 0.05; // 5% de chance de détecter
  }

  private detectBehaviorChange(oldBehavior: any[], newBehavior: any[]): boolean {
    if (oldBehavior.length === 0 || newBehavior.length === 0) return false;
    
    const oldAvgActivity = oldBehavior.length / Math.max(1, this.getTimespanDays(oldBehavior));
    const newAvgActivity = newBehavior.length / Math.max(1, this.getTimespanDays(newBehavior));
    
    return Math.abs(newAvgActivity - oldAvgActivity) / oldAvgActivity > 0.5; // 50% de changement
  }

  private calculateAccountAge(historicalData: any[]): number {
    if (historicalData.length === 0) return 0;
    const firstAction = Math.min(...historicalData.map(d => new Date(d.timestamp).getTime()));
    return (Date.now() - firstAction) / (24 * 60 * 60 * 1000); // Jours
  }

  private getVerificationStatus(historicalData: any[]): number {
    const verifications = historicalData.filter(d => d.action_type === 'verification_completed');
    return Math.min(verifications.length / 3, 1.0); // 3 vérifications = 100%
  }

  private getTransactionScore(historicalData: any[]): number {
    const transactions = historicalData.filter(d => d.action_type === 'payment_received');
    const successful = transactions.filter(t => t.status === 'completed');
    return transactions.length > 0 ? successful.length / transactions.length : 0;
  }

  private getCommunityScore(historicalData: any[]): number {
    const reviews = historicalData.filter(d => d.action_type === 'review_received');
    if (reviews.length === 0) return 0.5;
    return reviews.reduce((sum, r) => sum + (r.rating || 3), 0) / (reviews.length * 5);
  }

  private getTimespanDays(data: any[]): number {
    if (data.length < 2) return 1;
    const timestamps = data.map(d => new Date(d.timestamp).getTime());
    return (Math.max(...timestamps) - Math.min(...timestamps)) / (24 * 60 * 60 * 1000);
  }

  private calculateConfidence(behaviorAnalysis: BehaviorAnalysis, patterns: FraudPattern[]): number {
    let confidence = 0.5;
    
    // Plus d'historique = plus de confiance
    confidence += Math.min(behaviorAnalysis.trust_indicators.length / 10, 0.3);
    
    // Patterns avec faible probabilité de faux positifs = plus de confiance
    const avgFalsePositive = patterns.reduce((sum, p) => sum + p.false_positive_probability, 0) / patterns.length;
    confidence += (1 - avgFalsePositive) * 0.2;
    
    return Math.min(confidence, 0.95);
  }

  private calculateCollusionConfidence(suspiciousGroups: any[]): number {
    if (suspiciousGroups.length === 0) return 0;
    
    const evidenceWeight = {
      'price_coordination': 0.4,
      'timing_coordination': 0.3,
      'profile_similarity': 0.3
    };
    
    let confidence = 0;
    suspiciousGroups.forEach(group => {
      confidence += evidenceWeight[group.type] || 0.2;
    });
    
    return Math.min(confidence, 0.9);
  }

  private fallbackFraudDetection(): FraudDetectionResult {
    return {
      risk_score: 25,
      risk_level: 'low',
      detected_patterns: [],
      recommendations: ['Surveillance normale maintenue'],
      confidence: 0.6,
      requires_action: false
    };
  }
}

export const fraudDetectionEngine = new FraudDetectionEngine();
export type { FraudDetectionResult, FraudPattern, BehaviorAnalysis, Anomaly, TrustIndicator, RiskFactor };
