import express from 'express';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users, projects, bids } from '../shared/schema.js';

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

// Get all demo projects
router.get('/demo-projects', async (req, res) => {
  try {
    const projectsWithClients = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        budget: projects.budget,
        category: projects.category,
        quality_target: projects.quality_target,
        status: projects.status,
        created_at: projects.created_at,
        client_name: users.name,
        client_email: users.email
      })
      .from(projects)
      .leftJoin(users, eq(projects.client_id, users.id));

    res.json({ projects: projectsWithClients });
  } catch (error) {
    console.error('Erreur get demo projects:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all demo bids with project and provider info
router.get('/demo-bids', async (req, res) => {
  try {
    const bidsWithInfo = await db
      .select({
        id: bids.id,
        amount: bids.amount,
        timeline_days: bids.timeline_days,
        message: bids.message,
        score_breakdown: bids.score_breakdown,
        is_leading: bids.is_leading,
        created_at: bids.created_at,
        project_title: projects.title,
        project_budget: projects.budget,
        provider_name: users.name,
        provider_email: users.email,
        provider_profile: users.profile_data
      })
      .from(bids)
      .leftJoin(projects, eq(bids.project_id, projects.id))
      .leftJoin(users, eq(bids.provider_id, users.id));

    res.json({ bids: bidsWithInfo });
  } catch (error) {
    console.error('Erreur get demo bids:', error);
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
    
    // Get provider's bids
    const providerBids = await db
      .select({
        id: bids.id,
        amount: bids.amount,
        timeline_days: bids.timeline_days,
        message: bids.message,
        is_leading: bids.is_leading,
        created_at: bids.created_at,
        project_title: projects.title,
        project_budget: projects.budget
      })
      .from(bids)
      .leftJoin(projects, eq(bids.project_id, projects.id))
      .where(eq(bids.provider_id, providerId));

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
        bids: providerBids
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
    const recentProjects = await db.select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      budget: projects.budget,
      category: projects.category,
      created_at: projects.created_at
    })
    .from(projects)
    .limit(3);

    const recentBids = await db.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      score_breakdown: bids.score_breakdown,
      created_at: bids.created_at
    })
    .from(bids)
    .limit(5);

    // Generate AI analysis data based on real projects
    const aiAnalysis = {
      totalProjects: recentProjects.length,
      totalBids: recentBids.length,
      averageProjectBudget: recentProjects.reduce((sum, p) => {
        const budgetRange = p.budget?.split('-') || ['0'];
        const avgBudget = budgetRange.length > 1 
          ? (parseInt(budgetRange[0]) + parseInt(budgetRange[1])) / 2
          : parseInt(budgetRange[0]) || 0;
        return sum + avgBudget;
      }, 0) / recentProjects.length || 0,
      popularCategories: Array.from(new Set(recentProjects.map(p => p.category))),
      averageBidAmount: recentBids.reduce((sum, b) => sum + parseFloat(b.amount || '0'), 0) / recentBids.length || 0,
      successRate: 0.87,
      timeToMatch: 2.3, // days
      projects: recentProjects,
      bids: recentBids
    };

    res.json({ analysis: aiAnalysis });

  } catch (error) {
    console.error('Erreur get AI analysis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;