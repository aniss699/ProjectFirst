
import { Router } from 'express';
import { z } from 'zod';
import { TeamAnalysisService } from '../services/team-analysis.js';

const router = Router();
const teamAnalysisService = new TeamAnalysisService();

const teamAnalysisSchema = z.object({
  description: z.string().min(10),
  title: z.string().optional(),
  category: z.string().optional(),
  budget: z.string().optional()
});

const teamRequirementSchema = z.object({
  profession: z.string().min(2),
  description: z.string().min(10),
  requiredSkills: z.array(z.string()),
  estimatedBudget: z.number().optional(),
  estimatedDays: z.number().optional(),
  minExperience: z.number().optional(),
  isLeadRole: z.boolean().default(false)
});

// Analyse des besoins d'équipe
router.post('/analyze', async (req, res) => {
  try {
    const parsed = teamAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });
    }

    const analysis = await teamAnalysisService.analyzeTeamRequirements(parsed.data);
    res.json(analysis);
  } catch (error) {
    console.error('Erreur analyse équipe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un projet en mode équipe avec requirements
router.post('/create-project', async (req, res) => {
  try {
    const { projectData, teamRequirements } = req.body;
    
    // Valider les données du projet
    const projectParsed = z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      category: z.string().min(2),
      budget: z.string(),
      clientId: z.string(),
      isTeamMode: z.boolean().default(true)
    }).safeParse(projectData);

    if (!projectParsed.success) {
      return res.status(400).json({ error: 'Données projet invalides' });
    }

    // Valider les requirements d'équipe
    const requirementsParsed = z.array(teamRequirementSchema).safeParse(teamRequirements);
    if (!requirementsParsed.success) {
      return res.status(400).json({ error: 'Requirements équipe invalides' });
    }

    // TODO: Sauvegarder en base avec Prisma
    const projectId = 'team-project-' + Date.now();
    
    res.json({ 
      success: true, 
      projectId,
      message: 'Projet équipe créé avec succès'
    });
  } catch (error) {
    console.error('Erreur création projet équipe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les candidatures par profession
router.get('/project/:projectId/bids-by-profession', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // TODO: Récupérer depuis la base avec Prisma
    const bidsByProfession = {
      'DÉVELOPPEUR WEB': [
        {
          id: 'bid1',
          providerId: 'provider1',
          providerName: 'Jean Dupont',
          amount: 2500,
          timelineDays: 15,
          message: 'Expert en React et Node.js',
          rating: 4.8,
          completedProjects: 45
        }
      ],
      'DESIGNER UI UX': [
        {
          id: 'bid2',
          providerId: 'provider2',
          providerName: 'Marie Martin',
          amount: 1500,
          timelineDays: 10,
          message: 'Spécialisée en design d\'interface moderne',
          rating: 4.9,
          completedProjects: 32
        }
      ]
    };

    res.json(bidsByProfession);
  } catch (error) {
    console.error('Erreur récupération candidatures:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
