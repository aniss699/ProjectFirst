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
import { NotificationCenter, useNotifications } from '@/components/notifications/notification-center';
import { ChatSystem } from '@/components/messaging/chat-system';
import { AchievementDashboard } from '@/components/gamification/achievement-dashboard';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';
import { 
  ClipboardList, 
  DollarSign, 
  Plus,
  Calendar,
  MapPin,
  Clock,
  Award,
  Eye,
  MessageSquare,
  Users,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  Briefcase,
  Star,
  Bell,
  Settings,
  Heart,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    notifications, 
    addNotification, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const { data: userMissions = [] } = useQuery<Mission[]>({
    queryKey: ['/api/users', user?.id, 'missions'],
    enabled: !!user,
  });

  // Métriques simples et universelles
  const metrics = useMemo(() => {
    const completedMissions = userMissions.filter(m => m.status === 'completed').length;
    const activeMissions = userMissions.filter(m => m.status === 'open' || m.status === 'in_progress').length;
    const draftMissions = userMissions.filter(m => m.status === 'draft').length;

    const totalBudget = userMissions.reduce((acc, mission) => acc + (mission.budget_value_cents || 0), 0) / 100;
    const averageBudget = userMissions.length > 0 ? totalBudget / userMissions.length : 0;

    return {
      totalMissions: userMissions.length,
      completedMissions,
      activeMissions,
      draftMissions,
      totalBudget,
      averageBudget
    };
  }, [userMissions]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Connexion requise</h2>
            <p className="text-gray-600 mb-6">Connectez-vous pour accéder à votre tableau de bord</p>
            <Button 
              onClick={() => setLocation('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* En-tête élégant */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
                Bonjour {user.name} !
              </h1>
              <p className="text-gray-600 text-lg">
                Voici un aperçu de votre activité
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/create-mission')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 text-base font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle demande
            </Button>
          </div>
        </div>

        {/* Statistiques principales - design amélioré */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-blue-100 hover:to-blue-150">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Demandes totales</p>
                  <p className="text-3xl font-bold text-blue-800 mt-2">{metrics.totalMissions}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-orange-100 hover:to-orange-150">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">En cours</p>
                  <p className="text-3xl font-bold text-orange-800 mt-2">{metrics.activeMissions}</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-xl shadow-md">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-green-100 hover:to-green-150">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Terminées</p>
                  <p className="text-3xl font-bold text-green-800 mt-2">{metrics.completedMissions}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl shadow-md">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-purple-100 hover:to-purple-150">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Budget moyen</p>
                  <p className="text-3xl font-bold text-purple-800 mt-2">
                    {metrics.averageBudget > 0 ? `€${Math.round(metrics.averageBudget)}` : '€0'}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation par onglets - design moderne et responsive */}
        <Card className="mb-10 bg-white shadow-xl border-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full bg-gradient-to-r from-gray-50 to-gray-100 p-1 md:p-2 rounded-none min-h-[50px] md:min-h-[60px]">
              <TabsTrigger value="overview" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 px-1 md:px-3 py-2 md:py-3 text-xs md:text-sm">
                <Activity className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:block">Vue d'ensemble</span>
                <span className="sm:hidden text-[10px] leading-tight text-center">Vue</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 px-1 md:px-3 py-2 md:py-3 text-xs md:text-sm relative">
                <Bell className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:block">Notifications</span>
                <span className="sm:hidden text-[10px] leading-tight text-center">Notifs</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 md:relative md:top-0 md:right-0 md:ml-1 h-4 w-4 md:h-5 md:w-5 p-0 text-[10px] md:text-xs animate-pulse flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 px-1 md:px-3 py-2 md:py-3 text-xs md:text-sm">
                <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:block">Calendrier</span>
                <span className="sm:hidden text-[10px] leading-tight text-center">Agenda</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 px-1 md:px-3 py-2 md:py-3 text-xs md:text-sm">
                <Award className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:block">Succès</span>
                <span className="sm:hidden text-[10px] leading-tight text-center">Succès</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 px-1 md:px-3 py-2 md:py-3 text-xs md:text-sm">
                <MessageSquare className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:block">Messages</span>
                <span className="sm:hidden text-[10px] leading-tight text-center">Msg</span>
              </TabsTrigger>
            </TabsList>

            {/* Onglet Vue d'ensemble */}
            <TabsContent value="overview">
              {/* Actions rapides - design amélioré */}
              <Card className="mb-10 bg-white shadow-xl border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-3 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 group"
                      onClick={() => setLocation('/create-mission')}
                    >
                      <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Nouvelle demande</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-3 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 transform hover:scale-105 group"
                      onClick={() => setLocation('/missions')}
                    >
                      <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Mes demandes</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-3 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 group"
                      onClick={() => setLocation('/marketplace')}
                    >
                      <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Trouver des pros</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-3 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 group"
                      onClick={() => setActiveTab('messages')}
                    >
                      <div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Messages</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Liste des demandes récentes */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Mes demandes récentes</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation('/missions')}
                >
                  Voir tout
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {userMissions.length > 0 ? (
                  <div className="space-y-4">
                    {userMissions.slice(0, 3).map((mission) => (
                      <div key={mission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{mission.title}</h3>
                          <Badge className={`
                            ${mission.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                            ${mission.status === 'open' ? 'bg-blue-100 text-blue-800' : ''}
                            ${mission.status === 'in_progress' ? 'bg-orange-100 text-orange-800' : ''}
                            ${mission.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {mission.status === 'completed' ? 'Terminée' : 
                             mission.status === 'open' ? 'Ouverte' :
                             mission.status === 'in_progress' ? 'En cours' : 'Brouillon'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{mission.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(mission.created_at!)}
                            </div>
                            {mission.budget_value_cents && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                €{(mission.budget_value_cents / 100).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setLocation(`/mission-detail/${mission.id}`)}
                          >
                            Voir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune demande</h3>
                    <p className="text-gray-600 mb-6">Publiez votre première demande pour trouver des professionnels</p>
                    <Button 
                      onClick={() => setLocation('/create-mission')}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer ma première demande
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec informations utiles */}
          <div className="space-y-6">

            {/* Progression du profil - design amélioré */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Mon profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-medium text-gray-700">Profil complété</span>
                      <span className="font-bold text-blue-600">75%</span>
                    </div>
                    <Progress value={75} className="h-3 bg-gray-200" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 font-semibold"
                    onClick={() => setLocation('/profile')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Compléter mon profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recommandations IA - design premium */}
            <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-bl-3xl"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  Recommandations IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-sm font-semibold text-blue-700 mb-2">🎯 Optimisez votre profil</p>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      Complétez vos compétences pour augmenter votre visibilité de 30%.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all"
                      onClick={() => setLocation('/profile')}
                    >
                      Améliorer
                    </Button>
                  </div>
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-sm font-semibold text-green-700 mb-2">📈 Prix suggéré</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Basé sur vos projets similaires : augmentez vos tarifs de 15%.
                    </p>
                  </div>
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-sm font-semibold text-orange-700 mb-2">⚡ Actions rapides</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Répondre aux messages en moins de 2h augmente vos chances de 40%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
            </TabsContent>

            {/* Onglet Notifications */}
            <TabsContent value="notifications">
              <div className="max-w-2xl mx-auto">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDelete={deleteNotification}
                />
              </div>
            </TabsContent>

            {/* Onglet Calendrier */}
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Gestion de vos disponibilités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AvailabilityCalendar userId={user?.id?.toString() || ''} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Succès */}
            <TabsContent value="achievements">
              <AchievementDashboard />
            </TabsContent>

            {/* Onglet Messages */}
            <TabsContent value="messages">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversations récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            JD
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Jean Dupont</p>
                            <p className="text-xs text-gray-600">Projet développement web...</p>
                            <p className="text-xs text-gray-500">Il y a 2h</p>
                          </div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                            ML
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Marie Lefebvre</p>
                            <p className="text-xs text-gray-600">Design graphique terminé</p>
                            <p className="text-xs text-gray-500">Il y a 1j</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-2">
                  <ChatSystem
                    conversationId="demo-conv"
                    currentUserId={user?.id?.toString() || ''}
                    otherUser={{ id: '2', name: 'Jean Dupont' }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}