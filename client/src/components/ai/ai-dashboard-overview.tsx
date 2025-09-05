
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap,
  BarChart3,
  Users,
  Clock,
  Star
} from 'lucide-react';

interface AIMetrics {
  totalAnalyses: number;
  successRate: number;
  avgMatchScore: number;
  revenueOptimization: number;
  timesSaved: number;
  recommendationsAccepted: number;
}

interface AIDashboardOverviewProps {
  metrics?: AIMetrics;
}

export function AIDashboardOverview({ 
  metrics = {
    totalAnalyses: 1247,
    successRate: 87,
    avgMatchScore: 84,
    revenueOptimization: 23,
    timesSaved: 156,
    recommendationsAccepted: 73
  }
}: AIDashboardOverviewProps) {
  
  const overviewCards = [
    {
      title: "Analyses IA",
      value: metrics.totalAnalyses.toLocaleString(),
      icon: Brain,
      color: "blue",
      description: "Total d'analyses effectuées"
    },
    {
      title: "Taux de succès",
      value: `${metrics.successRate}%`,
      icon: Target,
      color: "green",
      description: "Précision des recommandations"
    },
    {
      title: "Score moyen",
      value: `${metrics.avgMatchScore}%`,
      icon: Star,
      color: "yellow",
      description: "Qualité du matching"
    },
    {
      title: "Optimisation revenus",
      value: `+${metrics.revenueOptimization}%`,
      icon: TrendingUp,
      color: "purple",
      description: "Amélioration moyenne"
    }
  ];

  const recentActivities = [
    {
      type: "analysis",
      title: "Analyse de mission: Développement e-commerce",
      score: 92,
      time: "Il y a 2h",
      status: "success"
    },
    {
      type: "recommendation",
      title: "Recommandation de prix acceptée",
      improvement: "+15%",
      time: "Il y a 4h",
      status: "accepted"
    },
    {
      type: "match",
      title: "Nouveau match détecté",
      relevance: 89,
      time: "Il y a 6h",
      status: "new"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-${card.color}-600`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Performance IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Précision des analyses</span>
                <span className="text-sm text-gray-600">{metrics.successRate}%</span>
              </div>
              <Progress value={metrics.successRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Qualité du matching</span>
                <span className="text-sm text-gray-600">{metrics.avgMatchScore}%</span>
              </div>
              <Progress value={metrics.avgMatchScore} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Adoption des recommandations</span>
                <span className="text-sm text-gray-600">{metrics.recommendationsAccepted}%</span>
              </div>
              <Progress value={metrics.recommendationsAccepted} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent AI Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Activité récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.score && (
                      <Badge variant="secondary">{activity.score}%</Badge>
                    )}
                    {activity.improvement && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {activity.improvement}
                      </Badge>
                    )}
                    {activity.relevance && (
                      <Badge variant="outline">{activity.relevance}%</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Statistiques rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.timesSaved}h</div>
              <div className="text-sm text-gray-600">Temps économisé</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{metrics.revenueOptimization}%</div>
              <div className="text-sm text-gray-600">Revenus optimisés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.recommendationsAccepted}%</div>
              <div className="text-sm text-gray-600">Recommandations suivies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.avgMatchScore}%</div>
              <div className="text-sm text-gray-600">Score de matching</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
