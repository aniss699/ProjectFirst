import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import type { Mission, Bid } from '@shared/schema';
import { formatBudget, formatDate } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Hand, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Plus,
  Calendar,
  MapPin,
  Clock,
  Award,
  Target,
  Zap,
  ChevronRight,
  Eye,
  MessageSquare,
  Search,
  Brain
} from 'lucide-react';
import { useLocation } from 'wouter';

import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';
import { IntelligentDashboard } from '../components/ai/intelligent-dashboard';
import { AINegotiator } from '../components/ai/ai-negotiator';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { ProviderDashboard } from '@/components/dashboard/provider-dashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: userMissions = [] } = useQuery<Mission[]>({
    queryKey: ['/api/users', user?.id, 'missions'],
    enabled: !!user,
  });

  const { data: userBids = [] } = useQuery<Bid[]>({
    queryKey: ['/api/users', user?.id, 'bids'],
    enabled: !!user && user.role === 'PRO',
  });

  // Données pour le dashboard prestataire
  const { data: providerStats } = useQuery({
    queryKey: ['/api/provider/stats', user?.id],
    enabled: !!user && user.role === 'PRO',
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['/api/provider/activities', user?.id],
    enabled: !!user && user.role === 'PRO',
  });

  // Feature flag for AI Dashboard (can be controlled from backend or config)
  const enableAIDashboard = true; 

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
            <p className="text-gray-600 mb-8">Connectez-vous pour accéder à votre espace personnel</p>
            <Button 
              onClick={() => setLocation('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBids = userMissions.reduce((acc, mission) => acc + (mission.bids?.length || 0), 0);
  const averageBudget = userMissions.length > 0 
    ? userMissions.reduce((acc, mission) => acc + parseInt(mission.budget || '0'), 0) / userMissions.length 
    : 0;

  const completedMissions = userMissions.filter(m => m.status === 'completed').length;
  const activeProjects = userMissions.filter(m => m.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec animation */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Salut {user.name} 👋
              </h1>
              <p className="text-lg text-gray-600">
                Voici votre tableau de bord AppelsPro
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle mission
            </Button>
          </div>
        </div>

        

        {/* Content based on user type */}
        {user.type === 'client' ? (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Missions publiées</CardTitle>
                  <ClipboardList className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{userMissions.length}</div>
                  <p className="text-xs opacity-80">
                    {activeProjects > 0 ? `${activeProjects} actives` : 'Aucune active'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Candidatures reçues</CardTitle>
                  <Hand className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{totalBids}</div>
                  <p className="text-xs opacity-80">
                    {totalBids > 0 ? 'Nouvelles opportunités' : 'En attente'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Projets terminés</CardTitle>
                  <Award className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{completedMissions}</div>
                  <p className="text-xs opacity-80">
                    Taux de réussite: 100%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Note moyenne</CardTitle>
                  <Star className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">4.9</div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current opacity-80" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : user.role === 'PRO' ? (
          // Dashboard spécialisé pour les prestataires
          <ProviderDashboard />
        ) : (
          // Stats génériques
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Missions disponibles</CardTitle>
                <ClipboardList className="h-5 w-5 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{userMissions.length}</div>
                <p className="text-xs opacity-80">
                  {activeProjects > 0 ? `${activeProjects} actives` : 'Aucune mission'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Candidatures Envoyées</CardTitle>
                <Hand className="h-5 w-5 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{userBids.length}</div>
                <p className="text-xs opacity-80">
                  {userBids.length > 0 ? 'Opportunités actives' : 'Aucune candidature'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Revenu estimé</CardTitle>
                <DollarSign className="h-5 w-5 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">€5,200</div>
                <p className="text-xs opacity-80">Ce mois-ci</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <TrendingUp className="w-6 h-6 mr-3 text-blue-500" />
                Progression ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Objectif missions</span>
                    <span className="text-sm text-gray-600">{userMissions.length}/5</span>
                  </div>
                  <Progress value={(userMissions.length / 5) * 100} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Taux de réponse</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Satisfaction client</span>
                    <span className="text-sm text-gray-600">98%</span>
                  </div>
                  <Progress value={98} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-blue-50 border-blue-200"
                onClick={() => setLocation('/create-mission')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Publier une mission
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-green-50 border-green-200"
                onClick={() => setLocation('/marketplace')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Explorer le marché
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-purple-50 border-purple-200"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Button>
              {/* Added Button for AI Advanced Features */}
              <Button variant="secondary" className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100" onClick={() => window.location.href = '/ai-advanced'}>
                <Brain className="w-4 h-4 mr-2" />
                IA Avancée (12 innovations)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs Section */}
        <Tabs defaultValue="missions" className="space-y-6">
          <TabsList className="w-full overflow-x-auto grid grid-flow-col auto-cols-max md:grid-cols-4 gap-1 p-1">
            <TabsTrigger value="overview" className="whitespace-nowrap text-xs md:text-sm">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="missions" className="whitespace-nowrap text-xs md:text-sm">Mes missions</TabsTrigger>
            <TabsTrigger value="analytics" className="whitespace-nowrap text-xs md:text-sm">Analytiques</TabsTrigger>
            <TabsTrigger value="ai-insights" className="whitespace-nowrap text-xs md:text-sm">Insights IA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {enableAIDashboard && (
              <div className="mt-8 space-y-8">
                <IntelligentDashboard />

                {/* Section test des nouvelles fonctionnalités IA */}
                <div className="border-t pt-8">
                  <h3 className="text-xl font-semibold mb-4">🧪 Nouvelles Fonctionnalités IA (Beta)</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Test Négociation IA */}
                    <AINegotiator 
                      negotiationData={{
                        initial_bid: 3000,
                        client_budget: 2500,
                        mission_complexity: 7,
                        provider_profile: {
                          rating: 4.8,
                          experience_years: 5,
                          success_rate: 0.92
                        }
                      }}
                    />

                    {/* Prédiction de Succès */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          🎯 Prédiction de Succès
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">87%</div>
                            <p className="text-sm text-gray-600">Probabilité de succès</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Facteurs techniques</span>
                              <span className="text-green-600">Excellent</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Correspondance budget</span>
                              <span className="text-yellow-600">Bon</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Délais réalistes</span>
                              <span className="text-green-600">Très bon</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            {userMissions.length > 0 ? (
              userMissions.map((mission) => (
                <Card key={mission.id} className="shadow-xl border-0 bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{mission.title}</h3>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Actif
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{mission.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                            {mission.location || 'Non spécifié'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                            {formatDate(mission.createdAt!)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-green-500" />
                            {mission.bids?.length || 0} candidature(s)
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text mb-2">
                          {formatBudget(mission.budget || '0')}
                        </div>
                        <p className="text-sm text-gray-500">Budget estimé</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir les offres
                      </Button>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Messages
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClipboardList className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucune mission encore</h3>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    Commencez par publier votre première mission et trouvez le prestataire idéal !
                  </p>
                  <Button 
                    onClick={() => setLocation('/create-mission')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transform transition hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Publier ma première mission
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="ai-insights">
            <IntelligentDashboard />
          </TabsContent>
        </Tabs>

      <AIAssistant 
        currentPage="dashboard" 
        userContext={{ 
          isProvider: true,
          completedProjects: 15 
        }} 
      />
    </div>
    </div>
  );
}