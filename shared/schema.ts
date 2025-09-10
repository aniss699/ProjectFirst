
import { pgTable, serial, varchar, text, integer, timestamp, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

// ============================================
// SCHÉMA SIMPLIFIÉ ET HARMONISÉ
// ============================================
// Terminologie unifiée : missions (plus de projets/annonces)
// Utilisateurs appelés "users" partout

// Table des utilisateurs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('CLIENT').notNull(),
  rating_mean: decimal('rating_mean', { precision: 3, scale: 2 }).default('0'),
  rating_count: integer('rating_count').default(0),
  profile_data: jsonb('profile_data'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Table des missions (unifie projets/annonces)
export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  budget: integer('budget'),
  location: varchar('location', { length: 255 }),
  user_id: integer('user_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Table des offres (réponses aux missions)
export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  mission_id: integer('mission_id').references(() => missions.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;

// Table des événements AI (logs des interactions IA)
export const aiEvents = pgTable('ai_events', {
  id: varchar('id').primaryKey(),
  phase: varchar('phase', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 100 }).notNull(),
  model_family: varchar('model_family', { length: 50 }).notNull(),
  model_name: varchar('model_name', { length: 100 }).notNull(),
  allow_training: boolean('allow_training').notNull(),
  input_redacted: jsonb('input_redacted'),
  output: jsonb('output'),
  confidence: varchar('confidence'),
  tokens: integer('tokens'),
  latency_ms: integer('latency_ms'),
  provenance: varchar('provenance', { length: 100 }).notNull(),
  prompt_hash: varchar('prompt_hash', { length: 64 }).notNull(),
  accepted: boolean('accepted'),
  rating: integer('rating'),
  edits: text('edits'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;

// Table des annonces (feed)
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  budget_min: integer('budget_min'),
  budget_max: integer('budget_max'),
  location: varchar('location', { length: 255 }),
  user_id: integer('user_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  tags: jsonb('tags'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Table des retours sur le feed (feedback)
export const feedFeedback = pgTable('feed_feedback', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  announcement_id: integer('announcement_id').references(() => announcements.id).notNull(),
  feedback_type: varchar('feedback_type', { length: 50 }).notNull(), // 'like', 'dislike', 'not_interested'
  feedback_reason: varchar('feedback_reason', { length: 200 }),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Table des annonces vues par les utilisateurs
export const feedSeen = pgTable('feed_seen', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  announcement_id: integer('announcement_id').references(() => announcements.id).notNull(),
  seen_at: timestamp('seen_at').defaultNow().notNull()
});

export type AiEvent = typeof aiEvents.$inferSelect;
export type NewAiEvent = typeof aiEvents.$inferInsert;

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export type FeedFeedback = typeof feedFeedback.$inferSelect;
export type NewFeedFeedback = typeof feedFeedback.$inferInsert;

export type FeedSeen = typeof feedSeen.$inferSelect;
export type NewFeedSeen = typeof feedSeen.$inferInsert;

// Schémas de validation Zod
export const insertFeedFeedbackSchema = createInsertSchema(feedFeedback);
