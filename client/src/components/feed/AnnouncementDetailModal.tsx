import React from 'react';
import { Announcement } from '../../../shared/schema.js';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Euro, 
  User,
  Briefcase,
  Star,
  Heart,
  MessageCircle
} from 'lucide-react';

interface AnnouncementDetailModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (announcementId: number) => void;
}

export function AnnouncementDetailModal({ 
  announcement, 
  isOpen, 
  onClose, 
  onSave 
}: AnnouncementDetailModalProps) {
  if (!announcement) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[95vh] overflow-y-auto bg-white dark:bg-gray-800 border-0 shadow-2xl mx-2 sm:mx-auto">
        <DialogHeader className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getCategoryColor(announcement.category)} px-2 py-1 text-xs sm:text-sm`}>
                {announcement.category}
              </Badge>
              {announcement.sponsored && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-2 py-1 text-xs sm:text-sm">
                  <Star className="w-3 h-3 mr-1" />
                  Sponsorisé
                </Badge>
              )}
            </div>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 text-xs sm:text-sm self-start">
              ✨ {Math.round((announcement.quality_score || 0.8) * 100)}%
            </Badge>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight pr-6">
            {announcement.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            {announcement.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Informations principales - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Euro className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Budget</span>
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">
                {formatBudget(announcement.budget_min, announcement.budget_max)}
              </span>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Délai</span>
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                {announcement.deadline ? formatDeladline(announcement.deadline) : 'Flexible'}
              </span>
            </div>

            {announcement.city && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Localisation</span>
                </div>
                <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                  {announcement.city}
                </span>
              </div>
            )}

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Client</span>
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                Client #{announcement.user_id}
              </span>
            </div>
          </div>

          {/* Tags */}
          {announcement.tags && announcement.tags.length > 0 && (
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-1.5">
                {announcement.tags.map((tag: string, index: number) => (
                  <Badge key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 text-xs font-medium border-0">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={() => {
                onSave(announcement.id);
                onClose();
              }}
              className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-sm sm:text-base"
              size="sm"
            >
              <Heart className="w-4 h-4 mr-2" />
              Ajouter aux favoris
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:flex-1 text-sm sm:text-base"
              size="sm"
              onClick={() => {
                // Rediriger vers la page de messages avec l'ID client
                window.open(`/messages?client=${announcement.user_id}`, '_blank');
                console.log('Contacter le client');
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter le client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}