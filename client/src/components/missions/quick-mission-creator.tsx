
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { PlusCircle, Brain, Sparkles, CheckCircle, Euro, Users, Calendar, Target, TrendingUp, Wand2 } from 'lucide-react';

interface QuickMissionCreatorProps {
  className?: string;
  compact?: boolean;
  onSuccess?: () => void;
}

export function QuickMissionCreator({ className = '', compact = false, onSuccess }: QuickMissionCreatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: ''
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);

  // Auto-analyze description when user types
  useEffect(() => {
    if (formData.description.length > 30) {
      const timeoutId = setTimeout(() => {
        analyzeWithAI();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.description]);

  const analyzeWithAI = async () => {
    if (!formData.description || formData.description.length < 30) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/quick-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          title: formData.title
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setAiAnalysis(analysis);
      }
    } catch (error) {
      console.error('Erreur analyse IA:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour créer une mission',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title || !formData.description) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir au moins le titre et la description',
        variant: 'destructive',
      });
      return;
    }

    // Utiliser les données optimisées si disponibles
    const finalData = {
      title: formData.title,
      description: showOptimized && aiAnalysis?.optimizedDescription 
        ? aiAnalysis.optimizedDescription 
        : formData.description,
      budget: formData.budget || (aiAnalysis?.price_suggested_med ? aiAnalysis.price_suggested_med.toString() : '')
    };

    // Rediriger vers la page de création complète avec données pré-remplies
    const params = new URLSearchParams();
    if (finalData.title) params.set('title', finalData.title);
    if (finalData.description) params.set('description', finalData.description);
    if (finalData.budget) params.set('budget', finalData.budget);
    
    setLocation(`/create-mission?${params.toString()}`);
    
    if (onSuccess) onSuccess();
  };

  const applyOptimization = () => {
    if (aiAnalysis?.optimizedDescription) {
      setFormData(prev => ({
        ...prev,
        description: aiAnalysis.optimizedDescription,
        budget: aiAnalysis.price_suggested_med?.toString() || prev.budget
      }));
      setShowOptimized(false);
      toast({
        title: 'Optimisations appliquées !',
        description: 'Votre annonce a été améliorée par l\'IA'
      });
    }
  };

  if (compact) {
    return (
      <Card className={`border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nouvelle mission</h3>
                <p className="text-sm text-gray-600">Créer un projet avec l'IA</p>
              </div>
            </div>
            <Button onClick={handleSubmit} size="sm">
              <Brain className="w-4 h-4 mr-2" />
              Créer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Brain className="w-5 h-5" />
          Création de mission IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Titre de votre mission..."
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="bg-white border-blue-200"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Description</label>
            {isAnalyzing && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Analyse IA...
              </div>
            )}
          </div>
          <Textarea
            placeholder="Décrivez votre projet en détail..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="bg-white border-blue-200 min-h-[80px]"
          />
        </div>

        {/* Analyse IA en temps réel */}
        {aiAnalysis && (
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Analyse IA terminée
                </span>
                <Badge variant="outline" className="text-xs">
                  {aiAnalysis.brief_quality_score || aiAnalysis.qualityScore || 0}/100
                </Badge>
              </div>

              {/* Métriques principales */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {aiAnalysis.price_suggested_med && (
                  <div className="flex items-center bg-white/60 rounded-lg p-2">
                    <Euro className="w-3 h-3 mr-1 text-green-600" />
                    <div>
                      <div className="font-medium">{aiAnalysis.price_suggested_med}€</div>
                      <div className="text-gray-600">Prix suggéré</div>
                    </div>
                  </div>
                )}
                
                {aiAnalysis.delay_suggested_days && (
                  <div className="flex items-center bg-white/60 rounded-lg p-2">
                    <Calendar className="w-3 h-3 mr-1 text-blue-600" />
                    <div>
                      <div className="font-medium">{aiAnalysis.delay_suggested_days}j</div>
                      <div className="text-gray-600">Délai estimé</div>
                    </div>
                  </div>
                )}
                
                {aiAnalysis.market_insights?.estimated_providers_interested && (
                  <div className="flex items-center bg-white/60 rounded-lg p-2">
                    <Users className="w-3 h-3 mr-1 text-purple-600" />
                    <div>
                      <div className="font-medium">{aiAnalysis.market_insights.estimated_providers_interested}</div>
                      <div className="text-gray-600">Prestataires</div>
                    </div>
                  </div>
                )}
                
                {aiAnalysis.market_insights?.competition_level && (
                  <div className="flex items-center bg-white/60 rounded-lg p-2">
                    <Target className="w-3 h-3 mr-1 text-orange-600" />
                    <div>
                      <div className="font-medium capitalize">{aiAnalysis.market_insights.competition_level}</div>
                      <div className="text-gray-600">Concurrence</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {aiAnalysis.optimizedDescription && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOptimized(!showOptimized)}
                    className="text-xs bg-white/80"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    {showOptimized ? 'Masquer' : 'Voir'} optimisation
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyOptimization}
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Appliquer
                </Button>
              </div>

              {/* Version optimisée */}
              {showOptimized && aiAnalysis.optimizedDescription && (
                <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                  <div className="text-xs font-medium text-green-800 mb-2">✨ Version optimisée:</div>
                  <div className="text-xs text-gray-700 max-h-20 overflow-y-auto">
                    {aiAnalysis.optimizedDescription.substring(0, 200)}...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Budget (€)"
            value={formData.budget}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
            className="bg-white border-blue-200"
          />
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <PlusCircle className="w-4 h-4 mr-2" />
            Publier
            {aiAnalysis && (
              <Badge className="ml-2 bg-green-500 text-xs">IA ✓</Badge>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
