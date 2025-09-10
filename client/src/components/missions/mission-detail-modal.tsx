import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MissionWithBids, Bid } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { formatBudget, formatDate, getCategoryById } from '@/lib/categories';
import { BidForm } from './bid-form';
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

  // Fetch mission data avec gestion d'erreur améliorée
  const { data: mission, isLoading, error } = useQuery<MissionWithBids>({
    queryKey: ['mission-detail', missionId],
    queryFn: async () => {
      if (!missionId) {
        throw new Error('ID de mission manquant');
      }

      console.log('🔍 Chargement mission ID:', missionId);

      try {
        const response = await fetch(`/api/missions/${missionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erreur API mission:', response.status, errorText);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Mission chargée:', data?.title || 'Sans titre');
        return data;
      } catch (fetchError) {
        console.error('❌ Erreur réseau mission:', fetchError);
        throw fetchError;
      }
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

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto p-0 gap-0 bg-white">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-sm text-gray-500 font-medium">Chargement...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (error || !mission) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto p-6 gap-4 bg-white">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-sm text-gray-500 mb-6">
              {error instanceof Error ? error.message : 'Mission introuvable'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Recharger
              </Button>
              <Button onClick={onClose} size="sm">Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const category = getCategoryById(mission.category);
  const sortedBids = mission.bids ? [...mission.bids].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)) : [];
  const isTeamMission = mission.teamRequirements && mission.teamRequirements.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-h-[90vh] max-w-4xl p-0 gap-0 bg-gray-50 rounded-xl flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>{mission.title}</DialogTitle>
          <DialogDescription>Détails de la mission</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col min-h-0 max-h-[90vh]"></div>

        {/* Header Mobile/Desktop */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white relative flex-shrink-0">
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
                <h2 className="text-base md:text-xl font-bold leading-tight pr-2 md:pr-0 truncate">
                  {mission.title}
                </h2>
                <p className="text-blue-100 text-xs md:text-sm mt-1 opacity-90 truncate">
                  Par {mission.clientName} • {formatBudget(mission.budget || '0')}
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
            <div className="px-3 pb-3 md:px-6 md:pb-4">
              <div className="flex items-center gap-2 md:gap-4 text-xs text-blue-100 flex-wrap">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{sortedBids.length} candidature{sortedBids.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className="hidden sm:inline">{formatDate(mission.createdAt || new Date().toISOString())}</span>
                  <span className="sm:hidden">Créé</span>
                </div>
                {category && (
                  <Badge className="bg-white/20 text-white border-none text-xs px-1.5 py-0.5">
                    {category.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border-b flex-shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-10 md:h-12 bg-transparent rounded-none border-none p-0">
              <div className="flex w-full">
                <TabsTrigger
                  value="overview"
                  className="flex-1 h-10 md:h-12 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2"
                >
                  <Briefcase className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="hidden sm:inline">Aperçu</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bids"
                  className="flex-1 h-10 md:h-12 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2"
                >
                  <Users className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="hidden sm:inline">Offres ({sortedBids.length})</span>
                  <span className="sm:hidden">({sortedBids.length})</span>
                </TabsTrigger>
                {isTeamMission && (
                  <TabsTrigger
                    value="team"
                    className="flex-1 h-10 md:h-12 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2"
                  >
                    <Target className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Équipe</span>
                    <span className="sm:hidden">Team</span>
                  </TabsTrigger>
                )}
              </div>
            </TabsList>

            {/* Content */}
            <div className="flex-1 min-h-0">

              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300">
                  <div className="p-3 md:p-6 space-y-3 md:space-y-4 pb-6 md:pb-8">

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
                        {formatBudget(mission.budget || '0')}
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

                  {/* Actions pour prestataires */}
                  {user && user.type === 'provider' && mission.clientName !== user.name && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 md:p-6 border border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">Candidater à cette mission</h4>
                          <p className="text-xs md:text-sm text-gray-600">Soumettez votre proposition</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          onClick={() => setShowAIAnalyzer(!showAIAnalyzer)}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm"
                          size="default"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Analyser avec l'IA
                        </Button>

                        <Button
                          onClick={() => setShowBidForm(!showBidForm)}
                          className="w-full bg-green-600 hover:bg-green-700 text-sm"
                          size="default"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {showBidForm ? 'Masquer le formulaire' : 'Soumettre une offre'}
                        </Button>
                      </div>

                      {/* AI Analyzer */}
                      {showAIAnalyzer && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <SmartBidAnalyzer
                            missionTitle={mission.title}
                            missionDescription={mission.description}
                            missionBudget={parseFloat(mission.budget || '0')}
                            missionCategory={mission.category}
                            currentBid={{}}
                            providerProfile={{
                              rating: 4.5,
                              completedProjects: 25,
                              skills: ['React', 'Node.js', 'TypeScript'],
                              portfolio: []
                            }}
                            competitorBids={sortedBids}
                            onOptimizedBidGenerated={(optimizedBid) => {
                              setShowBidForm(true);
                            }}
                          />
                        </div>
                      )}

                      {/* Bid Form */}
                      {showBidForm && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <BidForm
                            missionId={mission.id}
                            onSuccess={() => {
                              setShowBidForm(false);
                              setShowAIAnalyzer(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
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
              <TabsContent value="bids" className="m-0 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300">
                  <div className="p-3 md:p-6 space-y-3 md:space-y-4 pb-6 md:pb-8">

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
                      {sortedBids.map((bid: Bid, index: number) => (
                        <div key={bid.id} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border hover:shadow-md transition-shadow">

                          {/* Header offre */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {bid.providerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5
                                  className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors text-sm md:text-base"
                                  onClick={() => {
                                    setSelectedProviderId(bid.providerId);
                                    setSelectedProviderName(bid.providerName);
                                  }}
                                >
                                  {bid.providerName}
                                </h5>
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
                                {formatBudget(bid.price)}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {bid.timeline}
                              </div>
                            </div>
                          </div>

                          {/* Proposition */}
                          <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 border-l-4 border-blue-400">
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">{bid.proposal}</p>
                          </div>

                          {/* Actions */}
                          {user && mission.userName === user.name && (
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
                <TabsContent value="team" className="m-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300">
                    <div className="p-3 md:p-6 space-y-3 md:space-y-4 pb-6 md:pb-8"></div>
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