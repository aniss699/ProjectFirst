import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeSystem, ReputationMetrics } from './badge-system';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Users,
  Star,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface ReputationDashboardProps {
  userId: string;
  className?: string;
}

export function ReputationDashboard({ userId, className = '' }: ReputationDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data pour les statistiques
  const stats = {
    month: {
      totalPoints: 4850,
      pointsGained: 185,
      projectsCompleted: 12,
      averageRating: 4.9,
      responseTime: '1.2h',
      satisfactionRate: 97,
      trend: 'up' as const
    },
    quarter: {
      totalPoints: 4850,
      pointsGained: 520,
      projectsCompleted: 34,
      averageRating: 4.8,
      responseTime: '1.5h',
      satisfactionRate: 96,
      trend: 'up' as const
    },
    year: {
      totalPoints: 4850,
      pointsGained: 1650,
      projectsCompleted: 127,
      averageRating: 4.7,
      responseTime: '2.1h',
      satisfactionRate: 94,
      trend: 'stable' as const
    }
  };

  const activityHistory = [
    {
      type: 'badge',
      title: 'Nouveau badge obtenu',
      description: 'Expert Vérifié',
      points: '+100',
      date: '2024-01-15',
      icon: 'Award'
    },
    {
      type: 'review',
      title: 'Excellente évaluation',
      description: 'Note 5/5 sur projet e-commerce',
      points: '+25',
      date: '2024-01-14',
      icon: 'Star'
    },
    {
      type: 'milestone',
      title: 'Objectif atteint',
      description: '100 projets complétés',
      points: '+150',
      date: '2024-01-10',
      icon: 'Target'
    },
    {
      type: 'project',
      title: 'Projet livré à temps',
      description: 'Application mobile React Native',
      points: '+30',
      date: '2024-01-08',
      icon: 'TrendingUp'
    }
  ];

  const currentStats = stats[selectedPeriod as keyof typeof stats];
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityIcon = (iconName: string) => {
    const icons = { Award, Star, Target, TrendingUp };
    const IconComponent = icons[iconName as keyof typeof icons] || Activity;
    return IconComponent;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec sélecteur de période */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Réputation</h2>
          <p className="text-gray-600">Suivez votre progression et vos performances</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'month', label: '30j' },
            { key: 'quarter', label: '3m' },
            { key: 'year', label: '1an' }
          ].map(period => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.key)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points Total</p>
                <p className="text-2xl font-bold">{currentStats.totalPoints}</p>
              </div>
              <div className={`flex items-center gap-1 ${getTrendColor(currentStats.trend)}`}>
                {getTrendIcon(currentStats.trend)}
                <span className="text-sm font-medium">+{currentStats.pointsGained}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projets</p>
                <p className="text-2xl font-bold">{currentStats.projectsCompleted}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Note Moyenne</p>
                <p className="text-2xl font-bold">{currentStats.averageRating}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps Réponse</p>
                <p className="text-2xl font-bold">{currentStats.responseTime}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{currentStats.satisfactionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Niveau</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique de progression */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Évolution des Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Graphique d'évolution des points</p>
                    <p className="text-sm">Données des 30 derniers jours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Répartition par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Répartition des Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Qualité du travail', points: 1450, color: 'bg-blue-500' },
                    { category: 'Respect des délais', points: 1200, color: 'bg-green-500' },
                    { category: 'Communication', points: 980, color: 'bg-purple-500' },
                    { category: 'Innovation', points: 720, color: 'bg-orange-500' },
                    { category: 'Mentoring', points: 500, color: 'bg-pink-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <span className="font-medium">{item.points} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <BadgeSystem userId={userId} showProgress={true} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityHistory.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.icon);
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-green-600">
                        {activity.points}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Objectifs du Mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Compléter 15 projets',
                    current: 12,
                    target: 15,
                    reward: '+200 points'
                  },
                  {
                    title: 'Maintenir une note de 4.8+',
                    current: 4.9,
                    target: 4.8,
                    reward: '+100 points'
                  },
                  {
                    title: 'Répondre en moins de 2h',
                    current: 1.2,
                    target: 2.0,
                    reward: '+50 points'
                  }
                ].map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.title}</span>
                      <Badge variant="outline">{goal.reward}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((goal.current / goal.target) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}