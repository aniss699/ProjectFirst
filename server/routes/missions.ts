import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database.js';
import { missions, bids as bidTable } from '../../shared/schema.js';
import { MissionSyncService } from '../services/mission-sync.js';
import { DataConsistencyValidator } from '../services/data-consistency-validator.js';

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

    // Prepare mission data with proper field mapping and validation
    const missionToInsert = {
      title: missionData.title,
      description: missionData.description,
      category: missionData.category || 'developpement',
      // Budget handling - ensure consistency
      budget_value_cents: missionData.budget ? parseInt(missionData.budget) : null,
      currency: missionData.currency || 'EUR',
      // Location fields
      location_raw: missionData.location || null,
      city: missionData.city || null,
      country: missionData.country || 'France',
      remote_allowed: missionData.remote_allowed !== undefined ? missionData.remote_allowed : true,
      // Status and timing
      urgency: missionData.urgency || 'medium',
      status: missionData.status || 'published',
      deadline: missionData.deadline ? new Date(missionData.deadline) : null,
      // User relationships - ensure consistency
      user_id: missionData.userId ? parseInt(missionData.userId) : null,
      client_id: missionData.userId ? parseInt(missionData.userId) : null,
      // Team configuration
      is_team_mission: missionData.is_team_mission || false,
      team_size: missionData.team_size || 1,
      // Metadata
      tags: missionData.tags || [],
      skills_required: missionData.skills_required || missionData.skillsRequired || [],
      requirements: missionData.requirements || null,
      // Timestamps
      created_at: new Date(),
      updated_at: new Date(),
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

      // Validate data consistency
      const validationResult = DataConsistencyValidator.validateAPIToDatabase(missionToInsert, insertedMission);
      if (!validationResult.isValid) {
        console.warn('⚠️ Data consistency issues detected:', validationResult.errors);
      }
      if (validationResult.warnings.length > 0) {
        console.warn('⚠️ Data consistency warnings:', validationResult.warnings);
      }

      res.status(201).json(insertedMission);
    } catch (error) {
      console.error('❌ Database insertion failed:', error);
      console.error('❌ Data that failed to insert:', JSON.stringify(missionToInsert, null, 2));
      // Throw error to be caught by the outer catch block
      throw error;
    }

    // Synchronisation de la mission avec le feed en arrière-plan (non-bloquant)
    setImmediate(async () => {
      try {
        // Utilisation du service de synchronisation des missions
        const missionSync = new MissionSyncService(process.env.DATABASE_URL || 'postgresql://localhost:5432/swideal');
        // Conversion de la mission base de données vers le type Mission du feed
        const missionForFeed = {
          id: insertedMission.id.toString(),
          title: insertedMission.title,
          description: insertedMission.description,
          category: insertedMission.category || 'developpement',
          budget: insertedMission.budget_value_cents?.toString() || '0',
          location: insertedMission.location_raw || 'Remote',
          status: (insertedMission.status as 'open' | 'in_progress' | 'completed' | 'closed') || 'open',
          clientId: insertedMission.user_id?.toString() || '1',
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
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        category: missions.category,
        budget_value_cents: missions.budget_value_cents,
        currency: missions.currency,
        location_raw: missions.location_raw,
        city: missions.city,
        country: missions.country,
        remote_allowed: missions.remote_allowed,
        user_id: missions.user_id,
        client_id: missions.client_id,
        status: missions.status,
        urgency: missions.urgency,
        deadline: missions.deadline,
        tags: missions.tags,
        skills_required: missions.skills_required,
        requirements: missions.requirements,
        is_team_mission: missions.is_team_mission,
        team_size: missions.team_size,
        created_at: missions.created_at,
        updated_at: missions.updated_at
      })
      .from(missions)
      .orderBy(desc(missions.created_at));

    console.log(`📋 Found ${allMissions.length} missions in database`);

    // Transform missions to include required fields for MissionWithBids type
    const missionsWithBids = allMissions.map(mission => ({
      ...mission,
      excerpt: generateExcerpt(mission.description || '', 200),
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      clientName: 'Client anonyme', // Default client name
      bids: [], // Empty bids array for now
      // Ensure budget consistency
      budget: mission.budget_value_cents?.toString() || '0',
      // Ensure location consistency
      location: mission.location_raw || mission.city || 'Remote'
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
    const testQuery = await db.select({ id: missions.id }).from(missions).limit(1);

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
    const recentMissions = await db.select({
      id: missions.id,
      title: missions.title,
      description: missions.description,
      category: missions.category,
      budget_value_cents: missions.budget_value_cents,
      budget_min_cents: missions.budget_min_cents,
      budget_max_cents: missions.budget_max_cents,
      currency: missions.currency,
      location_raw: missions.location_raw,
      city: missions.city,
      country: missions.country,
      remote_allowed: missions.remote_allowed,
      user_id: missions.user_id,
      client_id: missions.client_id,
      status: missions.status,
      urgency: missions.urgency,
      deadline: missions.deadline,
      tags: missions.tags,
      skills_required: missions.skills_required,
      requirements: missions.requirements,
      is_team_mission: missions.is_team_mission,
      team_size: missions.team_size,
      created_at: missions.created_at,
      updated_at: missions.updated_at
    })
      .from(missions)
      .orderBy(desc(missions.created_at))
      .limit(5);

    // Vérifier la présence dans le feed (table announcements)
    const { announcements } = await import('../../shared/schema.js');
    const feedItems = await db.select({
      id: announcements.id,
      title: announcements.title,
      description: announcements.description,
      category: announcements.category,
      budget_value_cents: announcements.budget_value_cents,
      budget_min_cents: announcements.budget_min_cents,
      budget_max_cents: announcements.budget_max_cents,
      currency: announcements.currency,
      location_raw: announcements.location_raw,
      city: announcements.city,
      country: announcements.country,
      remote_allowed: announcements.remote_allowed,
      user_id: announcements.user_id,
      client_id: announcements.client_id,
      status: announcements.status,
      urgency: announcements.urgency,
      deadline: announcements.deadline,
      tags: announcements.tags,
      skills_required: announcements.skills_required,
      requirements: announcements.requirements,
      is_team_mission: announcements.is_team_mission,
      team_size: announcements.team_size,
      created_at: announcements.created_at,
      updated_at: announcements.updated_at
    })
      .from(announcements)
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
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        category: missions.category,
        budget_value_cents: missions.budget_value_cents,
        currency: missions.currency,
        location_raw: missions.location_raw,
        city: missions.city,
        country: missions.country,
        remote_allowed: missions.remote_allowed,
        user_id: missions.user_id,
        client_id: missions.client_id,
        status: missions.status,
        urgency: missions.urgency,
        deadline: missions.deadline,
        tags: missions.tags,
        skills_required: missions.skills_required,
        requirements: missions.requirements,
        is_team_mission: missions.is_team_mission,
        team_size: missions.team_size,
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
        missionId: missionIdInt,
        details: 'Aucune mission trouvée avec cet ID'
      });
    }

    // Fix: bids table uses project_id, not mission_id
    const bids = await db
      .select()
      .from(bidTable)
      .where(eq(bidTable.project_id, missionIdInt));

    const result = {
      ...mission[0],
      excerpt: generateExcerpt(mission[0].description || '', 200),
      bids: bids || [],
      // Ensure consistent budget format for frontend
      budget: mission[0].budget_value_cents?.toString() || '0',
      // Ensure consistent location format
      location: mission[0].location_raw || mission[0].city || 'Remote',
      // Ensure consistent timestamps
      createdAt: mission[0].created_at?.toISOString() || new Date().toISOString(),
      updatedAt: mission[0].updated_at?.toISOString()
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
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        category: missions.category,
        budget_value_cents: missions.budget_value_cents,
        currency: missions.currency,
        location_raw: missions.location_raw,
        city: missions.city,
        country: missions.country,
        remote_allowed: missions.remote_allowed,
        user_id: missions.user_id,
        client_id: missions.client_id,
        status: missions.status,
        urgency: missions.urgency,
        deadline: missions.deadline,
        tags: missions.tags,
        skills_required: missions.skills_required,
        requirements: missions.requirements,
        is_team_mission: missions.is_team_mission,
        team_size: missions.team_size,
        created_at: missions.created_at,
        updated_at: missions.updated_at
      })
      .from(missions)
      .where(eq(missions.user_id, userIdInt))
      .orderBy(desc(missions.created_at));

    console.log('📊 Query result: Found', userMissions.length, 'missions with user_id =', userIdInt);
    userMissions.forEach(mission => {
      console.log('   📋 Mission:', mission.id, '| user_id:', mission.user_id, '| title:', mission.title);
    });

    // Transform missions to match frontend interface with full consistency
    const missionsWithBids = userMissions.map(mission => ({
      // Core fields - ensure exact mapping
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt(mission.description || '', 200),
      category: mission.category,
      // Budget - maintain consistency with database values
      budget_value_cents: mission.budget_value_cents,
      budget: mission.budget_value_cents?.toString() || '0',
      currency: mission.currency,
      // Location - full structure
      location_raw: mission.location_raw,
      location: mission.location_raw || mission.city || 'Remote',
      city: mission.city,
      country: mission.country,
      remote_allowed: mission.remote_allowed,
      // Status and metadata
      status: mission.status,
      urgency: mission.urgency,
      // User relationships - preserve exact values
      user_id: mission.user_id,
      client_id: mission.client_id,
      userId: mission.user_id?.toString(),
      clientName: 'Moi', // Consistent with API format
      // Team configuration
      is_team_mission: mission.is_team_mission,
      team_size: mission.team_size,
      // Timestamps - consistent formatting
      created_at: mission.created_at,
      updated_at: mission.updated_at,
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      deadline: mission.deadline?.toISOString(),
      // Arrays and metadata
      tags: mission.tags || [],
      skills_required: mission.skills_required || [],
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

    // Check if mission exists - select only id for existence check
    const existingMission = await db
      .select({ id: missions.id })
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
      budget_value_cents: updateData.budget ? parseInt(updateData.budget) : null,
      location_raw: updateData.location || null,
      urgency: updateData.urgency || 'medium',
      status: updateData.status || 'published',
      updated_at: new Date(),
      deadline: updateData.deadline ? new Date(updateData.deadline) : existingMission[0].deadline,
      tags: updateData.tags || existingMission[0].tags,
      requirements: updateData.requirements || existingMission[0].requirements,
      currency: updateData.currency || existingMission[0].currency,
      city: updateData.city || existingMission[0].city,
      country: updateData.country || existingMission[0].country,
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

    // Check if mission exists - select only id for existence check
    const existingMission = await db
      .select({ id: missions.id })
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