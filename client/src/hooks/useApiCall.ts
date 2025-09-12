import { useState } from 'react';
import { useMutation, useQueryClient, MutationOptions } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook centralisé pour tous les appels API avec gestion d'erreur
 * Élimine la duplication de 32+ patterns d'appels API identiques
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiCallConfig<TData = any, TVariables = any> {
  method: HttpMethod;
  endpoint: string;
  successMessage?: string;
  errorContext?: string;
  invalidateQueries?: (string | string[])[];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useApiCall<TData = any, TVariables = any>(
  config: ApiCallConfig<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const errorHandler = useErrorHandler();
  
  const mutation = useMutation({
    mutationFn: async (variables: TVariables) => {
      errorHandler.setLoading(true);
      
      try {
        const response = await apiRequest(config.method, config.endpoint, variables);
        const data = await response.json();
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async (data: TData, variables: TVariables) => {
      // Invalider les queries si spécifié
      if (config.invalidateQueries) {
        await Promise.all(
          config.invalidateQueries.map(queryKey =>
            queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] })
          )
        );
      }

      // Gérer le succès
      if (config.successMessage) {
        errorHandler.handleSuccess(config.successMessage, config.showSuccessToast);
      } else {
        errorHandler.setLoading(false);
      }

      // Callback personnalisé
      config.onSuccess?.(data, variables);
    },
    onError: (error: any, variables: TVariables) => {
      errorHandler.handleError(error, config.errorContext, config.showErrorToast);
      config.onError?.(error, variables);
    },
  });

  return {
    ...mutation,
    ...errorHandler,
    // Alias pour cohérence avec useMutation
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending || errorHandler.isLoading,
  };
}

/**
 * Hook simplifié pour les appels POST courants
 */
export function useCreateApi<TData = any, TVariables = any>(
  endpoint: string,
  options?: Partial<ApiCallConfig<TData, TVariables>>
) {
  return useApiCall<TData, TVariables>({
    method: 'POST',
    endpoint,
    ...options,
  });
}

/**
 * Hook simplifié pour les appels PUT/PATCH
 */
export function useUpdateApi<TData = any, TVariables = any>(
  endpoint: string,
  options?: Partial<ApiCallConfig<TData, TVariables>>
) {
  return useApiCall<TData, TVariables>({
    method: 'PUT',
    endpoint,
    ...options,
  });
}

/**
 * Hook simplifié pour les appels DELETE
 */
export function useDeleteApi<TData = any, TVariables = any>(
  endpoint: string,
  options?: Partial<ApiCallConfig<TData, TVariables>>
) {
  return useApiCall<TData, TVariables>({
    method: 'DELETE',
    endpoint,
    ...options,
  });
}

/**
 * Hook pour les appels fetch simples (non-mutation)
 * Utilisé pour remplacer les fetch() manuels
 */
export function useFetchCall() {
  const errorHandler = useErrorHandler();

  const fetchCall = async <T = any>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options: {
      successMessage?: string;
      errorContext?: string;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
      parseJson?: boolean; // Nouvelle option pour contrôler le parse JSON
    } = {}
  ): Promise<T | null> => {
    return errorHandler.wrapAsync(async () => {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorText;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Gestion intelligente du parsing JSON
      const shouldParseJson = options.parseJson !== false; // Par défaut true
      
      // Ne pas parser JSON pour les méthodes HEAD ou les réponses vides
      if (method === 'HEAD' || response.status === 204) {
        return null as T;
      }
      
      // Vérifier si la réponse a du contenu
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        return null as T;
      }
      
      // Si parseJson est désactivé, retourner la réponse directement
      if (!shouldParseJson) {
        return response as unknown as T;
      }

      // Parser JSON seulement si on a du contenu JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      // Fallback : essayer de parser, mais gérer les erreurs
      try {
        return await response.json();
      } catch (e) {
        // Si le parsing échoue, retourner null pour les succès
        console.warn(`[useFetchCall] Impossible de parser JSON pour ${method} ${endpoint}:`, e);
        return null as T;
      }
    }, options);
  };

  return {
    fetchCall,
    ...errorHandler,
  };
}