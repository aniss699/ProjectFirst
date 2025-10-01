import { pgTable, serial, integer, text, timestamp, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text("password").notNull(),
  role: text('role').notNull().$type<'CLIENT' | 'PRO'>(),
  rating_mean: decimal('rating_mean', { precision: 3, scale: 2 }),
  rating_count: integer('rating_count').default(0),
  profile_data: jsonb('profile_data'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  client_id: integer('client_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  excerpt: text('excerpt'),
  category: text('category').notNull(),

  // Localisation unifiée en JSON
  location_data: jsonb('location_data'),

  // Budget unifié (plus de redondance)
  budget_value_cents: integer('budget_value_cents').notNull(),
  currency: text('currency').default('EUR'),

  // ENUMs PostgreSQL optimisés
  urgency: text('urgency').$type<'low' | 'medium' | 'high' | 'urgent'>().default('medium'),
  status: text('status').$type<'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'>().default('draft'),
  quality_target: text('quality_target').$type<'basic' | 'standard' | 'premium' | 'luxury'>().default('standard'),

  deadline: timestamp('deadline'),
  tags: jsonb('tags'),
  skills_required: jsonb('skills_required'),
  requirements: text('requirements'),
  is_team_mission: boolean('is_team_mission').default(false),
  team_size: integer('team_size').default(1),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Table pour les équipes ouvertes (en cours de constitution)
export const openTeams = pgTable('open_teams', {
  id: serial('id').primaryKey(),
  mission_id: integer('mission_id').references(() => missions.id).notNull(),
  name: text('name').notNull(), // Nom de l'équipe
  description: text('description'),
  creator_id: integer('creator_id').references(() => users.id).notNull(), // Initiateur de l'équipe
  estimated_budget: integer('estimated_budget'), // Budget estimé en centimes
  estimated_timeline_days: integer('estimated_timeline_days'),
  members: jsonb('members'), // Membres actuels de l'équipe
  required_roles: jsonb('required_roles'), // Rôles recherchés
  max_members: integer('max_members').default(5),
  status: text('status').$type<'recruiting' | 'complete' | 'submitted' | 'cancelled'>().default('recruiting'),
  visibility: text('visibility').$type<'public' | 'private'>().default('public'),
  auto_accept: boolean('auto_accept').default(true), // Accepter automatiquement les candidatures
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  mission_id: integer('mission_id').references(() => missions.id).notNull(),
  provider_id: integer('provider_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  timeline_days: integer('timeline_days'),
  message: text('message'),
  score_breakdown: jsonb('score_breakdown'),
  is_leading: boolean('is_leading').default(false),
  status: text('status').$type<'pending' | 'accepted' | 'rejected' | 'withdrawn'>().default('pending'),
  // Extensions pour les équipes
  bid_type: text('bid_type').$type<'individual' | 'team' | 'open_team'>().default('individual'),
  team_composition: jsonb('team_composition'), // Structure de l'équipe
  team_lead_id: integer('team_lead_id').references(() => users.id), // Chef d'équipe
  open_team_id: integer('open_team_id').references(() => openTeams.id), // Référence vers équipe ouverte
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').$type<'info' | 'warning' | 'error' | 'success'>().default('info'),
  priority: integer('priority').default(1),
  is_active: boolean('is_active').default(true),
  status: text('status').$type<'active' | 'completed' | 'cancelled' | 'draft'>().default('active'),
  category: text('category'),
  budget: integer('budget'),
  location: text('location'),
  user_id: integer('user_id').references(() => users.id),
  sponsored: boolean('sponsored').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const feedFeedback = pgTable('feed_feedback', {
  id: serial('id').primaryKey(),
  announcement_id: integer('announcement_id').references(() => announcements.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  feedback_type: text('feedback_type').$type<'like' | 'dislike' | 'interested' | 'not_relevant'>().notNull(),
  created_at: timestamp('created_at').defaultNow()
});

export const feedSeen = pgTable('feed_seen', {
  id: serial('id').primaryKey(),
  announcement_id: integer('announcement_id').references(() => announcements.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  seen_at: timestamp('seen_at').defaultNow()
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  announcement_id: integer('announcement_id').references(() => announcements.id).notNull(),
  created_at: timestamp('created_at').defaultNow()
});

// Tables pour le système de reviews
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  mission_id: integer('mission_id').references(() => missions.id).notNull(),
  reviewer_id: integer('reviewer_id').references(() => users.id).notNull(),
  reviewee_id: integer('reviewee_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  response: text('response'), // Réponse du prestataire
  criteria: jsonb('criteria'), // {communication: 5, quality: 4, deadline: 5, etc.}
  is_public: boolean('is_public').default(true),
  helpful_count: integer('helpful_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const reviewHelpful = pgTable('review_helpful', {
  id: serial('id').primaryKey(),
  review_id: integer('review_id').references(() => reviews.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  created_at: timestamp('created_at').defaultNow()
});

// Tables pour la gestion des contrats
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  mission_id: integer('mission_id').references(() => missions.id).notNull(),
  bid_id: integer('bid_id').references(() => bids.id).notNull(),
  client_id: integer('client_id').references(() => users.id).notNull(),
  provider_id: integer('provider_id').references(() => users.id).notNull(),

  status: text('status').$type<
    'pending_signature' | 'active' | 'in_progress' | 'under_review' |
    'completed' | 'disputed' | 'cancelled'
  >().default('pending_signature'),

  terms: jsonb('terms'), // Conditions acceptées
  deliverables: jsonb('deliverables'), // Liste des livrables attendus
  milestones: jsonb('milestones'), // Jalons de paiement

  // Signatures électroniques
  client_signed_at: timestamp('client_signed_at'),
  provider_signed_at: timestamp('provider_signed_at'),

  // Dates importantes
  start_date: timestamp('start_date'),
  expected_end_date: timestamp('expected_end_date'),
  actual_end_date: timestamp('actual_end_date'),

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const deliverables = pgTable('deliverables', {
  id: serial('id').primaryKey(),
  contract_id: integer('contract_id').references(() => contracts.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').$type<'pending' | 'submitted' | 'approved' | 'rejected'>().default('pending'),
  file_urls: jsonb('file_urls'), // URLs des fichiers livrés
  submitted_at: timestamp('submitted_at'),
  reviewed_at: timestamp('reviewed_at'),
  feedback: text('feedback'),
  created_at: timestamp('created_at').defaultNow()
});

// Tables pour la messagerie
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  mission_id: integer('mission_id').references(() => missions.id),
  participant1_id: integer('participant1_id').references(() => users.id).notNull(),
  participant2_id: integer('participant2_id').references(() => users.id).notNull(),
  last_message_at: timestamp('last_message_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow()
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversation_id: integer('conversation_id').references(() => conversations.id).notNull(),
  sender_id: integer('sender_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  message_type: text('message_type').$type<'text' | 'image' | 'file' | 'system'>().default('text'),
  file_url: text('file_url'),
  read_at: timestamp('read_at'),
  created_at: timestamp('created_at').defaultNow()
});

// Tables pour les notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'new_bid', 'message', 'payment', 'review', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'), // URL de redirection
  metadata: jsonb('metadata'),
  read_at: timestamp('read_at'),
  created_at: timestamp('created_at').defaultNow()
});

// Tables pour les fichiers
export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  filename: text('filename').notNull(),
  original_filename: text('original_filename').notNull(),
  file_type: text('file_type').notNull(), // mime type
  file_size: integer('file_size').notNull(), // en bytes
  file_url: text('file_url').notNull(),

  // Contexte d'utilisation
  context_type: text('context_type'), // 'portfolio', 'bid', 'deliverable', 'profile_picture'
  context_id: integer('context_id'), // ID de la mission, bid, etc.

  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow()
});

// Relations entre les tables
export const usersRelations = relations(users, ({ many }) => ({
  missions: many(missions),
  bids: many(bids),
  // teamMembers: many(teamMembers), // This seems to be a leftover from a previous or incomplete change. Removing it.
  reviewsGiven: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
  contracts: many(contracts),
  notifications: many(notifications),
  files: many(files)
}));

export const missionsRelations = relations(missions, ({ one, many }) => ({
  user: one(users, {
    fields: [missions.user_id],
    references: [users.id]
  }),
  bids: many(bids),
  reviews: many(reviews)
}));

export const openTeamsRelations = relations(openTeams, ({ one, many }) => ({
  mission: one(missions, {
    fields: [openTeams.mission_id],
    references: [missions.id]
  }),
  creator: one(users, {
    fields: [openTeams.creator_id],
    references: [users.id]
  }),
  bids: many(bids)
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  mission: one(missions, {
    fields: [bids.mission_id],
    references: [missions.id]
  }),
  provider: one(users, {
    fields: [bids.provider_id],
    references: [users.id]
  }),
  teamLead: one(users, {
    fields: [bids.team_lead_id],
    references: [users.id]
  }),
  openTeam: one(openTeams, {
    fields: [bids.open_team_id],
    references: [openTeams.id]
  })
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  user: one(users, {
    fields: [announcements.user_id],
    references: [users.id]
  }),
  feedbacks: many(feedFeedback),
  seenBy: many(feedSeen),
  favorites: many(favorites)
}));

export const feedFeedbackRelations = relations(feedFeedback, ({ one }) => ({
  announcement: one(announcements, {
    fields: [feedFeedback.announcement_id],
    references: [announcements.id]
  }),
  user: one(users, {
    fields: [feedFeedback.user_id],
    references: [users.id]
  })
}));

export const feedSeenRelations = relations(feedSeen, ({ one }) => ({
  announcement: one(announcements, {
    fields: [feedSeen.announcement_id],
    references: [announcements.id]
  }),
  user: one(users, {
    fields: [feedSeen.user_id],
    references: [users.id]
  })
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  announcement: one(announcements, {
    fields: [favorites.announcement_id],
    references: [announcements.id]
  }),
  user: one(users, {
    fields: [favorites.user_id],
    references: [users.id]
  })
}));

// Relations pour reviews
export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  mission: one(missions, {
    fields: [reviews.mission_id],
    references: [missions.id]
  }),
  reviewer: one(users, {
    fields: [reviews.reviewer_id],
    references: [users.id]
  }),
  reviewee: one(users, {
    fields: [reviews.reviewee_id],
    references: [users.id]
  }),
  helpfulMarks: many(reviewHelpful)
}));

export const reviewHelpfulRelations = relations(reviewHelpful, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewHelpful.review_id],
    references: [reviews.id]
  }),
  user: one(users, {
    fields: [reviewHelpful.user_id],
    references: [users.id]
  })
}));

