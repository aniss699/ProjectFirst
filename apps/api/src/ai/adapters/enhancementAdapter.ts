
/**
 * Adaptateur pour les services d'enrichissement IA
 * Permet d'utiliser les nouveaux services sans casser l'API existante
 */

interface EnhancementConfig {
  enableNormalize: boolean;
  enableGenerator: boolean;
  enableQuestioner: boolean;
  enablePricer: boolean;
}

class AIEnhancementAdapter {
  private config: EnhancementConfig;
  
  constructor() {
    this.config = {
      enableNormalize: process.env.ENABLE_NORMALIZE === 'true',
      enableGenerator: process.env.ENABLE_GENERATOR === 'true',
      enableQuestioner: process.env.ENABLE_QUESTIONER === 'true',
      enablePricer: process.env.ENABLE_PRICER === 'true'
    };
  }

  /**
   * Enrichit un brief via les nouveaux services IA
   */
  async enhanceBrief(briefData: {
    title: string;
    description: string;
    category?: string;
  }) {
    const enhancements: any = {
      original: briefData,
      normalized: null,
      variants: null,
      questions: null,
      pricing: null
    };

    try {
      // Normalisation si activée
      if (this.config.enableNormalize) {
        const normalizeResponse = await fetch('http://localhost:8001/normalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(briefData),
          signal: AbortSignal.timeout(3000)
        });
        
        if (normalizeResponse.ok) {
          enhancements.normalized = await normalizeResponse.json();
        }
      }

      // Génération de variantes si activée
      if (this.config.enableGenerator) {
        const generatorResponse = await fetch('http://localhost:8001/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(briefData),
          signal: AbortSignal.timeout(5000)
        });
        
        if (generatorResponse.ok) {
          enhancements.variants = await generatorResponse.json();
        }
      }

      // Questions adaptatives si activées
      if (this.config.enableQuestioner) {
        const questionResponse = await fetch('http://localhost:8001/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brief: briefData,
            answers: {}
          }),
          signal: AbortSignal.timeout(2000)
        });
        
        if (questionResponse.ok) {
          enhancements.questions = await questionResponse.json();
        }
      }

    } catch (error) {
      console.warn('AI enhancement services unavailable:', error);
      // Continue sans les enrichissements
    }

    return enhancements;
  }

  /**
   * Fallback vers l'ancien système si services indisponibles
   */
  private async fallbackToLegacy(briefData: any) {
    // Utilise la logique existante dans aiService.ts
    return {
      normalized: {
        completeness_score: Math.min(briefData.description?.length * 2 || 0, 100),
        missing_info: briefData.description?.length < 50 ? ['Description plus détaillée'] : []
      },
      variants: null,
      questions: [],
      pricing: null
    };
  }

  /**
   * Vérifie quels services sont disponibles
   */
  async healthCheck() {
    const health = {
      normalize: false,
      generator: false,
      questioner: false,
      pricer: false
    };

    try {
      const response = await fetch('http://localhost:8001/health', {
        signal: AbortSignal.timeout(1000)
      });
      
      if (response.ok) {
        const data = await response.json();
        health.normalize = data.services?.text_normalizer === 'ready';
        health.generator = data.services?.template_rewriter === 'ready';
        health.questioner = data.services?.brief_quality_analyzer === 'ready';
        health.pricer = data.services?.price_time_suggester === 'ready';
      }
    } catch (error) {
      console.warn('ML services health check failed:', error);
    }

    return health;
  }
}

export const aiEnhancementAdapter = new AIEnhancementAdapter();
export type { EnhancementConfig };
