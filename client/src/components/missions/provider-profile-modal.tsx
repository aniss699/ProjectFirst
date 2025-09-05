import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  VisuallyHidden,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar, Award, Briefcase, Clock } from 'lucide-react';
import { formatDate } from '@/lib/categories';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';
import { MessageCircle, Phone } from 'lucide-react';

interface ProviderProfileModalProps {
  providerId: string | null;
  providerName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ProviderProfile {
  id: string;
  name: string;
  email: string;
  rating: string;
  location: string;
  joinedAt: string;
  description: string;
  skills: string[];
  totalProjects: number;
  availability: Array<{
    date: Date;
    slots: Array<{
      start: string;
      end: string;
      rate: number;
    }>;
  }>;
  evaluations: Array<{
    id: string;
    rating: number;
    comment: string;
    clientName: string;
    createdAt: string;
    photos?: string[];
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    completedAt: string;
  }>;
}

export function ProviderProfileModal({ providerId, providerName, isOpen, onClose }: ProviderProfileModalProps) {
  const { toast } = useToast();
  const { data: profile, isLoading } = useQuery<ProviderProfile>({
    queryKey: ['/api/providers', providerId, 'profile'],
    enabled: !!providerId && isOpen,
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!isOpen || !providerId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle asChild>
            <VisuallyHidden>Profil du prestataire</VisuallyHidden>
          </DialogTitle>
        </DialogHeader>
        <div className="p-6"></div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profile.location || 'Localisation non spécifiée'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Membre depuis {formatDate(profile.joinedAt)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    <div className="flex items-center mr-2">
                      {renderStars(Math.round(parseFloat(profile.rating)))}
                    </div>
                    <span className="text-xl font-bold">{profile.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {profile.totalProjects} projets réalisés
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons: Message, Call, and Book */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  // Navigate to messages page with provider info
                  window.location.href = `/messages?contact=${providerId}&name=${encodeURIComponent(providerName)}`;
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => {
                  // Show toast with contact info or initiate call
                  toast({
                    title: "Contacter le prestataire",
                    description: `Appelez ${providerName} pour discuter du projet`,
                  });
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                onClick={() => {
                  toast({
                    title: "Réservation de créneau",
                    description: `Fonctionnalité de réservation avec ${providerName} en cours de développement`,
                  });
                  // TODO: Implement booking modal or navigation
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Réserver un créneau
              </Button>
            </div>

            {/* Portfolio */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Réalisations récentes
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {profile.portfolio.slice(0, 4).map((project) => (
                  <Card key={project.id}>
                    <CardContent className="p-4">
                      {project.images.length > 0 && (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{project.category}</Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(project.completedAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {profile.portfolio.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Aucune réalisation disponible pour le moment
                </p>
              )}
            </div>

            {/* Calendrier de disponibilité */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Disponibilités
              </h3>
              <Card>
                <CardContent className="p-4">
                  <AvailabilityCalendar
                    readOnly={true}
                    initialAvailability={profile.availability || []}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Evaluations */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Avis clients ({profile.evaluations.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {profile.evaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center mb-1">
                            {renderStars(evaluation.rating)}
                            <span className="ml-2 font-medium">{evaluation.clientName}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(evaluation.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{evaluation.comment}</p>
                      {evaluation.photos && evaluation.photos.length > 0 && (
                        <div className="flex space-x-2">
                          {evaluation.photos.slice(0, 3).map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {profile.evaluations.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Aucun avis client pour le moment
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Profil non trouvé</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}