import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Lightbulb,
  CheckCircle,
  Clock,
  Euro,
  Users,
  Sparkles,
  BarChart3,
  Database,
  Activity,
  Shield,
  Settings,
  Star,
  AlertTriangle,
  Send,
  Loader2,
  BookOpen
} from 'lucide-react';

// Import des composants IA existants
import SmartBidAnalyzer from '@/components/ai/smart-bid-analyzer';
import MissionMatchingEngine from '@/components/ai/mission-matching-engine';
import RevenuePredictor from '@/components/ai/revenue-predictor';
import AdvancedScoringEngine from '@/components/ai/advanced-scoring-engine';

import { aiService } from '@/services/aiService';

export default function AIHub() {
  const [location] = useLocation();
  
  // Gérer les paramètres d'onglet depuis l'URL
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    return tabParam && ['demo', 'algorithms', 'market', 'docs'].includes(tabParam) 
      ? tabParam 
      : 'demo';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [demoType, setDemoType] = useState('pricing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoResults, setDemoResults] = useState(null);
  
  // État pour la démonstration interactive
  const [userInput, setUserInput] = useState({
    title: 'Création d\'un site e-commerce moderne',
    description: 'Je recherche un développeur pour créer une boutique en ligne avec React, système de paiement Stripe, gestion des stocks et interface d\'administration. Le site doit être responsive et optimisé SEO.',
    category: 'développement web',
    budget: 3500
  });

  // Charger les données réelles pour la démonstration
  const { data: analysisData, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['/api/ai-analysis-demo'],
    enabled: activeTab === 'demo',
    queryFn: async () => {
      const response = await fetch('/api/ai-analysis-demo');
      if (!response.ok) throw new Error('Erreur lors du chargement des données IA');
      return response.json();
    }
  });

  // Données de test pour les algorithmes avancés
  const mockAdvancedData = {
    testMission: {
      title: "Développement d'une plateforme SaaS complète",
      description: "Recherche d'un développeur full-stack senior pour créer une plateforme SaaS B2B avec tableau de bord analytique, API REST, système d'authentification, facturation automatique et interface multi-tenant.",
      budget: 12500,
      category: "web-development",
      complexity: "high",
      urgency: "medium",
      skillsRequired: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Stripe'],
      timeline: "16 semaines"
    },
    testProviderProfile: {
      id: "provider-123",
      rating: 4.8,
      completedProjects: 89,
      skills: ['React', 'Node.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Stripe API', 'Docker'],
      responseTime: 1.2,
      successRate: 0.94
    }
  };

  const runDemo = async (type: string) => {
    setDemoType(type);
    setIsAnalyzing(true);
    setDemoResults(null);
    
    try {
      let result;
      
      switch (type) {
        case 'pricing':
          result = await aiService.priceAnalysis({
            category: userInput.category,
            description: userInput.description,
            complexity: 7,
            urgency: 'medium'
          });
          break;
          
        case 'analysis':
          result = await aiService.quickAnalysis({
            title: userInput.title,
            description: userInput.description,
            category: userInput.category
          });
          break;
          
        case 'matching':
          result = await aiService.analyzeWithAI({
            title: userInput.title,
            description: userInput.description,
            category: userInput.category
          });
          break;
          
        default:
          // Fallback sur données simulées
          result = {
            score: Math.floor(Math.random() * 30 + 70),
            confidence: Math.floor(Math.random() * 20 + 80),
            suggestions: ['Amélioration détectée', 'Optimisation possible']
          };
      }
      
      setDemoResults(result);
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      // Données de fallback
      setDemoResults({
        score: 85,
        confidence: 88,
        suggestions: ['Service IA temporairement indisponible - données simulées']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setUserInput(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header unifié */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-blue-600" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hub Intelligence Artificielle
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez, testez et maîtrisez nos systèmes d'IA avancés. 
            Une plateforme unifiée pour explorer toutes nos fonctionnalités intelligentes.
          </p>
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Mettre à jour l'URL sans recharger la page
          const newUrl = `/ai-hub?tab=${value}`;
          window.history.pushState({}, '', newUrl);
        }} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 p-1">
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Démo Interactive</span>
              <span className="sm:hidden">Démo</span>
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Algorithmes</span>
              <span className="sm:hidden">Algo</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Market Intel</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Documentation</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Démonstration Interactive */}
          <TabsContent value="demo" className="space-y-6">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center text-xl">
                  <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
                  Testez l'IA avec vos propres données
                </CardTitle>
                <CardDescription>
                  Modifiez les paramètres ci-dessous et découvrez comment notre IA analyse votre projet en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre du projet</Label>
                      <Input
                        id="title"
                        value={userInput.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Ex: Développement d'une application mobile"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Input
                        id="category"
                        value={userInput.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="Ex: développement web, design, marketing"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="budget">Budget estimé (€)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={userInput.budget}
                        onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                        placeholder="3500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description détaillée</Label>
                    <Textarea
                      id="description"
                      value={userInput.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Décrivez votre projet en détail..."
                      className="h-32"
                    />
                  </div>
                </div>

                {/* Boutons de test */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <Button 
                    className="bg-green-600 hover:bg-green-700" 
                    onClick={() => runDemo('pricing')}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing && demoType === 'pricing' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <Euro className="w-4 h-4 mr-2" />
                        Estimation Prix
                      </>
                    )}
                  </Button>

                  <Button 
                    className="bg-blue-600 hover:bg-blue-700" 
                    onClick={() => runDemo('analysis')}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing && demoType === 'analysis' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Analyse Qualité
                      </>
                    )}
                  </Button>

                  <Button 
                    className="bg-purple-600 hover:bg-purple-700" 
                    onClick={() => runDemo('matching')}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing && demoType === 'matching' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Smart Matching
                      </>
                    )}
                  </Button>
                </div>

                {/* Résultats */}
                {demoResults && (
                  <Card className="mt-6 border-2 border-green-200">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="flex items-center text-lg">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Résultats de l'Analyse IA
                        <Badge className="ml-3 bg-green-100 text-green-800">
                          Temps réel
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {demoResults.score || demoResults.qualityScore || 85}/100
                          </div>
                          <div className="text-sm text-gray-600">Score IA</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {demoResults.confidence || 88}%
                          </div>
                          <div className="text-sm text-gray-600">Confiance</div>
                        </div>
                      </div>
                      
                      {demoResults.suggestions && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium text-gray-800">Suggestions IA :</h4>
                          {demoResults.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Algorithmes Avancés */}
          <TabsContent value="algorithms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-purple-900">Smart Matching</h3>
                      <Badge variant="outline" className="mt-1 text-xs bg-purple-100 text-purple-800">
                        94% précision
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Bid Optimizer</h3>
                      <Badge variant="outline" className="mt-1 text-xs bg-blue-100 text-blue-800">
                        +23% succès
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-900">Revenue Engine</h3>
                      <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-800">
                        89% précision
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-orange-900">Protection IA</h3>
                      <Badge variant="outline" className="mt-1 text-xs bg-orange-100 text-orange-800">
                        Anti-fraude
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="bid-analyzer" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bid-analyzer">Bid Analyzer</TabsTrigger>
                <TabsTrigger value="matching-engine">Smart Matching</TabsTrigger>
                <TabsTrigger value="revenue-predictor">Revenue AI</TabsTrigger>
              </TabsList>

              <TabsContent value="bid-analyzer">
                <SmartBidAnalyzer
                  missionTitle={mockAdvancedData.testMission.title}
                  missionDescription={mockAdvancedData.testMission.description}
                  missionBudget={mockAdvancedData.testMission.budget}
                  missionCategory={mockAdvancedData.testMission.category}
                  currentBid={{
                    price: 11800,
                    timeline: 14,
                    proposal: "Expert en développement SaaS avec 7 ans d'expérience...",
                    providerExperience: 7,
                    similarProjects: 12,
                    proposedTech: ['React', 'Node.js', 'PostgreSQL', 'AWS']
                  }}
                  providerProfile={mockAdvancedData.testProviderProfile}
                  competitorBids={[]}
                />
              </TabsContent>

              <TabsContent value="matching-engine">
                <MissionMatchingEngine
                  provider={{
                    id: "test-provider",
                    name: "Alexandre Martin",
                    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB'],
                    location: 'Paris',
                    rating: 4.7,
                    completedProjects: 34,
                    hourlyRate: 75
                  }}
                  missions={[
                    {
                      id: "mission1",
                      title: "Refonte complète d'une application e-commerce",
                      description: "Migration vers React/Node.js, optimisation performance",
                      budget: 8500,
                      category: "web-development",
                      location: "Paris",
                      createdAt: new Date(),
                      bids: []
                    }
                  ]}
                />
              </TabsContent>

              <TabsContent value="revenue-predictor">
                <RevenuePredictor
                  currentRevenue={180000}
                  historicalData={[
                    { month: "Jan", revenue: 140000, growth: 12 },
                    { month: "Fév", revenue: 152000, growth: 15 },
                    { month: "Mar", revenue: 168000, growth: 18 },
                    { month: "Avr", revenue: 180000, growth: 16 }
                  ]}
                  marketTrends={{
                    webDev: { demand: 92, avgBudget: 6200 },
                    mobile: { demand: 87, avgBudget: 8900 },
                    ai: { demand: 95, avgBudget: 12500 }
                  }}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          

          {/* Onglet Market Intelligence */}
          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Analyse Marché en Temps Réel
                </CardTitle>
                <CardDescription>
                  Insights et tendances détectés par notre IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Secteurs en Croissance</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm">IA & Machine Learning</span>
                        <Badge className="bg-green-100 text-green-800">+150%</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Applications No-Code</span>
                        <Badge className="bg-blue-100 text-blue-800">+89%</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">E-commerce Mobile</span>
                        <Badge className="bg-purple-100 text-purple-800">+67%</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Prix Moyens</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Développement</span>
                        <span className="font-medium">2500-8000€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Design</span>
                        <span className="font-medium">800-3000€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marketing</span>
                        <span className="font-medium">1200-4000€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IA/ML</span>
                        <span className="font-medium">5000-15000€</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Demande par Secteur</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Développement Web</span>
                        <div className="flex items-center gap-2">
                          <Progress value={80} className="w-16 h-2" />
                          <span className="text-sm text-gray-600">80%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Design UX/UI</span>
                        <div className="flex items-center gap-2">
                          <Progress value={65} className="w-16 h-2" />
                          <span className="text-sm text-gray-600">65%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Marketing Digital</span>
                        <div className="flex items-center gap-2">
                          <Progress value={55} className="w-16 h-2" />
                          <span className="text-sm text-gray-600">55%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Documentation */}
          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Guide d'Utilisation de l'IA
                </CardTitle>
                <CardDescription>
                  Découvrez comment tirer le meilleur parti de nos fonctionnalités IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Estimation Intelligente
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Notre IA analyse votre projet et propose automatiquement le prix optimal basé sur :
                    </p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Complexité technique détectée</li>
                      <li>• Analyse du marché en temps réel</li>
                      <li>• Historique des projets similaires</li>
                      <li>• Niveau de concurrence</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Smart Matching
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      L'algorithme de matching trouve les meilleures opportunités selon :
                    </p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Compatibilité des compétences</li>
                      <li>• Localisation géographique</li>
                      <li>• Historique de collaboration</li>
                      <li>• Budget et délais alignés</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Protection Anti-Fraude
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Système de détection automatique pour identifier :
                    </p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Tentatives de dumping tarifaire</li>
                      <li>• Profils suspects</li>
                      <li>• Activités anormales</li>
                      <li>• Coordinations de prix</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Analytics Prédictifs
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Prédictions basées sur l'analyse des données pour :
                    </p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Évolution du chiffre d'affaires</li>
                      <li>• Tendances sectorielles</li>
                      <li>• Opportunités de croissance</li>
                      <li>• Optimisation des stratégies</li>
                    </ul>
                  </Card>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 text-blue-900">💡 Conseils d'Utilisation</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><strong>Pour de meilleurs résultats :</strong></p>
                      <p>• Soyez précis dans vos descriptions de projet</p>
                      <p>• Mentionnez les technologies spécifiques souhaitées</p>
                      <p>• Indiquez vos contraintes de délais et budget</p>
                      <p>• Utilisez les suggestions d'amélioration proposées</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}