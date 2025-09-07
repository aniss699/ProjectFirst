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
    const { text, fieldType, category } = enhanceTextSchema.parse(req.body);
    
    const enhancedText = await aiEnhancementService.enhanceText(text, fieldType, category);
    
    res.json({
      success: true,
      data: { enhancedText },
      message: 'Texte amélioré avec succès'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    console.error('Erreur amélioration texte:', error);
    
    // Gestion spéciale de l'erreur de quota
    if ((error as any).status === 429) {
      return res.status(429).json({ 
        success: false,
        error: 'Quota IA dépassé - Veuillez réessayer plus tard' 
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'amélioration du texte'
    });
  }
});

/**
 * GET /api/ai/health
 * Vérifie le statut de l'intégration IA
 */
router.get('/health', async (req, res) => {
  try {
    const hasVertexAI = !!(process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_LOCATION);
    const hasGeminiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    
    res.json({
      success: true,
      data: {
        vertex_ai_configured: hasVertexAI,
        gemini_fallback_configured: hasGeminiKey,
        services_available: [
          'price_suggestions',
          'description_enhancement',
          'quality_analysis',
          'text_enhancement'
        ],
        status: hasVertexAI ? 'vertex_ai_operational' : hasGeminiKey ? 'gemini_fallback' : 'no_ai_configured'
      }
    });
    
  } catch (error) {
    console.error('Erreur health check IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut IA'
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
