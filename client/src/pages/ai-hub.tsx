
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
  BookOpen,
  Rocket,
  Award,
  Cpu,
  Globe,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Download,
  Upload,
  Mic,
  Camera,
  FileText,
  Code,
  Palette,
  Megaphone,
  Wrench,
  Calculator,
  PieChart,
  LineChart,
  Gauge,
  Layers,
  Network,
  Workflow,
  Bot,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  ExternalLink
} from 'lucide-react';

// Import des composants IA existants améliorés
import SmartBidAnalyzer from '@/components/ai/smart-bid-analyzer';
import MissionMatchingEngine from '@/components/ai/mission-matching-engine';
import RevenuePredictor from '@/components/ai/revenue-predictor';
import AdvancedScoringEngine from '@/components/ai/advanced-scoring-engine';

import { aiService } from '@/services/aiService';

// Nouvelles interfaces pour les fonctionnalités avancées
interface AIExperiment {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  results?: any;
}

interface AIInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  confidence: number;
  timestamp: Date;
  actionable?: boolean;
  action?: string;
}

interface AdvancedMetrics {
  accuracy: number;
  latency: number;
  throughput: number;
  errorRate: number;
  confidence: number;
}

export default function AIHub() {
  const [location] = useLocation();
  
  // État étendu pour les nouvelles fonctionnalités
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    return tabParam && ['playground', 'algorithms', 'analytics', 'experiments', 'insights', 'monitoring', 'docs'].includes(tabParam) 
      ? tabParam 
      : 'playground';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [demoType, setDemoType] = useState('pricing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoResults, setDemoResults] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [selectedModel, setSelectedModel] = useState('neural-v3');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [experiments, setExperiments] = useState<AIExperiment[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [metrics, setMetrics] = useState<AdvancedMetrics>({
    accuracy: 0.94,
    latency: 45,
    throughput: 1250,
    errorRate: 0.02,
    confidence: 0.87
  });

  // État pour la démonstration interactive enrichie
  const [userInput, setUserInput] = useState({
    title: 'Développement d\'une plateforme SaaS innovante',
    description: 'Création d\'une solution SaaS complète pour la gestion de projets collaboratifs avec IA intégrée, dashboard analytique en temps réel, API REST robuste, système d\'authentification multi-facteurs, et interface utilisateur moderne en React.',
    category: 'développement web',
    budget: 15000,
    urgency: 'medium',
    complexity: 8,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AI/ML'],
    location: 'Paris',
    timeline: 12
  });

  // Chargement des données en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRealTime && activeTab === 'monitoring') {
        updateRealTimeMetrics();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealTime, activeTab]);

  // Données de test enrichies pour les algorithmes avancés
  const mockAdvancedData = {
    testMission: {
      title: "Développement d'une plateforme SaaS complète avec IA",
      description: "Recherche d'un développeur senior full-stack pour créer une plateforme SaaS B2B révolutionnaire avec intelligence artificielle intégrée, tableau de bord analytique avancé, API GraphQL moderne, système d'authentification OAuth2, facturation automatique avec Stripe, interface multi-tenant, et déploiement cloud scalable.",
      budget: 25000,
      category: "web-development",
      complexity: "very-high",
      urgency: "high",
      skillsRequired: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL', 'AWS', 'Docker', 'AI/ML', 'Stripe'],
      timeline: "20 semaines",
      marketDemand: 0.92,
      competitionLevel: 0.78
    },
    testProviderProfile: {
      id: "provider-premium-123",
      rating: 4.9,
      completedProjects: 147,
      skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL', 'AWS', 'Docker', 'AI/ML', 'Stripe API', 'Kubernetes'],
      responseTime: 0.8,
      successRate: 0.97,
      specializations: ['SaaS', 'IA/ML', 'Cloud Architecture'],
      certifications: ['AWS Solutions Architect', 'Google Cloud Professional']
    }
  };

  const updateRealTimeMetrics = () => {
    setMetrics(prev => ({
      accuracy: Math.min(0.99, prev.accuracy + (Math.random() - 0.5) * 0.02),
      latency: Math.max(20, prev.latency + (Math.random() - 0.5) * 10),
      throughput: Math.max(800, prev.throughput + (Math.random() - 0.5) * 100),
      errorRate: Math.max(0.001, prev.errorRate + (Math.random() - 0.5) * 0.005),
      confidence: Math.min(0.95, prev.confidence + (Math.random() - 0.5) * 0.03)
    }));
  };

  const runAdvancedDemo = async (type: string) => {
    setDemoType(type);
    setIsAnalyzing(true);
    setDemoResults(null);
    
    try {
      let result;
      
      switch (type) {
        case 'neural-pricing':
          result = await aiService.priceAnalysis({
            category: userInput.category,
            description: userInput.description,
            complexity: userInput.complexity,
            urgency: userInput.urgency,
            location: userInput.location,
            skills: userInput.skills,
            marketData: {
              demand: 0.85,
              competition: 0.72,
              avgBudget: 12000
            }
          });
          break;
          
        case 'semantic-analysis':
          result = await aiService.analyzeWithAI({
            title: userInput.title,
            description: userInput.description,
            category: userInput.category,
            advanced: true
          });
          break;
          
        case 'smart-matching':
          result = await aiService.analyzeWithAI({
            title: userInput.title,
            description: userInput.description,
            category: userInput.category,
            skills: userInput.skills,
            location: userInput.location
          });
          break;

        case 'predictive-analytics':
          result = {
            success_probability: 0.87,
            market_trends: ['SaaS en forte croissance', 'Demande IA très élevée'],
            revenue_forecast: [18000, 22000, 28000],
            risk_factors: ['Concurrence élevée', 'Délais serrés'],
            optimization_tips: ['Augmenter budget de 20%', 'Cibler profils seniors']
          };
          break;

        case 'competitive-analysis':
          result = {
            market_position: 'premium',
            competitor_count: 12,
            price_benchmark: { min: 18000, avg: 22000, max: 28000 },
            differentiation: ['IA intégrée', 'Expertise Cloud', 'Portfolio solide'],
            market_share: 0.15
          };
          break;
          
        default:
          result = {
            score: Math.floor(Math.random() * 20 + 80),
            confidence: Math.floor(Math.random() * 15 + 85),
            suggestions: ['Analyse avancée terminée', 'Recommandations générées']
          };
      }
      
      setDemoResults(result);
      
      // Ajouter insight automatiquement
      addInsight({
        type: 'success',
        title: `Analyse ${type} terminée`,
        message: `Résultats générés avec ${result.confidence || 85}% de confiance`,
        confidence: result.confidence || 85,
        timestamp: new Date(),
        actionable: true,
        action: 'Voir détails'
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      setDemoResults({
        score: 85,
        confidence: 78,
        error: 'Service IA temporairement indisponible',
        suggestions: ['Réessayer plus tard', 'Contacter le support']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addInsight = (insight: Omit<AIInsight, 'timestamp'> & { timestamp: Date }) => {
    setInsights(prev => [insight, ...prev.slice(0, 9)]);
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setUserInput(prev => ({ ...prev, [field]: value }));
  };

  const startExperiment = (experimentType: string) => {
    const newExperiment: AIExperiment = {
      id: Date.now().toString(),
      name: `Test ${experimentType}`,
      description: `Expérience d'optimisation ${experimentType}`,
      status: 'running',
      progress: 0
    };
    
    setExperiments(prev => [newExperiment, ...prev]);
    
    // Simuler progression
    const interval = setInterval(() => {
      setExperiments(prev => prev.map(exp => 
        exp.id === newExperiment.id 
          ? { ...exp, progress: Math.min(100, exp.progress + Math.random() * 25) }
          : exp
      ));
    }, 1000);
    
    setTimeout(() => {
      clearInterval(interval);
      setExperiments(prev => prev.map(exp => 
        exp.id === newExperiment.id 
          ? { ...exp, status: 'completed', progress: 100, results: { improvement: '+23%' } }
          : exp
      ));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header unifié amélioré */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Brain className="w-16 h-16 text-blue-600" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Hub Intelligence Artificielle Avancé
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Centre de contrôle IA nouvelle génération • Tests en temps réel • Analytics prédictifs • Optimisation continue
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              Modèles actifs: 8
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Gauge className="w-4 h-4 mr-2" />
              Précision: {(metrics.accuracy * 100).toFixed(1)}%
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Latence: {metrics.latency.toFixed(0)}ms
            </Badge>
          </div>
        </div>

        {/* Contrôles globaux */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={isRealTime} 
                onCheckedChange={setIsRealTime}
                id="realtime"
              />
              <Label htmlFor="realtime" className="text-sm font-medium">
                Temps réel
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={advancedMode} 
                onCheckedChange={setAdvancedMode}
                id="advanced"
              />
              <Label htmlFor="advanced" className="text-sm font-medium">
                Mode expert
              </Label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neural-v3">Neural Engine v3.2</SelectItem>
                <SelectItem value="transformer-v2">Transformer v2.1</SelectItem>
                <SelectItem value="hybrid-v1">Hybrid Model v1.5</SelectItem>
                <SelectItem value="quantum-beta">Quantum Beta</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation par onglets étendue */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          const newUrl = `/ai-hub?tab=${value}`;
          window.history.pushState({}, '', newUrl);
        }} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 p-1 bg-white shadow-sm">
            <TabsTrigger value="playground" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Playground</span>
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Algorithmes</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="experiments" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span className="hidden sm:inline">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Playground Interactif */}
          <TabsContent value="playground" className="space-y-6">
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50">
                <CardTitle className="flex items-center text-2xl">
                  <Play className="w-8 h-8 mr-3 text-purple-600" />
                  Laboratoire IA Interactif
                </CardTitle>
                <CardDescription className="text-lg">
                  Testez et expérimentez avec nos modèles IA en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Paramètres d'entrée enrichis */}
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" className="text-base font-semibold">Titre du projet</Label>
                        <Input
                          id="title"
                          value={userInput.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Ex: Développement d'une application IA"
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="category" className="text-base font-semibold">Catégorie</Label>
                        <Select value={userInput.category} onValueChange={(v) => handleInputChange('category', v)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="développement web">🌐 Développement Web</SelectItem>
                            <SelectItem value="application mobile">📱 App Mobile</SelectItem>
                            <SelectItem value="intelligence artificielle">🤖 Intelligence Artificielle</SelectItem>
                            <SelectItem value="design">🎨 Design & UX</SelectItem>
                            <SelectItem value="marketing">📢 Marketing Digital</SelectItem>
                            <SelectItem value="blockchain">⛓️ Blockchain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="budget" className="text-base font-semibold">Budget (€)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={userInput.budget}
                          onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-base font-semibold">Complexité</Label>
                        <div className="mt-2">
                          <Slider
                            value={[userInput.complexity]}
                            onValueChange={([value]) => handleInputChange('complexity', value)}
                            max={10}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="text-center mt-1 text-sm text-gray-600">
                            {userInput.complexity}/10
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Urgence</Label>
                        <Select value={userInput.urgency} onValueChange={(v) => handleInputChange('urgency', v)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Normale</SelectItem>
                            <SelectItem value="medium">🟡 Modérée</SelectItem>
                            <SelectItem value="high">🔴 Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-base font-semibold">Description détaillée</Label>
                      <Textarea
                        id="description"
                        value={userInput.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Décrivez votre projet en détail..."
                        className="h-40 mt-2"
                      />
                    </div>

                    {advancedMode && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800">Paramètres avancés</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Compétences requises</Label>
                            <Input 
                              placeholder="React, Node.js, AI/ML..."
                              value={userInput.skills.join(', ')}
                              onChange={(e) => handleInputChange('skills', e.target.value.split(', '))}
                            />
                          </div>
                          <div>
                            <Label>Localisation</Label>
                            <Input 
                              placeholder="Paris, Remote..."
                              value={userInput.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Panneau de contrôle des tests */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-16" 
                        onClick={() => runAdvancedDemo('neural-pricing')}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && demoType === 'neural-pricing' ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Calcul...
                          </>
                        ) : (
                          <>
                            <Calculator className="w-5 h-5 mr-2" />
                            Prix Neural
                          </>
                        )}
                      </Button>

                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-16" 
                        onClick={() => runAdvancedDemo('semantic-analysis')}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && demoType === 'semantic-analysis' ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyse...
                          </>
                        ) : (
                          <>
                            <Target className="w-5 h-5 mr-2" />
                            Analyse Sémantique
                          </>
                        )}
                      </Button>

                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-16" 
                        onClick={() => runAdvancedDemo('smart-matching')}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && demoType === 'smart-matching' ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Matching...
                          </>
                        ) : (
                          <>
                            <Users className="w-5 h-5 mr-2" />
                            Smart Matching
                          </>
                        )}
                      </Button>

                      <Button 
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-16" 
                        onClick={() => runAdvancedDemo('predictive-analytics')}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && demoType === 'predictive-analytics' ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Prédiction...
                          </>
                        ) : (
                          <>
                            <LineChart className="w-5 h-5 mr-2" />
                            Analytics Prédictifs
                          </>
                        )}
                      </Button>
                    </div>

                    {advancedMode && (
                      <div className="grid grid-cols-1 gap-4">
                        <Button 
                          variant="outline"
                          className="h-12 border-2 border-indigo-300 hover:bg-indigo-50"
                          onClick={() => runAdvancedDemo('competitive-analysis')}
                          disabled={isAnalyzing}
                        >
                          <PieChart className="w-4 h-4 mr-2" />
                          Analyse Concurrentielle
                        </Button>
                      </div>
                    )}

                    {/* Résultats enrichis */}
                    {demoResults && (
                      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-lg">
                            <Award className="w-6 h-6 mr-2 text-green-600" />
                            Résultats IA - {selectedModel}
                            <Badge className="ml-3 bg-green-100 text-green-800">
                              Live • {new Date().toLocaleTimeString()}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                              <div className="text-3xl font-bold text-blue-600 mb-2">
                                {demoResults.score || demoResults.qualityScore || demoResults.success_probability * 100 || 87}
                                {demoResults.success_probability ? '%' : '/100'}
                              </div>
                              <div className="text-sm text-gray-600">Score Principal</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                              <div className="text-3xl font-bold text-green-600 mb-2">
                                {demoResults.confidence || 91}%
                              </div>
                              <div className="text-sm text-gray-600">Confiance</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                              <div className="text-3xl font-bold text-purple-600 mb-2">
                                {metrics.latency.toFixed(0)}ms
                              </div>
                              <div className="text-sm text-gray-600">Latence</div>
                            </div>
                          </div>
                          
                          {demoResults.suggestions && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-800 flex items-center">
                                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                                Recommandations IA
                              </h4>
                              <div className="space-y-2">
                                {demoResults.suggestions.map((suggestion, idx) => (
                                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{suggestion}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {demoResults.market_trends && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-800">Tendances Marché</h4>
                              <div className="flex flex-wrap gap-2">
                                {demoResults.market_trends.map((trend, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                                    {trend}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Algorithmes Avancés */}
          <TabsContent value="algorithms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Network className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-bold text-purple-900">Neural Matching</h3>
                      <Badge variant="outline" className="mt-2 bg-purple-100 text-purple-800">
                        97.2% précision
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Cpu className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-blue-900">Quantum Pricing</h3>
                      <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800">
                        +31% ROI
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Workflow className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-green-900">Predictive Engine</h3>
                      <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">
                        94% accuracy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-orange-600" />
                    <div>
                      <h3 className="font-bold text-orange-900">Security AI</h3>
                      <Badge variant="outline" className="mt-2 bg-orange-100 text-orange-800">
                        Anti-fraude 99.8%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="bid-analyzer" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bid-analyzer">🎯 Bid Analyzer Pro</TabsTrigger>
                <TabsTrigger value="matching-engine">🤝 Neural Matching</TabsTrigger>
                <TabsTrigger value="revenue-predictor">💰 Revenue AI Plus</TabsTrigger>
              </TabsList>

              <TabsContent value="bid-analyzer">
                <SmartBidAnalyzer
                  missionTitle={mockAdvancedData.testMission.title}
                  missionDescription={mockAdvancedData.testMission.description}
                  missionBudget={mockAdvancedData.testMission.budget}
                  missionCategory={mockAdvancedData.testMission.category}
                  currentBid={{
                    price: 22800,
                    timeline: 18,
                    proposal: "Expert en développement SaaS avec IA intégrée, 8+ ans d'expérience...",
                    providerExperience: 8,
                    similarProjects: 23,
                    proposedTech: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'AI/ML']
                  }}
                  providerProfile={mockAdvancedData.testProviderProfile}
                  competitorBids={[]}
                />
              </TabsContent>

              <TabsContent value="matching-engine">
                <MissionMatchingEngine
                  provider={{
                    id: "premium-provider",
                    name: "Sophie Martin - Expert IA",
                    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'TensorFlow', 'AWS'],
                    location: 'Paris',
                    rating: 4.9,
                    completedProjects: 89,
                    hourlyRate: 125
                  }}
                  missions={[
                    {
                      id: "premium-mission",
                      title: "Plateforme SaaS avec IA générative intégrée",
                      description: "Développement complet d'une solution SaaS révolutionnaire",
                      budget: 35000,
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
                  currentRevenue={280000}
                  historicalData={[
                    { month: "Jan", revenue: 220000, growth: 18 },
                    { month: "Fév", revenue: 245000, growth: 22 },
                    { month: "Mar", revenue: 265000, growth: 26 },
                    { month: "Avr", revenue: 280000, growth: 24 }
                  ]}
                  marketTrends={{
                    webDev: { demand: 95, avgBudget: 8500 },
                    mobile: { demand: 92, avgBudget: 12500 },
                    ai: { demand: 98, avgBudget: 18900 }
                  }}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Onglet Analytics Avancés */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Requêtes/heure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.throughput.toFixed(0)}</div>
                  <Progress value={85} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Précision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(metrics.accuracy * 100).toFixed(1)}%</div>
                  <Progress value={metrics.accuracy * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Latence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.latency.toFixed(0)}ms</div>
                  <Progress value={100 - metrics.latency} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Taux d'erreur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(metrics.errorRate * 100).toFixed(2)}%</div>
                  <Progress value={100 - (metrics.errorRate * 100)} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="w-5 h-5 mr-2" />
                    Performance en Temps Réel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                      <p className="text-gray-600">Graphique de performance en temps réel</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        {isRealTime ? 'Live' : 'Pausé'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Distribution des Modèles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Neural v3.2</span>
                      <span className="text-sm font-semibold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transformer v2.1</span>
                      <span className="text-sm font-semibold">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hybrid v1.5</span>
                      <span className="text-sm font-semibold">18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quantum Beta</span>
                      <span className="text-sm font-semibold">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Expérimentations */}
          <TabsContent value="experiments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Centre d'Expérimentation IA</h2>
              <div className="flex gap-2">
                <Button onClick={() => startExperiment('A/B Pricing')}>
                  <Rocket className="w-4 h-4 mr-2" />
                  Nouveau Test
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {experiments.map((exp) => (
                <Card key={exp.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Rocket className="w-5 h-5 mr-2" />
                        {exp.name}
                      </CardTitle>
                      <Badge className={
                        exp.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        exp.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {exp.status}
                      </Badge>
                    </div>
                    <CardDescription>{exp.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Progression</span>
                        <span className="text-sm font-medium">{exp.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={exp.progress} />
                      {exp.results && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-green-800">
                            Amélioration: {exp.results.improvement}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Insights IA Temps Réel</h2>
              <Badge className="bg-purple-100 text-purple-800">
                {insights.length} insights actifs
              </Badge>
            </div>

            <div className="grid gap-4">
              {insights.map((insight, idx) => (
                <Card key={idx} className={`border-l-4 ${
                  insight.type === 'success' ? 'border-l-green-500 bg-green-50' :
                  insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                  insight.type === 'error' ? 'border-l-red-500 bg-red-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confiance
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {insight.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Monitoring Système</h2>
              <div className="flex items-center gap-2">
                <Badge className={isRealTime ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {isRealTime ? 'Temps réel actif' : 'Mode statique'}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsRealTime(!isRealTime)}
                >
                  {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                    Santé Système
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU</span>
                      <span className="text-sm font-semibold">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mémoire</span>
                      <span className="text-sm font-semibold">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Réseau</span>
                      <span className="text-sm font-semibold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                    Modèles Actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Neural v3.2', 'Transformer v2.1', 'Hybrid v1.5', 'Quantum Beta'].map((model, idx) => (
                      <div key={model} className="flex items-center justify-between">
                        <span className="text-sm">{model}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${idx < 3 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className="text-xs text-gray-500">
                            {idx < 3 ? 'Actif' : 'Beta'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    Alertes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">Latence élevée</span>
                      <Badge variant="outline" className="text-xs">Warning</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">Système optimal</span>
                      <Badge variant="outline" className="text-xs">OK</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Documentation Enrichie */}
          <TabsContent value="docs" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Centre de Documentation IA</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Guides complets, API documentation, et bonnes pratiques pour maîtriser nos outils IA
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Rocket className="w-6 h-6" />
                    Guide Démarrage
                  </CardTitle>
                  <CardDescription>
                    Premiers pas avec notre plateforme IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Configuration initiale
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Premiers tests
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Intégration API
                    </li>
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Lire le guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Code className="w-6 h-6" />
                    API Reference
                  </CardTitle>
                  <CardDescription>
                    Documentation complète des endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Authentification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Endpoints principaux
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Exemples de code
                    </li>
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir l'API
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Award className="w-6 h-6" />
                    Bonnes Pratiques
                  </CardTitle>
                  <CardDescription>
                    Optimisation et performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Optimisation requêtes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Gestion d'erreurs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Monitoring
                    </li>
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Découvrir
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
                  💡 Conseils d'Expert
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-blue-900">Optimisation Performance</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span>Utilisez la mise en cache pour les requêtes fréquentes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span>Adaptez la complexité selon vos besoins</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span>Surveillez les métriques en temps réel</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-purple-900">Intégration Avancée</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span>Combinez plusieurs modèles pour plus de précision</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span>Implémentez un fallback robuste</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span>Testez régulièrement avec vos données</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer avec feedback */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-gray-800">Votre avis nous intéresse</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Utile
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Améliorer
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Feedback
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
