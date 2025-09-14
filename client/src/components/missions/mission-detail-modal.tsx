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
  const [isAnimating, setIsAnimating] = useState(false);

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
        className={`w-3 h-3 ${
          i < Math.floor(numRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Loading state amélioré avec animations
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl mx-auto p-0 gap-0 bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-xl overflow-hidden">
          <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 border-3 border-transparent border-t-purple-600 opacity-75"></div>
              </div>
              <div className="text-center">
                <p className="text-base text-gray-700 dark:text-gray-300 font-semibold mb-1">Chargement de la mission...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Récupération des détails</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state amélioré
  if (error || !mission) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto p-0 gap-0 bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-red-900/20 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mission introuvable</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {error instanceof Error ? error.message : 'Cette mission n\'existe plus ou a été supprimée.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 transition-all duration-200"
              >
                Recharger la page
              </Button>
              <Button 
                onClick={onClose} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
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

  // Gérer les animations de transition
  const handleTabChange = (newTab: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-h-[90vh] max-w-4xl p-0 gap-0 bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-xl overflow-hidden flex flex-col transition-all duration-300">
        <DialogHeader className="sr-only">
          <DialogTitle>{mission.title}</DialogTitle>
          <DialogDescription>Détails de la mission</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col min-h-0 max-h-[90vh]">

        {/* Header Mobile/Desktop avec design amélioré */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white relative flex-shrink-0 shadow-xl overflow-hidden">
            {/* Effet de background animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between p-3 md:p-6">
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-2 rounded-full md:hidden"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1 md:flex-none min-w-0">
                <h2 className="text-lg md:text-2xl font-bold leading-tight pr-2 md:pr-0 truncate">
                  {mission.title}
                </h2>
                <p className="text-blue-100 text-sm md:text-base mt-1 opacity-90 truncate">
                  Par {mission.clientName} • {mission.budgetDisplay}
                </p>
              </div>

              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-1.5 rounded-full"
                aria-label="Fermer la modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats rapides */}
            <div className="px-3 pb-4 md:px-6 md:pb-6">
              <div className="flex items-center gap-3 md:gap-6 text-sm text-blue-100 flex-wrap">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{sortedBids.length} candidature{sortedBids.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className="hidden sm:inline">{formatDate(mission.createdAt)}</span>
                  <span className="sm:hidden">Créé</span>
                </div>
                {category && (
                  <Badge className="bg-white/25 text-white border-none text-sm px-3 py-1 rounded-full font-medium">
                    {category.name}
                  </Badge>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Navigation Tabs avec design amélioré */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative">
            {/* Ligne décorative animée */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
            
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full h-14 md:h-16 bg-transparent rounded-none border-none p-0 relative">
              {/* Indicateur de tab active avec animation fluide */}
              <div 
                className={`absolute bottom-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out rounded-t-full shadow-lg ${
                  activeTab === 'overview' ? 'left-0 w-1/3' :
                  activeTab === 'bids' ? `left-1/3 w-1/3 ${isTeamMission ? '' : 'left-1/2 w-1/2'}` :
                  activeTab === 'team' ? 'left-2/3 w-1/3' : ''
                }`}
                style={{
                  width: isTeamMission ? '33.333333%' : '50%',
                  left: activeTab === 'overview' ? '0%' : 
                        activeTab === 'bids' ? (isTeamMission ? '33.333333%' : '50%') :
                        activeTab === 'team' ? '66.666667%' : '0%'
                }}
              />
              
              <div className="flex w-full relative z-10">
                <button
                  onClick={() => handleTabChange('overview')}
                  className={`flex-1 h-14 md:h-16 text-sm font-semibold px-3 transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                    activeTab === 'overview'
                      ? 'text-blue-600 dark:text-blue-400 transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Briefcase className={`w-4 h-4 transition-all duration-300 ${
                    activeTab === 'overview' ? 'text-blue-600 dark:text-blue-400 animate-pulse' : ''
                  }`} />
                  <span className="hidden sm:inline">Aperçu</span>
                  <span className="sm:hidden">Info</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('bids')}
                  className={`flex-1 h-14 md:h-16 text-sm font-semibold px-3 transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                    activeTab === 'bids'
                      ? 'text-blue-600 dark:text-blue-400 transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Users className={`w-4 h-4 transition-all duration-300 ${
                    activeTab === 'bids' ? 'text-blue-600 dark:text-blue-400 animate-pulse' : ''
                  }`} />
                  <span className="hidden sm:inline">Offres</span>
                  <span className="sm:hidden flex items-center gap-1">
                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
                      activeTab === 'bids' 
                        ? 'bg-blue-600 text-white scale-110' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {sortedBids.length}
                    </span>
                  </span>
                  <span className="hidden sm:inline">
                    <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold rounded-full transition-all duration-300 ml-1 ${
                      activeTab === 'bids' 
                        ? 'bg-blue-600 text-white scale-110' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {sortedBids.length}
                    </span>
                  </span>
                </button>
                
                {isTeamMission && (
                  <button
                    onClick={() => handleTabChange('team')}
                    className={`flex-1 h-14 md:h-16 text-sm font-semibold px-3 transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                      activeTab === 'team'
                        ? 'text-blue-600 dark:text-blue-400 transform scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Target className={`w-4 h-4 transition-all duration-300 ${
                      activeTab === 'team' ? 'text-blue-600 dark:text-blue-400 animate-pulse' : ''
                    }`} />
                    <span className="hidden sm:inline">Équipe</span>
                    <span className="sm:hidden">Team</span>
                  </button>
                )}
              </div>
            </TabsList>

            {/* Content avec animations de transition */}
            <div className="flex-1 min-h-0 relative">

              {/* Overview Tab */}
              <TabsContent 
                value="overview" 
                className={`m-0 absolute inset-0 transition-all duration-300 ease-out ${
                  activeTab === 'overview' 
                    ? 'opacity-100 translate-x-0 pointer-events-auto' 
                    : 'opacity-0 translate-x-4 pointer-events-none'
                } data-[state=active]:flex data-[state=active]:flex-col`}
              >
                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-6 md:pb-8 bg-gray-50 dark:bg-gray-900/50 min-h-full">

                  {/* Description */}
                  <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Description du projet</h3>
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">{mission.description}</p>
                  </div>

                  {/* Informations clés */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <Euro className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 text-xs md:text-sm">Budget</span>
                      </div>
                      <div className="text-lg md:text-2xl font-bold text-green-600">
                        {mission.budgetDisplay}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 text-xs md:text-sm">Lieu</span>
                      </div>
                      <div className="text-blue-600 font-medium text-xs md:text-base truncate">
                        {mission.location || 'Non spécifié'}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 md:p-4 border border-purple-100 col-span-2 md:col-span-1">
                      <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 text-xs md:text-sm">Intérêt</span>
                      </div>
                      <div className="text-purple-600 font-medium text-xs md:text-base">
                        {sortedBids.length} candidature{sortedBids.length !== 1 ? 's' : ''}
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
              <TabsContent 
                value="bids" 
                className={`m-0 absolute inset-0 transition-all duration-300 ease-out ${
                  activeTab === 'bids' 
                    ? 'opacity-100 translate-x-0 pointer-events-auto' 
                    : 'opacity-0 translate-x-4 pointer-events-none'
                } data-[state=active]:flex data-[state=active]:flex-col`}
              >
                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-6 md:pb-8 bg-gray-50 dark:bg-gray-900/50 min-h-full">

                  {sortedBids.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 md:p-12 text-center shadow-sm border">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature</h4>
                      <p className="text-sm text-gray-500">Les prestataires peuvent encore postuler</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedBids.map((bid: BidView, index: number) => (
                        <div key={bid.id} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border hover:shadow-md transition-shadow">

                          {/* Header offre */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {bid.providerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h5
                                    className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors text-sm md:text-base"
                                    onClick={() => {
                                      setSelectedProviderId(bid.providerId);
                                      setSelectedProviderName(bid.providerName);
                                    }}
                                  >
                                    {bid.providerName}
                                  </h5>
                                  {/* Badge pour le type de candidature */}
                                  {bid.bid_type === 'team' && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 border-purple-200">
                                      <Users className="w-3 h-3 mr-1" />
                                      Équipe
                                    </Badge>
                                  )}
                                  {bid.bid_type === 'open_team' && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-200">
                                      <Users className="w-3 h-3 mr-1" />
                                      Équipe Ouverte
                                    </Badge>
                                  )}
                                  {(!bid.bid_type || bid.bid_type === 'individual') && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
                                      <User className="w-3 h-3 mr-1" />
                                      Individuel
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center">
                                    {renderStars(bid.rating || '5.0')}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-1">
                                    {parseFloat(bid.rating || '5.0').toFixed(1)}/5
                                  </span>
                                  {index === 0 && sortedBids.length > 1 && (
                                    <Badge className="bg-green-100 text-green-700 text-xs ml-2">
                                      Meilleure offre
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg md:text-xl font-bold text-green-600">
                                {bid.price || formatBudget(bid.amount.toString())}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {bid.timeline_days ? `${bid.timeline_days} jours` : 'Non spécifié'}
                              </div>
                            </div>
                          </div>

                          {/* Proposition */}
                          <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 border-l-4 border-blue-400">
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">{bid.message || 'Candidature soumise'}</p>
                          </div>

                          {/* Actions */}
                          {user && (mission.clientName === user.name || mission.userName === user.name) && (
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <Button
                                onClick={() => {
                                  setSelectedBidId(bid.id);
                                  setSelectedBidderName(bid.providerName);
                                }}
                                variant="outline"
                                size="sm"
                                className="flex items-center justify-center gap-2 text-sm"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Répondre
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 text-sm"
                              >
                                <UserCheck className="w-4 h-4" />
                                Accepter
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
                <TabsContent 
                  value="team" 
                  className={`m-0 absolute inset-0 transition-all duration-300 ease-out ${
                    activeTab === 'team' 
                      ? 'opacity-100 translate-x-0 pointer-events-auto' 
                      : 'opacity-0 translate-x-4 pointer-events-none'
                  } data-[state=active]:flex data-[state=active]:flex-col`}
                >
                  <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-6 md:pb-8 bg-gray-50 dark:bg-gray-900/50 min-h-full">
                    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm md:text-base">
                        <Target className="w-5 h-5" />
                        Composition de l'équipe
                      </h3>

                      <div className="space-y-3">
                        {mission.teamRequirements?.map((requirement: any, index: number) => (
                          <div key={index} className="border-l-4 border-l-blue-500 bg-blue-50/50 rounded-r-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm md:text-base">{requirement.role}</h4>
                                <p className="text-gray-600 text-xs md:text-sm">{requirement.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm md:text-base font-bold text-green-600">
                                  {formatBudget(requirement.budget || '0')}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {requirement.quantity} personne{requirement.quantity > 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>

                            {requirement.skills && requirement.skills.length > 0 && (
                              <div>
                                <h5 className="font-medium text-xs mb-2">Compétences :</h5>
                                <div className="flex flex-wrap gap-1">
                                  {requirement.skills.map((skill: string, skillIndex: number) => (
                                    <Badge key={skillIndex} variant="secondary" className="text-xs">
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