
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Euro, Users } from 'lucide-react';

interface MissionPreviewProps {
  mission: {
    title: string;
    description: string;
    category: string;
    budget: string;
    location: string;
    urgency?: string;
  };
  onEdit: () => void;
  onPublish: () => void;
  isLoading?: boolean;
}

export function MissionPreview({ mission, onEdit, onPublish, isLoading }: MissionPreviewProps) {
  const formatBudget = (budget: string) => {
    const amount = parseInt(budget);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Aperçu de votre mission
        </h2>
        <p className="text-gray-600">
          Vérifiez les informations avant publication
        </p>
      </div>

      {/* Aperçu de la mission */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl text-blue-900">
              {mission.title}
            </CardTitle>
            <Badge variant="secondary">
              {mission.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Informations clés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {mission.budget && (
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">
                  {formatBudget(mission.budget)}
                </span>
              </div>
            )}
            
            {mission.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">
                  {mission.location}
                </span>
              </div>
            )}
            
            {mission.urgency && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <Badge 
                  variant="secondary" 
                  className={getUrgencyColor(mission.urgency)}
                >
                  {mission.urgency === 'high' ? 'Urgent' : 
                   mission.urgency === 'medium' ? 'Normal' : 'Flexible'}
                </Badge>
              </div>
            )}
          </div>

          {/* Statistiques estimées */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              📊 Estimation automatique
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Offres attendues:</span>
                <span className="font-medium ml-2">3-7 prestataires</span>
              </div>
              <div>
                <span className="text-blue-700">Délai moyen:</span>
                <span className="font-medium ml-2">14-21 jours</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button 
          variant="outline" 
          onClick={onEdit}
          disabled={isLoading}
        >
          ✏️ Modifier
        </Button>
        <Button 
          onClick={onPublish}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? '⏳ Publication...' : '🚀 Publier la mission'}
        </Button>
      </div>
    </div>
  );
}
