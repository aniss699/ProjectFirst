import { Router } from 'express';
import { z } from 'zod';
const router = Router();

const missionSchema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères'),
  description: z.string().min(10, 'La description doit faire au moins 10 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  budget: z.union([z.string(), z.number()]).transform(val => String(val)),
  location: z.string().optional().default('Non spécifié'),
  clientId: z.string().min(1, 'ID client requis'),
  clientName: z.string().min(1, 'Nom client requis')
});

router.post('/', async (req, res) => {
  console.log('Données reçues pour création mission:', req.body);
  
  const parsed = missionSchema.safeParse(req.body);
  if (!parsed.success) {
    console.error('Erreur de validation:', parsed.error.flatten());
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: parsed.error.flatten(),
      received: req.body 
    });
  }
  const data = parsed.data;
  try {
    const created = { 
      id: 'mission-' + Date.now(), 
      ...data,
      status: 'open',
      createdAt: new Date().toISOString(),
      bids: []
    };
    
    // Ajouter au stockage global
    if (!global.missions) {
      global.missions = [];
    }
    global.missions.push(created);
    
    console.log(`✅ Mission créée: ${created.id} - ${created.title}`);
    res.json({ ok: true, mission: created });
  } catch (e) {
    console.error('Create mission error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/missions - Récupérer toutes les missions
router.get('/', async (req, res) => {
  try {
    if (!global.missions) {
      global.missions = [];
    }
    
    const missions = global.missions.filter(mission => 
      mission.status === 'open' || !mission.status
    );
    
    console.log(`📋 Récupération de ${missions.length} missions pour marketplace`);
    
    // Retourner directement le tableau pour compatibility avec react-query
    res.json(missions);
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