// Relations pour contrats
export const contractsRelations = relations(contracts, ({ one, many }) => ({
  mission: one(missions, {
    fields: [contracts.mission_id],
    references: [missions.id]
  }),
  bid: one(bids, {
    fields: [contracts.bid_id],
    references: [bids.id]
  }),
  client: one(users, {
    fields: [contracts.client_id],
    references: [users.id]
  }),
  provider: one(users, {
    fields: [contracts.provider_id],
    references: [users.id]
  }),
  deliverables: many(deliverables)
}));

export const deliverablesRelations = relations(deliverables, ({ one }) => ({
  contract: one(contracts, {
    fields: [deliverables.contract_id],
    references: [contracts.id]
  })
}));

// Relations pour conversations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  mission: one(missions, {
    fields: [conversations.mission_id],
    references: [missions.id]
  }),
  participant1: one(users, {
    fields: [conversations.participant1_id],
    references: [users.id]
  }),
  participant2: one(users, {
    fields: [conversations.participant2_id],
    references: [users.id]
  }),
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversation_id],
    references: [conversations.id]
  }),
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.id]
  })
}));

// Relations pour notifications
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id]
  })
}));

// Relations pour fichiers
export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.user_id],
    references: [users.id]
  })
}));

// Export types that might be used elsewhere
export type FeedbackType = 'like' | 'dislike' | 'interested' | 'not_relevant';
export type AnnouncementStatus = 'active' | 'completed' | 'cancelled' | 'draft';
export type ContractStatus = 'pending_signature' | 'active' | 'in_progress' | 'under_review' | 'completed' | 'disputed' | 'cancelled';
export type DeliverableStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type NotificationType = 'new_bid' | 'message' | 'payment' | 'review' | string;
export type FileContextType = 'portfolio' | 'bid' | 'deliverable' | 'profile_picture' | string | null;

