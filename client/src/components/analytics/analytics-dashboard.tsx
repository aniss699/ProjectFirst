import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Award, 
  BarChart3, 
  Calendar,
  Target,
  Clock,
  Zap,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalProjects: number;
  averageRating: number;
  completionRate: number;
  monthlyGrowth: number;
  clientRetention: number;
  averageProjectValue: number;
  responseTime: number;
  marketShare: number;
  skillsDemand: { skill: string; demand: number; growth: number }[];
  revenueByMonth: { month: string; revenue: number; projects: number }[];
  topCategories: { category: string; count: number; revenue: number }[];
  competitorAnalysis: { 
    yourPrice: number; 
    marketAverage: number; 
    topPerformers: number; 
    recommendation: string;
  };
}

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const data: AnalyticsData = {
    totalRevenue: 45280,
    totalProjects: 127,
    averageRating: 4.8,
    completionRate: 94,
    monthlyGrowth: 23,
    clientRetention: 87,
    averageProjectValue: 1850,
    responseTime: 2.4,
    marketShare: 12,
    skillsDemand: [
      { skill: 'React/Next.js', demand: 95, growth: 18 },
      { skill: 'UI/UX Design', demand: 88, growth: 25 },
      { skill: 'Mobile App', demand: 82, growth: 15 },
      { skill: 'E-commerce', demand: 76, growth: 12 },
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 3200, projects: 8 },
      { month: 'Fév', revenue: 4100, projects: 11 },
      { month: 'Mar', revenue: 3800, projects: 9 },
      { month: 'Avr', revenue: 5200, projects: 14 },
      { month: 'Mai', revenue: 4900, projects: 12 },
      { month: 'Juin', revenue: 6100, projects: 16 },
    ],
    topCategories: [
      { category: 'Développement Web', count: 45, revenue: 18500 },
      { category: 'Design UI/UX', count: 32, revenue: 12800 },
      { category: 'Mobile', count: 28, revenue: 9200 },
      { category: 'Marketing', count: 22, revenue: 4780 },
    ],
    competitorAnalysis: {
      yourPrice: 65,
      marketAverage: 75,
      topPerformers: 90,
      recommendation: 'Augmentez vos tarifs de 15-20% pour vous aligner sur le marché'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics & Performance</h2>
          <p className="text-gray-600">Analysez vos performances et optimisez votre activité</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="12m">12 derniers mois</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Revenus totaux</p>
                <p className="text-3xl font-bold">{data.totalRevenue.toLocaleString()}€</p>
                <p className="text-blue-100 text-sm mt-1">+{data.monthlyGrowth}% vs période précédente</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Projets complétés</p>
                <p className="text-3xl font-bold">{data.totalProjects}</p>
                <p className="text-green-100 text-sm mt-1">{data.completionRate}% de réussite</p>
              </div>
              <Award className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Valeur moyenne</p>
                <p className="text-3xl font-bold">{data.averageProjectValue}€</p>
                <p className="text-purple-100 text-sm mt-1">Par projet</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Temps de réponse</p>
                <p className="text-3xl font-bold">{data.responseTime}h</p>
                <p className="text-orange-100 text-sm mt-1">Moyenne</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets détaillés */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="market">Marché</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
          <TabsTrigger value="recommendations">IA Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Évolution mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenueByMonth.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{month.projects} projets</span>
                        <span className="font-semibold">{month.revenue.toLocaleString()}€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Top catégories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topCategories.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-gray-600">
                          {category.count} projets • {category.revenue.toLocaleString()}€
                        </span>
                      </div>
                      <Progress value={(category.count / data.totalProjects) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Analyse concurrentielle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{data.competitorAnalysis.yourPrice}€/h</div>
                  <div className="text-sm text-gray-600">Vos tarifs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">{data.competitorAnalysis.marketAverage}€/h</div>
                  <div className="text-sm text-gray-600">Moyenne marché</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{data.competitorAnalysis.topPerformers}€/h</div>
                  <div className="text-sm text-gray-600">Top performers</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Recommandation tarifaire</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {data.competitorAnalysis.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Demande par compétence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.skillsDemand.map((skill) => (
                  <div key={skill.skill} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={skill.growth > 20 ? 'default' : 'secondary'}>
                          +{skill.growth}% croissance
                        </Badge>
                        <span className="text-sm text-gray-600">{skill.demand}% demande</span>
                      </div>
                    </div>
                    <Progress value={skill.demand} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Recommandations IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-blue-900">Optimisation des tarifs</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Vos prix sont 15% en dessous du marché. Augmentez-les progressivement pour maximiser vos revenus.
                      </p>
                      <div className="mt-2">
                        <Badge className="bg-blue-100 text-blue-800">Impact: +3200€/mois</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-green-900">Créneaux porteurs</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Les projets React/Next.js ont une croissance de +25%. Mettez en avant cette compétence.
                      </p>
                      <div className="mt-2">
                        <Badge className="bg-green-100 text-green-800">Opportunité: Élevée</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-orange-900">Temps de réponse</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Répondez 30% plus vite aux messages pour améliorer votre taux de conversion de 12%.
                      </p>
                      <div className="mt-2">
                        <Badge className="bg-orange-100 text-orange-800">Objectif: &lt;2h</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Objectifs du mois
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Revenus (7500€)</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Nouveaux clients (8)</span>
                    <span className="font-medium">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Projets livrés (15)</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>

                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Vous êtes en bonne voie pour atteindre vos objectifs ce mois !
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}