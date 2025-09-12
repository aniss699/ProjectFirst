import { useState } from 'react';
import { useErrorService } from '@/lib/services/error-service';

/**
 * Hook centralisé pour gérer les états d'erreur/loading/success
 * Élimine la duplication de 15+ patterns useState identiques
 */
export interface ErrorHandlerState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export function useErrorHandler(initialState?: Partial<ErrorHandlerState>) {
  const [state, setState] = useState<ErrorHandlerState>({
    isLoading: false,
    error: null,
    success: null,
    ...initialState,
  });

  const { showError, showSuccess, parseError, logError } = useErrorService();

  // Définit l'état de loading
  const setLoading = (loading: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: loading,
      error: loading ? null : prev.error, // Clear error quand on commence loading
    }));
  };

  // Gère une erreur avec affichage toast automatique
  const handleError = (error: any, context?: string, showToast: boolean = true) => {
    const errorMessage = parseError(error);
    
    setState(prev => ({
      ...prev,
      error: errorMessage,
      success: null,
      isLoading: false,
    }));

    logError(error, context);
    
    if (showToast) {
      showError(error);
    }
  };

  // Gère un succès avec affichage toast automatique
  const handleSuccess = (message: string, showToast: boolean = true) => {
    setState(prev => ({
      ...prev,
      success: message,
      error: null,
      isLoading: false,
    }));

    if (showToast) {
      showSuccess(message);
    }
  };

  // Reset tous les états
  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      success: null,
    });
  };

  // Clear seulement l'erreur
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Clear seulement le succès
  const clearSuccess = () => {
    setState(prev => ({ ...prev, success: null }));
  };

  // Wrapper pour les opérations async avec gestion d'erreur automatique
  const wrapAsync = async <T>(
    operation: () => Promise<T>,
    {
      successMessage,
      errorContext,
      showSuccessToast = true,
      showErrorToast = true,
    }: {
      successMessage?: string;
      errorContext?: string;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
    } = {}
  ): Promise<T | null> => {
    setLoading(true);
    
    try {
      const result = await operation();
      
      if (successMessage) {
        handleSuccess(successMessage, showSuccessToast);
      } else {
        setLoading(false);
      }
      
      return result;
    } catch (error) {
      handleError(error, errorContext, showErrorToast);
      return null;
    }
  };

  return {
    // États
    ...state,
    
    // Actions
    setLoading,
    handleError,
    handleSuccess,
    reset,
    clearError,
    clearSuccess,
    wrapAsync,
    
    // Helpers
    hasError: !!state.error,
    hasSuccess: !!state.success,
    isIdle: !state.isLoading && !state.error && !state.success,
  };
}