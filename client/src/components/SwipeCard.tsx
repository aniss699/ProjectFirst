import React, { useRef, useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  Euro, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp,
  Clock,
  Star,
  Briefcase,
  User
} from 'lucide-react';
import { Announcement } from '../../shared/schema.js';

interface SwipeCardProps {
  announcement: Announcement;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onTap: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  announcement,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onTap
}) => {
  const [dwellStartTime] = useState(() => Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Format du budget
  const formatBudget = (min?: number, max?: number) => {
    if (min && max) {
      return `${min.toLocaleString()}€ - ${max.toLocaleString()}€`;
    }
    if (min) return `À partir de ${min.toLocaleString()}€`;
    if (max) return `Jusqu'à ${max.toLocaleString()}€`;
    return 'Budget à négocier';
  };

  // Format de la deadline
  const formatDeadline = (deadline?: Date) => {
    if (!deadline) return 'Date flexible';
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Urgent';
    if (days === 1) return 'Dans 1 jour';
    if (days <= 7) return `Dans ${days} jours`;
    if (days <= 30) return `Dans ${Math.ceil(days / 7)} semaines`;
    return `Dans ${Math.ceil(days / 30)} mois`;
  };

  // Couleurs des catégories
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

  // Gestion des gestures - seulement horizontal
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const { offset, velocity } = info;
    
    setIsDragging(false);
    setRotation(0);

    // Swipe horizontal uniquement
    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 400) {
      if (offset.x > 0) {
        onSwipeRight(); // Favori
      } else {
        onSwipeLeft(); // Pas intéressé
      }
      return;
    }
  };

  const handleTap = () => {
    if (!isDragging) {
      onTap();
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="w-full max-w-md mx-auto cursor-pointer select-none"
      drag="x"
      dragConstraints={{ left: -120, right: 120 }}
      dragElastic={0.1}
      whileDrag={{ 
        scale: 1.02,
        transition: { duration: 0.1 }
      }}
      onDrag={(event, info) => {
        setRotation(info.offset.x * 0.05);
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      animate={{ 
        x: 0, 
        rotate: isDragging ? rotation : 0,
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
      <Card className="h-[450px] w-full overflow-hidden shadow-2xl border-0 bg-white dark:bg-gray-800 relative">
        {/* Suppression de l'image de couverture - design plus clean */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        </div>

        <CardContent className="relative z-10 p-4 h-full flex flex-col justify-between">
          {/* Header avec badges */}
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

          {/* Titre principal */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
              {announcement.title}
            </h3>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
              {announcement.description}
            </p>
          </div>

          {/* Informations clés - design amélioré */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Budget */}
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-1 mb-1">
                <Euro className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Budget</span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {formatBudget(announcement.budget_min, announcement.budget_max)}
              </span>
            </div>

            {/* Délai */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Délai</span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {announcement.deadline ? formatDeadline(announcement.deadline) : 'Flexible'}
              </span>
            </div>

            {/* Localisation */}
            {announcement.city && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Lieu</span>
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {announcement.city}
                </span>
              </div>
            )}

            {/* Client */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-1 mb-1">
                <User className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Client</span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                Client #{announcement.user_id}
              </span>
            </div>
          </div>

          {/* Tags - design moderne et compact */}
          {announcement.tags && announcement.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {announcement.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs font-medium border-0">
                  #{tag}
                </Badge>
              ))}
              {announcement.tags.length > 4 && (
                <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 text-xs">
                  +{announcement.tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SwipeCard;