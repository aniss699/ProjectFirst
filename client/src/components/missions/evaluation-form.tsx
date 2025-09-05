
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Upload, X } from 'lucide-react';

interface EvaluationFormProps {
  missionId: string;
  providerId: string;
  providerName: string;
  onSuccess: () => void;
}

export function EvaluationForm({ missionId, providerId, providerName, onSuccess }: EvaluationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const evaluationMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('missionId', data.missionId);
      formData.append('providerId', data.providerId);
      formData.append('clientId', data.clientId);
      formData.append('rating', data.rating.toString());
      formData.append('comment', data.comment);
      
      photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'évaluation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missions'] });
      toast({
        title: 'Évaluation envoyée !',
        description: 'Merci pour votre retour, cela aide la communauté',
      });
      setRating(5);
      setComment('');
      setPhotos([]);
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour évaluer',
        variant: 'destructive',
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Commentaire requis',
        description: 'Veuillez laisser un commentaire',
        variant: 'destructive',
      });
      return;
    }

    evaluationMutation.mutate({
      missionId,
      providerId,
      clientId: user.id,
      rating,
      comment: comment.trim(),
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isImage && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: 'Fichiers non valides',
        description: 'Seules les images de moins de 5MB sont acceptées',
        variant: 'destructive',
      });
    }
    
    setPhotos(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={i}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`text-2xl transition-colors ${
            isFilled ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          <Star className={`w-6 h-6 ${isFilled ? 'fill-current' : ''}`} />
        </button>
      );
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Évaluer la prestation de {providerName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Note globale
            </Label>
            <div className="flex items-center space-x-1 mb-2">
              {renderStars()}
            </div>
            <p className="text-sm text-gray-500">
              {rating === 1 && "Très insatisfait"}
              {rating === 2 && "Insatisfait"}
              {rating === 3 && "Correct"}
              {rating === 4 && "Satisfait"}
              {rating === 5 && "Très satisfait"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-base font-medium">
              Votre avis détaillé
            </Label>
            <Textarea
              id="comment"
              placeholder="Décrivez votre expérience : qualité du travail, respect des délais, communication..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-32 resize-none mt-2"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Photos du résultat (optionnel)
            </Label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Cliquez pour ajouter</span> des photos
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB (max 3 photos)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={photos.length >= 3}
                  />
                </label>
              </div>

              {/* Preview photos */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={evaluationMutation.isPending}
            className="w-full bg-primary hover:bg-primary-dark text-white"
          >
            {evaluationMutation.isPending ? 'Envoi en cours...' : 'Publier l\'évaluation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
