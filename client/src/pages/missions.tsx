
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import type { Mission, Bid } from '@shared/schema';
import { formatBudget, formatDate } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Hand, Plus, Eye, Edit, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { MissionDetailModal } from '@/components/missions/mission-detail-modal';
import { paths } from '../routes/paths';
import { useToast } from '@/hooks/use-toast';

interface MissionWithBids extends Mission {
  bids: Bid[];
}

export default function Missions() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'posted' | 'bids'>('posted');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userMissions = [], isLoading: missionsLoading, error: missionsError } = useQuery<MissionWithBids[]>({
    queryKey: ['userMissions', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User ID manquant');
      }

      console.log('🔍 OPTIMIZED: Récupération des missions avec offres pour user.id:', user.id);
      
      const response = await fetch(`/api/missions/users/${user.id}/missions`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API missions:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const missionsWithBids = await response.json();
      console.log('✅ PERFORMANCE BOOST: Missions avec offres récupérées en 1 seule requête:', missionsWithBids.length);
      console.log('✅ ELIMINATED N+1: Pas de requêtes individuelles pour les offres');
      
      return missionsWithBids;
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: userBids = [], isLoading: bidsLoading } = useQuery<Bid[]>({
    queryKey: ['userBids', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/missions/users/${user?.id}/bids`);
      if (!response.ok) {
        throw new Error('Failed to fetch user bids');
      }
      return response.json();
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
        title: "Mission supprimée",
        description: "Votre mission a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la mission.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteMission = (missionId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      deleteMissionMutation.mutate(missionId);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Publiée', variant: 'default' as const },
      open: { label: 'Ouverte', variant: 'default' as const },
      in_progress: { label: 'En cours', variant: 'secondary' as const },
      completed: { label: 'Terminée', variant: 'outline' as const },
      closed: { label: 'Fermée', variant: 'destructive' as const },
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-8">Veuillez vous connecter pour voir vos missions</p>
          <Button onClick={() => setLocation('/')}>
            Retour à l'accueil
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
                        {formatBudget(mission.budget || '0')}
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
                        onClick={() => setSelectedMissionId(mission.id?.toString() || null)}
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
                            <span className="truncate flex-1">{bid.proposal}</span>
                            <span className="font-medium text-primary ml-2">{formatBudget(bid.price)}</span>
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
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{bid.proposal}</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Votre offre:</span>
                      <span className="text-xl font-bold text-primary ml-2">
                        {formatBudget(bid.price)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">Délai: {bid.timeline}</span>
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

      <MissionDetailModal
        missionId={selectedMissionId}
        isOpen={!!selectedMissionId}
        onClose={() => setSelectedMissionId(null)}
      />
    </div>
  );
}
