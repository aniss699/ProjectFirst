import { pgTable, serial, varchar, timestamp, text, integer, decimal, boolean, jsonb, real, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Tables Drizzle
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('CLIENT'),
  rating_mean: decimal('rating_mean', { precision: 3, scale: 2 }),
  rating_count: integer('rating_count').default(0),
  profile_data: jsonb('profile_data'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  budget: varchar('budget', { length: 100 }),
  category: varchar('category', { length: 100 }).notNull(),
  quality_target: varchar('quality_target', { length: 20 }),
  risk_tolerance: decimal('risk_tolerance', { precision: 3, scale: 2 }),
  geo_required: boolean('geo_required').default(false),
  onsite_radius_km: integer('onsite_radius_km'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  loc_score: decimal('loc_score', { precision: 5, scale: 2 }),
  client_id: integer('client_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id').notNull(),
  provider_id: integer('provider_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  timeline_days: integer('timeline_days').notNull(),
  message: text('message').notNull(),
  score_breakdown: jsonb('score_breakdown'),
  is_leading: boolean('is_leading').default(false),
  flagged: boolean('flagged').default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Schemas Zod
export const insertUserSchema = createInsertSchema(users);
export const insertProjectSchema = createInsertSchema(projects);
export const insertBidSchema = createInsertSchema(bids);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;

// Tables pour le feed TikTok
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  tags: text('tags').array(),
  city: varchar('city', { length: 100 }),
  budget_min: decimal('budget_min', { precision: 10, scale: 2 }),
  budget_max: decimal('budget_max', { precision: 10, scale: 2 }),
  deadline: timestamp('deadline'),
  media: jsonb('media'),
  quality_score: decimal('quality_score', { precision: 3, scale: 2 }),
  embeddings: text('embeddings'), // Stockage vectoriel simple
  user_id: integer('user_id').notNull(),
  sponsored: boolean('sponsored').default(false),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const feedFeedback = pgTable('feed_feedback', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  announcement_id: integer('announcement_id').notNull(),
  action: varchar('action', { length: 20 }).notNull(), // 'save', 'skip', 'open', 'offer', 'view'
  dwell_ms: integer('dwell_ms'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const feedSeen = pgTable('feed_seen', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  announcement_id: integer('announcement_id').notNull(),
  seen_at: timestamp('seen_at').defaultNow().notNull()
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  announcement_id: integer('announcement_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Schemas Zod pour les nouvelles tables
export const insertAnnouncementSchema = createInsertSchema(announcements);
export const insertFeedFeedbackSchema = createInsertSchema(feedFeedback);
export const insertFeedSeenSchema = createInsertSchema(feedSeen);

// Table pour les événements AI et l'orchestrateur
export const aiEvents = pgTable('ai_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  phase: varchar('phase', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  model_family: varchar('model_family', { length: 50 }).notNull(),
  model_name: varchar('model_name', { length: 100 }).notNull(),
  allow_training: boolean('allow_training').notNull(),
  input_redacted: jsonb('input_redacted'),
  output: jsonb('output'),
  confidence: decimal('confidence', { precision: 5, scale: 3 }),
  tokens: integer('tokens'),
  latency_ms: integer('latency_ms'),
  provenance: varchar('provenance', { length: 50 }).notNull(),
  prompt_hash: varchar('prompt_hash', { length: 64 }).notNull(),
  accepted: boolean('accepted'),
  rating: integer('rating'),
  edits: text('edits'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Tables pour géolocalisation
export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id'),
  project_id: integer('project_id'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  postal_code: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('France'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  radius_km: integer('radius_km').default(10),
  is_primary: boolean('is_primary').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Tables pour système d'évaluation
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  reviewer_id: integer('reviewer_id').notNull(),
  reviewed_id: integer('reviewed_id').notNull(),
  project_id: integer('project_id').notNull(),
  rating: integer('rating').notNull(), // 1-5 étoiles
  title: varchar('title', { length: 200 }),
  comment: text('comment'),
  criteria_scores: jsonb('criteria_scores'), // {quality: 5, communication: 4, deadline: 5, budget: 4}
  verified: boolean('verified').default(false),
  helpful_count: integer('helpful_count').default(0),
  response: text('response'), // Réponse du prestataire
  response_date: timestamp('response_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const badges = pgTable('badges', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  badge_type: varchar('badge_type', { length: 50 }).notNull(), // 'expert', 'reliable', 'top_rated', 'verified', 'local_hero'
  category: varchar('category', { length: 100 }), // Catégorie spécifique du badge
  level: integer('level').default(1), // Niveau du badge (1-5)
  criteria_met: jsonb('criteria_met'), // Critères qui ont permis d'obtenir le badge
  earned_at: timestamp('earned_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at'), // Certains badges peuvent expirer
  is_active: boolean('is_active').default(true)
});

export const reviewHelpful = pgTable('review_helpful', {
  id: serial('id').primaryKey(),
  review_id: integer('review_id').notNull(),
  user_id: integer('user_id').notNull(),
  is_helpful: boolean('is_helpful').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Tables pour métriques de réputation
export const reputationMetrics = pgTable('reputation_metrics', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  total_projects: integer('total_projects').default(0),
  completed_projects: integer('completed_projects').default(0),
  average_rating: decimal('average_rating', { precision: 3, scale: 2 }),
  response_time_avg_hours: integer('response_time_avg_hours'),
  on_time_delivery_rate: decimal('on_time_delivery_rate', { precision: 5, scale: 2 }),
  client_retention_rate: decimal('client_retention_rate', { precision: 5, scale: 2 }),
  trust_score: integer('trust_score').default(0), // Score sur 100
  verification_level: varchar('verification_level', { length: 20 }).default('basic'), // basic, verified, premium
  last_calculated: timestamp('last_calculated').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Types pour les nouvelles tables
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
export type FeedFeedback = typeof feedFeedback.$inferSelect;
export type NewFeedFeedback = typeof feedFeedback.$inferInsert;
export type FeedSeen = typeof feedSeen.$inferSelect;
export type NewFeedSeen = typeof feedSeen.$inferInsert;
export type AiEvent = typeof aiEvents.$inferSelect;
export type NewAiEvent = typeof aiEvents.$inferInsert;

// Types pour géolocalisation et évaluations
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
export type ReviewHelpful = typeof reviewHelpful.$inferSelect;
export type NewReviewHelpful = typeof reviewHelpful.$inferInsert;
export type ReputationMetric = typeof reputationMetrics.$inferSelect;
export type NewReputationMetric = typeof reputationMetrics.$inferInsert;

// Schémas Zod pour géolocalisation et évaluations
export const insertLocationSchema = createInsertSchema(locations);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertBadgeSchema = createInsertSchema(badges);
export const insertReviewHelpfulSchema = createInsertSchema(reviewHelpful);
export const insertReputationMetricSchema = createInsertSchema(reputationMetrics);

// Legacy interfaces pour compatibilité

// Interfaces legacy maintenues pour compatibilité
export interface LegacyUser {
  id: string;
  email: string;
  role: 'CLIENT' | 'PRO' | 'PERSON' | 'ADMIN';
  rating_mean?: number;
  rating_count?: number;
  created_at: Date;
}

export interface LegacyProject {
  id: string;
  title: string;
  description: string;
  budget: string;
  category: string;
  quality_target?: 'low' | 'medium' | 'high';
  risk_tolerance?: number;
  geo_required?: boolean;
  onsite_radius_km?: number;
  status: 'draft' | 'published' | 'in_progress' | 'completed';
  loc_score?: number;
  client_id: string;
  created_at: Date;
  updated_at: Date;
}

// NOUVEAU: Standardisation d'annonces
export interface ProjectStandardization {
  id: string;
  project_id: string;
  title_std: string;
  summary_std: string;
  acceptance_criteria: string[];
  category_std: string;
  sub_category_std: string;
  tags_std: string[];
  tasks_std: any[];
  deliverables_std: any[];
  skills_std: string[];
  constraints_std: string[];
  brief_quality_score: number;
  richness_score: number;
  missing_info: any[];
  price_suggested_min?: number;
  price_suggested_med?: number;
  price_suggested_max?: number;
  delay_suggested_days?: number;
  loc_uplift_reco?: any;
  rewrite_version: string;
  created_at: Date;
  updated_at: Date;
}

// NOUVEAU: Sources Web
export interface WebSource {
  id: string;
  domain: string;
  robots_txt?: any;
  crawl_policy?: any;
  last_ok_at?: Date;
  blocked: boolean;
  created_at: Date;
}

export interface WebDoc {
  id: string;
  url: string;
  domain: string;
  type: 'HOME' | 'ABOUT' | 'SERVICES' | 'PORTFOLIO' | 'PRICING' | 'CONTACT' | 'OTHER';
  title: string;
  text_summary: string;
  lang: string;
  published_at?: Date;
  fetched_at: Date;
  etag?: string;
  hash: string;
  source_type: 'RSS' | 'SITEMAP' | 'CRAWL';
  meta?: any;
}

export interface ExternalCompany {
  id: string;
  name: string;
  siren?: string;
  siret?: string;
  naf_code?: string;
  website?: string;
  emails: string[];
  phones: string[];
  address?: any;
  city?: string;
  postal_code?: string;
  country?: string;
  geo?: { lat: number; lng: number };
  social?: any;
  raw_tags: string[];
  skills: string[];
  confidence: number;
  first_seen_at: Date;
  last_seen_at: Date;
}

export interface ExternalCompanySignal {
  id: string;
  company_id: string;
  kind: 'PRICE' | 'AVAILABILITY' | 'PORTFOLIO' | 'RATING' | 'CLAIMED';
  payload: any;
  score: number;
  seen_at: Date;
}

export interface SourcingMatch {
  id: string;
  project_id: string;
  company_id: string;
  lead_score: number;
  reasons: any;
  status: 'CANDIDATE' | 'CONTACTED' | 'REFUSED' | 'CONVERTED';
  created_at: Date;
}

export interface LegacyBid {
  id: string;
  project_id: string;
  provider_id: string;
  amount: number;
  timeline_days: number;
  message: string;
  score_breakdown?: any;
  is_leading: boolean;
  flagged: boolean;
  created_at: Date;
}

// Mission table - corrected to match actual database structure
export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category'),
  budget_min: integer('budget_min'),
  budget_max: integer('budget_max'),
  location: text('location'),
  user_id: integer('user_id').references(() => users.id),
  provider_id: integer('provider_id').references(() => users.id),
  status: text('status').default('published'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  deadline: timestamp('deadline'),
  skills_required: text('skills_required').array(),
  is_team_mission: boolean('is_team_mission').default(false),
  team_size: integer('team_size').default(1),
  urgency: text('urgency'),
  remote_allowed: boolean('remote_allowed').default(true),
});

// Types for missions
export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;

// Schemas Zod for missions
export const insertMissionSchema = createInsertSchema(missions);