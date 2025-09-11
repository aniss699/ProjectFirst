

import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

interface MissionCreateInput {
  title: string;
  description: string;
  category: string;
  budget?: string | number;
  location?: string;
  isTeamMode?: boolean;
  requirements?: string;
  urgency?: 'low' | 'medium' | 'high';
}

interface MissionResponse {
  ok: boolean;
  id?: string;
  error?: string;
  mission?: any;
}

export function useMissionCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const createMission = useCallback(async (data: MissionCreateInput): Promise<MissionResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérification d'authentification
      if (!user?.id) {
        const errorMsg = 'Vous devez être connecté pour créer une mission';
        setError(errorMsg);
        toast({
          title: "Erreur d'authentification",
          description: errorMsg,
          variant: "destructive"
        });
        return { ok: false, error: errorMsg };
      }

      // Validation côté client simplifiée
      if (!data.title?.trim() || data.title.trim().length < 3) {
        const errorMsg = 'Le titre doit contenir au moins 3 caractères';
        setError(errorMsg);
        return { ok: false, error: errorMsg };
      }

      if (!data.description?.trim() || data.description.trim().length < 10) {
        const errorMsg = 'La description doit contenir au moins 10 caractères';
        setError(errorMsg);
        return { ok: false, error: errorMsg };
      }

      // Préparer les données
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category || 'developpement',
        budget: data.budget || 1000,
        location: data.location || 'Remote',
        userId: user.id,
        isTeamMode: data.isTeamMode || false,
        requirements: data.requirements?.trim() || undefined
      };

      console.log('🚀 Creating mission:', payload.title);

      // Appel API simple
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const result = await response.json();

      if (!result.ok || !result.id) {
        throw new Error(result.error || 'Échec de la création');
      }

      // Feedback de succès
      toast({
        title: "Mission créée !",
        description: `"${result.title}" a été publiée avec succès`,
        variant: "default"
      });

      console.log('✅ Mission created successfully:', result.id);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Mission creation failed:', errorMessage);
      
      setError(errorMessage);
      toast({
        title: "Erreur de création",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { ok: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const createTeamProject = useCallback(async (data: MissionCreateInput): Promise<MissionResponse> => {
    return createMission({ ...data, isTeamMode: true });
  }, [createMission]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    createMission,
    createTeamProject,
    clearError
  };
}

