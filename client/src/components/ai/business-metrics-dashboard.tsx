
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Euro, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface BusinessMetrics {
  revenue: {
    total: number;
    growth: number;
    aiContribution: number;
    projectedNext30Days: number;
  };
  conversions: {
    totalMissions: number;
    aiAssistedMissions: number;
    conversionRate: number;
    avgMissionValue: number;
  };
  userEngagement: {
    activeUsers: number;
    aiFeatureUsage: number;
    sessionDuration: number;
    retentionRate: number;
  };
  aiROI: {
    costSavings: number;
    timeReduction: number;
    qualityImprovement: number;
    customerSatisfaction: number;
  };
  trends: {
    hourlyActivity: number[];
    categoryGrowth: { category: string; growth: number; aiImpact: number }[];
    regionalPerformance: { region: string; missions: number; revenue: number }[];
  };
}

export default function BusinessMetricsDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    fetchBusinessMetrics();
    const interval = setInterval(fetchBusinessMetrics, 60000); // Refresh toutes les minutes
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchBusinessMetrics = async () => {
    try {
      const response = await fetch(`/api/ai/monitoring/business-metrics?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
      } else {
        // Données simulées pour démonstration
        setMetrics({
          revenue: {
            total: 45280 + Math.round(Math.random() * 5000),
            growth: 12.5 + (Math.random() * 3 - 1.5),
            aiContribution: 28.7 + (Math.random() * 2 - 1),
            projectedNext30Days: 52000 + Math.round(Math.random() * 8000)
          },
          conversions: {
            totalMissions: 342 + Math.round(Math.random() * 50),
            aiAssistedMissions: 287 + Math.round(Math.random() * 30),
            conversionRate: 76.3 + (Math.random() * 4 - 2),
            avgMissionValue: 523 + Math.round(Math.random() * 100)
          },
          userEngagement: {
            activeUsers: 1847 + Math.round(Math.random() * 200),
            aiFeatureUsage: 68.4 + (Math.random() * 5 - 2.5),
            sessionDuration: 8.7 + (Math.random() * 1 - 0.5),
            retentionRate: 82.1 + (Math.random() * 3 - 1.5)
          },
          aiROI: {
            costSavings: 34.2 + (Math.random() * 5 - 2.5),
            timeReduction: 45.8 + (Math.random() * 4 - 2),
            qualityImprovement: 23.5 + (Math.random() * 3 - 1.5),
            customerSatisfaction: 91.2 + (Math.random() * 2 - 1)
          },
          trends: {
            hourlyActivity: Array.from({length: 24}, () => Math.round(Math.random() * 100)),
            categoryGrowth: [
              { category: 'Développement', growth: 18.5, aiImpact: 12.3 },
              { category: 'Design', growth: 15.2, aiImpact: 8.7 },
              { category: 'Marketing', growth: 22.1, aiImpact: 15.4 },
              { category: 'Rédaction', growth: 9.8, aiImpact: 6.2 }
            ],
            regionalPerformance: [
              { region: 'Île-de-France', missions: 156, revenue: 18200 },
              { region: 'Auvergne-Rhône-Alpes', missions: 89, revenue: 12400 },
              { region: 'Provence-Alpes-Côte d\'Azur', missions: 73, revenue: 9800 },
              { region: 'Nouvelle-Aquitaine', missions: 45, revenue: 6100 }
            ]
          }
        });
      }
    } catch (error) {
      console.error('Erreur chargement métriques business:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? 
      <ArrowUp className="w-4 h-4 text-green-500" /> : 
      <ArrowDown className="w-4 h-4 text-red-500" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Business Analytics IA</h2>
          <p className="text-gray-600">Métriques de performance et impact business de l'IA</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showPredictions ? "default" : "outline"}
            onClick={() => setShowPredictions(!showPredictions)}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Prédictions IA
          </Button>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="24h">24 heures</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
          </select>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.revenue.total)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.revenue.growth)}
                  <span className={`text-sm ${getGrowthColor(metrics.revenue.growth)}`}>
                    {formatPercentage(Math.abs(metrics.revenue.growth))}
                  </span>
                </div>
              </div>
              <Euro className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missions IA</p>
                <p className="text-3xl font-bold">{metrics.conversions.aiAssistedMissions}</p>
                <p className="text-sm text-gray-500">
                  {formatPercentage((metrics.conversions.aiAssistedMissions / metrics.conversions.totalMissions) * 100)} du total
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                <p className="text-3xl font-bold">{metrics.userEngagement.activeUsers}</p>
                <p className="text-sm text-gray-500">
                  {formatPercentage(metrics.userEngagement.aiFeatureUsage)} utilisent l'IA
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ROI IA</p>
                <p className="text-3xl font-bold">{formatPercentage(metrics.aiROI.costSavings)}</p>
                <p className="text-sm text-gray-500">économies générées</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conversion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversion">Conversions</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="roi">ROI & Impact</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="conversion">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance des conversions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Taux de conversion global</span>
                    <span className="font-medium">{formatPercentage(metrics.conversions.conversionRate)}</span>
                  </div>
                  <Progress value={metrics.conversions.conversionRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Missions assistées par IA</span>
                    <span className="font-medium">
                      {formatPercentage((metrics.conversions.aiAssistedMissions / metrics.conversions.totalMissions) * 100)}
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.conversions.aiAssistedMissions / metrics.conversions.totalMissions) * 100} 
                    className="h-2" 
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valeur moyenne par mission</span>
                    <span className="font-bold">{formatCurrency(metrics.conversions.avgMissionValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projection revenue IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(metrics.revenue.projectedNext30Days)}
                    </p>
                    <p className="text-sm text-gray-600">Projection 30 jours</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">
                        {formatPercentage(metrics.revenue.aiContribution)}
                      </p>
                      <p className="text-xs text-gray-600">Contribution IA</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">
                        {formatPercentage(metrics.revenue.growth)}
                      </p>
                      <p className="text-xs text-gray-600">Croissance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement utilisateur IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Utilisation fonctionnalités IA</span>
                    <span>{formatPercentage(metrics.userEngagement.aiFeatureUsage)}</span>
                  </div>
                  <Progress value={metrics.userEngagement.aiFeatureUsage} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Rétention utilisateurs</span>
                    <span>{formatPercentage(metrics.userEngagement.retentionRate)}</span>
                  </div>
                  <Progress value={metrics.userEngagement.retentionRate} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durée session moyenne</span>
                    <span className="font-medium">{metrics.userEngagement.sessionDuration.toFixed(1)} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Croissance par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.trends.categoryGrowth.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat.category}</span>
                          <span className="font-medium">{formatPercentage(cat.growth)}</span>
                        </div>
                        <Progress value={cat.growth} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          Impact IA: {formatPercentage(cat.aiImpact)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roi">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-green-500" />
                  Économies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {formatPercentage(metrics.aiROI.costSavings)}
                  </p>
                  <p className="text-sm text-gray-600">Réduction des coûts</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Temps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPercentage(metrics.aiROI.timeReduction)}
                  </p>
                  <p className="text-sm text-gray-600">Gain de temps</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Qualité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {formatPercentage(metrics.aiROI.customerSatisfaction)}
                  </p>
                  <p className="text-sm text-gray-600">Satisfaction client</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance régionale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.trends.regionalPerformance.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{region.region}</p>
                        <p className="text-sm text-gray-600">{region.missions} missions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(region.revenue)}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(region.revenue / region.missions)} / mission
                        </p>
                      </div>
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
