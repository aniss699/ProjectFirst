
/**
 * Service de validation de la cohérence des données
 * Vérifie que les données restent cohérentes à travers toutes les étapes
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DataConsistencyValidator {
  
  /**
   * Valide la cohérence Frontend → API
   */
  static validateFrontendToAPI(frontendData: any, apiData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier les champs obligatoires
    if (frontendData.title !== apiData.title) {
      errors.push('Title mismatch between frontend and API');
    }

    if (frontendData.description !== apiData.description) {
      errors.push('Description mismatch between frontend and API');
    }

    // Vérifier le budget
    if (frontendData.budget && apiData.budget_value_cents) {
      const expectedCents = parseInt(frontendData.budget);
      if (expectedCents !== apiData.budget_value_cents) {
        errors.push(`Budget mismatch: expected ${expectedCents}, got ${apiData.budget_value_cents}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valide la cohérence API → Database
   */
  static validateAPIToDatabase(apiData: any, dbData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier l'ID utilisateur
    if (apiData.user_id !== dbData.user_id) {
      errors.push('User ID mismatch between API and database');
    }

    // Vérifier la cohérence client_id = user_id
    if (dbData.user_id && dbData.client_id && dbData.user_id !== dbData.client_id) {
      warnings.push('user_id and client_id should be the same for new missions');
    }

    // Vérifier les timestamps
    if (!dbData.created_at || !dbData.updated_at) {
      errors.push('Missing timestamps in database');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valide la cohérence Database → Feed
   */
  static validateDatabaseToFeed(dbData: any, feedData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier l'ID
    if (dbData.id.toString() !== feedData.id) {
      errors.push('ID mismatch between database and feed');
    }

    // Vérifier le titre
    if (dbData.title !== feedData.title) {
      errors.push('Title mismatch between database and feed');
    }

    // Vérifier la catégorie par défaut
    const expectedCategory = dbData.category || 'developpement';
    if (expectedCategory !== feedData.category) {
      warnings.push(`Category inconsistency: DB has '${dbData.category}', feed has '${feedData.category}'`);
    }

    // Vérifier le clientId
    const expectedClientId = dbData.user_id?.toString() || '1';
    if (expectedClientId !== feedData.clientId) {
      errors.push('Client ID mismatch between database and feed');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validation complète end-to-end
   */
  static validateFullPipeline(
    frontendData: any, 
    apiData: any, 
    dbData: any, 
    feedData: any
  ): ValidationResult {
    const results = [
      this.validateFrontendToAPI(frontendData, apiData),
      this.validateAPIToDatabase(apiData, dbData),
      this.validateDatabaseToFeed(dbData, feedData)
    ];

    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

/**
 * Middleware pour validation automatique
 */
export function useDataConsistencyValidation() {
  return {
    validateCreation: (data: any) => {
      // Log des incohérences détectées
      console.log('🔍 Validation cohérence données:', data);
      return DataConsistencyValidator.validateFullPipeline(
        data.frontend,
        data.api,
        data.database,
        data.feed
      );
    }
  };
}