// Types pour les équipes
export interface TeamMember {
  id?: number;
  user_id?: number;
  name: string;
  role: string;
  experience: string;
  isLead: boolean;
  rating?: number;
  profile_url?: string;
}

export interface TeamComposition {
  members: TeamMember[];
  total_budget: number;
  estimated_timeline: number;
  description: string;
}

export interface OpenTeamMember {
  user_id: number;
  name: string;
  role: string;
  experience_years: number;
  rating: number;
  joined_at: string;
}

export interface RequiredRole {
  title: string;
  description: string;
  skills: string[];
  min_experience: number;
  priority: 'high' | 'medium' | 'low';
}

// Types de candidatures
export type BidType = 'individual' | 'team' | 'open_team';

// Added team mission types
export interface TeamRequirement {
  profession: string;
  description: string;
  required_skills: string[];
  estimated_budget: number;
  estimated_days: number;
  min_experience: number;
  is_lead_role: boolean;
  importance: 'high' | 'medium' | 'low';
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  teamRequirements?: TeamRequirement[];
  category: string;
  budget?: string | number;
  location?: string;
  clientName?: string;
  createdAt?: string;
  bids?: any[];
}

// ⚠️ DEPRECATED LEGACY UI TYPES
// Please use types from @shared/types instead for UI components
// These are kept only for backward compatibility and will be removed
export namespace DeprecatedUITypes {
  export interface MissionWithBids extends Mission {
    bids: any[];
  }

