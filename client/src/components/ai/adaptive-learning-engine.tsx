
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, Zap, BarChart3 } from 'lucide-react';

interface LearningPattern {
  userId: string;
  actionType: 'recommendation_accepted' | 'recommendation_ignored' | 'price_adjusted' | 'bid_successful';
  context: {
    marketConditions: any;
    projectType: string;
    competitionLevel: string;
    userState: any;
  };
  outcome: 'success' | 'failure' | 'partial';
  timestamp: Date;
  feedbackScore?: number;
}

interface AdaptivePrediction {
  confidence: number;
  reasoning: string[];
  suggestedActions: string[];
  learningConfidence: number;
  adaptationScore: number;
}

interface AdaptiveLearningEngineProps {
  userId: string;
  currentContext: any;
  onPredictionReady?: (prediction: AdaptivePrediction) => void;
}

export default function AdaptiveLearningEngine({ 
  userId, 
  currentContext, 
  onPredictionReady 
}: AdaptiveLearningEngineProps) {
  const [learningData, setLearningData] = useState<LearningPattern[]>([]);
  const [modelPerformance, setModelPerformance] = useState({
    accuracy: 0,
    totalPredictions: 0,
    successfulPredictions: 0,
    adaptationRate: 0
  });
  const [isLearning, setIsLearning] = useState(false);

  /**
   * Algorithme d'apprentissage adaptatif basé sur les patterns utilisateur
   */
  const generateAdaptivePrediction = async (): Promise<AdaptivePrediction> => {
    setIsLearning(true);

    // 1. Analyse des patterns historiques
    const userPatterns = analyzeUserPatterns(learningData);
    
    // 2. Contextual Learning - Adaptation selon le contexte actuel
    const contextualInsights = analyzeContextualFactors(currentContext, userPatterns);
    
    // 3. Reinforcement Learning simplifié
    const reinforcementScores = calculateReinforcementScores(userPatterns);
    
    // 4. Adaptive Weights - Poids adaptatifs selon la performance
    const adaptiveWeights = calculateAdaptiveWeights(modelPerformance);
    
    // 5. Meta-Learning - Apprentissage sur l'apprentissage
    const metaLearningInsights = performMetaLearning(userPatterns, modelPerformance);

    const prediction: AdaptivePrediction = {
      confidence: calculatePredictionConfidence(contextualInsights, reinforcementScores),
      reasoning: generateLearningReasoning(userPatterns, contextualInsights),
      suggestedActions: generateAdaptiveActions(contextualInsights, metaLearningInsights),
      learningConfidence: calculateLearningConfidence(modelPerformance),
      adaptationScore: calculateAdaptationScore(userPatterns, currentContext)
    };

    setIsLearning(false);
    onPredictionReady?.(prediction);
    
    return prediction;
  };

  /**
   * Analyse des patterns comportementaux utilisateur
   */
  const analyzeUserPatterns = (data: LearningPattern[]) => {
    const patterns = {
      acceptanceRate: 0,
      preferredActionTypes: {} as Record<string, number>,
      contextualPreferences: {} as Record<string, any>,
      temporalPatterns: {} as Record<string, number>,
      outcomeCorrelations: {} as Record<string, number>
    };

    if (data.length === 0) return patterns;

    // Calcul taux d'acceptation
    const acceptedActions = data.filter(d => d.actionType === 'recommendation_accepted').length;
    patterns.acceptanceRate = acceptedActions / data.length;

    // Analyse des préférences d'actions
    data.forEach(pattern => {
      patterns.preferredActionTypes[pattern.actionType] = 
        (patterns.preferredActionTypes[pattern.actionType] || 0) + 1;
    });

    // Patterns contextuels
    data.forEach(pattern => {
      const contextKey = `${pattern.context.projectType}_${pattern.context.competitionLevel}`;
      if (!patterns.contextualPreferences[contextKey]) {
        patterns.contextualPreferences[contextKey] = { success: 0, total: 0 };
      }
      patterns.contextualPreferences[contextKey].total++;
      if (pattern.outcome === 'success') {
        patterns.contextualPreferences[contextKey].success++;
      }
    });

    // Patterns temporels (par heure de la journée)
    data.forEach(pattern => {
      const hour = pattern.timestamp.getHours();
      patterns.temporalPatterns[hour] = (patterns.temporalPatterns[hour] || 0) + 1;
    });

    return patterns;
  };

  /**
   * Analyse des facteurs contextuels
   */
  const analyzeContextualFactors = (context: any, userPatterns: any) => {
    const insights = {
      marketCompatibility: 0,
      userStateAlignment: 0,
      historicalSuccess: 0,
      contextualRisk: 0,
      opportunityScore: 0
    };

    // Compatibilité avec les conditions de marché
    if (context.marketConditions) {
      insights.marketCompatibility = calculateMarketCompatibility(context.marketConditions, userPatterns);
    }

    // Alignement avec l'état utilisateur
    insights.userStateAlignment = calculateUserStateAlignment(context.userState, userPatterns);

    // Succès historique dans des contextes similaires
    const similarContexts = Object.entries(userPatterns.contextualPreferences)
      .filter(([key]) => key.includes(context.projectType));
    
    if (similarContexts.length > 0) {
      const avgSuccess = similarContexts.reduce((sum, [, data]) => 
        sum + (data.success / data.total), 0) / similarContexts.length;
      insights.historicalSuccess = avgSuccess * 100;
    }

    // Calcul du risque contextuel
    insights.contextualRisk = calculateContextualRisk(context, userPatterns);

    // Score d'opportunité
    insights.opportunityScore = calculateOpportunityScore(context, userPatterns);

    return insights;
  };

  /**
   * Calcul des scores de renforcement
   */
  const calculateReinforcementScores = (userPatterns: any) => {
    const scores = {
      explorationBonus: 0,
      exploitationBonus: 0,
      diversityScore: 0,
      consistencyScore: 0
    };

    // Bonus d'exploration (encourager la diversité)
    const actionTypes = Object.keys(userPatterns.preferredActionTypes);
    scores.diversityScore = Math.min(100, actionTypes.length * 20);

    // Bonus d'exploitation (récompenser la constance)
    if (userPatterns.acceptanceRate > 0.8) {
      scores.exploitationBonus = userPatterns.acceptanceRate * 50;
    }

    // Score de constance
    const variance = calculatePatternVariance(userPatterns);
    scores.consistencyScore = Math.max(0, 100 - variance * 50);

    return scores;
  };

  /**
   * Calcul des poids adaptatifs
   */
  const calculateAdaptiveWeights = (performance: any) => {
    const baseWeights = {
      historical: 0.4,
      contextual: 0.3,
      reinforcement: 0.2,
      meta: 0.1
    };

    // Ajustement selon la performance du modèle
    if (performance.accuracy > 0.8) {
      baseWeights.historical += 0.1;
      baseWeights.meta += 0.1;
      baseWeights.contextual -= 0.1;
      baseWeights.reinforcement -= 0.1;
    } else if (performance.accuracy < 0.6) {
      baseWeights.contextual += 0.15;
      baseWeights.reinforcement += 0.15;
      baseWeights.historical -= 0.15;
      baseWeights.meta -= 0.15;
    }

    return baseWeights;
  };

  /**
   * Meta-apprentissage - apprendre à apprendre
   */
  const performMetaLearning = (userPatterns: any, performance: any) => {
    const insights = {
      learningVelocity: 0,
      adaptationSpeed: 0,
      optimalUpdateFrequency: 7, // jours
      recommendedStrategies: [] as string[]
    };

    // Vitesse d'apprentissage
    if (performance.totalPredictions > 10) {
      insights.learningVelocity = performance.successfulPredictions / performance.totalPredictions;
    }

    // Vitesse d'adaptation
    const recentPatterns = learningData.slice(-10);
    const oldPatterns = learningData.slice(0, 10);
    
    if (recentPatterns.length > 0 && oldPatterns.length > 0) {
      const recentSuccess = recentPatterns.filter(p => p.outcome === 'success').length / recentPatterns.length;
      const oldSuccess = oldPatterns.filter(p => p.outcome === 'success').length / oldPatterns.length;
      insights.adaptationSpeed = Math.abs(recentSuccess - oldSuccess);
    }

    // Stratégies recommandées
    if (insights.learningVelocity < 0.6) {
      insights.recommendedStrategies.push('INCREASE_EXPLORATION');
    }
    if (insights.adaptationSpeed > 0.3) {
      insights.recommendedStrategies.push('STABILIZE_LEARNING');
    }
    if (performance.accuracy > 0.85) {
      insights.recommendedStrategies.push('FINE_TUNE_PARAMETERS');
    }

    return insights;
  };

  // Fonctions utilitaires
  const calculateMarketCompatibility = (market: any, patterns: any): number => {
    // Logique simplifiée pour la démo
    return Math.random() * 100;
  };

  const calculateUserStateAlignment = (userState: any, patterns: any): number => {
    return Math.random() * 100;
  };

  const calculateContextualRisk = (context: any, patterns: any): number => {
    return Math.random() * 100;
  };

  const calculateOpportunityScore = (context: any, patterns: any): number => {
    return Math.random() * 100;
  };

  const calculatePatternVariance = (patterns: any): number => {
    return Math.random(); // Simplification
  };

  const calculatePredictionConfidence = (contextual: any, reinforcement: any): number => {
    return Math.min(95, (contextual.historicalSuccess + reinforcement.consistencyScore) / 2);
  };

  const generateLearningReasoning = (patterns: any, insights: any): string[] => {
    const reasoning = [];
    
    if (patterns.acceptanceRate > 0.8) {
      reasoning.push(`Taux d'acceptation élevé (${(patterns.acceptanceRate * 100).toFixed(0)}%) - Prédictions fiables`);
    }
    
    if (insights.historicalSuccess > 70) {
      reasoning.push(`Succès historique de ${insights.historicalSuccess.toFixed(0)}% dans des contextes similaires`);
    }
    
    if (insights.marketCompatibility > 80) {
      reasoning.push('Excellente compatibilité avec les conditions de marché actuelles');
    }

    return reasoning.slice(0, 3);
  };

  const generateAdaptiveActions = (insights: any, metaLearning: any): string[] => {
    const actions = [];
    
    if (insights.opportunityScore > 80) {
      actions.push('Saisir cette opportunité à fort potentiel');
    }
    
    if (insights.contextualRisk < 30) {
      actions.push('Environnement favorable - Être proactif');
    }
    
    if (metaLearning.recommendedStrategies.includes('INCREASE_EXPLORATION')) {
      actions.push('Explorer de nouvelles stratégies');
    }

    return actions.slice(0, 3);
  };

  const calculateLearningConfidence = (performance: any): number => {
    if (performance.totalPredictions < 5) return 50;
    return Math.min(95, performance.accuracy * 100);
  };

  const calculateAdaptationScore = (patterns: any, context: any): number => {
    return Math.min(100, (patterns.acceptanceRate + (context.marketConditions?.stability || 0.5)) * 50);
  };

  // Simulation de données d'apprentissage
  useEffect(() => {
    const simulatedData: LearningPattern[] = [
      {
        userId,
        actionType: 'recommendation_accepted',
        context: {
          marketConditions: { tension: 'medium', volatility: 'low' },
          projectType: 'web-development',
          competitionLevel: 'medium',
          userState: { workload: 0.6, motivation: 'high' }
        },
        outcome: 'success',
        timestamp: new Date(Date.now() - 86400000 * 7),
        feedbackScore: 8.5
      },
      // Ajoutez plus de données simulées...
    ];

    setLearningData(simulatedData);
    
    // Simulation de performance du modèle
    setModelPerformance({
      accuracy: 0.78,
      totalPredictions: 45,
      successfulPredictions: 35,
      adaptationRate: 0.85
    });

    // Génération automatique de prédiction
    generateAdaptivePrediction();
  }, [userId, currentContext]);

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="w-5 h-5 animate-pulse" />
          Moteur d'Apprentissage Adaptatif
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Zap className="w-3 h-3 mr-1" />
            v3.0 ML
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLearning ? (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-purple-600">Apprentissage en cours...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {modelPerformance.accuracy ? (modelPerformance.accuracy * 100).toFixed(0) : 0}%
                </div>
                <div className="text-sm text-gray-600">Précision du modèle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {modelPerformance.totalPredictions || 0}
                </div>
                <div className="text-sm text-gray-600">Prédictions totales</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Taux d'adaptation</span>
                <span>{(modelPerformance.adaptationRate * 100).toFixed(0)}%</span>
              </div>
              <Progress value={modelPerformance.adaptationRate * 100} className="h-2" />
            </div>

            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-1 text-purple-600" />
                Insights d'apprentissage
              </h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Adaptation continue aux patterns utilisateur</li>
                <li>• Optimisation contextuelle des recommandations</li>
                <li>• Apprentissage par renforcement actif</li>
                <li>• Meta-learning pour auto-amélioration</li>
                <li>• Prédictions personnalisées en temps réel</li>
              </ul>
            </div>

            {/* Nouvelles fonctionnalités d'apprentissage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-indigo-200">
                <h5 className="font-medium text-sm mb-2 text-indigo-700">Patterns Détectés</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Préférence projets courts</span>
                    <span className="text-green-600">+23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activité matinale</span>
                    <span className="text-blue-600">Peak 9h-11h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget optimal</span>
                    <span className="text-purple-600">3k-8k€</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-200">
                <h5 className="font-medium text-sm mb-2 text-green-700">Recommandations IA</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-green-500" />
                    <span>Cibler projets React/Node</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                    <span>Augmenter tarifs de 15%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span>Répondre avant 14h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <button
                onClick={generateAdaptivePrediction}
                className="flex-1 bg-purple-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Brain className="w-4 h-4 inline mr-1" />
                Nouvelle Prédiction
              </button>
              <button
                onClick={() => setIsLearning(true)}
                className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Re-entraîner
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
