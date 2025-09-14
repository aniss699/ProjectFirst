import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import type { MissionView, BidView } from '@shared/types';
import { dataApi } from '@/lib/api/services';
import { formatBudget, formatDate, getCategoryById } from '@/lib/categories';
import { BidForm } from './bid-form';
import { BidTabs } from './bid-tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MapPin,
  Calendar,
  Users,
  User,
  Star,
  Euro,
  Briefcase,
  MessageCircle,
  UserCheck,
  Clock,
  Target,
  Award,
  AlertCircle,
  X,
  ChevronLeft,
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react';
import { ProviderProfileModal } from './provider-profile-modal';
import { BidResponseModal } from './bid-response-modal';
import SmartBidAnalyzer from '@/components/ai/smart-bid-analyzer';


interface MissionDetailModalProps {
  missionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MissionDetailModal({ missionId, isOpen, onClose }: MissionDetailModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedProviderName, setSelectedProviderName] = useState<string>('');
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [selectedBidderName, setSelectedBidderName] = useState<string>('');
  const [showBidForm, setShowBidForm] = useState(false);
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);

  // Fetch mission data avec mappers normalisés
  const { data: mission, isLoading, error } = useQuery<MissionView>({
    queryKey: ['mission-detail', missionId],
    queryFn: async () => {
      if (!missionId) {
        throw new Error('ID de mission manquant');
      }

      console.log('🔍 Chargement mission avec mappers ID:', missionId);

      // Utiliser le service API centralisé avec mappers
      const normalizedMission = await dataApi.getMissionById(missionId);
      console.log('✅ Mission normalisée chargée:', normalizedMission.title);
      return normalizedMission;
    },
    enabled: !!missionId && isOpen,
    retry: 1,
    retryDelay: 2000,
    staleTime: 30000,
  });

  // Fonction de rendu des étoiles
  const renderStars = (rating: string | number) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(numRating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  // Loading state simplifié et élégant
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 border-0 shadow-xl rounded-2xl">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Chargement de la mission</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Récupération des détails...</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state simplifié
  if (error || !mission) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto p-8 bg-white dark:bg-gray-900 border-0 shadow-xl rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Mission introuvable</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {error instanceof Error ? error.message : 'Cette mission n\'existe plus ou a été supprimée.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Recharger
              </Button>
              <Button 
                onClick={onClose} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const category = getCategoryById(mission.category);
  // Avec les types normalisés, amount est déjà un nombre
  const sortedBids = mission.bids ? [...mission.bids].sort((a, b) => a.amount - b.amount) : [];
  const isTeamMission = mission.teamRequirements && mission.teamRequirements.length > 0;

  // Navigation simplifiée sans animations complexes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-h-[90vh] max-w-4xl p-0 gap-0 bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-xl overflow-hidden flex flex-col transition-all duration-300">
        <DialogHeader className="sr-only">
          <DialogTitle>{mission.title}</DialogTitle>
          <DialogDescription>Détails de la mission</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col min-h-0 max-h-[90vh]">

        {/* Header simplifié et élégant */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between p-4 md:p-6">
            {/* Bouton retour mobile */}
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="md:hidden p-2"
              aria-label="Retour au marketplace"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Informations principales */}
            <div className="flex-1 min-w-0 md:pr-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                    {mission.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {mission.clientName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {mission.budgetDisplay}
                    </span>
                    {category && (
                      <Badge variant="secondary" className="text-xs">
                        {category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions header */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mr-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {sortedBids.length}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {mission.createdAt ? formatDate(mission.createdAt) : 'Date non spécifiée'}
                </span>
              </div>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation simplifiée et moderne */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full bg-transparent rounded-none border-none p-0 h-auto">
              <div className="flex w-full">
                <TabsTrigger 
                  value="overview"
                  className="flex-1 h-12 text-sm font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Détails</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="bids"
                  className="flex-1 h-12 text-sm font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Offres</span>
                  <Badge variant="secondary" className="text-xs">
                    {sortedBids.length}
                  </Badge>
                </TabsTrigger>
                
                {isTeamMission && (
                  <TabsTrigger 
                    value="team"
                    className="flex-1 h-12 text-sm font-medium data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Équipe
                  </TabsTrigger>
                )}
              </div>
            </TabsList>

            {/* Contenu simplifié */}
            <div className="flex-1 min-h-0">

              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0 h-full">
                <div className="h-full overflow-y-auto">
                  <div className="p-6 space-y-6">

                    {/* Description principale */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Description du projet
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {mission.description}
                      </p>
                    </div>

                    {/* Informations en grid simplifié */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Euro className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                              {mission.budgetDisplay}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Localisation</p>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                              {mission.location || 'Non spécifié'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Candidatures</p>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                              {sortedBids.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Actions pour prestataires - Nouveaux onglets de candidature */}
                  {user && user.type === 'provider' && mission.clientName !== user.name && (
                    <BidTabs 
                      mission={mission}
                      user={user}
                      sortedBids={sortedBids}
                      showAIAnalyzer={showAIAnalyzer}
                      setShowAIAnalyzer={setShowAIAnalyzer}
                      showBidForm={showBidForm}
                      setShowBidForm={setShowBidForm}
                    />
                  )}

                  {/* Message pour sa propre mission */}
                  {user && user.type === 'provider' && mission.clientName === user.name && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-blue-700 font-medium text-sm">Ceci est votre mission</p>
                      </div>
                    </div>
                  )}
                    </div>
                  </div>
              </TabsContent>

              {/* Bids Tab */}
              <TabsContent value="bids" className="m-0 h-full">
                <div className="h-full overflow-y-auto">
                  <div className="p-6">

                    {sortedBids.length === 0 ? (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Aucune candidature</h3>
                        <p className="text-gray-500 dark:text-gray-400">Cette mission n'a pas encore reçu d'offres de prestataires</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedBids.map((bid: BidView, index: number) => (
                          <div key={bid.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">

                            {/* En-tête de l'offre */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                  {bid.providerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4
                                      className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                      onClick={() => {
                                        setSelectedProviderId(bid.providerId);
                                        setSelectedProviderName(bid.providerName);
                                      }}
                                    >
                                      {bid.providerName}
                                    </h4>
                                    {index === 0 && sortedBids.length > 1 && (
                                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        Meilleure offre
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                      {renderStars(bid.rating || '5.0')}
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {parseFloat(bid.rating || '5.0').toFixed(1)}/5
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                                  {bid.price || formatBudget(bid.amount.toString())}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {bid.timeline_days ? `${bid.timeline_days} jours` : 'Non spécifié'}
                                </div>
                              </div>
                            </div>

                            {/* Message de la proposition */}
                            {bid.message && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {bid.message}
                                </p>
                              </div>
                            )}

                            {/* Actions pour les clients */}
                            {user && (mission.clientName === user.name || mission.userName === user.name) && (
                              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                  onClick={() => {
                                    setSelectedBidId(bid.id);
                                    setSelectedBidderName(bid.providerName);
                                  }}
                                  variant="outline"
                                  className="flex items-center gap-2"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Contacter
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Accepter l'offre
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                  )}
                    </div>
                  </div>
              </TabsContent>

              {/* Team Tab */}
              {isTeamMission && (
                <TabsContent value="team" className="m-0 h-full">
                  <div className="h-full overflow-y-auto">
                    <div className="p-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          Composition de l'équipe requise
                        </h2>

                        <div className="space-y-4">
                          {mission.teamRequirements?.map((requirement: any, index: number) => (
                            <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-5 border-l-4 border-blue-500">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {requirement.role}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                                    {requirement.description}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
                                    {formatBudget(requirement.budget || '0')}
                                  </div>
                                  <Badge variant="outline" className="text-sm">
                                    {requirement.quantity} personne{requirement.quantity > 1 ? 's' : ''}
                                  </Badge>
                                </div>
                              </div>

                              {requirement.skills && requirement.skills.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    Compétences requises :
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {requirement.skills.map((skill: string, skillIndex: number) => (
                                      <Badge key={skillIndex} variant="secondary" className="text-sm px-3 py-1">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* Modals */}
      <ProviderProfileModal
        providerId={selectedProviderId}
        providerName={selectedProviderName}
        isOpen={!!selectedProviderId}
        onClose={() => {
          setSelectedProviderId(null);
          setSelectedProviderName('');
        }}
      />

      <BidResponseModal
        bidId={selectedBidId}
        bidderName={selectedBidderName}
        isOpen={!!selectedBidId}
        onClose={() => {
          setSelectedBidId(null);
          setSelectedBidderName('');
        }}
      />
    </Dialog>
  );
}