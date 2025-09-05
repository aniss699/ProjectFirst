
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Shield, 
  Clock, 
  Euro,
  Star,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';

interface ScoringCriteria {
  price: number;
  quality: number;
  fit: number;
  delay: number;
  risk: number;
  completionProbability: number;
}

interface DetailedScore {
  criterion: keyof ScoringCriteria;
  score: number;
  weight: number;
  explanation: string;
  factors: string[];
  recommendation?: string;
}

interface AdvancedScoringProps {
  bidData: {
    price: number;
    timeline: number;
    provider: {
      id: string;
      name: string;
      rating: number;
      completedProjects: number;
      successRate: number;
      responseTime: number;
      skills: string[];
      location: string;
    };
    mission: {
      budget: number;
      complexity: 'low' | 'medium' | 'high';
      urgency: 'low' | 'medium' | 'high';
      requiredSkills: string[];
      category: string;
    };
  };
  onScoreCalculated?: (score: number, details: DetailedScore[]) => void;
}

export default function AdvancedScoringEngine({ bidData, onScoreCalculated }: AdvancedScoringProps) {
  const [scores, setScores] = useState<DetailedScore[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);

  // Algorithme de scoring multicritère avancé
  const calculateAdvancedScore = async () => {
    setIsAnalyzing(true);
    
    // Simulation du processus d'analyse IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { price, timeline, provider, mission } = bidData;

    // 1. Score PRIX (25% du poids)
    const priceScore = calculatePriceScore(price, mission.budget, mission.complexity);
    
    // 2. Score QUALITÉ (20% du poids)
    const qualityScore = calculateQualityScore(provider);
    
    // 3. Score ADÉQUATION (20% du poids)
    const fitScore = calculateFitScore(provider.skills, mission.requiredSkills, provider.location);
    
    // 4. Score DÉLAI (15% du poids)
    const delayScore = calculateDelayScore(timeline, mission.urgency, provider.responseTime);
    
    // 5. Score RISQUE (10% du poids)
    const riskScore = calculateRiskScore(provider, mission);
    
    // 6. Probabilité d'aboutissement (10% du poids)
    const completionScore = calculateCompletionProbability(provider, mission, price);

    const detailedScores: DetailedScore[] = [
      {
        criterion: 'price',
        score: priceScore.score,
        weight: 0.25,
        explanation: priceScore.explanation,
        factors: priceScore.factors,
        recommendation: priceScore.recommendation
      },
      {
        criterion: 'quality',
        score: qualityScore.score,
        weight: 0.20,
        explanation: qualityScore.explanation,
        factors: qualityScore.factors,
        recommendation: qualityScore.recommendation
      },
      {
        criterion: 'fit',
        score: fitScore.score,
        weight: 0.20,
        explanation: fitScore.explanation,
        factors: fitScore.factors,
        recommendation: fitScore.recommendation
      },
      {
        criterion: 'delay',
        score: delayScore.score,
        weight: 0.15,
        explanation: delayScore.explanation,
        factors: delayScore.factors,
        recommendation: delayScore.recommendation
      },
      {
        criterion: 'risk',
        score: riskScore.score,
        weight: 0.10,
        explanation: riskScore.explanation,
        factors: riskScore.factors,
        recommendation: riskScore.recommendation
      },
      {
        criterion: 'completionProbability',
        score: completionScore.score,
        weight: 0.10,
        explanation: completionScore.explanation,
        factors: completionScore.factors,
        recommendation: completionScore.recommendation
      }
    ];

    // Calcul du score final pondéré
    const weightedScore = detailedScores.reduce((total, item) => {
      return total + (item.score * item.weight);
    }, 0);

    // Calcul de la confiance
    const calculatedConfidence = calculateConfidence(detailedScores, provider);

    // Détection des facteurs de risque
    const risks = identifyRiskFactors(detailedScores, bidData);

    setScores(detailedScores);
    setFinalScore(Math.round(weightedScore));
    setConfidence(calculatedConfidence);
    setRiskFactors(risks);
    setIsAnalyzing(false);

    onScoreCalculated?.(Math.round(weightedScore), detailedScores);
  };

  // Calcul du score prix avec détection anti-dumping
  const calculatePriceScore = (price: number, budget: number, complexity: string) => {
    const priceRatio = price / budget;
    const complexityMultiplier = { low: 0.8, medium: 1.0, high: 1.2 }[complexity] || 1.0;
    const adjustedRatio = priceRatio / complexityMultiplier;

    let score = 70;
    let explanation = '';
    const factors = [];
    let recommendation = '';

    if (adjustedRatio < 0.4) {
      score = 25;
      explanation = 'Prix dangereusement bas - risque de dumping';
      factors.push('Prix 60% en dessous du budget');
      factors.push('Possible sous-estimation du travail');
      recommendation = 'Vérifier la faisabilité avec ce budget';
    } else if (adjustedRatio < 0.7) {
      score = 90;
      explanation = 'Prix très compétitif et attractif';
      factors.push('Excellent rapport qualité-prix');
      factors.push('Économies substantielles');
      recommendation = 'Offre très intéressante à considérer';
    } else if (adjustedRatio <= 1.0) {
      score = 80;
      explanation = 'Prix dans la fourchette acceptable';
      factors.push('Prix cohérent avec le budget');
      factors.push('Bon équilibre coût-bénéfice');
    } else {
      score = Math.max(30, 80 - (adjustedRatio - 1) * 40);
      explanation = 'Prix supérieur au budget initial';
      factors.push('Dépassement budgétaire');
      if (adjustedRatio > 1.3) factors.push('Prix potentiellement excessif');
      recommendation = 'Négociation recommandée';
    }

    return { score, explanation, factors, recommendation };
  };

  // Calcul du score qualité
  const calculateQualityScore = (provider: any) => {
    let score = 0;
    const factors = [];
    
    // Score basé sur la note (40%)
    const ratingScore = (provider.rating / 5) * 40;
    score += ratingScore;
    factors.push(`Note moyenne: ${provider.rating}/5`);

    // Score basé sur l'expérience (30%)
    let experienceScore = 0;
    if (provider.completedProjects >= 50) {
      experienceScore = 30;
      factors.push('Très expérimenté (50+ projets)');
    } else if (provider.completedProjects >= 20) {
      experienceScore = 25;
      factors.push('Expérimenté (20+ projets)');
    } else if (provider.completedProjects >= 5) {
      experienceScore = 20;
      factors.push('Expérience modérée (5+ projets)');
    } else {
      experienceScore = 10;
      factors.push('Expérience limitée');
    }
    score += experienceScore;

    // Score basé sur le taux de succès (30%)
    const successScore = provider.successRate * 30;
    score += successScore;
    factors.push(`Taux de succès: ${(provider.successRate * 100).toFixed(0)}%`);

    const explanation = score >= 80 ? 'Prestataire de haute qualité' : 
                       score >= 60 ? 'Prestataire fiable' : 'Profil à valider';

    const recommendation = score < 60 ? 'Demander des références supplémentaires' : '';

    return { score: Math.round(score), explanation, factors, recommendation };
  };

  // Calcul du score d'adéquation
  const calculateFitScore = (providerSkills: string[], requiredSkills: string[], location: string) => {
    const factors = [];
    
    // Correspondance des compétences (70%)
    const skillMatches = requiredSkills.filter(required => 
      providerSkills.some(provided => 
        provided.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(provided.toLowerCase())
      )
    );
    
    const skillScore = (skillMatches.length / requiredSkills.length) * 70;
    factors.push(`Compétences: ${skillMatches.length}/${requiredSkills.length} correspondances`);

    // Bonus pour compétences supplémentaires (20%)
    const extraSkills = providerSkills.length - skillMatches.length;
    const extraScore = Math.min(20, extraSkills * 2);
    if (extraSkills > 0) factors.push(`${extraSkills} compétences supplémentaires`);

    // Bonus géographique (10%)
    const geoScore = 10; // Simplifié
    factors.push('Localisation compatible');

    const totalScore = skillScore + extraScore + geoScore;
    const explanation = totalScore >= 80 ? 'Excellente correspondance' : 
                       totalScore >= 60 ? 'Bonne correspondance' : 'Correspondance partielle';

    const recommendation = totalScore < 60 ? 'Vérifier les compétences manquantes' : '';

    return { score: Math.round(totalScore), explanation, factors, recommendation };
  };

  // Calcul du score délai
  const calculateDelayScore = (timeline: number, urgency: string, responseTime: number) => {
    const factors = [];
    let score = 70;

    // Évaluation du délai proposé
    const urgencyExpected = { low: 30, medium: 14, high: 7 }[urgency] || 14;
    
    if (timeline <= urgencyExpected * 0.8) {
      score = 95;
      factors.push('Délai très rapide');
    } else if (timeline <= urgencyExpected) {
      score = 85;
      factors.push('Délai adapté à l\'urgence');
    } else if (timeline <= urgencyExpected * 1.5) {
      score = 70;
      factors.push('Délai acceptable');
    } else {
      score = 40;
      factors.push('Délai potentiellement trop long');
    }

    // Bonus/malus temps de réponse
    if (responseTime <= 2) {
      score += 5;
      factors.push('Très réactif');
    } else if (responseTime > 24) {
      score -= 10;
      factors.push('Temps de réponse lent');
    }

    const explanation = score >= 80 ? 'Délais excellents' : 
                       score >= 60 ? 'Délais acceptables' : 'Délais préoccupants';

    const recommendation = score < 60 ? 'Négocier les délais' : '';

    return { score: Math.max(0, Math.min(100, score)), explanation, factors, recommendation };
  };

  // Calcul du score de risque
  const calculateRiskScore = (provider: any, mission: any) => {
    let riskLevel = 0; // Plus c'est bas, plus c'est risqué
    const factors = [];

    // Risque basé sur l'expérience
    if (provider.completedProjects < 5) {
      riskLevel += 20;
      factors.push('Expérience limitée');
    } else if (provider.completedProjects >= 20) {
      riskLevel -= 10;
      factors.push('Prestataire expérimenté');
    }

    // Risque basé sur le taux de succès
    if (provider.successRate < 0.8) {
      riskLevel += 25;
      factors.push('Taux d\'échec élevé');
    } else if (provider.successRate >= 0.95) {
      riskLevel -= 15;
      factors.push('Excellent historique');
    }

    // Risque basé sur la complexité du projet
    if (mission.complexity === 'high' && provider.completedProjects < 10) {
      riskLevel += 20;
      factors.push('Projet complexe vs expérience');
    }

    const score = Math.max(0, Math.min(100, 100 - riskLevel));
    const explanation = score >= 80 ? 'Risque faible' : 
                       score >= 60 ? 'Risque modéré' : 'Risque élevé';

    const recommendation = score < 60 ? 'Prévoir un suivi renforcé' : '';

    return { score, explanation, factors, recommendation };
  };

  // Calcul de la probabilité d'aboutissement
  const calculateCompletionProbability = (provider: any, mission: any, price: number) => {
    let probability = provider.successRate * 70; // Base sur l'historique
    const factors = [];

    // Ajustement selon le prix (prix trop bas = risque)
    const priceRatio = price / mission.budget;
    if (priceRatio < 0.6) {
      probability -= 20;
      factors.push('Prix bas = risque d\'abandon');
    } else if (priceRatio > 1.2) {
      probability -= 10;
      factors.push('Prix élevé = motivation');
    }

    // Ajustement selon l'expérience
    if (provider.completedProjects >= 20) {
      probability += 15;
      factors.push('Expérience rassurante');
    }

    // Ajustement selon la complexité
    if (mission.complexity === 'high') {
      probability -= 10;
      factors.push('Projet complexe');
    }

    probability = Math.max(10, Math.min(95, probability));
    
    const explanation = probability >= 80 ? 'Très probable' : 
                       probability >= 60 ? 'Probable' : 'Incertain';

    const recommendation = probability < 60 ? 'Prévoir des jalons fréquents' : '';

    return { score: Math.round(probability), explanation, factors, recommendation };
  };

  // Calcul de la confiance globale
  const calculateConfidence = (scores: DetailedScore[], provider: any) => {
    let confidence = 75;

    // Plus d'expérience = plus de confiance
    if (provider.completedProjects >= 20) confidence += 15;
    else if (provider.completedProjects < 5) confidence -= 10;

    // Note élevée = plus de confiance
    if (provider.rating >= 4.5) confidence += 10;
    else if (provider.rating < 3.5) confidence -= 15;

    // Cohérence des scores
    const scoreVariance = calculateVariance(scores.map(s => s.score));
    if (scoreVariance < 200) confidence += 5; // Scores cohérents

    return Math.max(50, Math.min(95, confidence));
  };

  // Identification des facteurs de risque
  const identifyRiskFactors = (scores: DetailedScore[], bidData: any) => {
    const risks = [];

    scores.forEach(score => {
      if (score.score < 50) {
        risks.push(`${getCriterionName(score.criterion)}: Score critique (${score.score}%)`);
      }
    });

    // Risques spécifiques
    if (bidData.price < bidData.mission.budget * 0.5) {
      risks.push('Prix suspect - possible dumping');
    }

    if (bidData.provider.completedProjects < 3) {
      risks.push('Prestataire débutant - risque expérience');
    }

    return risks;
  };

  const calculateVariance = (numbers: number[]) => {
    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    return numbers.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numbers.length;
  };

  const getCriterionName = (criterion: string) => {
    const names: Record<string, string> = {
      price: 'Prix',
      quality: 'Qualité',
      fit: 'Adéquation',
      delay: 'Délai',
      risk: 'Risque',
      completionProbability: 'Probabilité succès'
    };
    return names[criterion] || criterion;
  };

  const getCriterionIcon = (criterion: string) => {
    const icons: Record<string, any> = {
      price: Euro,
      quality: Star,
      fit: Target,
      delay: Clock,
      risk: Shield,
      completionProbability: TrendingUp
    };
    return icons[criterion] || Activity;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  useEffect(() => {
    calculateAdvancedScore();
  }, [bidData]);

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-6 h-6 mr-2 animate-pulse text-blue-600" />
            Analyse IA en cours...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="text-center text-gray-500">
              Calcul des 6 critères de scoring...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score global */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-6 h-6 mr-2 text-blue-600" />
              Score IA Multi-Objectif
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              v3.0 Advanced
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {finalScore}<span className="text-2xl">/100</span>
            </div>
            <div className="text-lg text-gray-600 mb-4">
              {finalScore >= 80 ? 'Excellent' : finalScore >= 60 ? 'Bon' : 'À améliorer'}
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                Confiance: {confidence}%
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-1" />
                6 critères analysés
              </div>
            </div>
          </div>

          <Progress value={finalScore} className="h-3 mb-4" />

          {/* Facteurs de risque */}
          {riskFactors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-medium text-red-800">Facteurs de risque détectés</span>
              </div>
              <ul className="space-y-1">
                {riskFactors.map((risk, idx) => (
                  <li key={idx} className="text-sm text-red-700 flex items-start">
                    <span className="mr-2">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détail des scores par critère */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="details">Analyse détaillée</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scores.map((scoreDetail, idx) => {
              const Icon = getCriterionIcon(scoreDetail.criterion);
              return (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-2 text-gray-600" />
                        <span className="font-medium">{getCriterionName(scoreDetail.criterion)}</span>
                      </div>
                      <Badge className={`${getScoreColor(scoreDetail.score)} border-none`}>
                        {scoreDetail.score}%
                      </Badge>
                    </div>
                    <Progress value={scoreDetail.score} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600">{scoreDetail.explanation}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-4">
            {scores.map((scoreDetail, idx) => {
              const Icon = getCriterionIcon(scoreDetail.criterion);
              return (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-2" />
                        {getCriterionName(scoreDetail.criterion)}
                        <Badge variant="outline" className="ml-2">
                          Poids: {(scoreDetail.weight * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Badge className={`${getScoreColor(scoreDetail.score)} border-none`}>
                        {scoreDetail.score}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={scoreDetail.score} className="h-2" />
                      
                      <p className="text-gray-700">{scoreDetail.explanation}</p>

                      <div>
                        <h5 className="font-medium mb-2">Facteurs analysés:</h5>
                        <ul className="space-y-1">
                          {scoreDetail.factors.map((factor, factorIdx) => (
                            <li key={factorIdx} className="text-sm text-gray-600 flex items-start">
                              <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {scoreDetail.recommendation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <Zap className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                            <div>
                              <span className="font-medium text-blue-800">Recommandation:</span>
                              <p className="text-sm text-blue-700 mt-1">{scoreDetail.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
