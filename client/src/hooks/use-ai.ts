
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService, type BriefAnalysisResponse } from '@/services/aiService';

// Hook pour l'analyse IA avec cache
export const useAIAnalysis = (data: { title: string; description: string; category?: string }) => {
  return useQuery<BriefAnalysisResponse>({
    queryKey: ['ai-analysis', data],
    queryFn: () => aiService.analyzeWithAI(data),
    enabled: !!(data.title && data.description && data.description.length > 10),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (changed from deprecated cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook pour l'optimisation de brief
export const useBriefOptimization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: aiService.optimizeBrief,
    onSuccess: (data, variables) => {
      // Mettre à jour le cache
      queryClient.setQueryData(['brief-optimization', variables], data);
    },
  });
};

// Hook pour les insights marché
export const useMarketInsights = (category: string) => {
  return useQuery({
    queryKey: ['market-insights', category],
    queryFn: () => aiService.getMarketInsights(category),
    enabled: !!category,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook pour les suggestions de missions
export const useMissionSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const generateSuggestions = useCallback(async (keywords: string[]) => {
    setIsLoading(true);
    try {
      const result = await aiService.generateMissionSuggestions(keywords);
      setSuggestions(result);
    } catch (error) {
      console.error('Erreur génération suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    suggestions,
    isLoading,
    generateSuggestions,
  };
};

// Hook utilitaire pour les stats AI
export const useAIStats = () => {
  const queryClient = useQueryClient();

  const clearAICache = useCallback(() => {
    // Clear toutes les queries AI
    queryClient.invalidateQueries({ queryKey: ['ai-analysis'] });
    queryClient.invalidateQueries({ queryKey: ['market-insights'] });
    queryClient.invalidateQueries({ queryKey: ['brief-optimization'] });
    
    // Clear le cache du service
    aiService.clearCache();
  }, [queryClient]);

  const getCacheStats = useCallback(() => {
    return aiService.getCacheStats();
  }, []);

  return {
    clearAICache,
    getCacheStats,
  };
};
