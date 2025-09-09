import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import type { Mission, Bid } from '@shared/schema';
import { formatBudget, formatDate } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { ClipboardList, Hand, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { MissionDetailModal } from '@/components/missions/mission-detail-modal';
import { paths } from '../routes/paths';

export default function Missions() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'posted' | 'bids'>('posted');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const { data: userMissions = [] } = useQuery<Mission[]>({
    queryKey: ['/api/users', user?.id, 'missions'],
    enabled: !!user,
  });

  const { data: userBids = [] } = useQuery<Bid[]>({
    queryKey: ['/api/users', user?.id, 'bids'],
    enabled: !!user && user.type === 'provider',
  });

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
            Gérez vos projets et consultez les offres reçues
          </p>
        </div>
        <Button
          onClick={() => setLocation(paths.createMission)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Nouveau Projet
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
            Missions publiées
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
              Mes candidatures
            </button>
          )}
        </nav>
      </div>

      {/* Posted Missions Tab */}
      {activeTab === 'posted' && (
        <div className="space-y-6">
          {userMissions.length > 0 ? (
            userMissions.map((mission) => (
              <div key={mission.id} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{mission.title}</h3>
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3 sm:mb-0">
                    <span>Catégorie: {mission.category}</span>
                    <span>Lieu: {mission.location || 'Non spécifié'}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMissionId(mission.id)}
                    >
                      Voir les offres
                    </Button>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
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
      {activeTab === 'bids' && user.type === 'provider' && (
        <div className="space-y-6">
          {userBids.length > 0 ? (
            userBids.map((bid) => (
              <div key={bid.id} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mission candidatée
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{bid.proposal}</p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <span className="text-sm text-gray-500">Votre offre:</span>
                    <span className="text-xl font-bold text-primary ml-2">
                      {formatBudget(bid.price)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                    <span className="text-sm text-gray-500">Délai: {bid.timeline}</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      En attente
                    </span>
                  </div>
                </div>
              </div>
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