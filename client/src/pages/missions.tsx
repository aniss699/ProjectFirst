import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Euro, 
  Calendar, 
  User,
  Send,
  Search
} from 'lucide-react';
import { useLocation } from 'wouter';

interface Mission {
  id: number;
  title: string;
  description: string;
  category: string | null;
  budget: number | null;
  location: string | null;
  status: string;
  created_at: string;
  user_name: string;
}

interface Offer {
  id: number;
  amount: number;
  message: string | null;
  status: string;
  created_at: string;
  user_name: string;
}

export default function MissionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Récupérer toutes les missions publiques
  const { data: missions = [], isLoading, refetch } = useQuery<Mission[]>({
    queryKey: ['missions'],
    queryFn: async () => {
      const response = await fetch('/api/missions');
      if (!response.ok) throw new Error('Erreur lors du chargement des missions');
      return response.json();
    }
  });

  // Récupérer les offres pour une mission sélectionnée
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ['mission-offers', selectedMissionId],
    queryFn: async () => {
      if (!selectedMissionId) return [];
      const response = await fetch(`/api/missions/${selectedMissionId}/offers`);
      if (!response.ok) throw new Error('Erreur lors du chargement des offres');
      return response.json();
    },
    enabled: !!selectedMissionId
  });

  // Créer une offre pour une mission
  const handleCreateOffer = async (missionId: number) => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour faire une offre',
        variant: 'destructive'
      });
      return;
    }

    if (!offerAmount.trim()) {
      toast({
        title: 'Montant requis',
        description: 'Veuillez saisir un montant pour votre offre',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`/api/missions/${missionId}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseInt(offerAmount),
          message: offerMessage || null
        })
      });

      if (response.ok) {
        toast({
          title: 'Offre envoyée !',
          description: 'Votre offre a été transmise au client'
        });
        setOfferAmount('');
        setOfferMessage('');
        setSelectedMissionId(null);
        refetch();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'envoi de l\'offre');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  // Filtrer les missions selon la recherche
  const filteredMissions = missions.filter(mission =>
    mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mission.category && mission.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
            <p className="text-gray-600 mb-6">
              Connectez-vous pour voir les missions disponibles et faire des offres.
            </p>
            <Button 
              onClick={() => setLocation('/login')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Missions disponibles</h1>
          <p className="text-gray-600 mb-6">Découvrez les missions publiées par les clients et proposez vos services.</p>
          
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Rechercher une mission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des missions...</p>
          </div>
        ) : filteredMissions.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune mission trouvée</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Aucune mission ne correspond à votre recherche.' : 'Aucune mission n\'est disponible pour le moment.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) => (
              <Card key={mission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{mission.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{mission.user_name}</span>
                    <Calendar className="w-4 h-4 ml-2" />
                    <span>{formatDate(mission.created_at)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">{mission.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {mission.category && (
                      <Badge variant="secondary">{mission.category}</Badge>
                    )}
                    {mission.budget && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Euro className="w-4 h-4" />
                        <span>{mission.budget} €</span>
                      </div>
                    )}
                    {mission.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{mission.location}</span>
                      </div>
                    )}
                  </div>

                  {selectedMissionId === mission.id ? (
                    <div className="space-y-3">
                      <Input
                        type="number"
                        placeholder="Votre tarif (€)"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                      />
                      <Textarea
                        placeholder="Message (optionnel)"
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCreateOffer(mission.id)}
                          className="flex-1"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer l'offre
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedMissionId(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setSelectedMissionId(mission.id)}
                      className="w-full"
                    >
                      Faire une offre
                    </Button>
                  )}

                  {/* Afficher les offres existantes si la mission est sélectionnée */}
                  {selectedMissionId === mission.id && offers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">
                        Offres existantes ({offers.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {offers.map((offer) => (
                          <div key={offer.id} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{offer.user_name}</span>
                              <span className="text-green-600">{offer.amount} €</span>
                            </div>
                            {offer.message && (
                              <p className="text-gray-600 mt-1">{offer.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}