
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import type { MissionView, BidView } from '@shared/types';
import { dataApi } from '@/lib/api/services';
import { formatBudget, formatDate } from '@/lib/categories';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Hand, Plus, Eye, Edit, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { paths } from '../routes/paths';
import { useToast } from '@/hooks/use-toast';

// Utiliser le type normalisé MissionView qui inclut déjà les bids
type MissionWithBids = MissionView;

export default function Missions() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'posted' | 'bids'>('posted');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userMissions = [], isLoading: missionsLoading, error: missionsError } = useQuery<MissionWithBids[]>({
    queryKey: ['userMissions', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User ID manquant');
      }

      console.log('🔍 OPTIMIZED: Récupération des missions avec mappers pour user.id:', user.id);
      
      // Utiliser le service API centralisé avec mappers
      const normalizedMissions = await dataApi.getUserMissions(user.id);
      console.log('✅ PERFORMANCE BOOST: Missions normalisées récupérées:', normalizedMissions.length);
      
      return normalizedMissions;
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: userBids = [], isLoading: bidsLoading } = useQuery<BidView[]>({
    queryKey: ['userBids', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User ID manquant');
      }
      
      console.log('🔍 Récupération des bids avec mappers pour user.id:', user.id);
      
      // Utiliser le service API centralisé avec mappers
      const normalizedBids = await dataApi.getUserBids(user.id);
      console.log('✅ Bids normalisés récupérés:', normalizedBids.length);
      
      return normalizedBids;
    },
    enabled: !!user && user.type === 'provider',
  });

  const deleteMissionMutation = useMutation({
    mutationFn: async (missionId: number) => {
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete mission');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMissions'] });
      toast({
        title: t('toast.mission.deleted.title'),
        description: t('toast.mission.deleted.description'),
      });
    },
    onError: (error) => {
      toast({
        title: t('toast.error.title'),
        description: t('toast.error.deleteMission'),
        variant: "destructive",
      });
    },
  });

  const handleDeleteMission = (missionId: number) => {
    if (window.confirm(t('missions.deleteConfirm'))) {
      deleteMissionMutation.mutate(missionId);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: t('status.published'), variant: 'default' as const },
      open: { label: t('status.open'), variant: 'default' as const },
      in_progress: { label: t('status.in_progress'), variant: 'secondary' as const },
      completed: { label: t('status.completed'), variant: 'outline' as const },
      closed: { label: t('status.closed'), variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.published;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Debug: Log user info  
  console.log('👤 User actuel:', { id: user?.id, type: user?.type, name: user?.name });
  console.log('🔗 Mapping: user.id =', user?.id, '| client_id attendu:', user?.id);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('missions.loginRequired')}</h2>
          <p className="text-gray-600 mb-8">{t('missions.loginRequiredDesc')}</p>
          <Button onClick={() => setLocation('/')}>
            {t('missions.backHome')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Mes Missions
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Gérez vos missions et consultez les offres reçues
          </p>
        </div>
        <Button
          onClick={() => setLocation(paths.createMission)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Nouvelle Mission
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-6 sm:space-x-8">
          <button
            onClick={() => setActiveTab('posted')}
            className={`py-2 px-1 border-b-2 font-medium text-sm sm:text-base ${
              activeTab === 'posted'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Missions publiées ({userMissions.length})
          </button>
          {user.type === 'provider' && (
            <button
              onClick={() => setActiveTab('bids')}
              className={`py-2 px-1 border-b-2 font-medium text-sm sm:text-base ${
                activeTab === 'bids'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mes candidatures ({userBids.length})
            </button>
          )}
        </nav>
      </div>

      {/* Loading States */}
      {(missionsLoading || bidsLoading) && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      )}

      {/* Error State */}
      {missionsError && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg mb-4">Erreur de chargement</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Réessayer
          </Button>
        </div>
      )}

      {/* Posted Missions Tab */}
      {activeTab === 'posted' && !missionsLoading && (
        <div className="space-y-6">
          {userMissions.length > 0 ? (
            userMissions.map((mission) => (
              <Card key={mission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{mission.title}</CardTitle>
                        {getStatusBadge(mission.status || 'published')}
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">{mission.description}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-bold text-primary">
                        {mission.budgetDisplay}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(mission.createdAt!)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                      <span>Catégorie: {mission.category}</span>
                      <span>Lieu: {mission.location || 'Non spécifié'}</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{mission.bids?.length || 0} offre{(mission.bids?.length || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/missions/${mission.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir les offres
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(paths.editMission(mission.id?.toString() || ''))}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMission(mission.id!)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        disabled={deleteMissionMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>

                  {/* Aperçu des offres reçues */}
                  {mission.bids && mission.bids.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Dernières offres reçues :</p>
                      <div className="space-y-2">
                        {mission.bids.slice(0, 2).map((bid) => (
                          <div key={bid.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                            <span className="truncate flex-1">{bid.message || 'Candidature soumise'}</span>
                            <span className="font-medium text-primary ml-2">{bid.price || formatBudget(bid.amount.toString())}</span>
                          </div>
                        ))}
                        {mission.bids.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{mission.bids.length - 2} autre{mission.bids.length - 2 > 1 ? 's' : ''} offre{mission.bids.length - 2 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">Vous n'avez pas encore publié de missions</p>
              <Button
                onClick={() => setLocation(paths.createMission)}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première mission
              </Button>
            </div>
          )}
        </div>
      )}

      {/* My Bids Tab */}
      {activeTab === 'bids' && user.type === 'provider' && !bidsLoading && (
        <div className="space-y-6">
          {userBids.length > 0 ? (
            userBids.map((bid) => (
              <Card key={bid.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Candidature soumise
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{bid.message || 'Aucun message fourni'}</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Votre offre:</span>
                      <span className="text-xl font-bold text-primary ml-2">
                        {bid.price || formatBudget(bid.amount.toString())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">Délai: {bid.timeline_days ? `${bid.timeline_days} jours` : 'Non spécifié'}</span>
                      <Badge variant="secondary">
                        En attente
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Hand className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">Vous n'avez pas encore postulé à des missions</p>
              <Button
                onClick={() => setLocation('/marketplace')}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                Découvrir les missions
              </Button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
