
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../services/notification-service';

const router = Router();

// GET /api/notifications - Récupérer les notifications de l'utilisateur
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const notifications = await getUserNotifications(userId, page, limit);
    const unreadCount = await getUnreadCount(userId);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        hasMore: notifications.length === limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count - Compter les notifications non lues
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// PATCH /api/notifications/:id/read - Marquer une notification comme lue
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = parseInt(req.params.id);

    await markAsRead(notificationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /api/notifications/mark-all-read - Marquer toutes les notifications comme lues
router.patch('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    await markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

export default router;
