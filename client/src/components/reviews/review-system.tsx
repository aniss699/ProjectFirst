import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  Award,
  TrendingUp,
  Shield,
  Clock,
  Users
} from 'lucide-react';

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewedId: string;
  reviewedName: string;
  projectTitle: string;
  rating: number;
  title: string;
  comment: string;
  criteriaScores: {
    quality: number;
    communication: number;
    deadline: number;
    budget: number;
  };
  verified: boolean;
  helpfulCount: number;
  userHelpful?: boolean;
  response?: string;
  responseDate?: string;
  createdAt: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  quality: number;
  communication: number;
  deadline: number;
  budget: number;
}

interface ReviewSystemProps {
  userId?: string;
  targetUserId?: string;
  projectId?: string;
  reviews?: Review[];
  onSubmitReview?: (reviewData: ReviewFormData) => void;
  showForm?: boolean;
  className?: string;
}

export function ReviewSystem({
  userId,
  targetUserId,
  projectId,
  reviews = [],
  onSubmitReview,
  showForm = false,
  className = ''
}: ReviewSystemProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    comment: '',
    quality: 0,
    communication: 0,
    deadline: 0,
    budget: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(showForm);

  // Mock data pour les reviews si aucune donnée fournie
  const mockReviews: Review[] = reviews.length > 0 ? reviews : [
    {
      id: '1',
      reviewerId: 'client1',
      reviewerName: 'Marie L.',
      reviewedId: 'provider1',
      reviewedName: 'Sophie Dubois',
      projectTitle: 'Développement site e-commerce',
      rating: 5,
      title: 'Excellent travail, très professionnelle',
      comment: 'Sophie a livré un travail exceptionnel. Communication fluide, délais respectés et qualité au rendez-vous. Je recommande vivement !',
      criteriaScores: {
        quality: 5,
        communication: 5,
        deadline: 5,
        budget: 4
      },
      verified: true,
      helpfulCount: 12,
      userHelpful: false,
      response: 'Merci beaucoup Marie ! C\'était un plaisir de travailler sur votre projet.',
      responseDate: '2024-01-15',
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      reviewerId: 'client2',
      reviewerName: 'Thomas R.',
      reviewedId: 'provider1',
      reviewedName: 'Sophie Dubois',
      projectTitle: 'Refonte application mobile',
      rating: 4,
      title: 'Très bon travail dans l\'ensemble',
      comment: 'Prestation de qualité avec quelques ajustements nécessaires. Sophie a été réactive pour les corrections.',
      criteriaScores: {
        quality: 4,
        communication: 5,
        deadline: 4,
        budget: 4
      },
      verified: true,
      helpfulCount: 8,
      userHelpful: true,
      createdAt: '2024-01-05'
    },
    {
      id: '3',
      reviewerId: 'client3',
      reviewerName: 'Julie M.',
      reviewedId: 'provider1',
      reviewedName: 'Sophie Dubois',
      projectTitle: 'Site vitrine responsive',
      rating: 5,
      title: 'Parfait !',
      comment: 'Rien à redire, Sophie maîtrise parfaitement son domaine. Résultat final au-delà de mes attentes.',
      criteriaScores: {
        quality: 5,
        communication: 4,
        deadline: 5,
        budget: 5
      },
      verified: true,
      helpfulCount: 15,
      userHelpful: false,
      createdAt: '2023-12-20'
    }
  ];

  // Calcul des statistiques
  const totalReviews = mockReviews.length;
  const averageRating = totalReviews > 0 
    ? mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: mockReviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (mockReviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0
  }));

  const criteriaAverages = {
    quality: mockReviews.reduce((sum, r) => sum + r.criteriaScores.quality, 0) / totalReviews,
    communication: mockReviews.reduce((sum, r) => sum + r.criteriaScores.communication, 0) / totalReviews,
    deadline: mockReviews.reduce((sum, r) => sum + r.criteriaScores.deadline, 0) / totalReviews,
    budget: mockReviews.reduce((sum, r) => sum + r.criteriaScores.budget, 0) / totalReviews
  };

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

  const CriteriaRating = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    onChange?: (value: number) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">{value}/5</span>
      </div>
      <StarRating rating={value} onRatingChange={onChange} />
    </div>
  );

  const handleSubmit = async () => {
    if (formData.rating === 0 || !formData.comment.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReview?.(formData);
      setFormData({
        rating: 0,
        title: '',
        comment: '',
        quality: 0,
        communication: 0,
        deadline: 0,
        budget: 0
      });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'avis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = (reviewId: string, isHelpful: boolean) => {
    // Logique pour marquer un avis comme utile
    console.log(`Avis ${reviewId} marqué comme ${isHelpful ? 'utile' : 'pas utile'}`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistiques générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Évaluations et avis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Note moyenne */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(averageRating)} size="w-6 h-6" />
              <p className="text-gray-600 mt-2">{totalReviews} avis</p>
            </div>

            {/* Distribution des notes */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critères moyens */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(criteriaAverages).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {value.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 capitalize">{key}</div>
                <StarRating rating={Math.round(value)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bouton pour laisser un avis */}
      {!showReviewForm && userId && targetUserId && (
        <Button
          onClick={() => setShowReviewForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Laisser un avis
        </Button>
      )}

      {/* Formulaire d'avis */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Laisser un avis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Note générale */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Note générale *
              </label>
              <StarRating 
                rating={formData.rating} 
                size="w-8 h-8"
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
              />
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Titre de l'avis
              </label>
              <Input
                placeholder="Résumez votre expérience..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Commentaire détaillé *
              </label>
              <Textarea
                placeholder="Décrivez votre expérience, les points positifs et les axes d'amélioration..."
                rows={4}
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>

            {/* Critères détaillés */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CriteriaRating
                label="Qualité du travail"
                value={formData.quality}
                onChange={(quality) => setFormData(prev => ({ ...prev, quality }))}
              />
              <CriteriaRating
                label="Communication"
                value={formData.communication}
                onChange={(communication) => setFormData(prev => ({ ...prev, communication }))}
              />
              <CriteriaRating
                label="Respect des délais"
                value={formData.deadline}
                onChange={(deadline) => setFormData(prev => ({ ...prev, deadline }))}
              />
              <CriteriaRating
                label="Respect du budget"
                value={formData.budget}
                onChange={(budget) => setFormData(prev => ({ ...prev, budget }))}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || formData.rating === 0 || !formData.comment.trim()}
                className="flex-1"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Publier l\'avis'}
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
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {review.reviewerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.reviewerName}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Projet: {review.projectTitle}
                </p>
                <p className="text-gray-700">{review.comment}</p>
              </div>

              {/* Critères détaillés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                {Object.entries(review.criteriaScores).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm font-medium text-gray-900">{value}/5</div>
                    <div className="text-xs text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>

              {/* Réponse du prestataire */}
              {review.response && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Réponse de {review.reviewedName}
                    </span>
                    <span className="text-xs text-blue-600">
                      {new Date(review.responseDate!).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">{review.response}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHelpful(review.id, true)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      review.userHelpful 
                        ? 'text-green-600' 
                        : 'text-gray-600 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Utile ({review.helpfulCount})
                  </button>
                  <button
                    onClick={() => handleHelpful(review.id, false)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Pas utile
                  </button>
                </div>
                <Badge variant="outline" className="text-xs">
                  ID: {review.id}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}