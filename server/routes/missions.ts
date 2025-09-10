import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../database.js';
import { missions, bids as bidTable } from '../../shared/schema.js';

// Utilitaire pour générer un excerpt à partir de la description
function generateExcerpt(description: string, maxLength: number = 200): string {
  if (!description || description.length <= maxLength) {
    return description || '';
  }

  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  return truncated.trim() + '...';
}

const router = Router();

// POST /api/missions - DISABLED - Mission creation removed
router.post('/', async (req, res) => {
  res.status(410).json({
    error: 'La création de missions a été supprimée',
    message: 'Cette fonctionnalité n\'est plus disponible'
  });
});

// GET /api/missions - Get all missions
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all missions...');

    // Select only existing columns
    const allMissions = await db
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        category: missions.category,
        budget: missions.budget,
        currency: missions.currency,
        location: missions.location,
        user_id: missions.user_id,
        status: missions.status,
        created_at: missions.created_at,
        updated_at: missions.updated_at
      })
      .from(missions)
      .orderBy(desc(missions.created_at));

    console.log(`📋 Found ${allMissions.length} missions in database`);

    // Transform missions to include required fields
    const missionsWithBids = allMissions.map(mission => ({
      ...mission,
      excerpt: generateExcerpt(mission.description || '', 200),
      clientName: 'Client anonyme',
      bids: []
    }));

    res.json(missionsWithBids);
  } catch (error) {
    console.error('❌ Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// GET /api/missions/health - Health check
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Mission health check endpoint called');

    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'missions-api',
      environment: process.env.NODE_ENV || 'development'
    };

    console.log('🏥 Health check passed:', healthInfo);
    res.json(healthInfo);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/missions/:id - Get specific mission
router.get('/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log('🔍 API: Récupération mission ID:', missionId);

    // Skip special endpoints
    if (['debug', 'verify-sync', 'health'].includes(missionId)) {
      return res.status(404).json({ error: 'Endpoint non trouvé' });
    }

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('❌ API: Mission ID invalide:', missionId);
      return res.status(400).json({
        error: 'Mission ID invalide',
        details: 'L\'ID de mission est requis et ne peut pas être vide'
      });
    }

    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt) || missionIdInt <= 0) {
      console.error('❌ API: Mission ID n\'est pas un nombre valide:', missionId);
      return res.status(400).json({
        error: 'Mission ID doit être un nombre entier valide',
        received: missionId
      });
    }

    // Select only existing columns
    const mission = await db
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        category: missions.category,
        budget: missions.budget,
        currency: missions.currency,
        location: missions.location,
        user_id: missions.user_id,
        status: missions.status,
        created_at: missions.created_at,
        updated_at: missions.updated_at
      })
      .from(missions)
      .where(eq(missions.id, missionIdInt))
      .limit(1);

    if (mission.length === 0) {
      console.error('❌ API: Mission non trouvée:', missionId);
      return res.status(404).json({
        error: 'Mission non trouvée',
        missionId: missionIdInt
      });
    }

    // Get bids for this mission
    const bids = await db
      .select()
      .from(bidTable)
      .where(eq(bidTable.mission_id, missionIdInt));

    const result = {
      ...mission[0],
      excerpt: generateExcerpt(mission[0].description || '', 200),
      bids: bids || []
    };

    console.log('✅ API: Mission trouvée:', result.title, 'avec', result.bids.length, 'offres');
    res.json(result);
  } catch (error) {
    console.error('❌ API: Erreur récupération mission:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// GET /api/users/:userId/missions - Get missions for user
router.get('/users/:userId/missions', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('👤 Fetching missions for user:', userId);

    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ Invalid user ID:', userId);
      return res.status(400).json({
        error: 'User ID invalide'
      });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt) || userIdInt <= 0) {
      console.error('❌ User ID is not a valid number:', userId);
      return res.status(400).json({
        error: 'User ID doit être un nombre entier valide',
        received: userId
      });
    }

    console.log('🔍 Querying database: SELECT * FROM missions WHERE user_id =', userIdInt);

    // Select only existing columns
    const userMissions = await db
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        category: missions.category,
        budget: missions.budget,
        currency: missions.currency,
        location: missions.location,
        user_id: missions.user_id,
        status: missions.status,
        created_at: missions.created_at,
        updated_at: missions.updated_at
      })
      .from(missions)
      .where(eq(missions.user_id, userIdInt))
      .orderBy(desc(missions.created_at));

    console.log('📊 Query result: Found', userMissions.length, 'missions for user_id =', userIdInt);

    // Transform missions for frontend
    const missionsWithBids = userMissions.map(mission => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt(mission.description || '', 200),
      category: mission.category,
      budget: mission.budget?.toString() || '0',
      location: mission.location,
      status: mission.status,
      userId: mission.user_id?.toString(),
      userName: 'Moi',
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      bids: []
    }));

    console.log(`👤 Found ${missionsWithBids.length} missions for user ${userId}`);
    res.json(missionsWithBids);
  } catch (error) {
    console.error('❌ Error fetching user missions:', error);
    res.status(500).json({
      error: 'Failed to fetch user missions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/missions/:id - Update mission
router.put('/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    const updateData = req.body;

    if (!missionId || ['debug', 'verify-sync', 'health'].includes(missionId)) {
      return res.status(400).json({ error: 'Mission ID invalide' });
    }

    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt) || missionIdInt <= 0) {
      return res.status(400).json({ error: 'Mission ID doit être un nombre valide' });
    }

    // Check if mission exists
    const existingMission = await db
      .select({ id: missions.id })
      .from(missions)
      .where(eq(missions.id, missionIdInt))
      .limit(1);

    if (existingMission.length === 0) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Prepare update data with only existing columns
    const missionToUpdate = {
      title: updateData.title,
      description: updateData.description,
      category: updateData.category,
      budget: updateData.budget ? parseInt(updateData.budget) : 0,
      currency: updateData.currency || 'EUR',
      location: updateData.location,
      status: updateData.status,
      updated_at: new Date()
    };

    const updatedMission = await db
      .update(missions)
      .set(missionToUpdate)
      .where(eq(missions.id, missionIdInt))
      .returning();

    if (updatedMission.length === 0) {
      throw new Error('Échec de la mise à jour de la mission');
    }

    console.log('✅ API: Mission modifiée avec succès:', missionId);
    res.json(updatedMission[0]);
  } catch (error) {
    console.error('❌ API: Erreur modification mission:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// DELETE /api/missions/:id - Delete mission
router.delete('/:id', async (req, res) => {
  try {
    const missionId = req.params.id;

    if (!missionId || ['debug', 'verify-sync', 'health'].includes(missionId)) {
      return res.status(400).json({ error: 'Mission ID invalide' });
    }

    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt) || missionIdInt <= 0) {
      return res.status(400).json({ error: 'Mission ID doit être un nombre valide' });
    }

    // Check if mission exists
    const existingMission = await db
      .select({ id: missions.id })
      .from(missions)
      .where(eq(missions.id, missionIdInt))
      .limit(1);

    if (existingMission.length === 0) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Delete associated bids first
    await db.delete(bidTable).where(eq(bidTable.mission_id, missionIdInt));

    // Delete the mission
    const deletedMission = await db
      .delete(missions)
      .where(eq(missions.id, missionIdInt))
      .returning();

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