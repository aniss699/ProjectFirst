import express from 'express';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users, missions, offers } from '../shared/schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

const router = express.Router();

// Get all demo providers
router.get('/demo-providers', async (req, res) => {
  try {
    const providers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      rating_mean: users.rating_mean,
      rating_count: users.rating_count,
      profile_data: users.profile_data,
      created_at: users.created_at
    })
    .from(users)
    .where(eq(users.role, 'PRO'));

    res.json({ providers });
  } catch (error) {
    console.error('Erreur get demo providers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all demo missions
router.get('/demo-missions', async (req, res) => {
  try {
    const missionsWithClients = await db
      .select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        budget: missions.budget,
        category: missions.category,
        location: missions.location,
        status: missions.status,
        created_at: missions.created_at,
        client_name: users.name,
        client_email: users.email
      })
      .from(missions)
      .leftJoin(users, eq(missions.user_id, users.id));

    res.json({ missions: missionsWithClients });
  } catch (error) {
    console.error('Erreur get demo missions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all demo offers with mission and provider info
router.get('/demo-offers', async (req, res) => {
  try {
    const offersWithInfo = await db
      .select({
        id: offers.id,
        amount: offers.amount,
        message: offers.message,
        status: offers.status,
        created_at: offers.created_at,
        mission_title: missions.title,
        mission_budget: missions.budget,
        provider_name: users.name,
        provider_email: users.email
      })
      .from(offers)
      .leftJoin(missions, eq(offers.mission_id, missions.id))
      .leftJoin(users, eq(offers.user_id, users.id));

    res.json({ offers: offersWithInfo });
  } catch (error) {
    console.error('Erreur get demo offers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get provider profile by ID
router.get('/provider/:id', async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    
    const provider = await db.select().from(users).where(eq(users.id, providerId)).limit(1);
    
    if (provider.length === 0) {
      return res.status(404).json({ error: 'Prestataire non trouvé' });
    }

    const providerData = provider[0];
    
    // Get provider's offers
    const providerOffers = await db
      .select({
        id: offers.id,
        amount: offers.amount,
        message: offers.message,
        status: offers.status,
        created_at: offers.created_at,
        mission_title: missions.title,
        mission_budget: missions.budget
      })
      .from(offers)
      .leftJoin(missions, eq(offers.mission_id, missions.id))
      .where(eq(offers.user_id, providerId));

    res.json({ 
      provider: {
        id: providerData.id,
        email: providerData.email,
        name: providerData.name,
        role: providerData.role,
        rating_mean: providerData.rating_mean,
        rating_count: providerData.rating_count,
        profile_data: providerData.profile_data,
        created_at: providerData.created_at,
        offers: providerOffers
      }
    });

  } catch (error) {
    console.error('Erreur get provider:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get AI analysis demo data
router.get('/ai-analysis-demo', async (req, res) => {
  try {
    const recentMissions = await db.select({
      id: missions.id,
      title: missions.title,
      description: missions.description,
      budget: missions.budget,
      category: missions.category,
      created_at: missions.created_at
    })
    .from(missions)
    .limit(3);

    const recentOffers = await db.select({
      id: offers.id,
      amount: offers.amount,
      message: offers.message,
      status: offers.status,
      created_at: offers.created_at
    })
    .from(offers)
    .limit(5);

    // Generate AI analysis data based on real missions
    const aiAnalysis = {
      totalMissions: recentMissions.length,
      totalOffers: recentOffers.length,
      averageMissionBudget: recentMissions.reduce((sum, m) => {
        return sum + (m.budget || 0);
      }, 0) / recentMissions.length || 0,
      popularCategories: Array.from(new Set(recentMissions.map(m => m.category))),
      averageOfferAmount: recentOffers.reduce((sum, o) => sum + (o.amount || 0), 0) / recentOffers.length || 0,
      successRate: 0.87,
      timeToMatch: 2.3, // days
      missions: recentMissions,
      offers: recentOffers
    };

    res.json({ analysis: aiAnalysis });

  } catch (error) {
    console.error('Erreur get AI analysis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;