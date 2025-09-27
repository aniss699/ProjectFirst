import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import type { Mission } from '@shared/schema';
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
  Brain,
  BarChart3,
  Activity,
  Globe,
  Sparkles,
  TrendingDown,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Settings,
  Bell,
  Bookmark
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
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const { data: userMissions = [] } = useQuery<Mission[]>({
    queryKey: ['/api/users', user?.id, 'missions'],
    enabled: !!user,
  });

  const { data: userBids = [] } = useQuery({
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

  // Feature flag for AI Dashboard
  const enableAIDashboard = true; 

  // Métriques calculées avec optimisation
  const metrics = useMemo(() => {
    const totalBids = 0; // TODO: Implement bids count
    const averageBudget = userMissions.length > 0 
      ? userMissions.reduce((acc, mission) => acc + (mission.budget_value_cents || 0), 0) / userMissions.length 
      : 0;
    
    const completedMissions = userMissions.filter(m => m.status === 'completed').length;
    const activeProjects = userMissions.filter(m => m.status === 'open' || m.status === 'in_progress').length;
    const draftMissions = userMissions.filter(m => m.status === 'draft').length;
    
    // Calculs avancés
    const successRate = userMissions.length > 0 ? (completedMissions / userMissions.length) * 100 : 0;
    const avgBudgetEuros = averageBudget / 100;
    const totalRevenue = completedMissions * avgBudgetEuros;
    
    return {
      totalBids,
      averageBudget,
      completedMissions,
      activeProjects,
      draftMissions,
      successRate,
      avgBudgetEuros,
      totalRevenue,
      totalMissions: userMissions.length
    };
  }, [userMissions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simule un refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/10 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Connexion requise</h2>
            <p className="text-gray-300 mb-8">Connectez-vous pour accéder à votre espace professionnel</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Premium avec controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Dashboard Pro
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span>Bonjour {user.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {user.role === 'CLIENT' ? 'Client' : 'Prestataire'}
                  </Badge>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                {['7d', '30d', '90d'].map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      selectedPeriod === period 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              <Button 
                onClick={() => setLocation('/create-mission')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Mission
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs Premium Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Missions Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs opacity-90 font-medium">Missions totales</p>
                    <p className="text-2xl font-bold">{metrics.totalMissions}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-60" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((metrics.activeProjects / Math.max(metrics.totalMissions, 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs opacity-90">{metrics.activeProjects} actives</span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs opacity-90 font-medium">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold">€{metrics.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="flex items-center gap-2 text-xs opacity-90">
                <Sparkles className="w-3 h-3" />
                <span>Moyenne: €{Math.round(metrics.avgBudgetEuros).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs opacity-90 font-medium">Taux de succès</p>
                    <p className="text-2xl font-bold">{Math.round(metrics.successRate)}%</p>
                  </div>
                </div>
                <Target className="w-5 h-5 opacity-60" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'opacity-30'}`} />
                  ))}
                </div>
                <span className="text-xs opacity-90">4.8/5</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs opacity-90 font-medium">Activité</p>
                    <p className="text-2xl font-bold">{metrics.totalBids}</p>
                  </div>
                </div>
                <Bell className="w-5 h-5 opacity-60" />
              </div>
              <div className="flex items-center gap-2 text-xs opacity-90">
                <Clock className="w-3 h-3" />
                <span>Dernière activité: il y a 2h</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Enhanced Tabs Section */}
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="bg-white shadow-sm border-0 p-1">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Vue d'ensemble
                  </TabsTrigger>
                  <TabsTrigger value="missions" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Mes missions
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="ai-insights" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    IA Insights
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">
                {enableAIDashboard && (
                  <div className="space-y-6">
                    <IntelligentDashboard />
                    
                    {/* Quick Actions Premium */}
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Zap className="w-5 h-5 text-yellow-500" />
                          Actions rapides
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Button 
                            variant="outline" 
                            className="h-16 flex-col gap-2 hover:shadow-md transition-all"
                            onClick={() => setLocation('/create-mission')}
                          >
                            <Plus className="w-5 h-5 text-blue-500" />
                            <span className="text-xs">Créer mission</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-16 flex-col gap-2 hover:shadow-md transition-all"
                            onClick={() => setLocation('/marketplace')}
                          >
                            <Globe className="w-5 h-5 text-green-500" />
                            <span className="text-xs">Explorer</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-16 flex-col gap-2 hover:shadow-md transition-all"
                            onClick={() => setLocation('/messages')}
                          >
                            <MessageSquare className="w-5 h-5 text-purple-500" />
                            <span className="text-xs">Messages</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-16 flex-col gap-2 hover:shadow-md transition-all"
                          >
                            <Brain className="w-5 h-5 text-pink-500" />
                            <span className="text-xs">IA Avancée</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="missions" className="space-y-6">
                {userMissions.length > 0 ? (
                  <div className="grid gap-6">
                    {userMissions.map((mission) => (
                      <Card key={mission.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {mission.title}
                                </h3>
                                <Badge className={`
                                  ${mission.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                  ${mission.status === 'open' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                                  ${mission.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                  ${mission.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
                                `}>
                                  {mission.status}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-4 leading-relaxed">{mission.description}</p>
                              <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-blue-500" />
                                  {mission.location_data ? 'Défini' : 'Non spécifié'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  {formatDate(mission.created_at!)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-green-500" />
                                  0 candidature(s)
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                                {mission.budget_value_cents ? `€${(mission.budget_value_cents / 100).toLocaleString()}` : 'Non défini'}
                              </div>
                              <p className="text-sm text-gray-500">Budget estimé</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
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
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
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
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Recent Activity Widget */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mission créée</p>
                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nouveau message</p>
                    <p className="text-xs text-gray-500">Il y a 1 jour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Snapshot */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Missions terminées</span>
                    <span className="text-sm font-semibold">{metrics.completedMissions}</span>
                  </div>
                  <Progress value={metrics.successRate} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Taux de réponse</span>
                    <span className="text-sm font-semibold">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Satisfaction</span>
                    <span className="text-sm font-semibold">4.8/5</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Conseils Pro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="text-sm font-medium text-purple-700">💡 Optimisez vos briefs</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Des descriptions détaillées attirent 40% plus de candidatures qualifiées.
                    </p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="text-sm font-medium text-purple-700">🎯 Répondez rapidement</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Une réponse sous 2h augmente vos chances de succès de 60%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Assistant Floating */}
        <AIAssistant 
          currentPage="dashboard" 
          userContext={{ 
            isProvider: user.role === 'PRO',
            completedProjects: metrics.completedMissions,
            totalRevenue: metrics.totalRevenue
          }} 
        />
      </div>
    </div>
  );
}