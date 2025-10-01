
import { Router } from 'express';
import { db } from '../database.js';
import { reviews, reviewHelpful, users, missions, bids } from '../../shared/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

// POST /api/reviews - Créer une review
router.post('/', async (req, res) => {
  try {
    const { mission_id, reviewee_id, rating, comment, criteria } = req.body;
    const reviewer_id = req.user?.id;

    if (!reviewer_id) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Vérifications
    const mission = await db.query.missions.findFirst({
      where: eq(missions.id, mission_id),
      with: { bids: true }
    });

    if (!mission || mission.status !== 'completed') {
      return res.status(400).json({ error: 'Mission non terminée' });
    }

    // Vérifier qu'une seule review par mission et reviewer
    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.mission_id, mission_id),
        eq(reviews.reviewer_id, reviewer_id)
      )
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Review déjà créée' });
    }

    // Créer la review
    const [newReview] = await db.insert(reviews).values({
      mission_id,
      reviewer_id,
      reviewee_id,
      rating,
      comment,
      criteria: criteria || {}
    }).returning();

    // Mettre à jour le rating moyen de l'utilisateur
    await updateUserRating(reviewee_id);

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Erreur création review:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/reviews/user/:userId - Reviews d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const userReviews = await db.query.reviews.findMany({
      where: eq(reviews.reviewee_id, userId),
      with: {
        reviewer: {
          columns: { id: true, name: true, avatar_url: true }
        },
        mission: {
          columns: { id: true, title: true }
        }
      },
      orderBy: [desc(reviews.created_at)]
    });

    res.json(userReviews);
  } catch (error) {
    console.error('Erreur récupération reviews:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/reviews/mission/:missionId - Reviews d'une mission
router.get('/mission/:missionId', async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId);
    
    const missionReviews = await db.query.reviews.findMany({
      where: eq(reviews.mission_id, missionId),
      with: {
        reviewer: {
          columns: { id: true, name: true, avatar_url: true }
        },
        reviewee: {
          columns: { id: true, name: true, avatar_url: true }
        }
      },
      orderBy: [desc(reviews.created_at)]
    });

    res.json(missionReviews);
  } catch (error) {
    console.error('Erreur récupération reviews mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/reviews/:id/helpful - Marquer comme utile
router.post('/:id/helpful', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Vérifier si déjà marqué comme utile
    const existing = await db.query.reviewHelpful.findFirst({
      where: and(
        eq(reviewHelpful.review_id, reviewId),
        eq(reviewHelpful.user_id, userId)
      )
    });

    if (existing) {
      // Supprimer le marquage
      await db.delete(reviewHelpful).where(eq(reviewHelpful.id, existing.id));
      await db.update(reviews)
        .set({ helpful_count: sql`${reviews.helpful_count} - 1` })
        .where(eq(reviews.id, reviewId));
    } else {
      // Ajouter le marquage
      await db.insert(reviewHelpful).values({
        review_id: reviewId,
        user_id: userId
      });
      await db.update(reviews)
        .set({ helpful_count: sql`${reviews.helpful_count} + 1` })
        .where(eq(reviews.id, reviewId));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur marquage helpful:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/reviews/:id/response - Répondre à une review (prestataire)
router.post('/:id/response', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { response } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Vérifier que l'utilisateur est le reviewee
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId)
    });

    if (!review || review.reviewee_id !== userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await db.update(reviews)
      .set({ response, updated_at: new Date() })
      .where(eq(reviews.id, reviewId));

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur réponse review:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour mettre à jour le rating
async function updateUserRating(userId: number) {
  const userReviews = await db.query.reviews.findMany({
    where: eq(reviews.reviewee_id, userId)
  });

  if (userReviews.length > 0) {
    const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / userReviews.length;

    await db.update(users)
      .set({ 
        rating_mean: Math.round(averageRating * 10) / 10,
        rating_count: userReviews.length
      })
      .where(eq(users.id, userId));
  }
}

export default router;
