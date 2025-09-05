
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, DollarSign, Calendar, Zap } from 'lucide-react';

interface RevenueProjection {
  period: string;
  conservative: number;
  realistic: number;
  optimistic: number;
  confidence: number;
  factors: string[];
}

export default function RevenuePredictor() {
  const [projections, setProjections] = useState<RevenueProjection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateProjections = async () => {
    setIsAnalyzing(true);
    
    // Simuler un délai d'analyse IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Algorithme de prédiction de revenus
    const userMetrics = {
      currentMonthlyRevenue: 3500,
      averageProjectValue: 1200,
      completionRate: 0.87,
      clientRetentionRate: 0.65,
      skillsGrowthRate: 0.12,
      marketDemandTrend: 1.15,
      seasonalityFactor: 0.9
    };

    const calculateProjection = (months: number, scenario: 'conservative' | 'realistic' | 'optimistic') => {
      const baseRevenue = userMetrics.currentMonthlyRevenue;
      const growthMultipliers = {
        conservative: 1.02,
        realistic: 1.08,
        optimistic: 1.15
      };
      
      const skillImpact = userMetrics.skillsGrowthRate * (scenario === 'optimistic' ? 2 : scenario === 'realistic' ? 1.5 : 1);
      const marketImpact = userMetrics.marketDemandTrend * (scenario === 'conservative' ? 0.8 : scenario === 'realistic' ? 1 : 1.2);
      
      let projectedRevenue = baseRevenue;
      for (let i = 1; i <= months; i++) {
        projectedRevenue *= (growthMultipliers[scenario] + skillImpact/12 + (marketImpact-1)/12);
        projectedRevenue *= userMetrics.seasonalityFactor; // Facteur saisonnier
      }
      
      return Math.round(projectedRevenue);
    };

    const newProjections: RevenueProjection[] = [
      {
        period: '3 mois',
        conservative: calculateProjection(3, 'conservative'),
        realistic: calculateProjection(3, 'realistic'),
        optimistic: calculateProjection(3, 'optimistic'),
        confidence: 89,
        factors: [
          'Projets en cours: 3 confirmés',
          'Pipeline: 5 prospects qualifiés',
          'Saisonnalité favorable',
          'Compétences en croissance'
        ]
      },
      {
        period: '6 mois',
        conservative: calculateProjection(6, 'conservative'),
        realistic: calculateProjection(6, 'realistic'),
        optimistic: calculateProjection(6, 'optimistic'),
        confidence: 76,
        factors: [
          'Tendance marché positive (+15%)',
          'Nouvelle expertise en IA',
          'Réseau client établi',
          'Concurrence modérée'
        ]
      },
      {
        period: '12 mois',
        conservative: calculateProjection(12, 'conservative'),
        realistic: calculateProjection(12, 'realistic'),
        optimistic: calculateProjection(12, 'optimistic'),
        confidence: 62,
        factors: [
          'Évolution technologique rapide',
          'Expansion géographique possible',
          'Partenariats stratégiques',
          'Incertitude macroéconomique'
        ]
      }
    ];

    setProjections(newProjections);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    generateProjections();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Prédicteur de Revenus IA</h3>
          <Badge variant="secondary">Bêta</Badge>
        </div>
        <Button onClick={generateProjections} disabled={isAnalyzing} size="sm">
          <Zap className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Analyse...' : 'Actualiser'}
        </Button>
      </div>

      {isAnalyzing ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Analyse de vos données et des tendances marché...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projections.map((projection, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Projection {projection.period}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Confiance: {projection.confidence}%
                    </Badge>
                    <Progress value={projection.confidence} className="w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-red-700">Scénario conservateur</span>
                        <span className="text-lg font-bold text-red-800">
                          {formatCurrency(projection.conservative)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-700">Scénario réaliste</span>
                        <span className="text-lg font-bold text-blue-800">
                          {formatCurrency(projection.realistic)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-green-700">Scénario optimiste</span>
                        <span className="text-lg font-bold text-green-800">
                          {formatCurrency(projection.optimistic)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 text-gray-800">Facteurs clés d'influence:</h4>
                    <ul className="space-y-2">
                      {projection.factors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Revenus mensuels actuels: {formatCurrency(3500)}</span>
                    <span className="text-green-600 font-medium">
                      Potentiel d'augmentation: +{Math.round(((projection.realistic - 3500) / 3500) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
