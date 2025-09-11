
import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { MissionService, type MissionCreateInput, type MissionResponse } from '../services/missionService';

interface UseMissionCreationReturn {
  isLoading: boolean;
  error: string | null;
  createMission: (data: MissionCreateInput) => Promise<MissionResponse>;
  createTeamProject: (data: MissionCreateInput) => Promise<MissionResponse>;
  clearError: () => void;
}

export function useMissionCreation(): UseMissionCreationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createMission = useCallback(async (data: MissionCreateInput): Promise<MissionResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier l'authentification
      if (!user?.id) {
        const errorResponse = {
          ok: false,
          error: 'Vous devez être connecté pour créer une mission'
        };
        setError(errorResponse.error);
        return errorResponse;
      }

      // Enrichir les données avec l'utilisateur
      const dataWithUser = {
        ...data,
        userId: user.id
      };

      console.log('🎯 useMissionCreation: Creating mission for user', user.id);
      
      const result = await MissionService.createMission(dataWithUser);

      if (!result.ok && result.error) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      return {
        ok: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createTeamProject = useCallback(async (data: MissionCreateInput): Promise<MissionResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        const errorResponse = {
          ok: false,
          error: 'Vous devez être connecté pour créer un projet d\'équipe'
        };
        setError(errorResponse.error);
        return errorResponse;
      }

      const dataWithUser = {
        ...data,
        userId: user.id,
        isTeamMode: true
      };

      console.log('👥 useMissionCreation: Creating team project for user', user.id);
      
      const result = await MissionService.createTeamProject(dataWithUser);

      if (!result.ok && result.error) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur création équipe';
      setError(errorMessage);
      
      return {
        ok: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
