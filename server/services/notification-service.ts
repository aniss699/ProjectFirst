
import { db } from '../database.js';
import { notifications } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { websocketManager } from '../websocket.js';

export interface CreateNotificationData {
  user_id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

export class NotificationService {
  
  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await db
        .insert(notifications)
        .values({
          ...data,
          created_at: new Date()
        })
        .returning();

      // Envoyer notification en temps réel via WebSocket
      websocketManager.sendToUser(data.user_id, {
        type: 'new_notification',
        notification: notification[0]
      });

      return notification[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: number, limit = 50, offset = 0) {
    try {
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.user_id, userId))
        .orderBy(desc(notifications.created_at))
        .limit(limit)
        .offset(offset);

      return userNotifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: number, userId: number) {
    try {
      const updatedNotification = await db
        .update(notifications)
        .set({ read_at: new Date() })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.user_id, userId)
          )
        )
        .returning();

      return updatedNotification[0];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: number) {
    try {
      await db
        .update(notifications)
        .set({ read_at: new Date() })
        .where(
          and(
            eq(notifications.user_id, userId),
            eq(notifications.read_at, null)
          )
        );

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: number) {
    try {
      const result = await db
        .select({ count: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.user_id, userId),
            eq(notifications.read_at, null)
          )
        );

      return result.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Méthodes d'aide pour créer des notifications spécifiques
  async notifyNewBid(clientId: number, bidData: any) {
    return this.createNotification({
      user_id: clientId,
      type: 'new_bid',
      title: 'Nouvelle offre reçue',
      message: `Vous avez reçu une offre de ${bidData.provider_name} pour votre mission "${bidData.mission_title}"`,
      link: `/missions/${bidData.mission_id}`,
      metadata: { bidId: bidData.id, missionId: bidData.mission_id }
    });
  }

  async notifyBidAccepted(providerId: number, bidData: any) {
    return this.createNotification({
      user_id: providerId,
      type: 'bid_accepted',
      title: 'Votre offre a été acceptée !',
      message: `Félicitations ! Votre offre pour "${bidData.mission_title}" a été acceptée.`,
      link: `/missions/${bidData.mission_id}`,
      metadata: { bidId: bidData.id, missionId: bidData.mission_id }
    });
  }

  async notifyMissionCompleted(userId: number, missionData: any) {
    return this.createNotification({
      user_id: userId,
      type: 'mission_completed',
      title: 'Mission terminée',
      message: `La mission "${missionData.title}" a été marquée comme terminée.`,
      link: `/missions/${missionData.id}`,
      metadata: { missionId: missionData.id }
    });
  }

  async notifyNewReview(userId: number, reviewData: any) {
    return this.createNotification({
      user_id: userId,
      type: 'new_review',
      title: 'Nouvel avis reçu',
      message: `Vous avez reçu un nouvel avis avec ${reviewData.rating} étoiles.`,
      link: `/profile?tab=reviews`,
      metadata: { reviewId: reviewData.id, rating: reviewData.rating }
    });
  }
}

export const notificationService = new NotificationService();
