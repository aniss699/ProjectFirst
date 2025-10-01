
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { db } from './database.js';
import { conversations, messages, notifications } from '../shared/schema.js';
import { eq, and, or } from 'drizzle-orm';
import * as jwt from 'jsonwebtoken';

interface ClientConnection {
  ws: WebSocket;
  userId: number;
  connectionId: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  connectionId?: string;
}

class WebSocketManager {
  private clients = new Map<number, ClientConnection[]>();
  private wss: WebSocketServer | null = null;

  initialize(server: any) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('✅ WebSocket server initialized on /ws');
  }

  private verifyClient(info: { req: IncomingMessage }) {
    // Vérifier l'authentification via query params ou headers
    const url = new URL(info.req.url!, `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token') || info.req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ WebSocket: No token provided');
      return false;
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      return true;
    } catch (error) {
      console.log('❌ WebSocket: Invalid token');
      return false;
    }
  }

  private async handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage) {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    try {
      const decoded = jwt.verify(token!, process.env.JWT_SECRET || 'dev-secret') as { userId: number };
      const userId = decoded.userId;
      const connectionId = `${userId}_${Date.now()}`;
      
      ws.userId = userId;
      ws.connectionId = connectionId;

      // Ajouter la connexion à la map
      if (!this.clients.has(userId)) {
        this.clients.set(userId, []);
      }
      this.clients.get(userId)!.push({ ws, userId, connectionId });

      console.log(`✅ User ${userId} connected via WebSocket`);

      // Gérer les messages
      ws.on('message', (data) => this.handleMessage(ws, data));
      
      // Gérer la déconnexion
      ws.on('close', () => this.handleDisconnection(ws));
      
      // Envoyer confirmation de connexion
      ws.send(JSON.stringify({
        type: 'connection_confirmed',
        userId,
        connectionId
      }));

    } catch (error) {
      console.error('❌ WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private async handleMessage(ws: AuthenticatedWebSocket, data: Buffer) {
    try {
      const message = JSON.parse(data.toString());
      const userId = ws.userId!;

      switch (message.type) {
        case 'send_message':
          await this.handleSendMessage(userId, message);
          break;
        case 'typing':
          await this.handleTyping(userId, message);
          break;
        case 'read_message':
          await this.handleReadMessage(userId, message);
          break;
        case 'join_conversation':
          await this.handleJoinConversation(userId, message);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  }

  private async handleSendMessage(userId: number, message: any) {
    try {
      const { conversationId, content, messageType = 'text' } = message;

      // Vérifier que l'utilisateur fait partie de la conversation
      const conversation = await db
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

      if (conversation.length === 0) {
        throw new Error('Conversation not found or access denied');
      }

      // Insérer le message
      const newMessage = await db
        .insert(messages)
        .values({
          conversation_id: conversationId,
          sender_id: userId,
          content,
          message_type: messageType,
          created_at: new Date()
        })
        .returning();

      // Mettre à jour la conversation
      await db
        .update(conversations)
        .set({ last_message_at: new Date() })
        .where(eq(conversations.id, conversationId));

      // Diffuser le message aux participants
      const participants = [conversation[0].participant1_id, conversation[0].participant2_id];
      const messageData = {
        type: 'new_message',
        conversationId,
        message: {
          id: newMessage[0].id,
          content,
          sender_id: userId,
          message_type: messageType,
          created_at: newMessage[0].created_at
        }
      };

      participants.forEach(participantId => {
        this.sendToUser(participantId, messageData);
      });

      // Créer une notification pour l'autre participant
      const otherParticipant = participants.find(id => id !== userId);
      if (otherParticipant) {
        await this.createNotification(otherParticipant, {
          type: 'new_message',
          title: 'Nouveau message',
          message: content.substring(0, 100),
          link: `/messages?conversation=${conversationId}`,
          metadata: { conversationId, senderId: userId }
        });
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  private async handleTyping(userId: number, message: any) {
    const { conversationId, isTyping } = message;

    // Récupérer la conversation pour trouver l'autre participant
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length > 0) {
      const otherParticipant = conversation[0].participant1_id === userId 
        ? conversation[0].participant2_id 
        : conversation[0].participant1_id;

      this.sendToUser(otherParticipant, {
        type: 'typing',
        conversationId,
        userId,
        isTyping
      });
    }
  }

  private async handleReadMessage(userId: number, message: any) {
    const { messageId } = message;

    await db
      .update(messages)
      .set({ read_at: new Date() })
      .where(eq(messages.id, messageId));

    // Notifier l'expéditeur que le message a été lu
    const messageData = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (messageData.length > 0) {
      this.sendToUser(messageData[0].sender_id, {
        type: 'message_read',
        messageId,
        readBy: userId,
        readAt: new Date()
      });
    }
  }

  private async handleJoinConversation(userId: number, message: any) {
    const { conversationId } = message;
    
    // Vérifier l'accès et envoyer l'historique des messages récents
    const conversation = await db
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

    if (conversation.length > 0) {
      const recentMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversation_id, conversationId))
        .orderBy(messages.created_at)
        .limit(50);

      this.sendToUser(userId, {
        type: 'conversation_history',
        conversationId,
        messages: recentMessages
      });
    }
  }

  private handleDisconnection(ws: AuthenticatedWebSocket) {
    const userId = ws.userId;
    const connectionId = ws.connectionId;

    if (userId && this.clients.has(userId)) {
      const userConnections = this.clients.get(userId)!;
      const updatedConnections = userConnections.filter(conn => conn.connectionId !== connectionId);
      
      if (updatedConnections.length === 0) {
        this.clients.delete(userId);
        console.log(`❌ User ${userId} disconnected (all connections closed)`);
      } else {
        this.clients.set(userId, updatedConnections);
        console.log(`❌ User ${userId} connection ${connectionId} closed`);
      }
    }
  }

  private sendToUser(userId: number, data: any) {
    const userConnections = this.clients.get(userId);
    if (userConnections) {
      userConnections.forEach(({ ws }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      });
    }
  }

  private async createNotification(userId: number, notificationData: {
    type: string;
    title: string;
    message: string;
    link?: string;
    metadata?: any;
  }) {
    try {
      const notification = await db
        .insert(notifications)
        .values({
          user_id: userId,
          ...notificationData,
          created_at: new Date()
        })
        .returning();

      // Envoyer notification en temps réel
      this.sendToUser(userId, {
        type: 'new_notification',
        notification: notification[0]
      });

    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  }

  broadcastToAll(data: any) {
    this.clients.forEach((userConnections) => {
      userConnections.forEach(({ ws }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      });
    });
  }

  getConnectedUsers(): number[] {
    return Array.from(this.clients.keys());
  }

  getConnectionCount(): number {
    let count = 0;
    this.clients.forEach(connections => count += connections.length);
    return count;
  }
}

export const websocketManager = new WebSocketManager();
export { WebSocketManager };
