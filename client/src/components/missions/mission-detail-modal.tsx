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
  VisuallyHidden
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { MapPin, Calendar, Users, Star, Euro, Briefcase, Send, Bookmark } from 'lucide-react';
import { ProviderProfileModal } from './provider-profile-modal';
import { BidResponseModal } from './bid-response-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SmartBidAnalyzer from '@/components/ai/smart-bid-analyzer';

interface MissionDetailModalProps {
  missionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MissionDetailModal({ missionId, isOpen, onClose }: MissionDetailModalProps) {
  const { user } = useAuth();
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedProviderName, setSelectedProviderName] = useState<string>('');
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [selectedBidderName, setSelectedBidderName] = useState<string>('');
  const [showBidForm, setShowBidForm] = useState(false); // State to control bid form visibility
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false); // State to control AI analyzer visibility
  const [currentBid, setCurrentBid] = useState<Partial<Bid>>({}); // State to hold the current bid proposal


  const { data: mission, isLoading } = useQuery<MissionWithBids>({
    queryKey: [`/api/missions/${missionId}`],
    enabled: !!missionId && isOpen,
  });

  if (!mission || isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Chargement...</DialogTitle>
            <DialogDescription>Chargement des détails de la mission en cours...</DialogDescription>
          </DialogHeader>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des détails de la mission...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const category = getCategoryById(mission.category);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')
    ];
    return IconComponent || LucideIcons.Briefcase;
  };

  const IconComponent = category ? getIcon(category.icon) : LucideIcons.Briefcase;

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(numRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const sortedBids = [...mission.bids].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-4xl max-h-[92vh] overflow-y-auto p-0 bg-white border-0 shadow-2xl rounded-xl mx-2" aria-describedby="mission-description">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 rounded-t-xl">
          <DialogTitle className="text-lg sm:text-2xl font-bold pr-6 text-white leading-tight">
            {mission.title}
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-2 text-sm sm:text-base">
            Par {mission.clientName} • {formatBudget(mission.budget || '0')} • {mission.bids.length} candidature{mission.bids.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Mission Info - Mobile optimized */}
          <div className="border-b pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 ${category?.color || 'text-blue-600'}`} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{mission.title}</h3>
                  <Badge className="bg-green-100 text-green-700 border-green-200 self-center sm:self-start">
                    {category?.name || mission.category}
                  </Badge>
                </div>
                <p className="text-gray-500 mb-3 text-sm">
                  Publié par <span className="font-medium text-blue-600">{mission.clientName}</span> • {formatDate(mission.createdAt!)}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{mission.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-2">
                  <Euro className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-700">Budget</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {formatBudget(mission.budget || '0')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-700 text-sm">Localisation</span>
                  </div>
                  <div className="text-blue-600 font-medium text-sm">
                    {mission.location || 'Non spécifié'}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="font-medium text-gray-700 text-sm">Candidatures</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {mission.bids.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bidding Section for Providers - Mobile optimized */}
          {user && user.type === 'provider' && mission.clientName !== user.name && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-md mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                  <span className="text-white font-bold text-xl">💼</span>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-lg font-bold text-gray-900">Postuler à cette mission</h4>
                  <p className="text-sm text-gray-600">Soumettez votre offre avec prix et délai</p>
                </div>
              </div>
              {/* Button to toggle AI Analyzer and Bid Form */}
              <div className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => setShowBidForm(!showBidForm)}
                    className="w-full bg-primary hover:bg-primary/90 py-3 text-base"
                    size="lg"
                  >
                    {showBidForm ? 'Masquer le formulaire' : 'Soumettre une offre'}
                  </Button>

                  <Button 
                    onClick={() => setShowAIAnalyzer(!showAIAnalyzer)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 text-base"
                    size="lg"
                  >
                    🧠 Analyser avec l'IA
                  </Button>
                </div>

                {/* AI Analyzer Section */}
                {showAIAnalyzer && (
                  <div className="mt-6">
                    <SmartBidAnalyzer
                      missionTitle={mission.title}
                      missionDescription={mission.description}
                      missionBudget={parseFloat(mission.budget || '0')}
                      missionCategory={mission.category}
                      currentBid={currentBid}
                      providerProfile={{
                        rating: 4.5, // Replace with actual provider rating
                        completedProjects: 25, // Replace with actual completed projects count
                        skills: ['React', 'Node.js', 'TypeScript'], // Replace with actual skills
                        portfolio: [] // Replace with actual portfolio items
                      }}
                      competitorBids={mission.bids}
                      onOptimizedBidGenerated={(optimizedBid) => {
                        setCurrentBid(optimizedBid);
                        setShowBidForm(true); // Automatically show bid form when a bid is generated
                      }}
                    />
                  </div>
                )}

                {/* Bid Form Section */}
                {showBidForm && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
                    <BidForm 
                      missionId={mission.id} 
                      onSuccess={() => {
                        setShowBidForm(false);
                        setShowAIAnalyzer(false); // Close AI analyzer when bid form is submitted
                      }}
                      initialValues={currentBid.proposal ? currentBid : undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message si c'est sa propre mission */}
          {user && user.type === 'provider' && mission.clientName === user.name && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">ℹ️</span>
                </div>
                <p className="text-blue-700 font-medium">Ceci est votre propre mission</p>
              </div>
            </div>
          )}

          {/* Existing Bids - Mobile optimized */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
              <h4 className="text-lg font-semibold text-gray-900">
                Offres reçues ({mission.bids.length})
              </h4>
              {sortedBids.length > 0 && (
                <div className="text-sm text-gray-500">
                  Triées par prix croissant
                </div>
              )}
            </div>
            <div className="space-y-4">
              {sortedBids.map((bid: Bid, index: number) => (
                <div key={bid.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {bid.providerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 
                            className="font-semibold text-gray-900 cursor-pointer hover:text-primary transition-colors text-base"
                            onClick={() => {
                              setSelectedProviderId(bid.providerId);
                              setSelectedProviderName(bid.providerName);
                            }}
                          >
                            {bid.providerName}
                          </h5>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {renderStars(bid.rating || '5.0')}
                              <span className="text-sm text-gray-600 ml-1">
                                {parseFloat(bid.rating || '5.0').toFixed(1)}/5
                              </span>
                            </div>
                            {index === 0 && sortedBids.length > 1 && (
                              <Badge className="bg-green-100 text-green-700 text-xs w-fit">
                                Meilleure offre
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center sm:text-right border-l sm:border-l-0 border-t sm:border-t-0 sm:border-l border-gray-200 pl-4 sm:pl-0 pt-4 sm:pt-0 sm:pl-4">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatBudget(bid.price)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center justify-center sm:justify-end mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {bid.timeline}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-400">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">{bid.proposal}</p>
                  </div>
                  {user && mission.clientName === user.name && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => {
                          setSelectedBidId(bid.id);
                          setSelectedBidderName(bid.providerName);
                        }}
                        variant="outline"
                        className="w-full sm:w-auto border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold flex items-center justify-center gap-2 py-2"
                      >
                        💬 Répondre
                      </Button>
                      <Button 
                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 py-2"
                      >
                        ✅ Accepter l'offre
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {mission.bids.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune offre reçue pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

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