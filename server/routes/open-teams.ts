import { Router, Request, Response } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../database.js';
import { openTeams, missions, users, bids } from '../../shared/schema.js';
import { insertOpenTeamSchema } from '../../shared/schema.js';
import { randomUUID } from 'crypto';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Error wrapper for async routes
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /api/open-teams - Create new open team
router.post('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const requestId = randomUUID();
  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    request_id: requestId,
    action: 'open_team_create_start',
    body_size: JSON.stringify(req.body).length
  }));

  try {
    // Validation avec le schéma Zod
    const validatedData = insertOpenTeamSchema.parse(req.body);
    
    // Vérifier que la mission existe
    const missionExists = await db.select().from(missions).where(eq(missions.id, validatedData.mission_id));
    if (missionExists.length === 0) {
      return res.status(404).json({
        error: 'Mission introuvable',
        request_id: requestId
      });
    }

    // L'utilisateur est déjà vérifié par le middleware d'authentification

    // Créer l'équipe ouverte
    const [newTeam] = await db.insert(openTeams).values({
      mission_id: validatedData.mission_id,
      name: validatedData.name,
      description: validatedData.description,
      creator_id: req.user!.id,
      estimated_budget: validatedData.estimated_budget,
      estimated_timeline_days: validatedData.estimated_timeline_days,
      members: validatedData.members,
      required_roles: validatedData.required_roles,
      max_members: validatedData.max_members,
      status: validatedData.status || 'recruiting',
      visibility: validatedData.visibility || 'public',
      auto_accept: validatedData.auto_accept !== undefined ? validatedData.auto_accept : true
    }).returning();

    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      request_id: requestId,
      action: 'open_team_created',
      team_id: newTeam.id,
      team_name: newTeam.name
    }));

    res.status(201).json({
      success: true,
      team: newTeam,
      request_id: requestId
    });

  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      request_id: requestId,
      action: 'open_team_create_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }));

    if (error instanceof Error && error.message.includes('validation')) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.message,
        request_id: requestId
      });
    }

    res.status(500).json({
      error: 'Erreur serveur',
      request_id: requestId
    });
  }
}));

// GET /api/open-teams - List open teams for a mission
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const missionId = req.query.mission_id;
  
  try {
    // Construire les conditions de filtrage
    const whereConditions = [eq(openTeams.visibility, 'public')];
    
    // Filtrer par mission si spécifié
    if (missionId && !isNaN(parseInt(missionId as string))) {
      whereConditions.push(eq(openTeams.mission_id, parseInt(missionId as string)));
    }

    const teams = await db.select({
      id: openTeams.id,
      mission_id: openTeams.mission_id,
      name: openTeams.name,
      description: openTeams.description,
      creator_id: openTeams.creator_id,
      estimated_budget: openTeams.estimated_budget,
      estimated_timeline_days: openTeams.estimated_timeline_days,
      members: openTeams.members,
      required_roles: openTeams.required_roles,
      max_members: openTeams.max_members,
      status: openTeams.status,
      visibility: openTeams.visibility,
      auto_accept: openTeams.auto_accept,
      created_at: openTeams.created_at,
      // Informations du créateur
      creator_name: users.name,
      creator_email: users.email,
      creator_rating: users.rating_mean,
      // Informations de la mission
      mission_title: missions.title,
      mission_budget: missions.budget_value_cents
    })
    .from(openTeams)
    .leftJoin(users, eq(openTeams.creator_id, users.id))
    .leftJoin(missions, eq(openTeams.mission_id, missions.id))
    .where(and(...whereConditions))
    .orderBy(desc(openTeams.created_at));

    res.json({
      success: true,
      teams: teams.map(team => ({
        ...team,
        members_count: team.members ? (team.members as any).length : 0,
        required_roles_count: team.required_roles ? (team.required_roles as any).length : 0
      }))
    });

  } catch (error) {
    console.error('Erreur get open teams:', error);
    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
}));

// GET /api/open-teams/:id - Get specific open team details
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const teamId = parseInt(req.params.id);
  
  if (isNaN(teamId)) {
    return res.status(400).json({
      error: 'ID d\'équipe invalide'
    });
  }

  try {
    const [team] = await db.select({
      id: openTeams.id,
      mission_id: openTeams.mission_id,
      name: openTeams.name,
      description: openTeams.description,
      creator_id: openTeams.creator_id,
      estimated_budget: openTeams.estimated_budget,
      estimated_timeline_days: openTeams.estimated_timeline_days,
      members: openTeams.members,
      required_roles: openTeams.required_roles,
      max_members: openTeams.max_members,
      status: openTeams.status,
      visibility: openTeams.visibility,
      auto_accept: openTeams.auto_accept,
      created_at: openTeams.created_at,
      updated_at: openTeams.updated_at,
      // Informations du créateur
      creator_name: users.name,
      creator_email: users.email,
      creator_rating: users.rating_mean,
      // Informations de la mission
      mission_title: missions.title,
      mission_description: missions.description,
      mission_budget: missions.budget_value_cents,
      mission_status: missions.status
    })
    .from(openTeams)
    .leftJoin(users, eq(openTeams.creator_id, users.id))
    .leftJoin(missions, eq(openTeams.mission_id, missions.id))
    .where(eq(openTeams.id, teamId));

    if (!team) {
      return res.status(404).json({
        error: 'Équipe introuvable'
      });
    }

    // Si l'équipe est privée, vérifier les droits d'accès (optionnel pour l'instant)
    if (team.visibility === 'private') {
      // TODO: Ajouter la vérification des permissions si nécessaire
    }

    res.json({
      success: true,
      team: {
        ...team,
        members_count: team.members ? (team.members as any).length : 0,
        required_roles_count: team.required_roles ? (team.required_roles as any).length : 0,
        is_full: team.members ? (team.members as any).length >= (team.max_members || Number.MAX_SAFE_INTEGER) : false
      }
    });

  } catch (error) {
    console.error('Erreur get open team details:', error);
    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
}));

