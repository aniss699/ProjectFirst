import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database.js';
import { missions, bids as bidTable } from '../../shared/schema.js';
import { MissionSyncService } from '../services/mission-sync.js'; // Import MissionSyncService

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
      client_id: missionData.client_id || 1,
      // Map additional fields properly
      budget_min: missionData.budget_min ? parseInt(missionData.budget_min) : null,
      budget_max: missionData.budget_max ? parseInt(missionData.budget_max) : null,
      deadline: missionData.deadline ? new Date(missionData.deadline) : null,
      tags: missionData.tags || [],
      requirements: missionData.requirements || null,
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
          budget: insertedMission.budget_min?.toString() || '0',
          location: insertedMission.location || 'Remote',
          status: (insertedMission.status as 'open' | 'in_progress' | 'completed' | 'closed') || 'open',
          clientId: insertedMission.client_id?.toString() || '1',
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
    const allMissions = await db.select().from(missions).orderBy(desc(missions.created_at));
    console.log(`📋 Found ${allMissions.length} missions in database`);

    // Transform missions to include required fields for MissionWithBids type
    const missionsWithBids = allMissions.map(mission => ({
      ...mission,
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

// GET /api/missions/:id - Get a specific mission with bids
router.get('/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log('🔍 API: Récupération mission ID:', missionId);

    if (!missionId || missionId === 'undefined' || missionId === 'null') {
      console.error('❌ API: Mission ID invalide:', missionId);
      return res.status(400).json({ error: 'Mission ID invalide' });
    }

    const mission = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1);

    if (mission.length === 0) {
      console.error('❌ API: Mission non trouvée:', missionId);
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    const bids = await db
      .select()
      .from(bidTable)
      .where(eq(bidTable.missionId, missionId));

    const result = {
      ...mission[0],
      bids: bids || []
    };

    console.log('✅ API: Mission trouvée:', result.title, 'avec', result.bids.length, 'offres');
    res.json(result);
  } catch (error) {
    console.error('❌ API: Erreur récupération mission:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ API: Mission ID demandée:', missionId);
    console.error('❌ API: Type de l\'ID:', typeof missionId);
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      missionId: missionId,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/missions/debug - Diagnostic endpoint
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

export default router;