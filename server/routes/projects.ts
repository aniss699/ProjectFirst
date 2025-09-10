import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../database.js';
import { missions, offers } from '../../shared/schema.js';

// Utilitaire pour générer un excerpt à partir de la description
function generateExcerpt(description: string, maxLength: number = 200): string {
  if (!description || description.length <= maxLength) {
    return description || '';
  }

  // Chercher la fin de phrase la plus proche avant maxLength
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );

  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }

  // Sinon, couper au dernier espace pour éviter de couper un mot
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  return truncated.trim() + '...';
}

const router = Router();

// GET /api/missions/users/:userId/missions - Get missions for a specific user
router.get('/users/:userId/missions', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('👤 Fetching missions for user:', userId);

    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ Invalid user ID:', userId);
      return res.status(400).json({ error: 'User ID invalide' });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      console.error('❌ User ID is not a valid number:', userId);
      return res.status(400).json({ error: 'User ID doit être un nombre' });
    }

    console.log('🔍 Querying database: SELECT * FROM missions WHERE client_id =', userIdInt);

    const userMissions = await db
      .select()
      .from(missions)
      .where(eq(missions.user_id, userIdInt))
      .orderBy(desc(missions.created_at));

    console.log('📊 Query result: Found', userMissions.length, 'missions with user_id =', userIdInt);
    userMissions.forEach(mission => {
      console.log('   📋 Mission:', mission.id, '| user_id:', mission.user_id, '| title:', mission.title);
    });

    const missionsWithExcerpt = userMissions.map(mission => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt(mission.description || '', 200),
      category: mission.category,
      budget: mission.budget?.toString() || '0',
      location: mission.location,
      status: mission.status,
      userId: mission.user_id?.toString(),
      userName: 'Moi', // Placeholder, should be fetched or passed
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      offers: [] // Placeholder, offers are fetched separately if needed
    }));

    console.log(`👤 Found ${missionsWithExcerpt.length} missions for user ${userId}`);
    res.json(missionsWithExcerpt);
  } catch (error) {
    console.error('❌ Error fetching user missions:', error);
    res.status(500).json({
      error: 'Failed to fetch user missions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/missions/:id - Get a specific mission with bids
router.get('/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log('🔍 API: Récupération mission ID:', missionId);

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('❌ API: Mission ID invalide:', missionId);
      return res.status(400).json({ error: 'Mission ID invalide' });
    }

    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt)) {
      console.error('❌ API: Mission ID n\'est pas un nombre valide:', missionId);
      return res.status(400).json({ error: 'Mission ID doit être un nombre' });
    }

    const missionResult = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionIdInt))
      .limit(1);

    if (missionResult.length === 0) {
      console.error('❌ API: Mission non trouvée:', missionId);
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    const mission = missionResult[0];
    console.log('✅ API: Mission trouvée:', mission.title);

    const missionWithExcerpt = {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt(mission.description || '', 200),
      category: mission.category,
      budget: mission.budget?.toString() || '0',
      location: mission.location,
      status: mission.status,
      userId: mission.user_id?.toString(),
      userName: 'Moi', // Placeholder
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      offers: [] // Placeholder, potentially fetch offers here too if needed
    };

    res.json(missionWithExcerpt);
  } catch (error) {
    console.error('❌ API: Erreur récupération mission:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// GET /api/missions/:id/offers - Get offers for a specific mission
router.get('/:id/offers', async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log('🔍 API: Récupération offers pour mission ID:', missionId);

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('❌ API: Mission ID invalide:', missionId);
      return res.status(400).json({ error: 'Mission ID invalide' });
    }

    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt)) {
      console.error('❌ API: Mission ID n\'est pas un nombre valide:', missionId);
      return res.status(400).json({ error: 'Mission ID doit être un nombre' });
    }

    const missionOffers = await db
      .select()
      .from(offers)
      .where(eq(offers.mission_id, missionIdInt));

    console.log('✅ API: Trouvé', missionOffers.length, 'offers pour mission', missionId);
    res.json(missionOffers);
  } catch (error) {
    console.error('❌ API: Erreur récupération offers:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// DELETE /api/missions/:id - Delete a specific mission
router.delete('/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log('🗑️ API: Suppression mission ID:', missionId);

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('❌ API: Mission ID invalide:', missionId);
      return res.status(400).json({ error: 'Mission ID invalide' });
    }

    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt)) {
      console.error('❌ API: Mission ID n\'est pas un nombre valide:', missionId);
      return res.status(400).json({ error: 'Mission ID doit être un nombre' });
    }

    // Check if mission exists
    const existingMission = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionIdInt))
      .limit(1);

    if (existingMission.length === 0) {
      console.error('❌ API: Mission non trouvée pour suppression:', missionId);
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Delete associated offers first
    await db.delete(offers).where(eq(offers.mission_id, missionIdInt));
    console.log('✅ API: Offers supprimées pour mission:', missionId);

    // Delete the mission
    const deletedMission = await db
      .delete(missions)
      .where(eq(missions.id, missionIdInt))
      .returning();

    if (deletedMission.length === 0) {
      throw new Error('Échec de la suppression de la mission');
    }

    console.log('✅ API: Mission supprimée avec succès:', missionId);
    res.json({ message: 'Mission supprimée avec succès', mission: deletedMission[0] });
  } catch (error) {
    console.error('❌ API: Erreur suppression mission:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;