import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Edit2,
  Save,
  X,
  Plus,
  User,
  MessageSquare
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
  updated_at: string;
  user_id: number;
}

interface Offer {
  id: number;
  amount: number;
  message: string | null;
  status: string;
  created_at: string;
  user_name: string;
}

export default function MyMissionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [editingMissionId, setEditingMissionId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    location: ''
  });

  // Récupérer les missions de l'utilisateur connecté
  const { data: missions = [], isLoading, refetch } = useQuery<Mission[]>({
    queryKey: ['my-missions'],
    queryFn: async () => {
      const response = await fetch('/api/missions/my');
      if (!response.ok) throw new Error('Erreur lors du chargement de vos missions');
      return response.json();
    },
    enabled: !!user
  });

  // Récupérer les offres pour une mission spécifique
  const getOffersQuery = (missionId: number) => useQuery<Offer[]>({
    queryKey: ['mission-offers', missionId],
    queryFn: async () => {
      const response = await fetch(`/api/missions/${missionId}/offers`);
      if (!response.ok) throw new Error('Erreur lors du chargement des offres');
      return response.json();
    }
  });

  // Modifier une mission
  const handleEditMission = async (missionId: number) => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast({
        title: 'Champs obligatoires',
        description: 'Le titre et la description sont obligatoires',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          category: editForm.category || null,
          budget: editForm.budget ? parseInt(editForm.budget) : null,
          location: editForm.location || null
        })
      });

      if (response.ok) {
        toast({
          title: 'Mission modifiée !',
          description: 'Vos modifications ont été enregistrées'
        });
        setEditingMissionId(null);
        refetch();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  // Commencer l'édition d'une mission
  const startEditing = (mission: Mission) => {
    setEditingMissionId(mission.id);
    setEditForm({
      title: mission.title,
      description: mission.description,
      category: mission.category || '',
      budget: mission.budget?.toString() || '',
      location: mission.location || ''
    });
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingMissionId(null);
    setEditForm({
      title: '',
      description: '',
      category: '',
      budget: '',
      location: ''
    });
  };

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
              Connectez-vous pour voir et gérer vos missions.
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Mes missions</h1>
            <p className="text-gray-600">Gérez vos missions publiées et suivez les offres reçues.</p>
          </div>
          <Button
            onClick={() => setLocation('/create-mission')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle mission
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement de vos missions...</p>
          </div>
        ) : missions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune mission créée</h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore publié de mission. Créez votre première mission pour commencer !
              </p>
              <Button
                onClick={() => setLocation('/create-mission')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première mission
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {missions.map((mission) => {
              const isEditing = editingMissionId === mission.id;
              const offersQuery = getOffersQuery(mission.id);
              const offers = offersQuery.data || [];

              return (
                <Card key={mission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {isEditing ? (
                          <Input
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            className="text-lg font-semibold mb-2"
                            placeholder="Titre de la mission"
                          />
                        ) : (
                          <CardTitle className="text-lg">{mission.title}</CardTitle>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Créée le {formatDate(mission.created_at)}</span>
                          {mission.updated_at !== mission.created_at && (
                            <>
                              <span>•</span>
                              <span>Modifiée le {formatDate(mission.updated_at)}</span>
                            </>
                          )}
                          <Badge 
                            variant={mission.status === 'active' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {mission.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleEditMission(mission.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(mission)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <Textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description de la mission"
                          rows={4}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            value={editForm.category}
                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="Catégorie"
                          />
                          <Input
                            type="number"
                            value={editForm.budget}
                            onChange={(e) => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                            placeholder="Budget (€)"
                          />
                          <Input
                            value={editForm.location}
                            onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Localisation"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-700 mb-4">{mission.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
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

                        {/* Afficher les offres reçues */}
                        {offers.length > 0 && (
                          <div className="mt-6 pt-6 border-t">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Offres reçues ({offers.length})
                            </h4>
                            <div className="space-y-3">
                              {offers.map((offer) => (
                                <div key={offer.id} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="font-medium text-gray-900">{offer.user_name}</span>
                                      <span className="text-sm text-gray-500 ml-2">
                                        {formatDate(offer.created_at)}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-lg font-semibold text-green-600">
                                        {offer.amount} €
                                      </span>
                                      <Badge 
                                        variant={offer.status === 'pending' ? 'secondary' : 'default'}
                                        className="ml-2"
                                      >
                                        {offer.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  {offer.message && (
                                    <p className="text-gray-700 text-sm">{offer.message}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {offers.length === 0 && (
                          <div className="mt-6 pt-6 border-t text-center text-gray-500">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Aucune offre reçue pour cette mission</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}