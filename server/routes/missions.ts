
import { Router, Request, Response } from 'express';
import { db } from '../database.js';
import { missions, offers, users } from '../../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// GET /api/missions - Récupérer toutes les missions publiques
router.get('/', async (req, res) => {
  try {
    const allMissions = await db
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        category: missions.category,
        budget: missions.budget,
        location: missions.location,
        status: missions.status,
        created_at: missions.created_at,
        user_name: users.name
      })
      .from(missions)
      .leftJoin(users, eq(missions.user_id, users.id))
      .where(eq(missions.status, 'active'))
      .orderBy(desc(missions.created_at));

    res.json(allMissions);
  } catch (error) {
    console.error('Erreur récupération missions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/missions/my - Récupérer les missions de l'utilisateur connecté
router.get('/my', async (req: any, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const userMissions = await db
      .select()
      .from(missions)
      .where(eq(missions.user_id, userId))
      .orderBy(desc(missions.created_at));

    res.json(userMissions);
  } catch (error) {
    console.error('Erreur récupération missions utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/missions - Créer une nouvelle mission
router.post('/', async (req: any, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { title, description, category, budget, location } = req.body;

    // Validation des champs obligatoires
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Le titre et la description sont obligatoires' 
      });
    }

    const newMission = await db
      .insert(missions)
      .values({
        title: title.trim(),
        description: description.trim(),
        category: category || null,
        budget: budget || null,
        location: location || null,
        user_id: userId,
        status: 'active'
      })
      .returning();

    res.status(201).json(newMission[0]);
  } catch (error) {
    console.error('Erreur création mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/missions/:id - Modifier une mission
router.put('/:id', async (req: any, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const missionId = parseInt(req.params.id);
    const { title, description, category, budget, location } = req.body;

    // Vérifier que la mission appartient à l'utilisateur
    const existingMission = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1);

    if (!existingMission.length) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    if (existingMission[0].user_id !== userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updatedMission = await db
      .update(missions)
      .set({
        title: title.trim(),
        description: description.trim(),
        category: category || null,
        budget: budget || null,
        location: location || null,
        updated_at: new Date()
      })
      .where(eq(missions.id, missionId))
      .returning();

    res.json(updatedMission[0]);
  } catch (error) {
    console.error('Erreur modification mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/missions/:id/offers - Créer une offre pour une mission
router.post('/:id/offers', async (req: any, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const missionId = parseInt(req.params.id);
    const { amount, message } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Le montant est obligatoire' });
    }

    const newOffer = await db
      .insert(offers)
      .values({
        mission_id: missionId,
        user_id: userId,
        amount: parseInt(amount),
        message: message || null,
        status: 'pending'
      })
      .returning();

    res.status(201).json(newOffer[0]);
  } catch (error) {
    console.error('Erreur création offre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/missions/:id/offers - Récupérer les offres d'une mission
router.get('/:id/offers', async (req, res) => {
  try {
    const missionId = parseInt(req.params.id);

    const missionOffers = await db
      .select({
        id: offers.id,
        amount: offers.amount,
        message: offers.message,
        status: offers.status,
        created_at: offers.created_at,
        user_name: users.name
      })
      .from(offers)
      .leftJoin(users, eq(offers.user_id, users.id))
      .where(eq(offers.mission_id, missionId))
      .orderBy(desc(offers.created_at));

    res.json(missionOffers);
  } catch (error) {
    console.error('Erreur récupération offres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
