import React, { useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  Euro, 
  Heart,
  Share2,
  Info,
  Star,
  User,
  Send
} from 'lucide-react';
import { Announcement } from '@shared/schema';

interface SwipeCardProps {
  announcement: Announcement;
  onSwipeDown: () => void;
  onSwipeUp: () => void;
  onLike: () => void;
  onOffer: () => void;
  onShare: () => void;
  onDetails: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  announcement,
  onSwipeDown,
  onSwipeUp,
  onLike,
  onOffer,
  onShare,
  onDetails
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatBudget = (min?: number, max?: number) => {
    if (min && max) {
      return `${min.toLocaleString()}€ - ${max.toLocaleString()}€`;
    }
    if (min) return `À partir de ${min.toLocaleString()}€`;
    if (max) return `Jusqu'à ${max.toLocaleString()}€`;
    return 'Budget à négocier';
  };

  const formatDeadline = (deadline?: Date) => {
    if (!deadline) return 'Date flexible';
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Urgent';
    if (days === 1) return 'Dans 1 jour';
    if (days <= 7) return `Dans ${days} jours`;
    if (days <= 30) return `Dans ${Math.ceil(days / 7)} semaines`;
    return `Dans ${Math.ceil(days / 30)} mois`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'developpement': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'design': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'marketing': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'ia': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'redaction': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const { offset, velocity } = info;
    
    setIsDragging(false);

    if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 400) {
      if (offset.y > 0) {
        onSwipeDown();
      } else {
        onSwipeUp();
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="w-full h-full flex items-center justify-center select-none"
      drag="y"
      dragConstraints={{ top: -100, bottom: 100 }}
      dragElastic={0.1}
      whileDrag={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={{ 
        y: 0,
        scale: 1 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8
      }}
      data-testid={`swipe-card-${announcement.id}`}
    >
      <Card className="h-[85vh] w-full max-w-md overflow-hidden shadow-2xl border-0 bg-white dark:bg-gray-800 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        </div>

        <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-2">
              <Badge className={`${getCategoryColor(announcement.category)} px-3 py-1 text-sm font-medium`}>
                {announcement.category}
              </Badge>
              {announcement.sponsored && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Sponsorisé
                </Badge>
              )}
            </div>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 shadow-lg">
              ✨ {Math.round((announcement.quality_score || 0.8) * 100)}%
            </Badge>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {announcement.title}
              </h3>
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {announcement.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <Euro className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Budget</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatBudget(announcement.budget_min, announcement.budget_max)}
                </span>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Délai</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {announcement.deadline ? formatDeadline(announcement.deadline) : 'Flexible'}
                </span>
              </div>

              {announcement.city && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Lieu</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {announcement.city}
                  </span>
                </div>
              )}

              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Client</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Client #{announcement.user_id}
                </span>
              </div>
            </div>

            {announcement.tags && announcement.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {announcement.tags.slice(0, 5).map((tag: string, index: number) => (
                  <Badge key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 text-sm font-medium border-0">
                    #{tag}
                  </Badge>
                ))}
                {announcement.tags.length > 5 && (
                  <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1 text-sm">
                    +{announcement.tags.length - 5}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 mt-6">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              variant="outline"
              className="flex flex-col items-center justify-center h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all"
              data-testid="button-like"
            >
              <Heart className="w-6 h-6 text-red-500 mb-1" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">J'aime</span>
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onOffer();
              }}
              variant="outline"
              className="flex flex-col items-center justify-center h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-all"
              data-testid="button-offer"
            >
              <Send className="w-6 h-6 text-green-500 mb-1" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Offre</span>
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              variant="outline"
              className="flex flex-col items-center justify-center h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              data-testid="button-share"
            >
              <Share2 className="w-6 h-6 text-blue-500 mb-1" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Partager</span>
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDetails();
              }}
              variant="outline"
              className="flex flex-col items-center justify-center h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
              data-testid="button-details"
            >
              <Info className="w-6 h-6 text-purple-500 mb-1" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Détails</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SwipeCard;
