import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Flame, Snowflake, Zap, DollarSign, Clock, Activity, Lightbulb } from 'lucide-react';

interface MarketHeatData {
  category: string;
  heatScore: number;
  trend: 'up' | 'down';
  demand: number;
  supply: number;
  avgPrice: number;
  competitionLevel: 'low' | 'medium' | 'high';
  recommendedAction: string;
  insights: string[];
  weeklyStats?: {
    newProjects: number;
    avgResponseTime: number;
    successRate: number;
    topSkills: string[];
  };
  priceAnalysis?: {
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    priceVolatility: 'stable' | 'volatile';
  };
}

interface MarketHeatIndicatorProps {
  category: string;
  region?: string;
  onHeatChange?: (heatData: MarketHeatData) => void;
}

export function MarketHeatIndicator({ category, region, onHeatChange }: MarketHeatIndicatorProps) {
  const [marketData, setMarketData] = useState<MarketHeatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailedView, setDetailedView] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Simulation des données de marché plus sophistiquées
        await new Promise(resolve => setTimeout(resolve, 1500));

        const baseHeat = Math.floor(Math.random() * 100);
        const trendDirection = Math.random() > 0.5 ? 'up' : 'down';
        const demandLevel = Math.floor(Math.random() * 50) + 20;
        const supplyLevel = Math.floor(Math.random() * 30) + 10;
        const competitionIntensity = demandLevel > supplyLevel ? 'high' : demandLevel > supplyLevel * 0.7 ? 'medium' : 'low';

        const insights = [];
        if (baseHeat > 70) {
          insights.push('🔥 Marché très actif - Opportunité excellente');
          insights.push(`📈 Demande élevée: ${demandLevel} projets actifs`);
        } else if (baseHeat > 40) {
          insights.push('📊 Activité modérée sur ce secteur');
          insights.push(`⚖️ Équilibre offre/demande`);
        } else {
          insights.push('📉 Marché calme - Moins de concurrence');
          insights.push(`💡 Bon moment pour se positionner`);
        }

        if (trendDirection === 'up') {
          insights.push('📈 Tendance haussière des prix (+12% cette semaine)');
        } else {
          insights.push('📉 Baisse des prix (-8% cette semaine)');
        }

        if (competitionIntensity === 'low') {
          insights.push('✅ Concurrence faible - Positionnement favorable');
        } else if (competitionIntensity === 'high') {
          insights.push('⚠️ Forte concurrence - Différenciation nécessaire');
        }

        const mockData: MarketHeatData = {
          category,
          heatScore: baseHeat,
          trend: trendDirection,
          demand: demandLevel,
          supply: supplyLevel,
          avgPrice: Math.floor(Math.random() * 2000) + 1000,
          competitionLevel: competitionIntensity,
          recommendedAction: baseHeat > 60 ? 'Excellent moment pour publier!' : baseHeat > 30 ? 'Bon moment pour publier' : 'Marché calme, positionnez-vous bien',
          insights: insights,
          weeklyStats: {
            newProjects: Math.floor(Math.random() * 20) + 5,
            avgResponseTime: Math.floor(Math.random() * 24) + 2,
            successRate: Math.floor(Math.random() * 30) + 60,
            topSkills: ['React', 'Node.js', 'TypeScript', 'Python'].slice(0, Math.floor(Math.random() * 3) + 2)
          },
          priceAnalysis: {
            minPrice: Math.floor(Math.random() * 500) + 200,
            maxPrice: Math.floor(Math.random() * 3000) + 2000,
            medianPrice: Math.floor(Math.random() * 1500) + 800,
            priceVolatility: Math.random() > 0.5 ? 'stable' : 'volatile'
          }
        };

        setMarketData(mockData);
        onHeatChange?.(mockData);
      } catch (error) {
        console.error('Erreur lors du chargement des données marché:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchMarketData();
    }
  }, [category]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-gray-600">Analyse du marché en cours...</span>
        </div>
      </Card>
    );
  }

  if (!marketData) return null;

  const getHeatColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100 border-red-200';
    if (score >= 40) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    return marketData.trend === 'up' ?
      <TrendingUp className="w-4 h-4 text-green-500" /> :
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <Card className="border-l-4 border-l-purple-500 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Analyse du Marché - {category} {region && <span className="text-sm text-gray-500">({region})</span>}
          </span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge className={getHeatColor(marketData.heatScore)}>
              {marketData.heatScore}/100
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{marketData.demand}</div>
            <div className="text-xs text-blue-500">Demande</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-600">{marketData.supply}</div>
            <div className="text-xs text-purple-500">Offre</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">{marketData.avgPrice}€</div>
            <div className="text-xs text-green-500">Prix moy.</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Niveau de concurrence:</span>
          <Badge className={getCompetitionColor(marketData.competitionLevel)}>
            {marketData.competitionLevel === 'high' ? '🔥 Élevée' :
             marketData.competitionLevel === 'medium' ? '⚖️ Modérée' : '✅ Faible'}
          </Badge>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommandation IA
          </h4>
          <p className="text-sm text-purple-700 font-medium">{marketData.recommendedAction}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">Insights du marché</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDetailedView(!detailedView)}
              className="text-xs"
            >
              {detailedView ? 'Moins' : 'Plus'} de détails
            </Button>
          </div>

          <ul className="space-y-2">
            {marketData.insights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>

          {detailedView && marketData.weeklyStats && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-3">📊 Statistiques hebdomadaires</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Nouveaux projets:</span>
                  <span className="ml-2 font-bold">{marketData.weeklyStats.newProjects}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Temps de réponse:</span>
                  <span className="ml-2 font-bold">{marketData.weeklyStats.avgResponseTime}h</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Taux de succès:</span>
                  <span className="ml-2 font-bold">{marketData.weeklyStats.successRate}%</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Compétences top:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {marketData.weeklyStats.topSkills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}