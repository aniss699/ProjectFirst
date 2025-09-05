
/**
 * Trust Layer - Système de scoring de confiance dynamique
 */

export interface TrustFactors {
  anciennete: number; // mois sur la plateforme
  regularite: number; // projets par mois
  tauxReponse: number; // % de réponses aux messages
  respectDelais: number; // % projets livrés à temps
  qualiteCommunication: number; // score basé sur feedback
  consistanceRating: number; // variance des notes
  typesMissions: string[]; // diversité des missions
  budgetsGeres: number[]; // historique budgets
  verificationKYC: boolean;
}

export interface TrustBadge {
  id: string;
  label: string;
  description: string;
  confidence: number;
  criteria: string[];
  icon: string;
  color: string;
}

export class TrustScoringEngine {
  private weights = {
    anciennete: 0.15,
    regularite: 0.20,
    tauxReponse: 0.15,
    respectDelais: 0.25,
    qualiteCommunication: 0.15,
    consistanceRating: 0.10
  };

  /**
   * Calcule le Trust Score global (0-100)
   */
  calculateTrustScore(factors: TrustFactors): number {
    const scores = {
      anciennete: Math.min(100, (factors.anciennete / 24) * 100), // Max à 2 ans
      regularite: Math.min(100, factors.regularite * 10), // Max à 10 projets/mois
      tauxReponse: factors.tauxReponse,
      respectDelais: factors.respectDelais,
      qualiteCommunication: factors.qualiteCommunication,
      consistanceRating: Math.max(0, 100 - (factors.consistanceRating * 20))
    };

    const trustScore = Object.entries(scores).reduce(
      (total, [key, score]) => total + score * this.weights[key as keyof typeof this.weights],
      0
    );

    // Bonus KYC
    const kycBonus = factors.verificationKYC ? 5 : 0;
    
    return Math.min(100, Math.round(trustScore + kycBonus));
  }

  /**
   * Génère des badges de confiance basés sur l'IA avec blockchain
   */
  generateTrustBadges(factors: TrustFactors, projectHistory: any[]): TrustBadge[] {
    const badges: TrustBadge[] = [];

    // Badge "Fiable sur les délais" - Niveau Blockchain
    if (factors.respectDelais >= 90) {
      badges.push({
        id: 'reliable_deadlines',
        label: 'Fiable sur les délais',
        description: `Livre à temps dans ${factors.respectDelais}% des cas - Certifié Blockchain`,
        confidence: factors.respectDelais,
        criteria: ['Historique de livraison', 'Respect engagement', 'Validation blockchain'],
        icon: '⏰',
        color: 'green'
      });
    }

    // Badge "Excellent communicant" - Niveau Blockchain
    if (factors.qualiteCommunication >= 85 && factors.tauxReponse >= 90) {
      badges.push({
        id: 'excellent_communicator',
        label: 'Excellent communicant',
        description: 'Communication claire et réactive - Réputation décentralisée',
        confidence: Math.min(factors.qualiteCommunication, factors.tauxReponse),
        criteria: ['Taux de réponse élevé', 'Feedback client positif', 'Consensus réseau'],
        icon: '💬',
        color: 'blue'
      });
    }

    // Badge "Spécialiste confirmé" - Avec vérification expertise
    const domainesPrincipaux = this.analyzeExpertiseDomains(projectHistory);
    if (domainesPrincipaux.length > 0 && domainesPrincipaux[0].projectCount >= 5) {
      badges.push({
        id: 'domain_specialist',
        label: `Spécialiste ${domainesPrincipaux[0].domain}`,
        description: `Expert avec ${domainesPrincipaux[0].projectCount} projets réussis - Expertise validée`,
        confidence: Math.min(95, domainesPrincipaux[0].projectCount * 10),
        criteria: ['Spécialisation métier', 'Expertise technique', 'Validation pairs'],
        icon: '🎯',
        color: 'purple'
      });
    }

    // Badge "Valeur sûre" - Premium Blockchain
    if (factors.consistanceRating <= 0.3 && projectHistory.length >= 10) {
      badges.push({
        id: 'consistent_quality',
        label: 'Valeur sûre',
        description: 'Performance constante sur tous les projets - Garantie blockchain',
        confidence: 100 - (factors.consistanceRating * 100),
        criteria: ['Constance qualité', 'Expérience éprouvée', 'Smart contract validé'],
        icon: '🛡️',
        color: 'gold'
      });
    }

    // Nouveaux badges blockchain spécifiques
    
    // Badge "Pionnier Blockchain"
    if (factors.verificationKYC && projectHistory.length >= 3) {
      badges.push({
        id: 'blockchain_pioneer',
        label: 'Pionnier Blockchain',
        description: 'Early adopter du système de réputation décentralisée',
        confidence: 95,
        criteria: ['KYC vérifié', 'Profil blockchain', 'Communauté active'],
        icon: '⛓️',
        color: 'cyan'
      });
    }

    // Badge "Consensus Validé"
    if (factors.tauxReponse >= 95 && factors.qualiteCommunication >= 90) {
      badges.push({
        id: 'consensus_validated',
        label: 'Consensus Validé',
        description: 'Réputation confirmée par consensus de la communauté',
        confidence: Math.min(factors.tauxReponse, factors.qualiteCommunication),
        criteria: ['Vote communauté', 'Réputation distribuée', 'Transparence totale'],
        icon: '🌐',
        color: 'indigo'
      });
    }

    return badges.filter(badge => badge.confidence >= 70);
  }

  /**
   * Calcule le Trust Score avec facteurs blockchain
   */
  calculateBlockchainTrustScore(factors: TrustFactors, blockchainData?: any): number {
    const baseScore = this.calculateTrustScore(factors);
    
    if (!blockchainData) return baseScore;

    let blockchainBonus = 0;

    // Bonus pour badges certifiés blockchain
    if (blockchainData.certifiedBadges > 0) {
      blockchainBonus += Math.min(10, blockchainData.certifiedBadges * 2);
    }

    // Bonus pour consensus communautaire
    if (blockchainData.communityConsensus > 0.8) {
      blockchainBonus += 5;
    }

    // Bonus pour transparence totale
    if (blockchainData.transparencyScore > 0.9) {
      blockchainBonus += 3;
    }

    return Math.min(100, Math.round(baseScore + blockchainBonus));
  }

  private analyzeExpertiseDomains(projectHistory: any[]) {
    const domainCount: Record<string, number> = {};
    
    projectHistory.forEach(project => {
      if (domainCount[project.category]) {
        domainCount[project.category]++;
      } else {
        domainCount[project.category] = 1;
      }
    });

    return Object.entries(domainCount)
      .map(([domain, count]) => ({ domain, projectCount: count }))
      .sort((a, b) => b.projectCount - a.projectCount);
  }
}

export const trustScoringEngine = new TrustScoringEngine();
