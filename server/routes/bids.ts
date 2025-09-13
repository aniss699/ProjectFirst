import { Request, Response, Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../database.js';
import { bids, missions, users } from '../../shared/schema.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Schema de validation pour créer une candidature
const createBidSchema = z.object({
  mission_id: z.number().int().positive(),
  amount: z.string().min(1), // Amount as string to match schema
  timeline_days: z.number().int().min(1).optional(),
  message: z.string().optional(),
  bid_type: z.enum(['individual', 'team', 'open_team']).default('individual'),
  team_composition: z.any().optional(),
  team_lead_id: z.number().int().positive().optional(),
  open_team_id: z.number().int().positive().optional()
});

// Schema de validation pour mettre à jour une candidature
const updateBidSchema = z.object({
  amount: z.string().min(1).optional(),
  timeline_days: z.number().int().min(1).optional(),
  message: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional(),
  team_composition: z.any().optional()
});

/**
 * POST /api/bids - Créer une candidature
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log('🎯 POST /api/bids - Nouvelle candidature:', { 
      userId: req.user?.id, 
      missionId: req.body.mission_id,
      bidType: req.body.bid_type 
    });

    // Valider les données d'entrée
    const validatedData = createBidSchema.parse(req.body);
    
    // Vérifier que la mission existe et est ouverte
    const [mission] = await db.select()
      .from(missions)
      .where(eq(missions.id, validatedData.mission_id))
      .limit(1);

    if (!mission) {
      return res.status(404).json({
        error: 'Mission not found',
        message: 'La mission spécifiée n\'existe pas'
      });
    }

    if (mission.status !== 'open') {
      return res.status(400).json({
        error: 'Mission not open',
        message: 'Cette mission n\'accepte plus de candidatures'
      });
    }

    // Vérifier que l'utilisateur n'a pas déjà candidaté pour cette mission
    const [existingBid] = await db.select()
      .from(bids)
      .where(
        and(
          eq(bids.mission_id, validatedData.mission_id),
          eq(bids.provider_id, req.user!.id)
        )
      )
      .limit(1);

    if (existingBid) {
      return res.status(409).json({
        error: 'Bid already exists',
        message: 'Vous avez déjà soumis une candidature pour cette mission'
      });
    }

    // Créer la candidature
    const [newBid] = await db.insert(bids).values({
      mission_id: validatedData.mission_id,
      provider_id: req.user!.id,
      amount: validatedData.amount,
      timeline_days: validatedData.timeline_days,
      message: validatedData.message,
      bid_type: validatedData.bid_type,
      team_composition: validatedData.team_composition,
      team_lead_id: validatedData.team_lead_id,
      open_team_id: validatedData.open_team_id,
      status: 'pending'
    }).returning();

    console.log('✅ Candidature créée:', { bidId: newBid.id, amount: newBid.amount });

    res.status(201).json({
      ok: true,
      bid: newBid,
      message: 'Candidature créée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur création candidature:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Données invalides',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la création de la candidature'
    });
  }
});

/**
 * GET /api/bids - Lister les candidatures avec filtres
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { mission_id, provider_id, status, bid_type } = req.query;

    console.log('📋 GET /api/bids - Recherche candidatures:', { 
      mission_id, 
      provider_id, 
      status,
      userId: req.user?.id 
    });

    let query = db.select({
      id: bids.id,
      mission_id: bids.mission_id,
      provider_id: bids.provider_id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      status: bids.status,
      bid_type: bids.bid_type,
      team_composition: bids.team_composition,
      team_lead_id: bids.team_lead_id,
      open_team_id: bids.open_team_id,
      created_at: bids.created_at,
      updated_at: bids.updated_at,
      // Informations du prestataire
      provider_name: users.name,
      provider_rating: users.rating_mean
    })
    .from(bids)
    .leftJoin(users, eq(bids.provider_id, users.id))
    .orderBy(desc(bids.created_at));

    // Appliquer les filtres
    const conditions = [];
    
    if (mission_id) {
      const missionIdNum = parseInt(mission_id as string);
      if (!isNaN(missionIdNum)) {
        conditions.push(eq(bids.mission_id, missionIdNum));
      }
    }

    if (provider_id) {
      const providerIdNum = parseInt(provider_id as string);
      if (!isNaN(providerIdNum)) {
        conditions.push(eq(bids.provider_id, providerIdNum));
      }
    }

    if (status && typeof status === 'string') {
      conditions.push(eq(bids.status, status as any));
    }

    if (bid_type && typeof bid_type === 'string') {
      conditions.push(eq(bids.bid_type, bid_type as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;

    console.log(`✅ ${results.length} candidatures trouvées`);

    res.json({
      ok: true,
      bids: results,
      count: results.length
    });

  } catch (error) {
    console.error('❌ Erreur récupération candidatures:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la récupération des candidatures'
    });
  }
});

/**
 * GET /api/bids/:id - Récupérer une candidature spécifique
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const bidId = parseInt(req.params.id);
    
    if (isNaN(bidId)) {
      return res.status(400).json({
        error: 'Invalid bid ID',
        message: 'ID de candidature invalide'
      });
    }

    console.log('🔍 GET /api/bids/:id - Recherche candidature:', { bidId });

    const [bid] = await db.select({
      id: bids.id,
      mission_id: bids.mission_id,
      provider_id: bids.provider_id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      status: bids.status,
      bid_type: bids.bid_type,
      team_composition: bids.team_composition,
      team_lead_id: bids.team_lead_id,
      open_team_id: bids.open_team_id,
      created_at: bids.created_at,
      updated_at: bids.updated_at,
      // Informations du prestataire
      provider_name: users.name,
      provider_rating: users.rating_mean
    })
    .from(bids)
    .leftJoin(users, eq(bids.provider_id, users.id))
    .where(eq(bids.id, bidId))
    .limit(1);

    if (!bid) {
      return res.status(404).json({
        error: 'Bid not found',
        message: 'Candidature non trouvée'
      });
    }

    console.log('✅ Candidature trouvée:', { bidId: bid.id, amount: bid.amount });

    res.json({
      ok: true,
      bid
    });

  } catch (error) {
    console.error('❌ Erreur récupération candidature:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la récupération de la candidature'
    });
  }
});

/**
 * PUT /api/bids/:id - Mettre à jour une candidature
 */
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const bidId = parseInt(req.params.id);
    
    if (isNaN(bidId)) {
      return res.status(400).json({
        error: 'Invalid bid ID',
        message: 'ID de candidature invalide'
      });
    }

    console.log('✏️ PUT /api/bids/:id - Mise à jour candidature:', { 
      bidId, 
      userId: req.user?.id 
    });

    // Valider les données d'entrée
    const validatedData = updateBidSchema.parse(req.body);

    // Vérifier que la candidature existe et appartient à l'utilisateur
    const [existingBid] = await db.select()
      .from(bids)
      .where(eq(bids.id, bidId))
      .limit(1);

    if (!existingBid) {
      return res.status(404).json({
        error: 'Bid not found',
        message: 'Candidature non trouvée'
      });
    }

    // Vérifier les permissions (propriétaire ou chef d'équipe)
    const canEdit = existingBid.provider_id === req.user!.id || 
                    existingBid.team_lead_id === req.user!.id;

    if (!canEdit) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Vous n\'êtes pas autorisé à modifier cette candidature'
      });
    }

    // Vérifier que la candidature peut être modifiée
    if (existingBid.status === 'accepted' || existingBid.status === 'rejected') {
      return res.status(400).json({
        error: 'Cannot modify bid',
        message: 'Cette candidature ne peut plus être modifiée'
      });
    }

    // Mettre à jour la candidature
    const [updatedBid] = await db.update(bids)
      .set({
        ...validatedData,
        updated_at: new Date()
      })
      .where(eq(bids.id, bidId))
      .returning();

    console.log('✅ Candidature mise à jour:', { bidId: updatedBid.id });

    res.json({
      ok: true,
      bid: updatedBid,
      message: 'Candidature mise à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour candidature:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Données invalides',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la mise à jour de la candidature'
    });
  }
});

