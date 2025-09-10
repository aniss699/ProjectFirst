import express from 'express';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq, and, not, inArray, sql } from 'drizzle-orm';
import { announcements, feedFeedback, feedSeen, insertFeedFeedbackSchema } from '../../shared/schema.js';
import { FeedRanker } from '../services/feedRanker.js';
import { z } from 'zod';

const router = express.Router();

// Configuration de la base de données
const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

// Cache simple pour les benchmarks de prix
const priceBenchmarkCache = new Map();

/**
 * GET /api/feed - Récupère le feed personnalisé avec pagination
 */
router.get('/feed', async (req, res) => {
  try {
    const { cursor, limit = '10', userId } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 50);
    
    // Récupérer les annonces vues par l'utilisateur (dernières 24h)
    const seenAnnouncements = userId ? await db
      .select({ announcement_id: feedSeen.announcement_id })
      .from(feedSeen)
      .where(
        and(
          eq(feedSeen.user_id, parseInt(userId as string)),
          // Filtrer les 24 dernières heures
        )
      ) : [];
    
    const seenIds = seenAnnouncements.map(s => s.announcement_id);
    
    // Construire les conditions de base
    let whereConditions = [eq(announcements.status, 'active')];
    
    // Exclure les annonces déjà vues
    if (seenIds.length > 0) {
      whereConditions.push(not(inArray(announcements.id, seenIds)));
    }
    
    // Gestion du cursor pour la pagination
    if (cursor) {
      const cursorId = parseInt(cursor as string);
      whereConditions.push(sql`${announcements.id} < ${cursorId}`);
    }
    
    // Récupérer les annonces actives
    const query = db
      .select()
      .from(announcements)
      .where(and(...whereConditions));
    
    const rawAnnouncements = await query
      .orderBy(desc(announcements.created_at))
      .limit(limitNum + 5); // +5 pour avoir de la marge pour les sponsorisées
    
    // Initialiser le ranker avec les annonces vues
    const ranker = new FeedRanker(seenIds);
    
    // TODO: Récupérer le profil utilisateur pour la personnalisation
    const userProfile = userId ? {} : undefined;
    
    // Classer les annonces
    const rankedAnnouncements = ranker.rankAnnouncements(rawAnnouncements, userProfile);
    
    // Récupérer les annonces sponsorisées
    const sponsoredAnnouncements = await db
      .select()
      .from(announcements)
      .where(and(
        eq(announcements.sponsored, true),
        eq(announcements.status, 'active')
      ))
      .limit(3);
    
    // Insérer les slots sponsorisés
    const finalAnnouncements = ranker.insertSponsoredSlots(
      rankedAnnouncements.slice(0, limitNum),
      sponsoredAnnouncements,
      5
    );
    
    // Générer le cursor pour la pagination suivante
    const nextCursor = finalAnnouncements.length > 0 
      ? finalAnnouncements[finalAnnouncements.length - 1].id.toString()
      : null;
    
    res.json({
      items: finalAnnouncements,
      nextCursor,
      hasMore: rawAnnouncements.length > limitNum
    });
    
  } catch (error) {
    console.error('Erreur récupération feed:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du feed' });
  }
});

/**
 * POST /api/feed/feedback - Enregistre le feedback utilisateur
 */
router.post('/feedback', async (req, res) => {
  try {
    // Valider les données
    const feedbackData = insertFeedFeedbackSchema.parse(req.body);
    
    // Insérer le feedback
    await db.insert(feedFeedback).values(feedbackData);
    
    // Marquer comme vu si ce n'est pas déjà fait
    if (feedbackData.action !== 'view') {
      await db
        .insert(feedSeen)
        .values({
          user_id: feedbackData.user_id,
          announcement_id: feedbackData.announcement_id
        })
        .onConflictDoNothing();
    }
    
    // Apprendre du feedback (optionnel)
    const ranker = new FeedRanker();
    ranker.learnFromFeedback(
      feedbackData.announcement_id, 
      feedbackData.action, 
      feedbackData.dwell_ms ?? 0
    );
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Erreur enregistrement feedback:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du feedback' });
  }
});

/**
 * GET /api/price-benchmark - Calcule les benchmarks de prix par catégorie
 */
router.get('/price-benchmark', async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Catégorie requise' });
    }
    
    // Vérifier le cache
    const cacheKey = `benchmark_${category}`;
    if (priceBenchmarkCache.has(cacheKey)) {
      const cached = priceBenchmarkCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 heure
        return res.json(cached.data);
      }
    }
    
    // Calculer les benchmarks
    const prices = await db
      .select({
        budget_min: announcements.budget_min,
        budget_max: announcements.budget_max
      })
      .from(announcements)
      .where(and(
        eq(announcements.category, category as string),
        eq(announcements.status, 'active')
      ));
    
    // Extraire les valeurs numériques
    const budgetValues: number[] = [];
    prices.forEach(p => {
      if (p.budget_min) budgetValues.push(parseFloat(p.budget_min as string));
      if (p.budget_max) budgetValues.push(parseFloat(p.budget_max as string));
    });
    
    if (budgetValues.length === 0) {
      return res.json({ median: 0, p25: 0, p75: 0 });
    }
    
    // Calculer les percentiles
    budgetValues.sort((a, b) => a - b);
    const median = budgetValues[Math.floor(budgetValues.length / 2)];
    const p25 = budgetValues[Math.floor(budgetValues.length * 0.25)];
    const p75 = budgetValues[Math.floor(budgetValues.length * 0.75)];
    
    const benchmark = { median, p25, p75 };
    
    // Mettre en cache
    priceBenchmarkCache.set(cacheKey, {
      data: benchmark,
      timestamp: Date.now()
    });
    
    res.json(benchmark);
    
  } catch (error) {
    console.error('Erreur calcul benchmark:', error);
    res.status(500).json({ error: 'Erreur lors du calcul du benchmark' });
  }
});

export default router;