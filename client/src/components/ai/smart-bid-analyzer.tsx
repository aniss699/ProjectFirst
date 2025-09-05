
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Target,
  Star,
  Zap
} from 'lucide-react';

interface BidAnalysis {
  overallScore: number;
  competitivenessScore: number;
  qualityScore: number;
  matchScore: number;
  winProbability: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  optimizedProposal?: string;
  keywordRelevance: number;
  priceCompetitiveness: number;
  experienceMatch: number;
}

interface SmartBidAnalyzerProps {
  missionTitle: string;
  missionDescription: string;
  missionBudget: number;
  missionCategory: string;
  currentBid: {
    price: number;
    timeline: string;
    proposal: string;
  };
  providerProfile: {
    rating: number;
    completedProjects: number;
    skills: string[];
    portfolio: any[];
  };
  competitorBids?: any[];
  onOptimizedBidGenerated?: (optimizedBid: any) => void;
}

export default function SmartBidAnalyzer({
  missionTitle,
  missionDescription,
  missionBudget,
  missionCategory,
  currentBid,
  providerProfile,
  competitorBids = [],
  onOptimizedBidGenerated
}: SmartBidAnalyzerProps) {
  const [analysis, setAnalysis] = useState<BidAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);

  // Algorithme d'analyse des offres
  const analyzeBid = async () => {
    setIsAnalyzing(true);
    
    // Simulation d'une analyse IA complexe
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calcul du score de pertinence des mots-clés
    const missionKeywords = extractKeywords(missionTitle + ' ' + missionDescription);
    const proposalKeywords = extractKeywords(currentBid.proposal);
    const keywordRelevance = calculateKeywordMatch(missionKeywords, proposalKeywords);

    // Analyse de la compétitivité des prix
    const avgCompetitorPrice = competitorBids.length > 0 
      ? competitorBids.reduce((sum, bid) => sum + bid.price, 0) / competitorBids.length 
      : missionBudget;
    
    const priceCompetitiveness = calculatePriceScore(currentBid.price, avgCompetitorPrice, missionBudget);

    // Score d'expérience correspondante
    const experienceMatch = calculateExperienceMatch(
      providerProfile.skills,
      missionCategory,
      providerProfile.completedProjects,
      providerProfile.rating
    );

    // Calcul des scores principaux
    const qualityScore = calculateQualityScore(currentBid.proposal, providerProfile);
    const matchScore = (keywordRelevance + experienceMatch) / 2;
    const competitivenessScore = (priceCompetitiveness + calculateTimelineScore(currentBid.timeline)) / 2;
    
    const overallScore = (qualityScore * 0.4 + matchScore * 0.3 + competitivenessScore * 0.3);
    const winProbability = calculateWinProbability(overallScore, competitorBids.length);

    // Génération des recommandations
    const recommendations = generateRecommendations({
      keywordRelevance,
      priceCompetitiveness,
      experienceMatch,
      qualityScore,
      proposal: currentBid.proposal
    });

    const strengths = identifyStrengths({
      rating: providerProfile.rating,
      projects: providerProfile.completedProjects,
      skills: providerProfile.skills,
      price: currentBid.price,
      avgPrice: avgCompetitorPrice
    });

    const weaknesses = identifyWeaknesses({
      keywordRelevance,
      priceCompetitiveness,
      proposal: currentBid.proposal,
      timeline: currentBid.timeline
    });

    setAnalysis({
      overallScore,
      competitivenessScore,
      qualityScore,
      matchScore,
      winProbability,
      recommendations,
      strengths,
      weaknesses,
      keywordRelevance,
      priceCompetitiveness,
      experienceMatch
    });

    setIsAnalyzing(false);
  };

  // Algorithme d'extraction de mots-clés
  const extractKeywords = (text: string): string[] => {
    const commonWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car'];
    return text.toLowerCase()
      .split(/[\s,;.!?]+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10);
  };

  // Calcul de correspondance des mots-clés
  const calculateKeywordMatch = (missionKeywords: string[], proposalKeywords: string[]): number => {
    const matches = missionKeywords.filter(keyword => 
      proposalKeywords.some(pKeyword => 
        pKeyword.includes(keyword) || keyword.includes(pKeyword)
      )
    );
    return Math.min(100, (matches.length / missionKeywords.length) * 100);
  };

  // Calcul du score de prix
  const calculatePriceScore = (bidPrice: number, avgPrice: number, budget: number): number => {
    if (bidPrice > budget) return 20; // Trop cher
    if (bidPrice < budget * 0.3) return 40; // Suspicieusement bas
    if (bidPrice <= avgPrice * 0.9) return 90; // Très compétitif
    if (bidPrice <= avgPrice) return 75; // Compétitif
    return Math.max(30, 70 - ((bidPrice - avgPrice) / avgPrice) * 50);
  };

  // Calcul de correspondance d'expérience
  const calculateExperienceMatch = (skills: string[], category: string, projects: number, rating: number): number => {
    let score = 0;
    
    // Score basé sur les compétences
    const relevantSkills = skills.filter(skill => 
      skill.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(skill.toLowerCase())
    );
    score += (relevantSkills.length / Math.max(skills.length, 1)) * 40;
    
    // Score basé sur l'expérience
    score += Math.min(30, projects * 0.5);
    
    // Score basé sur la note
    score += (rating / 5) * 30;
    
    return Math.min(100, score);
  };

  // Calcul du score de qualité
  const calculateQualityScore = (proposal: string, profile: any): number => {
    let score = 0;
    
    // Longueur et détail
    if (proposal.length > 200) score += 25;
    if (proposal.length > 500) score += 15;
    
    // Mots-clés professionnels
    const professionalWords = ['expérience', 'qualité', 'deadline', 'livraison', 'garantie', 'suivi'];
    const foundWords = professionalWords.filter(word => proposal.toLowerCase().includes(word));
    score += foundWords.length * 5;
    
    // Profil du prestataire
    score += (profile.rating / 5) * 20;
    score += Math.min(20, profile.completedProjects * 0.2);
    
    return Math.min(100, score);
  };

  // Calcul de probabilité de gain
  const calculateWinProbability = (overallScore: number, competitorCount: number): number => {
    let probability = overallScore;
    
    // Ajustement selon la concurrence
    if (competitorCount > 5) probability *= 0.8;
    else if (competitorCount > 10) probability *= 0.6;
    else if (competitorCount < 3) probability *= 1.1;
    
    return Math.min(95, Math.max(5, probability));
  };

  // Calcul du score de délai
  const calculateTimelineScore = (timeline: string): number => {
    const timelineNum = parseInt(timeline);
    if (timelineNum <= 7) return 85; // Très rapide
    if (timelineNum <= 14) return 75; // Rapide
    if (timelineNum <= 30) return 65; // Normal
    return 45; // Lent
  };

  // Génération de recommandations
  const generateRecommendations = (scores: any): string[] => {
    const recommendations = [];
    
    if (scores.keywordRelevance < 60) {
      recommendations.push("Incluez plus de mots-clés spécifiques à la mission dans votre proposition");
    }
    
    if (scores.priceCompetitiveness < 50) {
      recommendations.push("Votre prix semble élevé par rapport à la concurrence, justifiez votre valeur ajoutée");
    }
    
    if (scores.proposal.length < 300) {
      recommendations.push("Développez davantage votre proposition pour montrer votre compréhension du projet");
    }
    
    if (scores.experienceMatch < 70) {
      recommendations.push("Mettez en avant votre expérience pertinente dans ce domaine");
    }
    
    return recommendations;
  };

  // Identification des forces
  const identifyStrengths = (data: any): string[] => {
    const strengths = [];
    
    if (data.rating >= 4.5) strengths.push("Excellente réputation client");
    if (data.projects > 50) strengths.push("Grande expérience avec de nombreux projets");
    if (data.price < data.avgPrice * 0.9) strengths.push("Prix très compétitif");
    
    return strengths;
  };

  // Identification des faiblesses
  const identifyWeaknesses = (data: any): string[] => {
    const weaknesses = [];
    
    if (data.keywordRelevance < 50) weaknesses.push("Faible correspondance avec les mots-clés de la mission");
    if (data.priceCompetitiveness < 40) weaknesses.push("Prix potentiellement trop élevé");
    if (data.proposal.length < 200) weaknesses.push("Proposition trop courte");
    
    return weaknesses;
  };

  // Génération d'une proposition optimisée
  const generateOptimizedProposal = () => {
    const optimizedProposal = `
Bonjour,

Votre projet "${missionTitle}" correspond parfaitement à mon expertise. Avec ${providerProfile.completedProjects} projets réalisés et une note de ${providerProfile.rating}/5, je peux vous garantir une livraison de qualité.

Mon approche pour votre projet :
• Analyse détaillée de vos besoins spécifiques
• Utilisation de mes compétences en ${providerProfile.skills.join(', ')}
• Respect strict des délais convenus
• Communication régulière sur l'avancement
• Garantie satisfaction client

Je propose de réaliser ce projet pour ${Math.round(currentBid.price * 0.95)}€ avec livraison sous ${currentBid.timeline}.

Ma valeur ajoutée : expérience prouvée dans ${missionCategory}, méthodologie rigoureuse et engagement qualité.

Disponible pour échanger sur votre projet dès maintenant.

Cordialement
    `.trim();

    setAnalysis(prev => prev ? { ...prev, optimizedProposal } : null);
    setShowOptimization(true);
    
    if (onOptimizedBidGenerated) {
      onOptimizedBidGenerated({
        ...currentBid,
        proposal: optimizedProposal,
        price: Math.round(currentBid.price * 0.95)
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <span>Analyse IA de votre offre</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Zap className="w-3 h-3 mr-1" />
            Smart Algorithm
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!analysis && !isAnalyzing && (
          <div className="text-center py-8">
            <Button onClick={analyzeBid} className="bg-blue-600 hover:bg-blue-700">
              <Brain className="w-4 h-4 mr-2" />
              Analyser mon offre avec l'IA
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Analyse en cours avec notre algorithme propriétaire...</p>
          </div>
        )}

        {analysis && (
          <>
            {/* Score global */}
            <div className={`p-6 rounded-xl ${getScoreBg(analysis.overallScore)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Score Global</h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {Math.round(analysis.overallScore)}
                  </span>
                  <span className="text-gray-500">/100</span>
                </div>
              </div>
              <Progress value={analysis.overallScore} className="mb-4" />
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1 text-blue-600" />
                  <span>Probabilité de succès: {Math.round(analysis.winProbability)}%</span>
                </div>
              </div>
            </div>

            {/* Scores détaillés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Qualité</h4>
                  <div className="flex items-center justify-between">
                    <Progress value={analysis.qualityScore} className="flex-1 mr-2" />
                    <span className={`font-bold ${getScoreColor(analysis.qualityScore)}`}>
                      {Math.round(analysis.qualityScore)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Correspondance</h4>
                  <div className="flex items-center justify-between">
                    <Progress value={analysis.matchScore} className="flex-1 mr-2" />
                    <span className={`font-bold ${getScoreColor(analysis.matchScore)}`}>
                      {Math.round(analysis.matchScore)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Compétitivité</h4>
                  <div className="flex items-center justify-between">
                    <Progress value={analysis.competitivenessScore} className="flex-1 mr-2" />
                    <span className={`font-bold ${getScoreColor(analysis.competitivenessScore)}`}>
                      {Math.round(analysis.competitivenessScore)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forces et faiblesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Forces
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-600">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Points d'amélioration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommandations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Recommandations IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Proposition optimisée */}
            <div className="text-center">
              <Button 
                onClick={generateOptimizedProposal}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={showOptimization}
              >
                <Brain className="w-4 h-4 mr-2" />
                Générer une proposition optimisée
              </Button>
            </div>

            {showOptimization && analysis.optimizedProposal && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-700">Proposition Optimisée par IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={analysis.optimizedProposal}
                    readOnly
                    className="min-h-[200px] bg-white"
                  />
                  <div className="mt-4 text-sm text-purple-600">
                    ✨ Cette proposition a été générée pour maximiser vos chances de succès
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
