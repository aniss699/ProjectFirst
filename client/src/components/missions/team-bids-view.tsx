
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Users, DollarSign, Calendar, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamBid {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  timelineDays: number;
  message: string;
  rating: number;
  completedProjects: number;
}

interface TeamBidsViewProps {
  projectId: string;
  teamRequirements: Array<{
    profession: string;
    description: string;
    estimatedBudget: number;
    estimatedDays: number;
  }>;
}

export function TeamBidsView({ projectId, teamRequirements }: TeamBidsViewProps) {
  const [bidsByProfession, setBidsByProfession] = useState<{ [key: string]: TeamBid[] }>({});
  const [selectedTeam, setSelectedTeam] = useState<{ [profession: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBidsByProfession();
  }, [projectId]);

  const fetchBidsByProfession = async () => {
    try {
      const response = await fetch(`/api/team/project/${projectId}/bids-by-profession`);
      if (response.ok) {
        const data = await response.json();
        setBidsByProfession(data);
      }
    } catch (error) {
      console.error('Erreur chargement candidatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectProvider = (profession: string, providerId: string) => {
    setSelectedTeam(prev => ({ ...prev, [profession]: providerId }));
  };

  const getTotalSelectedBudget = () => {
    return Object.entries(selectedTeam).reduce((total, [profession, providerId]) => {
      const bids = bidsByProfession[profession] || [];
      const selectedBid = bids.find(bid => bid.providerId === providerId);
      return total + (selectedBid?.amount || 0);
    }, 0);
  };

  const renderBidCard = (bid: TeamBid, profession: string) => {
    const isSelected = selectedTeam[profession] === bid.providerId;
    
    return (
      <Card 
        key={bid.id} 
        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
        onClick={() => selectProvider(profession, bid.providerId)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{bid.providerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{bid.providerName}</h4>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{bid.rating}</span>
                  <span>•</span>
                  <span>{bid.completedProjects} projets</span>
                </div>
              </div>
            </div>
            {isSelected && (
              <Badge variant="default">
                Sélectionné
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold">{bid.amount}€</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{bid.timelineDays} jours</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            {bid.message}
          </p>

          <Button 
            variant={isSelected ? "default" : "outline"} 
            size="sm" 
            className="w-full"
          >
            {isSelected ? 'Sélectionné' : 'Sélectionner'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des candidatures...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Résumé de l'équipe sélectionnée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Équipe sélectionnée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(selectedTeam).length}
              </div>
              <div className="text-sm text-gray-600">Membres sélectionnés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getTotalSelectedBudget()}€
              </div>
              <div className="text-sm text-gray-600">Budget total</div>
            </div>
            <div className="text-center">
              <Button className="w-full" disabled={Object.keys(selectedTeam).length === 0}>
                Valider l'équipe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets par profession */}
      <Tabs defaultValue={teamRequirements[0]?.profession || ''}>
        <TabsList className="grid w-full grid-cols-auto">
          {teamRequirements.map(req => {
            const bidsCount = bidsByProfession[req.profession]?.length || 0;
            const hasSelection = selectedTeam[req.profession];
            
            return (
              <TabsTrigger 
                key={req.profession} 
                value={req.profession}
                className="relative"
              >
                {req.profession}
                <Badge variant="secondary" className="ml-2">
                  {bidsCount}
                </Badge>
                {hasSelection && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {teamRequirements.map(req => (
          <TabsContent key={req.profession} value={req.profession}>
            <Card>
              <CardHeader>
                <CardTitle>{req.profession}</CardTitle>
                <p className="text-gray-600">{req.description}</p>
                <div className="flex gap-4 text-sm">
                  <span>Budget estimé: {req.estimatedBudget}€</span>
                  <span>Durée estimée: {req.estimatedDays} jours</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {bidsByProfession[req.profession]?.length > 0 ? (
                    bidsByProfession[req.profession].map(bid => 
                      renderBidCard(bid, req.profession)
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune candidature pour cette profession pour le moment.</p>
                      <p className="text-sm">Les prestataires recevront une notification.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
