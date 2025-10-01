
import { db } from '../database';
import { notifications, users } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { broadcastNotification } from '../websocket';

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

export async function createNotification(userId: number, data: NotificationData) {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        user_id: userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata
      })
      .returning();

    console.log(`📢 Notification created for user ${userId}: ${data.title}`);

    // Diffuser en temps réel via WebSocket
    await sendNotificationToUser(userId, notification);

    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

export async function sendNotificationToUser(userId: number, notification: any) {
  try {
    // Diffuser via WebSocket
    broadcastNotification(userId, notification);
    
    console.log(`📨 Notification sent to user ${userId} via WebSocket`);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}

export async function markAsRead(notificationId: number, userId: number) {
  try {
    await db
      .update(notifications)
      .set({ read_at: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.user_id, userId)
        )
      );

    console.log(`✅ Notification ${notificationId} marked as read by user ${userId}`);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllAsRead(userId: number) {
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

    console.log(`✅ All notifications marked as read for user ${userId}`);
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
}

export async function getUserNotifications(userId: number, page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;
    
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset);

    return userNotifications;
  } catch (error) {
    console.error('❌ Error fetching user notifications:', error);
    throw error;
  }
}

export async function getUnreadCount(userId: number): Promise<number> {
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
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
}

// Notifications spécifiques pour différents événements
export async function notifyNewBid(clientId: number, bidData: any) {
  await createNotification(clientId, {
    type: 'new_bid',
    title: 'Nouvelle candidature',
    message: `Une nouvelle candidature a été soumise pour votre mission "${bidData.missionTitle}"`,
    link: `/mission-detail/${bidData.missionId}`,
    metadata: { bidId: bidData.bidId, missionId: bidData.missionId }
  });
}

export async function notifyBidAccepted(providerId: number, bidData: any) {
  await createNotification(providerId, {
    type: 'bid_accepted',
    title: 'Candidature acceptée !',
    message: `Votre candidature pour "${bidData.missionTitle}" a été acceptée`,
    link: `/mission-detail/${bidData.missionId}`,
    metadata: { bidId: bidData.bidId, missionId: bidData.missionId }
  });
}

export async function notifyNewMessage(recipientId: number, messageData: any) {
  await createNotification(recipientId, {
    type: 'new_message',
    title: 'Nouveau message',
    message: `${messageData.senderName} vous a envoyé un message`,
    link: `/messages?conversation=${messageData.conversationId}`,
    metadata: { conversationId: messageData.conversationId, messageId: messageData.messageId }
  });
}

export async function notifyMissionCompleted(clientId: number, missionData: any) {
  await createNotification(clientId, {
    type: 'mission_completed',
    title: 'Mission terminée',
    message: `La mission "${missionData.title}" a été marquée comme terminée`,
    link: `/mission-detail/${missionData.missionId}`,
    metadata: { missionId: missionData.missionId }
  });
}

export async function notifyReviewRequest(clientId: number, missionData: any) {
  await createNotification(clientId, {
    type: 'review_request',
    title: 'Évaluation demandée',
    message: `Veuillez évaluer le prestataire pour la mission "${missionData.title}"`,
    link: `/mission-detail/${missionData.missionId}?tab=review`,
    metadata: { missionId: missionData.missionId }
  });
}