// POST /api/open-teams/:id/join - Join an open team
router.post('/:id/join', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const teamId = parseInt(req.params.id);
  const { role, experience_years } = req.body;
  const user_id = req.user!.id; // Use authenticated user ID
  const requestId = randomUUID();
  
  if (isNaN(teamId)) {
    return res.status(400).json({
      error: 'ID d\'équipe invalide'
    });
  }

  try {
    // Vérifier que l'équipe existe et est ouverte au recrutement
    const [team] = await db.select().from(openTeams).where(eq(openTeams.id, teamId));
    
    if (!team) {
      return res.status(404).json({
        error: 'Équipe introuvable',
        request_id: requestId
      });
    }

    if (team.status !== 'recruiting') {
      return res.status(400).json({
        error: 'Cette équipe n\'est plus ouverte au recrutement',
        request_id: requestId
      });
    }

    // L'utilisateur est déjà vérifié par le middleware d'authentification
    const user = req.user!; // Utilisateur authentifié

    // Vérifier si l'utilisateur n'est pas déjà membre
    const currentMembers = team.members as any[] || [];
    const isAlreadyMember = currentMembers.some(member => member.user_id === user_id);
    
    if (isAlreadyMember) {
      return res.status(400).json({
        error: 'Vous êtes déjà membre de cette équipe',
        request_id: requestId
      });
    }

    // Vérifier si l'équipe n'est pas pleine
    if (team.max_members && currentMembers.length >= team.max_members) {
      return res.status(400).json({
        error: 'Cette équipe est complète',
        request_id: requestId
      });
    }

    // Ajouter le nouveau membre
    const newMember = {
      user_id: user_id,
      name: req.user!.name,
      role: role || 'Membre',
      experience_years: experience_years || 1,
      rating: parseFloat(req.user!.rating_mean || '4.0'),
      joined_at: new Date().toISOString()
    };

    const updatedMembers = [...currentMembers, newMember];

    // Mettre à jour l'équipe
    const [updatedTeam] = await db.update(openTeams)
      .set({
        members: updatedMembers,
        updated_at: new Date()
      })
      .where(eq(openTeams.id, teamId))
      .returning();

    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      request_id: requestId,
      action: 'user_joined_open_team',
      team_id: teamId,
      user_id: user_id,
      new_member_count: updatedMembers.length
    }));

    res.json({
      success: true,
      message: 'Vous avez rejoint l\'équipe avec succès',
      team: updatedTeam,
      new_member: newMember,
      request_id: requestId
    });

  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      request_id: requestId,
      action: 'join_open_team_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }));

    res.status(500).json({
      error: 'Erreur serveur',
      request_id: requestId
    });
  }
}));

// PUT /api/open-teams/:id - Update open team (only by creator)
router.put('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const teamId = parseInt(req.params.id);
  // creator_id comes from authenticated user, not request body
  
  if (isNaN(teamId)) {
    return res.status(400).json({
      error: 'ID d\'équipe invalide'
    });
  }

  try {
    // Vérifier que l'équipe existe et que l'utilisateur est le créateur
    const [team] = await db.select().from(openTeams).where(eq(openTeams.id, teamId));
    
    if (!team) {
      return res.status(404).json({
        error: 'Équipe introuvable'
      });
    }

    if (team.creator_id !== req.user!.id) {
      return res.status(403).json({
        error: 'Seul le créateur peut modifier cette équipe'
      });
    }

    // Mettre à jour les champs autorisés
    const allowedUpdates = {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      visibility: req.body.visibility,
      auto_accept: req.body.auto_accept,
      max_members: req.body.max_members,
      required_roles: req.body.required_roles,
      updated_at: new Date()
    };

    // Filtrer les champs non définis
    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );

    const [updatedTeam] = await db.update(openTeams)
      .set(updates)
      .where(eq(openTeams.id, teamId))
      .returning();

    res.json({
      success: true,
      team: updatedTeam
    });

  } catch (error) {
    console.error('Erreur update open team:', error);
    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
}));

// DELETE /api/open-teams/:id - Delete open team (only by creator)
router.delete('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const teamId = parseInt(req.params.id);
  // creator_id comes from authenticated user, not request body
  
  if (isNaN(teamId)) {
    return res.status(400).json({
      error: 'ID d\'équipe invalide'
    });
  }

  try {
    // Vérifier que l'équipe existe et que l'utilisateur est le créateur
    const [team] = await db.select().from(openTeams).where(eq(openTeams.id, teamId));
    
    if (!team) {
      return res.status(404).json({
        error: 'Équipe introuvable'
      });
    }

    if (team.creator_id !== req.user!.id) {
      return res.status(403).json({
        error: 'Seul le créateur peut supprimer cette équipe'
      });
    }

    // Supprimer l'équipe
    await db.delete(openTeams).where(eq(openTeams.id, teamId));

    res.json({
      success: true,
      message: 'Équipe supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur delete open team:', error);
    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
}));

export default router;