import { Router } from 'express';
import { z } from 'zod';
import { aiEnhancementService } from '../services/ai-enhancement.js';

const router = Router();

// Schema pour les requêtes de suggestion de mission
const missionSuggestionSchema = z.object({
  title: z.string().min(3, 'Titre trop court'),
  description: z.string().min(10, 'Description trop courte'),
  category: z.string().min(1, 'Catégorie requise'),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  deadline_ts: z.string().optional(),
  geo_required: z.boolean().optional(),
  onsite_radius_km: z.number().optional()
});

/**
 * POST /api/ai/missions/suggest
 * Génère des suggestions complètes pour une mission (titre, prix, délais, etc.)
 */
router.post('/suggest', async (req, res) => {
  try {
    console.log('Requête reçue:', req.body);
    const { title, description, category } = missionSuggestionSchema.parse(req.body);
    console.log('Validation OK pour:', { title, category });
    
    // Suggestions adaptées par catégorie
    const categoryConfig = {
      'web-development': {
        skills: ['React', 'Node.js', 'TypeScript', 'CSS'],
        minPrice: 1500, medPrice: 4000, maxPrice: 8000,
        avgDays: 21, criteria: ['Interface responsive', 'Tests fonctionnels', 'Déploiement']
      },
      'mobile-development': {
        skills: ['React Native', 'Flutter', 'iOS', 'Android'],
        minPrice: 3000, medPrice: 7000, maxPrice: 15000,
        avgDays: 35, criteria: ['Compatibilité multi-plateformes', 'Tests sur appareils', 'Publication stores']
      },
      'design': {
        skills: ['Figma', 'Adobe XD', 'UI/UX', 'Photoshop'],
        minPrice: 800, medPrice: 2500, maxPrice: 5000,
        avgDays: 14, criteria: ['Maquettes haute fidélité', 'Guide de style', 'Prototypes interactifs']
      },
      'marketing': {
        skills: ['SEO', 'Google Ads', 'Analytics', 'Copywriting'],
        minPrice: 1000, medPrice: 3000, maxPrice: 6000,
        avgDays: 28, criteria: ['Stratégie définie', 'KPIs mesurables', 'Rapport de performance']
      },
      'data-science': {
        skills: ['Python', 'Machine Learning', 'SQL', 'Visualisation'],
        minPrice: 2000, medPrice: 6000, maxPrice: 12000,
        avgDays: 42, criteria: ['Nettoyage des données', 'Modèle validé', 'Dashboard interactif']
      }
    };

    const config = categoryConfig[category] || categoryConfig['web-development'];
    
    res.json({
      success: true,
      suggestion: {
        title: title,
        summary: description,
        acceptance_criteria: config.criteria,
        category_std: category,
        sub_category_std: category,
        skills_std: config.skills,
        tags_std: config.skills.map(s => s.toLowerCase()),
        brief_quality_score: 0.7 + (description.length / 1000),
        richness_score: 0.6 + (description.split(' ').length / 200),
        missing_info: [
          { id: 'budget', q: `Quel est votre budget ? (${config.minPrice}€ - ${config.maxPrice}€ recommandé)` },
          { id: 'timeline', q: `Quand souhaitez-vous livrer ? (${config.avgDays} jours en moyenne)` }
        ],
        price_suggested_min: config.minPrice,
        price_suggested_med: config.medPrice,
        price_suggested_max: config.maxPrice,
        delay_suggested_days: config.avgDays,
        loc_base: Math.floor(config.medPrice / 80), // Estimation lignes de code
        loc_uplift_reco: {
          new_budget: Math.floor(config.maxPrice * 0.9),
          new_delay: Math.floor(config.avgDays * 1.3),
          delta_loc: Math.floor(config.medPrice / 60)
        },
        reasons: [
          `Suggestions basées sur ${category}`,
          `Prix aligné sur le marché ${category}`,
          `Délais optimisés pour ce type de projet`
        ]
      },
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
    
    console.error('Erreur suggestions mission:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des suggestions de mission'
    });
  }
});

// Fonction utilitaire pour les prix de fallback
function getFallbackPrice(category: string, type: 'min' | 'avg' | 'max'): number {
  const priceMap: Record<string, Record<string, number>> = {
    'développement': { min: 2000, avg: 5000, max: 12000 },
    'design': { min: 800, avg: 2000, max: 5000 },
    'marketing': { min: 1000, avg: 2500, max: 6000 },
    'conseil': { min: 500, avg: 1500, max: 3000 },
    'travaux': { min: 1500, avg: 4000, max: 8000 },
    'services': { min: 300, avg: 800, max: 2000 }
  };
  
  return priceMap[category]?.[type] || priceMap['conseil'][type];
}

// Fonction utilitaire pour extraire les compétences selon la catégorie
function extractSkillsFromCategory(category: string): string[] {
  const skillsMap: Record<string, string[]> = {
    'développement': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    'design': ['Photoshop', 'Illustrator', 'Figma', 'UI/UX', 'Branding'],
    'marketing': ['SEO', 'Google Ads', 'Analytics', 'Social Media', 'Content'],
    'conseil': ['Stratégie', 'Business Plan', 'Audit', 'Conseil', 'Formation'],
    'travaux': ['Maçonnerie', 'Électricité', 'Plomberie', 'Peinture', 'Renovation'],
    'services': ['Comptabilité', 'Juridique', 'Traduction', 'Rédaction', 'Support']
  };
  
  return skillsMap[category] || ['Compétences générales'];
}

// Fonction utilitaire pour estimer la durée du projet
function estimateProjectDuration(category: string, description: string): number {
  const baseDuration: Record<string, number> = {
    'développement': 21,
    'design': 14,
    'marketing': 10,
    'conseil': 7,
    'travaux': 14,
    'services': 5
  };
  
  const base = baseDuration[category] || 14;
  
  // Ajuster selon la longueur de la description (complexité supposée)
  if (description.length > 300) return base + 7;
  if (description.length > 150) return base + 3;
  
  return base;
}

export default router;