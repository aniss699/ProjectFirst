
import express from 'express';
import { notificationService } from '../services/notification-service.js';

const router = express.Router();

// GET /api/notifications - Récupérer les notifications d'un utilisateur
router.get('/notifications', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const notifications = await notificationService.getUserNotifications(userId, limit, offset);
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({ 
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications - Créer une notification
router.post('/notifications', async (req, res) => {
  try {
    const { user_id, type, title, message, link, metadata } = req.body;

    if (!user_id || !type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const notification = await notificationService.createNotification({
      user_id,
      type,
      title,
      message,
      link,
      metadata
    });

    res.status(201).json({ notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PATCH /api/notifications/:id/read - Marquer comme lu
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = parseInt(req.body.userId);

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const notification = await notificationService.markAsRead(notificationId, userId);
    res.json({ notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// POST /api/notifications/mark-all-read - Marquer toutes comme lues
router.post('/notifications/mark-all-read', async (req, res) => {
  try {
    const userId = parseInt(req.body.userId);

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const result = await notificationService.markAllAsRead(userId);
    res.json(result);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// GET /api/notifications/unread-count - Nombre de notifications non lues
router.get('/notifications/unread-count', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const count = await notificationService.getUnreadCount(userId);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;
