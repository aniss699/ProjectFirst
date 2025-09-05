import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star, 
  Clock,
  Target,
  Zap,
  Award,
  MessageSquare,
  Eye,
  Calendar,
  BarChart3,
  Activity,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface ProviderStats {
  totalEarnings: number;
  monthlyEarnings: number;
  completedProjects: number;
  activeProjects: number;
  averageRating: number;
  responseTime: number;
  successRate: number;
  profileViews: number;
  proposalsSent: number;
  winRate: number;
}

interface Activity {
  id: string;
  type: 'message' | 'project' | 'payment' | 'review';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

export function ProviderDashboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Données simulées en attendant l'API
  const mockStats: ProviderStats = {
    totalEarnings: 45230,
    monthlyEarnings: 8750,
    completedProjects: 34,
    activeProjects: 6,
    averageRating: 4.8,
    responseTime: 2.5,
    successRate: 92,
    profileViews: 156,
    proposalsSent: 23,
    winRate: 78
  };

  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'message',
      title: 'Nouveau message',
      description: 'Marie D. vous a envoyé un message sur le projet E-commerce',
      timestamp: '2h',
      status: 'success'
    },
    {
      id: '2',
      type: 'project',
      title: 'Projet terminé',
      description: 'Site web pour StartupTech marqué comme terminé',
      timestamp: '4h',
      status: 'success'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Paiement reçu',
      description: '2 500€ reçus pour le projet App Mobile',
      timestamp: '1j',
      status: 'success'
    },
    {
      id: '4',
      type: 'review',
      title: 'Nouvelle évaluation',
      description: '⭐ 5/5 - "Excellent travail, très professionnel"',
      timestamp: '2j',
      status: 'success'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'project': return Briefcase;
      case 'payment': return DollarSign;
      case 'review': return Star;
      default: return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Prestataire</h2>
          <p className="text-gray-600">Suivez vos performances en temps réel</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
          </select>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Revenus totaux</CardTitle>
            <DollarSign className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalEarnings.toLocaleString()}€</div>
            <div className="flex items-center text-xs opacity-80 mt-1">
              <ArrowUp className="w-3 h-3 mr-1" />
              +12% ce mois
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Projets terminés</CardTitle>
            <CheckCircle className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.completedProjects}</div>
            <div className="flex items-center text-xs opacity-80 mt-1">
              <Target className="w-3 h-3 mr-1" />
              {mockStats.successRate}% de réussite
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Note moyenne</CardTitle>
            <Star className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageRating}/5</div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current opacity-80" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Temps de réponse</CardTitle>
            <Clock className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.responseTime}h</div>
            <div className="flex items-center text-xs opacity-80 mt-1">
              <Zap className="w-3 h-3 mr-1" />
              Très rapide
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableaux de bord détaillés */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="earnings">Revenus</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métriques de performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Métriques clés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taux de conversion</span>
                    <span className="text-sm text-gray-600">{mockStats.winRate}%</span>
                  </div>
                  <Progress value={mockStats.winRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Vues du profil</span>
                    <span className="text-sm text-gray-600">{mockStats.profileViews}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Propositions envoyées</span>
                    <span className="text-sm text-gray-600">{mockStats.proposalsSent}</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Activités récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Activités récentes
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir tout
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Projets actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{mockStats.activeProjects}</div>
                <p className="text-sm text-gray-600 mt-1">En cours de réalisation</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>En attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">3</div>
                <p className="text-sm text-gray-600 mt-1">Propositions soumises</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Terminés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{mockStats.completedProjects}</div>
                <p className="text-sm text-gray-600 mt-1">Avec succès</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus ce mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{mockStats.monthlyEarnings.toLocaleString()}€</div>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+15% vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenus moyens/projet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{Math.round(mockStats.totalEarnings / mockStats.completedProjects).toLocaleString()}€</div>
                <p className="text-sm text-gray-600 mt-1">Basé sur {mockStats.completedProjects} projets</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics avancées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Graphiques et rapports détaillés</h3>
                <p className="text-gray-600 mb-4">Analyse approfondie de vos performances, tendances et opportunités d'amélioration.</p>
                <Button>
                  Voir les analytics complètes
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}