  export interface Announcement {
    id: number;
    title: string;
    description: string;
    category: string;
    budget_min?: number;
    budget_max?: number;
    deadline?: Date;
    city?: string;
    user_id: number;
    tags?: string[];
    sponsored?: boolean;
    quality_score?: number;
  }
}

// Re-exports for backward compatibility - to be removed
export interface MissionWithBids extends DeprecatedUITypes.MissionWithBids {}
export interface Announcement extends DeprecatedUITypes.Announcement {}

// Zod schemas for validation (already present and seem fine, no changes requested)
export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8), // Added password validation, assuming a minimum of 8 characters
  role: z.enum(['CLIENT', 'PRO', 'ADMIN']),
  rating_mean: z.string().optional(),
  rating_count: z.number().int().min(0).optional(),
  profile_data: z.any().optional()
});

export const insertMissionSchema = z.object({
  user_id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  location: z.string().optional(),
  postal_code: z.string().optional(), // Added postal_code validation
  budget: z.number().int().min(0).optional(),
  budget_value_cents: z.number().int().min(0).optional(),
  budget_type: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['draft', 'open', 'published', 'assigned', 'completed', 'cancelled']).optional(),
  quality_target: z.enum(['basic', 'standard', 'premium', 'luxury']).optional()
});

export const insertBidSchema = z.object({
  mission_id: z.number().int().positive(),
  provider_id: z.number().int().positive(),
  amount: z.string(),
  timeline_days: z.number().int().min(1).optional(),
  message: z.string().optional(),
  score_breakdown: z.any().optional(),
  is_leading: z.boolean().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional(),
  // Extensions pour les équipes
  bid_type: z.enum(['individual', 'team', 'open_team']).optional(),
  team_composition: z.any().optional(), // Structure de l'équipe
  team_lead_id: z.number().int().positive().optional(),
  open_team_id: z.number().int().positive().optional()
});

// Schema pour les équipes ouvertes
export const insertOpenTeamSchema = z.object({
  mission_id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  // creator_id is set from authenticated user, not from client
  estimated_budget: z.number().int().positive().optional(),
  estimated_timeline_days: z.number().int().min(1).optional(),
  members: z.any().optional(),
  required_roles: z.any().optional(),
  max_members: z.number().int().min(2).max(10).optional(),
  status: z.enum(['recruiting', 'complete', 'submitted', 'cancelled']).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  auto_accept: z.boolean().optional()
});

// Schemas for new tables
export const insertReviewSchema = z.object({
  mission_id: z.number().int().positive(),
  reviewer_id: z.number().int().positive(),
  reviewee_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  response: z.string().optional(),
  criteria: z.any().optional(),
  is_public: z.boolean().optional(),
  helpful_count: z.number().int().min(0).optional(),
});

