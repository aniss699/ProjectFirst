import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database.js';
import { missions, bids as bidTable } from '../../shared/schema.js';
import { MissionSyncService } from '../services/mission-sync.js'; // Import MissionSyncService

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

// POST /api/missions - Create new mission
router.post('/', async (req, res) => {
  try {
    const missionData = req.body;
    console.log('📝 Mission creation request received:', JSON.stringify(missionData, null, 2));
    console.log('📝 Request headers:', JSON.stringify(req.headers, null, 2));

    // Validate required fields with better error messages
    if (!missionData.title || missionData.title.trim() === '') {
      console.error('❌ Validation failed: Missing or empty title');
      return res.status(400).json({
        error: 'Le titre est requis',
        field: 'title',
        received: missionData.title
      });
    }

    if (!missionData.description || missionData.description.trim() === '') {
      console.error('❌ Validation failed: Missing or empty description');
      return res.status(400).json({
        error: 'La description est requise',
        field: 'description',
        received: missionData.description
      });
    }

    // Validate description length
    if (missionData.description.length < 10) {
      console.error('❌ Validation failed: Description too short');
      return res.status(400).json({
        error: 'La description doit contenir au moins 10 caractères',
        field: 'description',
        length: missionData.description.length
      });
    }

    // Validate user_id (user must be authenticated)
    if (!missionData.userId) {
      console.error('❌ Validation failed: Missing userId');
      return res.status(401).json({
        error: 'Utilisateur non authentifié',
        field: 'userId',
        received: missionData.userId
      });
    }

    // Prepare mission data with proper field mapping
    const missionToInsert = {
      title: missionData.title,
      description: missionData.description,
      category: missionData.category || 'developpement',
      budget: missionData.budget ? parseInt(missionData.budget) : null,
      location: missionData.location || null,
      urgency: missionData.urgency || 'medium',
      status: missionData.status || 'published',
      created_at: new Date(),
      updated_at: new Date(),
      user_id: missionData.userId ? parseInt(missionData.userId) : null,
      client_id: missionData.userId ? parseInt(missionData.userId) : null, // Pour compatibilité
      // Map additional fields properly
      budget_min: missionData.budget_min ? parseInt(missionData.budget_min) : (missionData.budget ? parseInt(missionData.budget) : null),
      budget_max: missionData.budget_max ? parseInt(missionData.budget_max) : (missionData.budget ? parseInt(missionData.budget) : null),
      deadline: missionData.deadline ? new Date(missionData.deadline) : null,
      tags: missionData.tags || [],
      requirements: missionData.requirements || null,
      skills_required: missionData.skills_required || [],
      is_team_mission: missionData.is_team_mission || false,
      team_size: missionData.team_size || 1,
      remote_allowed: missionData.remote_allowed !== undefined ? missionData.remote_allowed : true,
    };

    console.log('📤 Inserting mission with data:', JSON.stringify(missionToInsert, null, 2));

    // Insert mission into database with error handling
    console.log('📤 Attempting to insert mission with data:', JSON.stringify(missionToInsert, null, 2));

    let insertedMission;
    try {
      const result = await db.insert(missions).values(missionToInsert).returning();
      insertedMission = result[0];

      if (!insertedMission) {
        throw new Error('No mission returned from database insert');
      }

      console.log('✅ Mission created successfully:', insertedMission);

      // Verify the mission was actually saved
      const savedMission = await db.select().from(missions).where(eq(missions.id, insertedMission.id)).limit(1);
      console.log('🔍 Verification - Mission in DB:', savedMission.length > 0 ? 'Found' : 'NOT FOUND');

      res.status(201).json(insertedMission);
    } catch (error) {
      console.error('❌ Database insertion failed:', error);
      console.error('❌ Data that failed to insert:', JSON.stringify(missionToInsert, null, 2));
      // Throw error to be caught by the outer catch block
      throw error;
    }

    // Synchronisation avec le feed en arrière-plan (non-bloquant)
    setImmediate(async () => {
      try {
        // Use the imported MissionSyncService as an instance
        const missionSync = new MissionSyncService(process.env.DATABASE_URL || 'postgresql://localhost:5432/swideal');
        // Convert database mission to Mission type
        const missionForFeed = {
          id: insertedMission.id.toString(),
          title: insertedMission.title,
          description: insertedMission.description,
          category: insertedMission.category || 'general',
          budget: insertedMission.budget?.toString() || insertedMission.budget_min?.toString() || '0',
          location: insertedMission.location || 'Remote',
          status: (insertedMission.status as 'open' | 'in_progress' | 'completed' | 'closed') || 'open',
          clientId: insertedMission.user_id?.toString() || insertedMission.client_id?.toString() || '1',
          clientName: 'Client',
          createdAt: insertedMission.created_at?.toISOString() || new Date().toISOString(),
          bids: []
        };
        await missionSync.addMissionToFeed(missionForFeed);
        console.log('✅ Mission synchronisée avec le feed');
      } catch (syncError) {
        console.error('⚠️ Erreur synchronisation feed (non-bloquant):', syncError);
      }
    });

  } catch (error) {
    console.error('❌ Error creating mission:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    // Check if headers have already been sent to prevent double response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to create mission',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// GET /api/missions - Get all missions with bids
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all missions...');
    
    // Use simple select() to avoid Drizzle column mapping issues
    const allMissions = await db
      .select()
      .from(missions)
      .orderBy(desc(missions.created_at));
    
    console.log(`📋 Found ${allMissions.length} missions in database`);

    // Transform missions to include required fields for MissionWithBids type
    const missionsWithBids = allMissions.map(mission => ({
      ...mission,
      excerpt: generateExcerpt(mission.description || '', 200),
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      clientName: 'Client anonyme', // Default client name
      bids: [] // Empty bids array for now
    }));

    console.log('📋 Missions with bids:', missionsWithBids.map(m => ({ id: m.id, title: m.title, status: m.status })));
    res.json(missionsWithBids);
  } catch (error) {
    console.error('❌ Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// GET /api/missions/health - Health check endpoint (must be before /:id route)
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Mission health check endpoint called');
    
    // Simple health check
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

// GET /api/missions/debug - Diagnostic endpoint (must be before /:id route)
router.get('/debug', async (req, res) => {
  try {
    console.log('🔍 Mission debug endpoint called');

    // Test database connection
    const testQuery = await db.select().from(missions).limit(1);

    // Check database structure
    const dbInfo = {
      status: 'connected',
      sampleMissions: testQuery.length,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
    };

    console.log('🔍 Database info:', dbInfo);
    res.json(dbInfo);
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/missions/verify-sync - Vérifier la synchronisation missions/feed
router.get('/verify-sync', async (req, res) => {
  try {
    console.log('🔍 Vérification de la synchronisation missions/feed');

    // Récupérer les dernières missions
    const recentMissions = await db.select().from(missions)
      .orderBy(desc(missions.created_at))
      .limit(5);

    // Vérifier la présence dans le feed (table announcements)
    const { announcements } = await import('../../shared/schema.js');
    const feedItems = await db.select().from(announcements)
      .orderBy(desc(announcements.created_at))
      .limit(10);

    const syncStatus = {
      totalMissions: recentMissions.length,
      totalFeedItems: feedItems.length,
      recentMissions: recentMissions.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        created_at: m.created_at
      })),
      feedItems: feedItems.map(f => ({
        id: f.id,
        title: f.title,
        status: f.status,
        created_at: f.created_at
      })),
      syncHealth: feedItems.length > 0 ? 'OK' : 'WARNING'
    };

    console.log('🔍 Sync status:', syncStatus);
    res.json(syncStatus);
  } catch (error) {
    console.error('❌ Sync verification error:', error);
    res.status(500).json({
      error: 'Sync verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/missions/:id - Get a specific mission with bids
router.get('/:id', async (req, res) => {
  let missionId: string | null = null;
  
  try {
    missionId = req.params.id;
    console.log('🔍 API: Récupération mission ID:', missionId);

    // Skip validation for special endpoints that should be handled elsewhere
    if (missionId === 'debug' || missionId === 'verify-sync' || missionId === 'health') {
      console.log('⚠️ API: Endpoint spécial détecté, ignoré dans cette route:', missionId);
      return res.status(404).json({ error: 'Endpoint non trouvé' });
    }

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('❌ API: Mission ID invalide:', missionId);
      return res.status(400).json({ 
        error: 'Mission ID invalide',
        details: 'L\'ID de mission est requis et ne peut pas être vide'
      });
    }

    // Convert missionId to integer for database query with better validation
    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt) || missionIdInt <= 0 || !Number.isInteger(missionIdInt)) {
      console.error('❌ API: Mission ID n\'est pas un nombre valide:', missionId);
      return res.status(400).json({ 
        error: 'Mission ID doit être un nombre entier valide',
        received: missionId,
        details: 'L\'ID doit être un nombre entier positif'
      });
    }

    // Use simple select() to avoid Drizzle column mapping issues
    const mission = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionIdInt))
      .limit(1);

    if (mission.length === 0) {
      console.error('❌ API: Mission non trouvée:', missionId);
      return res.status(404).json({ 
        error: 'Mission non trouvée',
        missionId: missionIdInt,
        details: 'Aucune mission trouvée avec cet ID'
      });
    }

    // Fix: bids table uses project_id, not missionId
    const bids = await db
      .select()
      .from(bidTable)
      .where(eq(bidTable.project_id, missionIdInt));

    const result = {
      ...mission[0],
      excerpt: generateExcerpt(mission[0].description || '', 200),
      bids: bids || []
    };

    console.log('✅ API: Mission trouvée:', result.title, 'avec', result.bids.length, 'offres');
    res.json(result);
  } catch (error) {
    console.error('❌ API: Erreur récupération mission:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ API: Mission ID demandée:', missionId || 'undefined');
    console.error('❌ API: Type de l\'ID:', typeof missionId);
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      missionId: missionId || 'undefined',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/users/:userId/missions - Get missions for a specific user
router.get('/users/:userId/missions', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('👤 Fetching missions for user:', userId);
    console.log('🔗 Mapping: userId =', userId, '-> user_id filter:', userId);

    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ Invalid user ID:', userId);
      return res.status(400).json({ 
        error: 'User ID invalide',
        details: 'L\'ID utilisateur est requis'
      });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt) || userIdInt <= 0 || !Number.isInteger(userIdInt)) {
      console.error('❌ User ID is not a valid number:', userId);
      return res.status(400).json({ 
        error: 'User ID doit être un nombre entier valide',
        received: userId,
        details: 'L\'ID utilisateur doit être un nombre entier positif'
      });
    }

    console.log('🔍 Querying database: SELECT * FROM missions WHERE user_id =', userIdInt);
    
    // Use simple select() without explicit column mapping to avoid Drizzle errors
    const userMissions = await db
      .select()
      .from(missions)
      .where(eq(missions.user_id, userIdInt))
      .orderBy(desc(missions.created_at));
    
    console.log('📊 Query result: Found', userMissions.length, 'missions with user_id =', userIdInt);
    userMissions.forEach(mission => {
      console.log('   📋 Mission:', mission.id, '| user_id:', mission.user_id, '| title:', mission.title);
    });

    // Transform missions to match frontend interface
    const missionsWithBids = userMissions.map(mission => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt(mission.description || '', 200),
      category: mission.category,
      budget: mission.budget?.toString() || mission.budget_min?.toString() || '0',
      location: mission.location,
      status: mission.status,
      urgency: mission.urgency,
      userId: mission.user_id?.toString(),
      userName: 'Moi', // Since it's the user's own missions
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      deadline: mission.deadline?.toISOString(),
      tags: mission.tags || [],
      requirements: mission.requirements,
      bids: [] // We'll populate this separately if needed
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

// GET /api/users/:userId/bids - Get bids for a specific user
router.get('/users/:userId/bids', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('👤 Fetching bids for user:', userId);

    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ Invalid user ID:', userId);
      return res.status(400).json({ error: 'User ID invalide' });
    }

    // Convert userId to integer for database query
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      console.error('❌ User ID is not a valid number:', userId);
      return res.status(400).json({ error: 'User ID doit être un nombre' });
    }

    const userBids = await db
      .select()
      .from(bidTable)
      .where(eq(bidTable.provider_id, userIdInt))
      .orderBy(desc(bidTable.created_at));
    
    console.log('🔗 Mapping: userId =', userId, '-> provider_id filter:', userIdInt);

    console.log(`👤 Found ${userBids.length} bids for user ${userId}`);
    res.json(userBids);
  } catch (error) {
    console.error('❌ Error fetching user bids:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user bids',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/missions/:id - Update a specific mission
router.put('/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    const updateData = req.body;
    console.log('✏️ API: Modification mission ID:', missionId);
    console.log('✏️ API: Données reçues:', JSON.stringify(updateData, null, 2));

    // Skip special endpoints
    if (missionId === 'debug' || missionId === 'verify-sync') {
      return res.status(404).json({ error: 'Endpoint non trouvé' });
    }

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('❌ API: Mission ID invalide:', missionId);
      return res.status(400).json({ error: 'Mission ID invalide' });
    }

    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt) || missionIdInt <= 0) {
      console.error('❌ API: Mission ID n\'est pas un nombre valide:', missionId);
      return res.status(400).json({ error: 'Mission ID doit être un nombre valide' });
    }

    // Validate required fields
    if (!updateData.title || updateData.title.trim() === '') {
      return res.status(400).json({
        error: 'Le titre est requis',
        field: 'title'
      });
    }

    if (!updateData.description || updateData.description.trim() === '') {
      return res.status(400).json({
        error: 'La description est requise',
        field: 'description'
      });
    }

    // Check if mission exists
    const existingMission = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionIdInt))
      .limit(1);

    if (existingMission.length === 0) {
      console.error('❌ API: Mission non trouvée pour modification:', missionId);
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Prepare update data
    const missionToUpdate = {
      title: updateData.title,
      description: updateData.description,
      category: updateData.category || existingMission[0].category,
      budget: updateData.budget ? parseInt(updateData.budget) : existingMission[0].budget,
      location: updateData.location || existingMission[0].location,
      urgency: updateData.urgency || existingMission[0].urgency,
      status: updateData.status || existingMission[0].status,
      updated_at: new Date(),
      budget_min: updateData.budget_min ? parseInt(updateData.budget_min) : existingMission[0].budget_min,
      budget_max: updateData.budget_max ? parseInt(updateData.budget_max) : existingMission[0].budget_max,
      deadline: updateData.deadline ? new Date(updateData.deadline) : existingMission[0].deadline,
      tags: updateData.tags || existingMission[0].tags,
      requirements: updateData.requirements || existingMission[0].requirements,
    };

    console.log('✏️ API: Données de mise à jour:', JSON.stringify(missionToUpdate, null, 2));

    // Update the mission
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
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/missions/:id - Delete a specific mission
router.delete('/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log('🗑️ API: Suppression mission ID:', missionId);

    // Skip special endpoints
    if (missionId === 'debug' || missionId === 'verify-sync') {
      return res.status(404).json({ error: 'Endpoint non trouvé' });
    }

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('❌ API: Mission ID invalide:', missionId);
      return res.status(400).json({ error: 'Mission ID invalide' });
    }

    // Convert missionId to integer for database query
    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt) || missionIdInt <= 0) {
      console.error('❌ API: Mission ID n\'est pas un nombre valide:', missionId);
      return res.status(400).json({ error: 'Mission ID doit être un nombre valide' });
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

    // Delete associated bids first
    await db.delete(bidTable).where(eq(bidTable.project_id, missionIdInt));
    console.log('✅ API: Offres supprimées pour mission:', missionId);

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
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;