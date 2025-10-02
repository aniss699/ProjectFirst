import React, { useEffect, useState } from 'react';
import { SwipeCard } from '@/components/SwipeCard';
import { useFeedStore } from '@/store/feed';
import { useFavoritesStore } from '@/store/favorites';
import { AnnouncementDetailModal } from '@/components/feed/AnnouncementDetailModal';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AnnouncementView } from '@shared/types';

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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementView | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();
  
  const { addToFavorites } = useFavoritesStore();

  useEffect(() => {
    let mounted = true;
    const initFeed = async () => {
      try {
        await loadFeed(true);
      } catch (err) {
        console.error('❌ Erreur init feed:', err);
      } finally {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    };
    initFeed();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < items.length - 2 && hasMore) {
      preloadNext();
    }
  }, [currentIndex, items.length, hasMore, preloadNext]);

  const handleRetry = () => {
    setInitialLoading(true);
    loadFeed(true).finally(() => setInitialLoading(false));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-white">Chargement du feed...</p>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
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

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">Aucune annonce disponible</h2>
          <p className="text-gray-400 mb-4">
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

  if (currentIndex >= items.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">Vous avez tout vu !</h2>
          <p className="text-gray-400 mb-4">
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

  const handleLike = () => {
    handleAction('save', currentAnnouncement.id);
    addToFavorites(currentAnnouncement);
    toast({
      title: "❤️ Ajouté aux favoris",
      description: "La mission a été ajoutée à vos favoris"
    });
  };

  const handleOffer = () => {
    setSelectedAnnouncement(currentAnnouncement);
    setShowDetailModal(true);
    toast({
      title: "📝 Faire une offre",
      description: "Consultez les détails pour faire une offre"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentAnnouncement.title,
        text: currentAnnouncement.description,
        url: window.location.href
      }).catch(() => {
        toast({
          title: "🔗 Lien copié",
          description: "Le lien a été copié dans votre presse-papiers"
        });
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "🔗 Lien copié",
        description: "Le lien a été copié dans votre presse-papiers"
      });
    }
  };

  const handleDetails = () => {
    setSelectedAnnouncement(currentAnnouncement);
    setShowDetailModal(true);
  };

  const handleSwipeUp = () => {
    handleAction('skip', currentAnnouncement.id);
  };

  const handleSwipeDown = () => {
    handleAction('skip', currentAnnouncement.id);
  };

  return (
    <div className="h-screen bg-black overflow-hidden" data-testid="feed-container">
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AppelsPro
            </h1>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
            <span className="text-sm font-medium text-white">
              {currentIndex + 1} / {hasMore ? `${items.length}+` : items.length}
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-full pt-16">
        <div className="h-full flex items-center justify-center px-4">
          {currentAnnouncement && (
            <SwipeCard
              key={currentAnnouncement.id}
              announcement={currentAnnouncement}
              onSwipeDown={handleSwipeDown}
              onSwipeUp={handleSwipeUp}
              onLike={handleLike}
              onOffer={handleOffer}
              onShare={handleShare}
              onDetails={handleDetails}
            />
          )}
        </div>
        
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3">
            <p className="text-sm font-medium text-white text-center">
              Swipe ↑↓ pour changer • Utilisez les boutons
            </p>
          </div>
        </div>
        
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
