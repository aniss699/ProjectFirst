
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Euro, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Zap,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useAIAnalysis, useBriefOptimization } from '@/hooks/use-ai';
import { useToast } from '@/hooks/use-toast';
import { AIFeedbackButtons } from './feedback-buttons';

interface BriefEnhancerProps {
  briefData: {
    title: string;
    description: string;
    category?: string;
  };
  onEnhancementComplete?: (enhancements: any) => void;
  compact?: boolean;
}

export function BriefEnhancer({ 
  briefData, 
  onEnhancementComplete,
  compact = false 
}: BriefEnhancerProps) {
  const [showOptimized, setShowOptimized] = useState(false);
  const { toast } = useToast();
  
  // Use optimized hooks
  const { 
    data: analysis, 
    isLoading: isAnalyzing,
    error: analysisError,
    refetch: refetchAnalysis 
  } = useAIAnalysis(briefData);
  
  const optimizationMutation = useBriefOptimization();

  // Memoized calculations
  const qualityColor = useMemo(() => {
    if (!analysis?.qualityScore) return 'bg-gray-500';
    const score = analysis.qualityScore;
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [analysis?.qualityScore]);

  const handleOptimize = useCallback(async () => {
    try {
      const optimization = await optimizationMutation.mutateAsync(briefData);
      setShowOptimized(true);
      onEnhancementComplete?.(optimization);
      
      toast({
        title: "✨ Brief optimisé !",
        description: "Votre annonce a été améliorée par l'IA"
      });
    } catch (error) {
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser le brief pour le moment",
        variant: "destructive"
      });
    }
  }, [briefData, optimizationMutation, onEnhancementComplete, toast]);

  const copyOptimizedText = useCallback(() => {
    if (optimizationMutation.data?.optimizedText) {
      navigator.clipboard.writeText(optimizationMutation.data.optimizedText);
      toast({
        title: "Texte copié",
        description: "Le texte optimisé a été copié dans le presse-papier"
      });
    }
  }, [optimizationMutation.data, toast]);

  const handleRefresh = useCallback(() => {
    refetchAnalysis();
  }, [refetchAnalysis]);

  // Loading state
  if (isAnalyzing) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-700 font-medium">Analyse IA en cours...</span>
          </div>
          <Progress value={undefined} className="mt-3 h-2" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (analysisError) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Analyse IA temporairement indisponible. 
          <Button variant="link" onClick={handleRefresh} className="p-0 ml-2 text-orange-600">
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Analyse principale */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="w-5 h-5" />
              Analyse IA
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white text-blue-700">
                Score: {analysis.qualityScore}/100
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress 
            value={analysis.qualityScore} 
            className="h-2"
            style={{ 
              background: `linear-gradient(to right, ${qualityColor} 0%, ${qualityColor} ${analysis.qualityScore}%, #e5e7eb ${analysis.qualityScore}%)` 
            }}
          />
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Métriques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {analysis.price_suggested_med && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <Euro className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-xs text-gray-500">Budget suggéré</div>
                  <div className="font-semibold">{analysis.price_suggested_med}€</div>
                </div>
              </div>
            )}
            
            {analysis.delay_suggested_days && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-500">Délai suggéré</div>
                  <div className="font-semibold">{analysis.delay_suggested_days}j</div>
                </div>
              </div>
            )}
            
            {analysis.detectedSkills?.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-500">Compétences</div>
                  <div className="font-semibold">{analysis.detectedSkills.length}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-xs text-gray-500">Complexité</div>
                <div className="font-semibold capitalize">{analysis.estimatedComplexity}</div>
              </div>
            </div>
          </div>

          {/* Améliorations suggérées */}
          {analysis.improvements?.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Améliorations suggérées
              </h4>
              <div className="space-y-1">
                {analysis.improvements.slice(0, compact ? 3 : 5).map((improvement: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-1 h-1 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span>{improvement}</span>
                  </div>
                ))}
              </div>
              <AIFeedbackButtons 
                phase="brief_enhance" 
                prompt={briefData}
                onFeedback={(accepted, rating, edits) => {
                  toast({ 
                    title: accepted ? "Merci pour votre retour positif !" : "Merci, nous allons améliorer nos suggestions" 
                  });
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button 
              onClick={handleOptimize} 
              disabled={optimizationMutation.isPending}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {optimizationMutation.isPending ? 'Optimisation...' : 'Optimiser avec IA'}
            </Button>
            
            {optimizationMutation.data && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyOptimizedText}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier le texte optimisé
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Texte optimisé */}
      {optimizationMutation.data && showOptimized && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Sparkles className="w-5 h-5" />
              Texte optimisé par IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border text-sm whitespace-pre-wrap">
              {optimizationMutation.data.optimizedText}
            </div>
            <AIFeedbackButtons 
              phase="brief_enhance" 
              prompt={{ ...briefData, optimized: optimizationMutation.data.optimizedText }}
              onFeedback={(accepted, rating, edits) => {
                toast({ 
                  title: accepted ? "Merci ! Cette amélioration sera marquée comme utile" : "Merci, nous allons améliorer cette fonctionnalité" 
                });
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
