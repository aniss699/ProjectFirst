import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Star, 
  Zap, 
  Shield, 
  Crown, 
  Trophy, 
  Target,
  Clock,
  Users,
  CheckCircle,
  Flame,
  Heart
} from 'lucide-react';

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'performance' | 'reliability' | 'expertise' | 'community' | 'special';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt?: string;
  progress?: number;
  requirement?: string;
}

export interface ReputationMetrics {
  totalScore: number;
  level: number;
  levelName: string;
  nextLevelScore: number;
  progressToNext: number;
  badges: UserBadge[];
  monthlyTrend: 'up' | 'down' | 'stable';
  categories: {
    qualityScore: number;
    reliabilityScore: number;
    communicationScore: number;
    expertiseScore: number;
  };
}

interface BadgeSystemProps {
  userId: string;
  metrics?: ReputationMetrics;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

export function BadgeSystem({
  userId,
  metrics,
  showProgress = true,
  compact = false,
  className = ''
}: BadgeSystemProps) {
  
  // Mock data pour les métriques de réputation
  const mockMetrics: ReputationMetrics = metrics || {
    totalScore: 4850,
    level: 8,
    levelName: 'Expert Confirmé',
    nextLevelScore: 5000,
    progressToNext: 97,
    monthlyTrend: 'up',
    categories: {
      qualityScore: 4.9,
      reliabilityScore: 4.8,
      communicationScore: 4.9,
      expertiseScore: 4.7
    },
    badges: [
      {
        id: 'expert-verified',
        name: 'Expert Vérifié',
        description: 'Compétences validées par des pairs',
        icon: 'Shield',
        color: 'text-blue-600 bg-blue-100',
        category: 'expertise',
        level: 'gold',
        earnedAt: '2024-01-15'
      },
      {
        id: 'top-performer',
        name: 'Top Performer',
        description: 'Parmi les 5% des meilleurs prestataires',
        icon: 'Crown',
        color: 'text-purple-600 bg-purple-100',
        category: 'performance',
        level: 'platinum',
        earnedAt: '2024-01-10'
      },
      {
        id: 'lightning-response',
        name: 'Réponse Éclair',
        description: 'Répond en moins de 2h en moyenne',
        icon: 'Zap',
        color: 'text-yellow-600 bg-yellow-100',
        category: 'reliability',
        level: 'gold',
        earnedAt: '2024-01-08'
      },
      {
        id: 'project-master',
        name: 'Maître de Projet',
        description: '100+ projets complétés avec succès',
        icon: 'Trophy',
        color: 'text-green-600 bg-green-100',
        category: 'performance',
        level: 'gold',
        earnedAt: '2024-01-05'
      },
      {
        id: 'community-star',
        name: 'Étoile Communauté',
        description: 'Aidé 50+ nouveaux prestataires',
        icon: 'Star',
        color: 'text-orange-600 bg-orange-100',
        category: 'community',
        level: 'silver',
        earnedAt: '2023-12-20'
      },
      {
        id: 'deadline-ninja',
        name: 'Ninja des Délais',
        description: '95% de projets livrés à temps',
        icon: 'Target',
        color: 'text-red-600 bg-red-100',
        category: 'reliability',
        level: 'gold',
        earnedAt: '2023-12-15'
      }
    ]
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Shield, Crown, Zap, Trophy, Star, Target, Clock, Users, CheckCircle, Flame, Heart, Award
    };
    return icons[iconName] || Award;
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-600 text-white';
      case 'silver': return 'bg-gray-400 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'platinum': return 'bg-purple-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      performance: 'Performance',
      reliability: 'Fiabilité',
      expertise: 'Expertise',
      community: 'Communauté',
      special: 'Spécial'
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {mockMetrics.badges.slice(0, 3).map((badge) => {
          const IconComponent = getIcon(badge.icon);
          return (
            <div key={badge.id} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full ${badge.color} flex items-center justify-center`}>
                <IconComponent className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium text-gray-700">{badge.name}</span>
            </div>
          );
        })}
        {mockMetrics.badges.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{mockMetrics.badges.length - 3} autres
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Niveau et progression globale */}
      {showProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Niveau de Réputation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Niveau {mockMetrics.level}
                  </h3>
                  <p className="text-lg text-gray-600">{mockMetrics.levelName}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {mockMetrics.totalScore}
                  </div>
                  <div className="text-sm text-gray-500">
                    {mockMetrics.nextLevelScore - mockMetrics.totalScore} pour le niveau suivant
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progression vers le niveau {mockMetrics.level + 1}</span>
                  <span>{mockMetrics.progressToNext}%</span>
                </div>
                <Progress value={mockMetrics.progressToNext} className="h-3" />
              </div>
              
              {/* Métriques par catégorie */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {Object.entries(mockMetrics.categories).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {value.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace('Score', '')}
                    </div>
                    <div className="flex justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            Badges et Récompenses ({mockMetrics.badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {['performance', 'reliability', 'expertise', 'community', 'special'].map((category) => {
              const categoryBadges = mockMetrics.badges.filter(b => b.category === category);
              if (categoryBadges.length === 0) return null;
              
              return (
                <div key={category}>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {getCategoryLabel(category)}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryBadges.map((badge) => {
                      const IconComponent = getIcon(badge.icon);
                      return (
                        <div
                          key={badge.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center relative`}>
                            <IconComponent className="w-5 h-5" />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center ${getLevelBadgeColor(badge.level)}`}>
                              {badge.level === 'bronze' && '🥉'}
                              {badge.level === 'silver' && '🥈'}
                              {badge.level === 'gold' && '🥇'}
                              {badge.level === 'platinum' && '💎'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{badge.name}</h5>
                            <p className="text-sm text-gray-600">{badge.description}</p>
                            {badge.earnedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Obtenu le {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                          {badge.progress !== undefined && (
                            <div className="w-16">
                              <Progress value={badge.progress} className="h-2" />
                              <span className="text-xs text-gray-500">{badge.progress}%</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badges en cours d'obtention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Prochains Objectifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: 'Mentor de la Communauté',
                description: 'Aider 100 nouveaux prestataires',
                progress: 68,
                requirement: '32 mentorés restants'
              },
              {
                name: 'Excellence Continue',
                description: 'Maintenir une note de 4.9+ pendant 6 mois',
                progress: 83,
                requirement: '2 mois restants'
              },
              {
                name: 'Spécialiste Certifié',
                description: 'Obtenir 3 certifications professionnelles',
                progress: 33,
                requirement: '2 certifications restantes'
              }
            ].map((badge, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{badge.name}</h5>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={badge.progress} className="flex-1 h-2" />
                    <span className="text-sm text-gray-600">{badge.progress}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{badge.requirement}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}