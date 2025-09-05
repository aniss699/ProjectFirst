import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Star, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AIRecommendation {
  id: string;
  type: 'provider' | 'mission' | 'skill' | 'price' | 'optimization' | 'market' | 'pricing' | 'networking';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
  actionable: boolean;
  potentialImpact: 'low' | 'medium' | 'high';
  metrics?: {
    currentScore?: number;
    potentialIncrease?: string;
    timeToImplement?: string;
    demandIncrease?: string;
    avgBudgetIncrease?: string;
    matchScore?: string;
    currentRate?: string;
    recommendedRate?: string;
    increaseJustification?: string;
    potentialPartners?: number;
    collaborativeProjects?: string;
    networkScore?: string;
  };
}

interface RecommendationEngineProps {
  userId: string;
  context: 'dashboard' | 'mission' | 'profile';
}

export function RecommendationEngine({ userId, context }: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const generateRecommendations = () => {
    // Profil utilisateur enrichi avec historique d'apprentissage
    const userProfile = {
      skills: ['React', 'Node.js', 'TypeScript'],
      rating: 4.2,
      completedProjects: 15,
      responseTime: 2.5,
      successRate: 0.85,
      preferredBudgetRange: [1000, 5000],
      location: 'Paris',
      availability: 0.7,
      // Nouvelles métriques d'apprentissage
      learningHistory: {
        recommendationsAccepted: 12,
        recommendationsIgnored: 3,
        averageImplementationTime: 5.2, // jours
        successfulImplementations: 10
      },
      behaviorPattern: {
        prefersDetailedAnalysis: true,
        respondsToUrgency: false,
        focusesOnQuality: true,
        adaptsToPricing: true
      },
      contextualFactors: {
        currentWorkload: 0.7,
        seasonalTrend: 'high',
        recentPerformance: 'improving',
        marketPosition: 'competitive'
      }
    };

    const marketTrends = {
      demandingSkills: ['React', 'Vue.js', 'Python', 'AI/ML', 'Blockchain'],
      avgBudgetIncrease: 0.15,
      competitionLevel: 0.6,
      seasonalDemand: 0.8
    };

    // Scoring algorithmique avancé
    const calculateProfileScore = (profile: typeof userProfile) => {
      let score = 0;

      // Score basé sur les compétences (40%)
      const skillsScore = profile.skills.filter(skill => 
        marketTrends.demandingSkills.includes(skill)
      ).length / marketTrends.demandingSkills.length;
      score += skillsScore * 0.4;

      // Score basé sur la performance (30%)
      const performanceScore = (profile.rating / 5) * profile.successRate;
      score += performanceScore * 0.3;

      // Score basé sur la réactivité (20%)
      const reactivityScore = Math.max(0, 1 - (profile.responseTime / 24));
      score += reactivityScore * 0.2;

      // Score basé sur l'expérience (10%)
      const experienceScore = Math.min(1, profile.completedProjects / 50);
      score += experienceScore * 0.1;

      return Math.round(score * 100);
    };

    const profileScore = calculateProfileScore(userProfile);

    const recommendations = [
      {
        id: '1',
        type: 'optimization',
        title: 'Optimisez votre profil technique',
        description: `Score actuel: ${profileScore}%. Ajoutez Python et AI/ML pour atteindre 95%`,
        impact: profileScore < 70 ? 'high' : profileScore < 85 ? 'medium' : 'low',
        reasoning: [
          `Profil technique à ${profileScore}%`,
          'Python demandé dans 65% des nouveaux projets',
          'AI/ML: croissance de +120% cette année',
          'Impact estimé: +€800/mois de revenus'
        ],
        actionable: true,
        confidence: 94,
        metrics: {
          currentScore: profileScore,
          potentialIncrease: '+15%',
          timeToImplement: '2 semaines'
        }
      },
      {
        id: '2',
        type: 'market',
        title: 'Opportunité de marché détectée',
        description: 'Pic de demande en développement e-commerce (+45% cette semaine)',
        impact: 'high',
        reasoning: [
          'Analyse de 250+ projets récents',
          'Budget moyen en hausse de 23%',
          'Compétition réduite de 18%',
          'Vos compétences matchent à 87%'
        ],
        actionable: true,
        confidence: 89,
        metrics: {
          demandIncrease: '+45%',
          avgBudgetIncrease: '+23%',
          matchScore: '87%'
        }
      },
      {
        id: '3',
        type: 'pricing',
        title: 'Stratégie de prix optimisée',
        description: 'Augmentez vos tarifs de 15% basé sur votre performance',
        impact: 'medium',
        reasoning: [
          'Performance supérieure à 78% des prestataires',
          'Taux de satisfaction de 96%',
          'Délais respectés dans 92% des cas',
          'Market positioning favorable'
        ],
        actionable: true,
        confidence: 76,
        metrics: {
          currentRate: '45€/h',
          recommendedRate: '52€/h',
          increaseJustification: '+15%'
        }
      },
      {
        id: '4',
        type: 'networking',
        title: 'Réseau et partenariats',
        description: 'Connectez-vous avec 3 prestataires complémentaires identifiés',
        impact: 'medium',
        reasoning: [
          'Projets nécessitant équipes multidisciplinaires: +30%',
          '3 profils complémentaires identifiés dans votre zone',
          'Potentiel de projets collaboratifs élevé'
        ],
        actionable: true,
        confidence: 71,
        metrics: {
          potentialPartners: 3,
          collaborativeProjects: '+30%',
          networkScore: 'Faible'
        }
      }
    ];

    // Trier par impact et confiance
    const sortedRecommendations = recommendations.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      const aScore = impactWeight[a.impact] * (a.confidence / 100);
      const bScore = impactWeight[b.impact] * (b.confidence / 100);
      return bScore - aScore;
    });

    setRecommendations(sortedRecommendations);
  };

  useEffect(() => {
    generateRecommendations();
  }, [userId, context]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return TrendingUp;
      case 'medium': return Target;
      case 'low': return Star;
      default: return Zap;
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse text-blue-500" />
            IA en cours d'analyse...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Recommandations IA</h3>
        <Badge variant="secondary">Beta</Badge>
      </div>

      {recommendations.map((rec) => {
        const ImpactIcon = getImpactIcon(rec.potentialImpact);

        return (
          <Card key={rec.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ImpactIcon className={`h-4 w-4 ${getImpactColor(rec.potentialImpact)}`} />
                  <CardTitle className="text-base">{rec.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Confiance:</span>
                  <Badge variant={rec.confidence > 90 ? "default" : "secondary"}>
                    {rec.confidence}%
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-700">{rec.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Niveau de confiance</span>
                  <span>{rec.confidence}%</span>
                </div>
                <Progress value={rec.confidence} className="h-2" />
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-sm">Analyse:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {rec.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {rec.actionable && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm">Appliquer</Button>
                  <Button variant="outline" size="sm">En savoir plus</Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}