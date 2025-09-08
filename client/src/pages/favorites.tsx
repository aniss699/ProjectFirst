
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useFavoritesStore } from '@/store/favorites';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Euro, 
  User, 
  RefreshCw,
  AlertCircle,
  Trash2
} from 'lucide-react';

const Favorites: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { 
    favorites, 
    loading, 
    error, 
    loadFavorites, 
    removeFromFavorites 
  } = useFavoritesStore();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  const handleRemoveFavorite = async (announcementId: number) => {
    await removeFromFavorites(announcementId);
  };

  const handleViewAnnouncement = (announcementId: number) => {
    setLocation(`/marketplace?highlight=${announcementId}`);
  };

  // Redirection si pas connecté
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour voir vos favoris.
          </AlertDescription>
          <Button onClick={() => setLocation('/login')} className="mt-4 w-full">
            Se connecter
          </Button>
        </Alert>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
          <Button onClick={loadFavorites} className="mt-4 w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/feed')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au flux
              </Button>
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-red-500" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Mes favoris
                </h1>
                <Badge variant="secondary" className="ml-2">
                  {favorites.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-600 mb-6">
              Explorez le flux et ajoutez des annonces à vos favoris pour les retrouver ici.
            </p>
            <Button onClick={() => setLocation('/feed')}>
              Découvrir des annonces
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {announcement.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFavorite(announcement.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {announcement.client_name || 'Client anonyme'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(announcement.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-700 line-clamp-3">
                    {announcement.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Euro className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        {announcement.budget ? `${announcement.budget}€` : 'Budget à négocier'}
                      </span>
                    </div>
                    {announcement.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {announcement.location}
                      </div>
                    )}
                  </div>
                  
                  {announcement.category && (
                    <Badge variant="outline">
                      {announcement.category}
                    </Badge>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewAnnouncement(announcement.id)}
                      className="flex-1"
                    >
                      Voir l'annonce
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFavorite(announcement.id)}
                      className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
