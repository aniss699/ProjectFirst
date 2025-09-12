import { useState } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { useErrorService } from '@/lib/services/error-service';

/**
 * Hook centralisé pour la gestion d'erreur des formulaires
 * Élimine la duplication de 5+ patterns de soumission identiques
 * 
 * PATTERN CORRECT :
 * const submit = useFormSubmit({
 *   onSubmit: async (data) => { ... },
 *   successMessage: "Succès!",
 *   validateBeforeSubmit: (data) => [...] 
 * });
 * 
 * UTILISATION : submit.handleSubmit(formData)
 */
export interface FormSubmitOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: (data: T) => void;
  onError?: (error: any, data: T) => void;
  successMessage?: string;
  errorContext?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  validateBeforeSubmit?: (data: T) => string[] | null; // Retourne les champs manquants
}

export function useFormSubmit<T = any>(options: FormSubmitOptions<T>) {
  const errorHandler = useErrorHandler();
  const { showValidationError } = useErrorService();

  const handleSubmit = async (data: T) => {
    // Validation côté client si fournie
    if (options.validateBeforeSubmit) {
      const missingFields = options.validateBeforeSubmit(data);
      if (missingFields && missingFields.length > 0) {
        showValidationError(missingFields);
        return;
      }
    }

    errorHandler.setLoading(true);
    
    try {
      await options.onSubmit(data);
      
      if (options.successMessage) {
        errorHandler.handleSuccess(options.successMessage, options.showSuccessToast);
      } else {
        errorHandler.setLoading(false);
      }
      
      options.onSuccess?.(data);
    } catch (error) {
      errorHandler.handleError(error, options.errorContext, options.showErrorToast);
      options.onError?.(error, data);
    }
  };

  // Wrapper pour react-hook-form
  const createSubmitHandler = (form?: any) => (data: T) => {
    handleSubmit(data);
  };

  // Validation générique pour les champs requis
  const validateRequiredFields = (
    data: any,
    requiredFields: string[]
  ): string[] | null => {
    const missing = requiredFields.filter(field => {
      const value = data[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    return missing.length > 0 ? missing : null;
  };

  // Validation email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Validation mot de passe
  const validatePassword = (password: string, minLength: number = 6): boolean => {
    return password && password.length >= minLength;
  };

  return {
    ...errorHandler,
    handleSubmit,
    createSubmitHandler,
    
    // Helpers de validation
    validateRequiredFields,
    validateEmail,
    validatePassword,
    
    // États pour l'UI
    isSubmitting: errorHandler.isLoading,
    submitError: errorHandler.error,
    submitSuccess: errorHandler.success,
  };
}

// ============ HELPERS DE VALIDATION RÉUTILISABLES ============

/**
 * Validations prêtes à l'emploi pour éviter la duplication
 */
export const validationHelpers = {
  /**
   * Validation pour l'authentification (login/register)
   */
  validateAuth: (data: { email: string; password: string; name?: string }): string[] | null => {
    const missing = [];
    
    if (!data.email?.trim()) missing.push('Email');
    if (!data.password?.trim()) missing.push('Mot de passe');
    if (data.name !== undefined && !data.name?.trim()) missing.push('Nom');
    
    // Validation email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      missing.push('Email valide');
    }
    
    // Validation mot de passe
    if (data.password && data.password.length < 6) {
      missing.push('Mot de passe (6+ caractères)');
    }
    
    return missing.length > 0 ? missing : null;
  },

  /**
   * Validation pour les missions
   */
  validateMission: (data: { title: string; description: string; category: string; [key: string]: any }): string[] | null => {
    const missing = [];
    
    if (!data.title?.trim()) missing.push('Titre');
    if (!data.description?.trim()) missing.push('Description');
    if (!data.category?.trim()) missing.push('Catégorie');
    
    // Validation description minimum
    if (data.description && data.description.trim().length < 10) {
      missing.push('Description (10+ caractères)');
    }
    
    return missing.length > 0 ? missing : null;
  },

  /**
   * Validation pour les offres (bids)
   */
  validateBid: (data: { price: string | number; timeline: string; proposal: string; [key: string]: any }): string[] | null => {
    const missing = [];
    
    if (!data.price) missing.push('Prix');
    if (!data.timeline?.trim()) missing.push('Délai');
    if (!data.proposal?.trim()) missing.push('Proposition');
    
    // Validation prix
    if (data.price && (isNaN(Number(data.price)) || Number(data.price) <= 0)) {
      missing.push('Prix valide');
    }
    
    return missing.length > 0 ? missing : null;
  },
};