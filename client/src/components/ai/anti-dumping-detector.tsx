
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  TrendingDown,
  Eye,
  BarChart3,
  Clock,
  Euro,
  Network,
  Brain,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BidPattern {
  providerId: string;
  providerName: string;
  bids: {
    id: string;
    price: number;
    timestamp: Date;
    missionId: string;
    missionBudget: number;
  }[];
  suspiciousActivity: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface CollusionGroup {
  providers: string[];
  evidenceScore: number;
  patterns: string[];
  affectedMissions: string[];
}

interface AntiDumpingDetectorProps {
  missionId: string;
  bids: any[];
  marketPrice: number;
  onSuspiciousActivityDetected?: (detection: any) => void;
}

export default function AntiDumpingDetector({ 
  missionId, 
  bids, 
  marketPrice, 
  onSuspiciousActivityDetected 
}: AntiDumpingDetectorProps) {
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dumpingThreshold, setDumpingThreshold] = useState(0.6); // 60% du prix marché
  const [collusionGroups, setCollusionGroups] = useState<CollusionGroup[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<any>({});

  // Algorithme principal de détection
  const runAntiDumpingAnalysis = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 1. Détection de dumping
    const dumpingAnalysis = detectDumping(bids, marketPrice);
    
    // 2. Détection de collusion
    const collusionAnalysis = detectCollusion(bids);
    
    // 3. Analyse des patterns temporels
    const temporalAnalysis = analyzeTemporalPatterns(bids);
    
    // 4. Calcul des métriques de risque
    const riskAnalysis = calculateRiskMetrics(bids, marketPrice);

    const results = {
      dumping: dumpingAnalysis,
      collusion: collusionAnalysis,
      temporal: temporalAnalysis,
      riskLevel: calculateOverallRisk(dumpingAnalysis, collusionAnalysis),
      recommendations: generateRecommendations(dumpingAnalysis, collusionAnalysis)
    };

    setAnalysisResults(results);
    setCollusionGroups(collusionAnalysis.suspiciousGroups);
    setRiskMetrics(riskAnalysis);
    setIsAnalyzing(false);

    if (results.riskLevel === 'high') {
      onSuspiciousActivityDetected?.(results);
    }
  };

  // Détection de dumping
  const detectDumping = (bids: any[], marketPrice: number) => {
    const dumpingCases = [];
    const suspiciousPrices = [];

    bids.forEach(bid => {
      const priceRatio = bid.price / marketPrice;
      
      if (priceRatio < dumpingThreshold) {
        const severity = priceRatio < 0.4 ? 'severe' : priceRatio < 0.5 ? 'moderate' : 'mild';
        
        dumpingCases.push({
          bidId: bid.id,
          providerId: bid.providerId,
          price: bid.price,
          marketPrice,
          ratio: priceRatio,
          severity,
          reasons: [
            `Prix ${((1 - priceRatio) * 100).toFixed(0)}% en dessous du marché`,
            severity === 'severe' ? 'Dumping critique détecté' : 'Prix potentiellement non viable'
          ]
        });
      }

      if (priceRatio < 0.3) {
        suspiciousPrices.push({
          bidId: bid.id,
          providerId: bid.providerId,
          concern: 'Prix extrêmement bas - viabilité douteuse'
        });
      }
    });

    return {
      detected: dumpingCases.length > 0,
      cases: dumpingCases,
      suspiciousPrices,
      threshold: dumpingThreshold,
      severity: dumpingCases.some(c => c.severity === 'severe') ? 'high' : 
                dumpingCases.some(c => c.severity === 'moderate') ? 'medium' : 'low'
    };
  };

  // Détection de collusion
  const detectCollusion = (bids: any[]) => {
    const suspiciousGroups: CollusionGroup[] = [];
    const patterns = [];

    // Grouper les offres par plages de prix similaires
    const priceGroups = groupBidsByPrice(bids, 0.05); // 5% d'écart
    
    priceGroups.forEach(group => {
      if (group.bids.length >= 3) {
        // Analyser les patterns temporels
        const timePattern = analyzeTimingPattern(group.bids);
        const pricePattern = analyzePricePattern(group.bids);
        
        let evidenceScore = 0;
        const evidencePatterns = [];

        // Offres simultanées (dans les 30 minutes)
        if (timePattern.simultaneousBids >= 2) {
          evidenceScore += 30;
          evidencePatterns.push('Offres quasi-simultanées détectées');
        }

        // Prix anormalement similaires
        if (pricePattern.priceVariance < 0.02) {
          evidenceScore += 25;
          evidencePatterns.push('Prix suspicieusement similaires');
        }

        // Pattern d'enchères décroissantes coordonnées
        if (pricePattern.coordinatedDecline) {
          evidenceScore += 35;
          evidencePatterns.push('Baisse coordonnée des prix');
        }

        if (evidenceScore >= 40) {
          suspiciousGroups.push({
            providers: group.bids.map(b => b.providerId),
            evidenceScore,
            patterns: evidencePatterns,
            affectedMissions: [missionId]
          });
        }
      }
    });

    return {
      detected: suspiciousGroups.length > 0,
      suspiciousGroups,
      patterns,
      confidence: suspiciousGroups.length > 0 ? 
        Math.max(...suspiciousGroups.map(g => g.evidenceScore)) : 0
    };
  };

  // Analyse des patterns temporels
  const analyzeTemporalPatterns = (bids: any[]) => {
    const timeIntervals = [];
    const sortedBids = [...bids].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    for (let i = 1; i < sortedBids.length; i++) {
      const interval = new Date(sortedBids[i].createdAt).getTime() - 
                      new Date(sortedBids[i-1].createdAt).getTime();
      timeIntervals.push(interval / (1000 * 60)); // en minutes
    }

    const avgInterval = timeIntervals.length > 0 ? 
      timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length : 0;

    return {
      averageInterval: avgInterval,
      suspiciouslyFast: timeIntervals.filter(i => i < 5).length, // < 5 minutes
      clusteredBids: identifyTimeClusters(sortedBids),
      patterns: []
    };
  };

  // Calcul des métriques de risque
  const calculateRiskMetrics = (bids: any[], marketPrice: number) => {
    const prices = bids.map(b => b.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const priceSpread = (maxPrice - minPrice) / avgPrice;
    const marketDeviation = Math.abs(avgPrice - marketPrice) / marketPrice;

    return {
      averagePrice: avgPrice,
      priceSpread,
      marketDeviation,
      competitionLevel: bids.length > 10 ? 'high' : bids.length > 5 ? 'medium' : 'low',
      volatility: calculatePriceVolatility(prices)
    };
  };

  // Fonctions utilitaires
  const groupBidsByPrice = (bids: any[], tolerance: number) => {
    const groups = [];
    const processed = new Set();

    bids.forEach(bid => {
      if (processed.has(bid.id)) return;

      const group = {
        averagePrice: bid.price,
        bids: [bid]
      };

      bids.forEach(otherBid => {
        if (otherBid.id !== bid.id && !processed.has(otherBid.id)) {
          const priceDiff = Math.abs(bid.price - otherBid.price) / Math.max(bid.price, otherBid.price);
          if (priceDiff <= tolerance) {
            group.bids.push(otherBid);
          }
        }
      });

      group.bids.forEach(b => processed.add(b.id));
      if (group.bids.length > 1) {
        groups.push(group);
      }
    });

    return groups;
  };

  const analyzeTimingPattern = (bids: any[]) => {
    const timestamps = bids.map(b => new Date(b.createdAt).getTime());
    const simultaneousBids = timestamps.filter((t1, i) => 
      timestamps.some((t2, j) => i !== j && Math.abs(t1 - t2) < 30 * 60 * 1000) // 30 minutes
    ).length;

    return { simultaneousBids };
  };

  const analyzePricePattern = (bids: any[]) => {
    const prices = bids.map(b => b.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const priceVariance = variance / (avgPrice * avgPrice);

    // Détection de baisse coordonnée
    const sortedByTime = [...bids].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    let coordinatedDecline = false;
    if (sortedByTime.length >= 3) {
      const priceChanges = [];
      for (let i = 1; i < sortedByTime.length; i++) {
        priceChanges.push(sortedByTime[i].price - sortedByTime[i-1].price);
      }
      coordinatedDecline = priceChanges.filter(change => change < 0).length >= priceChanges.length * 0.7;
    }

    return { priceVariance, coordinatedDecline };
  };

  const identifyTimeClusters = (sortedBids: any[]) => {
    const clusters = [];
    let currentCluster = [];

    sortedBids.forEach((bid, index) => {
      if (index === 0) {
        currentCluster = [bid];
        return;
      }

      const timeDiff = new Date(bid.createdAt).getTime() - 
                      new Date(sortedBids[index-1].createdAt).getTime();
      
      if (timeDiff < 10 * 60 * 1000) { // 10 minutes
        currentCluster.push(bid);
      } else {
        if (currentCluster.length >= 2) {
          clusters.push(currentCluster);
        }
        currentCluster = [bid];
      }
    });

    if (currentCluster.length >= 2) {
      clusters.push(currentCluster);
    }

    return clusters;
  };

  const calculatePriceVolatility = (prices: number[]) => {
    if (prices.length < 2) return 0;
    
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
    return Math.sqrt(variance) / avg;
  };

  const calculateOverallRisk = (dumpingAnalysis: any, collusionAnalysis: any) => {
    if (dumpingAnalysis.severity === 'high' || collusionAnalysis.confidence > 70) return 'high';
    if (dumpingAnalysis.severity === 'medium' || collusionAnalysis.confidence > 40) return 'medium';
    return 'low';
  };

  const generateRecommendations = (dumpingAnalysis: any, collusionAnalysis: any) => {
    const recommendations = [];

    if (dumpingAnalysis.detected) {
      recommendations.push('Vérifier la viabilité des offres à prix très bas');
      recommendations.push('Demander une justification détaillée des coûts');
    }

    if (collusionAnalysis.detected) {
      recommendations.push('Enquête approfondie sur les prestataires suspects');
      recommendations.push('Vérifier les liens entre les entreprises');
    }

    return recommendations;
  };

  useEffect(() => {
    if (bids.length > 0) {
      runAntiDumpingAnalysis();
    }
  }, [bids, marketPrice]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-6 h-6 mr-2 animate-pulse text-red-600" />
            Analyse Anti-Dumping en cours...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="text-center text-gray-500">
              Détection de patterns suspects...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisResults) return null;

  return (
    <div className="space-y-6">
      {/* Statut global */}
      <Card className={`border-2 ${getRiskColor(analysisResults.riskLevel)}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              Système Anti-Dumping & Anti-Collusion
            </div>
            <Badge className={getRiskColor(analysisResults.riskLevel)}>
              Risque {analysisResults.riskLevel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {analysisResults.dumping.cases.length}
              </div>
              <div className="text-sm text-gray-600">Cas de dumping</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {analysisResults.collusion.suspiciousGroups.length}
              </div>
              <div className="text-sm text-gray-600">Groupes suspects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {riskMetrics.competitionLevel || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Niveau concurrence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerte dumping */}
      {analysisResults.dumping.detected && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-medium text-red-800 mb-2">
              Dumping détecté sur {analysisResults.dumping.cases.length} offre(s)
            </div>
            <div className="space-y-2">
              {analysisResults.dumping.cases.slice(0, 3).map((case_: any, idx: number) => (
                <div key={idx} className="text-sm text-red-700">
                  • Offre {case_.bidId}: {case_.price}€ ({(case_.ratio * 100).toFixed(0)}% du marché)
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerte collusion */}
      {analysisResults.collusion.detected && (
        <Alert className="border-orange-200 bg-orange-50">
          <Users className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-medium text-orange-800 mb-2">
              Collusion potentielle détectée
            </div>
            <div className="space-y-2">
              {analysisResults.collusion.suspiciousGroups.map((group: CollusionGroup, idx: number) => (
                <div key={idx} className="text-sm text-orange-700">
                  • Groupe de {group.providers.length} prestataires (confiance: {group.evidenceScore}%)
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Détails dumping */}
      {analysisResults.dumping.detected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-5 w-5 mr-2 text-red-600" />
              Analyse Dumping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Seuil de dumping:</span>
                <Badge variant="outline">{(dumpingThreshold * 100).toFixed(0)}% du prix marché</Badge>
              </div>
              
              <div className="space-y-3">
                {analysisResults.dumping.cases.map((case_: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-3 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Offre {case_.bidId}</span>
                      <Badge className={`${
                        case_.severity === 'severe' ? 'bg-red-600' : 
                        case_.severity === 'moderate' ? 'bg-orange-500' : 'bg-yellow-500'
                      } text-white`}>
                        {case_.severity}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Prix: {case_.price}€ (marché: {case_.marketPrice}€)</div>
                      <div>Ratio: {(case_.ratio * 100).toFixed(1)}%</div>
                      <ul className="mt-2 space-y-1">
                        {case_.reasons.map((reason: string, reasonIdx: number) => (
                          <li key={reasonIdx} className="text-red-700">• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Détails collusion */}
      {analysisResults.collusion.detected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="w-5 h-5 mr-2 text-orange-600" />
              Analyse Collusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResults.collusion.suspiciousGroups.map((group: CollusionGroup, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Groupe suspect #{idx + 1}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{group.providers.length} prestataires</Badge>
                      <Badge className="bg-orange-600 text-white">
                        {group.evidenceScore}% confiance
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm">Patterns détectés:</span>
                      <ul className="mt-1 space-y-1">
                        {group.patterns.map((pattern, patternIdx) => (
                          <li key={patternIdx} className="text-sm text-orange-700">
                            • {pattern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Progress value={group.evidenceScore} className="mt-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommandations */}
      {analysisResults.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-600" />
              Recommandations IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisResults.recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques du marché */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
            Métriques du Marché
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{riskMetrics.averagePrice?.toFixed(0)}€</div>
              <div className="text-sm text-gray-600">Prix moyen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(riskMetrics.priceSpread * 100)?.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Écart prix</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(riskMetrics.volatility * 100)?.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Volatilité</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{bids.length}</div>
              <div className="text-sm text-gray-600">Offres totales</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
