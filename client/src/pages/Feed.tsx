import React, { useEffect, useState } from 'react';
import { SwipeCard } from '@/components/SwipeCard';
import { useFeedStore } from '@/store/feed';
import { useFavoritesStore } from '@/store/favorites';
import { AnnouncementDetailModal } from '@/components/feed/AnnouncementDetailModal';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Feed: React.FC = () => {
  const { 
    items, 
    currentIndex, 
    loading, 
    error, 
    hasMore,
    loadFeed, 
    handleAction, 
    preloadNext 
  } = useFeedStore();
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const { addToFavorites } = useFavoritesStore();

  useEffect(() => {
    const initFeed = async () => {
      await loadFeed(true);
      setInitialLoading(false);
    };
    initFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < items.length - 2 && hasMore) {
      preloadNext();
    }
  }, [currentIndex, items.length, hasMore, preloadNext]);

  const handleRetry = () => {
    setInitialLoading(true);
    loadFeed(true).finally(() => setInitialLoading(false));
  };

  // Loading initial
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-300">Chargement du feed...</p>
        </div>
      </div>
    );
  }

  // Erreur
  if (error && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
          <Button onClick={handleRetry} className="mt-4 w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </Alert>
      </div>
    );
  }

  // Pas d'annonces
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Aucune annonce disponible</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Revenez plus tard pour découvrir de nouvelles opportunités !
          </p>
          <Button onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>
    );
  }

  // Annonces terminées
  if (currentIndex >= items.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Vous avez tout vu !</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Vous avez parcouru toutes les annonces disponibles.
          </p>
          <Button onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recharger
          </Button>
        </div>
      </div>
    );
  }

  const currentAnnouncement = items[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" data-testid="feed-container">
      {/* Header moderne avec logo et stats */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AppelsPro
            </h1>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentIndex + 1} / {hasMore ? `${items.length}+` : items.length}
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-screen overflow-hidden pt-20">
        <div className="absolute inset-0 flex items-start justify-center px-4 pt-2">
          {currentAnnouncement && (
            <SwipeCard
              key={currentAnnouncement.id}
              announcement={currentAnnouncement}
              onSwipeLeft={() => handleAction('skip', currentAnnouncement.id)}
              onSwipeRight={() => {
                handleAction('save', currentAnnouncement.id);
                addToFavorites(currentAnnouncement);
              }}
              onSwipeUp={() => {
                setSelectedAnnouncement(currentAnnouncement);
                setShowDetailModal(true);
              }}
              onTap={() => {
                setSelectedAnnouncement(currentAnnouncement);
                setShowDetailModal(true);
              }}
            />
          )}
        </div>
        
        {/* Instructions directement sous la carte */}
        <div className="absolute top-[480px] left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-sm font-bold">←</span>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pas intéressé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">👆</span>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Cliquer = Détails</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm font-bold">→</span>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Favori</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de détails */}
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAnnouncement(null);
          }}
          onSave={(announcementId) => {
            if (selectedAnnouncement) {
              addToFavorites(selectedAnnouncement);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Feed;