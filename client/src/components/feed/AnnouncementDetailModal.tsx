import React from 'react';
import { AnnouncementView } from '@shared/types';
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
  announcement: AnnouncementView | null;
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
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-0 shadow-2xl rounded-lg sm:mx-auto p-0">
        <DialogHeader className="space-y-3 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getCategoryColor(announcement.category)} px-2 py-1 text-xs`}>
                  {announcement.category}
                </Badge>
                {announcement.sponsored && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-2 py-1 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Sponsorisé
                  </Badge>
                )}
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 text-xs">
                ✨ {Math.round((announcement.qualityScore || 0.8) * 100)}%
              </Badge>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {announcement.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {announcement.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-4 sm:p-6">
          {/* Informations principales - mobile optimized */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Budget</span>
              </div>
              <span className="text-base font-medium text-gray-900 dark:text-white break-words">
                {formatBudget(announcement.budgetMin, announcement.budgetMax)}
              </span>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Délai</span>
              </div>
              <span className="text-base font-medium text-gray-900 dark:text-white">
                {announcement.deadline ? formatDeadline(announcement.deadline) : 'Flexible'}
              </span>
            </div>

            {announcement.city && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Localisation</span>
                </div>
                <span className="text-base font-medium text-gray-900 dark:text-white">
                  {announcement.city}
                </span>
              </div>
            )}

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Client</span>
              </div>
              <span className="text-base font-medium text-gray-900 dark:text-white">
                Client #{announcement.userId}
              </span>
            </div>
          </div>

          {/* Tags */}
          {announcement.tags && announcement.tags.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {announcement.tags.map((tag: string, index: number) => (
                  <Badge key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 text-sm font-medium border-0">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions - Mobile optimized */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={() => {
                onSave(announcement.id);
                onClose();
              }}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-base py-3 h-auto"
            >
              <Heart className="w-5 h-5 mr-2" />
              Ajouter aux favoris
            </Button>
            <Button 
              variant="outline"
              className="w-full text-base py-3 h-auto"
              onClick={() => {
                window.open(`/messages?client=${announcement.userId}`, '_blank');
                console.log('Contacter le client');
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contacter le client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}