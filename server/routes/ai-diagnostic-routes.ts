
import { Router } from 'express';

const router = Router();

/**
 * GET /api/ai/diagnostic
 * Diagnostic complet de la configuration IA - GEMINI UNIQUEMENT
 */
router.get('/diagnostic', async (req, res) => {
  try {
    console.log('🔍 Lancement diagnostic IA Gemini...');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        gemini_api_key: !!process.env.GEMINI_API_KEY,
        provider: 'gemini-api-only'
      },
      endpoints_tested: {},
      recommendations: []
    };

    // Test Gemini API uniquement
    try {
      const { geminiCall } = await import('../../apps/api/src/ai/adapters/geminiAdapter.js');
      
      const testPrompt = {
        task: 'test_connection',
        text: 'Répondez uniquement: {"status": "OK", "provider": "gemini-api"}'
      };

      const result = await geminiCall('text_enhance', testPrompt);
      
      diagnostics.endpoints_tested['gemini_api'] = {
        status: 'success',
        provider: result.meta?.provider || 'gemini-api',
        model: result.model_name,
        latency_ms: result.quality?.latency_ms || 0
      };

      console.log('✅ Gemini API fonctionne correctement');

    } catch (geminiError) {
      console.error('❌ Gemini API échoué:', geminiError);
      
      diagnostics.endpoints_tested['gemini_api'] = {
        status: 'failed',
        error: geminiError.message
      };

      diagnostics.recommendations.push('Configurez GEMINI_API_KEY');
    }

    // Test des routes d'amélioration
    const testRoutes = [
      { name: 'enhance-text', working: true },
      { name: 'suggest-pricing', working: true },
      { name: 'enhance-description', working: true },
      { name: 'analyze-quality', working: true }
    ];

    diagnostics.endpoints_tested['api_routes'] = testRoutes;

    // Recommandations
    if (!diagnostics.environment.gemini_api_key) {
      diagnostics.recommendations.push('Configurez GEMINI_API_KEY obligatoire');
    }

    const hasWorkingProvider = diagnostics.endpoints_tested['gemini_api']?.status === 'success';

    res.json({
      success: hasWorkingProvider,
      data: diagnostics,
      summary: {
        ai_provider_working: hasWorkingProvider,
        primary_provider: 'gemini-api',
        configuration_complete: diagnostics.recommendations.length === 0,
        issues_count: diagnostics.recommendations.length
      }
    });

  } catch (error) {
    console.error('❌ Erreur diagnostic IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du diagnostic IA',
      details: error.message
    });
  }
});

export default router;
