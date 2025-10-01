
import { Router } from 'express';
import { db } from '../database';
import { conversations, messages, users } from '../../shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/conversations - Liste des conversations de l'utilisateur
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const userConversations = await db
      .select({
        id: conversations.id,
        missionId: conversations.mission_id,
        participant1Id: conversations.participant1_id,
        participant2Id: conversations.participant2_id,
        lastMessageAt: conversations.last_message_at,
        createdAt: conversations.created_at,
        // Informations de l'autre participant
        otherParticipant: {
          id: users.id,
          name: users.name,
          email: users.email
        }
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

    res.json(userConversations);
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/conversations/:id/messages - Messages d'une conversation
router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const conversationId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

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
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    // Récupérer les messages
    const conversationMessages = await db
      .select({
        id: messages.id,
        conversationId: messages.conversation_id,
        senderId: messages.sender_id,
        content: messages.content,
        messageType: messages.message_type,
        fileUrl: messages.file_url,
        readAt: messages.read_at,
        createdAt: messages.created_at,
        sender: {
          id: users.id,
          name: users.name
        }
      })
      .from(messages)
      .leftJoin(users, eq(messages.sender_id, users.id))
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(desc(messages.created_at))
      .limit(limit)
      .offset(offset);

    res.json({
      messages: conversationMessages.reverse(), // Ordre chronologique
      pagination: {
        page,
        limit,
        hasMore: conversationMessages.length === limit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/conversations - Créer une nouvelle conversation
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { participantId, missionId } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    if (participantId === userId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Vérifier si une conversation existe déjà
    const [existingConversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          or(
            and(
              eq(conversations.participant1_id, userId),
              eq(conversations.participant2_id, participantId)
            ),
            and(
              eq(conversations.participant1_id, participantId),
              eq(conversations.participant2_id, userId)
            )
          ),
          missionId ? eq(conversations.mission_id, missionId) : eq(conversations.mission_id, null)
        )
      )
      .limit(1);

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Créer une nouvelle conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        participant1_id: userId,
        participant2_id: participantId,
        mission_id: missionId || null
      })
      .returning();

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// POST /api/messages - Envoyer un message (fallback si pas WebSocket)
router.post('/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { conversationId, content, messageType = 'text', fileUrl } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Conversation ID and content are required' });
    }

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
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    // Créer le message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversation_id: conversationId,
        sender_id: userId,
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

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PATCH /api/messages/:id/read - Marquer un message comme lu
router.patch('/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    
    await db
      .update(messages)
      .set({ read_at: new Date() })
      .where(eq(messages.id, messageId));

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export default router;
