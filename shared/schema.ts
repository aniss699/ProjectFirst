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

export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),

  // Contenu
  title: text('title').notNull(),
  description: text('description').notNull(),
  excerpt: text('excerpt'), // Generated column

  // Catégorisation
  category: text('category').notNull().default('developpement'),
  tags: text('tags').array().default([]),
  skills_required: text('skills_required').array().default([]),

  // Budget (centimes)
  budget_type: text('budget_type').notNull().default('fixed'), // 'fixed' | 'range' | 'negotiable'
  budget_value_cents: integer('budget_value_cents'),
  budget_min_cents: integer('budget_min_cents'),
  budget_max_cents: integer('budget_max_cents'),
  currency: currencyCodeEnum('currency').notNull().default('EUR'),

  // Localisation
  location_raw: text('location_raw'),
  city: text('city'),
  postal_code: text('postal_code'),
  country: text('country').default('France'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  remote_allowed: boolean('remote_allowed').default(true),

  // Relations
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  client_id: integer('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider_id: integer('provider_id').references(() => users.id, { onDelete: 'set null' }),

  // Statut
  status: missionStatusEnum('status').notNull().default('draft'),
  urgency: urgencyLevelEnum('urgency').default('medium'),
  deadline: timestamp('deadline', { withTimezone: true }),

  // Équipe
  is_team_mission: boolean('is_team_mission').default(false),
  team_size: integer('team_size').default(1),

  // Métadonnées
  requirements: text('requirements'),
  deliverables: jsonb('deliverables').default([]),

  // Audit
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  published_at: timestamp('published_at', { withTimezone: true }),
  expires_at: timestamp('expires_at', { withTimezone: true }),

  // Recherche
  search_vector: text('search_vector') // TSVECTOR en SQL
});

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  mission_id: integer('mission_id').notNull().references(() => missions.id, { onDelete: 'cascade' }),
  provider_id: integer('provider_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Proposition
  amount_cents: integer('amount_cents').notNull(),
  currency: currencyCodeEnum('currency').notNull().default('EUR'),
  timeline_days: integer('timeline_days').notNull(),
  message: text('message').notNull(),

  // Métadonnées
  score_breakdown: jsonb('score_breakdown'),
  is_leading: boolean('is_leading').default(false),
  flagged: boolean('flagged').default(false),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const announcements = pgTable('announcements', {
  id: integer('id').primaryKey(), // = mission.id

  // Contenu feed
  title: text('title').notNull(),
  description: text('description').notNull(),
  excerpt: text('excerpt').notNull(),

  // Catégorisation
  category: text('category').notNull(),
  tags: text('tags').array().default([]),

  // Budget affichage
  budget_display: text('budget_display').notNull(),
  budget_value_cents: integer('budget_value_cents'),
  currency: text('currency').default('EUR'),

  // Localisation
  location_display: text('location_display'),
  city: text('city'),
  country: text('country'),

  // Client
  client_id: integer('client_id').notNull(),
  client_display_name: text('client_display_name').notNull(),

  // Stats
  bids_count: integer('bids_count').default(0),
  lowest_bid_cents: integer('lowest_bid_cents'),
  views_count: integer('views_count').default(0),
  saves_count: integer('saves_count').default(0),

  // Scoring
  quality_score: decimal('quality_score', { precision: 3, scale: 2 }).default('0.0'),
  engagement_score: decimal('engagement_score', { precision: 5, scale: 2 }).default('0.0'),
  freshness_score: decimal('freshness_score', { precision: 3, scale: 2 }).default('1.0'),

  // Status
  status: text('status').notNull().default('active'),
  urgency: text('urgency').default('medium'),
  deadline: timestamp('deadline', { withTimezone: true }),

  // Feed metadata
  is_sponsored: boolean('is_sponsored').default(false),
  boost_score: decimal('boost_score', { precision: 3, scale: 2 }).default('0.0'),

  // Recherche
  search_text: text('search_text').notNull(),
  search_vector: text('search_vector'),

  // Audit
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  synced_at: timestamp('synced_at', { withTimezone: true }).defaultNow()
});

// ============================================
// SCHEMAS ZOD
// ============================================

export const insertMissionSchema = createInsertSchema(missions, {
  title: z.string().min(3).max(500),
  description: z.string().min(10),
  budget_value_cents: z.number().int().positive().optional(),
  budget_min_cents: z.number().int().positive().optional(),
  budget_max_cents: z.number().int().positive().optional(),
  team_size: z.number().int().positive().default(1),
  deadline: z.string().datetime().optional()
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

// Types métier enrichis
export interface MissionWithBids extends Mission {
  bids: Bid[];
  bidsSummary: {
    count: number;
    lowestAmountCents: number | null;
    averageAmountCents: number | null;
  };
  client: {
    id: number;
    displayName: string;
  };
  permissions: {
    canEdit: boolean;
    canApply: boolean;
    canView: boolean;
  };
}

export interface BudgetObject {
  type: 'fixed' | 'range' | 'negotiable';
  valueCents?: number;
  minCents?: number;
  maxCents?: number;
  currency: string;
  display: string;
}

export interface LocationObject {
  raw?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  display: string;
  remoteAllowed: boolean;
}

// Legacy pour compatibilité (à supprimer progressivement)
export const projects = missions; // Alias
export type Project = Mission;
export type NewProject = NewMission;