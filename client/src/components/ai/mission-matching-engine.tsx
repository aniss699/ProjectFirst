
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Zap, 
  TrendingUp,
  Users,
  Clock,
  Star,
  MapPin
} from 'lucide-react';

interface MatchingResult {
  missionId: string;
  title: string;
  description: string;
  budget: number;
  matchScore: number;
  reasonsToApply: string[];
  competitionLevel: 'low' | 'medium' | 'high';
  winProbability: number;
  recommendedBidPrice: number;
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  urgency: 'low' | 'medium' | 'high';
  clientProfile: {
    name: string;
    rating: number;
    projectsPosted: number;
    avgBudget: number;
  };
}

interface MissionMatchingEngineProps {
  providerProfile: {
    id: string;
    skills: string[];
    location: string;
    rating: number;
    completedProjects: number;
    portfolio: any[];
    hourlyRate: number;
    categories: string[];
  };
  missions: any[];
  onMissionRecommended?: (mission: MatchingResult) => void;
}

export default function MissionMatchingEngine({ 
  providerProfile, 
  missions, 
  onMissionRecommended 
}: MissionMatchingEngineProps) {
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    minMatchScore: 70,
    maxCompetition: 'high' as 'low' | 'medium' | 'high',
    minWinProbability: 40
  });

  // Algorithme de matching intelligent
  const analyzeMatches = async () => {
    setIsAnalyzing(true);
    
    // Simulation du processus d'analyse
    await new Promise(resolve => setTimeout(resolve, 1500));

    const results = missions.map(mission => {
      // Calcul des différents scores de correspondance
      const skillsMatch = calculateSkillsMatch(mission, providerProfile);
      const experienceMatch = calculateExperienceMatch(mission, providerProfile);
      const locationMatch = calculateLocationMatch(mission, providerProfile);
      const budgetMatch = calculateBudgetMatch(mission, providerProfile);
      
      // Score global de correspondance
      const matchScore = (
        skillsMatch * 0.35 +
        experienceMatch * 0.25 +
        locationMatch * 0.15 +
        budgetMatch * 0.25
      );

      // Analyse de la concurrence
      const competitionLevel = analyzeCompetition(mission);
      
      // Probabilité de gain
      const winProbability = calculateWinProbability(
        matchScore,
        competitionLevel,
        providerProfile.rating,
        providerProfile.completedProjects
      );

      // Prix recommandé
      const recommendedBidPrice = calculateRecommendedPrice(
        mission,
        competitionLevel,
        providerProfile
      );

      // Niveau d'urgence
      const urgency = analyzeUrgency(mission);

      // Raisons de postuler
      const reasonsToApply = generateReasons(mission, providerProfile, {
        skillsMatch,
        experienceMatch,
        locationMatch,
        competitionLevel,
        winProbability
      });

      return {
        missionId: mission.id,
        title: mission.title,
        description: mission.description,
        budget: mission.budget,
        matchScore,
        reasonsToApply,
        competitionLevel,
        winProbability,
        recommendedBidPrice,
        skillsMatch,
        experienceMatch,
        locationMatch,
        urgency,
        clientProfile: {
          name: mission.clientName,
          rating: 4.2 + Math.random() * 0.8, // Simulation
          projectsPosted: Math.floor(Math.random() * 20) + 1,
          avgBudget: mission.budget * (0.8 + Math.random() * 0.4)
        }
      } as MatchingResult;
    });

    // Tri par score de correspondance
    const sortedResults = results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10

    setMatchingResults(sortedResults);
    setIsAnalyzing(false);
  };

  // Calcul de correspondance des compétences
  const calculateSkillsMatch = (mission: any, provider: any): number => {
    const missionKeywords = extractMissionKeywords(mission);
    const providerSkills = provider.skills.map((skill: string) => skill.toLowerCase());
    
    let matches = 0;
    let totalKeywords = missionKeywords.length;

    missionKeywords.forEach(keyword => {
      const isMatch = providerSkills.some(skill => 
        skill.includes(keyword) || keyword.includes(skill) ||
        calculateSimilarity(keyword, skill) > 0.7
      );
      if (isMatch) matches++;
    });

    return Math.min(100, (matches / Math.max(totalKeywords, 1)) * 100);
  };

  // Calcul de correspondance d'expérience
  const calculateExperienceMatch = (mission: any, provider: any): number => {
    let score = 0;

    // Score basé sur le nombre de projets
    if (provider.completedProjects >= 50) score += 40;
    else if (provider.completedProjects >= 20) score += 30;
    else if (provider.completedProjects >= 5) score += 20;
    else score += 10;

    // Score basé sur la catégorie
    if (provider.categories.includes(mission.category)) score += 30;

    // Score basé sur la note
    score += (provider.rating / 5) * 30;

    return Math.min(100, score);
  };

  // Calcul de correspondance géographique
  const calculateLocationMatch = (mission: any, provider: any): number => {
    if (!mission.location || !provider.location) return 70; // Neutre si pas d'info

    const missionLocation = mission.location.toLowerCase();
    const providerLocation = provider.location.toLowerCase();

    if (missionLocation === providerLocation) return 100;
    if (missionLocation.includes(providerLocation) || providerLocation.includes(missionLocation)) return 85;
    
    // Simulation de proximité géographique
    const distance = Math.random() * 500; // km
    if (distance < 50) return 90;
    if (distance < 100) return 75;
    if (distance < 200) return 60;
    return 40;
  };

  // Calcul de correspondance budgétaire
  const calculateBudgetMatch = (mission: any, provider: any): number => {
    const missionBudget = mission.budget;
    const providerRate = provider.hourlyRate;
    const estimatedHours = missionBudget / providerRate;

    if (estimatedHours >= 20 && estimatedHours <= 100) return 100; // Sweet spot
    if (estimatedHours >= 10 && estimatedHours <= 150) return 80;
    if (estimatedHours >= 5 && estimatedHours <= 200) return 60;
    return 40;
  };

  // Analyse du niveau de concurrence
  const analyzeCompetition = (mission: any): 'low' | 'medium' | 'high' => {
    const bidsCount = mission.bids?.length || 0;
    const daysSincePosted = Math.floor((Date.now() - new Date(mission.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    if (bidsCount > 10 || daysSincePosted > 7) return 'high';
    if (bidsCount > 5 || daysSincePosted > 3) return 'medium';
    return 'low';
  };

  // Calcul de probabilité de gain
  const calculateWinProbability = (
    matchScore: number,
    competition: string,
    rating: number,
    projects: number
  ): number => {
    let probability = matchScore;

    // Ajustement selon la concurrence
    if (competition === 'low') probability *= 1.3;
    else if (competition === 'high') probability *= 0.7;

    // Ajustement selon l'expérience
    probability += (rating / 5) * 10;
    probability += Math.min(15, projects * 0.2);

    return Math.min(95, Math.max(5, probability));
  };

  // Calcul du prix recommandé pour une mission
  const calculateRecommendedPrice = (
    mission: any,
    competition: string,
    provider: any
  ): number => {
    const baseBudget = mission.budget;
    let recommendedPrice = baseBudget;

    // Ajustement selon la concurrence
    if (competition === 'high') {
      recommendedPrice *= 0.85; // Plus agressif
    } else if (competition === 'low') {
      recommendedPrice *= 0.95; // Peut se permettre un prix plus élevé
    } else {
      recommendedPrice *= 0.90; // Compétitif
    }

    // Ajustement selon l'expérience du prestataire
    if (provider.rating >= 4.5 && provider.completedMissions >= 20) {
      recommendedPrice *= 1.05; // Premium pour l'expérience
    }

    return Math.round(recommendedPrice);
  };

  // Analyse de l'urgence
  const analyzeUrgency = (mission: any): 'low' | 'medium' | 'high' => {
    const urgencyKeywords = ['urgent', 'asap', 'rapidement', 'immédiat', 'express'];
    const hasUrgencyKeywords = urgencyKeywords.some(keyword =>
      mission.title.toLowerCase().includes(keyword) ||
      mission.description.toLowerCase().includes(keyword)
    );

    if (hasUrgencyKeywords) return 'high';

    const daysSincePosted = Math.floor((Date.now() - new Date(mission.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSincePosted <= 1) return 'high';
    if (daysSincePosted <= 3) return 'medium';
    return 'low';
  };

  // Génération des raisons de postuler
  const generateReasons = (mission: any, provider: any, scores: any): string[] => {
    const reasons = [];

    if (scores.skillsMatch >= 80) {
      reasons.push("Parfaite correspondance avec vos compétences");
    }

    if (scores.competitionLevel === 'low') {
      reasons.push("Faible concurrence - grande chance de succès");
    }

    if (scores.winProbability >= 70) {
      reasons.push(`${Math.round(scores.winProbability)}% de probabilité de gagner`);
    }

    if (mission.budget >= provider.hourlyRate * 20) {
      reasons.push("Budget attractif pour ce type de projet");
    }

    if (scores.locationMatch >= 90) {
      reasons.push("Client dans votre zone géographique");
    }

    return reasons.slice(0, 3); // Max 3 raisons
  };

  // Extraction des mots-clés de mission
  const extractMissionKeywords = (mission: any): string[] => {
    const text = (mission.title + ' ' + mission.description + ' ' + mission.category).toLowerCase();
    const commonWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc'];
    
    return text.split(/[\s,;.!?]+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10);
  };

  // Calcul de similarité entre mots
  const calculateSimilarity = (word1: string, word2: string): number => {
    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  // Distance de Levenshtein
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    if (missions.length > 0) {
      analyzeMatches();
    }
  }, [missions, providerProfile]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>Moteur de Matching IA</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Zap className="w-3 h-3 mr-1" />
              Algorithm v2.0
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {isAnalyzing ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Analyse de {missions.length} missions avec notre IA...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matchingResults.map((result, index) => (
            <Card key={result.missionId} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{result.title}</h3>
                      <Badge className={`px-2 py-1 text-xs ${getCompetitionColor(result.competitionLevel)}`}>
                        Concurrence {result.competitionLevel}
                      </Badge>
                      <Badge className={`px-2 py-1 text-xs ${getUrgencyColor(result.urgency)}`}>
                        {result.urgency === 'high' ? 'Urgent' : result.urgency === 'medium' ? 'Normal' : 'Pas pressé'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {result.budget}€
                    </div>
                    <div className="text-sm text-gray-500">
                      Prix suggéré: {result.recommendedBidPrice}€
                    </div>
                  </div>
                </div>

                {/* Score de correspondance */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score de correspondance</span>
                    <span className="text-lg font-bold text-purple-600">
                      {Math.round(result.matchScore)}%
                    </span>
                  </div>
                  <Progress value={result.matchScore} className="mb-2" />
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                    <div>Compétences: {Math.round(result.skillsMatch)}%</div>
                    <div>Expérience: {Math.round(result.experienceMatch)}%</div>
                    <div>Localisation: {Math.round(result.locationMatch)}%</div>
                  </div>
                </div>

                {/* Raisons de postuler */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-1 text-blue-600" />
                    Pourquoi postuler
                  </h4>
                  <ul className="space-y-1">
                    {result.reasonsToApply.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Informations client */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {result.clientProfile.name}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {result.clientProfile.rating.toFixed(1)}
                    </div>
                    <div>
                      {result.clientProfile.projectsPosted} projets postés
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{Math.round(result.winProbability)}% de succès</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Rang #{index + 1} sur {matchingResults.length}
                  </div>
                  <Button 
                    onClick={() => onMissionRecommended?.(result)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Voir la mission
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
