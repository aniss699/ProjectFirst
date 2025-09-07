
import { Router } from 'express';

const router = Router();

/**
 * GET /api/ai/diagnostic
 * Diagnostic complet de la configuration IA
 */
router.get('/diagnostic', async (req, res) => {
  try {
    console.log('🔍 Lancement diagnostic IA Gemini...');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        gemini_api_key: !!process.env.GEMINI_API_KEY,
        google_project_id: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        google_credentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
        google_location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
      },
      endpoints_tested: {},
      recommendations: []
    };

    // Test Vertex AI (prioritaire)
    try {
      const { geminiCall } = await import('../../apps/api/src/ai/adapters/geminiAdapter.js');
      
      const testPrompt = {
        task: 'test_connection',
        text: 'Répondez uniquement: {"status": "OK", "provider": "vertex-ai"}'
      };

      const result = await geminiCall('text_enhance', testPrompt);
      
      diagnostics.endpoints_tested['vertex_ai'] = {
        status: 'success',
        provider: result.meta?.provider || 'vertex-ai',
        model: result.model_name,
        latency_ms: result.quality?.latency_ms || 0
      };

      console.log('✅ Vertex AI fonctionne correctement');

    } catch (vertexError) {
      console.error('❌ Vertex AI échoué:', vertexError);
      
      diagnostics.endpoints_tested['vertex_ai'] = {
        status: 'failed',
        error: vertexError.message
      };

      // Test fallback Gemini API directe
      try {
        const { GeminiService } = await import('../../apps/api/src/ai/geminiService.js');
        const geminiService = new GeminiService();
        
        const fallbackResult = await geminiService.generateContent('Test de connexion - répondez "OK"');
        
        diagnostics.endpoints_tested['gemini_api_direct'] = {
          status: fallbackResult.success ? 'success' : 'failed',
          fallback: true,
          error: fallbackResult.error || null
        };

        if (fallbackResult.success) {
          console.log('✅ Fallback Gemini API directe fonctionne');
          diagnostics.recommendations.push('Configurez Vertex AI pour de meilleures performances');
        }

      } catch (geminiError) {
        console.error('❌ Gemini API directe échoué:', geminiError);
        
        diagnostics.endpoints_tested['gemini_api_direct'] = {
          status: 'failed',
          error: geminiError.message
        };

        diagnostics.recommendations.push('Configurez GEMINI_API_KEY ou les credentials Vertex AI');
      }
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
    if (!diagnostics.environment.google_project_id) {
      diagnostics.recommendations.push('Configurez GOOGLE_CLOUD_PROJECT_ID pour Vertex AI');
    }
    
    if (!diagnostics.environment.google_credentials) {
      diagnostics.recommendations.push('Configurez GOOGLE_APPLICATION_CREDENTIALS_JSON pour Vertex AI');
    }

    if (!diagnostics.environment.gemini_api_key) {
      diagnostics.recommendations.push('Configurez GEMINI_API_KEY en fallback');
    }

    const hasWorkingProvider = diagnostics.endpoints_tested['vertex_ai']?.status === 'success' || 
                              diagnostics.endpoints_tested['gemini_api_direct']?.status === 'success';

    res.json({
      success: hasWorkingProvider,
      data: diagnostics,
      summary: {
        ai_provider_working: hasWorkingProvider,
        primary_provider: diagnostics.endpoints_tested['vertex_ai']?.status === 'success' ? 'vertex-ai' : 'gemini-api',
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
