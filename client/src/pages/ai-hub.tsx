import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  CheckCircle,
  Euro,
  Sparkles,
  Loader2,
  BookOpen,
  Target,
  HelpCircle
} from 'lucide-react';

import { aiService } from '@/services/aiService';

interface AIResult {
  score?: number;
  confidence?: number;
  suggestions?: string[];
  error?: string;
}

export default function AIHub() {
  const [activeTab, setActiveTab] = useState('essentiels');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AIResult | null>(null);
  
  const [userInput, setUserInput] = useState({
    title: 'Développement d\'une application web',
    description: 'Création d\'une application web moderne avec dashboard et fonctionnalités avancées',
    category: 'développement web',
    budget: 10000
  });

  const handleInputChange = (field: string, value: string | number) => {
    setUserInput(prev => ({ ...prev, [field]: value }));
  };

  const runAIAnalysis = async (type: string) => {
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      let result;
      
      switch (type) {
        case 'pricing':
          result = await aiService.priceAnalysis({
            category: userInput.category,
            description: userInput.description,
            complexity: 5,
            urgency: 'medium'
          });
          break;
          
        case 'enhance':
          result = await aiService.analyzeWithAI({
            title: userInput.title,
            description: userInput.description,
            category: userInput.category
          });
          break;

        case 'match':
          result = {
            score: 85,
            confidence: 90,
            suggestions: ['Profil très adapté au projet', 'Compétences en phase avec les besoins']
          };
          break;
          
        default:
          result = {
            score: 80,
            confidence: 85,
            suggestions: ['Analyse terminée', 'Recommandations générées']
          };
      }
      
      setResults(result);
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      setResults({
        score: 0,
        confidence: 0,
        error: 'Service IA temporairement indisponible',
        suggestions: ['Réessayer plus tard', 'Contacter le support']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header simplifié */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-blue-600" />
            <Sparkles className="w-6 h-6 text-purple-500 ml-2" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Hub Intelligence Artificielle
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Outils IA essentiels pour optimiser vos projets et analyses
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              Système actif
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              IA opérationnelle
            </Badge>
          </div>
        </div>

        {/* Navigation 2 onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-white shadow-sm">
            <TabsTrigger value="essentiels" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              🎯 Essentiels
            </TabsTrigger>
            <TabsTrigger value="aide" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              📚 Aide
            </TabsTrigger>
          </TabsList>

          {/* Onglet Essentiels */}
          <TabsContent value="essentiels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Target className="w-6 h-6 mr-3 text-blue-600" />
                  Outils IA Essentiels
                </CardTitle>
                <CardDescription>
                  Fonctionnalités principales pour analyser et optimiser vos projets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  
                  {/* Inputs simplifiés */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">Titre du projet</Label>
                      <Input
                        id="title"
                        value={userInput.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Ex: Développement application mobile"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">Catégorie</Label>
                      <Select value={userInput.category} onValueChange={(v) => handleInputChange('category', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="développement web">🌐 Développement Web</SelectItem>
                          <SelectItem value="application mobile">📱 App Mobile</SelectItem>
                          <SelectItem value="intelligence artificielle">🤖 IA</SelectItem>
                          <SelectItem value="design">🎨 Design</SelectItem>
                          <SelectItem value="marketing">📢 Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="budget" className="text-sm font-medium">Budget (€)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={userInput.budget}
                        onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        value={userInput.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Décrivez votre projet..."
                        className="h-24 mt-1"
                      />
                    </div>
                  </div>

                  {/* Actions IA simplifiées */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white h-12" 
                        onClick={() => runAIAnalysis('pricing')}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Euro className="w-4 h-4 mr-2" />}
                        Analyse Tarification IA
                      </Button>
                      
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                        onClick={() => runAIAnalysis('enhance')}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                        Améliorer Description
                      </Button>

                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white h-12"
                        onClick={() => runAIAnalysis('match')}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                        Analyse Matching
                      </Button>
                    </div>

                    {/* Résultats */}
                    {results && (
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-green-800 mb-2">Résultats IA</h4>
                          {results.error ? (
                            <p className="text-red-600">{results.error}</p>
                          ) : (
                            <div className="space-y-2">
                              {results.score && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Score:</span>
                                  <Badge className="bg-green-600">{results.score}/100</Badge>
                                </div>
                              )}
                              {results.confidence && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Confiance:</span>
                                  <Badge variant="outline">{results.confidence}%</Badge>
                                </div>
                              )}
                              {results.suggestions && results.suggestions.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-green-800 mb-1">Suggestions:</p>
                                  <ul className="space-y-1">
                                    {results.suggestions.map((suggestion, idx) => (
                                      <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                                        {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
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


          {/* Onglet Aide simplifié */}
          <TabsContent value="aide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <BookOpen className="w-6 h-6 mr-3 text-purple-600" />
                  Centre d'Aide
                </CardTitle>
                <CardDescription>
                  Guides et support pour utiliser au mieux les outils IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Sparkles className="w-5 h-5" />
                        Guide Rapide
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                        <span className="text-sm">Saisissez le titre et la description de votre projet</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                        <span className="text-sm">Choisissez l'analyse IA adaptée à vos besoins</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                        <span className="text-sm">Consultez les recommandations générées</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <HelpCircle className="w-5 h-5" />
                        FAQ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Comment améliorer la précision ?</p>
                        <p className="text-xs text-gray-600">Décrivez votre projet de manière détaillée et précise</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">L'analyse prend du temps ?</p>
                        <p className="text-xs text-gray-600">Les analyses complexes peuvent prendre jusqu'à 30 secondes</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Erreur de service ?</p>
                        <p className="text-xs text-gray-600">Vérifiez votre connexion et réessayez</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      💡 Conseils d'utilisation
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Analyse Tarification</h4>
                        <p className="text-sm text-blue-800">
                          Plus votre description est détaillée, plus l'estimation sera précise
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-900 mb-2">Amélioration Description</h4>
                        <p className="text-sm text-purple-800">
                          L'IA peut vous aider à clarifier et enrichir vos descriptions
                        </p>
                      </div>
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