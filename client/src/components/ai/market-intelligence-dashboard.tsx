
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertCircle,
  BarChart3,
  Eye,
  Zap,
  Clock,
  Target,
  Activity,
  Globe
} from 'lucide-react';

interface MarketTrend {
  category: string;
  demand: number;
  growth: number;
  avgPrice: number;
  competition: 'low' | 'medium' | 'high';
  opportunities: string[];
}

interface MarketAlert {
  id: string;
  type: 'opportunity' | 'threat' | 'trend';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  impact: number;
  timestamp: string;
}

interface SkillDemand {
  skill: string;
  demand: number;
  growth: number;
  avgRate: number;
  projectCount: number;
  hotness: number;
}

export default function MarketIntelligenceDashboard() {
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [skillDemands, setSkillDemands] = useState<SkillDemand[]>([]);
  const [marketOverview, setMarketOverview] = useState({
    totalProjects: 0,
    avgBudget: 0,
    competitionIndex: 0,
    demandGrowth: 0
  });
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 30000); // Actualisation toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    // Simulation de données de marché en temps réel
    const trends: MarketTrend[] = [
      {
        category: 'Développement Web',
        demand: 87,
        growth: 15.3,
        avgPrice: 3500,
        competition: 'high',
        opportunities: ['Applications e-commerce', 'Sites vitrine premium', 'Plateformes SaaS']
      },
      {
        category: 'Intelligence Artificielle',
        demand: 94,
        growth: 45.2,
        avgPrice: 8500,
        competition: 'medium',
        opportunities: ['Chatbots intelligents', 'Analyse de données', 'Automatisation processus']
      },
      {
        category: 'Mobile Development',
        demand: 78,
        growth: 12.8,
        avgPrice: 5200,
        competition: 'high',
        opportunities: ['Apps React Native', 'PWA', 'Apps métier']
      },
      {
        category: 'Design UX/UI',
        demand: 72,
        growth: 8.9,
        avgPrice: 2800,
        competition: 'medium',
        opportunities: ['Design systems', 'Refonte UX', 'Prototypage']
      },
      {
        category: 'DevOps & Cloud',
        demand: 89,
        growth: 28.7,
        avgPrice: 6200,
        competition: 'low',
        opportunities: ['Migration cloud', 'CI/CD setup', 'Monitoring']
      }
    ];

    const alerts: MarketAlert[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Pic de demande IA détecté',
        description: 'Augmentation de 67% des projets IA cette semaine. Opportunité de positionnement.',
        urgency: 'high',
        impact: 85,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        type: 'trend',
        title: 'Montée des frameworks No-Code',
        description: 'Tendance croissante vers les solutions no-code/low-code. Impact sur le développement traditionnel.',
        urgency: 'medium',
        impact: 72,
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '3',
        type: 'threat',
        title: 'Saturation marché e-commerce',
        description: 'Augmentation de 150% des prestataires e-commerce. Concurrence accrue.',
        urgency: 'medium',
        impact: 68,
        timestamp: new Date(Date.now() - 10800000).toISOString()
      }
    ];

    const skills: SkillDemand[] = [
      { skill: 'React/Next.js', demand: 92, growth: 18.5, avgRate: 55, projectCount: 234, hotness: 94 },
      { skill: 'Python/AI', demand: 95, growth: 42.1, avgRate: 75, projectCount: 156, hotness: 98 },
      { skill: 'Node.js', demand: 88, growth: 15.2, avgRate: 50, projectCount: 198, hotness: 89 },
      { skill: 'TypeScript', demand: 84, growth: 25.8, avgRate: 60, projectCount: 167, hotness: 87 },
      { skill: 'Vue.js', demand: 76, growth: 12.3, avgRate: 48, projectCount: 143, hotness: 79 },
      { skill: 'Flutter/Dart', demand: 82, growth: 32.4, avgRate: 58, projectCount: 89, hotness: 85 },
      { skill: 'AWS/Cloud', demand: 90, growth: 28.9, avgRate: 68, projectCount: 134, hotness: 91 },
      { skill: 'UI/UX Design', demand: 74, growth: 8.7, avgRate: 42, projectCount: 187, hotness: 76 }
    ];

    const overview = {
      totalProjects: 1247 + Math.floor(Math.random() * 100),
      avgBudget: 4200 + Math.floor(Math.random() * 500),
      competitionIndex: 73 + Math.floor(Math.random() * 10),
      demandGrowth: 18.5 + Math.random() * 5
    };

    setMarketTrends(trends);
    setMarketAlerts(alerts);
    setSkillDemands(skills);
    setMarketOverview(overview);
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 20) return 'text-green-600';
    if (growth >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-orange-500 bg-orange-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'threat': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'trend': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statut en temps réel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Market Intelligence</h2>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Data
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapport
          </Button>
          <Button size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Alertes
          </Button>
        </div>
      </div>

      {/* Vue d'ensemble du marché */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projets Actifs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {marketOverview.totalProjects.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Moyen</p>
                <p className="text-2xl font-bold text-green-600">
                  {marketOverview.avgBudget.toLocaleString()}€
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Index Concurrence</p>
                <p className="text-2xl font-bold text-orange-600">
                  {marketOverview.competitionIndex}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Progress value={marketOverview.competitionIndex} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Croissance Demande</p>
                <p className="text-2xl font-bold text-purple-600">
                  +{marketOverview.demandGrowth.toFixed(1)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-purple-600">Tendance haussière</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes Marché Temps Réel */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Alertes Marché Temps Réel
            <Badge variant="destructive" className="ml-auto">
              {marketAlerts.filter(a => a.urgency === 'high').length} Urgent
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(alert.urgency)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        Il y a {Math.floor((Date.now() - new Date(alert.timestamp).getTime()) / 60000)} min
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Impact: {alert.impact}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse détaillée */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendances Catégories</TabsTrigger>
          <TabsTrigger value="skills">Demande Compétences</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions IA</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {marketTrends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{trend.category}</span>
                    <Badge variant={trend.competition === 'low' ? 'default' : 
                                  trend.competition === 'medium' ? 'secondary' : 'destructive'}>
                      {trend.competition} concurrence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{trend.demand}%</div>
                        <div className="text-sm text-gray-600">Demande</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${getGrowthColor(trend.growth)}`}>
                          +{trend.growth}%
                        </div>
                        <div className="text-sm text-gray-600">Croissance</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {trend.avgPrice.toLocaleString()}€
                        </div>
                        <div className="text-sm text-gray-600">Prix moyen</div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Opportunités détectées :</h5>
                      <div className="space-y-1">
                        {trend.opportunities.map((opp, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {opp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {skillDemands.map((skill, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 ${
                  skill.hotness >= 90 ? 'bg-red-500' : 
                  skill.hotness >= 80 ? 'bg-orange-500' : 'bg-blue-500'
                }`}></div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{skill.skill}</h4>
                    <Badge variant={skill.hotness >= 90 ? 'destructive' : 
                                  skill.hotness >= 80 ? 'default' : 'secondary'}>
                      🔥 {skill.hotness}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Demande</span>
                      <span className="font-medium">{skill.demand}%</span>
                    </div>
                    <Progress value={skill.demand} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Croissance</span>
                      <span className={`font-medium ${getGrowthColor(skill.growth)}`}>
                        +{skill.growth}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                      <div>Taux: {skill.avgRate}€/h</div>
                      <div>Projets: {skill.projectCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Prédictions IA - Prochaine Semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Hausse demande IA</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Augmentation prévue de 35% des projets d'automatisation
                    </p>
                    <div className="text-xs text-green-600 mt-1">Confiance: 87%</div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Pic e-commerce</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Demande saisonnière pour applications de vente en ligne
                    </p>
                    <div className="text-xs text-orange-600 mt-1">Confiance: 92%</div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Opportunité Cloud</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Migrations cloud en forte progression ce trimestre
                    </p>
                    <div className="text-xs text-blue-600 mt-1">Confiance: 79%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Recommandations Stratégiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-700 mb-2">Position Optimale</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Spécialisez-vous en IA/Automatisation</li>
                      <li>• Développez expertise Cloud/DevOps</li>
                      <li>• Positionnez-vous sur React/Next.js</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-orange-200">
                    <h5 className="font-medium text-orange-700 mb-2">Prix Stratégique</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Augmentez tarifs IA de 15-20%</li>
                      <li>• Maintenez prix web développement</li>
                      <li>• Premium pour expertise DevOps</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-700 mb-2">Timing Optimal</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Proposer maintenant : Projets IA</li>
                      <li>• Attendre 2 semaines : E-commerce</li>
                      <li>• Préparer Q2 : Migrations Cloud</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
