import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../index.js';
import { missions } from '../../shared/schema.js';

const router = Router();

// POST /api/missions - Create new mission
router.post('/', async (req, res) => {
  try {
    const missionData = req.body;
    console.log('📝 Mission creation request received:', JSON.stringify(missionData, null, 2));

    // Validate required fields
    if (!missionData.title) {
      console.error('❌ Validation failed: Missing title');
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!missionData.description) {
      console.error('❌ Validation failed: Missing description');
      return res.status(400).json({ error: 'Description is required' });
    }

    // Prepare mission data with defaults
    const missionToInsert = {
      ...missionData,
      status: missionData.status || 'published', // Default to published
      created_at: new Date(),
      updated_at: new Date(),
      client_id: missionData.client_id || 1, // Default client for demo
    };

    console.log('📤 Inserting mission with data:', JSON.stringify(missionToInsert, null, 2));

    // Insert mission into database
    const [newMission] = await db.insert(missions).values(missionToInsert).returning();

    console.log('✅ Mission created successfully with ID:', newMission.id);
    console.log('📊 Full mission object:', JSON.stringify(newMission, null, 2));

    // Verify the mission was actually saved
    const savedMission = await db.select().from(missions).where(eq(missions.id, newMission.id)).limit(1);
    console.log('🔍 Verification - Mission in DB:', savedMission.length > 0 ? 'Found' : 'NOT FOUND');

    res.status(201).json(newMission);
  } catch (error) {
    console.error('❌ Error creating mission:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Failed to create mission',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/missions - Get all missions
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all missions...');
    const allMissions = await db.select().from(missions).orderBy(desc(missions.created_at));
    console.log(`📋 Found ${allMissions.length} missions in database`);
    console.log('📋 Missions:', allMissions.map(m => ({ id: m.id, title: m.title, status: m.status })));
    res.json(allMissions);
  } catch (error) {
    console.error('❌ Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

export default router;