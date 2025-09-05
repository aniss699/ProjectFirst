
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Euro,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  Users,
  Shield
} from 'lucide-react';

interface BiddingStrategy {
  strategy: 'aggressive' | 'competitive' | 'premium' | 'value';
  suggestedPrice: number;
  winProbability: number;
  reasoning: string[];
  pros: string[];
  cons: string[];
  marketPosition: string;
}

interface MarketIntelligence {
  averagePrice: number;
  priceRange: { min: number; max: number };
  competitionLevel: 'low' | 'medium' | 'high';
  marketTrend: 'increasing' | 'stable' | 'decreasing';
  optimalTimeToSubmit: string;
  keyCompetitors: number;
}

interface IntelligentBiddingGuideProps {
  mission: {
    id: string;
    title: string;
    budget: number;
    category: string;
    complexity: 'low' | 'medium' | 'high';
    urgency: 'low' | 'medium' | 'high';
    deadline: Date;
    requiredSkills: string[];
  };
  providerProfile: {
    id: string;
    rating: number;
    completedProjects: number;
    successRate: number;
    skills: string[];
    hourlyRate: number;
  };
  existingBids: any[];
  onBidRecommendation?: (recommendation: BiddingStrategy) => void;
}

export default function IntelligentBiddingGuide({ 
  mission, 
  providerProfile, 
  existingBids, 
  onBidRecommendation 
}: IntelligentBiddingGuideProps) {
  const [strategies, setStrategies] = useState<BiddingStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<BiddingStrategy | null>(null);
  const [marketIntel, setMarketIntel] = useState<MarketIntelligence | null>(null);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dynamicNudges, setDynamicNudges] = useState<string[]>([]);
  const [winProbability, setWinProbability] = useState(0);

  // Algorithme principal de guidage intelligent
  const generateBiddingStrategies = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 1. Analyse du marché
    const intelligence = analyzeMarket(existingBids, mission);
    
    // 2. Génération des stratégies
    const generatedStrategies = [
      generateAggressiveStrategy(intelligence, mission, providerProfile),
      generateCompetitiveStrategy(intelligence, mission, providerProfile),
      generatePremiumStrategy(intelligence, mission, providerProfile),
      generateValueStrategy(intelligence, mission, providerProfile)
    ];

    // 3. Tri par probabilité de succès
    const sortedStrategies = generatedStrategies.sort((a, b) => b.winProbability - a.winProbability);

    setStrategies(sortedStrategies);
    setMarketIntel(intelligence);
    setSelectedStrategy(sortedStrategies[0]);
    setCurrentBid(sortedStrategies[0].suggestedPrice);
    setIsAnalyzing(false);

    onBidRecommendation?.(sortedStrategies[0]);
  };

  // Analyse du marché
  const analyzeMarket = (bids: any[], mission: any): MarketIntelligence => {
    const prices = bids.map(bid => bid.price).filter(p => p > 0);
    
    if (prices.length === 0) {
      return {
        averagePrice: mission.budget * 0.85,
        priceRange: { min: mission.budget * 0.7, max: mission.budget * 0.95 },
        competitionLevel: 'low',
        marketTrend: 'stable',
        optimalTimeToSubmit: 'Immédiat - pas de concurrence',
        keyCompetitors: 0
      };
    }

    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Analyse de la concurrence
    const competitionLevel = bids.length > 10 ? 'high' : bids.length > 5 ? 'medium' : 'low';

    // Analyse de la tendance (basée sur les 3 dernières offres)
    const recentBids = bids.slice(-3).map(b => b.price);
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (recentBids.length >= 2) {
      const direction = recentBids[recentBids.length - 1] - recentBids[0];
      trend = direction > avgPrice * 0.05 ? 'increasing' : 
             direction < -avgPrice * 0.05 ? 'decreasing' : 'stable';
    }

    // Moment optimal pour soumissionner
    const timeRemaining = new Date(mission.deadline).getTime() - Date.now();
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);
    
    let optimalTime = '';
    if (hoursRemaining > 48) {
      optimalTime = 'Attendre 24-48h pour observer la concurrence';
    } else if (hoursRemaining > 24) {
      optimalTime = 'Moment optimal - soumettez maintenant';
    } else {
      optimalTime = 'Urgent - soumettez immédiatement';
    }

    return {
      averagePrice: avgPrice,
      priceRange: { min: minPrice, max: maxPrice },
      competitionLevel,
      marketTrend: trend,
      optimalTimeToSubmit: optimalTime,
      keyCompetitors: bids.length
    };
  };

  // Stratégie agressive
  const generateAggressiveStrategy = (intel: MarketIntelligence, mission: any, provider: any): BiddingStrategy => {
    const lowestBid = intel.priceRange.min;
    const suggestedPrice = Math.max(lowestBid * 0.95, mission.budget * 0.6);
    
    const winProbability = calculateWinProbability(suggestedPrice, intel, provider, 'aggressive');

    return {
      strategy: 'aggressive',
      suggestedPrice,
      winProbability,
      reasoning: [
        `Prix 5% en dessous du plus bas (${lowestBid}€)`,
        `Objectif: remporter à tout prix`,
        `Marge réduite mais volume élevé`
      ],
      pros: [
        'Très haute probabilité de gain',
        'Décroche rapidement le projet',
        'Écarte la concurrence'
      ],
      cons: [
        'Marge très faible voire négative',
        'Risque de perte financière',
        'Image de dumping possible'
      ],
      marketPosition: 'Leader prix'
    };
  };

  // Stratégie compétitive
  const generateCompetitiveStrategy = (intel: MarketIntelligence, mission: any, provider: any): BiddingStrategy => {
    const avgPrice = intel.averagePrice;
    const suggestedPrice = avgPrice * 0.92; // 8% en dessous de la moyenne
    
    const winProbability = calculateWinProbability(suggestedPrice, intel, provider, 'competitive');

    return {
      strategy: 'competitive',
      suggestedPrice,
      winProbability,
      reasoning: [
        `Prix 8% en dessous de la moyenne (${avgPrice.toFixed(0)}€)`,
        `Équilibre entre compétitivité et rentabilité`,
        `Position forte sur le marché`
      ],
      pros: [
        'Bon équilibre prix/qualité',
        'Probabilité de gain élevée',
        'Marge acceptable'
      ],
      cons: [
        'Concurrence possible',
        'Pas le prix le plus bas',
        'Requiert une différenciation'
      ],
      marketPosition: 'Compétitif'
    };
  };

  // Stratégie premium
  const generatePremiumStrategy = (intel: MarketIntelligence, mission: any, provider: any): BiddingStrategy => {
    const avgPrice = intel.averagePrice;
    const suggestedPrice = Math.min(avgPrice * 1.15, mission.budget * 0.95);
    
    const winProbability = calculateWinProbability(suggestedPrice, intel, provider, 'premium');

    return {
      strategy: 'premium',
      suggestedPrice,
      winProbability,
      reasoning: [
        `Prix premium basé sur la qualité`,
        `Mise sur l'expertise et l'expérience`,
        `Positionnement haut de gamme`
      ],
      pros: [
        'Marge élevée',
        'Positionnement qualité',
        'Clients valorisant l\'expertise'
      ],
      cons: [
        'Probabilité de gain plus faible',
        'Concurrence des prix bas',
        'Justification nécessaire'
      ],
      marketPosition: 'Premium'
    };
  };

  // Stratégie de valeur
  const generateValueStrategy = (intel: MarketIntelligence, mission: any, provider: any): BiddingStrategy => {
    const avgPrice = intel.averagePrice;
    const suggestedPrice = avgPrice * 0.88; // Position valeur
    
    const winProbability = calculateWinProbability(suggestedPrice, intel, provider, 'value');

    return {
      strategy: 'value',
      suggestedPrice,
      winProbability,
      reasoning: [
        `Meilleur rapport qualité-prix`,
        `Prix attractif avec qualité garantie`,
        `Positionnement intelligent`
      ],
      pros: [
        'Excellent positionnement',
        'Attire les clients rationnels',
        'Marge raisonnable'
      ],
      cons: [
        'Nécessite une communication claire',
        'Concurrence sur les deux fronts',
        'Doit prouver la valeur'
      ],
      marketPosition: 'Valeur'
    };
  };

  // Calcul de probabilité de gain
  const calculateWinProbability = (price: number, intel: MarketIntelligence, provider: any, strategy: string) => {
    let baseProbability = 50;

    // Ajustement selon le prix
    const pricePosition = (intel.priceRange.max - price) / (intel.priceRange.max - intel.priceRange.min);
    baseProbability += pricePosition * 30; // Plus le prix est bas, plus la probabilité augmente

    // Ajustement selon la qualité du prestataire
    const qualityBonus = (provider.rating / 5) * 15 + (provider.successRate * 10);
    baseProbability += qualityBonus;

    // Ajustement selon la concurrence
    const competitionPenalty = { low: 0, medium: -5, high: -15 }[intel.competitionLevel];
    baseProbability += competitionPenalty;

    // Ajustement selon la stratégie
    const strategyModifier = {
      aggressive: 20,
      competitive: 10,
      value: 5,
      premium: -10
    }[strategy] || 0;
    baseProbability += strategyModifier;

    return Math.max(5, Math.min(95, baseProbability));
  };

  // Génération de nudges dynamiques
  const generateDynamicNudges = (bid: number, intelligence: MarketIntelligence) => {
    const nudges = [];
    const ratio = bid / intelligence.averagePrice;

    if (ratio < 0.7) {
      nudges.push('⚠️ Prix très agressif - vérifiez votre rentabilité');
    }

    if (ratio > 1.2) {
      nudges.push('💡 Prix élevé - mettez en avant votre expertise');
    }

    if (intelligence.competitionLevel === 'high') {
      nudges.push('🎯 Forte concurrence - différenciez-vous par la qualité');
    }

    if (intelligence.marketTrend === 'decreasing') {
      nudges.push('📉 Tendance baissière - attendez ou soyez plus agressif');
    }

    if (new Date(mission.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      nudges.push('⏰ Deadline proche - soumettez rapidement');
    }

    return nudges;
  };

  // Mise à jour en temps réel de la probabilité
  const updateWinProbability = (newBid: number) => {
    if (!marketIntel) return;
    
    const probability = calculateWinProbability(newBid, marketIntel, providerProfile, 'custom');
    setWinProbability(probability);
    
    const nudges = generateDynamicNudges(newBid, marketIntel);
    setDynamicNudges(nudges);
  };

  useEffect(() => {
    generateBiddingStrategies();
  }, [mission.id, existingBids]);

  useEffect(() => {
    if (currentBid > 0 && marketIntel) {
      updateWinProbability(currentBid);
    }
  }, [currentBid, marketIntel]);

  const getStrategyColor = (strategy: string) => {
    const colors = {
      aggressive: 'bg-red-100 text-red-800 border-red-200',
      competitive: 'bg-blue-100 text-blue-800 border-blue-200',
      premium: 'bg-purple-100 text-purple-800 border-purple-200',
      value: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[strategy as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStrategyIcon = (strategy: string) => {
    const icons = {
      aggressive: TrendingUp,
      competitive: Target,
      premium: Shield,
      value: CheckCircle
    };
    return icons[strategy as keyof typeof icons] || Target;
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-6 h-6 mr-2 animate-pulse text-blue-600" />
            Analyse du marché en cours...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="text-center text-gray-500">
              Génération des stratégies optimales...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intelligence du marché */}
      {marketIntel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Intelligence du Marché
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {marketIntel.averagePrice.toFixed(0)}€
                </div>
                <div className="text-sm text-gray-600">Prix moyen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {marketIntel.keyCompetitors}
                </div>
                <div className="text-sm text-gray-600">Concurrents</div>
              </div>
              <div className="text-center">
                <Badge className={`text-xs ${
                  marketIntel.competitionLevel === 'high' ? 'bg-red-100 text-red-800' :
                  marketIntel.competitionLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {marketIntel.competitionLevel}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Concurrence</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">
                  {marketIntel.marketTrend === 'increasing' ? '📈' :
                   marketIntel.marketTrend === 'decreasing' ? '📉' : '➡️'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Tendance</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Clock className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                <div>
                  <span className="font-medium text-blue-800">Moment optimal:</span>
                  <p className="text-sm text-blue-700">{marketIntel.optimalTimeToSubmit}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulateur de prix en temps réel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Simulateur de Prix en Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Votre prix (€)
              </label>
              <Input
                type="number"
                value={currentBid}
                onChange={(e) => setCurrentBid(Number(e.target.value))}
                placeholder="Entrez votre prix"
                className="text-lg font-semibold"
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Probabilité de gain:</span>
              <div className="flex items-center space-x-2">
                <Progress value={winProbability} className="w-32" />
                <Badge className={`${
                  winProbability > 70 ? 'bg-green-100 text-green-800' :
                  winProbability > 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {winProbability.toFixed(0)}%
                </Badge>
              </div>
            </div>

            {/* Nudges dynamiques */}
            {dynamicNudges.length > 0 && (
              <div className="space-y-2">
                {dynamicNudges.map((nudge, idx) => (
                  <Alert key={idx} className="border-yellow-200 bg-yellow-50">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {nudge}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stratégies recommandées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strategy, idx) => {
          const StrategyIcon = getStrategyIcon(strategy.strategy);
          const isSelected = selectedStrategy?.strategy === strategy.strategy;
          
          return (
            <Card 
              key={idx} 
              className={`cursor-pointer transition-all ${
                isSelected ? 'border-2 border-blue-500 shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => {
                setSelectedStrategy(strategy);
                setCurrentBid(strategy.suggestedPrice);
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StrategyIcon className="w-5 h-5 mr-2" />
                    <span className="capitalize">{strategy.strategy}</span>
                  </div>
                  <Badge className={getStrategyColor(strategy.strategy)}>
                    {strategy.winProbability.toFixed(0)}% succès
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {strategy.suggestedPrice.toFixed(0)}€
                    </div>
                    <div className="text-sm text-gray-600">{strategy.marketPosition}</div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-1">Raisons:</h5>
                    <ul className="text-xs space-y-1">
                      {strategy.reasoning.slice(0, 2).map((reason, reasonIdx) => (
                        <li key={reasonIdx} className="text-gray-600">• {reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium text-green-600">Pros:</span>
                      <ul className="mt-1 space-y-1">
                        {strategy.pros.slice(0, 2).map((pro, proIdx) => (
                          <li key={proIdx} className="text-green-600">+ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-red-600">Cons:</span>
                      <ul className="mt-1 space-y-1">
                        {strategy.cons.slice(0, 2).map((con, conIdx) => (
                          <li key={conIdx} className="text-red-600">- {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {isSelected && (
                    <Button 
                      className="w-full mt-3" 
                      onClick={() => onBidRecommendation?.(strategy)}
                    >
                      Utiliser cette stratégie
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
