
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { db } from './database';
import { conversations, messages, notifications } from '../shared/schema';
import { eq, and, or } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface ClientConnection {
  ws: WebSocket;
  userId: number;
}

const clients = new Map<number, ClientConnection>();

export function setupWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  console.log('🔌 WebSocket server initialized on /ws');

  wss.on('connection', async (ws, req) => {
    console.log('🔗 New WebSocket connection attempt');
    
    try {
      // Extraire le token de l'URL ou des headers
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        console.log('❌ WebSocket: No authentication token provided');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Vérifier le token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
      const userId = decoded.userId;
      
      console.log(`✅ WebSocket: User ${userId} authenticated successfully`);
      
      // Stocker la connexion
      clients.set(userId, { ws, userId });
      
      // Envoyer confirmation de connexion
      ws.send(JSON.stringify({
        type: 'connected',
        userId: userId,
        timestamp: new Date().toISOString()
      }));

      // Gérer les messages entrants
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await handleWebSocketMessage(userId, message);
        } catch (error) {
          console.error('❌ Error handling WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      // Gérer la fermeture de connexion
      ws.on('close', () => {
        console.log(`📴 WebSocket: User ${userId} disconnected`);
        clients.delete(userId);
      });

      // Gérer les erreurs
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for user ${userId}:`, error);
        clients.delete(userId);
      });

    } catch (error) {
      console.error('❌ WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  return wss;
}

async function handleWebSocketMessage(userId: number, message: any) {
  console.log(`📨 WebSocket message from user ${userId}:`, message.type);

  switch (message.type) {
    case 'send_message':
      await handleSendMessage(userId, message);
      break;
    case 'typing':
      await handleTyping(userId, message);
      break;
    case 'mark_read':
      await handleMarkRead(userId, message);
      break;
    case 'join_conversation':
      await handleJoinConversation(userId, message);
      break;
    default:
      console.log('❓ Unknown WebSocket message type:', message.type);
  }
}

async function handleSendMessage(senderId: number, message: any) {
  try {
    const { conversationId, content, messageType = 'text', fileUrl } = message;
    
    // Vérifier que l'utilisateur fait partie de la conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.participant1_id, senderId),
            eq(conversations.participant2_id, senderId)
          )
        )
      )
      .limit(1);

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // Créer le message en base
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        file_url: fileUrl
      })
      .returning();

    // Mettre à jour la conversation
    await db
      .update(conversations)
      .set({ last_message_at: new Date() })
      .where(eq(conversations.id, conversationId));

    // Déterminer le destinataire
    const recipientId = conversation.participant1_id === senderId 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    // Diffuser le message aux participants connectés
    const messageData = {
      type: 'new_message',
      message: {
        id: newMessage.id,
        conversationId,
        senderId,
        content,
        messageType,
        fileUrl,
        createdAt: newMessage.created_at
      }
    };

    // Envoyer au destinataire
    const recipientConnection = clients.get(recipientId);
    if (recipientConnection) {
      recipientConnection.ws.send(JSON.stringify(messageData));
    }

    // Confirmer au sender
    const senderConnection = clients.get(senderId);
    if (senderConnection) {
      senderConnection.ws.send(JSON.stringify({
        type: 'message_sent',
        messageId: newMessage.id,
        timestamp: newMessage.created_at
      }));
    }

    console.log(`✅ Message sent from ${senderId} to ${recipientId} in conversation ${conversationId}`);

  } catch (error) {
    console.error('❌ Error sending message:', error);
    const senderConnection = clients.get(senderId);
    if (senderConnection) {
      senderConnection.ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to send message'
      }));
    }
  }
}

async function handleTyping(userId: number, message: any) {
  const { conversationId, isTyping } = message;
  
  try {
    // Vérifier l'accès à la conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.participant1_id, userId),
            eq(conversations.participant2_id, userId)
          )
        )
      )
      .limit(1);

    if (!conversation) return;

    // Déterminer le destinataire
    const recipientId = conversation.participant1_id === userId 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    // Envoyer l'indication de frappe
    const recipientConnection = clients.get(recipientId);
    if (recipientConnection) {
      recipientConnection.ws.send(JSON.stringify({
        type: 'user_typing',
        conversationId,
        userId,
        isTyping
      }));
    }

  } catch (error) {
    console.error('❌ Error handling typing indicator:', error);
  }
}

async function handleMarkRead(userId: number, message: any) {
  const { messageId } = message;
  
  try {
    // Marquer le message comme lu
    await db
      .update(messages)
      .set({ read_at: new Date() })
      .where(eq(messages.id, messageId));

    console.log(`✅ Message ${messageId} marked as read by user ${userId}`);

  } catch (error) {
    console.error('❌ Error marking message as read:', error);
  }
}

async function handleJoinConversation(userId: number, message: any) {
  const { conversationId } = message;
  
  try {
    // Vérifier l'accès à la conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.participant1_id, userId),
            eq(conversations.participant2_id, userId)
          )
        )
      )
      .limit(1);

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // Récupérer les messages récents
    const recentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(messages.created_at)
      .limit(50);

    // Envoyer l'historique
    const userConnection = clients.get(userId);
    if (userConnection) {
      userConnection.ws.send(JSON.stringify({
        type: 'conversation_history',
        conversationId,
        messages: recentMessages
      }));
    }

  } catch (error) {
    console.error('❌ Error joining conversation:', error);
  }
}

export function broadcastNotification(userId: number, notification: any) {
  const userConnection = clients.get(userId);
  if (userConnection) {
    userConnection.ws.send(JSON.stringify({
      type: 'notification',
      notification
    }));
  }
}

export function getConnectedUsers(): number[] {
  return Array.from(clients.keys());
}
