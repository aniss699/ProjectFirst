import { useToast } from '@/hooks/use-toast';

/**
 * Service centralisé de gestion d'erreur
 * Élimine la duplication de 61+ appels toast dans l'app
 */
export class ErrorService {
  private static toast: any = null;

  // Initialise le service avec le hook toast
  static init(toastHook: any) {
    this.toast = toastHook;
  }

  // Messages d'erreur standardisés
  private static readonly ERROR_MESSAGES = {
    // Erreurs réseau
    NETWORK_ERROR: 'Problème de connexion. Vérifiez votre connexion Internet.',
    SERVER_ERROR: 'Erreur serveur. Veuillez réessayer dans quelques instants.',
    API_UNAVAILABLE: 'Service temporairement indisponible. Réessayez plus tard.',
    TIMEOUT: 'La requête a expiré. Veuillez réessayer.',
    
    // Erreurs d'authentification
    AUTH_REQUIRED: 'Vous devez être connecté pour effectuer cette action.',
    AUTH_FAILED: 'Email ou mot de passe incorrect.',
    AUTH_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
    
    // Erreurs de validation
    VALIDATION_FAILED: 'Veuillez vérifier les informations saisies.',
    REQUIRED_FIELDS: 'Veuillez remplir tous les champs obligatoires.',
    INVALID_EMAIL: 'Veuillez saisir une adresse email valide.',
    PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 6 caractères.',
    
    // Erreurs métier
    MISSION_CREATE_FAILED: 'Impossible de créer la mission. Veuillez réessayer.',
    BID_SUBMIT_FAILED: 'Impossible d\'envoyer votre offre. Veuillez réessayer.',
    PROFILE_UPDATE_FAILED: 'Impossible de mettre à jour votre profil.',
    FAVORITES_ERROR: 'Erreur lors de la gestion des favoris.',
    
    // Messages génériques
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
    OPERATION_FAILED: 'L\'opération a échoué. Veuillez réessayer.',
  };

  // Messages de succès standardisés
  private static readonly SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Connexion réussie ! Bienvenue sur Swideal.',
    REGISTER_SUCCESS: '🎉 Bienvenue sur Swideal ! Votre compte a été créé.',
    MISSION_CREATED: '✅ Mission créée avec succès !',
    BID_SUBMITTED: '🚀 Offre envoyée avec succès !',
    PROFILE_UPDATED: 'Profil mis à jour avec succès.',
    FAVORITE_ADDED: 'Ajouté aux favoris.',
    FAVORITE_REMOVED: 'Retiré des favoris.',
  };

  /**
   * Analyse une erreur et retourne un message standardisé
   */
  static parseError(error: any): string {
    // Si c'est déjà un message d'erreur string
    if (typeof error === 'string') {
      return error;
    }

    // Si c'est une erreur avec un message
    if (error?.message) {
      // Mapper certains messages courants à des messages plus user-friendly
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('fetch')) {
        return this.ERROR_MESSAGES.NETWORK_ERROR;
      }
      if (message.includes('401') || message.includes('unauthorized')) {
        return this.ERROR_MESSAGES.AUTH_FAILED;
      }
      if (message.includes('403') || message.includes('forbidden')) {
        return this.ERROR_MESSAGES.AUTH_REQUIRED;
      }
      if (message.includes('404')) {
        return 'Ressource non trouvée.';
      }
      if (message.includes('429')) {
        return 'Trop de requêtes. Veuillez patienter un moment.';
      }
      if (message.includes('500') || message.includes('server')) {
        return this.ERROR_MESSAGES.SERVER_ERROR;
      }
      if (message.includes('timeout')) {
        return this.ERROR_MESSAGES.TIMEOUT;
      }
      
      return error.message;
    }

    // Si c'est une Response avec un status
    if (error?.status) {
      switch (error.status) {
        case 401: return this.ERROR_MESSAGES.AUTH_FAILED;
        case 403: return this.ERROR_MESSAGES.AUTH_REQUIRED;
        case 404: return 'Ressource non trouvée.';
        case 429: return 'Trop de requêtes. Veuillez patienter.';
        case 500: return this.ERROR_MESSAGES.SERVER_ERROR;
        default: return this.ERROR_MESSAGES.SERVER_ERROR;
      }
    }

    return this.ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  /**
   * Affiche un toast d'erreur standardisé
   */
  static showError(error: any, customTitle?: string) {
    if (!this.toast) {
      console.error('ErrorService: Toast non initialisé', error);
      return;
    }

    const message = this.parseError(error);
    
    this.toast({
      title: customTitle || 'Erreur',
      description: message,
      variant: 'destructive',
    });
  }

  /**
   * Affiche un toast de succès standardisé
   */
  static showSuccess(messageKey: keyof typeof ErrorService.SUCCESS_MESSAGES | string, customTitle?: string) {
    if (!this.toast) {
      console.error('ErrorService: Toast non initialisé');
      return;
    }

    const message = this.SUCCESS_MESSAGES[messageKey as keyof typeof ErrorService.SUCCESS_MESSAGES] || messageKey;
    
    this.toast({
      title: customTitle || 'Succès',
      description: message,
    });
  }

  /**
   * Affiche une erreur de validation avec les champs manquants
   */
  static showValidationError(missingFields?: string[]) {
    if (!this.toast) return;

    const message = missingFields && missingFields.length > 0
      ? `Champs requis : ${missingFields.join(', ')}`
      : this.ERROR_MESSAGES.VALIDATION_FAILED;

    this.toast({
      title: 'Vérifiez vos informations',
      description: message,
      variant: 'destructive',
    });
  }

  /**
   * Log l'erreur pour debug en dev
   */
  static logError(error: any, context?: string) {
    console.error(`[ErrorService${context ? ' - ' + context : ''}]:`, error);
  }

  /**
   * Getter pour accéder aux messages standardisés
   */
  static get messages() {
    return {
      errors: this.ERROR_MESSAGES,
      success: this.SUCCESS_MESSAGES,
    };
  }
}

// Hook pour utiliser le service ErrorService dans les composants
export function useErrorService() {
  const { toast } = useToast();
  
  // Initialise le service avec le toast si pas déjà fait
  if (!ErrorService['toast']) {
    ErrorService.init(toast);
  }

  return {
    showError: (error: any, title?: string) => ErrorService.showError(error, title),
    showSuccess: (message: string, title?: string) => ErrorService.showSuccess(message, title),
    showValidationError: (fields?: string[]) => ErrorService.showValidationError(fields),
    parseError: (error: any) => ErrorService.parseError(error),
    logError: (error: any, context?: string) => ErrorService.logError(error, context),
    messages: ErrorService.messages,
  };
}