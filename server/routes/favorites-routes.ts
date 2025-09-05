import { Router } from 'express';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and } from 'drizzle-orm';
import { favorites, announcements } from '../../shared/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const router = Router();

// Récupérer les favoris d'un utilisateur
router.get('/favorites', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id requis' });
    }

    const userFavorites = await db
      .select({
        announcement: announcements
      })
      .from(favorites)
      .innerJoin(announcements, eq(favorites.announcement_id, announcements.id))
      .where(eq(favorites.user_id, parseInt(user_id as string)));

    const favoriteAnnouncements = userFavorites.map(f => f.announcement);

    res.json({
      favorites: favoriteAnnouncements,
      count: favoriteAnnouncements.length
    });

  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
  }
});

// Ajouter une annonce aux favoris
router.post('/favorites', async (req, res) => {
  try {
    const { user_id, announcement_id } = req.body;

    if (!user_id || !announcement_id) {
      return res.status(400).json({ error: 'user_id et announcement_id requis' });
    }

    // Vérifier si déjà en favori
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.user_id, user_id),
          eq(favorites.announcement_id, announcement_id)
        )
      );

    if (existing.length > 0) {
      return res.status(200).json({ message: 'Déjà en favori' });
    }

    // Ajouter aux favoris
    await db.insert(favorites).values({
      user_id,
      announcement_id,
      created_at: new Date()
    });

    res.status(201).json({ message: 'Ajouté aux favoris' });

  } catch (error) {
    console.error('Erreur ajout favori:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout aux favoris' });
  }
});

// Supprimer une annonce des favoris
router.delete('/favorites/:announcementId', async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id requis' });
    }

    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.user_id, user_id),
          eq(favorites.announcement_id, parseInt(announcementId))
        )
      );

    res.json({ message: 'Supprimé des favoris' });

  } catch (error) {
    console.error('Erreur suppression favori:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression des favoris' });
  }
});

export default router;