
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Reply, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';

interface Review {
  id: string;
  reviewer: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  reviewee: {
    id: string;
    name: string;
  };
  mission: {
    id: string;
    title: string;
  };
  rating: number;
  comment: string;
  response?: string;
  criteria: {
    quality: number;
    communication: number;
    deadline: number;
    budget: number;
  };
  helpful_count: number;
  created_at: string;
  verified: boolean;
}

interface ReviewSystemProps {
  targetUserId: string;
  showForm?: boolean;
  missionId?: string;
}

export function ReviewSystem({ targetUserId, showForm = false, missionId }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(showForm);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    criteria: {
      quality: 0,
      communication: 0,
      deadline: 0,
      budget: 0
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, [targetUserId]);

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/user/${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Erreur chargement reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (newReview.rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez donner une note",
        variant: "destructive"
      });
      return;
    }

    if (!missionId) {
      toast({
        title: "Erreur",
        description: "Mission ID manquant",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mission_id: parseInt(missionId),
          reviewee_id: parseInt(targetUserId),
          rating: newReview.rating,
          comment: newReview.comment,
          criteria: newReview.criteria
        })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Avis publié avec succès !",
          variant: "default"
        });
        setShowReviewForm(false);
        setNewReview({
          rating: 0,
          comment: '',
          criteria: { quality: 0, communication: 0, deadline: 0, budget: 0 }
        });
        loadReviews();
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la publication",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur soumission review:', error);
      toast({
        title: "Erreur",
        description: "Erreur réseau",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST'
      });

      if (response.ok) {
        loadReviews(); // Recharger pour mettre à jour les counts
      }
    } catch (error) {
      console.error('Erreur marquage helpful:', error);
    }
  };

  // Calcul des statistiques
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0
  }));

  const StarRating = ({ rating, size = 'w-4 h-4', onRatingChange }: { 
    rating: number; 
    size?: string; 
    onRatingChange?: (rating: number) => void;
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-gray-300'
          } ${onRatingChange ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => onRatingChange?.(star)}
        />
      ))}
    </div>
  );

  const CriteriaRating = ({ label, value, onChange }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium">{label}</span>
      <StarRating rating={value} onRatingChange={onChange} />
    </div>
  );

  if (loading) {
    return <div className="text-center p-8">Chargement des avis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Évaluations ({totalReviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Note moyenne */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(averageRating)} size="w-6 h-6" />
              <div className="text-sm text-gray-600 mt-1">
                Basé sur {totalReviews} avis
              </div>
            </div>

            {/* Distribution des notes */}
            <div className="space-y-2">
              {ratingDistribution.map((dist) => (
                <div key={dist.rating} className="flex items-center gap-2 text-sm">
                  <span className="w-2">{dist.rating}</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de création d'avis */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Laisser un avis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Note globale</label>
              <StarRating 
                rating={newReview.rating} 
                size="w-8 h-8"
                onRatingChange={(rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Critères détaillés</label>
              <div className="space-y-2">
                <CriteriaRating 
                  label="Qualité du travail" 
                  value={newReview.criteria.quality}
                  onChange={(value) => 
                    setNewReview(prev => ({ 
                      ...prev, 
                      criteria: { ...prev.criteria, quality: value }
                    }))
                  }
                />
                <CriteriaRating 
                  label="Communication" 
                  value={newReview.criteria.communication}
                  onChange={(value) => 
                    setNewReview(prev => ({ 
                      ...prev, 
                      criteria: { ...prev.criteria, communication: value }
                    }))
                  }
                />
                <CriteriaRating 
                  label="Respect des délais" 
                  value={newReview.criteria.deadline}
                  onChange={(value) => 
                    setNewReview(prev => ({ 
                      ...prev, 
                      criteria: { ...prev.criteria, deadline: value }
                    }))
                  }
                />
                <CriteriaRating 
                  label="Rapport qualité/prix" 
                  value={newReview.criteria.budget}
                  onChange={(value) => 
                    setNewReview(prev => ({ 
                      ...prev, 
                      criteria: { ...prev.criteria, budget: value }
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Commentaire</label>
              <Textarea
                placeholder="Partagez votre expérience..."
                value={newReview.comment}
                onChange={(e) => 
                  setNewReview(prev => ({ ...prev, comment: e.target.value }))
                }
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={submitReview}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Publication...' : 'Publier l\'avis'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header de l'avis */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {review.reviewer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{review.reviewer.name}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarRating rating={review.rating} />
                    <div className="text-sm text-gray-600 mt-1">
                      Mission: {review.mission.title}
                    </div>
                  </div>
                </div>

                {/* Commentaire */}
                {review.comment && (
                  <div className="text-gray-700">
                    "{review.comment}"
                  </div>
                )}

                {/* Critères détaillés */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Qualité</div>
                    <StarRating rating={review.criteria.quality} size="w-3 h-3" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Communication</div>
                    <StarRating rating={review.criteria.communication} size="w-3 h-3" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Délais</div>
                    <StarRating rating={review.criteria.deadline} size="w-3 h-3" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Prix</div>
                    <StarRating rating={review.criteria.budget} size="w-3 h-3" />
                  </div>
                </div>

                {/* Réponse du prestataire */}
                {review.response && (
                  <div className="ml-8 p-3 bg-blue-50 border-l-4 border-blue-200 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        Réponse du prestataire
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {review.response}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markHelpful(review.id)}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Utile ({review.helpful_count})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun avis pour le moment</p>
              <p className="text-sm text-gray-500">
                Soyez le premier à laisser un avis !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
