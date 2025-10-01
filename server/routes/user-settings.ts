
import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../database.js';
import { userSettings } from '../../shared/schema.js';

const router = Router();

// GET /api/user-settings - Récupérer les paramètres
router.get('/user-settings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.user_id, parseInt(userId)))
      .limit(1);

    const userSettingsData = settings[0] || {
      // Valeurs par défaut
      notifications: {
        newMissions: true,
        newBids: true,
        messages: true,
        payments: true,
        reviews: true,
        systemUpdates: true,
        marketTrends: false,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        quietHours: false,
        weekendNotifications: true,
        instantNotifications: false
      },
      privacy: {
        profileVisibility: 'public',
        showActivity: true,
        showLastSeen: true,
        allowDirectMessages: true,
        showInSearchResults: true
      },
      appearance: {
        theme: 'auto',
        language: 'fr',
        compactMode: false,
        showAnimations: true
      }
    };

    res.json(userSettingsData);
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/user-settings - Sauvegarder les paramètres
router.put('/user-settings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { notifications, privacy, appearance } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Vérifier si l'utilisateur a déjà des paramètres
    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.user_id, parseInt(userId)))
      .limit(1);

    const settingsData = {
      user_id: parseInt(userId),
      notifications,
      privacy,
      appearance,
      updated_at: new Date()
    };

    if (existingSettings.length > 0) {
      // Mettre à jour
      await db
        .update(userSettings)
        .set(settingsData)
        .where(eq(userSettings.user_id, parseInt(userId)));
    } else {
      // Créer
      await db
        .insert(userSettings)
        .values({
          ...settingsData,
          created_at: new Date()
        });
    }

    res.json({ message: 'Paramètres sauvegardés avec succès' });
  } catch (error) {
    console.error('Erreur sauvegarde paramètres:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

export default router;