/**
 * DELETE /api/bids/:id - Supprimer/Retirer une candidature
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const bidId = parseInt(req.params.id);
    
    if (isNaN(bidId)) {
      return res.status(400).json({
        error: 'Invalid bid ID',
        message: 'ID de candidature invalide'
      });
    }

    console.log('🗑️ DELETE /api/bids/:id - Suppression candidature:', { 
      bidId, 
      userId: req.user?.id 
    });

    // Vérifier que la candidature existe et appartient à l'utilisateur
    const [existingBid] = await db.select()
      .from(bids)
      .where(eq(bids.id, bidId))
      .limit(1);

    if (!existingBid) {
      return res.status(404).json({
        error: 'Bid not found',
        message: 'Candidature non trouvée'
      });
    }

    // Vérifier les permissions
    const canDelete = existingBid.provider_id === req.user!.id || 
                      existingBid.team_lead_id === req.user!.id;

    if (!canDelete) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Vous n\'êtes pas autorisé à supprimer cette candidature'
      });
    }

    // Vérifier que la candidature peut être supprimée
    if (existingBid.status === 'accepted') {
      return res.status(400).json({
        error: 'Cannot delete accepted bid',
        message: 'Une candidature acceptée ne peut pas être supprimée'
      });
    }

    // Marquer comme retirée plutôt que supprimer définitivement
    const [updatedBid] = await db.update(bids)
      .set({
        status: 'withdrawn',
        updated_at: new Date()
      })
      .where(eq(bids.id, bidId))
      .returning();

    console.log('✅ Candidature retirée:', { bidId: updatedBid.id });

    res.json({
      ok: true,
      message: 'Candidature retirée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur suppression candidature:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la suppression de la candidature'
    });
  }
});

export default router;