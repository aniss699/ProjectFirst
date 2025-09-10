import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const teamAnalysisSchema = z.object({
  description: z.string().min(10),
  title: z.string().min(3),
  category: z.string().min(2),
  budget: z.union([z.string(), z.number()])
});

const teamProjectSchema = z.object({
  projectData: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.string().min(2),
    budget: z.union([z.string(), z.number()]),
    location: z.string().optional(),
    isTeamMode: z.boolean()
  }),
  teamRequirements: z.array(z.object({
    profession: z.string(),
    description: z.string(),
    required_skills: z.array(z.string()),
    estimated_budget: z.number(),
    estimated_days: z.number(),
    min_experience: z.number(),
    is_lead_role: z.boolean(),
    importance: z.enum(['high', 'medium', 'low'])
  }))
});

router.post('/analyze', async (req, res) => {
  try {
    const parsed = teamAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });
    }

    const { description, title, category, budget } = parsed.data;

    // Simulation d'analyse IA pour générer les professions
    const professions = [
      {
        profession: "Développeur Frontend",
        description: "Création de l'interface utilisateur et expérience utilisateur",
        required_skills: ["React", "TypeScript", "CSS", "HTML"],
        estimated_budget: Math.floor(Number(budget) * 0.4),
        estimated_days: 10,
        min_experience: 2,
        is_lead_role: false,
        importance: 'high' as const
      },
      {
        profession: "Développeur Backend",
        description: "Architecture serveur et APIs",
        required_skills: ["Node.js", "PostgreSQL", "REST API"],
        estimated_budget: Math.floor(Number(budget) * 0.4),
        estimated_days: 12,
        min_experience: 3,
        is_lead_role: true,
        importance: 'high' as const
      },
      {
        profession: "Designer UX/UI",
        description: "Conception de l'expérience et interface utilisateur",
        required_skills: ["Figma", "Design System", "Prototypage"],
        estimated_budget: Math.floor(Number(budget) * 0.2),
        estimated_days: 5,
        min_experience: 2,
        is_lead_role: false,
        importance: 'medium' as const
      }
    ];

    res.json({ professions });
  } catch (error) {
    console.error('Team analysis error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/create-project', async (req, res) => {
  try {
    const parsed = teamProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });
    }

    const { projectData, teamRequirements } = parsed.data;

    // Créer le projet principal
    const mainProject = {
      id: 'team-' + Date.now(),
      ...projectData,
      type: 'team',
      teamRequirements,
      status: 'open',
      clientId: 'user_1', // Temporaire
      clientName: 'Utilisateur',
      createdAt: new Date().toISOString()
    };

    // Créer des missions individuelles pour chaque profession
    const subMissions = teamRequirements.map((req, index) => ({
      id: `${mainProject.id}-sub-${index}`,
      title: `${projectData.title} - ${req.profession}`,
      description: req.description,
      category: projectData.category,
      budget: req.estimated_budget.toString(),
      location: projectData.location || 'Remote',
      parentProjectId: mainProject.id,
      profession: req.profession,
      required_skills: req.required_skills,
      estimated_days: req.estimated_days,
      min_experience: req.min_experience,
      is_lead_role: req.is_lead_role,
      importance: req.importance,
      status: 'open',
      clientId: mainProject.clientId,
      clientName: mainProject.clientName,
      createdAt: new Date().toISOString(),
      bids: []
    }));

    // Persistance temporaire en mémoire (comme les autres missions)
    if (!global.missions) {
      global.missions = [];
    }

    // Ajouter le projet principal
    global.missions.push(mainProject);

    // Ajouter les sous-missions
    global.missions.push(...subMissions);

    console.log(`✅ Projet en équipe créé: ${mainProject.id} avec ${subMissions.length} sous-missions`);

    res.json({
      ok: true,
      project: mainProject,
      subMissions,
      message: `Projet créé avec ${subMissions.length} missions spécialisées`
    });
  } catch (error) {
    console.error('Team project creation error:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du projet' });
  }
});

// GET /api/users/:userId/missions - DISABLED - Mission functionality removed
router.get('/users/:userId/missions', async (req, res) => {
  res.status(410).json({
    error: 'Les missions ont été supprimées',
    message: 'Cette fonctionnalité n\'est plus disponible'
  });
});

export default router;