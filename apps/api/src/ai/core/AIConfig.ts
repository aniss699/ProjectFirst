/**
 * Configuration centralisée pour tous les services AI
 * Point unique de configuration pour éliminer la duplication
 */

export interface AIProviderConfig {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  retries?: number;
}

export interface CacheConfig {
  defaultTtl: number;
  maxSize: number;
  adaptiveTtl: boolean;
  cleanupInterval: number;
}

export interface FallbackConfig {
  enabled: boolean;
  maxRetries: number;
  backoffMultiplier: number;
  circuitBreakerThreshold: number;
}

export class AIConfig {
  private static instance: AIConfig;
  
  readonly gemini: AIProviderConfig;
  readonly cache: CacheConfig;
  readonly fallback: FallbackConfig;
  readonly offlineMode: boolean;
  readonly mlApiUrl: string;

  private constructor() {
    // Configuration Gemini - Graceful degradation without API key
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    this.gemini = {
      enabled: hasGeminiKey,
      apiKey: hasGeminiKey ? process.env.GEMINI_API_KEY : undefined,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      timeout: parseInt(process.env.GEMINI_TIMEOUT || '30000'),
      retries: parseInt(process.env.GEMINI_RETRIES || '3')
    };

    // Log Gemini configuration status
    if (!hasGeminiKey) {
      console.log('⚠️  Gemini API disabled: GEMINI_API_KEY not found - using fallback mode');
    } else {
      console.log('✅ Gemini API enabled and configured');
    }

    // Configuration Cache
    this.cache = {
      defaultTtl: parseInt(process.env.AI_CACHE_TTL || '300000'), // 5 minutes
      maxSize: parseInt(process.env.AI_CACHE_SIZE || '1000'),
      adaptiveTtl: process.env.AI_ADAPTIVE_TTL !== 'false',
      cleanupInterval: parseInt(process.env.AI_CACHE_CLEANUP || '3600000') // 1 heure
    };

    // Configuration Fallback
    this.fallback = {
      enabled: process.env.AI_FALLBACK_ENABLED !== 'false',
      maxRetries: parseInt(process.env.AI_FALLBACK_RETRIES || '2'),
      backoffMultiplier: parseFloat(process.env.AI_BACKOFF_MULTIPLIER || '1.5'),
      circuitBreakerThreshold: parseInt(process.env.AI_CIRCUIT_BREAKER_THRESHOLD || '5')
    };

    // Configuration générale
    this.offlineMode = process.env.OFFLINE_MODE === 'true';
    this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:8001';
  }

  public static getInstance(): AIConfig {
    if (!AIConfig.instance) {
      AIConfig.instance = new AIConfig();
    }
    return AIConfig.instance;
  }

  /**
   * Valide la configuration au démarrage
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation Gemini
    if (this.gemini.enabled && !this.gemini.apiKey) {
      errors.push('GEMINI_API_KEY is required when Gemini is enabled');
    }

    // Validation Cache
    if (this.cache.defaultTtl < 1000) {
      errors.push('AI_CACHE_TTL must be at least 1000ms');
    }

    if (this.cache.maxSize < 10) {
      errors.push('AI_CACHE_SIZE must be at least 10');
    }

    // Validation Fallback
    if (this.fallback.maxRetries < 0) {
      errors.push('AI_FALLBACK_RETRIES must be non-negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcule TTL adaptatif basé sur le type de données
   */
  getAdaptiveTtl(key: string, data?: any): number {
    if (!this.cache.adaptiveTtl) {
      return this.cache.defaultTtl;
    }

    // TTL court pour données volatiles
    if (key.includes('market') || key.includes('price')) {
      return 60000; // 1 minute
    }
    
    // TTL moyen pour scores
    if (key.includes('score') || key.includes('analysis')) {
      return 300000; // 5 minutes
    }
    
    // TTL long pour données stables
    if (key.includes('profile') || key.includes('trust')) {
      return 1800000; // 30 minutes
    }
    
    // TTL adaptatif selon la qualité des données
    if (data?.confidence && data.confidence > 90) {
      return 600000; // 10 minutes pour données fiables
    }
    
    return this.cache.defaultTtl;
  }

  /**
   * Configuration pour logging et monitoring
   */
  getLoggingConfig() {
    return {
      level: process.env.AI_LOG_LEVEL || 'info',
      enableMetrics: process.env.AI_METRICS_ENABLED !== 'false',
      enableTracing: process.env.AI_TRACING_ENABLED === 'true'
    };
  }
}

export const aiConfig = AIConfig.getInstance();