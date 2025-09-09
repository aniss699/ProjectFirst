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
  AlertCircle
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
    retry: 1, // Réduire les tentatives
    retryDelay: 2000,
    staleTime: 30000, // Cache plus long
  });

  // Fonction de rendu des étoiles
  const renderStars = (rating: string | number) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(numRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chargement de la mission...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-gray-600">Chargement des détails...</p>
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Erreur de chargement
            </DialogTitle>
          </DialogHeader>
          <div className="text-center p-8">
            <div className="text-red-500 mb-4 text-6xl">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Impossible de charger la mission</h3>
            <p className="text-gray-500 mb-6">
              {error instanceof Error ? error.message : 'Mission introuvable ou serveur indisponible'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Recharger
              </Button>
              <Button onClick={onClose}>
                Fermer
              </Button>
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
      <DialogContent className="w-[96vw] max-w-6xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <DialogTitle className="text-2xl font-bold pr-6">
            {mission.title}
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-2">
            Par {mission.clientName} • {formatBudget(mission.budget || '0')} • {sortedBids.length} candidature{sortedBids.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isTeamMission ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="bids" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Candidatures ({sortedBids.length})
              </TabsTrigger>
              {isTeamMission && (
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Équipe
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Mission Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold">{mission.title}</h3>
                          <p className="text-gray-500">
                            Par <span className="font-medium text-blue-600">{mission.clientName}</span> • {formatDate(mission.createdAt || new Date().toISOString())}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          {category?.name || mission.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 leading-relaxed">{mission.description}</p>
                  </div>

                  {/* Mission Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Euro className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Budget</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatBudget(mission.budget || '0')}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Localisation</span>
                      </div>
                      <div className="text-blue-600 font-medium">
                        {mission.location || 'Non spécifié'}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Publié</span>
                      </div>
                      <div className="text-purple-600 font-medium">
                        {formatDate(mission.createdAt || new Date().toISOString())}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bidding Section for Providers */}
              {user && user.type === 'provider' && mission.clientName !== user.name && (
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">Postuler à cette mission</h4>
                        <p className="text-sm text-gray-600 font-normal">Soumettez votre offre avec prix et délai</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={() => setShowAIAnalyzer(!showAIAnalyzer)}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        size="lg"
                      >
                        🧠 Analyser avec l'IA
                      </Button>

                      <Button 
                        onClick={() => setShowBidForm(!showBidForm)}
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                      >
                        {showBidForm ? 'Masquer le formulaire' : 'Soumettre une offre'}
                      </Button>
                    </div>

                    {/* AI Analyzer */}
                    {showAIAnalyzer && (
                      <div className="mt-6 p-6 bg-white rounded-lg border">
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
                      <div className="mt-6 p-6 bg-white rounded-lg border">
                        <BidForm 
                          missionId={mission.id} 
                          onSuccess={() => {
                            setShowBidForm(false);
                            setShowAIAnalyzer(false);
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Own Mission Message */}
              {user && user.type === 'provider' && mission.clientName === user.name && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-blue-700 font-medium">Ceci est votre propre mission</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Bids Tab */}
            <TabsContent value="bids" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Offres reçues ({sortedBids.length})</h3>
                {sortedBids.length > 0 && (
                  <Badge variant="outline">Triées par prix croissant</Badge>
                )}
              </div>

              {sortedBids.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune offre reçue</h4>
                    <p className="text-gray-500">Les prestataires peuvent encore postuler à cette mission</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedBids.map((bid: Bid, index: number) => (
                    <Card key={bid.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {bid.providerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h5 
                                className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  setSelectedProviderId(bid.providerId);
                                  setSelectedProviderName(bid.providerName);
                                }}
                              >
                                {bid.providerName}
                              </h5>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {renderStars(bid.rating || '5.0')}
                                  <span className="text-sm text-gray-600 ml-1">
                                    {parseFloat(bid.rating || '5.0').toFixed(1)}/5
                                  </span>
                                </div>
                                {index === 0 && sortedBids.length > 1 && (
                                  <Badge className="bg-green-100 text-green-700">
                                    Meilleure offre
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {formatBudget(bid.price)}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center justify-end mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              {bid.timeline}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-400">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{bid.proposal}</p>
                        </div>

                        {user && mission.userName === user.name && (
                          <div className="flex gap-3">
                            <Button 
                              onClick={() => {
                                setSelectedBidId(bid.id);
                                setSelectedBidderName(bid.providerName);
                              }}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Répondre
                            </Button>
                            <Button 
                              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              Accepter l'offre
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Team Tab */}
            {isTeamMission && (
              <TabsContent value="team" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Composition de l'équipe requise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {mission.teamRequirements?.map((requirement: any, index: number) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">{requirement.role}</h4>
                                <p className="text-gray-600">{requirement.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {formatBudget(requirement.budget || '0')}
                                </div>
                                <Badge variant="outline">
                                  {requirement.quantity} personne{requirement.quantity > 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>

                            {requirement.skills && requirement.skills.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm mb-2">Compétences requises :</h5>
                                <div className="flex flex-wrap gap-1">
                                  {requirement.skills.map((skill: string, skillIndex: number) => (
                                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Team Bidding Section */}
                {user && user.type === 'provider' && mission.clientName !== user.name && (
                  <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold">Candidature d'équipe</h4>
                          <p className="text-sm text-gray-600 font-normal">Postulez pour un ou plusieurs rôles</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-600 py-4">
                        Fonctionnalité de candidature d'équipe en cours de développement
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
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