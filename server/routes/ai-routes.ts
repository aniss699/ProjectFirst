import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Schema de validation pour les suggestions de prix
const priceSuggestionSchema = z.object({
  title: z.string().min(5, 'Titre trop court'),
  description: z.string().min(10, 'Description trop courte'),
  category: z.string().min(1, 'Catégorie requise')
});

// Schema de validation pour l'amélioration de description
const enhanceDescriptionSchema = z.object({
  description: z.string().min(5, 'Description trop courte'),
  category: z.string().min(1, 'Catégorie requise'),
  additionalInfo: z.string().optional()
});

// Schema de validation pour l'analyse de qualité
const analyzeQualitySchema = z.object({
  description: z.string().min(5, 'Description trop courte')
});

// Schema de validation pour l'amélioration de texte
const enhanceTextSchema = z.object({
  text: z.string().min(1, 'Texte requis'),
  fieldType: z.enum(['title', 'description', 'requirements']),
  category: z.string().optional()
});

/**
 * POST /api/ai/suggest-pricing
 * Suggère des prix pour un projet basé sur l'analyse IA du marché
 */
router.post('/suggest-pricing', async (req: Request, res: Response) => {
  try {
    const { title, description, category } = priceSuggestionSchema.parse(req.body);

    const { AIEnhancementService } = await import('../services/ai-enhancement.js');
    const aiEnhancementService = new AIEnhancementService();

    const priceSuggestion = await aiEnhancementService.suggestPricing(
      title,
      description,
      category
    );

    res.json({
      success: true,
      data: priceSuggestion,
      message: 'Suggestion de prix générée avec succès'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }

    console.error('Erreur suggestion prix:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération de la suggestion de prix'
    });
  }
});

/**
 * POST /api/ai/enhance-description
 * Améliore une description vague de projet en description détaillée
 */
router.post('/enhance-description', async (req: Request, res: Response) => {
  try {
    const { description, category, additionalInfo } = enhanceDescriptionSchema.parse(req.body);

    const { AIEnhancementService } = await import('../services/ai-enhancement.js');
    const aiEnhancementService = new AIEnhancementService();

    const enhancedDescription = await aiEnhancementService.enhanceProjectDescription(
      description,
      category,
      additionalInfo
    );

    res.json({
      success: true,
      data: enhancedDescription,
      message: 'Description améliorée avec succès'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }

    console.error('Erreur amélioration description:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'amélioration de la description'
    });
  }
});

/**
 * POST /api/ai/analyze-quality
 * Analyse la qualité d'une description et suggère des améliorations
 */
router.post('/analyze-quality', async (req: Request, res: Response) => {
  try {
    const { description } = analyzeQualitySchema.parse(req.body);

    const { AIEnhancementService } = await import('../services/ai-enhancement.js');
    const aiEnhancementService = new AIEnhancementService();

    const qualityAnalysis = await aiEnhancementService.analyzeDescriptionQuality(description);

    res.json({
      success: true,
      data: qualityAnalysis,
      message: 'Analyse de qualité effectuée avec succès'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }

    console.error('Erreur analyse qualité:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse de qualité'
    });
  }
});

/**
 * POST /api/ai/enhance-text
 * Améliore un texte via Gemini API
 */
router.post('/enhance-text', async (req: Request, res: Response) => {
  try {
    const { text, fieldType, category } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn('❌ Texte vide ou invalide reçu');
      return res.status(400).json({
        success: false,
        error: 'Texte requis et non vide'
      });
    }

    if (!fieldType || !['title', 'description', 'requirements'].includes(fieldType)) {
      console.warn('❌ Type de champ invalide:', fieldType);
      return res.status(400).json({
        success: false,
        error: 'Type de champ invalide. Attendu: title, description ou requirements'
      });
    }

    console.log(`🎯 Amélioration ${fieldType} demandée pour:`, text.substring(0, 100) + '...');

    const { AIEnhancementService } = await import('../services/ai-enhancement.js');
    const aiEnhancementService = new AIEnhancementService();

    const enhancedText = await aiEnhancementService.enhanceText(text, fieldType, category);

    console.log('✅ Amélioration terminée avec succès');

    res.json({
      success: true,
      data: {
        originalText: text,
        enhancedText,
        fieldType,
        category: category || 'non-spécifiée',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur amélioration texte:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'amélioration du texte',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/ai/health
 * Vérifie l'état des services IA - GEMINI UNIQUEMENT
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    const geminiConfigured = !!geminiApiKey;

    const status = geminiConfigured ? 'gemini_api_ready' : 'gemini_api_configuration_incomplete';

    res.json({
      success: true,
      data: {
        ai_provider: 'gemini-api-only',
        gemini_ready: geminiConfigured,
        api_key: geminiApiKey ? '✅ Configuré' : '❌ MANQUANT',
        services_available: geminiConfigured ? [
          'gemini_text_enhancement',
          'gemini_price_suggestions',
          'gemini_description_enhancement',
          'gemini_quality_analysis',
          'gemini_semantic_analysis'
        ] : [],
        status: status,
        configuration_required: !geminiConfigured ? ['GEMINI_API_KEY'] : [],
        mode: 'production_gemini_api'
      }
    });

  } catch (error) {
    console.error('Erreur vérification santé IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification'
    });
  }
});

/**
 * GET /api/ai/test-config
 * Test rapide de la configuration Gemini API
 */
router.get('/test-config', async (req: Request, res: Response) => {
  try {
    // Dynamically import the Gemini adapter
    const geminiAdapter = await import('../../apps/api/src/ai/adapters/geminiAdapter.js');
    const geminiCall = geminiAdapter.geminiCall;

    // Test the Gemini API call
    const testResponse = await geminiCall('text_enhance', {
      prompt: 'Dites simplement "Configuration Gemini OK"'
    });

    res.json({
      success: true,
      data: {
        test_result: 'success',
        response: testResponse.output,
        latency_ms: testResponse.quality?.latency_ms,
        provider: testResponse.meta?.provider
      }
    });

  } catch (error) {
    console.error('❌ Test configuration échoué:', error);
    res.status(500).json({
      success: false,
      error: 'Test de configuration échoué',
      details: error.message
    });
  }
});


// Endpoint agrégateur attendu par le client : POST /api/ai/analyze
router.post('/analyze', async (req: Request, res: Response) => {
  const { title = '', description = '', category = 'autre' } = req.body ?? {};
  if (typeof description !== 'string' || description.trim().length < 5) {
    return res.status(400).json({ error: 'Description trop courte' });
  }
  try {
    const { AIEnhancementService } = await import('../services/ai-enhancement.js');
    const aiEnhancementService = new AIEnhancementService();

    const quality = await aiEnhancementService.analyzeDescriptionQuality(description);
    const pricing = await aiEnhancementService.suggestPricing(title, description, category);
    res.json({ quality, pricing });
  } catch (e) {
    console.error('AI /analyze error:', e);
    res.status(500).json({ error: 'Erreur analyse IA' });
  }
});

export default router;