export const insertReviewHelpfulSchema = z.object({
  review_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
});

export const insertContractSchema = z.object({
  mission_id: z.number().int().positive(),
  bid_id: z.number().int().positive(),
  client_id: z.number().int().positive(),
  provider_id: z.number().int().positive(),
  status: z.enum(['pending_signature', 'active', 'in_progress', 'under_review', 'completed', 'disputed', 'cancelled']).optional(),
  terms: z.any().optional(),
  deliverables: z.any().optional(),
  milestones: z.any().optional(),
  client_signed_at: z.string().datetime().optional(),
  provider_signed_at: z.string().datetime().optional(),
  start_date: z.string().datetime().optional(),
  expected_end_date: z.string().datetime().optional(),
  actual_end_date: z.string().datetime().optional(),
});

export const insertDeliverableSchema = z.object({
  contract_id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'submitted', 'approved', 'rejected']).optional(),
  file_urls: z.any().optional(),
  submitted_at: z.string().datetime().optional(),
  reviewed_at: z.string().datetime().optional(),
  feedback: z.string().optional(),
});

export const insertNotificationSchema = z.object({
  user_id: z.number().int().positive(),
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().url().optional(),
  metadata: z.any().optional(),
  read_at: z.string().datetime().optional(),
});

export const insertFileSchema = z.object({
  user_id: z.number().int().positive(),
  filename: z.string().min(1),
  original_filename: z.string().min(1),
  file_type: z.string().min(1),
  file_size: z.number().int().min(0),
  file_url: z.string().url().min(1),
  context_type: z.string().optional(),
  context_id: z.number().int().positive().optional(),
  metadata: z.any().optional(),
});


export const insertAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['info', 'warning', 'error', 'success']).optional(),
  priority: z.number().int().min(1).optional(),
  is_active: z.boolean().optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'draft']).optional(),
  category: z.string().optional(),
  budget: z.number().int().min(0).optional(),
  location: z.string().optional(),
  user_id: z.number().int().positive().optional(),
  sponsored: z.boolean().optional()
});

export const insertFeedFeedbackSchema = z.object({
  announcement_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  feedback_type: z.enum(['like', 'dislike', 'interested', 'not_relevant'])
});

export const insertFeedSeenSchema = z.object({
  announcement_id: z.number().int().positive(),
  user_id: z.number().int().positive()
});

export const insertFavoritesSchema = z.object({
  user_id: z.number().int().positive(),
  announcement_id: z.number().int().positive()
});

export const aiEvents = pgTable('ai_events', {
  id: text('id').primaryKey(),
  phase: text('phase').$type<'pricing' | 'brief_enhance' | 'matching' | 'scoring'>().notNull(),
  provider: text('provider').notNull(),
  model_family: text('model_family').$type<'gemini' | 'openai' | 'local' | 'other'>().notNull(),
  model_name: text('model_name').notNull(),
  allow_training: boolean('allow_training').notNull(),
  input_redacted: jsonb('input_redacted'),
  output: jsonb('output'),
  confidence: text('confidence'),
  tokens: integer('tokens'),
  latency_ms: integer('latency_ms'),
  provenance: text('provenance').$type<'auto' | 'human_validated' | 'ab_test_winner'>().notNull(),
  prompt_hash: text('prompt_hash'),
  accepted: boolean('accepted'),
  rating: integer('rating'),
  edits: jsonb('edits'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const aiEventsRelations = relations(aiEvents, ({ one }) => ({
  // Pas de relations directes pour l'instant
}));

export const insertAiEventSchema = z.object({
  id: z.string(),
  phase: z.enum(['pricing', 'brief_enhance', 'matching', 'scoring']),
  provider: z.string(),
  model_family: z.enum(['gemini', 'openai', 'local', 'other']),
  model_name: z.string(),
  allow_training: z.boolean(),
  input_redacted: z.any().optional(),
  output: z.any().optional(),
  confidence: z.string().optional(),
  tokens: z.number().int().optional(),
  latency_ms: z.number().int().optional(),
  provenance: z.enum(['auto', 'human_validated', 'ab_test_winner']),
  prompt_hash: z.string().optional(),
  accepted: z.boolean().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  edits: z.any().optional()
});