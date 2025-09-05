"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  Users, 
  Euro,
  Calendar,
  Star,
  Activity,
  Lightbulb
} from 'lucide-react';

export function IntelligentDashboard() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('overview');


  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      const response = await fetch('/api/ai/dashboard-insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      // Fallback data
      setInsights({
        performance_score: 78,
        recommendations: [
          'Optimisez vos tarifs pour augmenter vos revenus de 15%.',
          'Ciblez les profils de développeurs expérimentés pour de meilleurs résultats.',
          'Explorez les nouvelles opportunités de marché dans le secteur de la santé.'
        ],
        market_trends: [
          {
            category: 'Développement Web Full Stack',
            trend: 'up',
            change: '+25%',
            description: 'Forte demande pour les compétences React et Node.js cette semaine'
          },
          {
            category: 'Intelligence Artificielle',
            trend: 'up',
            change: '+18%',
            description: 'Croissance soutenue des besoins en Machine Learning'
          }
        ],
        next_actions: [
          {
            title: 'Postuler à 3 missions recommandées pour les développeurs React',
            priority: 'high',
            estimated_impact: 'Revenue potentiel: +800€'
          },
          {
            title: 'Mettre à jour votre portfolio avec vos derniers projets IA',
            priority: 'medium',
            estimated_impact: 'Augmentation de la visibilité'
          }
        ],
        market_overview: {
          avg_completion_rate: 0.85,
          price_trend: '+5%'
        },
        ai_performance: {
          matching_success_rate: 0.72
        },
        skills_demand: [
          { name: 'React', demand: 'high', growth: '+30%' },
          { name: 'Node.js', demand: 'high', growth: '+20%' },
          { name: 'Machine Learning', demand: 'medium', growth: '+15%' },
          { name: 'Cloud Computing', demand: 'medium', growth: '+10%' },
          { name: 'DevOps', demand: 'low', growth: '+5%' }
        ],
        predictions: [
          'Le marché des applications mobiles devrait croître de 12% l\'année prochaine.',
          'La demande pour les experts en cybersécurité continuera d\'être très élevée.',
          'L\'automatisation grâce à l\'IA transformera de nombreux secteurs.'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAdvancedMetrics = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              <Users className="h-4 w-4 text-muted-foreground mr-2 inline-block" />
              Clients Actifs
            </CardTitle>
            <Badge variant="outline">Total</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.active_clients || 150}</div>
            <p className="text-xs text-muted-foreground">+10% depuis la semaine dernière</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              <Euro className="h-4 w-4 text-muted-foreground mr-2 inline-block" />
              Revenu Mensuel
            </CardTitle>
            <Badge variant="outline">Prochainement</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.monthly_revenue || '€5,200'}</div>
            <p className="text-xs text-muted-foreground">+5% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2 inline-block" />
              Missions Terminées
            </CardTitle>
            <Badge variant="outline">CMA</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.completed_missions || 78}</div>
            <p className="text-xs text-muted-foreground">+2 missions cette semaine</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTrendingSkills = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Compétences en Tendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights?.skills_demand?.map((skill: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{skill.demand === 'high' ? 'Haute' : skill.demand === 'medium' ? 'Moyenne' : 'Basse'}</Badge>
                  <span className="font-medium">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${skill.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {skill.growth}
                  </span>
                  <TrendingUp className={`h-4 w-4 ${skill.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMarketPredictions = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Prédictions du Marché
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights?.predictions?.map((prediction: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-yellow-800 flex-1">{prediction}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard IA Intelligent</h2>
          <p className="text-muted-foreground">
            Insights et analytics pilotés par l'intelligence artificielle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            IA Active
          </Badge>
          <Brain className="h-8 w-8 text-primary" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {renderAdvancedMetrics()}

          <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
            <TabsList className="w-full overflow-x-auto grid grid-flow-col auto-cols-max md:grid-cols-4 gap-1 p-1">
              <TabsTrigger value="overview" className="whitespace-nowrap text-xs md:text-sm">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="trends" className="whitespace-nowrap text-xs md:text-sm">Tendances</TabsTrigger>
              <TabsTrigger value="predictions" className="whitespace-nowrap text-xs md:text-sm">Prédictions</TabsTrigger>
              <TabsTrigger value="recommendations" className="whitespace-nowrap text-xs md:text-sm">Recommandations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Aperçu du Marché</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Taux de completion</span>
                        <span className="font-semibold">
                          {Math.round((insights?.market_overview?.avg_completion_rate || 0) * 100)}%
                        </span>
                      </div>
                      <Progress value={(insights?.market_overview?.avg_completion_rate || 0) * 100} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span>Évolution des prix</span>
                        <Badge variant="outline" className="text-green-600">
                          {insights?.market_overview?.price_trend || '+0%'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Taux de matching</span>
                        <span className="font-semibold">
                          {Math.round((insights?.ai_performance?.matching_success_rate || 0) * 100)}%
                        </span>
                      </div>
                      <Progress value={(insights?.ai_performance?.matching_success_rate || 0) * 100} className="h-2"/>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {renderTrendingSkills()}
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4">
              {renderMarketPredictions()}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Recommandations IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights?.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-blue-800 flex-1">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}