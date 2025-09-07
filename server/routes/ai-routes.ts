import { Router } from 'express';
import { aiEnhancementService } from '../services/ai-enhancement.js';
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
router.post('/suggest-pricing', async (req, res) => {
  try {
    const { title, description, category } = priceSuggestionSchema.parse(req.body);

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
router.post('/enhance-description', async (req, res) => {
  try {
    const { description, category, additionalInfo } = enhanceDescriptionSchema.parse(req.body);

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
router.post('/analyze-quality', async (req, res) => {
  try {
    const { description } = analyzeQualitySchema.parse(req.body);

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
 * Améliore n'importe quel texte selon son type
 */
router.post('/enhance-text', async (req, res) => {
  try {
    console.log('📨 Requête /enhance-text reçue:', req.body);

    const { text, fieldType, category } = req.body;

    // Validation des paramètres
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn('❌ Texte manquant ou invalide');
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
 * Vérifie l'état des services IA - VERTEX AI PRIORITÉ
 */
router.get('/health', async (req, res) => {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'europe-west1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    const vertexAIComplete = !!(projectId && credentialsJson);
    
    // VERTEX AI est maintenant obligatoire
    const status = vertexAIComplete ? 'vertex_ai_production_ready' : 'vertex_ai_configuration_incomplete';

    res.json({
      success: true,
      data: {
        ai_provider: 'vertex-ai-priority',
        vertex_ai_ready: vertexAIComplete,
        project_id: projectId ? `✅ ${projectId}` : '❌ MANQUANT',
        location: `✅ ${location}`,
        credentials_configured: credentialsJson ? '✅ Configuré' : '❌ MANQUANT',
        services_available: vertexAIComplete ? [
          'vertex_ai_text_enhancement',
          'vertex_ai_price_suggestions',
          'vertex_ai_description_enhancement',
          'vertex_ai_quality_analysis',
          'vertex_ai_semantic_analysis'
        ] : [],
        status: status,
        configuration_required: !vertexAIComplete ? [
          ...(projectId ? [] : ['GOOGLE_CLOUD_PROJECT_ID']),
          ...(credentialsJson ? [] : ['GOOGLE_APPLICATION_CREDENTIALS_JSON'])
        ] : [],
        mode: 'production_vertex_ai'
      }
    });

  } catch (error) {
    console.error('Erreur vérification santé IA:', error);
    res.status(500).json({
      success: falsee,
      error: 'Erreur lors de la vérification'
    });
  }
});

/**
 * GET /api/ai/test-config
 * Test rapide de la configuration Vertex AI
 */
router.get('/test-config', async (req, res) => {
  try {
    const { geminiCall } = await import('../../apps/api/src/ai/adapters/geminiAdapter.js');

    const testResponse = await geminiCall('text_enhance', { 
      prompt: 'Dites simplement "Test réussi" en JSON: {"message": "Test réussi"}' 
    });

    res.json({
      success: true,
      data: {
        provider: testResponse.meta.provider,
        model: testResponse.model_name,
        response: testResponse.output,
        message: 'Configuration AI fonctionnelle'
      }
    });

  } catch (error) {
    console.error('Test config échoué:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Configuration AI non fonctionnelle'
    });
  }
});

export default router;
// Endpoint agrégateur attendu par le client : POST /api/ai/analyze
router.post('/analyze', async (req, res) => {
  const { title = '', description = '', category = 'autre' } = req.body ?? {};
  if (typeof description !== 'string' || description.trim().length < 5) {
    return res.status(400).json({ error: 'Description trop courte' });
  }
  try {
    const quality = await aiEnhancementService.analyzeDescriptionQuality(description);
    const pricing = await aiEnhancementService.suggestPricing(title, description, category);
    res.json({ quality, pricing });
  } catch (e) {
    console.error('AI /analyze error:', e);
    res.status(500).json({ error: 'Erreur analyse IA' });
  }
});