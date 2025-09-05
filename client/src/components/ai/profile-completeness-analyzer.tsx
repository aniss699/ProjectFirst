"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  User, 
  Star, 
  Target, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Eye,
  Lightbulb
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';

interface ProfileAnalysis {
  completeness_score: number;
  visibility_score: number;
  trust_score: number;
  missing_elements: Array<{
    category: string;
    item: string;
    impact: 'high' | 'medium' | 'low';
    suggestion: string;
    estimated_improvement: string;
  }>;
  strengths: string[];
  ai_suggestions: Array<{
    type: 'text_improvement' | 'missing_info' | 'optimization';
    field: string;
    current: string;
    suggested: string;
    reasoning: string;
    impact_score: number;
  }>;
  market_positioning: {
    current_rank: string;
    potential_rank: string;
    competitive_advantage: string[];
  };
}

interface ProfileCompletenessAnalyzerProps {
  userProfile: any;
  userType: 'client' | 'provider';
  onApplySuggestion: (field: string, value: string) => void;
}

export function ProfileCompletenessAnalyzer({ 
  userProfile, 
  userType, 
  onApplySuggestion 
}: ProfileCompletenessAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false); // State for the detailed analysis dialog

  const analyzeProfile = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/ai/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userProfile,
          user_type: userType
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);
      }
    } catch (error) {
      console.error('Erreur analyse profil:', error);
      // Fallback avec analyse basique
      setAnalysis(generateFallbackAnalysis());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFallbackAnalysis = (): ProfileAnalysis => {
    const completeness = calculateCompletenessScore();
    const missingElements = [];

    if (!userProfile.bio || userProfile.bio.length < 100) {
      missingElements.push({
        category: 'Description',
        item: 'Description détaillée',
        impact: 'high' as const,
        suggestion: 'Ajoutez une description de 150-300 mots pour expliquer votre expertise',
        estimated_improvement: '+25% de visibilité'
      });
    }

    if (userType === 'provider') {
      if (!userProfile.skills || userProfile.skills.length < 5) {
        missingElements.push({
          category: 'Compétences',
          item: 'Liste des compétences',
          impact: 'high' as const,
          suggestion: 'Ajoutez au moins 5-8 compétences principales',
          estimated_improvement: '+30% de correspondance'
        });
      }

      if (!userProfile.portfolio || userProfile.portfolio.length < 3) {
        missingElements.push({
          category: 'Portfolio',
          item: 'Projets de référence',
          impact: 'medium' as const,
          suggestion: 'Ajoutez 3-5 projets récents avec descriptions détaillées',
          estimated_improvement: '+20% de confiance client'
        });
      }
    }

    return {
      completeness_score: completeness,
      visibility_score: Math.min(completeness * 1.2, 100),
      trust_score: completeness * 0.8 + (userProfile.portfolio?.length || 0) * 5,
      missing_elements: missingElements,
      strengths: ['Profil vérifié', 'Informations de contact complètes'],
      ai_suggestions: [
        {
          type: 'text_improvement',
          field: 'bio',
          current: userProfile.bio || '',
          suggested: generateImprovedBio(),
          reasoning: 'Description plus engageante et professionnelle',
          impact_score: 85
        }
      ],
      market_positioning: {
        current_rank: 'Intermédiaire',
        potential_rank: 'Expert',
        competitive_advantage: ['Disponibilité rapide', 'Communication claire']
      }
    };
  };

  const generateImprovedBio = (): string => {
    if (userType === 'provider') {
      return "Développeur full-stack passionné avec expertise en React, Node.js et TypeScript. J'accompagne les entreprises dans leur transformation digitale en créant des solutions web modernes et performantes. Spécialisé dans l'architecture scalable et les interfaces utilisateur intuitives. Plus de 50 projets réalisés avec un taux de satisfaction client de 98%.";
    } else {
      return "Entreprise innovante spécialisée dans [votre secteur]. Nous recherchons des talents créatifs pour nos projets ambitieux. Notre équipe valorise l'excellence technique, la créativité et la collaboration. Nous privilégions les partenariats long terme avec nos prestataires.";
    }
  };

  const calculateCompletenessScore = (): number => {
    let score = 0;

    if (userProfile.name) score += 10;
    if (userProfile.email) score += 10;
    if (userProfile.phone) score += 5;
    if (userProfile.location) score += 5;
    if (userProfile.bio && userProfile.bio.length > 50) score += 20;

    if (userType === 'provider') {
      if (userProfile.skills && userProfile.skills.length >= 5) score += 25;
      if (userProfile.portfolio && userProfile.portfolio.length >= 3) score += 15;
      if (userProfile.hourlyRate) score += 10;
    } else {
      if (userProfile.company) score += 15;
      if (userProfile.industry) score += 15;
      if (userProfile.bio && userProfile.bio.length > 100) score += 10;
    }

    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-md">
              <Brain className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Analyse IA de votre profil</h3>
              <p className="text-sm text-gray-600">Optimisez votre visibilité et attractivité</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-4 py-2 shadow-lg">
              {analysis?.completeness_score || 0}% complet
            </Badge>
            <div className="text-xs text-gray-500 mt-1">
              Score de visibilité: {analysis?.visibility_score || 0}%
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis ? (
          <div className="text-center py-8">
            <Button onClick={analyzeProfile} disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-700">
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyser mon profil avec l'IA
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              L'IA analysera votre profil en 30 secondes
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Scores globaux */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${getScoreBgColor(analysis.completeness_score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <User className="h-5 w-5" />
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.completeness_score)}`}>
                    {analysis.completeness_score}%
                  </span>
                </div>
                <p className="text-sm font-medium">Complétude</p>
              </div>

              <div className={`p-4 rounded-lg ${getScoreBgColor(analysis.visibility_score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5" />
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.visibility_score)}`}>
                    {analysis.visibility_score}%
                  </span>
                </div>
                <p className="text-sm font-medium">Visibilité</p>
              </div>

              <div className={`p-4 rounded-lg ${getScoreBgColor(analysis.trust_score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-5 w-5" />
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.trust_score)}`}>
                    {Math.round(analysis.trust_score)}%
                  </span>
                </div>
                <p className="text-sm font-medium">Confiance</p>
              </div>
            </div>

            {/* Éléments manquants */}
            {analysis.missing_elements.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                  Améliorations prioritaires
                </h4>
                <div className="space-y-3">
                  {analysis.missing_elements.map((element, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{element.item}</span>
                            <Badge 
                              variant={element.impact === 'high' ? 'destructive' : element.impact === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {element.impact === 'high' ? 'Priorité haute' : 
                               element.impact === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{element.suggestion}</p>
                          <div className="flex items-center text-xs text-green-600">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {element.estimated_improvement}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions IA */}
            {analysis.ai_suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-blue-500" />
                  Suggestions d'amélioration IA
                </h4>
                <div className="space-y-3">
                  {analysis.ai_suggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium capitalize">{suggestion.field}</span>
                            <Badge variant="outline" className="text-xs">
                              Impact: {suggestion.impact_score}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{suggestion.reasoning}</p>

                          {suggestion.current && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">Actuel:</p>
                              <div className="bg-gray-100 p-2 rounded text-sm">
                                {suggestion.current.substring(0, 100)}...
                              </div>
                            </div>
                          )}

                          <div className="mb-3">
                            <p className="text-xs text-blue-600 mb-1">Suggestion IA:</p>
                            <div className="bg-white p-3 rounded border border-blue-200 text-sm">
                              {suggestion.suggested}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => onApplySuggestion(suggestion.field, suggestion.suggested)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Appliquer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedSuggestion(selectedSuggestion === index ? null : index)}
                        >
                          {selectedSuggestion === index ? 'Masquer' : 'Détails'}
                        </Button>
                      </div>

                      {selectedSuggestion === index && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs text-gray-600">
                            Cette amélioration pourrait augmenter votre visibilité de <strong>{suggestion.impact_score}%</strong> 
                            en rendant votre profil plus attractif pour les {userType === 'provider' ? 'clients' : 'prestataires'}.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positionnement marché */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-500" />
                Positionnement marché
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Position actuelle</p>
                  <p className="font-medium">{analysis.market_positioning.current_rank}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Potentiel</p>
                  <p className="font-medium text-green-600">{analysis.market_positioning.potential_rank}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Avantages concurrentiels:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.market_positioning.competitive_advantage.map((advantage, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {advantage}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bouton pour ouvrir le dialogue d'analyse détaillée */}
            <div className="text-center">
              <Button 
                onClick={() => setShowDetailedAnalysis(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir l'analyse détaillée
              </Button>
            </div>

            {/* Dialogue d'analyse détaillée */}
            <Dialog open={showDetailedAnalysis} onOpenChange={setShowDetailedAnalysis}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogTitle>Analyse détaillée du profil IA</DialogTitle>
                <DialogDescription>
                  Découvrez les recommandations personnalisées pour optimiser votre profil et augmenter vos opportunités.
                </DialogDescription>
                <div className="space-y-6">
                  {/* Contenu de l'analyse détaillée ici, potentiellement une copie ou une version plus détaillée de ce qui est déjà affiché */}
                  {/* Par exemple, afficher tous les éléments manquants et suggestions */}
                  {analysis.missing_elements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                        Améliorations prioritaires
                      </h4>
                      <div className="space-y-3">
                        {analysis.missing_elements.map((element, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{element.item}</span>
                                  <Badge 
                                    variant={element.impact === 'high' ? 'destructive' : element.impact === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {element.impact === 'high' ? 'Priorité haute' : 
                                     element.impact === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{element.suggestion}</p>
                                <div className="flex items-center text-xs text-green-600">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {element.estimated_improvement}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.ai_suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2 text-blue-500" />
                        Suggestions d'amélioration IA
                      </h4>
                      <div className="space-y-3">
                        {analysis.ai_suggestions.map((suggestion, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium capitalize">{suggestion.field}</span>
                                  <Badge variant="outline" className="text-xs">
                                    Impact: {suggestion.impact_score}%
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{suggestion.reasoning}</p>

                                {suggestion.current && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-1">Actuel:</p>
                                    <div className="bg-gray-100 p-2 rounded text-sm">
                                      {suggestion.current.substring(0, 100)}...
                                    </div>
                                  </div>
                                )}

                                <div className="mb-3">
                                  <p className="text-xs text-blue-600 mb-1">Suggestion IA:</p>
                                  <div className="bg-white p-3 rounded border border-blue-200 text-sm">
                                    {suggestion.suggested}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => onApplySuggestion(suggestion.field, suggestion.suggested)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Appliquer
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedSuggestion(selectedSuggestion === index ? null : index)}
                              >
                                {selectedSuggestion === index ? 'Masquer' : 'Détails'}
                              </Button>
                            </div>

                            {selectedSuggestion === index && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-xs text-gray-600">
                                  Cette amélioration pourrait augmenter votre visibilité de <strong>{suggestion.impact_score}%</strong> 
                                  en rendant votre profil plus attractif pour les {userType === 'provider' ? 'clients' : 'prestataires'}.
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                   {/* Fin du contenu de l'analyse détaillée */}
                </div>
              </DialogContent>
            </Dialog>

            {/* Bouton re-analyser */}
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={analyzeProfile}
                disabled={isAnalyzing}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Re-analyser le profil
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}