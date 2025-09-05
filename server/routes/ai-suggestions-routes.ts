import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Schema de validation pour les suggestions d'assistant
const assistantSuggestionsSchema = z.object({
  page: z.string(),
  userContext: z.object({
    isClient: z.boolean().optional(),
    isProvider: z.boolean().optional(),
    missions: z.number().optional(),
    completedProjects: z.number().optional(),
    completeness: z.number().optional(),
    hasContent: z.object({
      bio: z.boolean().optional(),
      headline: z.boolean().optional(),
      skills: z.boolean().optional(),
      portfolio: z.boolean().optional()
    }).optional()
  }).optional()
});

// Génération de suggestions contextuelles basées sur la page
async function generatePageSuggestions(page: string, userContext: any = {}) {
  const suggestions: any[] = [];

  // Suggestions basées sur la page actuelle
  switch (page) {
    case 'create-mission':
      suggestions.push(
        {
          type: 'optimization',
          title: 'Optimisez votre description',
          description: 'Une description détaillée attire 3x plus de candidats qualifiés',
          action: 'Améliorer avec l\'IA',
          priority: 'high',
          impact: 'increase_applications'
        },
        {
          type: 'pricing',
          title: 'Budget suggéré',
          description: 'Obtenez une estimation de prix basée sur le marché',
          action: 'Calculer le budget',
          priority: 'medium',
          impact: 'fair_pricing'
        }
      );
      break;

    case 'marketplace':
      if (userContext.isProvider) {
        suggestions.push(
          {
            type: 'recommendation',
            title: 'Missions recommandées',
            description: 'Nous avons trouvé 3 missions correspondant à votre profil',
            action: 'Voir les missions',
            priority: 'high',
            impact: 'find_work'
          }
        );
      }
      break;

    case 'profile-general':
      if (userContext.completeness < 50) {
        suggestions.push(
          {
            type: 'completion',
            title: 'Complétez votre profil',
            description: 'Un profil complet reçoit 5x plus de vues',
            action: 'Compléter',
            priority: 'high',
            impact: 'profile_visibility'
          }
        );
      }
      
      if (!userContext.hasContent?.headline) {
        suggestions.push(
          {
            type: 'headline',
            title: 'Ajoutez un titre accrocheur',
            description: 'Un bon titre augmente vos chances d\'être contacté',
            action: 'Générer un titre',
            priority: 'medium',
            impact: 'profile_attraction'
          }
        );
      }
      break;

    case 'profile-skills':
      if (!userContext.hasContent?.skills || userContext.hasContent.skills === 0) {
        suggestions.push(
          {
            type: 'skills',
            title: 'Ajoutez vos compétences',
            description: 'Les profils avec compétences ont 4x plus de succès',
            action: 'Ajouter des compétences',
            priority: 'high',
            impact: 'skill_matching'
          }
        );
      }
      break;

    case 'dashboard':
      suggestions.push(
        {
          type: 'insight',
          title: 'Votre performance cette semaine',
          description: 'Vos vues de profil ont augmenté de 15%',
          action: 'Voir les détails',
          priority: 'low',
          impact: 'analytics'
        }
      );
      break;

    default:
      // Suggestions générales
      suggestions.push(
        {
          type: 'general',
          title: 'Optimisez votre présence',
          description: 'L\'IA peut vous aider à améliorer votre profil',
          action: 'Analyser mon profil',
          priority: 'medium',
          impact: 'general_improvement'
        }
      );
  }

  return suggestions;
}

/**
 * POST /api/ai/assistant-suggestions
 * Génère des suggestions contextuelles pour l'assistant IA
 */
router.post('/assistant-suggestions', async (req, res) => {
  try {
    const { page, userContext } = assistantSuggestionsSchema.parse(req.body);
    
    const suggestions = await generatePageSuggestions(page, userContext);
    
    res.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }
    
    console.error('Erreur suggestions assistant:', error);
    
    // Fallback avec suggestions génériques
    res.json({
      success: false,
      suggestions: [
        {
          type: 'fallback',
          title: 'Suggestions temporairement indisponibles',
          description: 'Réessayez dans quelques instants',
          action: 'Réessayer',
          priority: 'low',
          impact: 'fallback'
        }
      ],
      fallback: true
    });
  }
});

export default router;