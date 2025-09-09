import { Router } from 'express';
import { z } from 'zod';
const router = Router();

const missionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  budget: z.union([z.string(), z.number()]),
  location: z.string().optional(),
  clientId: z.string(),
  clientName: z.string()
});

router.post('/', async (req, res) => {
  const parsed = missionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });
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
    
    res.json({ 
      ok: true, 
      missions,
      total: missions.length 
    });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
