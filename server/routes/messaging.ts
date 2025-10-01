
import express from 'express';
import { db } from '../database.js';
import { conversations, messages, users } from '../../shared/schema.js';
import { eq, and, or, desc } from 'drizzle-orm';

const router = express.Router();

// GET /api/conversations - Liste des conversations de l'utilisateur
router.get('/conversations', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const userConversations = await db
      .select({
        id: conversations.id,
        mission_id: conversations.mission_id,
        participant1_id: conversations.participant1_id,
        participant2_id: conversations.participant2_id,
        last_message_at: conversations.last_message_at,
        created_at: conversations.created_at,
        // Informations de l'autre participant
        other_user_id: users.id,
        other_user_name: users.name,
        other_user_email: users.email
      })
      .from(conversations)
      .leftJoin(
        users,
        or(
          and(
            eq(conversations.participant1_id, userId),
            eq(users.id, conversations.participant2_id)
          ),
          and(
            eq(conversations.participant2_id, userId),
            eq(users.id, conversations.participant1_id)
          )
        )
      )
      .where(
        or(
          eq(conversations.participant1_id, userId),
          eq(conversations.participant2_id, userId)
        )
      )
      .orderBy(desc(conversations.last_message_at));

    res.json({ conversations: userConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/conversations/:id/messages - Messages d'une conversation
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId as string);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

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
      return res.status(403).json({ error: 'Access denied' });
    }

    const conversationMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        message_type: messages.message_type,
        file_url: messages.file_url,
        sender_id: messages.sender_id,
        read_at: messages.read_at,
        created_at: messages.created_at,
        sender_name: users.name
      })
      .from(messages)
      .leftJoin(users, eq(messages.sender_id, users.id))
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(desc(messages.created_at))
      .limit(limit)
      .offset(offset);

    res.json({ 
      messages: conversationMessages.reverse(), // Inverser pour avoir chronologique
      conversation: conversation[0]
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/conversations - Créer une nouvelle conversation
router.post('/conversations', async (req, res) => {
  try {
    const { participant1_id, participant2_id, mission_id } = req.body;

    // Vérifier si une conversation existe déjà
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          or(
            and(
              eq(conversations.participant1_id, participant1_id),
              eq(conversations.participant2_id, participant2_id)
            ),
            and(
              eq(conversations.participant1_id, participant2_id),
              eq(conversations.participant2_id, participant1_id)
            )
          ),
          mission_id ? eq(conversations.mission_id, mission_id) : undefined
        )
      )
      .limit(1);

    if (existingConversation.length > 0) {
      return res.json({ conversation: existingConversation[0] });
    }

    // Créer nouvelle conversation
    const newConversation = await db
      .insert(conversations)
      .values({
        participant1_id,
        participant2_id,
        mission_id,
        last_message_at: new Date(),
        created_at: new Date()
      })
      .returning();

    res.status(201).json({ conversation: newConversation[0] });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// POST /api/messages - Envoyer un message (fallback si WebSocket non disponible)
router.post('/messages', async (req, res) => {
  try {
    const { conversation_id, sender_id, content, message_type = 'text' } = req.body;

    // Vérifier l'accès à la conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversation_id),
          or(
            eq(conversations.participant1_id, sender_id),
            eq(conversations.participant2_id, sender_id)
          )
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newMessage = await db
      .insert(messages)
      .values({
        conversation_id,
        sender_id,
        content,
        message_type,
        created_at: new Date()
      })
      .returning();

    // Mettre à jour last_message_at
    await db
      .update(conversations)
      .set({ last_message_at: new Date() })
      .where(eq(conversations.id, conversation_id));

    res.status(201).json({ message: newMessage[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PATCH /api/messages/:id/read - Marquer un message comme lu
router.patch('/messages/:id/read', async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = parseInt(req.body.userId);

    const updatedMessage = await db
      .update(messages)
      .set({ read_at: new Date() })
      .where(eq(messages.id, messageId))
      .returning();

    res.json({ message: updatedMessage[0] });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export default router;
