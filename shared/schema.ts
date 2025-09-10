
import { pgTable, serial, varchar, timestamp, text, integer, decimal, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const missionStatusEnum = pgEnum('mission_status', [
  'draft',
  'published',
  'awarded',
  'in_progress',
  'completed',
  'cancelled',
  'expired'
]);

export const currencyCodeEnum = pgEnum('currency_code', ['EUR', 'USD', 'GBP', 'CHF']);
export const urgencyLevelEnum = pgEnum('urgency_level', ['low', 'medium', 'high', 'urgent']);

// ============================================
// TABLES PRINCIPALES
// ============================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('CLIENT'),
  rating_mean: decimal('rating_mean', { precision: 3, scale: 2 }),
  rating_count: integer('rating_count').default(0),
  profile_data: jsonb('profile_data'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Table missions simplifiée avec seulement les colonnes existantes
export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  
  // Contenu de base
  title: text('title').notNull(),
  description: text('description').notNull(),
  
  // Catégorisation basique
  category: text('category').notNull().default('developpement'),
  
  // Budget simplifié (en centimes pour EUR)
  budget: integer('budget').default(0), // Budget en centimes
  currency: text('currency').default('EUR'),
  
  // Localisation basique
  location: text('location'),
  
  // Relations essentielles
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Statut
  status: text('status').notNull().default('published'),
  
  // Audit
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  mission_id: integer('mission_id').notNull().references(() => missions.id, { onDelete: 'cascade' }),
  provider_id: integer('provider_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Proposition
  amount_cents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('EUR'),
  timeline_days: integer('timeline_days').notNull(),
  message: text('message').notNull(),
  
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Table announcements pour le feed (structure simple)
export const announcements = pgTable('announcements', {
  id: integer('id').primaryKey(), // = mission.id
  
  // Contenu feed
  title: text('title').notNull(),
  description: text('description').notNull(),
  excerpt: text('excerpt').notNull(),
  
  // Catégorisation
  category: text('category').notNull(),
  
  // Budget affichage
  budget_display: text('budget_display').notNull(),
  budget_value: integer('budget_value').default(0),
  currency: text('currency').default('EUR'),
  
  // Localisation
  location_display: text('location_display'),
  
  // Client
  client_id: integer('client_id').notNull(),
  client_display_name: text('client_display_name').notNull(),
  
  // Stats
  bids_count: integer('bids_count').default(0),
  
  // Status
  status: text('status').notNull().default('active'),
  
  // Audit
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// ============================================
// TABLES SECONDAIRES
// ============================================

export const aiEvents = pgTable('ai_events', {
  id: serial('id').primaryKey(),
  phase: text('phase').notNull(),
  prompt_hash: text('prompt_hash').notNull(),
  input_redacted: jsonb('input_redacted'),
  output: jsonb('output'),
  provider: text('provider').notNull().default('gemini-api'),
  accepted: boolean('accepted').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const feedFeedback = pgTable('feed_feedback', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  announcement_id: integer('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'view', 'click', 'apply', 'save', 'skip'
  dwell_ms: integer('dwell_ms'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  announcement_id: integer('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ============================================
// SCHEMAS ZOD
// ============================================

export const insertMissionSchema = createInsertSchema(missions, {
  title: z.string().min(3).max(500),
  description: z.string().min(10),
  budget: z.number().int().positive().optional(),
});

export const selectMissionSchema = createSelectSchema(missions);

export const insertBidSchema = createInsertSchema(bids, {
  amount_cents: z.number().int().positive(),
  timeline_days: z.number().int().positive(),
  message: z.string().min(10)
});

// ============================================
// TYPES TYPESCRIPT
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;

export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

// Types métier simplifiés
export interface MissionWithBids extends Mission {
  bids: Bid[];
  excerpt?: string;
  clientName?: string;
}

// Legacy pour compatibilité
export const projects = missions; // Alias
export type Project = Mission;
export type NewProject = NewMission;
