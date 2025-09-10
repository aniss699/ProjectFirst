
import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../database.js';
import { projects, bids as bidTable } from '../../shared/schema.js';

const router = Router();

// GET /api/projects/users/:userId/projects - Get projects for a specific user
router.get('/users/:userId/projects', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('👤 Fetching projects for user:', userId);

    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ Invalid user ID:', userId);
      return res.status(400).json({ error: 'User ID invalide' });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      console.error('❌ User ID is not a valid number:', userId);
      return res.status(400).json({ error: 'User ID doit être un nombre' });
    }

    console.log('🔍 Querying database: SELECT * FROM projects WHERE client_id =', userIdInt);
    
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.client_id, userIdInt))
      .orderBy(desc(projects.created_at));
    
    console.log('📊 Query result: Found', userProjects.length, 'projects with client_id =', userIdInt);
    userProjects.forEach(project => {
      console.log('   📋 Project:', project.id, '| client_id:', project.client_id, '| title:', project.title);
    });

    console.log(`👤 Found ${userProjects.length} projects for user ${userId}`);
    res.json(userProjects);
  } catch (error) {
    console.error('❌ Error fetching user projects:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/projects/:id - Get a specific project with bids
router.get('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log('🔍 API: Récupération project ID:', projectId);

    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      console.error('❌ API: Project ID invalide:', projectId);
      return res.status(400).json({ error: 'Project ID invalide' });
    }

    const projectIdInt = parseInt(projectId, 10);
    if (isNaN(projectIdInt)) {
      console.error('❌ API: Project ID n\'est pas un nombre valide:', projectId);
      return res.status(400).json({ error: 'Project ID doit être un nombre' });
    }

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectIdInt))
      .limit(1);

    if (project.length === 0) {
      console.error('❌ API: Project non trouvé:', projectId);
      return res.status(404).json({ error: 'Project non trouvé' });
    }

    console.log('✅ API: Project trouvé:', project[0].title);
    res.json(project[0]);
  } catch (error) {
    console.error('❌ API: Erreur récupération project:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// GET /api/projects/:id/bids - Get bids for a specific project
router.get('/:id/bids', async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log('🔍 API: Récupération bids pour project ID:', projectId);

    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      console.error('❌ API: Project ID invalide:', projectId);
      return res.status(400).json({ error: 'Project ID invalide' });
    }

    const projectIdInt = parseInt(projectId, 10);
    if (isNaN(projectIdInt)) {
      console.error('❌ API: Project ID n\'est pas un nombre valide:', projectId);
      return res.status(400).json({ error: 'Project ID doit être un nombre' });
    }

    const bids = await db
      .select()
      .from(bidTable)
      .where(eq(bidTable.project_id, projectIdInt));

    console.log('✅ API: Trouvé', bids.length, 'bids pour project', projectId);
    res.json(bids);
  } catch (error) {
    console.error('❌ API: Erreur récupération bids:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// DELETE /api/projects/:id - Delete a specific project
router.delete('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log('🗑️ API: Suppression project ID:', projectId);

    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      console.error('❌ API: Project ID invalide:', projectId);
      return res.status(400).json({ error: 'Project ID invalide' });
    }

    const projectIdInt = parseInt(projectId, 10);
    if (isNaN(projectIdInt)) {
      console.error('❌ API: Project ID n\'est pas un nombre valide:', projectId);
      return res.status(400).json({ error: 'Project ID doit être un nombre' });
    }

    // Check if project exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectIdInt))
      .limit(1);

    if (existingProject.length === 0) {
      console.error('❌ API: Project non trouvé pour suppression:', projectId);
      return res.status(404).json({ error: 'Project non trouvé' });
    }

    // Delete associated bids first
    await db.delete(bidTable).where(eq(bidTable.project_id, projectIdInt));
    console.log('✅ API: Bids supprimés pour project:', projectId);

    // Delete the project
    const deletedProject = await db
      .delete(projects)
      .where(eq(projects.id, projectIdInt))
      .returning();

    if (deletedProject.length === 0) {
      throw new Error('Échec de la suppression du project');
    }

    console.log('✅ API: Project supprimé avec succès:', projectId);
    res.json({ message: 'Project supprimé avec succès', project: deletedProject[0] });
  } catch (error) {
    console.error('❌ API: Erreur suppression project:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;
