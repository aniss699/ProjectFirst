import { pgTable, serial, integer, text, timestamp, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
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
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  location: text('location'),
  budget_min: integer('budget_min'),
  budget_max: integer('budget_max'),
  budget_value_cents: integer('budget_value_cents'),
  urgency: text('urgency').$type<'low' | 'medium' | 'high' | 'urgent'>().default('medium'),
  status: text('status').$type<'draft' | 'open' | 'published' | 'assigned' | 'completed' | 'cancelled'>().default('open'),
  quality_target: text('quality_target').$type<'basic' | 'standard' | 'premium' | 'luxury'>().default('standard'),
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

// Relations entre les tables
export const usersRelations = relations(users, ({ many }) => ({
  missions: many(missions),
  bids: many(bids)
}));

export const missionsRelations = relations(missions, ({ one, many }) => ({
  user: one(users, {
    fields: [missions.user_id],
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

// Types are now inferred from the schema via InferSelectModel in shared/index.ts
// This removes duplication and ensures type consistency

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['CLIENT', 'PRO']),
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
  budget_min: z.number().int().min(0).optional(),
  budget_max: z.number().int().min(0).optional(),
  budget_value_cents: z.number().int().min(0).optional(),
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
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional()
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

// Export types that might be used elsewhere
export type FeedbackType = 'like' | 'dislike' | 'interested' | 'not_relevant';
export type AnnouncementStatus = 'active' | 'completed' | 'cancelled' | 'draft';