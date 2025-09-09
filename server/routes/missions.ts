import { Router } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database.js';
import { missions } from '../../shared/schema.js';

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
    
    let newMission;
    try {
      const result = await db.insert(missions).values(missionToInsert).returning();
      newMission = result[0];
      
      if (!newMission) {
        throw new Error('No mission returned from database insert');
      }
      
      console.log('✅ Mission created successfully with ID:', newMission.id);
      console.log('📊 Full mission object:', JSON.stringify(newMission, null, 2));
    } catch (dbError) {
      console.error('❌ Database insertion failed:', dbError);
      console.error('❌ Data that failed to insert:', JSON.stringify(missionToInsert, null, 2));
      throw new Error(`Database insertion failed: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`);
    }

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