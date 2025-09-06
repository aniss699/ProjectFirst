
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Euro, ThumbsUp, X } from 'lucide-react';
import type { LiveSlot } from '@/lib/types/services';

interface SwipeDeckProps {
  slots: LiveSlot[];
  onSwipeRight: (slot: LiveSlot) => void;
  onSwipeLeft: (slot: LiveSlot) => void;
  isLoading?: boolean;
}

export function SwipeDeck({ slots, onSwipeRight, onSwipeLeft, isLoading = false }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentSlot = slots[currentIndex];

  const handleSwipeRight = useCallback(() => {
    if (!currentSlot || isAnimating) return;
    
    setIsAnimating(true);
    onSwipeRight(currentSlot);
    
    setTimeout(() => {
      setCurrentIndex(prev => Math.min(prev + 1, slots.length - 1));
      setIsAnimating(false);
    }, 300);
  }, [currentSlot, onSwipeRight, isAnimating, slots.length]);

  const handleSwipeLeft = useCallback(() => {
    if (!currentSlot || isAnimating) return;
    
    setIsAnimating(true);
    onSwipeLeft(currentSlot);
    
    setTimeout(() => {
      setCurrentIndex(prev => Math.min(prev + 1, slots.length - 1));
      setIsAnimating(false);
    }, 300);
  }, [currentSlot, onSwipeLeft, isAnimating, slots.length]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleSwipeLeft();
    } else if (e.key === 'ArrowRight') {
      handleSwipeRight();
    }
  }, [handleSwipeLeft, handleSwipeRight]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!currentSlot) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Plus d'opportunités pour le moment</h3>
        <p className="text-gray-600">Revenez plus tard ou modifiez vos filtres</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card className={`relative overflow-hidden transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
        <CardContent className="p-6">
          {/* Header avec avatar et rating */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {currentSlot.providerName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{currentSlot.providerName}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{currentSlot.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Disponible
            </Badge>
          </div>

          {/* Infos du créneau */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{formatDate(currentSlot.slot)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">À {currentSlot.distance} km</span>
            </div>

            <div className="flex items-center space-x-2">
              <Euro className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{currentSlot.pricePerHour}€/h • {currentSlot.duration} min</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-6">
            {currentSlot.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button 
              onClick={handleSwipeLeft}
              variant="outline" 
              size="lg"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              disabled={isAnimating}
            >
              <X className="w-5 h-5 mr-2" />
              Passer
            </Button>
            <Button 
              onClick={handleSwipeRight}
              size="lg"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isAnimating}
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              Réserver
            </Button>
          </div>

          {/* Indicateur de progression */}
          <div className="mt-4 flex justify-center space-x-1">
            {slots.slice(0, 5).map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Indication tactile */}
          <p className="text-xs text-center text-gray-400 mt-3">
            ← Passer • Réserver → • ↑ Suivant
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
