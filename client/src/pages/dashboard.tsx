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
  Star
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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

        {/* En-tête simple */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Bonjour {user.name} !
              </h1>
              <p className="text-gray-600">
                Voici un aperçu de votre activité
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/create-mission')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Button>
          </div>
        </div>

        {/* Statistiques principales - simples */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Demandes totales</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.totalMissions}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.activeMissions}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.completedMissions}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Budget moyen</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics.averageBudget > 0 ? `€${Math.round(metrics.averageBudget)}` : '€0'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="mb-8 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setLocation('/create-mission')}
              >
                <Plus className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Nouvelle demande</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setLocation('/missions')}
              >
                <Eye className="w-5 h-5 text-green-500" />
                <span className="text-sm">Mes demandes</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setLocation('/marketplace')}
              >
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm">Trouver des pros</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setLocation('/messages')}
              >
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Messages</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal simplifié */}
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

            {/* Progression du profil */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Mon profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profil complété</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setLocation('/profile')}
                  >
                    Compléter mon profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conseils pratiques */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Conseils
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white/70 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">💡 Soyez précis</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Plus votre demande est détaillée, plus vous recevrez de propositions adaptées.
                    </p>
                  </div>
                  <div className="p-3 bg-white/70 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">⏱️ Répondez rapidement</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Une réponse rapide améliore vos chances de trouver le bon professionnel.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}