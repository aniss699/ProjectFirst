import express from 'express';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq, and, not, inArray, sql } from 'drizzle-orm';
import { announcements, feedFeedback, feedSeen, insertFeedFeedbackSchema } from '../../shared/schema';
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

    console.log('📡 Feed request:', { cursor, limit: limitNum, userId });

    // Récupérer les annonces vues par l'utilisateur (dernières 24h)
    const seenAnnouncements = userId ? await db
      .select({ announcement_id: feedSeen.announcement_id })
      .from(feedSeen)
      .where(eq(feedSeen.user_id, parseInt(userId as string)))
      .catch(err => {
        console.warn('⚠️ Feed seen query failed (non-blocking):', err.message);
        return [];
      }) : [];

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
    const rawAnnouncements = await db
      .select()
      .from(announcements)
      .where(and(...whereConditions))
      .orderBy(desc(announcements.created_at))
      .limit(limitNum + 5)
      .catch(err => {
        console.error('❌ Database query failed:', err);
        throw new Error('Database query failed: ' + err.message);
      });

    console.log('✅ Raw announcements fetched:', rawAnnouncements.length);

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
      .limit(3)
      .catch(err => {
        console.warn('⚠️ Sponsored query failed (non-blocking):', err.message);
        return [];
      });

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

    console.log('✅ Feed response:', { items: finalAnnouncements.length, hasMore: rawAnnouncements.length > limitNum });

    res.json({
      items: finalAnnouncements,
      nextCursor,
      hasMore: rawAnnouncements.length > limitNum
    });

  } catch (error) {
    console.error('❌ Erreur récupération feed:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');

    // Retourner un feed vide en mode dégradé au lieu d'une erreur 500
    res.status(200).json({ 
      items: [],
      nextCursor: null,
      hasMore: false,
      metadata: {
        error: true,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        fallback_mode: true,
        timestamp: new Date().toISOString()
      }
    });
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