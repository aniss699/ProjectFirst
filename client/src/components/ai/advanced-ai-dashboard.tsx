
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  DollarSign, 
  Users, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Clock,
  Star
} from 'lucide-react';

interface AIMetrics {
  successPrediction: {
    probability: number;
    confidence: number;
    keyFactors: string[];
    riskAssessment: any;
    optimizations: any[];
  };
  pricingOptimization: {
    optimalPrice: number;
    priceRanges: any;
    winningProbability: any;
    marketInsights: any;
  };
  matchingResults: {
    topMatches: any[];
    averageCompatibility: number;
    recommendations: string[];
  };
  marketAnalysis: {
    heatScore: number;
    tension: string;
    opportunities: string[];
    trends: string[];
  };
}

export function AdvancedAIDashboard({ userId, userType }: { userId: string; userType: 'client' | 'provider' }) {
  const [aiMetrics, setAIMetrics] = useState<AIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAnalysis, setActiveAnalysis] = useState<string>('overview');

  useEffect(() => {
    loadAIMetrics();
  }, [userId]);

  const loadAIMetrics = async () => {
    setLoading(true);
    try {
      // Simulation de données (remplacer par vrais appels API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAIMetrics({
        successPrediction: {
          probability: 0.87,
          confidence: 0.92,
          keyFactors: [
            'Budget réaliste pour le secteur',
            'Spécifications techniques claires',
            'Délais raisonnables',
            'Forte demande marché'
          ],
          riskAssessment: {
            technical_risk: 'low',
            budget_risk: 'low',
            timeline_risk: 'medium',
            market_risk: 'low',
            overall_risk_score: 25
          },
          optimizations: [
            {
              type: 'timeline',
              suggestion: 'Allonger de 1 semaine pour réduire la pression',
              impact_score: 7.2,
              implementation_effort: 'low'
            },
            {
              type: 'scope',
              suggestion: 'Ajouter des mockups pour clarifier les attentes',
              impact_score: 8.5,
              implementation_effort: 'medium'
            }
          ]
        },
        pricingOptimization: {
          optimalPrice: 4250,
          priceRanges: {
            conservative: { min: 3800, max: 4400 },
            competitive: { min: 3600, max: 4600 },
            aggressive: { min: 3400, max: 4800 }
          },
          winningProbability: {
            at_optimal_price: 0.78,
            at_market_price: 0.65,
            at_budget_limit: 0.92
          },
          marketInsights: {
            price_trend: 'rising',
            demand_forecast: 'Forte croissance attendue',
            optimal_timing: 'Moment idéal pour postuler',
            competitive_positioning: 'Au-dessus du marché'
          }
        },
        matchingResults: {
          topMatches: [
            {
              provider_id: '1',
              name: 'Tech Solutions Pro',
              match_score: 0.94,
              recommendation_level: 'excellent',
              strengths: ['React expertise', 'Excellent historique', 'Budget aligné']
            },
            {
              provider_id: '2',
              name: 'Digital Craftsmen',
              match_score: 0.89,
              recommendation_level: 'very_good',
              strengths: ['Portfolio similaire', 'Disponible rapidement']
            }
          ],
          averageCompatibility: 0.82,
          recommendations: [
            'Privilégier les prestataires avec portfolio e-commerce',
            'Vérifier la disponibilité immédiate',
            'Négocier les délais plutôt que le budget'
          ]
        },
        marketAnalysis: {
          heatScore: 73,
          tension: 'high',
          opportunities: [
            'Forte demande en développement web',
            'Concurrence modérée dans votre budget',
            'Timing favorable (fin de trimestre)'
          ],
          trends: [
            'Hausse des tarifs développement (+12%)',
            'Délais moyens en augmentation',
            'Qualité prioritaire sur prix'
          ]
        }
      });
    } catch (error) {
      console.error('Erreur chargement métriques IA:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-500 animate-pulse" />
          <h2 className="text-2xl font-bold">Analyse IA en cours...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!aiMetrics) return null;

  const getSuccessColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-600';
    if (probability >= 0.6) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Tableau de Bord IA Avancé</h2>
          <Badge variant="secondary">Neural Engine v2.0</Badge>
        </div>
        <Button onClick={loadAIMetrics} disabled={loading}>
          <Zap className="h-4 w-4 mr-2" />
          Actualiser l'analyse
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Probabilité de Succès</p>
                <p className={`text-2xl font-bold ${getSuccessColor(aiMetrics.successPrediction.probability)}`}>
                  {Math.round(aiMetrics.successPrediction.probability * 100)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress value={aiMetrics.successPrediction.probability * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prix Optimal</p>
                <p className="text-2xl font-bold text-green-600">
                  {aiMetrics.pricingOptimization.optimalPrice.toLocaleString()}€
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Prob. gain: {Math.round(aiMetrics.pricingOptimization.winningProbability.at_optimal_price * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compatibilité Moyenne</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(aiMetrics.matchingResults.averageCompatibility * 100)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {aiMetrics.matchingResults.topMatches.length} candidats analysés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tension Marché</p>
                <p className="text-2xl font-bold text-orange-600">
                  {aiMetrics.marketAnalysis.heatScore}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant={aiMetrics.marketAnalysis.tension === 'high' ? 'destructive' : 'secondary'}>
                {aiMetrics.marketAnalysis.tension}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse détaillée */}
      <Tabs value={activeAnalysis} onValueChange={setActiveAnalysis}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="prediction">Prédiction</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risques identifiés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Analyse des Risques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Technique</span>
                    <Badge className={getRiskColor(aiMetrics.successPrediction.riskAssessment.technical_risk)}>
                      {aiMetrics.successPrediction.riskAssessment.technical_risk}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Budget</span>
                    <Badge className={getRiskColor(aiMetrics.successPrediction.riskAssessment.budget_risk)}>
                      {aiMetrics.successPrediction.riskAssessment.budget_risk}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Délais</span>
                    <Badge className={getRiskColor(aiMetrics.successPrediction.riskAssessment.timeline_risk)}>
                      {aiMetrics.successPrediction.riskAssessment.timeline_risk}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Marché</span>
                    <Badge className={getRiskColor(aiMetrics.successPrediction.riskAssessment.market_risk)}>
                      {aiMetrics.successPrediction.riskAssessment.market_risk}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Score de risque global</span>
                    <span>{aiMetrics.successPrediction.riskAssessment.overall_risk_score}%</span>
                  </div>
                  <Progress value={aiMetrics.successPrediction.riskAssessment.overall_risk_score} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Opportunités marché */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Opportunités Détectées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiMetrics.marketAnalysis.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prediction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Facteurs clés */}
            <Card>
              <CardHeader>
                <CardTitle>Facteurs Clés de Succès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiMetrics.successPrediction.keyFactors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optimisations recommandées */}
            <Card>
              <CardHeader>
                <CardTitle>Optimisations Recommandées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiMetrics.successPrediction.optimizations.map((optimization, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{optimization.type}</span>
                        <Badge variant="outline">Impact: {optimization.impact_score}/10</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{optimization.suggestion}</p>
                      <Badge variant="secondary">
                        Effort: {optimization.implementation_effort}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stratégies de prix */}
            <Card>
              <CardHeader>
                <CardTitle>Stratégies de Prix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Conservateur</span>
                      <span className="text-green-600">Prob: 85%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {aiMetrics.pricingOptimization.priceRanges.conservative.min.toLocaleString()}€ - {aiMetrics.pricingOptimization.priceRanges.conservative.max.toLocaleString()}€
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Compétitif</span>
                      <span className="text-orange-600">Prob: 65%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {aiMetrics.pricingOptimization.priceRanges.competitive.min.toLocaleString()}€ - {aiMetrics.pricingOptimization.priceRanges.competitive.max.toLocaleString()}€
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Agressif</span>
                      <span className="text-red-600">Prob: 40%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {aiMetrics.pricingOptimization.priceRanges.aggressive.min.toLocaleString()}€ - {aiMetrics.pricingOptimization.priceRanges.aggressive.max.toLocaleString()}€
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights marché */}
            <Card>
              <CardHeader>
                <CardTitle>Insights Marché</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {aiMetrics.pricingOptimization.marketInsights.price_trend === 'rising' ? 
                      <ArrowUp className="h-4 w-4 text-green-500" /> : 
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    }
                    <span>Tendance: {aiMetrics.pricingOptimization.marketInsights.price_trend}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{aiMetrics.pricingOptimization.marketInsights.optimal_timing}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span>Position: {aiMetrics.pricingOptimization.marketInsights.competitive_positioning}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Top matches */}
            <Card>
              <CardHeader>
                <CardTitle>Meilleurs Candidats Identifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiMetrics.matchingResults.topMatches.map((match, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{match.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={match.recommendation_level === 'excellent' ? 'default' : 'secondary'}>
                            {match.recommendation_level}
                          </Badge>
                          <span className="text-sm font-medium">{Math.round(match.match_score * 100)}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Progress value={match.match_score * 100} className="h-2" />
                        <div className="flex flex-wrap gap-2">
                          {match.strengths.map((strength, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommandations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommandations de Sélection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiMetrics.matchingResults.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
