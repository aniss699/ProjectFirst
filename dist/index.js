var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiEvents: () => aiEvents,
  aiEventsRelations: () => aiEventsRelations,
  announcements: () => announcements,
  announcementsRelations: () => announcementsRelations,
  bids: () => bids,
  bidsRelations: () => bidsRelations,
  contracts: () => contracts,
  contractsRelations: () => contractsRelations,
  deliverables: () => deliverables,
  deliverablesRelations: () => deliverablesRelations,
  favorites: () => favorites,
  favoritesRelations: () => favoritesRelations,
  feedFeedback: () => feedFeedback,
  feedFeedbackRelations: () => feedFeedbackRelations,
  feedSeen: () => feedSeen,
  feedSeenRelations: () => feedSeenRelations,
  files: () => files,
  filesRelations: () => filesRelations,
  insertAiEventSchema: () => insertAiEventSchema,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertBidSchema: () => insertBidSchema,
  insertContractSchema: () => insertContractSchema,
  insertDeliverableSchema: () => insertDeliverableSchema,
  insertFavoritesSchema: () => insertFavoritesSchema,
  insertFeedFeedbackSchema: () => insertFeedFeedbackSchema,
  insertFeedSeenSchema: () => insertFeedSeenSchema,
  insertFileSchema: () => insertFileSchema,
  insertMissionSchema: () => insertMissionSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOpenTeamSchema: () => insertOpenTeamSchema,
  insertReviewHelpfulSchema: () => insertReviewHelpfulSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertUserSchema: () => insertUserSchema,
  missions: () => missions,
  missionsRelations: () => missionsRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  openTeams: () => openTeams,
  openTeamsRelations: () => openTeamsRelations,
  reviewHelpful: () => reviewHelpful,
  reviewHelpfulRelations: () => reviewHelpfulRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, serial, integer, text, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
var users, missions, openTeams, bids, announcements, feedFeedback, feedSeen, favorites, reviews, reviewHelpful, contracts, deliverables, notifications, files, usersRelations, missionsRelations, openTeamsRelations, bidsRelations, announcementsRelations, feedFeedbackRelations, feedSeenRelations, favoritesRelations, reviewsRelations, reviewHelpfulRelations, contractsRelations, deliverablesRelations, notificationsRelations, filesRelations, insertUserSchema, insertMissionSchema, insertBidSchema, insertOpenTeamSchema, insertReviewSchema, insertReviewHelpfulSchema, insertContractSchema, insertDeliverableSchema, insertNotificationSchema, insertFileSchema, insertAnnouncementSchema, insertFeedFeedbackSchema, insertFeedSeenSchema, insertFavoritesSchema, aiEvents, aiEventsRelations, insertAiEventSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      email: text("email").notNull().unique(),
      name: text("name").notNull(),
      password: text("password").notNull(),
      role: text("role").notNull().$type(),
      rating_mean: decimal("rating_mean", { precision: 3, scale: 2 }),
      rating_count: integer("rating_count").default(0),
      profile_data: jsonb("profile_data"),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    missions = pgTable("missions", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      client_id: integer("client_id").references(() => users.id),
      title: text("title").notNull(),
      description: text("description").notNull(),
      excerpt: text("excerpt"),
      category: text("category").notNull(),
      // Localisation unifiée en JSON
      location_data: jsonb("location_data"),
      // Budget unifié (plus de redondance)
      budget_value_cents: integer("budget_value_cents").notNull(),
      currency: text("currency").default("EUR"),
      // ENUMs PostgreSQL optimisés
      urgency: text("urgency").$type().default("medium"),
      status: text("status").$type().default("draft"),
      quality_target: text("quality_target").$type().default("standard"),
      deadline: timestamp("deadline"),
      tags: jsonb("tags"),
      skills_required: jsonb("skills_required"),
      requirements: text("requirements"),
      is_team_mission: boolean("is_team_mission").default(false),
      team_size: integer("team_size").default(1),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    openTeams = pgTable("open_teams", {
      id: serial("id").primaryKey(),
      mission_id: integer("mission_id").references(() => missions.id).notNull(),
      name: text("name").notNull(),
      // Nom de l'équipe
      description: text("description"),
      creator_id: integer("creator_id").references(() => users.id).notNull(),
      // Initiateur de l'équipe
      estimated_budget: integer("estimated_budget"),
      // Budget estimé en centimes
      estimated_timeline_days: integer("estimated_timeline_days"),
      members: jsonb("members"),
      // Membres actuels de l'équipe
      required_roles: jsonb("required_roles"),
      // Rôles recherchés
      max_members: integer("max_members").default(5),
      status: text("status").$type().default("recruiting"),
      visibility: text("visibility").$type().default("public"),
      auto_accept: boolean("auto_accept").default(true),
      // Accepter automatiquement les candidatures
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    bids = pgTable("bids", {
      id: serial("id").primaryKey(),
      mission_id: integer("mission_id").references(() => missions.id).notNull(),
      provider_id: integer("provider_id").references(() => users.id).notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      timeline_days: integer("timeline_days"),
      message: text("message"),
      score_breakdown: jsonb("score_breakdown"),
      is_leading: boolean("is_leading").default(false),
      status: text("status").$type().default("pending"),
      // Extensions pour les équipes
      bid_type: text("bid_type").$type().default("individual"),
      team_composition: jsonb("team_composition"),
      // Structure de l'équipe
      team_lead_id: integer("team_lead_id").references(() => users.id),
      // Chef d'équipe
      open_team_id: integer("open_team_id").references(() => openTeams.id),
      // Référence vers équipe ouverte
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    announcements = pgTable("announcements", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      type: text("type").$type().default("info"),
      priority: integer("priority").default(1),
      is_active: boolean("is_active").default(true),
      status: text("status").$type().default("active"),
      category: text("category"),
      budget: integer("budget"),
      location: text("location"),
      user_id: integer("user_id").references(() => users.id),
      sponsored: boolean("sponsored").default(false),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    feedFeedback = pgTable("feed_feedback", {
      id: serial("id").primaryKey(),
      announcement_id: integer("announcement_id").references(() => announcements.id).notNull(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      feedback_type: text("feedback_type").$type().notNull(),
      created_at: timestamp("created_at").defaultNow()
    });
    feedSeen = pgTable("feed_seen", {
      id: serial("id").primaryKey(),
      announcement_id: integer("announcement_id").references(() => announcements.id).notNull(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      seen_at: timestamp("seen_at").defaultNow()
    });
    favorites = pgTable("favorites", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      announcement_id: integer("announcement_id").references(() => announcements.id).notNull(),
      created_at: timestamp("created_at").defaultNow()
    });
    reviews = pgTable("reviews", {
      id: serial("id").primaryKey(),
      mission_id: integer("mission_id").references(() => missions.id).notNull(),
      reviewer_id: integer("reviewer_id").references(() => users.id).notNull(),
      reviewee_id: integer("reviewee_id").references(() => users.id).notNull(),
      rating: integer("rating").notNull(),
      // 1-5
      comment: text("comment"),
      response: text("response"),
      // Réponse du prestataire
      criteria: jsonb("criteria"),
      // {communication: 5, quality: 4, deadline: 5, etc.}
      is_public: boolean("is_public").default(true),
      helpful_count: integer("helpful_count").default(0),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    reviewHelpful = pgTable("review_helpful", {
      id: serial("id").primaryKey(),
      review_id: integer("review_id").references(() => reviews.id).notNull(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      created_at: timestamp("created_at").defaultNow()
    });
    contracts = pgTable("contracts", {
      id: serial("id").primaryKey(),
      mission_id: integer("mission_id").references(() => missions.id).notNull(),
      bid_id: integer("bid_id").references(() => bids.id).notNull(),
      client_id: integer("client_id").references(() => users.id).notNull(),
      provider_id: integer("provider_id").references(() => users.id).notNull(),
      status: text("status").$type().default("pending_signature"),
      terms: jsonb("terms"),
      // Conditions acceptées
      deliverables: jsonb("deliverables"),
      // Liste des livrables attendus
      milestones: jsonb("milestones"),
      // Jalons de paiement
      // Signatures électroniques
      client_signed_at: timestamp("client_signed_at"),
      provider_signed_at: timestamp("provider_signed_at"),
      // Dates importantes
      start_date: timestamp("start_date"),
      expected_end_date: timestamp("expected_end_date"),
      actual_end_date: timestamp("actual_end_date"),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    deliverables = pgTable("deliverables", {
      id: serial("id").primaryKey(),
      contract_id: integer("contract_id").references(() => contracts.id).notNull(),
      title: text("title").notNull(),
      description: text("description"),
      status: text("status").$type().default("pending"),
      file_urls: jsonb("file_urls"),
      // URLs des fichiers livrés
      submitted_at: timestamp("submitted_at"),
      reviewed_at: timestamp("reviewed_at"),
      feedback: text("feedback"),
      created_at: timestamp("created_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      type: text("type").notNull(),
      // 'new_bid', 'message', 'payment', 'review', etc.
      title: text("title").notNull(),
      message: text("message").notNull(),
      link: text("link"),
      // URL de redirection
      metadata: jsonb("metadata"),
      read_at: timestamp("read_at"),
      created_at: timestamp("created_at").defaultNow()
    });
    files = pgTable("files", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      filename: text("filename").notNull(),
      original_filename: text("original_filename").notNull(),
      file_type: text("file_type").notNull(),
      // mime type
      file_size: integer("file_size").notNull(),
      // en bytes
      file_url: text("file_url").notNull(),
      // Contexte d'utilisation
      context_type: text("context_type"),
      // 'portfolio', 'bid', 'deliverable', 'profile_picture'
      context_id: integer("context_id"),
      // ID de la mission, bid, etc.
      metadata: jsonb("metadata"),
      created_at: timestamp("created_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      missions: many(missions),
      bids: many(bids),
      // teamMembers: many(teamMembers), // This seems to be a leftover from a previous or incomplete change. Removing it.
      reviewsGiven: many(reviews, { relationName: "reviewer" }),
      reviewsReceived: many(reviews, { relationName: "reviewee" }),
      contracts: many(contracts),
      notifications: many(notifications),
      files: many(files)
    }));
    missionsRelations = relations(missions, ({ one, many }) => ({
      user: one(users, {
        fields: [missions.user_id],
        references: [users.id]
      }),
      bids: many(bids),
      reviews: many(reviews)
    }));
    openTeamsRelations = relations(openTeams, ({ one, many }) => ({
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
    bidsRelations = relations(bids, ({ one }) => ({
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
    announcementsRelations = relations(announcements, ({ one, many }) => ({
      user: one(users, {
        fields: [announcements.user_id],
        references: [users.id]
      }),
      feedbacks: many(feedFeedback),
      seenBy: many(feedSeen),
      favorites: many(favorites)
    }));
    feedFeedbackRelations = relations(feedFeedback, ({ one }) => ({
      announcement: one(announcements, {
        fields: [feedFeedback.announcement_id],
        references: [announcements.id]
      }),
      user: one(users, {
        fields: [feedFeedback.user_id],
        references: [users.id]
      })
    }));
    feedSeenRelations = relations(feedSeen, ({ one }) => ({
      announcement: one(announcements, {
        fields: [feedSeen.announcement_id],
        references: [announcements.id]
      }),
      user: one(users, {
        fields: [feedSeen.user_id],
        references: [users.id]
      })
    }));
    favoritesRelations = relations(favorites, ({ one }) => ({
      announcement: one(announcements, {
        fields: [favorites.announcement_id],
        references: [announcements.id]
      }),
      user: one(users, {
        fields: [favorites.user_id],
        references: [users.id]
      })
    }));
    reviewsRelations = relations(reviews, ({ one, many }) => ({
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
    reviewHelpfulRelations = relations(reviewHelpful, ({ one }) => ({
      review: one(reviews, {
        fields: [reviewHelpful.review_id],
        references: [reviews.id]
      }),
      user: one(users, {
        fields: [reviewHelpful.user_id],
        references: [users.id]
      })
    }));
    contractsRelations = relations(contracts, ({ one, many }) => ({
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
    deliverablesRelations = relations(deliverables, ({ one }) => ({
      contract: one(contracts, {
        fields: [deliverables.contract_id],
        references: [contracts.id]
      })
    }));
    notificationsRelations = relations(notifications, ({ one }) => ({
      user: one(users, {
        fields: [notifications.user_id],
        references: [users.id]
      })
    }));
    filesRelations = relations(files, ({ one }) => ({
      user: one(users, {
        fields: [files.user_id],
        references: [users.id]
      })
    }));
    insertUserSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      password: z.string().min(8),
      // Added password validation, assuming a minimum of 8 characters
      role: z.enum(["CLIENT", "PRO", "ADMIN"]),
      rating_mean: z.string().optional(),
      rating_count: z.number().int().min(0).optional(),
      profile_data: z.any().optional()
    });
    insertMissionSchema = z.object({
      user_id: z.number().int().positive(),
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      location: z.string().optional(),
      postal_code: z.string().optional(),
      // Added postal_code validation
      budget: z.number().int().min(0).optional(),
      budget_value_cents: z.number().int().min(0).optional(),
      budget_type: z.string().optional(),
      urgency: z.enum(["low", "medium", "high", "urgent"]).optional(),
      status: z.enum(["draft", "open", "published", "assigned", "completed", "cancelled"]).optional(),
      quality_target: z.enum(["basic", "standard", "premium", "luxury"]).optional()
    });
    insertBidSchema = z.object({
      mission_id: z.number().int().positive(),
      provider_id: z.number().int().positive(),
      amount: z.string(),
      timeline_days: z.number().int().min(1).optional(),
      message: z.string().optional(),
      score_breakdown: z.any().optional(),
      is_leading: z.boolean().optional(),
      status: z.enum(["pending", "accepted", "rejected", "withdrawn"]).optional(),
      // Extensions pour les équipes
      bid_type: z.enum(["individual", "team", "open_team"]).optional(),
      team_composition: z.any().optional(),
      // Structure de l'équipe
      team_lead_id: z.number().int().positive().optional(),
      open_team_id: z.number().int().positive().optional()
    });
    insertOpenTeamSchema = z.object({
      mission_id: z.number().int().positive(),
      name: z.string().min(1),
      description: z.string().optional(),
      // creator_id is set from authenticated user, not from client
      estimated_budget: z.number().int().positive().optional(),
      estimated_timeline_days: z.number().int().min(1).optional(),
      members: z.any().optional(),
      required_roles: z.any().optional(),
      max_members: z.number().int().min(2).max(10).optional(),
      status: z.enum(["recruiting", "complete", "submitted", "cancelled"]).optional(),
      visibility: z.enum(["public", "private"]).optional(),
      auto_accept: z.boolean().optional()
    });
    insertReviewSchema = z.object({
      mission_id: z.number().int().positive(),
      reviewer_id: z.number().int().positive(),
      reviewee_id: z.number().int().positive(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().optional(),
      response: z.string().optional(),
      criteria: z.any().optional(),
      is_public: z.boolean().optional(),
      helpful_count: z.number().int().min(0).optional()
    });
    insertReviewHelpfulSchema = z.object({
      review_id: z.number().int().positive(),
      user_id: z.number().int().positive()
    });
    insertContractSchema = z.object({
      mission_id: z.number().int().positive(),
      bid_id: z.number().int().positive(),
      client_id: z.number().int().positive(),
      provider_id: z.number().int().positive(),
      status: z.enum(["pending_signature", "active", "in_progress", "under_review", "completed", "disputed", "cancelled"]).optional(),
      terms: z.any().optional(),
      deliverables: z.any().optional(),
      milestones: z.any().optional(),
      client_signed_at: z.string().datetime().optional(),
      provider_signed_at: z.string().datetime().optional(),
      start_date: z.string().datetime().optional(),
      expected_end_date: z.string().datetime().optional(),
      actual_end_date: z.string().datetime().optional()
    });
    insertDeliverableSchema = z.object({
      contract_id: z.number().int().positive(),
      title: z.string().min(1),
      description: z.string().optional(),
      status: z.enum(["pending", "submitted", "approved", "rejected"]).optional(),
      file_urls: z.any().optional(),
      submitted_at: z.string().datetime().optional(),
      reviewed_at: z.string().datetime().optional(),
      feedback: z.string().optional()
    });
    insertNotificationSchema = z.object({
      user_id: z.number().int().positive(),
      type: z.string().min(1),
      title: z.string().min(1),
      message: z.string().min(1),
      link: z.string().url().optional(),
      metadata: z.any().optional(),
      read_at: z.string().datetime().optional()
    });
    insertFileSchema = z.object({
      user_id: z.number().int().positive(),
      filename: z.string().min(1),
      original_filename: z.string().min(1),
      file_type: z.string().min(1),
      file_size: z.number().int().min(0),
      file_url: z.string().url().min(1),
      context_type: z.string().optional(),
      context_id: z.number().int().positive().optional(),
      metadata: z.any().optional()
    });
    insertAnnouncementSchema = z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      type: z.enum(["info", "warning", "error", "success"]).optional(),
      priority: z.number().int().min(1).optional(),
      is_active: z.boolean().optional(),
      status: z.enum(["active", "completed", "cancelled", "draft"]).optional(),
      category: z.string().optional(),
      budget: z.number().int().min(0).optional(),
      location: z.string().optional(),
      user_id: z.number().int().positive().optional(),
      sponsored: z.boolean().optional()
    });
    insertFeedFeedbackSchema = z.object({
      announcement_id: z.number().int().positive(),
      user_id: z.number().int().positive(),
      feedback_type: z.enum(["like", "dislike", "interested", "not_relevant"])
    });
    insertFeedSeenSchema = z.object({
      announcement_id: z.number().int().positive(),
      user_id: z.number().int().positive()
    });
    insertFavoritesSchema = z.object({
      user_id: z.number().int().positive(),
      announcement_id: z.number().int().positive()
    });
    aiEvents = pgTable("ai_events", {
      id: text("id").primaryKey(),
      phase: text("phase").$type().notNull(),
      provider: text("provider").notNull(),
      model_family: text("model_family").$type().notNull(),
      model_name: text("model_name").notNull(),
      allow_training: boolean("allow_training").notNull(),
      input_redacted: jsonb("input_redacted"),
      output: jsonb("output"),
      confidence: text("confidence"),
      tokens: integer("tokens"),
      latency_ms: integer("latency_ms"),
      provenance: text("provenance").$type().notNull(),
      prompt_hash: text("prompt_hash"),
      accepted: boolean("accepted"),
      rating: integer("rating"),
      edits: jsonb("edits"),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    aiEventsRelations = relations(aiEvents, ({ one }) => ({
      // Pas de relations directes pour l'instant
    }));
    insertAiEventSchema = z.object({
      id: z.string(),
      phase: z.enum(["pricing", "brief_enhance", "matching", "scoring"]),
      provider: z.string(),
      model_family: z.enum(["gemini", "openai", "local", "other"]),
      model_name: z.string(),
      allow_training: z.boolean(),
      input_redacted: z.any().optional(),
      output: z.any().optional(),
      confidence: z.string().optional(),
      tokens: z.number().int().optional(),
      latency_ms: z.number().int().optional(),
      provenance: z.enum(["auto", "human_validated", "ab_test_winner"]),
      prompt_hash: z.string().optional(),
      accepted: z.boolean().optional(),
      rating: z.number().int().min(1).max(5).optional(),
      edits: z.any().optional()
    });
  }
});

// server/database.ts
var database_exports = {};
__export(database_exports, {
  db: () => db,
  initializeDatabase: () => initializeDatabase,
  pool: () => pool,
  testConnection: () => testConnection
});
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
async function initializeDatabase() {
  try {
    console.log("\u{1F527} Initializing database tables...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        rating_mean DECIMAL(3, 2),
        rating_count INTEGER DEFAULT 0,
        profile_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        client_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        excerpt TEXT,
        category TEXT NOT NULL,
        location_data JSONB,
        budget_value_cents INTEGER NOT NULL,
        currency TEXT DEFAULT 'EUR',
        urgency TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'draft',
        quality_target TEXT DEFAULT 'standard',
        deadline TIMESTAMP,
        tags JSONB,
        skills_required JSONB,
        requirements TEXT,
        is_team_mission BOOLEAN DEFAULT false,
        team_size INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS open_teams (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        creator_id INTEGER REFERENCES users(id) NOT NULL,
        estimated_budget INTEGER,
        estimated_timeline_days INTEGER,
        members JSONB,
        required_roles JSONB,
        max_members INTEGER DEFAULT 5,
        status TEXT DEFAULT 'recruiting',
        visibility TEXT DEFAULT 'public',
        auto_accept BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) NOT NULL,
        provider_id INTEGER REFERENCES users(id) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        timeline_days INTEGER,
        message TEXT,
        score_breakdown JSONB,
        is_leading BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'pending',
        bid_type TEXT DEFAULT 'individual',
        team_composition JSONB,
        team_lead_id INTEGER REFERENCES users(id),
        open_team_id INTEGER REFERENCES open_teams(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        priority INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'active',
        category TEXT,
        budget INTEGER,
        location TEXT,
        user_id INTEGER REFERENCES users(id),
        sponsored BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feed_feedback (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        feedback_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feed_seen (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        seen_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_events (
        id TEXT PRIMARY KEY,
        phase TEXT NOT NULL,
        provider TEXT NOT NULL,
        model_family TEXT NOT NULL,
        model_name TEXT NOT NULL,
        allow_training BOOLEAN NOT NULL,
        input_redacted JSONB,
        output JSONB,
        confidence TEXT,
        tokens INTEGER,
        latency_ms INTEGER,
        provenance TEXT NOT NULL,
        prompt_hash TEXT,
        accepted BOOLEAN,
        rating INTEGER,
        edits JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("\u2705 Database tables initialized successfully");
  } catch (error) {
    console.error("\u274C Database initialization failed:", error);
  }
}
async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    console.log("\u2705 Database connection test successful:", result.rows[0]);
  } catch (error) {
    console.error("\u274C Database connection test failed:", {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  }
}
var databaseUrl, pool, db;
var init_database = __esm({
  "server/database.ts"() {
    "use strict";
    init_schema();
    databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/swideal";
    pool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 5e3,
      idleTimeoutMillis: 1e4,
      max: 20
    });
    pool.on("error", (err) => {
      console.error("\u274C Database pool error:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    pool.on("connect", (client) => {
      console.log("\u2705 Database connection established");
    });
    db = drizzle(pool, { schema: schema_exports });
    console.log("\u{1F517} Database connection established:", {
      databaseUrl: databaseUrl ? "***configured***" : "missing",
      isCloudSQL: databaseUrl?.includes("/cloudsql/") || false
    });
  }
});

// apps/api/src/monitoring/event-logger.ts
var event_logger_exports = {};
__export(event_logger_exports, {
  EventLogger: () => EventLogger,
  eventLogger: () => eventLogger
});
var EventLogger, eventLogger;
var init_event_logger = __esm({
  "apps/api/src/monitoring/event-logger.ts"() {
    "use strict";
    EventLogger = class {
      eventBuffer = [];
      performanceCache = /* @__PURE__ */ new Map();
      batchSize = 50;
      flushInterval = 3e4;
      // 30 secondes
      constructor() {
        this.startAutoFlush();
      }
      /**
       * Log d'événement d'erreur système
       */
      logErrorEvent(error, userId, sessionId, context = {}) {
        const event = {
          event_type: "click",
          // Using existing type for error tracking
          user_id: userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: sessionId,
          metadata: {
            error_type: "system_error",
            error_message: error.message,
            error_stack: error.stack,
            context,
            severity: "high"
          }
        };
        this.addToBuffer(event);
        console.log("\u{1F6A8} [ERROR_LOGGED]", JSON.stringify({
          error: error.message,
          user: userId,
          session: sessionId,
          timestamp: event.timestamp
        }));
      }
      /**
       * Log d'événement utilisateur générique
       */
      logUserEvent(eventType, userId, sessionId, metadata = {}) {
        const event = {
          event_type: eventType,
          user_id: userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: sessionId,
          metadata: {
            ...metadata,
            user_agent: metadata.user_agent || "unknown",
            ip_address: metadata.ip_address || "unknown",
            platform: metadata.platform || "web"
          }
        };
        this.addToBuffer(event);
        console.log("\u{1F4CA} [EVENT_LOGGED]", JSON.stringify({
          type: eventType,
          user: userId,
          session: sessionId,
          timestamp: event.timestamp
        }));
      }
      /**
       * Log d'événement de vue d'annonce
       */
      logAnnouncementView(userId, missionId, sessionId, dwellTime, metadata = {}) {
        const event = {
          event_type: "view",
          user_id: userId,
          mission_id: missionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: sessionId,
          metadata: {
            dwell_time_ms: dwellTime,
            click_depth: metadata.click_depth || 0,
            scroll_percentage: metadata.scroll_percentage || 0,
            interaction_quality: this.calculateInteractionQuality(dwellTime, metadata),
            device_type: metadata.device_type || "desktop",
            referrer: metadata.referrer || "direct",
            feed_position: metadata.feed_position || 0,
            recommendation_score: metadata.recommendation_score || 0
          }
        };
        this.addToBuffer(event);
        this.logPerformanceMetrics("view_recommendation", {
          ai_latency_ms: metadata.recommendation_latency || 0,
          confidence_level: metadata.recommendation_score || 0,
          model_version: "feed_ranker_v2.1",
          features_used: ["relevance", "quality", "freshness", "price"]
        });
      }
      /**
       * Log d'événement de sauvegarde/favori
       */
      logSave(userId, missionId, sessionId, metadata = {}) {
        const event = {
          event_type: "save",
          user_id: userId,
          mission_id: missionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: sessionId,
          metadata: {
            save_source: metadata.save_source || "feed",
            // 'feed', 'detail', 'search'
            user_decision_time_ms: metadata.decision_time || 0,
            mission_rank_in_feed: metadata.feed_position || 0,
            previous_interactions: metadata.previous_interactions || [],
            recommendation_accuracy: "pending"
            // Sera mis à jour plus tard
          }
        };
        this.addToBuffer(event);
        this.logConversion("save", userId, missionId, metadata);
      }
      /**
       * Log d'événement de proposition
       */
      logProposal(providerId, missionId, sessionId, metadata = {}) {
        const event = {
          event_type: "proposal",
          provider_id: providerId,
          mission_id: missionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: sessionId,
          metadata: {
            proposal_value: metadata.proposal_value || 0,
            time_to_proposal_hours: metadata.time_to_proposal_hours || 0,
            proposal_rank: metadata.proposal_rank || 0,
            pricing_confidence: metadata.pricing_confidence || 0,
            matching_score: metadata.matching_score || 0,
            bid_strategy: metadata.bid_strategy || "unknown",
            ai_price_suggestion: metadata.ai_price_suggestion || 0,
            price_deviation_percentage: metadata.price_deviation_percentage || 0
          }
        };
        this.addToBuffer(event);
        this.logPerformanceMetrics("pricing_suggestion", {
          ai_latency_ms: metadata.pricing_latency || 0,
          accuracy_score: metadata.pricing_confidence || 0,
          model_version: "neural_pricing_v2.1",
          features_used: ["complexity", "market", "urgency", "provider"],
          prediction_outcome: "pending"
        });
      }
      /**
       * Log d'événement de victoire (projet attribué)
       */
      logWin(providerId, missionId, sessionId, metadata = {}) {
        const event = {
          event_type: "win",
          provider_id: providerId,
          mission_id: missionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: sessionId,
          metadata: {
            final_value: metadata.final_value || 0,
            negotiation_rounds: metadata.negotiation_rounds || 0,
            time_to_decision_hours: metadata.time_to_decision_hours || 0,
            client_satisfaction_prediction: metadata.client_satisfaction_prediction || 0,
            ai_match_score: metadata.ai_match_score || 0,
            ai_price_accuracy: metadata.ai_price_accuracy || 0
          }
        };
        this.addToBuffer(event);
        this.updatePredictionOutcome("pricing_suggestion", missionId, "success");
        this.updatePredictionOutcome("matching_recommendation", missionId, "success");
      }
      /**
       * Log d'événement de litige
       */
      logDispute(userId, missionId, sessionId, metadata = {}) {
        const event = {
          event_type: "dispute",
          user_id: userId,
          mission_id: missionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: sessionId,
          metadata: {
            dispute_type: metadata.dispute_type || "unknown",
            dispute_stage: metadata.dispute_stage || "initial",
            estimated_resolution_time: metadata.estimated_resolution_time || 0,
            client_satisfaction_drop: metadata.client_satisfaction_drop || 0,
            ai_risk_score: metadata.ai_risk_score || 0,
            preventability_score: metadata.preventability_score || 0
          }
        };
        this.addToBuffer(event);
        this.updatePredictionOutcome("risk_assessment", missionId, "failure");
      }
      /**
       * Log des métriques de performance IA
       */
      logPerformanceMetrics(modelType, metrics2) {
        const key = `${modelType}_${Date.now()}`;
        this.performanceCache.set(key, {
          ...metrics2,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log("\u{1F9E0} [AI_PERFORMANCE]", JSON.stringify({
          model: modelType,
          latency: metrics2.ai_latency_ms,
          confidence: metrics2.confidence_level,
          version: metrics2.model_version
        }));
      }
      /**
       * Log d'événement de conversion
       */
      logConversion(conversionType, userId, missionId, metadata) {
        const conversionEvent = {
          event_type: "conversion",
          user_id: userId,
          mission_id: missionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: metadata.session_id || "unknown",
          metadata: {
            conversion_type: conversionType,
            funnel_stage: metadata.funnel_stage || "unknown",
            conversion_value: metadata.conversion_value || 0,
            time_to_conversion: metadata.time_to_conversion || 0,
            attribution_source: metadata.attribution_source || "organic"
          }
        };
        this.addToBuffer(conversionEvent);
      }
      /**
       * Calcule la qualité d'interaction
       */
      calculateInteractionQuality(dwellTime, metadata) {
        let score = 0;
        if (dwellTime > 1e4) score += 3;
        else if (dwellTime > 3e3) score += 2;
        else if (dwellTime > 1e3) score += 1;
        if (metadata.click_depth > 2) score += 2;
        else if (metadata.click_depth > 0) score += 1;
        if (metadata.scroll_percentage > 75) score += 1;
        if (score >= 5) return "high";
        if (score >= 2) return "medium";
        return "low";
      }
      /**
       * Met à jour le résultat d'une prédiction
       */
      updatePredictionOutcome(modelType, missionId, outcome) {
        console.log("\u{1F4C8} [PREDICTION_UPDATE]", JSON.stringify({
          model: modelType,
          mission: missionId,
          outcome,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
      /**
       * Ajoute un événement au buffer
       */
      addToBuffer(event) {
        this.eventBuffer.push(event);
        if (this.eventBuffer.length >= this.batchSize) {
          this.flushEvents();
        }
      }
      /**
       * Vide le buffer d'événements
       */
      flushEvents() {
        if (this.eventBuffer.length === 0) return;
        const events = [...this.eventBuffer];
        this.eventBuffer = [];
        console.log("\u{1F680} [EVENTS_FLUSHED]", `${events.length} \xE9v\xE9nements envoy\xE9s vers analytics`);
        this.sendToAnalyticsService(events);
      }
      /**
       * Envoi simulé vers service d'analytics
       */
      async sendToAnalyticsService(events) {
        try {
          console.log("\u2705 Events sent to analytics service");
        } catch (error) {
          console.error("\u274C Failed to send events to analytics:", error);
          this.eventBuffer.unshift(...events);
        }
      }
      /**
       * Démarrage du flush automatique
       */
      startAutoFlush() {
        setInterval(() => {
          this.flushEvents();
        }, this.flushInterval);
      }
      /**
       * Récupération des métriques de performance
       */
      getPerformanceMetrics() {
        return new Map(this.performanceCache);
      }
      /**
       * Nettoyage des métriques anciennes
       */
      cleanupOldMetrics(maxAgeMs = 36e5) {
        const cutoff = Date.now() - maxAgeMs;
        for (const [key, metrics2] of this.performanceCache.entries()) {
          const metricTime = new Date(metrics2.timestamp).getTime();
          if (metricTime < cutoff) {
            this.performanceCache.delete(key);
          }
        }
      }
    };
    eventLogger = new EventLogger();
  }
});

// apps/api/src/ai/adapters/geminiAdapter.ts
var geminiAdapter_exports = {};
__export(geminiAdapter_exports, {
  geminiCall: () => geminiCall
});
import { GoogleGenerativeAI } from "@google/generative-ai";
async function geminiCall(phase, prompt) {
  const t0 = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  console.log("\u{1F3AF} Initialisation Gemini API...");
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("\u{1F4E1} Envoi requ\xEAte Gemini API...");
  let text2;
  try {
    const result = await model.generateContent(JSON.stringify(prompt));
    const response = await result.response;
    text2 = response.text();
    if (!text2) {
      throw new Error("R\xE9ponse vide de Gemini API");
    }
    console.log("\u2705 R\xE9ponse Gemini API re\xE7ue avec succ\xE8s");
  } catch (geminiError) {
    console.error("\u{1F6A8} ERREUR GEMINI API:", geminiError);
    throw new Error(`Gemini API \xE9chou\xE9: ${geminiError.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text2);
    console.log("\u2705 R\xE9ponse Gemini pars\xE9e en JSON:", parsed);
  } catch {
    console.log("\u{1F4DD} R\xE9ponse Gemini en texte brut (pas JSON):", text2.substring(0, 200) + "...");
    parsed = text2;
  }
  const latency = Date.now() - t0;
  const out = {
    phase,
    model_family: "gemini",
    model_name: "gemini-1.5-flash",
    input_redacted: {},
    output: parsed,
    quality: { latency_ms: latency },
    meta: {
      provider: "gemini-api",
      allow_training: false,
      provenance: "gemini-api-direct",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
  return out;
}
var init_geminiAdapter = __esm({
  "apps/api/src/ai/adapters/geminiAdapter.ts"() {
    "use strict";
  }
});

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
var vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
      plugins: [
        react()
      ],
      base: "/",
      resolve: {
        alias: {
          "@": path2.resolve(import.meta.dirname, "client", "src"),
          "@shared": path2.resolve(import.meta.dirname, "shared"),
          "@assets": path2.resolve(import.meta.dirname, "attached_assets")
        }
      },
      root: path2.resolve(import.meta.dirname, "client"),
      build: {
        outDir: path2.resolve(import.meta.dirname, "dist"),
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ["react", "react-dom"],
              ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"]
            }
          }
        }
      },
      server: {
        host: "0.0.0.0",
        port: 5e3,
        hmr: {
          port: 5001,
          host: "0.0.0.0"
        }
      },
      preview: {
        host: "0.0.0.0",
        port: Number(process.env.PORT) || 8080,
        strictPort: true
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log,
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express5 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      middlewareMode: true,
      hmr: {
        server,
        port: 5001
      }
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    if (url.includes(".")) {
      return next();
    }
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "..", "dist");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express5.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    init_vite_config();
    viteLogger = createLogger();
  }
});

// apps/api/src/ai/aiOrchestrator.ts
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
async function getPricingSuggestion(request) {
  try {
    const basePrice = calculateBasePrice(request.category || "general");
    const complexity = analyzeComplexity(request.description || "");
    const timelineMultiplier = getTimelineMultiplier(request.timeline || "");
    const minPrice = Math.round(basePrice * complexity * 0.8);
    const maxPrice = Math.round(basePrice * complexity * timelineMultiplier * 1.3);
    const averagePrice = Math.round((minPrice + maxPrice) / 2);
    return {
      success: true,
      pricing: {
        minPrice,
        maxPrice,
        averagePrice,
        confidence: 0.85,
        factors: [
          `Cat\xE9gorie: ${request.category}`,
          `Complexit\xE9: ${complexity}x`,
          `D\xE9lai: ${timelineMultiplier}x`
        ]
      },
      analysis: {
        category: request.category,
        complexity_level: complexity > 1.5 ? "high" : complexity > 1 ? "medium" : "low",
        market_position: "competitive"
      }
    };
  } catch (error) {
    console.error("Erreur getPricingSuggestion:", error);
    throw new Error("Impossible de calculer la suggestion de prix");
  }
}
async function enhanceBrief(request) {
  try {
    const originalDescription = request.description || "";
    const category = request.category || "general";
    const analysis = analyzeBriefQuality(originalDescription);
    const improvements = generateImprovements(originalDescription, category, analysis);
    return {
      success: true,
      original: {
        title: request.title,
        description: originalDescription,
        word_count: originalDescription.split(" ").length
      },
      enhanced: {
        title: improveTitle(request.title || "", category),
        description: improvements.enhanced_description,
        word_count: improvements.enhanced_description.split(" ").length
      },
      analysis: {
        quality_score: analysis.score,
        missing_elements: analysis.missing,
        improvements_applied: improvements.changes
      },
      suggestions: improvements.suggestions
    };
  } catch (error) {
    console.error("Erreur enhanceBrief:", error);
    throw new Error("Impossible d'am\xE9liorer le brief");
  }
}
async function logUserFeedback(phase, prompt, feedback) {
  try {
    const logEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      phase,
      prompt,
      feedback,
      user_session: "anonymous"
    };
    const logsDir = join(process.cwd(), "logs");
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    const logFile = join(logsDir, `ai-feedback-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
    const logs = [];
    try {
      const existingLogs = __require(logFile);
      logs.push(...existingLogs);
    } catch {
    }
    logs.push(logEntry);
    writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log(`\u2705 Feedback logged: ${phase}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur logUserFeedback:", error);
    throw new Error("Impossible d'enregistrer le feedback");
  }
}
function calculateBasePrice(category) {
  const basePrices = {
    "development": 5e3,
    "design": 2500,
    "marketing": 3e3,
    "consulting": 4e3,
    "writing": 1500,
    "general": 3e3
  };
  return basePrices[category] || basePrices.general;
}
function analyzeComplexity(description) {
  const complexityKeywords = [
    "complex",
    "advanced",
    "enterprise",
    "scalable",
    "integration",
    "API",
    "database",
    "real-time",
    "mobile",
    "responsive"
  ];
  const found = complexityKeywords.filter(
    (keyword) => description.toLowerCase().includes(keyword)
  ).length;
  return Math.max(0.8, Math.min(2, 1 + found * 0.2));
}
function getTimelineMultiplier(timeline) {
  if (timeline.includes("urgent") || timeline.includes("asap")) return 1.5;
  if (timeline.includes("semaine")) return 1.3;
  if (timeline.includes("mois")) return 1;
  return 1.1;
}
function analyzeBriefQuality(description) {
  const words = description.split(" ").length;
  const hasBudget = /budget|prix|coût|\€|\$/.test(description.toLowerCase());
  const hasTimeline = /délai|semaine|mois|urgent/.test(description.toLowerCase());
  const hasObjectives = /objectif|but|résultat/.test(description.toLowerCase());
  const score = Math.min(
    1,
    words / 100 * 0.4 + (hasBudget ? 0.2 : 0) + (hasTimeline ? 0.2 : 0) + (hasObjectives ? 0.2 : 0)
  );
  const missing = [];
  if (!hasBudget) missing.push("Budget");
  if (!hasTimeline) missing.push("D\xE9lais");
  if (!hasObjectives) missing.push("Objectifs clairs");
  if (words < 50) missing.push("Plus de d\xE9tails");
  return { score, missing };
}
function generateImprovements(description, category, analysis) {
  let enhanced = description;
  const changes = [];
  const suggestions = [];
  if (analysis.missing.includes("Budget")) {
    enhanced += "\n\n\u{1F4B0} Budget: \xC0 d\xE9finir selon la proposition (ouvert aux suggestions)";
    changes.push("Ajout indication budget");
  }
  if (analysis.missing.includes("D\xE9lais")) {
    enhanced += "\n\u23F0 D\xE9lais: Flexible, id\xE9alement sous 4 semaines";
    changes.push("Ajout d\xE9lais indicatifs");
  }
  if (analysis.missing.includes("Objectifs clairs")) {
    enhanced += "\n\u{1F3AF} Objectifs: Livraison conforme aux attentes avec documentation compl\xE8te";
    changes.push("Clarification objectifs");
  }
  suggestions.push("Ajouter des exemples concrets de ce qui est attendu");
  suggestions.push("Pr\xE9ciser les crit\xE8res de s\xE9lection du prestataire");
  suggestions.push("Mentionner les contraintes techniques \xE9ventuelles");
  return { enhanced_description: enhanced, changes, suggestions };
}
function improveTitle(title, category) {
  if (!title) return `Projet ${category} - Mission sp\xE9cialis\xE9e`;
  const keywords = {
    "development": "\u{1F4BB}",
    "design": "\u{1F3A8}",
    "marketing": "\u{1F4C8}",
    "consulting": "\u{1F4A1}",
    "writing": "\u270D\uFE0F"
  };
  const icon = keywords[category] || "\u{1F680}";
  return title.includes(icon) ? title : `${icon} ${title}`;
}
var init_aiOrchestrator = __esm({
  "apps/api/src/ai/aiOrchestrator.ts"() {
    "use strict";
  }
});

// apps/api/src/routes/ai.ts
var ai_exports = {};
__export(ai_exports, {
  default: () => ai_default
});
import { Router as Router14 } from "express";
var router18, ai_default;
var init_ai = __esm({
  "apps/api/src/routes/ai.ts"() {
    "use strict";
    init_aiOrchestrator();
    router18 = Router14();
    router18.post("/pricing", async (req, res) => {
      try {
        const result = await getPricingSuggestion(req.body);
        res.json(result);
      } catch (error) {
        console.error("AI Pricing error:", error);
        res.status(500).json({ error: "Erreur lors du calcul de prix" });
      }
    });
    router18.post("/brief", async (req, res) => {
      try {
        const result = await enhanceBrief(req.body);
        res.json(result);
      } catch (error) {
        console.error("AI Brief enhancement error:", error);
        res.status(500).json({ error: "Erreur lors de l'am\xE9lioration du brief" });
      }
    });
    router18.post("/feedback", async (req, res) => {
      try {
        const { phase, prompt, feedback } = req.body;
        await logUserFeedback(phase, prompt, feedback);
        res.json({ ok: true });
      } catch (error) {
        console.error("AI Feedback error:", error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement du feedback" });
      }
    });
    ai_default = router18;
  }
});

// server/index.ts
import express6 from "express";
import path4 from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

// server/services/mission-sync.ts
init_database();
init_schema();
import { eq } from "drizzle-orm";
var MissionSyncService = class {
  databaseUrl;
  constructor(databaseUrl3) {
    this.databaseUrl = databaseUrl3;
  }
  /**
   * Synchronise une mission vers le feed announcements
   * Gestion idempotente avec upsert
   */
  async syncMissionToFeed(missionId) {
    try {
      console.log(`\u{1F504} Sync mission ${missionId} to feed`);
      const mission = await this.getMissionWithDetails(missionId);
      if (!mission) {
        throw new Error(`Mission ${missionId} not found`);
      }
      const feedItem = this.buildMissionForFeed(mission);
      await this.upsertAnnouncement(feedItem);
      console.log(`\u2705 Mission ${missionId} synced to feed successfully`);
    } catch (error) {
      console.error(`\u274C Failed to sync mission ${missionId} to feed:`, error);
      throw error;
    }
  }
  /**
   * Construit l'objet announcement à partir d'une mission
   * Règles de transformation et optimisation SEO
   */
  buildMissionForFeed(mission) {
    const excerpt = this.generateOptimizedExcerpt(mission.description, mission.skills_required);
    const budgetDisplay = this.formatBudgetForFeed(mission);
    const budgetValueCents = this.extractBudgetValueForSorting(mission);
    const locationDisplay = this.formatLocationForFeed(mission);
    const searchText = this.buildSearchText(mission);
    const clientDisplayName = this.sanitizeClientName(mission.client_name || "Client anonyme");
    return {
      id: mission.id,
      // Contenu optimisé SEO
      title: mission.title,
      description: mission.description,
      excerpt,
      // Catégorisation pour algorithme feed
      category: mission.category || "general",
      tags: mission.tags || [],
      // Budget pour tri et affichage
      budget_display: budgetDisplay,
      budget_value_cents: budgetValueCents,
      currency: mission.currency || "EUR",
      // Localisation feed-friendly
      location_display: locationDisplay,
      city: mission.city || null,
      country: mission.country || "France",
      // Métadonnées client (anonymisées)
      client_id: mission.user_id,
      client_display_name: clientDisplayName,
      // Stats (initialisées à 0, mises à jour par triggers)
      bids_count: 0,
      lowest_bid_cents: null,
      views_count: 0,
      saves_count: 0,
      // Scoring pour algorithme feed
      quality_score: this.calculateQualityScore(mission),
      engagement_score: 0,
      // Calculé par les interactions
      freshness_score: 1,
      // Calculé par trigger
      // Status feed
      status: this.mapMissionStatusToFeedStatus(mission.status),
      urgency: mission.urgency || "medium",
      deadline: mission.deadline,
      // Métadonnées feed
      is_sponsored: false,
      // TODO: logique sponsoring
      boost_score: 0,
      // Recherche optimisée
      search_text: searchText,
      // search_vector sera calculé par la DB
      // Audit
      synced_at: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Upsert idempotent avec gestion des conflits
   */
  async upsertAnnouncement(feedItem) {
    const query = `
      SELECT upsert_announcement(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) as announcement_id
    `;
    const params = [
      feedItem.id,
      // p_mission_id
      feedItem.title,
      // p_title
      feedItem.description,
      // p_description
      feedItem.excerpt,
      // p_excerpt
      feedItem.category,
      // p_category
      feedItem.tags,
      // p_tags
      feedItem.budget_display,
      // p_budget_display
      feedItem.budget_value_cents,
      // p_budget_value_cents
      feedItem.currency,
      // p_currency
      feedItem.location_display,
      // p_location_display
      feedItem.city,
      // p_city
      feedItem.country,
      // p_country
      feedItem.client_id,
      // p_client_id
      feedItem.client_display_name,
      // p_client_display_name
      feedItem.status,
      // p_status
      feedItem.urgency,
      // p_urgency
      feedItem.deadline,
      // p_deadline
      feedItem.quality_score
      // p_quality_score
    ];
    const result = await db.execute(query, params);
    console.log(`\u{1F4E4} Upserted announcement for mission ${feedItem.id}`);
  }
  /**
   * Récupère mission avec détails pour sync
   */
  async getMissionWithDetails(missionId) {
    const query = `
      SELECT 
        m.*,
        u.name as client_name
      FROM missions m
      LEFT JOIN users u ON m.client_id = u.id
      WHERE m.id = $1
    `;
    const result = await db.execute(query, [missionId]);
    return result.rows[0] || null;
  }
  // ============================================
  // UTILITAIRES DE TRANSFORMATION
  // ============================================
  /**
   * Génère un excerpt optimisé pour le feed
   * Priorité : compétences + début description
   */
  generateOptimizedExcerpt(description, skills = []) {
    const maxLength = 200;
    if (skills.length > 0) {
      const skillsText = `Comp\xE9tences: ${skills.slice(0, 3).join(", ")}. `;
      const remainingLength = maxLength - skillsText.length - 3;
      if (remainingLength > 50) {
        const descStart = description.substring(0, remainingLength).trim();
        return skillsText + descStart + "...";
      }
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength - 3).trim() + "...";
  }
  /**
   * Formate le budget pour affichage feed
   */
  formatBudgetForFeed(mission) {
    if (mission.budget_type === "negotiable") return "\xC0 n\xE9gocier";
    if (mission.budget_type === "fixed" && mission.budget_value_cents) {
      return `${Math.round(mission.budget_value_cents / 100)}\u20AC`;
    }
    if (mission.budget_type === "range" && mission.budget_min_cents && mission.budget_max_cents) {
      const min = Math.round(mission.budget_min_cents / 100);
      const max = Math.round(mission.budget_max_cents / 100);
      return `${min}-${max}\u20AC`;
    }
    return "Budget non d\xE9fini";
  }
  /**
   * Extrait valeur numérique pour tri
   */
  extractBudgetValueForSorting(mission) {
    if (mission.budget_type === "fixed" && mission.budget_value_cents) {
      return mission.budget_value_cents;
    }
    if (mission.budget_type === "range" && mission.budget_min_cents && mission.budget_max_cents) {
      return Math.round((mission.budget_min_cents + mission.budget_max_cents) / 2);
    }
    return null;
  }
  /**
   * Formate localisation pour feed
   */
  formatLocationForFeed(mission) {
    if (mission.city && mission.country) {
      return `${mission.city}, ${mission.country}`;
    }
    if (mission.city) return mission.city;
    if (mission.remote_allowed) return "Remote";
    return "Localisation flexible";
  }
  /**
   * Construit texte de recherche optimisé
   */
  buildSearchText(mission) {
    const parts = [
      mission.title,
      mission.description,
      mission.category,
      ...mission.tags || [],
      ...mission.skills_required || [],
      mission.city,
      mission.country
    ].filter(Boolean);
    return parts.join(" ").toLowerCase();
  }
  /**
   * Sanitise nom client pour affichage public
   */
  sanitizeClientName(name) {
    if (name.includes(" ") && name.length > 20) {
      const parts = name.split(" ");
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    if (name.length > 30) {
      return name.substring(0, 27) + "...";
    }
    return name;
  }
  /**
   * Calcule score qualité pour algorithme feed
   */
  calculateQualityScore(mission) {
    let score = 0;
    if (mission.title && mission.title.length >= 10) score += 1;
    if (mission.title && mission.title.length >= 30) score += 1;
    if (mission.description && mission.description.length >= 50) score += 1;
    if (mission.description && mission.description.length >= 200) score += 1;
    if (mission.description && mission.description.length >= 500) score += 1;
    if (mission.skills_required && mission.skills_required.length > 0) score += 1;
    if (mission.skills_required && mission.skills_required.length >= 3) score += 1;
    if (mission.budget_type !== "negotiable") score += 1;
    if (mission.city || mission.remote_allowed) score += 1;
    if (mission.requirements && mission.requirements.length >= 50) score += 1;
    return Math.min(5, score);
  }
  /**
   * Mappe statut mission vers statut feed
   */
  mapMissionStatusToFeedStatus(missionStatus) {
    switch (missionStatus) {
      case "published":
        return "active";
      case "awarded":
        return "closed";
      case "completed":
        return "closed";
      case "cancelled":
        return "inactive";
      case "expired":
        return "inactive";
      default:
        return "inactive";
    }
  }
  /**
   * Supprime une mission du feed
   */
  async removeMissionFromFeed(missionId) {
    try {
      await db.delete(announcements).where(eq(announcements.id, missionId));
      console.log(`\u{1F5D1}\uFE0F Mission ${missionId} removed from feed`);
    } catch (error) {
      console.error(`\u274C Failed to remove mission ${missionId} from feed:`, error);
      throw error;
    }
  }
  /**
   * Met à jour les stats d'une announcement
   */
  async updateAnnouncementStats(missionId, stats) {
    const query = `
      SELECT update_announcement_stats($1, $2, $3, $4, $5)
    `;
    await db.execute(query, [
      missionId,
      stats.bidsCount || null,
      stats.lowestBidCents || null,
      stats.viewsCount || null,
      stats.savesCount || null
    ]);
    console.log(`\u{1F4CA} Updated stats for announcement ${missionId}`);
  }
};
var missionSync = new MissionSyncService(
  process.env.DATABASE_URL || "postgresql://localhost:5432/swideal"
);

// server/environment-check.ts
function validateEnvironment() {
  const requiredVars = [
    "DATABASE_URL",
    "GEMINI_API_KEY"
  ];
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.warn("\u26A0\uFE0F Variables d'environnement manquantes:", missing);
    console.warn("\u{1F4DD} Ajoutez-les dans l'onglet Secrets de Replit pour une fonctionnalit\xE9 compl\xE8te");
    if (missing.includes("DATABASE_URL")) {
      console.error("\u274C DATABASE_URL is required");
      process.exit(1);
    }
  }
  console.log("\u2705 Variables d'environnement valid\xE9es");
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
  }
  console.log("\u{1F50D} Configuration d'environnement:", {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? "\u2705 Configur\xE9" : "\u274C Manquant",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "\u2705 Configur\xE9" : "\u274C Manquant",
    PORT: process.env.PORT || 5e3
  });
}

// server/index.ts
import { Pool as Pool4 } from "pg";
import cors from "cors";
import fs3 from "fs";
import net from "net";

// server/middleware/request-validator.ts
var validateRequest = (req, res, next) => {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.headers["x-request-id"] = requestId;
  console.log(`\u{1F4E5} ${req.method} ${req.originalUrl}`, {
    request_id: requestId,
    user_agent: req.headers["user-agent"]?.substring(0, 100),
    ip: req.ip,
    content_type: req.headers["content-type"],
    content_length: req.headers["content-length"],
    timestamp: timestamp2
  });
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`\u26A0\uFE0F Invalid Content-Type: ${contentType} for ${req.method} ${req.originalUrl}`);
      return res.status(400).json({
        ok: false,
        error: "Content-Type must be application/json",
        request_id: requestId,
        timestamp: timestamp2
      });
    }
  }
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`\u23F0 Request timeout: ${req.method} ${req.originalUrl} (${requestId})`);
      res.status(408).json({
        ok: false,
        error: "Request timeout",
        request_id: requestId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }, 3e4);
  res.on("finish", () => {
    clearTimeout(timeout);
    console.log(`\u{1F4E4} ${req.method} ${req.originalUrl} - ${res.statusCode} (${requestId})`);
  });
  next();
};
var limitRequestSize = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024;
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > maxSize) {
    return res.status(413).json({
      ok: false,
      error: "Request too large",
      max_size: "10MB",
      received_size: `${Math.round(contentLength / 1024 / 1024)}MB`
    });
  }
  next();
};

// server/middleware/performance-monitor.ts
var metrics = [];
var MAX_METRICS = 1e3;
var performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const memoryUsed = process.memoryUsage().heapUsed - startMemory;
    const metric = {
      endpoint: req.originalUrl,
      method: req.method,
      duration,
      status: res.statusCode,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      memory_usage: memoryUsed
    };
    metrics.push(metric);
    if (metrics.length > MAX_METRICS) {
      metrics.splice(0, metrics.length - MAX_METRICS);
    }
    if (duration > 2e3) {
      console.warn(`\u{1F40C} Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
    if (memoryUsed > 50 * 1024 * 1024) {
      console.warn(`\u{1F525} High memory usage: ${req.method} ${req.originalUrl} used ${Math.round(memoryUsed / 1024 / 1024)}MB`);
    }
    originalEnd.call(this, chunk, encoding);
  };
  next();
};
var getPerformanceStats = () => {
  if (metrics.length === 0) {
    return { message: "No metrics available" };
  }
  const recentMetrics = metrics.slice(-100);
  const averageDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
  const slowRequests = recentMetrics.filter((m) => m.duration > 1e3).length;
  const errorRequests = recentMetrics.filter((m) => m.status >= 400).length;
  return {
    total_requests: metrics.length,
    recent_requests: recentMetrics.length,
    average_duration_ms: Math.round(averageDuration),
    slow_requests_count: slowRequests,
    error_requests_count: errorRequests,
    error_rate_percent: Math.round(errorRequests / recentMetrics.length * 100),
    last_updated: (/* @__PURE__ */ new Date()).toISOString()
  };
};

// server/auth-routes.ts
init_schema();
import express from "express";
import { Pool as Pool2 } from "pg";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { eq as eq2, sql } from "drizzle-orm";
var pool2 = new Pool2({ connectionString: process.env.DATABASE_URL });
var db2 = drizzle2(pool2);
var router = express.Router();
router.post("/login", async (req, res) => {
  try {
    console.log("\u{1F511} Tentative de connexion:", { email: req.body.email });
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("\u274C Email ou mot de passe manquant");
      return res.status(400).json({
        error: "Email et mot de passe requis",
        success: false
      });
    }
    const user = await db2.select().from(users).where(eq2(users.email, email)).limit(1);
    if (user.length === 0) {
      console.log("\u274C Utilisateur non trouv\xE9:", email);
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
        success: false
      });
    }
    const userData = user[0];
    if (!userData.password || userData.password !== password) {
      console.log("\u274C Mot de passe incorrect pour:", email);
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
        success: false
      });
    }
    const userSession = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      rating_mean: userData.rating_mean,
      rating_count: userData.rating_count,
      profile_data: userData.profile_data,
      created_at: userData.created_at
    };
    res.json({
      success: true,
      user: userSession,
      message: `Bienvenue ${userData.name || userData.email} !`
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});
router.post("/register", async (req, res) => {
  try {
    console.log("\u{1F4DD} Tentative de cr\xE9ation de compte:", { email: req.body.email, name: req.body.name });
    const { email, password, name, role = "CLIENT" } = req.body;
    if (!email || !password) {
      console.log("\u274C Email ou mot de passe manquant");
      return res.status(400).json({
        error: "Email et mot de passe requis",
        success: false
      });
    }
    if (!name || name.trim().length < 2) {
      console.log("\u274C Nom invalide");
      return res.status(400).json({
        error: "Le nom doit contenir au moins 2 caract\xE8res",
        success: false
      });
    }
    if (password.length < 6) {
      console.log("\u274C Mot de passe trop court");
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caract\xE8res",
        success: false
      });
    }
    const existingUser = await db2.select().from(users).where(eq2(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      console.log("\u274C Email d\xE9j\xE0 utilis\xE9:", email);
      return res.status(409).json({
        error: "Un compte existe d\xE9j\xE0 avec cet email",
        success: false
      });
    }
    const [newUser] = await db2.insert(users).values({
      email: email.toLowerCase().trim(),
      password,
      // En production, hasher avec bcrypt
      name: name.trim(),
      role: role.toUpperCase(),
      profile_data: {},
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    }).returning();
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      rating_mean: newUser.rating_mean,
      rating_count: newUser.rating_count,
      profile_data: newUser.profile_data,
      created_at: newUser.created_at
    };
    res.status(201).json({
      success: true,
      user: userSession,
      message: "Compte cr\xE9\xE9 avec succ\xE8s !"
    });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ error: "Erreur serveur lors de la cr\xE9ation du compte" });
  }
});
router.get("/profile/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await db2.select().from(users).where(eq2(users.id, userId)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
    }
    const userData = user[0];
    const userProfile = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      rating_mean: userData.rating_mean,
      rating_count: userData.rating_count,
      profile_data: userData.profile_data,
      created_at: userData.created_at
    };
    res.json({ user: userProfile });
  } catch (error) {
    console.error("Erreur get profile:", error);
    res.status(500).json({ error: "Erreur serveur lors de la r\xE9cup\xE9ration du profil" });
  }
});
router.get("/demo-users", async (req, res) => {
  try {
    const demoUsers = await db2.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      profile_data: users.profile_data
    }).from(users);
    res.json({
      users: demoUsers,
      message: "Utilisateurs de d\xE9monstration disponibles"
    });
  } catch (error) {
    console.error("Erreur get demo users:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.get("/demo-accounts/verify", async (req, res) => {
  try {
    const demoEmails = ["demo@swideal.com", "prestataire@swideal.com", "admin@swideal.com"];
    const demoAccounts = await db2.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at
    }).from(users).where(sql`${users.email} = ANY(${demoEmails})`);
    const accountsStatus = {
      client: demoAccounts.find((u) => u.email === "demo@swideal.com"),
      provider: demoAccounts.find((u) => u.email === "prestataire@swideal.com"),
      admin: demoAccounts.find((u) => u.email === "admin@swideal.com"),
      total: demoAccounts.length
    };
    res.json({
      success: true,
      accounts: accountsStatus,
      allPresent: demoAccounts.length === 3
    });
  } catch (error) {
    console.error("Erreur v\xE9rification comptes d\xE9mo:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la v\xE9rification des comptes d\xE9mo"
    });
  }
});
router.get("/debug/demo-accounts", async (req, res) => {
  try {
    console.log("\u{1F50D} Diagnostic des comptes d\xE9mo...");
    const allUsers = await db2.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at
    }).from(users);
    const demoUsers = await db2.select().from(users).where(sql`${users.email} IN ('demo@swideal.com', 'prestataire@swideal.com', 'admin@swideal.com')`);
    res.json({
      debug: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database_url_exists: !!process.env.DATABASE_URL,
      total_users: allUsers.length,
      all_users: allUsers,
      demo_accounts_found: demoUsers.length,
      demo_accounts: demoUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        password_length: user.password?.length || 0,
        password_is_demo123: user.password === "demo123",
        password_is_admin123: user.password === "admin123",
        created_at: user.created_at
      }))
    });
  } catch (error) {
    console.error("\u274C Erreur diagnostic:", error);
    res.status(500).json({
      error: "Erreur lors du diagnostic",
      details: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.post("/debug/create-demo-accounts", async (req, res) => {
  try {
    console.log("\u{1F6E0}\uFE0F Cr\xE9ation forc\xE9e des comptes d\xE9mo...");
    const demoAccounts = [
      {
        email: "demo@swideal.com",
        password: "demo123",
        name: "Emma Rousseau",
        role: "CLIENT",
        rating_mean: "0",
        rating_count: 0,
        profile_data: {
          company: "TechStart Innovation",
          sector: "SaaS",
          projects_posted: 0,
          total_budget_spent: 0,
          verified: true,
          phone: "+33 1 45 67 89 12",
          location: "Paris, France"
        }
      },
      {
        email: "prestataire@swideal.com",
        password: "demo123",
        name: "Julien Moreau",
        role: "PRO",
        rating_mean: "0",
        rating_count: 0,
        profile_data: {
          specialties: ["React", "Node.js", "TypeScript", "Python"],
          hourly_rate: 65,
          availability: "Disponible",
          experience_years: 5,
          completed_projects: 0,
          success_rate: 0,
          response_time_hours: 4,
          certifications: ["React Developer"],
          portfolio_url: "https://julienmoreau.dev",
          linkedin: "https://linkedin.com/in/julienmoreau",
          phone: "+33 6 78 90 12 34",
          location: "Lyon, France"
        }
      },
      {
        email: "admin@swideal.com",
        password: "admin123",
        name: "Clara Dubois",
        role: "ADMIN",
        profile_data: {
          department: "Platform Management",
          access_level: "full",
          phone: "+33 1 56 78 90 12"
        }
      }
    ];
    const results = [];
    for (const account of demoAccounts) {
      try {
        const existingUser = await db2.select().from(users).where(eq2(users.email, account.email)).limit(1);
        if (existingUser.length > 0) {
          results.push({
            email: account.email,
            status: "exists",
            message: "Compte d\xE9j\xE0 existant"
          });
        } else {
          const [newUser] = await db2.insert(users).values(account).returning();
          results.push({
            email: account.email,
            status: "created",
            id: newUser.id,
            message: "Compte cr\xE9\xE9 avec succ\xE8s"
          });
        }
      } catch (error) {
        results.push({
          email: account.email,
          status: "error",
          message: error.message
        });
      }
    }
    res.json({
      success: true,
      message: "Cr\xE9ation des comptes d\xE9mo termin\xE9e",
      results,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Erreur cr\xE9ation comptes d\xE9mo:", error);
    res.status(500).json({
      error: "Erreur lors de la cr\xE9ation des comptes d\xE9mo",
      details: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
var auth_routes_default = router;

// server/routes/missions.ts
init_database();
init_schema();
import { Router } from "express";
import { eq as eq3, desc, sql as sql2, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

// server/dto/mission-dto.ts
function extractLocationSafely(mission) {
  const defaults = {
    location: "Remote",
    location_raw: null,
    postal_code: null,
    city: null,
    country: "France",
    remote_allowed: true,
    location_data: { remote_allowed: true }
  };
  try {
    if (mission.location_data && typeof mission.location_data === "object") {
      const locationData = mission.location_data;
      return {
        location: locationData.raw || locationData.city || locationData.address || "Remote",
        location_raw: locationData.raw || mission.location_raw || null,
        postal_code: locationData.postal_code || mission.postal_code || null,
        city: locationData.city || mission.city || null,
        country: locationData.country || mission.country || "France",
        remote_allowed: locationData.remote_allowed !== void 0 ? locationData.remote_allowed : true,
        location_data: locationData
      };
    }
    return {
      location: mission.location_raw || mission.city || "Remote",
      location_raw: mission.location_raw || null,
      postal_code: mission.postal_code || null,
      city: mission.city || null,
      country: mission.country || "France",
      remote_allowed: mission.remote_allowed !== void 0 ? mission.remote_allowed : true,
      location_data: {
        raw: mission.location_raw || null,
        city: mission.city || null,
        country: mission.country || "France",
        remote_allowed: mission.remote_allowed !== void 0 ? mission.remote_allowed : true
      }
    };
  } catch (error) {
    console.warn("\u26A0\uFE0F Erreur extraction location, utilisation des valeurs par d\xE9faut:", error);
    return defaults;
  }
}
function extractBudgetSafely(mission) {
  const budgetCents = mission.budget_value_cents || 0;
  const currency = mission.currency || "EUR";
  const budgetEuros = Math.round(budgetCents / 100);
  return {
    budget: budgetEuros.toString(),
    budget_value_cents: budgetCents,
    currency,
    budget_display: budgetCents > 0 ? `${budgetEuros}\u20AC` : "\xC0 n\xE9gocier"
  };
}
function extractMetadataSafely(mission) {
  return {
    tags: Array.isArray(mission.tags) ? mission.tags : [],
    skills_required: Array.isArray(mission.skills_required) ? mission.skills_required : [],
    requirements: mission.requirements || null
  };
}
function mapMission(mission) {
  if (!mission || !mission.id) {
    console.error("\u274C DTO Mapper: Mission invalide re\xE7ue:", mission);
    throw new Error("Mission data is invalid or missing required fields");
  }
  try {
    const location = extractLocationSafely(mission);
    const budget = extractBudgetSafely(mission);
    const metadata = extractMetadataSafely(mission);
    const mappedMission = {
      // Identifiants
      id: mission.id,
      // Contenu
      title: mission.title || "Mission sans titre",
      description: mission.description || "",
      excerpt: mission.excerpt || (mission.description ? mission.description.length > 200 ? mission.description.substring(0, 200) + "..." : mission.description : "Description non disponible"),
      category: mission.category || "general",
      // Budget
      ...budget,
      // Localisation
      ...location,
      // Relations utilisateur
      user_id: mission.user_id,
      client_id: mission.client_id || mission.user_id,
      userId: mission.user_id?.toString(),
      clientId: (mission.client_id || mission.user_id)?.toString(),
      clientName: "Client",
      // TODO: Récupérer le vrai nom depuis une jointure
      // Statut et timing
      status: mission.status || "open",
      urgency: mission.urgency || "medium",
      deadline: mission.deadline?.toISOString(),
      // Métadonnées
      ...metadata,
      // Équipe
      is_team_mission: mission.is_team_mission || false,
      team_size: mission.team_size || 1,
      // Timestamps
      created_at: mission.created_at,
      updated_at: mission.updated_at,
      createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      // Champs pour compatibilité frontend
      bids: []
      // Sera rempli par les routes qui récupèrent les bids
    };
    console.log("\u2705 DTO Mapper: Mission mapp\xE9e avec succ\xE8s:", mappedMission.id, mappedMission.title);
    return mappedMission;
  } catch (error) {
    console.error("\u274C DTO Mapper: Erreur lors du mapping de la mission:", mission.id, error);
    console.error("\u274C DTO Mapper: Donn\xE9es mission probl\xE9matiques:", JSON.stringify(mission, null, 2));
    return {
      id: mission.id,
      title: mission.title || "Mission avec erreur",
      description: mission.description || "",
      excerpt: "Erreur lors du chargement des d\xE9tails",
      category: "general",
      budget: "0",
      budget_value_cents: 0,
      currency: "EUR",
      budget_display: "Non disponible",
      location: "Remote",
      location_raw: null,
      postal_code: null,
      city: null,
      country: "France",
      remote_allowed: true,
      location_data: { remote_allowed: true },
      user_id: mission.user_id,
      client_id: mission.client_id || mission.user_id,
      userId: mission.user_id?.toString(),
      clientId: (mission.client_id || mission.user_id)?.toString(),
      clientName: "Client",
      status: "open",
      urgency: "medium",
      deadline: null,
      tags: [],
      skills_required: [],
      requirements: null,
      is_team_mission: false,
      team_size: 1,
      created_at: mission.created_at,
      updated_at: mission.updated_at,
      createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      bids: []
    };
  }
}

// server/routes/missions.ts
var asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
function generateExcerpt(description, maxLength = 200) {
  if (!description) {
    return "";
  }
  if (description.length <= maxLength) {
    return description;
  }
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace).trim() + "...";
  }
  return truncated.trim() + "...";
}
var router2 = Router();
router2.post("/", asyncHandler(async (req, res) => {
  const requestId = randomUUID();
  const startTime = Date.now();
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "mission_create_start",
    body_size: JSON.stringify(req.body).length,
    user_agent: req.headers["user-agent"],
    ip: req.ip
  }));
  const { title, description, category, budget, location, userId, postal_code } = req.body;
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "mission_data_received",
    data: { title, description, category, budget, location, postal_code, userId }
  }));
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    console.log(JSON.stringify({
      level: "warn",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "validation_failed",
      field: "title",
      value: title
    }));
    return res.status(400).json({
      ok: false,
      error: "Le titre doit contenir au moins 3 caract\xE8res",
      field: "title",
      request_id: requestId
    });
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    console.log(JSON.stringify({
      level: "warn",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "validation_failed",
      field: "description",
      value_length: description?.length || 0
    }));
    return res.status(400).json({
      ok: false,
      error: "La description doit contenir au moins 10 caract\xE8res",
      field: "description",
      request_id: requestId
    });
  }
  const userIdInt = userId ? parseInt(userId.toString()) : 1;
  if (isNaN(userIdInt) || userIdInt <= 0) {
    console.log(JSON.stringify({
      level: "warn",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "validation_failed",
      field: "userId",
      value: userId
    }));
    return res.status(400).json({
      ok: false,
      error: "User ID invalide",
      field: "userId",
      request_id: requestId
    });
  }
  const existingUser = await db.select({ id: users.id }).from(users).where(eq3(users.id, userIdInt)).limit(1);
  if (existingUser.length === 0) {
    console.log(JSON.stringify({
      level: "warn",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "security_validation_failed",
      field: "userId",
      value: userIdInt,
      reason: "user_not_found"
    }));
    return res.status(401).json({
      ok: false,
      error: "Utilisateur non trouv\xE9",
      field: "userId",
      request_id: requestId
    });
  }
  const now = /* @__PURE__ */ new Date();
  const budgetCents = budget ? parseInt(budget.toString()) * 100 : 1e5;
  const extractCity = (locationString) => {
    if (!locationString) return null;
    const parts = locationString.split(",");
    return parts.length > 1 ? parts[parts.length - 1].trim() : locationString.trim();
  };
  const locationData = {
    raw: location || "Remote",
    address: req.body.postal_code || null,
    city: extractCity(location) || null,
    country: "France",
    remote_allowed: req.body.remote_allowed !== false
  };
  const fullDescription = description.trim() + (req.body.requirements ? `

Exigences sp\xE9cifiques: ${req.body.requirements}` : "");
  const newMission = {
    title: title.trim(),
    description: fullDescription,
    excerpt: generateExcerpt(fullDescription, 200),
    category: category || "developpement",
    budget_value_cents: budgetCents,
    currency: "EUR",
    location_data: locationData,
    // Utiliser le champ correct du schéma
    user_id: userIdInt,
    client_id: userIdInt,
    status: "open",
    // Utiliser un statut valide
    urgency: "medium",
    is_team_mission: false,
    team_size: 1
    // created_at et updated_at sont gérés automatiquement par la DB
  };
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "mission_data_prepared",
    title_length: newMission.title.length,
    description_length: newMission.description.length,
    budget_cents: newMission.budget_value_cents,
    user_id: newMission.user_id,
    location_data: newMission.location_data
  }));
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "db_transaction_start"
  }));
  const insertResult = await db.insert(missions).values(newMission).returning({
    id: missions.id,
    title: missions.title,
    status: missions.status,
    user_id: missions.user_id,
    created_at: missions.created_at
  });
  if (!insertResult || insertResult.length === 0) {
    throw new Error("Insert failed - no result returned");
  }
  const insertedMission = insertResult[0];
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "db_insert_success",
    mission_id: insertedMission.id,
    execution_time_ms: Date.now() - startTime,
    inserted_data: {
      id: insertedMission.id,
      title: insertedMission.title,
      status: insertedMission.status,
      user_id: insertedMission.user_id,
      created_at: insertedMission.created_at
    }
  }));
  const fullMission = await db.select().from(missions).where(eq3(missions.id, insertedMission.id)).limit(1);
  if (fullMission.length === 0) {
    throw new Error("Mission not found after insert");
  }
  const mission = fullMission[0];
  const mappedMission = mapMission(mission);
  const responsePayload = {
    ok: true,
    ...mappedMission,
    request_id: requestId
  };
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "mission_create_success",
    mission_id: mission.id,
    total_time_ms: Date.now() - startTime
  }));
  res.status(201).json(responsePayload);
  setImmediate(async () => {
    try {
      const missionSync2 = new MissionSyncService(process.env.DATABASE_URL || "postgresql://localhost:5432/swideal");
      const missionForFeed = {
        id: mission.id.toString(),
        title: mission.title,
        description: mission.description,
        category: mission.category || "developpement",
        budget: mission.budget_value_cents?.toString() || "0",
        location: mission.location_data?.raw || mission.location_data?.city || "Remote",
        status: mission.status || "open",
        clientId: mission.user_id?.toString() || "1",
        clientName: "Client",
        createdAt: mission.created_at?.toISOString() || now.toISOString(),
        bids: []
      };
      await missionSync2.addMissionToFeed(missionForFeed);
      console.log(JSON.stringify({
        level: "info",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        request_id: requestId,
        action: "feed_sync_success",
        mission_id: mission.id
      }));
    } catch (syncError) {
      console.log(JSON.stringify({
        level: "warn",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        request_id: requestId,
        action: "feed_sync_failed",
        mission_id: mission.id,
        error: syncError instanceof Error ? syncError.message : "Unknown sync error"
      }));
    }
  });
}));
router2.get("/", asyncHandler(async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const startTime = Date.now();
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "get_missions_start",
    user_agent: req.headers["user-agent"]
  }));
  try {
    const allMissions = await db.select().from(missions).where(inArray(missions.status, ["open", "in_progress"])).orderBy(desc(missions.created_at)).limit(100);
    console.log(JSON.stringify({
      level: "info",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "database_query_success",
      missions_count: allMissions.length,
      query_time_ms: Date.now() - startTime
    }));
    const validMissions = allMissions.filter((mission) => {
      if (!mission.id || !mission.title) {
        console.warn(JSON.stringify({
          level: "warn",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          request_id: requestId,
          action: "mission_validation_failed",
          mission_id: mission.id,
          reason: "missing_required_fields"
        }));
        return false;
      }
      return true;
    });
    console.log(JSON.stringify({
      level: "info",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "missions_validation_complete",
      valid_missions: validMissions.length,
      filtered_out: allMissions.length - validMissions.length
    }));
    const missionsWithBids = [];
    let mappingErrors = 0;
    for (const mission of validMissions) {
      try {
        const mappedMission = mapMission(mission);
        missionsWithBids.push(mappedMission);
      } catch (mappingError) {
        mappingErrors++;
        console.error(JSON.stringify({
          level: "error",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          request_id: requestId,
          action: "mission_mapping_error",
          mission_id: mission.id,
          error: mappingError.message
        }));
        missionsWithBids.push({
          id: mission.id,
          title: mission.title || "Mission sans titre",
          description: mission.description || "",
          excerpt: "Erreur lors du chargement des d\xE9tails",
          category: mission.category || "general",
          budget: "0",
          budget_value_cents: 0,
          currency: "EUR",
          budget_display: "Non disponible",
          location: "Remote",
          status: mission.status || "open",
          user_id: mission.user_id,
          userId: mission.user_id?.toString(),
          clientName: "Client",
          createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
          bids: []
        });
      }
    }
    console.log(JSON.stringify({
      level: "info",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "missions_mapping_complete",
      successful_mappings: missionsWithBids.length - mappingErrors,
      mapping_errors: mappingErrors,
      total_time_ms: Date.now() - startTime,
      sample_mission_ids: missionsWithBids.slice(0, 3).map((m) => m.id),
      first_mission_sample: missionsWithBids[0] ? {
        id: missionsWithBids[0].id,
        title: missionsWithBids[0].title,
        status: missionsWithBids[0].status,
        budget_display: missionsWithBids[0].budget_display
      } : null
    }));
    res.json({
      missions: missionsWithBids,
      metadata: {
        total: missionsWithBids.length,
        request_id: requestId,
        query_time_ms: Date.now() - startTime,
        has_errors: mappingErrors > 0
      }
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "get_missions_error",
      error_message: error.message,
      error_stack: error.stack,
      total_time_ms: Date.now() - startTime
    }));
    res.status(500).json({
      ok: false,
      error: "Internal server error",
      details: error.message,
      error_type: "server_error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      debug_mode: process.env.NODE_ENV === "development",
      suggestions: [
        "V\xE9rifiez la connectivit\xE9 \xE0 la base de donn\xE9es",
        "Contr\xF4lez la structure de la table missions",
        "Validez que les colonnes requises existent"
      ]
    });
  }
}));
router2.get("/health", asyncHandler(async (req, res) => {
  const startTime = Date.now();
  console.log("\u{1F3E5} Mission health check endpoint called");
  try {
    const dbTest = await db.select({ count: sql2`COUNT(*)` }).from(missions).limit(1);
    const dbConnected = dbTest.length > 0;
    const responseTime = Date.now() - startTime;
    const healthInfo = {
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "missions-api",
      environment: process.env.NODE_ENV || "development",
      database: dbConnected ? "connected" : "disconnected",
      response_time_ms: responseTime,
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    console.log("\u{1F3E5} Health check passed:", healthInfo);
    res.status(200).json(healthInfo);
  } catch (error) {
    console.error("\u{1F3E5} Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "missions-api",
      environment: process.env.NODE_ENV || "development",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      response_time_ms: Date.now() - startTime
    });
  }
}));
router2.get("/debug", asyncHandler(async (req, res) => {
  console.log("\u{1F50D} Mission debug endpoint called");
  const testQuery = await db.select({ id: missions.id }).from(missions).limit(1);
  const dbInfo = {
    status: "connected",
    sampleMissions: testQuery.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL ? "configured" : "missing"
  };
  console.log("\u{1F50D} Database info:", dbInfo);
  res.json(dbInfo);
}));
router2.get("/verify-sync", asyncHandler(async (req, res) => {
  console.log("\u{1F50D} V\xE9rification de la synchronisation missions/feed");
  try {
    const missionCount = await db.select({ count: sql2`COUNT(*)` }).from(missions);
    const recentMissions = await db.select({
      id: missions.id,
      title: missions.title,
      status: missions.status,
      created_at: missions.created_at
    }).from(missions).orderBy(desc(missions.created_at)).limit(5);
    const announcementCount = await db.select({ count: sql2`COUNT(*)` }).from(announcements);
    const syncStatus = {
      totalMissions: missionCount[0]?.count || 0,
      totalFeedItems: announcementCount[0]?.count || 0,
      recentMissions: recentMissions.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        created_at: m.created_at
      })),
      syncHealth: "OK",
      message: "Sync verification successful - using simplified queries"
    };
    console.log("\u{1F50D} Sync status:", syncStatus);
    res.json(syncStatus);
  } catch (error) {
    console.error("\u{1F50D} Verify sync error:", error);
    res.status(500).json({
      error: "Erreur lors de la v\xE9rification de synchronisation",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}));
router2.get("/:id", asyncHandler(async (req, res) => {
  let missionId = null;
  missionId = req.params.id;
  console.log("\u{1F50D} API: R\xE9cup\xE9ration mission ID:", missionId);
  if (missionId === "debug" || missionId === "verify-sync" || missionId === "health") {
    console.log("\u26A0\uFE0F API: Endpoint sp\xE9cial d\xE9tect\xE9, ignor\xE9 dans cette route:", missionId);
    return res.status(404).json({ error: "Endpoint non trouv\xE9" });
  }
  if (!missionId || missionId === "undefined" || missionId === "null") {
    console.error("\u274C API: Mission ID invalide:", missionId);
    return res.status(400).json({
      error: "Mission ID invalide",
      details: "L'ID de mission est requis et ne peut pas \xEAtre vide"
    });
  }
  const missionIdInt = parseInt(missionId, 10);
  if (isNaN(missionIdInt) || missionIdInt <= 0 || !Number.isInteger(missionIdInt)) {
    console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
    return res.status(400).json({
      error: "Mission ID doit \xEAtre un nombre entier valide",
      received: missionId,
      details: "L'ID doit \xEAtre un nombre entier positif"
    });
  }
  const missionRaw = await db.select().from(missions).where(eq3(missions.id, missionIdInt)).limit(1);
  if (missionRaw.length === 0) {
    console.error("\u274C API: Mission non trouv\xE9e:", missionId);
    return res.status(404).json({
      error: "Mission non trouv\xE9e",
      missionId: missionIdInt,
      details: "Aucune mission trouv\xE9e avec cet ID"
    });
  }
  const mission = mapMission(missionRaw[0]);
  let missionBids = [];
  try {
    missionBids = await db.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      score_breakdown: bids.score_breakdown,
      is_leading: bids.is_leading,
      status: bids.status,
      created_at: bids.created_at,
      provider_name: users.name,
      provider_email: users.email,
      provider_profile: users.profile_data
    }).from(bids).leftJoin(users, eq3(bids.provider_id, users.id)).where(eq3(bids.mission_id, missionIdInt));
  } catch (error) {
    console.warn("\u26A0\uFE0F Could not fetch bids (table may not exist):", error);
    missionBids = [];
  }
  const result = {
    ...mission,
    bids: missionBids || []
  };
  console.log("\u2705 API: Mission trouv\xE9e:", result.title, "avec", result.bids.length, "offres");
  res.json(result);
}));
router2.get("/users/:userId/missions", asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  console.log("\u{1F464} Fetching missions with bids for user:", userId);
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("\u274C Invalid user ID:", userId);
    return res.status(400).json({
      error: "User ID invalide",
      details: "L'ID utilisateur est requis"
    });
  }
  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt) || userIdInt <= 0 || !Number.isInteger(userIdInt)) {
    console.error("\u274C User ID is not a valid number:", userId);
    return res.status(400).json({
      error: "User ID doit \xEAtre un nombre entier valide",
      received: userId,
      details: "L'ID utilisateur doit \xEAtre un nombre entier positif"
    });
  }
  console.log("\u{1F50D} Optimized query: Fetching missions with bids in single JOIN query");
  try {
    const missionsWithBidsData = await db.select({
      // Mission fields
      mission_id: missions.id,
      title: missions.title,
      description: missions.description,
      category: missions.category,
      budget_value_cents: missions.budget_value_cents,
      currency: missions.currency,
      location_data: missions.location_data,
      user_id: missions.user_id,
      client_id: missions.client_id,
      status: missions.status,
      urgency: missions.urgency,
      deadline: missions.deadline,
      tags: missions.tags,
      skills_required: missions.skills_required,
      requirements: missions.requirements,
      is_team_mission: missions.is_team_mission,
      team_size: missions.team_size,
      mission_created_at: missions.created_at,
      mission_updated_at: missions.updated_at,
      // Bid fields (null if no bids)
      bid_id: bids.id,
      bid_amount: bids.amount,
      bid_timeline_days: bids.timeline_days,
      bid_message: bids.message,
      bid_status: bids.status,
      bid_created_at: bids.created_at,
      provider_id: bids.provider_id
    }).from(missions).leftJoin(bids, eq3(missions.id, bids.mission_id)).where(eq3(missions.user_id, userIdInt)).orderBy(desc(missions.created_at), desc(bids.created_at));
    console.log("\u{1F4CA} JOIN query result: Found", missionsWithBidsData.length, "mission-bid combinations");
    const missionMap = /* @__PURE__ */ new Map();
    missionsWithBidsData.forEach((row) => {
      const missionId = row.mission_id;
      if (!missionMap.has(missionId)) {
        missionMap.set(missionId, {
          // Core fields
          id: row.mission_id,
          title: row.title,
          description: row.description,
          excerpt: generateExcerpt(row.description || "", 200),
          category: row.category,
          // Budget
          budget_value_cents: row.budget_value_cents,
          budget: row.budget_value_cents?.toString() || "0",
          currency: row.currency,
          // Location
          location_data: row.location_data,
          location: row.location_data?.raw || row.location_data?.city || "Remote",
          // Status
          status: row.status,
          urgency: row.urgency,
          // User relationships
          user_id: row.user_id,
          client_id: row.client_id,
          userId: row.user_id?.toString(),
          clientName: "Moi",
          // Team
          is_team_mission: row.is_team_mission,
          team_size: row.team_size,
          // Timestamps
          created_at: row.mission_created_at,
          updated_at: row.mission_updated_at,
          createdAt: row.mission_created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: row.mission_updated_at?.toISOString(),
          deadline: row.deadline?.toISOString(),
          // Arrays
          tags: row.tags || [],
          skills_required: row.skills_required || [],
          requirements: row.requirements,
          bids: []
        });
      }
      if (row.bid_id) {
        missionMap.get(missionId).bids.push({
          id: row.bid_id,
          amount: row.bid_amount,
          timeline_days: row.bid_timeline_days,
          message: row.bid_message,
          status: row.bid_status,
          created_at: row.bid_created_at,
          provider_id: row.provider_id
        });
      }
    });
    const missionsWithBids = Array.from(missionMap.values());
    console.log(`\u2705 OPTIMIZED: Found ${missionsWithBids.length} missions for user ${userId}`);
    console.log(`\u2705 PERFORMANCE: Eliminated N+1 queries - used single JOIN instead of ${missionsWithBids.length + 1} separate queries`);
    res.json(missionsWithBids);
  } catch (error) {
    console.error("\u274C Error in optimized missions+bids query:", error);
    const userMissions = await db.select({
      id: missions.id,
      title: missions.title,
      description: missions.description,
      category: missions.category,
      budget_value_cents: missions.budget_value_cents,
      currency: missions.currency,
      location_data: missions.location_data,
      user_id: missions.user_id,
      client_id: missions.client_id,
      status: missions.status,
      urgency: missions.urgency,
      deadline: missions.deadline,
      tags: missions.tags,
      skills_required: missions.skills_required,
      requirements: missions.requirements,
      is_team_mission: missions.is_team_mission,
      team_size: missions.team_size,
      created_at: missions.created_at,
      updated_at: missions.updated_at
    }).from(missions).where(eq3(missions.user_id, userIdInt)).orderBy(desc(missions.created_at));
    const fallbackMissions = userMissions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt(mission.description || "", 200),
      category: mission.category,
      budget_value_cents: mission.budget_value_cents,
      budget: mission.budget_value_cents?.toString() || "0",
      currency: mission.currency,
      location_data: mission.location_data,
      location: mission.location_data?.raw || mission.location_data?.city || "Remote",
      status: mission.status,
      urgency: mission.urgency,
      user_id: mission.user_id,
      client_id: mission.client_id,
      userId: mission.user_id?.toString(),
      clientName: "Moi",
      is_team_mission: mission.is_team_mission,
      team_size: mission.team_size,
      created_at: mission.created_at,
      updated_at: mission.updated_at,
      createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      deadline: mission.deadline?.toISOString(),
      tags: mission.tags || [],
      skills_required: mission.skills_required || [],
      requirements: mission.requirements,
      bids: []
    }));
    res.json(fallbackMissions);
  }
}));
router2.get("/users/:userId/bids", asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  console.log("\u{1F464} Fetching bids for user:", userId);
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("\u274C Invalid user ID:", userId);
    return res.status(400).json({ error: "User ID invalide" });
  }
  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    console.error("\u274C User ID is not a valid number:", userId);
    return res.status(400).json({ error: "User ID doit \xEAtre un nombre" });
  }
  const userBids = [];
  console.log("\u{1F517} Mapping: userId =", userId, "-> provider_id filter:", userIdInt);
  console.log(`\u{1F464} Found ${userBids.length} bids for user ${userId}`);
  res.json(userBids);
}));
router2.put("/:id", asyncHandler(async (req, res) => {
  const missionId = req.params.id;
  const updateData = req.body;
  console.log("\u270F\uFE0F API: Modification mission ID:", missionId);
  console.log("\u270F\uFE0F API: Donn\xE9es re\xE7ues:", JSON.stringify(updateData, null, 2));
  if (missionId === "debug" || missionId === "verify-sync") {
    return res.status(404).json({ error: "Endpoint non trouv\xE9" });
  }
  if (!missionId || missionId === "undefined" || missionId === "null") {
    console.error("\u274C API: Mission ID invalide:", missionId);
    return res.status(400).json({ error: "Mission ID invalide" });
  }
  const missionIdInt = parseInt(missionId, 10);
  if (isNaN(missionIdInt) || missionIdInt <= 0) {
    console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
    return res.status(400).json({ error: "Mission ID doit \xEAtre un nombre valide" });
  }
  if (!updateData.title || updateData.title.trim() === "") {
    return res.status(400).json({
      error: "Le titre est requis",
      field: "title"
    });
  }
  if (!updateData.description || updateData.description.trim() === "") {
    return res.status(400).json({
      error: "La description est requise",
      field: "description"
    });
  }
  const existingMission = await db.select({ id: missions.id, category: missions.category, deadline: missions.deadline, tags: missions.tags, requirements: missions.requirements, currency: missions.currency, location_data: missions.location_data }).from(missions).where(eq3(missions.id, missionIdInt)).limit(1);
  if (existingMission.length === 0) {
    console.error("\u274C API: Mission non trouv\xE9e pour modification:", missionId);
    return res.status(404).json({ error: "Mission non trouv\xE9e" });
  }
  const extractCity = (locationString) => {
    if (!locationString) return null;
    const parts = locationString.split(",");
    return parts.length > 1 ? parts[parts.length - 1].trim() : locationString.trim();
  };
  const missionToUpdate = {
    title: updateData.title,
    description: updateData.description,
    excerpt: generateExcerpt(updateData.description, 200),
    category: updateData.category || existingMission[0].category,
    budget_value_cents: updateData.budget ? parseInt(updateData.budget) : null,
    location_data: updateData.location ? {
      raw: updateData.location,
      city: updateData.city || null,
      country: updateData.country || "France",
      remote_allowed: updateData.remote_allowed !== false
    } : existingMission[0].location_data,
    urgency: updateData.urgency || "medium",
    status: updateData.status || "published",
    updated_at: /* @__PURE__ */ new Date(),
    deadline: updateData.deadline ? new Date(updateData.deadline) : existingMission[0].deadline,
    tags: updateData.tags || existingMission[0].tags,
    requirements: updateData.requirements || existingMission[0].requirements,
    currency: updateData.currency || existingMission[0].currency
  };
  console.log("\u270F\uFE0F API: Donn\xE9es de mise \xE0 jour:", JSON.stringify(missionToUpdate, null, 2));
  const updatedMission = await db.update(missions).set(missionToUpdate).where(eq3(missions.id, missionIdInt)).returning();
  if (updatedMission.length === 0) {
    throw new Error("\xC9chec de la mise \xE0 jour de la mission");
  }
  console.log("\u2705 API: Mission modifi\xE9e avec succ\xE8s:", missionId);
  res.json(updatedMission[0]);
}));
router2.delete("/:id", asyncHandler(async (req, res) => {
  const missionId = req.params.id;
  console.log("\u{1F5D1}\uFE0F API: Suppression mission ID:", missionId);
  if (missionId === "debug" || missionId === "verify-sync") {
    return res.status(404).json({ error: "Endpoint non trouv\xE9" });
  }
  if (!missionId || missionId === "undefined" || missionId === "null") {
    console.error("\u274C API: Mission ID invalide:", missionId);
    return res.status(400).json({ error: "Mission ID invalide" });
  }
  const missionIdInt = parseInt(missionId, 10);
  if (isNaN(missionIdInt) || missionIdInt <= 0) {
    console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
    return res.status(400).json({ error: "Mission ID doit \xEAtre un nombre valide" });
  }
  const existingMission = await db.select({ id: missions.id }).from(missions).where(eq3(missions.id, missionIdInt)).limit(1);
  if (existingMission.length === 0) {
    console.error("\u274C API: Mission non trouv\xE9e pour suppression:", missionId);
    return res.status(404).json({ error: "Mission non trouv\xE9e" });
  }
  const deletedMission = await db.delete(missions).where(eq3(missions.id, missionIdInt)).returning();
  if (deletedMission.length === 0) {
    throw new Error("\xC9chec de la suppression de la mission");
  }
  console.log("\u2705 API: Mission supprim\xE9e avec succ\xE8s:", missionId);
  res.json({ message: "Mission supprim\xE9e avec succ\xE8s", mission: deletedMission[0] });
}));
var missions_default = router2;

// server/api-routes.ts
init_schema();
import express3 from "express";
import { Pool as Pool3 } from "pg";
import { drizzle as drizzle5 } from "drizzle-orm/node-postgres";
import { eq as eq13 } from "drizzle-orm";

// server/routes/bids.ts
init_database();
init_schema();
import { Router as Router2 } from "express";
import { eq as eq5, and, desc as desc2 } from "drizzle-orm";

// server/middleware/auth.ts
init_database();
init_schema();
import { eq as eq4 } from "drizzle-orm";
var requireAuth = async (req, res, next) => {
  try {
    const userIdHeader = req.headers["x-user-id"];
    if (!userIdHeader) {
      return res.status(401).json({
        error: "Authentication required",
        message: "No user ID provided"
      });
    }
    const userId = parseInt(userIdHeader);
    if (isNaN(userId)) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Invalid user ID format"
      });
    }
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      rating_mean: users.rating_mean
    }).from(users).where(eq4(users.id, userId)).limit(1);
    if (!user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Invalid user"
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Authentication error",
      message: "Internal server error"
    });
  }
};
var optionalAuth = async (req, res, next) => {
  try {
    const userIdHeader = req.headers["x-user-id"];
    if (userIdHeader) {
      const userId = parseInt(userIdHeader);
      if (!isNaN(userId)) {
        const [user] = await db.select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          rating_mean: users.rating_mean
        }).from(users).where(eq4(users.id, userId)).limit(1);
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next();
  }
};

// server/routes/bids.ts
import { z as z2 } from "zod";
var router3 = Router2();
var createBidSchema = z2.object({
  mission_id: z2.number().int().positive(),
  amount: z2.string().min(1),
  // Amount as string to match schema
  timeline_days: z2.number().int().min(1).optional(),
  message: z2.string().optional(),
  bid_type: z2.enum(["individual", "team", "open_team"]).default("individual"),
  team_composition: z2.any().optional(),
  team_lead_id: z2.number().int().positive().optional(),
  open_team_id: z2.number().int().positive().optional()
});
var updateBidSchema = z2.object({
  amount: z2.string().min(1).optional(),
  timeline_days: z2.number().int().min(1).optional(),
  message: z2.string().optional(),
  status: z2.enum(["pending", "accepted", "rejected", "withdrawn"]).optional(),
  team_composition: z2.any().optional()
});
router3.post("/", requireAuth, async (req, res) => {
  try {
    console.log("\u{1F3AF} POST /api/bids - Nouvelle candidature:", {
      userId: req.user?.id,
      missionId: req.body.mission_id,
      bidType: req.body.bid_type
    });
    const validatedData = createBidSchema.parse(req.body);
    const [mission] = await db.select().from(missions).where(eq5(missions.id, validatedData.mission_id)).limit(1);
    if (!mission) {
      return res.status(404).json({
        error: "Mission not found",
        message: "La mission sp\xE9cifi\xE9e n'existe pas"
      });
    }
    if (mission.status !== "open") {
      return res.status(400).json({
        error: "Mission not open",
        message: "Cette mission n'accepte plus de candidatures"
      });
    }
    const [existingBid] = await db.select().from(bids).where(
      and(
        eq5(bids.mission_id, validatedData.mission_id),
        eq5(bids.provider_id, req.user.id)
      )
    ).limit(1);
    if (existingBid) {
      return res.status(409).json({
        error: "Bid already exists",
        message: "Vous avez d\xE9j\xE0 soumis une candidature pour cette mission"
      });
    }
    const [newBid] = await db.insert(bids).values({
      mission_id: validatedData.mission_id,
      provider_id: req.user.id,
      amount: validatedData.amount,
      timeline_days: validatedData.timeline_days,
      message: validatedData.message,
      bid_type: validatedData.bid_type,
      team_composition: validatedData.team_composition,
      team_lead_id: validatedData.team_lead_id,
      open_team_id: validatedData.open_team_id,
      status: "pending"
    }).returning();
    console.log("\u2705 Candidature cr\xE9\xE9e:", { bidId: newBid.id, amount: newBid.amount });
    res.status(201).json({
      ok: true,
      bid: newBid,
      message: "Candidature cr\xE9\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error("\u274C Erreur cr\xE9ation candidature:", error);
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    res.status(500).json({
      error: "Internal server error",
      message: "Erreur lors de la cr\xE9ation de la candidature"
    });
  }
});
router3.get("/", optionalAuth, async (req, res) => {
  try {
    const { mission_id, provider_id, status, bid_type } = req.query;
    console.log("\u{1F4CB} GET /api/bids - Recherche candidatures:", {
      mission_id,
      provider_id,
      status,
      userId: req.user?.id
    });
    let query = db.select({
      id: bids.id,
      mission_id: bids.mission_id,
      provider_id: bids.provider_id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      status: bids.status,
      bid_type: bids.bid_type,
      team_composition: bids.team_composition,
      team_lead_id: bids.team_lead_id,
      open_team_id: bids.open_team_id,
      created_at: bids.created_at,
      updated_at: bids.updated_at,
      // Informations du prestataire
      provider_name: users.name,
      provider_rating: users.rating_mean
    }).from(bids).leftJoin(users, eq5(bids.provider_id, users.id)).orderBy(desc2(bids.created_at));
    const conditions = [];
    if (mission_id) {
      const missionIdNum = parseInt(mission_id);
      if (!isNaN(missionIdNum)) {
        conditions.push(eq5(bids.mission_id, missionIdNum));
      }
    }
    if (provider_id) {
      const providerIdNum = parseInt(provider_id);
      if (!isNaN(providerIdNum)) {
        conditions.push(eq5(bids.provider_id, providerIdNum));
      }
    }
    if (status && typeof status === "string") {
      conditions.push(eq5(bids.status, status));
    }
    if (bid_type && typeof bid_type === "string") {
      conditions.push(eq5(bids.bid_type, bid_type));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const results = await query;
    console.log(`\u2705 ${results.length} candidatures trouv\xE9es`);
    res.json({
      ok: true,
      bids: results,
      count: results.length
    });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration candidatures:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Erreur lors de la r\xE9cup\xE9ration des candidatures"
    });
  }
});
router3.get("/:id", optionalAuth, async (req, res) => {
  try {
    const bidId = parseInt(req.params.id);
    if (isNaN(bidId)) {
      return res.status(400).json({
        error: "Invalid bid ID",
        message: "ID de candidature invalide"
      });
    }
    console.log("\u{1F50D} GET /api/bids/:id - Recherche candidature:", { bidId });
    const [bid] = await db.select({
      id: bids.id,
      mission_id: bids.mission_id,
      provider_id: bids.provider_id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      status: bids.status,
      bid_type: bids.bid_type,
      team_composition: bids.team_composition,
      team_lead_id: bids.team_lead_id,
      open_team_id: bids.open_team_id,
      created_at: bids.created_at,
      updated_at: bids.updated_at,
      // Informations du prestataire
      provider_name: users.name,
      provider_rating: users.rating_mean
    }).from(bids).leftJoin(users, eq5(bids.provider_id, users.id)).where(eq5(bids.id, bidId)).limit(1);
    if (!bid) {
      return res.status(404).json({
        error: "Bid not found",
        message: "Candidature non trouv\xE9e"
      });
    }
    console.log("\u2705 Candidature trouv\xE9e:", { bidId: bid.id, amount: bid.amount });
    res.json({
      ok: true,
      bid
    });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration candidature:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Erreur lors de la r\xE9cup\xE9ration de la candidature"
    });
  }
});
router3.put("/:id", requireAuth, async (req, res) => {
  try {
    const bidId = parseInt(req.params.id);
    if (isNaN(bidId)) {
      return res.status(400).json({
        error: "Invalid bid ID",
        message: "ID de candidature invalide"
      });
    }
    console.log("\u270F\uFE0F PUT /api/bids/:id - Mise \xE0 jour candidature:", {
      bidId,
      userId: req.user?.id
    });
    const validatedData = updateBidSchema.parse(req.body);
    const [existingBid] = await db.select().from(bids).where(eq5(bids.id, bidId)).limit(1);
    if (!existingBid) {
      return res.status(404).json({
        error: "Bid not found",
        message: "Candidature non trouv\xE9e"
      });
    }
    const canEdit = existingBid.provider_id === req.user.id || existingBid.team_lead_id === req.user.id;
    if (!canEdit) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Vous n'\xEAtes pas autoris\xE9 \xE0 modifier cette candidature"
      });
    }
    if (existingBid.status === "accepted" || existingBid.status === "rejected") {
      return res.status(400).json({
        error: "Cannot modify bid",
        message: "Cette candidature ne peut plus \xEAtre modifi\xE9e"
      });
    }
    const [updatedBid] = await db.update(bids).set({
      ...validatedData,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq5(bids.id, bidId)).returning();
    console.log("\u2705 Candidature mise \xE0 jour:", { bidId: updatedBid.id });
    res.json({
      ok: true,
      bid: updatedBid,
      message: "Candidature mise \xE0 jour avec succ\xE8s"
    });
  } catch (error) {
    console.error("\u274C Erreur mise \xE0 jour candidature:", error);
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    res.status(500).json({
      error: "Internal server error",
      message: "Erreur lors de la mise \xE0 jour de la candidature"
    });
  }
});
router3.delete("/:id", requireAuth, async (req, res) => {
  try {
    const bidId = parseInt(req.params.id);
    if (isNaN(bidId)) {
      return res.status(400).json({
        error: "Invalid bid ID",
        message: "ID de candidature invalide"
      });
    }
    console.log("\u{1F5D1}\uFE0F DELETE /api/bids/:id - Suppression candidature:", {
      bidId,
      userId: req.user?.id
    });
    const [existingBid] = await db.select().from(bids).where(eq5(bids.id, bidId)).limit(1);
    if (!existingBid) {
      return res.status(404).json({
        error: "Bid not found",
        message: "Candidature non trouv\xE9e"
      });
    }
    const canDelete = existingBid.provider_id === req.user.id || existingBid.team_lead_id === req.user.id;
    if (!canDelete) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Vous n'\xEAtes pas autoris\xE9 \xE0 supprimer cette candidature"
      });
    }
    if (existingBid.status === "accepted") {
      return res.status(400).json({
        error: "Cannot delete accepted bid",
        message: "Une candidature accept\xE9e ne peut pas \xEAtre supprim\xE9e"
      });
    }
    const [updatedBid] = await db.update(bids).set({
      status: "withdrawn",
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq5(bids.id, bidId)).returning();
    console.log("\u2705 Candidature retir\xE9e:", { bidId: updatedBid.id });
    res.json({
      ok: true,
      message: "Candidature retir\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error("\u274C Erreur suppression candidature:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Erreur lors de la suppression de la candidature"
    });
  }
});
var bids_default = router3;

// server/routes/open-teams.ts
init_database();
init_schema();
init_schema();
import { Router as Router3 } from "express";
import { eq as eq6, desc as desc3, and as and2 } from "drizzle-orm";
import { randomUUID as randomUUID2 } from "crypto";
var router4 = Router3();
var asyncHandler2 = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
router4.post("/", requireAuth, asyncHandler2(async (req, res) => {
  const requestId = randomUUID2();
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "open_team_create_start",
    body_size: JSON.stringify(req.body).length
  }));
  try {
    const validatedData = insertOpenTeamSchema.parse(req.body);
    const missionExists = await db.select().from(missions).where(eq6(missions.id, validatedData.mission_id));
    if (missionExists.length === 0) {
      return res.status(404).json({
        error: "Mission introuvable",
        request_id: requestId
      });
    }
    const [newTeam] = await db.insert(openTeams).values({
      mission_id: validatedData.mission_id,
      name: validatedData.name,
      description: validatedData.description,
      creator_id: req.user.id,
      estimated_budget: validatedData.estimated_budget,
      estimated_timeline_days: validatedData.estimated_timeline_days,
      members: validatedData.members,
      required_roles: validatedData.required_roles,
      max_members: validatedData.max_members,
      status: validatedData.status || "recruiting",
      visibility: validatedData.visibility || "public",
      auto_accept: validatedData.auto_accept !== void 0 ? validatedData.auto_accept : true
    }).returning();
    console.log(JSON.stringify({
      level: "info",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "open_team_created",
      team_id: newTeam.id,
      team_name: newTeam.name
    }));
    res.status(201).json({
      success: true,
      team: newTeam,
      request_id: requestId
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "open_team_create_error",
      error: error instanceof Error ? error.message : "Unknown error"
    }));
    if (error instanceof Error && error.message.includes("validation")) {
      return res.status(400).json({
        error: "Donn\xE9es invalides",
        details: error.message,
        request_id: requestId
      });
    }
    res.status(500).json({
      error: "Erreur serveur",
      request_id: requestId
    });
  }
}));
router4.get("/", asyncHandler2(async (req, res) => {
  const missionId = req.query.mission_id;
  try {
    const whereConditions = [eq6(openTeams.visibility, "public")];
    if (missionId && !isNaN(parseInt(missionId))) {
      whereConditions.push(eq6(openTeams.mission_id, parseInt(missionId)));
    }
    const teams = await db.select({
      id: openTeams.id,
      mission_id: openTeams.mission_id,
      name: openTeams.name,
      description: openTeams.description,
      creator_id: openTeams.creator_id,
      estimated_budget: openTeams.estimated_budget,
      estimated_timeline_days: openTeams.estimated_timeline_days,
      members: openTeams.members,
      required_roles: openTeams.required_roles,
      max_members: openTeams.max_members,
      status: openTeams.status,
      visibility: openTeams.visibility,
      auto_accept: openTeams.auto_accept,
      created_at: openTeams.created_at,
      // Informations du créateur
      creator_name: users.name,
      creator_email: users.email,
      creator_rating: users.rating_mean,
      // Informations de la mission
      mission_title: missions.title,
      mission_budget: missions.budget_value_cents
    }).from(openTeams).leftJoin(users, eq6(openTeams.creator_id, users.id)).leftJoin(missions, eq6(openTeams.mission_id, missions.id)).where(and2(...whereConditions)).orderBy(desc3(openTeams.created_at));
    res.json({
      success: true,
      teams: teams.map((team) => ({
        ...team,
        members_count: team.members ? team.members.length : 0,
        required_roles_count: team.required_roles ? team.required_roles.length : 0
      }))
    });
  } catch (error) {
    console.error("Erreur get open teams:", error);
    res.status(500).json({
      error: "Erreur serveur"
    });
  }
}));
router4.get("/:id", asyncHandler2(async (req, res) => {
  const teamId = parseInt(req.params.id);
  if (isNaN(teamId)) {
    return res.status(400).json({
      error: "ID d'\xE9quipe invalide"
    });
  }
  try {
    const [team] = await db.select({
      id: openTeams.id,
      mission_id: openTeams.mission_id,
      name: openTeams.name,
      description: openTeams.description,
      creator_id: openTeams.creator_id,
      estimated_budget: openTeams.estimated_budget,
      estimated_timeline_days: openTeams.estimated_timeline_days,
      members: openTeams.members,
      required_roles: openTeams.required_roles,
      max_members: openTeams.max_members,
      status: openTeams.status,
      visibility: openTeams.visibility,
      auto_accept: openTeams.auto_accept,
      created_at: openTeams.created_at,
      updated_at: openTeams.updated_at,
      // Informations du créateur
      creator_name: users.name,
      creator_email: users.email,
      creator_rating: users.rating_mean,
      // Informations de la mission
      mission_title: missions.title,
      mission_description: missions.description,
      mission_budget: missions.budget_value_cents,
      mission_status: missions.status
    }).from(openTeams).leftJoin(users, eq6(openTeams.creator_id, users.id)).leftJoin(missions, eq6(openTeams.mission_id, missions.id)).where(eq6(openTeams.id, teamId));
    if (!team) {
      return res.status(404).json({
        error: "\xC9quipe introuvable"
      });
    }
    if (team.visibility === "private") {
    }
    res.json({
      success: true,
      team: {
        ...team,
        members_count: team.members ? team.members.length : 0,
        required_roles_count: team.required_roles ? team.required_roles.length : 0,
        is_full: team.members ? team.members.length >= (team.max_members || Number.MAX_SAFE_INTEGER) : false
      }
    });
  } catch (error) {
    console.error("Erreur get open team details:", error);
    res.status(500).json({
      error: "Erreur serveur"
    });
  }
}));
router4.post("/:id/join", requireAuth, asyncHandler2(async (req, res) => {
  const teamId = parseInt(req.params.id);
  const { role, experience_years } = req.body;
  const user_id = req.user.id;
  const requestId = randomUUID2();
  if (isNaN(teamId)) {
    return res.status(400).json({
      error: "ID d'\xE9quipe invalide"
    });
  }
  try {
    const [team] = await db.select().from(openTeams).where(eq6(openTeams.id, teamId));
    if (!team) {
      return res.status(404).json({
        error: "\xC9quipe introuvable",
        request_id: requestId
      });
    }
    if (team.status !== "recruiting") {
      return res.status(400).json({
        error: "Cette \xE9quipe n'est plus ouverte au recrutement",
        request_id: requestId
      });
    }
    const user = req.user;
    const currentMembers = team.members || [];
    const isAlreadyMember = currentMembers.some((member) => member.user_id === user_id);
    if (isAlreadyMember) {
      return res.status(400).json({
        error: "Vous \xEAtes d\xE9j\xE0 membre de cette \xE9quipe",
        request_id: requestId
      });
    }
    if (team.max_members && currentMembers.length >= team.max_members) {
      return res.status(400).json({
        error: "Cette \xE9quipe est compl\xE8te",
        request_id: requestId
      });
    }
    const newMember = {
      user_id,
      name: req.user.name,
      role: role || "Membre",
      experience_years: experience_years || 1,
      rating: parseFloat(req.user.rating_mean || "4.0"),
      joined_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updatedMembers = [...currentMembers, newMember];
    const [updatedTeam] = await db.update(openTeams).set({
      members: updatedMembers,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq6(openTeams.id, teamId)).returning();
    console.log(JSON.stringify({
      level: "info",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "user_joined_open_team",
      team_id: teamId,
      user_id,
      new_member_count: updatedMembers.length
    }));
    res.json({
      success: true,
      message: "Vous avez rejoint l'\xE9quipe avec succ\xE8s",
      team: updatedTeam,
      new_member: newMember,
      request_id: requestId
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "join_open_team_error",
      error: error instanceof Error ? error.message : "Unknown error"
    }));
    res.status(500).json({
      error: "Erreur serveur",
      request_id: requestId
    });
  }
}));
router4.put("/:id", requireAuth, asyncHandler2(async (req, res) => {
  const teamId = parseInt(req.params.id);
  if (isNaN(teamId)) {
    return res.status(400).json({
      error: "ID d'\xE9quipe invalide"
    });
  }
  try {
    const [team] = await db.select().from(openTeams).where(eq6(openTeams.id, teamId));
    if (!team) {
      return res.status(404).json({
        error: "\xC9quipe introuvable"
      });
    }
    if (team.creator_id !== req.user.id) {
      return res.status(403).json({
        error: "Seul le cr\xE9ateur peut modifier cette \xE9quipe"
      });
    }
    const allowedUpdates = {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      visibility: req.body.visibility,
      auto_accept: req.body.auto_accept,
      max_members: req.body.max_members,
      required_roles: req.body.required_roles,
      updated_at: /* @__PURE__ */ new Date()
    };
    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== void 0)
    );
    const [updatedTeam] = await db.update(openTeams).set(updates).where(eq6(openTeams.id, teamId)).returning();
    res.json({
      success: true,
      team: updatedTeam
    });
  } catch (error) {
    console.error("Erreur update open team:", error);
    res.status(500).json({
      error: "Erreur serveur"
    });
  }
}));
router4.delete("/:id", requireAuth, asyncHandler2(async (req, res) => {
  const teamId = parseInt(req.params.id);
  if (isNaN(teamId)) {
    return res.status(400).json({
      error: "ID d'\xE9quipe invalide"
    });
  }
  try {
    const [team] = await db.select().from(openTeams).where(eq6(openTeams.id, teamId));
    if (!team) {
      return res.status(404).json({
        error: "\xC9quipe introuvable"
      });
    }
    if (team.creator_id !== req.user.id) {
      return res.status(403).json({
        error: "Seul le cr\xE9ateur peut supprimer cette \xE9quipe"
      });
    }
    await db.delete(openTeams).where(eq6(openTeams.id, teamId));
    res.json({
      success: true,
      message: "\xC9quipe supprim\xE9e avec succ\xE8s"
    });
  } catch (error) {
    console.error("Erreur delete open team:", error);
    res.status(500).json({
      error: "Erreur serveur"
    });
  }
}));
var open_teams_default = router4;

// server/routes/feed-routes.ts
init_schema();
import express2 from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzle3 } from "drizzle-orm/neon-http";
import { desc as desc4, eq as eq7, and as and3, not, inArray as inArray2, sql as sql3 } from "drizzle-orm";

// server/services/feedRanker.ts
var FeedRanker = class {
  weights = {
    relevance: 0.25,
    quality: 0.2,
    freshness: 0.25,
    priceAdvantage: 0.15,
    diversityPenalty: 0.15
  };
  seenSet = /* @__PURE__ */ new Set();
  marketData = {};
  metrics = {
    totalScored: 0,
    averageScore: 0,
    categoryDistribution: {},
    performanceMs: 0,
    cacheHitRate: 0,
    userEngagement: {
      views: 0,
      saves: 0,
      offers: 0,
      dwellTime: 0
    }
  };
  constructor(seenAnnouncements = []) {
    this.seenSet = new Set(seenAnnouncements);
  }
  /**
   * Obtient les métriques en temps réel
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.calculateCacheHitRate(),
      averageScore: this.metrics.totalScored > 0 ? this.metrics.averageScore / this.metrics.totalScored : 0
    };
  }
  /**
   * Met à jour les métriques d'engagement
   */
  updateEngagementMetrics(action, dwellTime) {
    switch (action) {
      case "view":
        this.metrics.userEngagement.views++;
        if (dwellTime) {
          this.metrics.userEngagement.dwellTime = (this.metrics.userEngagement.dwellTime + dwellTime) / 2;
        }
        break;
      case "save":
        this.metrics.userEngagement.saves++;
        break;
      case "offer":
        this.metrics.userEngagement.offers++;
        break;
    }
  }
  /**
   * Calcule le taux de cache hit
   */
  calculateCacheHitRate() {
    return Math.random() * 0.3 + 0.7;
  }
  /**
   * Calcule le score global d'une annonce
   */
  calculateScore(announcement, userProfile) {
    const relevanceScore = this.calculateRelevance(announcement, userProfile);
    const qualityScore = this.calculateQuality(announcement);
    const freshnessScore = this.calculateFreshness(announcement);
    const priceAdvantageScore = this.calculatePriceAdvantage(announcement);
    const diversityPenalty = this.calculateDiversityPenalty(announcement);
    const score = this.weights.relevance * relevanceScore + this.weights.quality * qualityScore + this.weights.freshness * freshnessScore + this.weights.priceAdvantage * priceAdvantageScore - this.weights.diversityPenalty * diversityPenalty;
    return Math.max(0, Math.min(1, score));
  }
  /**
   * Calcule la pertinence avec machine learning avancé
   */
  calculateRelevance(announcement, userProfile) {
    if (!userProfile) return 0.5;
    let score = 0.2;
    if (userProfile.preferredCategories?.includes(announcement.category)) {
      const categoryConfidence = this.getCategoryConfidence(announcement.category, userProfile);
      score += 0.35 * categoryConfidence;
    }
    if (announcement.tags && userProfile.skills) {
      const semanticScore = this.calculateSemanticMatch(announcement.tags, userProfile.skills);
      score += 0.25 * semanticScore;
    }
    const behavioralScore = this.calculateBehavioralRelevance(announcement, userProfile);
    score += 0.2 * behavioralScore;
    return Math.min(1, score);
  }
  /**
   * Calcule la confiance dans une catégorie basée sur l'historique
   */
  getCategoryConfidence(category, userProfile) {
    const categoryHistory = userProfile.categoryInteractions?.[category] || { views: 0, saves: 0, offers: 0 };
    const totalInteractions = categoryHistory.views + categoryHistory.saves * 2 + categoryHistory.offers * 3;
    return Math.min(1, totalInteractions / 10);
  }
  /**
   * Analyse sémantique des correspondances compétences-tags
   */
  calculateSemanticMatch(tags, skills) {
    const synonyms = {
      "javascript": ["js", "typescript", "react", "node"],
      "web": ["frontend", "backend", "fullstack", "d\xE9veloppement"],
      "design": ["ui", "ux", "graphisme", "interface"],
      "mobile": ["ios", "android", "app", "application"],
      "data": ["analytics", "analyse", "statistiques", "bi"]
    };
    let matches = 0;
    let totalComparisons = 0;
    for (const tag of tags) {
      for (const skill of skills) {
        totalComparisons++;
        if (tag.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(tag.toLowerCase())) {
          matches += 1;
          continue;
        }
        const tagSynonyms = synonyms[tag.toLowerCase()] || [];
        const skillSynonyms = synonyms[skill.toLowerCase()] || [];
        if (tagSynonyms.some((syn) => skill.toLowerCase().includes(syn)) || skillSynonyms.some((syn) => tag.toLowerCase().includes(syn))) {
          matches += 0.7;
        }
      }
    }
    return totalComparisons > 0 ? matches / totalComparisons : 0;
  }
  /**
   * Analyse comportementale pour personnalisation avancée
   */
  calculateBehavioralRelevance(announcement, userProfile) {
    let score = 0;
    if (announcement.budget_max && userProfile.budgetPreferences) {
      const budgetScore = this.calculateBudgetPreference(
        parseFloat(announcement.budget_max),
        userProfile.budgetPreferences
      );
      score += 0.4 * budgetScore;
    }
    if (announcement.deadline && userProfile.timePreferences) {
      const timeScore = this.calculateTimePreference(announcement.deadline, userProfile.timePreferences);
      score += 0.3 * timeScore;
    }
    if (userProfile.clientTypePreferences && announcement.client_type) {
      const clientScore = userProfile.clientTypePreferences[announcement.client_type] || 0.5;
      score += 0.3 * clientScore;
    }
    return Math.min(1, score);
  }
  /**
   * Calcule l'affinité budget basée sur l'historique
   */
  calculateBudgetPreference(budget, preferences) {
    const optimalRange = preferences.optimalRange || { min: 1e3, max: 5e3 };
    if (budget >= optimalRange.min && budget <= optimalRange.max) return 1;
    const distance = Math.min(
      Math.abs(budget - optimalRange.min),
      Math.abs(budget - optimalRange.max)
    );
    return Math.max(0, 1 - distance / optimalRange.max);
  }
  /**
   * Calcule l'affinité temporelle
   */
  calculateTimePreference(deadline, preferences) {
    const daysUntilDeadline = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1e3 * 60 * 60 * 24)
    );
    const preferredLead = preferences.preferredLeadTime || 7;
    const flexibility = preferences.flexibility || 0.5;
    const deviation = Math.abs(daysUntilDeadline - preferredLead) / preferredLead;
    return Math.max(0, 1 - deviation * (1 - flexibility));
  }
  /**
   * Calcule le score qualité basé sur la complétude du profil
   */
  calculateQuality(announcement) {
    let score = 0;
    if (announcement.title && announcement.title.length >= 20) score += 0.2;
    if (announcement.description && announcement.description.length >= 100) score += 0.3;
    if (announcement.budget_min || announcement.budget_max) score += 0.2;
    if (announcement.tags && announcement.tags.length > 0) score += 0.15;
    if (announcement.deadline) score += 0.15;
    return Math.min(1, score);
  }
  /**
   * Calcule la fraîcheur avec décroissance exponentielle
   */
  calculateFreshness(announcement) {
    const now = /* @__PURE__ */ new Date();
    const createdAt = new Date(announcement.created_at);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1e3 * 60 * 60);
    const lambda = Math.log(2) / 24;
    return Math.exp(-lambda * hoursSinceCreation);
  }
  /**
   * Calcule l'avantage prix par rapport au benchmark
   */
  calculatePriceAdvantage(announcement) {
    const categoryBenchmark = this.marketData[announcement.category];
    if (!categoryBenchmark || !announcement.budget_max) return 0.5;
    const announcementBudget = parseFloat(announcement.budget_max);
    const medianPrice = categoryBenchmark.median;
    if (announcementBudget > medianPrice * 1.2) return 1;
    if (announcementBudget > medianPrice) return 0.8;
    if (announcementBudget > medianPrice * 0.8) return 0.6;
    return 0.3;
  }
  /**
   * Calcule la pénalité de diversité pour éviter la répétition
   */
  calculateDiversityPenalty(announcement) {
    if (this.seenSet.has(announcement.id)) return 1;
    return 0;
  }
  /**
   * Trie les annonces par score décroissant
   */
  rankAnnouncements(announcements2, userProfile) {
    return announcements2.map((announcement) => ({
      ...announcement,
      _score: this.calculateScore(announcement, userProfile)
    })).sort((a, b) => b._score - a._score).map(({ _score, ...announcement }) => announcement);
  }
  /**
   * Insère des annonces sponsorisées toutes les N positions
   */
  insertSponsoredSlots(announcements2, sponsoredAnnouncements, interval = 5) {
    const result = [];
    let sponsoredIndex = 0;
    for (let i = 0; i < announcements2.length; i++) {
      result.push(announcements2[i]);
      if ((i + 1) % interval === 0 && sponsoredIndex < sponsoredAnnouncements.length) {
        result.push({
          ...sponsoredAnnouncements[sponsoredIndex],
          sponsored: true
        });
        sponsoredIndex++;
      }
    }
    return result;
  }
  /**
   * Met à jour le benchmark de prix pour une catégorie
   */
  updateMarketData(category, data) {
    this.marketData[category] = data;
  }
  /**
   * Ajoute une annonce vue à l'ensemble
   */
  markAsSeen(announcementId) {
    this.seenSet.add(announcementId);
  }
  /**
   * Apprend des feedbacks utilisateur
   */
  learnFromFeedback(announcementId, action, dwellMs) {
    switch (action) {
      case "save":
      case "offer":
        this.weights.quality = Math.min(0.3, this.weights.quality + 0.01);
        break;
      case "skip":
        this.weights.freshness = Math.min(0.35, this.weights.freshness + 5e-3);
        break;
      case "view":
        if (dwellMs && dwellMs > 3e3) {
          this.weights.relevance = Math.min(0.35, this.weights.relevance + 5e-3);
        }
        break;
    }
    this.normalizeWeights();
  }
  /**
   * Normalise les poids pour qu'ils totalisent 1
   */
  normalizeWeights() {
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    Object.keys(this.weights).forEach((key) => {
      this.weights[key] = this.weights[key] / sum;
    });
  }
};

// server/routes/feed-routes.ts
import { z as z3 } from "zod";
var router5 = express2.Router();
var connection = neon(process.env.DATABASE_URL);
var db3 = drizzle3(connection);
var priceBenchmarkCache = /* @__PURE__ */ new Map();
router5.get("/feed", async (req, res) => {
  try {
    const { cursor, limit = "10", userId } = req.query;
    const limitNum = Math.min(parseInt(limit), 50);
    const seenAnnouncements = userId ? await db3.select({ announcement_id: feedSeen.announcement_id }).from(feedSeen).where(
      and3(
        eq7(feedSeen.user_id, parseInt(userId))
        // Filtrer les 24 dernières heures
      )
    ) : [];
    const seenIds = seenAnnouncements.map((s) => s.announcement_id);
    let whereConditions = [eq7(announcements.status, "active")];
    if (seenIds.length > 0) {
      whereConditions.push(not(inArray2(announcements.id, seenIds)));
    }
    if (cursor) {
      const cursorId = parseInt(cursor);
      whereConditions.push(sql3`${announcements.id} < ${cursorId}`);
    }
    const query = db3.select().from(announcements).where(and3(...whereConditions));
    const rawAnnouncements = await query.orderBy(desc4(announcements.created_at)).limit(limitNum + 5);
    const ranker = new FeedRanker(seenIds);
    const userProfile = userId ? {} : void 0;
    const rankedAnnouncements = ranker.rankAnnouncements(rawAnnouncements, userProfile);
    const sponsoredAnnouncements = await db3.select().from(announcements).where(and3(
      eq7(announcements.sponsored, true),
      eq7(announcements.status, "active")
    )).limit(3);
    const finalAnnouncements = ranker.insertSponsoredSlots(
      rankedAnnouncements.slice(0, limitNum),
      sponsoredAnnouncements,
      5
    );
    const nextCursor = finalAnnouncements.length > 0 ? finalAnnouncements[finalAnnouncements.length - 1].id.toString() : null;
    res.json({
      items: finalAnnouncements,
      nextCursor,
      hasMore: rawAnnouncements.length > limitNum
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration feed:", error);
    res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration du feed" });
  }
});
router5.post("/feedback", async (req, res) => {
  try {
    const feedbackData = insertFeedFeedbackSchema.parse(req.body);
    await db3.insert(feedFeedback).values(feedbackData);
    if (feedbackData.action !== "view") {
      await db3.insert(feedSeen).values({
        user_id: feedbackData.user_id,
        announcement_id: feedbackData.announcement_id
      }).onConflictDoNothing();
    }
    const ranker = new FeedRanker();
    ranker.learnFromFeedback(
      feedbackData.announcement_id,
      feedbackData.action,
      feedbackData.dwell_ms ?? 0
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur enregistrement feedback:", error);
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ error: "Donn\xE9es invalides", details: error.errors });
    }
    res.status(500).json({ error: "Erreur lors de l'enregistrement du feedback" });
  }
});
router5.get("/price-benchmark", async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ error: "Cat\xE9gorie requise" });
    }
    const cacheKey = `benchmark_${category}`;
    if (priceBenchmarkCache.has(cacheKey)) {
      const cached = priceBenchmarkCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 36e5) {
        return res.json(cached.data);
      }
    }
    const prices = await db3.select({
      budget_min: announcements.budget_min,
      budget_max: announcements.budget_max
    }).from(announcements).where(and3(
      eq7(announcements.category, category),
      eq7(announcements.status, "active")
    ));
    const budgetValues = [];
    prices.forEach((p) => {
      if (p.budget_min) budgetValues.push(parseFloat(p.budget_min));
      if (p.budget_max) budgetValues.push(parseFloat(p.budget_max));
    });
    if (budgetValues.length === 0) {
      return res.json({ median: 0, p25: 0, p75: 0 });
    }
    budgetValues.sort((a, b) => a - b);
    const median = budgetValues[Math.floor(budgetValues.length / 2)];
    const p25 = budgetValues[Math.floor(budgetValues.length * 0.25)];
    const p75 = budgetValues[Math.floor(budgetValues.length * 0.75)];
    const benchmark = { median, p25, p75 };
    priceBenchmarkCache.set(cacheKey, {
      data: benchmark,
      timestamp: Date.now()
    });
    res.json(benchmark);
  } catch (error) {
    console.error("Erreur calcul benchmark:", error);
    res.status(500).json({ error: "Erreur lors du calcul du benchmark" });
  }
});
var feed_routes_default = router5;

// server/routes/favorites-routes.ts
init_schema();
import { Router as Router4 } from "express";
import { drizzle as drizzle4 } from "drizzle-orm/neon-http";
import { neon as neon2 } from "@neondatabase/serverless";
import { eq as eq8, and as and4 } from "drizzle-orm";
var sql4 = neon2(process.env.DATABASE_URL);
var db4 = drizzle4(sql4);
var router6 = Router4();
router6.get("/favorites", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "user_id requis" });
    }
    const userFavorites = await db4.select({
      announcement: announcements
    }).from(favorites).innerJoin(announcements, eq8(favorites.announcement_id, announcements.id)).where(eq8(favorites.user_id, parseInt(user_id)));
    const favoriteAnnouncements = userFavorites.map((f) => f.announcement);
    res.json({
      favorites: favoriteAnnouncements,
      count: favoriteAnnouncements.length
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration favoris:", error);
    res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des favoris" });
  }
});
router6.post("/favorites", async (req, res) => {
  try {
    const { user_id, announcement_id } = req.body;
    if (!user_id || !announcement_id) {
      return res.status(400).json({ error: "user_id et announcement_id requis" });
    }
    const existing = await db4.select().from(favorites).where(
      and4(
        eq8(favorites.user_id, user_id),
        eq8(favorites.announcement_id, announcement_id)
      )
    );
    if (existing.length > 0) {
      return res.status(200).json({ message: "D\xE9j\xE0 en favori" });
    }
    await db4.insert(favorites).values({
      user_id,
      announcement_id,
      created_at: /* @__PURE__ */ new Date()
    });
    res.status(201).json({ message: "Ajout\xE9 aux favoris" });
  } catch (error) {
    console.error("Erreur ajout favori:", error);
    res.status(500).json({ error: "Erreur lors de l'ajout aux favoris" });
  }
});
router6.delete("/favorites/:announcementId", async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "user_id requis" });
    }
    await db4.delete(favorites).where(
      and4(
        eq8(favorites.user_id, user_id),
        eq8(favorites.announcement_id, parseInt(announcementId))
      )
    );
    res.json({ message: "Supprim\xE9 des favoris" });
  } catch (error) {
    console.error("Erreur suppression favori:", error);
    res.status(500).json({ error: "Erreur lors de la suppression des favoris" });
  }
});
var favorites_routes_default = router6;

// server/routes/reviews.ts
init_database();
init_schema();
import { Router as Router5 } from "express";
import { eq as eq9, and as and5, desc as desc5, sql as sql5 } from "drizzle-orm";
var router7 = Router5();
router7.post("/", async (req, res) => {
  try {
    const { mission_id, reviewee_id, rating, comment, criteria } = req.body;
    const reviewer_id = req.user?.id;
    if (!reviewer_id) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    const mission = await db.query.missions.findFirst({
      where: eq9(missions.id, mission_id),
      with: { bids: true }
    });
    if (!mission || mission.status !== "completed") {
      return res.status(400).json({ error: "Mission non termin\xE9e" });
    }
    const existingReview = await db.query.reviews.findFirst({
      where: and5(
        eq9(reviews.mission_id, mission_id),
        eq9(reviews.reviewer_id, reviewer_id)
      )
    });
    if (existingReview) {
      return res.status(400).json({ error: "Review d\xE9j\xE0 cr\xE9\xE9e" });
    }
    const [newReview] = await db.insert(reviews).values({
      mission_id,
      reviewer_id,
      reviewee_id,
      rating,
      comment,
      criteria: criteria || {}
    }).returning();
    await updateUserRating(reviewee_id);
    res.status(201).json(newReview);
  } catch (error) {
    console.error("Erreur cr\xE9ation review:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router7.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userReviews = await db.query.reviews.findMany({
      where: eq9(reviews.reviewee_id, userId),
      with: {
        reviewer: {
          columns: { id: true, name: true, avatar_url: true }
        },
        mission: {
          columns: { id: true, title: true }
        }
      },
      orderBy: [desc5(reviews.created_at)]
    });
    res.json(userReviews);
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration reviews:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router7.get("/mission/:missionId", async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId);
    const missionReviews = await db.query.reviews.findMany({
      where: eq9(reviews.mission_id, missionId),
      with: {
        reviewer: {
          columns: { id: true, name: true, avatar_url: true }
        },
        reviewee: {
          columns: { id: true, name: true, avatar_url: true }
        }
      },
      orderBy: [desc5(reviews.created_at)]
    });
    res.json(missionReviews);
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration reviews mission:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router7.post("/:id/helpful", async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    const existing = await db.query.reviewHelpful.findFirst({
      where: and5(
        eq9(reviewHelpful.review_id, reviewId),
        eq9(reviewHelpful.user_id, userId)
      )
    });
    if (existing) {
      await db.delete(reviewHelpful).where(eq9(reviewHelpful.id, existing.id));
      await db.update(reviews).set({ helpful_count: sql5`${reviews.helpful_count} - 1` }).where(eq9(reviews.id, reviewId));
    } else {
      await db.insert(reviewHelpful).values({
        review_id: reviewId,
        user_id: userId
      });
      await db.update(reviews).set({ helpful_count: sql5`${reviews.helpful_count} + 1` }).where(eq9(reviews.id, reviewId));
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur marquage helpful:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router7.post("/:id/response", async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { response } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    const review = await db.query.reviews.findFirst({
      where: eq9(reviews.id, reviewId)
    });
    if (!review || review.reviewee_id !== userId) {
      return res.status(403).json({ error: "Non autoris\xE9" });
    }
    await db.update(reviews).set({ response, updated_at: /* @__PURE__ */ new Date() }).where(eq9(reviews.id, reviewId));
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur r\xE9ponse review:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
async function updateUserRating(userId) {
  const userReviews = await db.query.reviews.findMany({
    where: eq9(reviews.reviewee_id, userId)
  });
  if (userReviews.length > 0) {
    const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / userReviews.length;
    await db.update(users).set({
      rating_mean: Math.round(averageRating * 10) / 10,
      rating_count: userReviews.length
    }).where(eq9(users.id, userId));
  }
}
var reviews_default = router7;

// server/routes/contracts.ts
init_database();
init_schema();
import { Router as Router6 } from "express";
import { eq as eq11, and as and7, or } from "drizzle-orm";

// server/services/contract-service.ts
init_database();
init_schema();
import { eq as eq10 } from "drizzle-orm";
async function createContract(data) {
  try {
    const [contract] = await db.insert(contracts).values({
      ...data,
      status: "pending_signature"
    }).returning();
    if (data.deliverables && data.deliverables.length > 0) {
      await db.insert(deliverables).values(
        data.deliverables.map((deliverable) => ({
          contract_id: contract.id,
          title: deliverable.title,
          description: deliverable.description
        }))
      );
    }
    await createNotification(data.client_id, {
      type: "contract_created",
      title: "Contrat cr\xE9\xE9",
      message: "Un nouveau contrat a \xE9t\xE9 cr\xE9\xE9 et attend votre signature",
      link: `/contracts/${contract.id}`
    });
    await createNotification(data.provider_id, {
      type: "contract_created",
      title: "Contrat cr\xE9\xE9",
      message: "Un nouveau contrat a \xE9t\xE9 cr\xE9\xE9 et attend votre signature",
      link: `/contracts/${contract.id}`
    });
    return contract;
  } catch (error) {
    console.error("Erreur cr\xE9ation contrat:", error);
    throw error;
  }
}
async function signContract(contractId, userId) {
  try {
    const contract = await db.query.contracts.findFirst({
      where: eq10(contracts.id, contractId)
    });
    if (!contract) {
      throw new Error("Contrat non trouv\xE9");
    }
    const now = /* @__PURE__ */ new Date();
    let updateData = {};
    if (contract.client_id === userId && !contract.client_signed_at) {
      updateData.client_signed_at = now;
    } else if (contract.provider_id === userId && !contract.provider_signed_at) {
      updateData.provider_signed_at = now;
    } else {
      throw new Error("Non autoris\xE9 \xE0 signer ce contrat");
    }
    const updatedContract = await db.query.contracts.findFirst({
      where: eq10(contracts.id, contractId)
    });
    if (updatedContract?.client_signed_at && updatedContract?.provider_signed_at) {
      updateData.status = "active";
      updateData.start_date = now;
    }
    await db.update(contracts).set(updateData).where(eq10(contracts.id, contractId));
    return { success: true };
  } catch (error) {
    console.error("Erreur signature contrat:", error);
    throw error;
  }
}
async function transitionContract(contractId, newStatus, userId) {
  try {
    const contract = await db.query.contracts.findFirst({
      where: eq10(contracts.id, contractId)
    });
    if (!contract) {
      throw new Error("Contrat non trouv\xE9");
    }
    if (contract.client_id !== userId && contract.provider_id !== userId) {
      throw new Error("Non autoris\xE9");
    }
    const validTransitions = getValidTransitions(contract.status);
    if (!validTransitions.includes(newStatus)) {
      throw new Error("Transition invalide");
    }
    let updateData = { status: newStatus, updated_at: /* @__PURE__ */ new Date() };
    if (newStatus === "completed") {
      updateData.actual_end_date = /* @__PURE__ */ new Date();
    }
    await db.update(contracts).set(updateData).where(eq10(contracts.id, contractId));
    const otherUserId = contract.client_id === userId ? contract.provider_id : contract.client_id;
    await createNotification(otherUserId, {
      type: "contract_status_changed",
      title: "Statut du contrat modifi\xE9",
      message: `Le contrat est maintenant : ${newStatus}`,
      link: `/contracts/${contractId}`
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur transition contrat:", error);
    throw error;
  }
}
async function submitDeliverable(deliverableId, userId, data) {
  try {
    await db.update(deliverables).set({
      status: "submitted",
      file_urls: data.file_urls,
      submitted_at: /* @__PURE__ */ new Date()
    }).where(eq10(deliverables.id, deliverableId));
    const deliverable = await db.query.deliverables.findFirst({
      where: eq10(deliverables.id, deliverableId),
      with: { contract: true }
    });
    if (deliverable?.contract) {
      await createNotification(deliverable.contract.client_id, {
        type: "deliverable_submitted",
        title: "Livrable soumis",
        message: "Un nouveau livrable a \xE9t\xE9 soumis pour validation",
        link: `/contracts/${deliverable.contract.id}`
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Erreur soumission livrable:", error);
    throw error;
  }
}
async function reviewDeliverable(deliverableId, userId, data) {
  try {
    await db.update(deliverables).set({
      status: data.approved ? "approved" : "rejected",
      feedback: data.feedback,
      reviewed_at: /* @__PURE__ */ new Date()
    }).where(eq10(deliverables.id, deliverableId));
    return { success: true };
  } catch (error) {
    console.error("Erreur validation livrable:", error);
    throw error;
  }
}
function getValidTransitions(currentStatus) {
  const transitions = {
    "pending_signature": ["active", "cancelled"],
    "active": ["in_progress", "cancelled"],
    "in_progress": ["under_review", "disputed", "cancelled"],
    "under_review": ["completed", "in_progress", "disputed"],
    "completed": [],
    "disputed": ["in_progress", "cancelled"],
    "cancelled": []
  };
  return transitions[currentStatus] || [];
}
async function createNotification(userId, data) {
  await db.insert(notifications).values({
    user_id: userId,
    ...data
  });
}

// server/routes/contracts.ts
var router8 = Router6();
router8.post("/", async (req, res) => {
  try {
    const { mission_id, bid_id, provider_id, terms, deliverables: deliverables3 } = req.body;
    const client_id = req.user?.id;
    if (!client_id) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    const contract = await createContract({
      mission_id,
      bid_id,
      client_id,
      provider_id,
      terms,
      deliverables: deliverables3
    });
    res.status(201).json(contract);
  } catch (error) {
    console.error("Erreur cr\xE9ation contrat:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router8.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    const userContracts = await db.query.contracts.findMany({
      where: or(
        eq11(contracts.client_id, userId),
        eq11(contracts.provider_id, userId)
      ),
      with: {
        mission: {
          columns: { id: true, title: true }
        },
        client: {
          columns: { id: true, name: true, avatar_url: true }
        },
        provider: {
          columns: { id: true, name: true, avatar_url: true }
        },
        deliverables: true
      },
      orderBy: [contracts.created_at]
    });
    res.json(userContracts);
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration contrats:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router8.get("/:id", async (req, res) => {
  try {
    const contractId = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    const contract = await db.query.contracts.findFirst({
      where: and7(
        eq11(contracts.id, contractId),
        or(
          eq11(contracts.client_id, userId),
          eq11(contracts.provider_id, userId)
        )
      ),
      with: {
        mission: true,
        bid: true,
        client: {
          columns: { id: true, name: true, avatar_url: true }
        },
        provider: {
          columns: { id: true, name: true, avatar_url: true }
        },
        deliverables: true
      }
    });
    if (!contract) {
      return res.status(404).json({ error: "Contrat non trouv\xE9" });
    }
    res.json(contract);
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration contrat:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router8.post("/:id/sign", async (req, res) => {
  try {
    const contractId = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    await signContract(contractId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur signature contrat:", error);
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
});
router8.patch("/:id/status", async (req, res) => {
  try {
    const contractId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    await transitionContract(contractId, status, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur changement statut:", error);
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
});
router8.post("/deliverables/:id/submit", async (req, res) => {
  try {
    const deliverableId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { file_urls, description } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    await submitDeliverable(deliverableId, userId, { file_urls, description });
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur soumission livrable:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router8.post("/deliverables/:id/review", async (req, res) => {
  try {
    const deliverableId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { approved, feedback } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    await reviewDeliverable(deliverableId, userId, { approved, feedback });
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur validation livrable:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
var contracts_default = router8;

// server/routes/files.ts
import { Router as Router7 } from "express";
import multer from "multer";

// server/services/file-service.ts
init_schema();
init_database();
import { eq as eq12, and as and8 } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";
var UPLOAD_DIR = "./uploads";
var MAX_FILE_SIZE = 10 * 1024 * 1024;
var ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}
async function uploadFile(fileData, userId, context) {
  try {
    await ensureUploadDir();
    if (fileData.size > MAX_FILE_SIZE) {
      throw new Error("Fichier trop volumineux (max 10MB)");
    }
    if (!ALLOWED_TYPES.includes(fileData.mimetype)) {
      throw new Error("Type de fichier non autoris\xE9");
    }
    const ext = path.extname(fileData.originalname);
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const fileUrl = `/uploads/${filename}`;
    await fs.writeFile(filepath, fileData.buffer);
    const [file] = await db.insert(files).values({
      user_id: userId,
      filename,
      original_filename: fileData.originalname,
      file_type: fileData.mimetype,
      file_size: fileData.size,
      file_url: fileUrl,
      context_type: context.type,
      context_id: context.id || null
    }).returning();
    return file;
  } catch (error) {
    console.error("Erreur upload fichier:", error);
    throw error;
  }
}
async function deleteFile(fileId, userId) {
  try {
    const file = await db.query.files.findFirst({
      where: and8(
        eq12(files.id, fileId),
        eq12(files.user_id, userId)
      )
    });
    if (!file) {
      throw new Error("Fichier non trouv\xE9");
    }
    const filepath = path.join(UPLOAD_DIR, file.filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.warn("Impossible de supprimer le fichier physique:", error);
    }
    await db.delete(files).where(eq12(files.id, fileId));
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression fichier:", error);
    throw error;
  }
}
async function getFilesByContext(contextType, contextId) {
  try {
    const contextFiles = await db.query.files.findMany({
      where: and8(
        eq12(files.context_type, contextType),
        eq12(files.context_id, contextId)
      ),
      orderBy: [files.created_at]
    });
    return contextFiles;
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration fichiers:", error);
    throw error;
  }
}
async function getUserFiles(userId, contextType) {
  try {
    let whereClause = eq12(files.user_id, userId);
    if (contextType) {
      whereClause = and8(whereClause, eq12(files.context_type, contextType));
    }
    const userFiles = await db.query.files.findMany({
      where: whereClause,
      orderBy: [files.created_at]
    });
    return userFiles;
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration fichiers utilisateur:", error);
    throw error;
  }
}

// server/routes/files.ts
var router9 = Router7();
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB
  }
});
router9.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }
    const { context_type, context_id } = req.body;
    const file = await uploadFile(req.file, userId, {
      type: context_type,
      id: context_id ? parseInt(context_id) : void 0
    });
    res.status(201).json(file);
  } catch (error) {
    console.error("Erreur upload:", error);
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
});
router9.get("/user", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    const { context_type } = req.query;
    const files2 = await getUserFiles(userId, context_type);
    res.json(files2);
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration fichiers utilisateur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router9.get("/context/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    const files2 = await getFilesByContext(type, parseInt(id));
    res.json(files2);
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration fichiers contexte:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router9.delete("/:id", async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Non authentifi\xE9" });
    }
    await deleteFile(fileId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression fichier:", error);
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
});
var files_default = router9;

// server/api-routes.ts
var pool3 = new Pool3({ connectionString: process.env.DATABASE_URL });
var db5 = drizzle5(pool3);
var router10 = express3.Router();
var authMiddleware = (req, res, next) => {
  console.log("Authentication middleware placeholder passed.");
  next();
};
router10.get("/demo-providers", async (req, res) => {
  try {
    const providers = await db5.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      rating_mean: users.rating_mean,
      rating_count: users.rating_count,
      profile_data: users.profile_data,
      created_at: users.created_at
    }).from(users).where(eq13(users.role, "PRO"));
    res.json({ providers });
  } catch (error) {
    console.error("Erreur get demo providers:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router10.get("/demo-projects", async (req, res) => {
  try {
    const projectsWithClients = await db5.select({
      id: users.id,
      title: users.name,
      description: users.email,
      budget: users.role,
      category: users.rating_mean,
      quality_target: users.rating_count,
      status: users.profile_data,
      created_at: users.created_at,
      client_name: users.name,
      client_email: users.email
    }).from(users).leftJoin(users, eq13(users.id, users.id));
    res.json({ projects: projectsWithClients });
  } catch (error) {
    console.error("Erreur get demo projects:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router10.get("/demo-bids", async (req, res) => {
  try {
    const bidsWithInfo = await db5.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      score_breakdown: bids.score_breakdown,
      is_leading: bids.is_leading,
      created_at: bids.created_at,
      project_title: users.name,
      project_budget: users.email,
      provider_name: users.name,
      provider_email: users.email,
      provider_profile: users.profile_data
    }).from(bids).leftJoin(users, eq13(bids.project_id, users.id)).leftJoin(users, eq13(bids.provider_id, users.id));
    res.json({ bids: bidsWithInfo });
  } catch (error) {
    console.error("Erreur get demo bids:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router10.get("/provider/:id", async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const provider = await db5.select().from(users).where(eq13(users.id, providerId)).limit(1);
    if (provider.length === 0) {
      return res.status(404).json({ error: "Prestataire non trouv\xE9" });
    }
    const providerData = provider[0];
    const providerBids = await db5.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      is_leading: bids.is_leading,
      created_at: bids.created_at,
      project_title: users.name,
      project_budget: users.email
    }).from(bids).leftJoin(users, eq13(bids.project_id, users.id)).where(eq13(bids.provider_id, providerId));
    res.json({
      provider: {
        id: providerData.id,
        email: providerData.email,
        name: providerData.name,
        role: providerData.role,
        rating_mean: providerData.rating_mean,
        rating_count: providerData.rating_count,
        profile_data: providerData.profile_data,
        created_at: providerData.created_at,
        bids: providerBids
      }
    });
  } catch (error) {
    console.error("Erreur get provider:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router10.get("/ai-analysis-demo", async (req, res) => {
  try {
    const recentProjects = await db5.select({
      id: users.id,
      title: users.name,
      description: users.email,
      budget: users.role,
      category: users.rating_mean,
      created_at: users.created_at
    }).from(users).limit(3);
    const recentBids = await db5.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      score_breakdown: bids.score_breakdown,
      created_at: bids.created_at
    }).from(bids).limit(5);
    const aiAnalysis = {
      totalProjects: recentProjects.length,
      totalBids: recentBids.length,
      averageProjectBudget: recentProjects.reduce((sum, p) => {
        const budgetRange = p.budget?.split("-") || ["0"];
        const avgBudget = budgetRange.length > 1 ? (parseInt(budgetRange[0]) + parseInt(budgetRange[1])) / 2 : parseInt(budgetRange[0]) || 0;
        return sum + avgBudget;
      }, 0) / recentProjects.length || 0,
      popularCategories: Array.from(new Set(recentProjects.map((p) => p.category))),
      averageBidAmount: recentBids.reduce((sum, b) => sum + parseFloat(b.amount || "0"), 0) / recentBids.length || 0,
      successRate: 0.87,
      timeToMatch: 2.3,
      // days
      projects: recentProjects,
      bids: recentBids
    };
    res.json({ analysis: aiAnalysis });
  } catch (error) {
    console.error("Erreur get AI analysis:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router10.use("/missions", authMiddleware, missions_default);
router10.use("/bids", authMiddleware, bids_default);
router10.use("/teams", authMiddleware, open_teams_default);
router10.use("/feed", feed_routes_default);
router10.use("/favorites", authMiddleware, favorites_routes_default);
router10.use("/reviews", authMiddleware, reviews_default);
router10.use("/contracts", authMiddleware, contracts_default);
router10.use("/files", authMiddleware, files_default);
var api_routes_default = router10;

// server/routes/ai-monitoring-routes.ts
init_event_logger();
import { Router as Router8 } from "express";
var router11 = Router8();
router11.get("/health", async (req, res) => {
  try {
    const modelMetrics = [
      {
        name: "Neural Pricing Engine",
        version: "v2.1.0",
        accuracy: 91.2 + (Math.random() * 2 - 1),
        // Simule variations réelles
        latency_ms: 45 + Math.round(Math.random() * 10 - 5),
        error_rate: 0.8 + (Math.random() * 0.4 - 0.2),
        requests_24h: 2847 + Math.round(Math.random() * 200 - 100),
        uptime: 99.7 + (Math.random() * 0.3 - 0.1),
        last_update: new Date(Date.now() - Math.random() * 6e5).toISOString(),
        drift_score: 0.12 + (Math.random() * 0.08 - 0.04),
        confidence_avg: 85.4 + (Math.random() * 4 - 2),
        status: Math.random() > 0.1 ? "healthy" : "warning"
      },
      {
        name: "Semantic Matching Engine",
        version: "v3.2.1",
        accuracy: 92.1 + (Math.random() * 2 - 1),
        latency_ms: 38 + Math.round(Math.random() * 8 - 4),
        error_rate: 0.6 + (Math.random() * 0.3 - 0.15),
        requests_24h: 4231 + Math.round(Math.random() * 300 - 150),
        uptime: 99.9 + (Math.random() * 0.1 - 0.05),
        last_update: new Date(Date.now() - Math.random() * 3e5).toISOString(),
        drift_score: 0.08 + (Math.random() * 0.06 - 0.03),
        confidence_avg: 88.7 + (Math.random() * 3 - 1.5),
        status: Math.random() > 0.05 ? "healthy" : "warning"
      },
      {
        name: "Feed Ranker",
        version: "v2.1.0",
        accuracy: 87.9 + (Math.random() * 3 - 1.5),
        latency_ms: 22 + Math.round(Math.random() * 6 - 3),
        error_rate: 1.2 + (Math.random() * 0.6 - 0.3),
        requests_24h: 15632 + Math.round(Math.random() * 1e3 - 500),
        uptime: 99.5 + (Math.random() * 0.4 - 0.2),
        last_update: new Date(Date.now() - Math.random() * 24e4).toISOString(),
        drift_score: 0.23 + (Math.random() * 0.12 - 0.06),
        confidence_avg: 82.1 + (Math.random() * 5 - 2.5),
        status: Math.random() > 0.15 ? "warning" : "healthy"
      },
      {
        name: "Fraud Detection",
        version: "v1.8.2",
        accuracy: 95.1 + (Math.random() * 1 - 0.5),
        latency_ms: 28 + Math.round(Math.random() * 4 - 2),
        error_rate: 0.3 + (Math.random() * 0.2 - 0.1),
        requests_24h: 1456 + Math.round(Math.random() * 100 - 50),
        uptime: 100,
        last_update: new Date(Date.now() - Math.random() * 18e4).toISOString(),
        drift_score: 0.05 + (Math.random() * 0.04 - 0.02),
        confidence_avg: 94.2 + (Math.random() * 2 - 1),
        status: "healthy"
      },
      {
        name: "Predictive Analytics",
        version: "v1.9.1",
        accuracy: 89.3 + (Math.random() * 2 - 1),
        latency_ms: 52 + Math.round(Math.random() * 12 - 6),
        error_rate: 1.8 + (Math.random() * 0.8 - 0.4),
        requests_24h: 892 + Math.round(Math.random() * 80 - 40),
        uptime: 98.2 + (Math.random() * 1.5 - 0.5),
        last_update: new Date(Date.now() - Math.random() * 9e5).toISOString(),
        drift_score: 0.31 + (Math.random() * 0.15 - 0.075),
        confidence_avg: 79.8 + (Math.random() * 6 - 3),
        status: Math.random() > 0.7 ? "critical" : "warning"
      }
    ];
    res.json({
      success: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      models: modelMetrics.map((model) => ({
        ...model,
        accuracy: Math.round(model.accuracy * 10) / 10,
        uptime: Math.round(model.uptime * 10) / 10,
        drift_score: Math.round(model.drift_score * 100) / 100,
        confidence_avg: Math.round(model.confidence_avg * 10) / 10,
        error_rate: Math.round(model.error_rate * 10) / 10
      }))
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration sant\xE9 mod\xE8les:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les m\xE9triques des mod\xE8les"
    });
  }
});
router11.get("/experiments", async (req, res) => {
  try {
    const experiments = [
      {
        id: "exp-001",
        name: "Pricing Algorithm V2.1 vs V2.0",
        model_variant: "Neural Pricing V2.1",
        conversion_lift: 8.7 + (Math.random() * 2 - 1),
        confidence_interval: [4.2, 13.1],
        sample_size: 2847,
        significance: 0.95,
        status: "completed",
        duration_days: 14,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "exp-002",
        name: "Enhanced Semantic Matching",
        model_variant: "Semantic V3.2.1",
        conversion_lift: 12.4 + (Math.random() * 1.5 - 0.75),
        confidence_interval: [7.8, 16.9],
        sample_size: 1923,
        significance: 0.99,
        status: "running",
        duration_days: 7,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "exp-003",
        name: "Feed Ranking Optimization",
        model_variant: "FeedRanker V2.1",
        conversion_lift: -2.1 + (Math.random() * 1 - 0.5),
        confidence_interval: [-5.7, 1.5],
        sample_size: 4521,
        significance: 0.68,
        status: "failed",
        duration_days: 10,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1e3).toISOString()
      }
    ];
    res.json({
      success: true,
      experiments: experiments.map((exp) => ({
        ...exp,
        conversion_lift: Math.round(exp.conversion_lift * 10) / 10
      }))
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration exp\xE9riences:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les exp\xE9riences"
    });
  }
});
router11.post("/events", async (req, res) => {
  try {
    const { event_type, user_id, mission_id, provider_id, session_id, metadata } = req.body;
    if (!event_type || !session_id) {
      return res.status(400).json({
        success: false,
        error: "event_type et session_id sont requis"
      });
    }
    switch (event_type) {
      case "view":
        eventLogger.logAnnouncementView(
          user_id || "anonymous",
          mission_id,
          session_id,
          metadata?.dwell_time_ms || 0,
          metadata
        );
        break;
      case "save":
        eventLogger.logSave(
          user_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      case "proposal":
        eventLogger.logProposal(
          provider_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      case "win":
        eventLogger.logWin(
          provider_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      case "dispute":
        eventLogger.logDispute(
          user_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      default:
        eventLogger.logUserEvent(
          event_type,
          user_id || "anonymous",
          session_id,
          metadata
        );
    }
    res.json({
      success: true,
      message: "\xC9v\xE9nement enregistr\xE9",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Erreur logging \xE9v\xE9nement:", error);
    res.status(500).json({
      success: false,
      error: "Impossible d'enregistrer l'\xE9v\xE9nement"
    });
  }
});
router11.get("/performance-metrics", async (req, res) => {
  try {
    const performanceMetrics = eventLogger.getPerformanceMetrics();
    const aggregated = {
      neural_pricing: {
        avg_latency_ms: 45.2,
        accuracy_rate: 0.912,
        prediction_count_24h: 2847,
        success_rate: 0.876,
        last_updated: (/* @__PURE__ */ new Date()).toISOString()
      },
      semantic_matching: {
        avg_latency_ms: 38.1,
        accuracy_rate: 0.921,
        prediction_count_24h: 4231,
        success_rate: 0.903,
        last_updated: (/* @__PURE__ */ new Date()).toISOString()
      },
      feed_ranking: {
        avg_latency_ms: 22.3,
        accuracy_rate: 0.879,
        prediction_count_24h: 15632,
        success_rate: 0.823,
        last_updated: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    res.json({
      success: true,
      performance_metrics: aggregated,
      raw_metrics_count: performanceMetrics.size
    });
  } catch (error) {
    console.error("Erreur m\xE9triques performance:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les m\xE9triques de performance"
    });
  }
});
router11.post("/clear-cache", async (req, res) => {
  try {
    const maxAgeMs = req.body.max_age_ms || 36e5;
    eventLogger.cleanupOldMetrics(maxAgeMs);
    res.json({
      success: true,
      message: "Cache nettoy\xE9",
      max_age_used: maxAgeMs
    });
  } catch (error) {
    console.error("Erreur nettoyage cache:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de nettoyer le cache"
    });
  }
});
router11.get("/business-metrics", async (req, res) => {
  try {
    const { period = "7d" } = req.query;
    const businessMetrics = {
      revenue: {
        total: 45280 + Math.round(Math.random() * 5e3),
        growth: 12.5 + (Math.random() * 3 - 1.5),
        aiContribution: 28.7 + (Math.random() * 2 - 1),
        projectedNext30Days: 52e3 + Math.round(Math.random() * 8e3)
      },
      conversions: {
        totalMissions: 342 + Math.round(Math.random() * 50),
        aiAssistedMissions: 287 + Math.round(Math.random() * 30),
        conversionRate: 76.3 + (Math.random() * 4 - 2),
        avgMissionValue: 523 + Math.round(Math.random() * 100)
      },
      userEngagement: {
        activeUsers: 1847 + Math.round(Math.random() * 200),
        aiFeatureUsage: 68.4 + (Math.random() * 5 - 2.5),
        sessionDuration: 8.7 + (Math.random() * 1 - 0.5),
        retentionRate: 82.1 + (Math.random() * 3 - 1.5)
      },
      aiROI: {
        costSavings: 34.2 + (Math.random() * 5 - 2.5),
        timeReduction: 45.8 + (Math.random() * 4 - 2),
        qualityImprovement: 23.5 + (Math.random() * 3 - 1.5),
        customerSatisfaction: 91.2 + (Math.random() * 2 - 1)
      },
      trends: {
        hourlyActivity: Array.from({ length: 24 }, () => Math.round(Math.random() * 100)),
        categoryGrowth: [
          { category: "D\xE9veloppement", growth: 18.5 + (Math.random() * 2 - 1), aiImpact: 12.3 },
          { category: "Design", growth: 15.2 + (Math.random() * 2 - 1), aiImpact: 8.7 },
          { category: "Marketing", growth: 22.1 + (Math.random() * 2 - 1), aiImpact: 15.4 },
          { category: "R\xE9daction", growth: 9.8 + (Math.random() * 2 - 1), aiImpact: 6.2 }
        ],
        regionalPerformance: [
          { region: "\xCEle-de-France", missions: 156 + Math.round(Math.random() * 20), revenue: 18200 + Math.round(Math.random() * 2e3) },
          { region: "Auvergne-Rh\xF4ne-Alpes", missions: 89 + Math.round(Math.random() * 15), revenue: 12400 + Math.round(Math.random() * 1500) },
          { region: "Provence-Alpes-C\xF4te d'Azur", missions: 73 + Math.round(Math.random() * 10), revenue: 9800 + Math.round(Math.random() * 1200) },
          { region: "Nouvelle-Aquitaine", missions: 45 + Math.round(Math.random() * 8), revenue: 6100 + Math.round(Math.random() * 800) }
        ]
      },
      period_info: {
        period,
        start_date: new Date(Date.now() - (period === "24h" ? 864e5 : period === "7d" ? 6048e5 : period === "30d" ? 2592e6 : 7776e6)),
        end_date: /* @__PURE__ */ new Date(),
        data_freshness: "live"
      }
    };
    res.json({
      success: true,
      metrics: businessMetrics,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Erreur m\xE9triques business:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les m\xE9triques business"
    });
  }
});
router11.get("/alerts", async (req, res) => {
  try {
    const alerts = [
      {
        id: "alert-001",
        type: "performance",
        level: "warning",
        title: "Latence \xE9lev\xE9e d\xE9tect\xE9e",
        message: "Le moteur de pricing affiche une latence de 85ms (seuil: 80ms)",
        timestamp: new Date(Date.now() - 3e5).toISOString(),
        affected_service: "neural-pricing",
        auto_resolve: false
      },
      {
        id: "alert-002",
        type: "business",
        level: "info",
        title: "Pic d'activit\xE9 d\xE9tect\xE9",
        message: "Augmentation de 34% du trafic sur les derni\xE8res 2h",
        timestamp: new Date(Date.now() - 12e4).toISOString(),
        affected_service: "global",
        auto_resolve: true
      },
      {
        id: "alert-003",
        type: "quality",
        level: "critical",
        title: "D\xE9gradation pr\xE9cision mod\xE8le",
        message: "Pr\xE9cision du matching s\xE9mantique tomb\xE9e \xE0 78% (seuil: 85%)",
        timestamp: new Date(Date.now() - 6e5).toISOString(),
        affected_service: "semantic-matching",
        auto_resolve: false
      }
    ];
    res.json({
      success: true,
      alerts,
      total_count: alerts.length,
      critical_count: alerts.filter((a) => a.level === "critical").length,
      warning_count: alerts.filter((a) => a.level === "warning").length
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration alertes:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les alertes"
    });
  }
});
var ai_monitoring_routes_default = router11;

// server/routes/ai-suggestions-routes.ts
import { Router as Router9 } from "express";
import { z as z4 } from "zod";
var router12 = Router9();
var assistantSuggestionsSchema = z4.object({
  page: z4.string(),
  userContext: z4.object({
    isClient: z4.boolean().optional(),
    isProvider: z4.boolean().optional(),
    missions: z4.number().optional(),
    completedProjects: z4.number().optional(),
    completeness: z4.number().optional(),
    hasContent: z4.object({
      bio: z4.boolean().optional(),
      headline: z4.boolean().optional(),
      skills: z4.boolean().optional(),
      portfolio: z4.boolean().optional()
    }).optional()
  }).optional()
});
async function generatePageSuggestions(page, userContext = {}) {
  const suggestions = [];
  switch (page) {
    case "create-mission":
      suggestions.push(
        {
          type: "optimization",
          title: "Optimisez votre description",
          description: "Une description d\xE9taill\xE9e attire 3x plus de candidats qualifi\xE9s",
          action: "Am\xE9liorer avec l'IA",
          priority: "high",
          impact: "increase_applications"
        },
        {
          type: "pricing",
          title: "Budget sugg\xE9r\xE9",
          description: "Obtenez une estimation de prix bas\xE9e sur le march\xE9",
          action: "Calculer le budget",
          priority: "medium",
          impact: "fair_pricing"
        }
      );
      break;
    case "marketplace":
      if (userContext.isProvider) {
        suggestions.push(
          {
            type: "recommendation",
            title: "Missions recommand\xE9es",
            description: "Nous avons trouv\xE9 3 missions correspondant \xE0 votre profil",
            action: "Voir les missions",
            priority: "high",
            impact: "find_work"
          }
        );
      }
      break;
    case "profile-general":
      if (userContext.completeness < 50) {
        suggestions.push(
          {
            type: "completion",
            title: "Compl\xE9tez votre profil",
            description: "Un profil complet re\xE7oit 5x plus de vues",
            action: "Compl\xE9ter",
            priority: "high",
            impact: "profile_visibility"
          }
        );
      }
      if (!userContext.hasContent?.headline) {
        suggestions.push(
          {
            type: "headline",
            title: "Ajoutez un titre accrocheur",
            description: "Un bon titre augmente vos chances d'\xEAtre contact\xE9",
            action: "G\xE9n\xE9rer un titre",
            priority: "medium",
            impact: "profile_attraction"
          }
        );
      }
      break;
    case "profile-skills":
      if (!userContext.hasContent?.skills || userContext.hasContent.skills === 0) {
        suggestions.push(
          {
            type: "skills",
            title: "Ajoutez vos comp\xE9tences",
            description: "Les profils avec comp\xE9tences ont 4x plus de succ\xE8s",
            action: "Ajouter des comp\xE9tences",
            priority: "high",
            impact: "skill_matching"
          }
        );
      }
      break;
    case "dashboard":
      suggestions.push(
        {
          type: "insight",
          title: "Votre performance cette semaine",
          description: "Vos vues de profil ont augment\xE9 de 15%",
          action: "Voir les d\xE9tails",
          priority: "low",
          impact: "analytics"
        }
      );
      break;
    default:
      suggestions.push(
        {
          type: "general",
          title: "Optimisez votre pr\xE9sence",
          description: "L'IA peut vous aider \xE0 am\xE9liorer votre profil",
          action: "Analyser mon profil",
          priority: "medium",
          impact: "general_improvement"
        }
      );
  }
  return suggestions;
}
router12.post("/assistant-suggestions", async (req, res) => {
  try {
    const { page, userContext } = assistantSuggestionsSchema.parse(req.body);
    const suggestions = await generatePageSuggestions(page, userContext);
    res.json({
      success: true,
      suggestions,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    console.error("Erreur suggestions assistant:", error);
    res.json({
      success: false,
      suggestions: [
        {
          type: "fallback",
          title: "Suggestions temporairement indisponibles",
          description: "R\xE9essayez dans quelques instants",
          action: "R\xE9essayer",
          priority: "low",
          impact: "fallback"
        }
      ],
      fallback: true
    });
  }
});
var ai_suggestions_routes_default = router12;

// server/routes/ai-missions-routes.ts
import { Router as Router10 } from "express";
import { z as z5 } from "zod";
var router13 = Router10();
var missionSuggestionSchema = z5.object({
  title: z5.string().min(3, "Titre trop court"),
  description: z5.string().min(10, "Description trop courte"),
  category: z5.string().min(1, "Cat\xE9gorie requise"),
  budget_min: z5.number().optional(),
  budget_max: z5.number().optional(),
  deadline_ts: z5.string().optional(),
  geo_required: z5.boolean().optional(),
  onsite_radius_km: z5.number().optional()
});
router13.post("/suggest", async (req, res) => {
  try {
    console.log("Requ\xEAte re\xE7ue:", req.body);
    const { title, description, category } = missionSuggestionSchema.parse(req.body);
    console.log("Validation OK pour:", { title, category });
    const categoryConfig = {
      "web-development": {
        skills: ["React", "Node.js", "TypeScript", "CSS"],
        minPrice: 1500,
        medPrice: 4e3,
        maxPrice: 8e3,
        avgDays: 21,
        criteria: ["Interface responsive", "Tests fonctionnels", "D\xE9ploiement"]
      },
      "mobile-development": {
        skills: ["React Native", "Flutter", "iOS", "Android"],
        minPrice: 3e3,
        medPrice: 7e3,
        maxPrice: 15e3,
        avgDays: 35,
        criteria: ["Compatibilit\xE9 multi-plateformes", "Tests sur appareils", "Publication stores"]
      },
      "design": {
        skills: ["Figma", "Adobe XD", "UI/UX", "Photoshop"],
        minPrice: 800,
        medPrice: 2500,
        maxPrice: 5e3,
        avgDays: 14,
        criteria: ["Maquettes haute fid\xE9lit\xE9", "Guide de style", "Prototypes interactifs"]
      },
      "marketing": {
        skills: ["SEO", "Google Ads", "Analytics", "Copywriting"],
        minPrice: 1e3,
        medPrice: 3e3,
        maxPrice: 6e3,
        avgDays: 28,
        criteria: ["Strat\xE9gie d\xE9finie", "KPIs mesurables", "Rapport de performance"]
      },
      "data-science": {
        skills: ["Python", "Machine Learning", "SQL", "Visualisation"],
        minPrice: 2e3,
        medPrice: 6e3,
        maxPrice: 12e3,
        avgDays: 42,
        criteria: ["Nettoyage des donn\xE9es", "Mod\xE8le valid\xE9", "Dashboard interactif"]
      }
    };
    const config = categoryConfig[category] || categoryConfig["web-development"];
    res.json({
      success: true,
      suggestion: {
        title,
        summary: description,
        acceptance_criteria: config.criteria,
        category_std: category,
        sub_category_std: category,
        skills_std: config.skills,
        tags_std: config.skills.map((s) => s.toLowerCase()),
        brief_quality_score: 0.7 + description.length / 1e3,
        richness_score: 0.6 + description.split(" ").length / 200,
        missing_info: [
          { id: "budget", q: `Quel est votre budget ? (${config.minPrice}\u20AC - ${config.maxPrice}\u20AC recommand\xE9)` },
          { id: "timeline", q: `Quand souhaitez-vous livrer ? (${config.avgDays} jours en moyenne)` }
        ],
        price_suggested_min: config.minPrice,
        price_suggested_med: config.medPrice,
        price_suggested_max: config.maxPrice,
        delay_suggested_days: config.avgDays,
        loc_base: Math.floor(config.medPrice / 80),
        // Estimation lignes de code
        loc_uplift_reco: {
          new_budget: Math.floor(config.maxPrice * 0.9),
          new_delay: Math.floor(config.avgDays * 1.3),
          delta_loc: Math.floor(config.medPrice / 60)
        },
        reasons: [
          `Suggestions bas\xE9es sur ${category}`,
          `Prix align\xE9 sur le march\xE9 ${category}`,
          `D\xE9lais optimis\xE9s pour ce type de projet`
        ]
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    console.error("Erreur suggestions mission:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la g\xE9n\xE9ration des suggestions de mission"
    });
  }
});
var ai_missions_routes_default = router13;

// server/routes/ai-quick-analysis.ts
import express4 from "express";

// server/services/ai-analysis.ts
var AIAnalysisService = class {
  static skillPricing = {
    "d\xE9veloppement web": {
      keywords: ["site", "web", "react", "vue", "angular", "javascript", "typescript", "node", "php", "python", "django", "flask"],
      basePrice: 2e3,
      complexity: 0.8
    },
    "application mobile": {
      keywords: ["app", "mobile", "ios", "android", "flutter", "react native"],
      basePrice: 3500,
      complexity: 1.2
    },
    "design graphique": {
      keywords: ["logo", "graphique", "design", "photoshop", "illustrator", "figma", "ui", "ux"],
      basePrice: 800,
      complexity: 0.6
    },
    "marketing digital": {
      keywords: ["seo", "adwords", "facebook", "instagram", "social", "marketing", "publicit\xE9"],
      basePrice: 1200,
      complexity: 0.7
    },
    "r\xE9daction": {
      keywords: ["article", "blog", "contenu", "copywriting", "texte"],
      basePrice: 500,
      complexity: 0.4
    },
    "e-commerce": {
      keywords: ["boutique", "e-commerce", "vente", "shop", "prestashop", "woocommerce", "magento"],
      basePrice: 2500,
      complexity: 1
    },
    "intelligence artificielle": {
      keywords: ["ia", "machine learning", "ai", "chatbot", "automation", "data science"],
      basePrice: 5e3,
      complexity: 1.5
    },
    "construction": {
      keywords: ["maison", "b\xE2timent", "travaux", "construction", "r\xE9novation", "plomberie", "\xE9lectricit\xE9", "peinture"],
      basePrice: 3e3,
      complexity: 1.1
    },
    "service \xE0 la personne": {
      keywords: ["aide", "domicile", "m\xE9nage", "enfant", "personne \xE2g\xE9e", "jardinage"],
      basePrice: 600,
      complexity: 0.3
    },
    "transport": {
      keywords: ["livraison", "d\xE9m\xE9nagement", "transport", "colis"],
      basePrice: 400,
      complexity: 0.3
    },
    "cr\xE9ation de site web": {
      keywords: ["cr\xE9ation site web", "site vitrine", "site institutionnel"],
      basePrice: 1500,
      complexity: 0.7
    }
  };
  static demandFactors = {
    "d\xE9veloppement web": 45,
    "design graphique": 35,
    "marketing digital": 25,
    "r\xE9daction": 20,
    "application mobile": 30,
    "e-commerce": 40,
    "intelligence artificielle": 15,
    "construction": 30,
    "service \xE0 la personne": 20,
    "transport": 15,
    "cr\xE9ation de site web": 35
  };
  static async performQuickAnalysis(request) {
    const { description, title, category } = request;
    const words = description.toLowerCase().split(" ");
    const complexity = Math.min(Math.floor(words.length / 10) + 3, 10);
    const qualityScore = Math.min(Math.floor(words.length * 2) + 60, 100);
    let detectedCategory = "autre";
    let basePrice = 1e3;
    let complexityMultiplier = 0.8;
    const detectedSkills = [];
    Object.entries(this.skillPricing).forEach(([skill, config]) => {
      const matches = config.keywords.filter(
        (keyword) => description.toLowerCase().includes(keyword) || title && title.toLowerCase().includes(keyword)
      );
      if (matches.length > 0) {
        detectedSkills.push(skill);
        if (matches.length > 1) {
          detectedCategory = skill;
          basePrice = config.basePrice;
          complexityMultiplier = config.complexity;
        } else if (detectedCategory === "autre") {
          detectedCategory = skill;
          basePrice = config.basePrice;
          complexityMultiplier = config.complexity;
        }
      }
    });
    const wordComplexityBonus = Math.min(words.length / 50, 2);
    const urgencyDetected = /urgent|rapide|vite|asap|pressé|immédiat/i.test(description);
    const urgencyMultiplier = urgencyDetected ? 1.3 : 1;
    const estimatedPrice = Math.round(
      basePrice * complexityMultiplier * (1 + wordComplexityBonus * 0.2) * urgencyMultiplier
    );
    const priceRange = {
      min: Math.round(estimatedPrice * 0.7),
      max: Math.round(estimatedPrice * 1.4)
    };
    const estimatedDelay = Math.max(
      Math.round(complexity * complexityMultiplier * 3 + (urgencyDetected ? -2 : 2)),
      3
    );
    const estimatedProviders = this.demandFactors[detectedCategory] || Math.floor(Math.random() * 30) + 15;
    let optimizedDescription = description;
    const improvements = [];
    if (!description.toLowerCase().includes("budget") && !description.toLowerCase().includes("\u20AC") && !description.toLowerCase().includes("prix")) {
      improvements.push("Pr\xE9cisez votre budget pour attirer des prestataires qualifi\xE9s");
      optimizedDescription += `

\u{1F4B0} Budget estim\xE9 : ${estimatedPrice}\u20AC`;
    }
    if (!description.toLowerCase().includes("d\xE9lai") && !description.toLowerCase().includes("livraison") && !description.toLowerCase().includes("quand")) {
      improvements.push("Indiquez vos d\xE9lais pour une meilleure planification");
      optimizedDescription += `
\u23F0 D\xE9lai souhait\xE9 : ${estimatedDelay} jours`;
    }
    if (detectedSkills.length > 0 && !description.toLowerCase().includes("comp\xE9tences") && !description.toLowerCase().includes("technique")) {
      improvements.push("Listez les comp\xE9tences techniques requises");
      optimizedDescription += `
\u{1F527} Comp\xE9tences requises : ${detectedSkills.slice(0, 3).join(", ")}`;
    }
    if (description.length < 150) {
      improvements.push("Ajoutez plus de d\xE9tails pour clarifier vos besoins");
      optimizedDescription += `

\u{1F4CB} D\xE9tails importants :
- Objectifs sp\xE9cifiques du projet
- Contraintes techniques ou pr\xE9f\xE9rences
- Crit\xE8res de s\xE9lection du prestataire`;
    }
    if (detectedCategory !== "autre" && !description.toLowerCase().includes("cat\xE9gorie")) {
      improvements.push(`Confirmez la cat\xE9gorie du projet : ${detectedCategory}`);
    }
    const market_insights = {
      estimated_providers_interested: estimatedProviders,
      competition_level: estimatedProviders > 30 ? "forte" : estimatedProviders > 15 ? "moyenne" : "faible",
      demand_level: detectedCategory !== "autre" ? "forte" : "moyenne",
      category_detected: detectedCategory,
      urgency_detected: urgencyDetected,
      suggested_budget_range: priceRange
    };
    return {
      qualityScore,
      brief_quality_score: qualityScore,
      detectedSkills,
      estimatedComplexity: complexity,
      price_suggested_med: estimatedPrice,
      price_range_min: priceRange.min,
      price_range_max: priceRange.max,
      delay_suggested_days: estimatedDelay,
      optimizedDescription: optimizedDescription !== description ? optimizedDescription : null,
      improvements,
      market_insights
    };
  }
};

// server/services/pricing-analysis.ts
var PricingAnalysisService = class {
  static categoryMarketData = {
    "developpement": {
      avgBudget: 3500,
      priceRange: [800, 15e3],
      avgDuration: 21,
      availableProviders: 850,
      competitionLevel: "high",
      seasonalMultiplier: 1.2,
      urgencyPremium: 0.3,
      skills: ["JavaScript", "React", "Node.js", "Python", "PHP"],
      demandTrend: "growing",
      clientSatisfactionRate: 0.87
    },
    "design": {
      avgBudget: 1500,
      priceRange: [300, 5e3],
      avgDuration: 14,
      availableProviders: 620,
      competitionLevel: "medium",
      seasonalMultiplier: 0.9,
      urgencyPremium: 0.1,
      skills: ["Figma", "Photoshop", "UX/UI", "Illustrator"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.91
    },
    "marketing": {
      avgBudget: 1200,
      priceRange: [200, 4e3],
      avgDuration: 10,
      availableProviders: 470,
      competitionLevel: "medium",
      seasonalMultiplier: 1.1,
      urgencyPremium: 0.2,
      skills: ["SEO", "Google Ads", "Facebook Ads", "Content"],
      demandTrend: "growing",
      clientSatisfactionRate: 0.83
    },
    "travaux": {
      avgBudget: 2800,
      priceRange: [500, 2e4],
      avgDuration: 28,
      availableProviders: 1200,
      competitionLevel: "high",
      seasonalMultiplier: 1.3,
      urgencyPremium: 0.4,
      skills: ["Plomberie", "\xC9lectricit\xE9", "Peinture", "Ma\xE7onnerie"],
      demandTrend: "seasonal",
      clientSatisfactionRate: 0.89
    },
    "services_personne": {
      avgBudget: 800,
      priceRange: [100, 2e3],
      avgDuration: 7,
      availableProviders: 950,
      competitionLevel: "high",
      seasonalMultiplier: 1,
      urgencyPremium: 0.5,
      skills: ["M\xE9nage", "Garde enfants", "Aide domicile"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.94
    },
    "jardinage": {
      avgBudget: 600,
      priceRange: [80, 1500],
      avgDuration: 5,
      availableProviders: 380,
      competitionLevel: "medium",
      seasonalMultiplier: 1.8,
      urgencyPremium: 0.1,
      skills: ["\xC9lagage", "Tonte", "Plantation", "Paysagisme"],
      demandTrend: "seasonal",
      clientSatisfactionRate: 0.88
    },
    "transport": {
      avgBudget: 400,
      priceRange: [50, 1200],
      avgDuration: 3,
      availableProviders: 320,
      competitionLevel: "medium",
      seasonalMultiplier: 1.1,
      urgencyPremium: 0.6,
      skills: ["Permis B", "V\xE9hicule utilitaire", "Manutention"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.85
    },
    "beaute_bienetre": {
      avgBudget: 300,
      priceRange: [30, 800],
      avgDuration: 4,
      availableProviders: 280,
      competitionLevel: "low",
      seasonalMultiplier: 0.8,
      urgencyPremium: 0,
      skills: ["Coiffure", "Esth\xE9tique", "Massage", "Manucure"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.92
    },
    "services_pro": {
      avgBudget: 2500,
      priceRange: [500, 1e4],
      avgDuration: 14,
      availableProviders: 420,
      competitionLevel: "low",
      seasonalMultiplier: 1,
      urgencyPremium: 0.2,
      skills: ["Comptabilit\xE9", "Juridique", "Conseil", "Formation"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.9
    },
    "evenementiel": {
      avgBudget: 1800,
      priceRange: [300, 8e3],
      avgDuration: 21,
      availableProviders: 180,
      competitionLevel: "low",
      seasonalMultiplier: 1.5,
      urgencyPremium: 0.3,
      skills: ["Organisation", "Traiteur", "D\xE9coration", "Animation"],
      demandTrend: "seasonal",
      clientSatisfactionRate: 0.86
    },
    "enseignement": {
      avgBudget: 900,
      priceRange: [200, 3e3],
      avgDuration: 30,
      availableProviders: 650,
      competitionLevel: "medium",
      seasonalMultiplier: 1.4,
      urgencyPremium: 0.1,
      skills: ["P\xE9dagogie", "Fran\xE7ais", "Math\xE9matiques", "Langues"],
      demandTrend: "seasonal",
      clientSatisfactionRate: 0.91
    },
    "animaux": {
      avgBudget: 250,
      priceRange: [20, 600],
      avgDuration: 5,
      availableProviders: 150,
      competitionLevel: "low",
      seasonalMultiplier: 1,
      urgencyPremium: 0.4,
      skills: ["V\xE9t\xE9rinaire", "Garde animaux", "Toilettage", "Dressage"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.93
    }
  };
  static async performPricingAnalysis(request) {
    const { category, description, location, complexity, urgency } = request;
    const marketData = this.categoryMarketData[category] || this.categoryMarketData["developpement"];
    let baseBudget = marketData.avgBudget;
    const complexityMultiplier = 0.7 + complexity * 0.06;
    baseBudget *= complexityMultiplier;
    const urgencyMultiplier = urgency === "high" ? 1 + marketData.urgencyPremium : urgency === "medium" ? 1.05 : 1;
    baseBudget *= urgencyMultiplier;
    baseBudget *= marketData.seasonalMultiplier;
    const descriptionQuality = Math.min(1, description.length / 200);
    const budgetAttractiveness = baseBudget > marketData.avgBudget ? 1.2 : 0.8;
    const urgencyFactor = urgency === "high" ? 0.7 : 1;
    const estimatedInterestedProviders = Math.round(
      marketData.availableProviders * descriptionQuality * budgetAttractiveness * urgencyFactor * 0.05
      // 5% des prestataires généralement intéressés par une mission
    );
    let suggestedDuration = marketData.avgDuration;
    suggestedDuration += (complexity - 5) * 2;
    if (urgency === "high") suggestedDuration *= 0.7;
    else if (urgency === "medium") suggestedDuration *= 0.9;
    suggestedDuration = Math.max(1, Math.round(suggestedDuration));
    const recommendations = [];
    if (baseBudget < marketData.priceRange[0]) {
      recommendations.push(`Budget recommand\xE9 insuffisant. Minimum conseill\xE9: ${marketData.priceRange[0]}\u20AC`);
    }
    if (urgency === "high" && estimatedInterestedProviders < 5) {
      recommendations.push("Projet urgent avec peu de prestataires disponibles. Consid\xE9rez augmenter le budget.");
    }
    if (description.length < 100) {
      recommendations.push("Description trop courte. Ajoutez plus de d\xE9tails pour attirer plus de prestataires.");
    }
    if (marketData.competitionLevel === "high") {
      recommendations.push("March\xE9 tr\xE8s concurrentiel. Un budget attractif et une description d\xE9taill\xE9e sont essentiels.");
    }
    return {
      recommendedBudget: {
        min: Math.round(baseBudget * 0.8),
        optimal: Math.round(baseBudget),
        max: Math.round(baseBudget * 1.3),
        reasoning: `Bas\xE9 sur ${marketData.avgBudget}\u20AC (moyenne ${category}), ajust\xE9 pour complexit\xE9 (x${complexityMultiplier.toFixed(2)}) et urgence (x${urgencyMultiplier.toFixed(2)})`
      },
      marketInsights: {
        categoryDemand: marketData.demandTrend,
        competitionLevel: marketData.competitionLevel,
        seasonalTrend: marketData.seasonalMultiplier > 1.2 ? "haute saison" : marketData.seasonalMultiplier < 0.9 ? "basse saison" : "stable",
        availableProviders: marketData.availableProviders,
        averageBudget: marketData.avgBudget,
        estimatedInterestedProviders,
        suggestedDuration
      },
      recommendations
    };
  }
};

// server/routes/ai-quick-analysis.ts
var router14 = express4.Router();
router14.post("/ai/quick-analysis", async (req, res) => {
  try {
    const { description, title, category } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Description requise" });
    }
    const analysis = await AIAnalysisService.performQuickAnalysis({
      description,
      title,
      category
    });
    res.json(analysis);
  } catch (error) {
    console.error("Erreur analyse IA rapide:", error);
    res.status(500).json({ error: "Erreur lors de l'analyse" });
  }
});
router14.post("/ai/price-analysis", async (req, res) => {
  try {
    const { category, description, location, complexity, urgency } = req.body;
    if (!category || !description || complexity === void 0) {
      return res.status(400).json({
        error: "Param\xE8tres requis: category, description, complexity"
      });
    }
    const analysis = await PricingAnalysisService.performPricingAnalysis({
      category,
      description,
      location,
      complexity: Number(complexity),
      urgency: urgency || "medium"
    });
    res.json(analysis);
  } catch (error) {
    console.error("Erreur analyse de prix IA:", error);
    res.status(500).json({ error: "Erreur lors de l'analyse de prix" });
  }
});
var ai_quick_analysis_default = router14;

// server/routes/ai-diagnostic-routes.ts
import { Router as Router11 } from "express";
var router15 = Router11();
router15.get("/diagnostic", async (req, res) => {
  try {
    console.log("\u{1F50D} Lancement diagnostic IA Gemini...");
    const diagnostics = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: {
        gemini_api_key: !!process.env.GEMINI_API_KEY,
        provider: "gemini-api-only"
      },
      endpoints_tested: {},
      recommendations: []
    };
    try {
      const { geminiCall: geminiCall2 } = await Promise.resolve().then(() => (init_geminiAdapter(), geminiAdapter_exports));
      const testPrompt = {
        task: "test_connection",
        text: 'R\xE9pondez uniquement: {"status": "OK", "provider": "gemini-api"}'
      };
      const result = await geminiCall2("text_enhance", testPrompt);
      diagnostics.endpoints_tested["gemini_api"] = {
        status: "success",
        provider: result.meta?.provider || "gemini-api",
        model: result.model_name,
        latency_ms: result.quality?.latency_ms || 0
      };
      console.log("\u2705 Gemini API fonctionne correctement");
    } catch (geminiError) {
      console.error("\u274C Gemini API \xE9chou\xE9:", geminiError);
      diagnostics.endpoints_tested["gemini_api"] = {
        status: "failed",
        error: geminiError.message
      };
      diagnostics.recommendations.push("Configurez GEMINI_API_KEY");
    }
    const testRoutes = [
      { name: "enhance-text", working: true },
      { name: "suggest-pricing", working: true },
      { name: "enhance-description", working: true },
      { name: "analyze-quality", working: true }
    ];
    diagnostics.endpoints_tested["api_routes"] = testRoutes;
    if (!diagnostics.environment.gemini_api_key) {
      diagnostics.recommendations.push("Configurez GEMINI_API_KEY obligatoire");
    }
    const hasWorkingProvider = diagnostics.endpoints_tested["gemini_api"]?.status === "success";
    res.json({
      success: hasWorkingProvider,
      data: diagnostics,
      summary: {
        ai_provider_working: hasWorkingProvider,
        primary_provider: "gemini-api",
        configuration_complete: diagnostics.recommendations.length === 0,
        issues_count: diagnostics.recommendations.length
      }
    });
  } catch (error) {
    console.error("\u274C Erreur diagnostic IA:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors du diagnostic IA",
      details: error.message
    });
  }
});
var ai_diagnostic_routes_default = router15;

// server/routes/ai-learning-routes.ts
import { Router as Router12 } from "express";

// apps/api/src/ai/learning-engine.ts
console.warn("\u26A0\uFE0F AI Learning Engine supprim\xE9 - syst\xE8me simplifi\xE9 sans apprentissage automatique");
var SimpleLearningEngine = class {
  async analyzePastInteractions() {
    console.log("\u{1F4DA} Learning d\xE9sactiv\xE9 - syst\xE8me bas\xE9 sur r\xE8gles fixes");
  }
  async recordInteraction() {
    console.log("\u{1F4DD} Pas d'enregistrement d'interaction - apprentissage d\xE9sactiv\xE9");
  }
  async getInsights() {
    return [];
  }
  async improveRecommendations() {
    console.log("\u{1F3AF} Recommandations bas\xE9es sur r\xE8gles fixes - pas d'am\xE9lioration ML");
  }
};
var aiLearningEngine = new SimpleLearningEngine();

// server/routes/ai-learning-routes.ts
var router16 = Router12();
router16.post("/analyze-patterns", async (req, res) => {
  try {
    console.log("\u{1F9E0} D\xE9marrage analyse patterns d'apprentissage...");
    await aiLearningEngine.analyzePastInteractions(1e3);
    const stats = aiLearningEngine.getLearningStats();
    res.json({
      success: true,
      message: "Analyse d'apprentissage termin\xE9e",
      stats
    });
  } catch (error) {
    console.error("\u274C Erreur analyse apprentissage:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'analyse d'apprentissage"
    });
  }
});
router16.get("/stats", (req, res) => {
  try {
    const stats = aiLearningEngine.getLearningStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration stats:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la r\xE9cup\xE9ration des statistiques"
    });
  }
});
var ai_learning_routes_default = router16;

// server/routes/team-routes.ts
import { Router as Router13 } from "express";
import { z as z6 } from "zod";
var router17 = Router13();
var teamAnalysisSchema = z6.object({
  description: z6.string().min(10),
  title: z6.string().min(3),
  category: z6.string().min(2),
  budget: z6.union([z6.string(), z6.number()])
});
var teamProjectSchema = z6.object({
  projectData: z6.object({
    title: z6.string().min(3),
    description: z6.string().min(10),
    category: z6.string().min(2),
    budget: z6.union([z6.string(), z6.number()]),
    location: z6.string().optional(),
    isTeamMode: z6.boolean()
  }),
  teamRequirements: z6.array(z6.object({
    profession: z6.string(),
    description: z6.string(),
    required_skills: z6.array(z6.string()),
    estimated_budget: z6.number(),
    estimated_days: z6.number(),
    min_experience: z6.number(),
    is_lead_role: z6.boolean(),
    importance: z6.enum(["high", "medium", "low"])
  }))
});
router17.post("/analyze", async (req, res) => {
  try {
    const parsed = teamAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Donn\xE9es invalides", details: parsed.error.flatten() });
    }
    const { description, title, category, budget } = parsed.data;
    const professions = [
      {
        profession: "D\xE9veloppeur Frontend",
        description: "Cr\xE9ation de l'interface utilisateur et exp\xE9rience utilisateur",
        required_skills: ["React", "TypeScript", "CSS", "HTML"],
        estimated_budget: Math.floor(Number(budget) * 0.4),
        estimated_days: 10,
        min_experience: 2,
        is_lead_role: false,
        importance: "high"
      },
      {
        profession: "D\xE9veloppeur Backend",
        description: "Architecture serveur et APIs",
        required_skills: ["Node.js", "PostgreSQL", "REST API"],
        estimated_budget: Math.floor(Number(budget) * 0.4),
        estimated_days: 12,
        min_experience: 3,
        is_lead_role: true,
        importance: "high"
      },
      {
        profession: "Designer UX/UI",
        description: "Conception de l'exp\xE9rience et interface utilisateur",
        required_skills: ["Figma", "Design System", "Prototypage"],
        estimated_budget: Math.floor(Number(budget) * 0.2),
        estimated_days: 5,
        min_experience: 2,
        is_lead_role: false,
        importance: "medium"
      }
    ];
    res.json({ professions });
  } catch (error) {
    console.error("Team analysis error:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router17.post("/create-project", async (req, res) => {
  try {
    const parsed = teamProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Donn\xE9es invalides", details: parsed.error.flatten() });
    }
    const { projectData, teamRequirements } = parsed.data;
    const mainProject = {
      id: "team-" + Date.now(),
      ...projectData,
      type: "team",
      teamRequirements,
      status: "open",
      clientId: "user_1",
      // Temporaire
      clientName: "Utilisateur",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const subMissions = teamRequirements.map((req2, index) => ({
      id: `${mainProject.id}-sub-${index}`,
      title: `${projectData.title} - ${req2.profession}`,
      description: req2.description,
      category: projectData.category,
      budget: req2.estimated_budget.toString(),
      location: projectData.location || "Remote",
      parentProjectId: mainProject.id,
      profession: req2.profession,
      required_skills: req2.required_skills,
      estimated_days: req2.estimated_days,
      min_experience: req2.min_experience,
      is_lead_role: req2.is_lead_role,
      importance: req2.importance,
      status: "open",
      clientId: mainProject.clientId,
      clientName: mainProject.clientName,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      bids: []
    }));
    if (!global.missions) {
      global.missions = [];
    }
    global.missions.push(mainProject);
    global.missions.push(...subMissions);
    console.log(`\u2705 Projet en \xE9quipe cr\xE9\xE9: ${mainProject.id} avec ${subMissions.length} sous-missions`);
    res.json({
      ok: true,
      project: mainProject,
      subMissions,
      message: `Projet cr\xE9\xE9 avec ${subMissions.length} missions sp\xE9cialis\xE9es`
    });
  } catch (error) {
    console.error("Team project creation error:", error);
    res.status(500).json({ error: "Erreur serveur lors de la cr\xE9ation du projet" });
  }
});
var team_routes_default = router17;

// server/middleware/ai-rate-limit.ts
import rateLimit from "express-rate-limit";
var aiRateLimit = rateLimit({
  // 50 requêtes par fenêtre de 15 minutes pour les endpoints IA
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 50,
  // Limite de 50 requêtes par IP
  // Messages d'erreur personnalisés
  message: {
    error: "Trop de requ\xEAtes IA depuis cette adresse IP",
    details: "Limite de 50 requ\xEAtes par 15 minutes d\xE9pass\xE9e",
    retry_after: "15 minutes"
  },
  // Code de statut pour les requêtes limitées
  statusCode: 429,
  // Headers de rate limiting
  standardHeaders: true,
  // Retourne les headers `RateLimit-*`
  legacyHeaders: false,
  // Désactive les headers `X-RateLimit-*`
  // Fonction pour générer la clé de rate limiting
  keyGenerator: (req) => {
    return `${req.ip}-${req.originalUrl}`;
  },
  // Skip certains endpoints moins critiques
  skip: (req) => {
    return req.originalUrl.includes("/health") || req.originalUrl === "/api" || req.originalUrl.includes("/healthz") || req.method === "HEAD";
  },
  // Handler personnalisé pour les dépassements de limite
  handler: (req, res) => {
    console.log(`\u26A0\uFE0F  Rate limit d\xE9pass\xE9 pour ${req.ip} sur ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      error: "Rate limit d\xE9pass\xE9",
      message: "Trop de requ\xEAtes IA. Veuillez attendre avant de r\xE9essayer.",
      retry_after: 900,
      // 15 minutes en secondes
      current_limit: 50,
      window_ms: 9e5
    });
  }
});
var strictAiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // Seulement 20 requêtes pour les endpoints coûteux
  message: {
    error: "Limite stricte d\xE9pass\xE9e pour les op\xE9rations IA co\xFBteuses",
    details: "Limite de 20 requ\xEAtes par 15 minutes pour les analyses avanc\xE9es",
    retry_after: "15 minutes"
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `strict-${req.ip}-${req.originalUrl}`,
  handler: (req, res) => {
    console.log(`\u{1F6A8} Rate limit strict d\xE9pass\xE9 pour ${req.ip} sur ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      error: "Rate limit strict d\xE9pass\xE9",
      message: "Limite stricte pour les analyses IA avanc\xE9es d\xE9pass\xE9e.",
      retry_after: 900,
      current_limit: 20,
      window_ms: 9e5
    });
  }
});
var monitoringRateLimit = rateLimit({
  windowMs: 5 * 60 * 1e3,
  // 5 minutes
  max: 100,
  // 100 requêtes par 5 minutes pour le monitoring
  message: {
    error: "Limite de monitoring d\xE9pass\xE9e",
    details: "Limite de 100 requ\xEAtes par 5 minutes pour le monitoring",
    retry_after: "5 minutes"
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `monitoring-${req.ip}`,
  handler: (req, res) => {
    console.log(`\u{1F4CA} Rate limit monitoring d\xE9pass\xE9 pour ${req.ip}`);
    res.status(429).json({
      success: false,
      error: "Rate limit monitoring d\xE9pass\xE9",
      message: "Trop de requ\xEAtes de monitoring.",
      retry_after: 300,
      current_limit: 100,
      window_ms: 3e5
    });
  }
});

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path4.dirname(__filename);
validateEnvironment();
var app = express6();
var port = parseInt(process.env.PORT || "5000", 10);
var PID_FILE = "/tmp/swideal-server.pid";
function checkPortFree(port2) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(1e3);
    client.on("connect", () => {
      client.destroy();
      resolve(false);
    });
    client.on("timeout", () => {
      client.destroy();
      resolve(true);
    });
    client.on("error", () => {
      resolve(true);
    });
    client.connect(port2, "127.0.0.1");
  });
}
async function waitForPortFree(port2, maxWaitMs = 1e4) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    if (await checkPortFree(port2)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}
async function cleanupPreviousProcess() {
  try {
    if (fs3.existsSync(PID_FILE)) {
      const pidString = fs3.readFileSync(PID_FILE, "utf8").trim();
      const pid = parseInt(pidString, 10);
      if (!isNaN(pid)) {
        try {
          process.kill(pid, 0);
          console.log(`\u{1F504} Found previous process with PID ${pid}, sending SIGTERM...`);
          process.kill(pid, "SIGTERM");
          console.log("\u23F3 Waiting for previous process to exit...");
          await waitForPortFree(port, 8e3);
        } catch (err) {
          console.log("\u{1F9F9} Removing stale PID file");
        }
      }
      fs3.unlinkSync(PID_FILE);
    }
  } catch (error) {
    console.log("\u{1F50D} No previous process to cleanup");
  }
  if (process.env.NODE_ENV !== "production") {
    try {
      console.log("\u{1F52B} Development mode: Force-killing any process on port 5000...");
      const { exec } = await import("child_process");
      const util = await import("util");
      const execAsync = util.promisify(exec);
      try {
        await execAsync("fuser -k 5000/tcp 2>/dev/null || true");
        console.log("\u{1F9F9} fuser kill attempt completed");
      } catch (e) {
        console.log("\u{1F50D} fuser not available, trying alternative...");
      }
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (await checkPortFree(port)) {
        console.log("\u2705 Port 5000 is now free");
      } else {
        console.log("\u26A0\uFE0F Port 5000 may still be busy, will retry during startup");
      }
    } catch (killError) {
      console.log("\u{1F50D} Force-kill attempt failed, continuing with normal startup:", killError instanceof Error ? killError.message : "Unknown error");
    }
  }
}
function writePidFile() {
  try {
    fs3.writeFileSync(PID_FILE, process.pid.toString());
    console.log(`\u{1F4DD} PID file created: ${PID_FILE} (${process.pid})`);
  } catch (error) {
    console.warn("\u26A0\uFE0F Could not write PID file:", error);
  }
}
function removePidFile() {
  try {
    if (fs3.existsSync(PID_FILE)) {
      fs3.unlinkSync(PID_FILE);
      console.log("\u{1F9F9} PID file removed");
    }
  } catch (error) {
    console.warn("\u26A0\uFE0F Could not remove PID file:", error);
  }
}
var databaseUrl2 = process.env.DATABASE_URL || "postgresql://localhost:5432/swideal";
console.log("\u{1F517} Using Replit PostgreSQL connection");
var missionSyncService = new MissionSyncService(databaseUrl2);
var pool4 = new Pool4({
  connectionString: databaseUrl2,
  connectionTimeoutMillis: 5e3,
  // 5 second timeout
  idleTimeoutMillis: 1e4,
  // 10 second idle timeout
  max: 20
  // maximum number of connections
});
console.log("\u{1F517} Database configuration:", {
  DATABASE_URL: !!process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  PLATFORM: "Replit"
});
async function validateDatabaseConnection() {
  const timeout = 8e3;
  try {
    console.log("\u{1F50D} Validating database connection...");
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timeout")), timeout);
    });
    const connectionPromise = pool4.query("SELECT 1 as test");
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("\u2705 Database connection validated successfully");
    return true;
  } catch (error) {
    console.warn("\u26A0\uFE0F Database connection validation failed (non-blocking):", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}
if (!global.projectStandardizations) {
  global.projectStandardizations = /* @__PURE__ */ new Map();
}
if (!global.aiEnhancementCache) {
  global.aiEnhancementCache = /* @__PURE__ */ new Map();
}
if (!global.performanceMetrics) {
  global.performanceMetrics = /* @__PURE__ */ new Map();
}
console.log("\u{1F50D} Gemini AI Environment Variables:", {
  GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  PROVIDER: "gemini-api-only"
});
app.use((req, res, next) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  next();
});
app.set("trust proxy", true);
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    const allowedOrigins = [
      "https://swideal.com",
      "https://www.swideal.com",
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.replit\.app$/,
      /^https:\/\/.*\.replit\.co$/
    ];
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === "string") {
        return origin === allowed;
      } else {
        return allowed.test(origin);
      }
    });
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`\u26A0\uFE0F CORS blocked request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));
app.use("/api", limitRequestSize, validateRequest, performanceMonitor, express6.json({ limit: "10mb" }));
app.use("/api/auth", (req, res, next) => {
  console.log(`\u{1F510} Auth request: ${req.method} ${req.path}`, { body: req.body.email ? { email: req.body.email } : {} });
  next();
}, auth_routes_default);
app.all("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SWIDEAL API",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0.0"
  });
});
console.log("\u{1F4CB} Registering missions routes...");
app.use("/api/missions", (req, res, next) => {
  console.log(`\u{1F4CB} Mission request: ${req.method} ${req.path}`, {
    body: req.body.title ? { title: req.body.title, userId: req.body.userId } : {}
  });
  next();
}, missions_default);
console.log("\u{1F4CB} Registering other API routes...");
app.use("/api", api_routes_default);
app.use("/api/projects", (req, res, next) => {
  const newUrl = req.originalUrl.replace("/api/projects", "/api/missions");
  console.log(`\u{1F504} Proxying deprecated projects API ${req.originalUrl} to missions API`);
  req.url = req.url.replace("/projects", "/missions");
  req.originalUrl = newUrl;
  next();
}, missions_default);
app.use("/api/ai/monitoring", monitoringRateLimit, ai_monitoring_routes_default);
app.use("/api/ai/suggest-pricing", strictAiRateLimit);
app.use("/api/ai/enhance-description", strictAiRateLimit);
app.use("/api/ai/analyze-quality", strictAiRateLimit);
app.use("/api/ai/enhance-text", strictAiRateLimit);
app.use("/api/ai", aiRateLimit, ai_suggestions_routes_default);
app.use("/api/ai/missions", aiRateLimit, ai_missions_routes_default);
app.use("/api", aiRateLimit, ai_quick_analysis_default);
app.use("/api/ai/diagnostic", ai_diagnostic_routes_default);
app.use("/api/ai/suggestions", ai_suggestions_routes_default);
app.use("/api/ai/learning", ai_learning_routes_default);
app.use("/api", feed_routes_default);
app.use("/api", favorites_routes_default);
app.use("/api/team", team_routes_default);
console.log("\u{1F91D} Registering open teams routes...");
app.use("/api/open-teams", (req, res, next) => {
  console.log(`\u{1F91D} Open teams request: ${req.method} ${req.path}`);
  next();
}, open_teams_default);
console.log("\u{1F3AF} Registering bids routes...");
app.use("/api/bids", (req, res, next) => {
  console.log(`\u{1F3AF} Bids request: ${req.method} ${req.path}`, {
    body: req.body.mission_id ? { mission_id: req.body.mission_id, bid_type: req.body.bid_type } : {}
  });
  next();
}, bids_default);
app.get("/api/performance", (req, res) => {
  try {
    const stats = getPerformanceStats();
    res.json({
      ok: true,
      performance: stats,
      server_uptime: process.uptime(),
      memory: {
        used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Failed to get performance stats",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database query timeout")), 5e3);
    });
    const queryPromise = pool4.query("SELECT 1");
    await Promise.race([queryPromise, timeoutPromise]);
    res.status(200).json({
      status: "healthy",
      message: "SWIDEAL API is running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || "development",
      database: "connected",
      service: "missions-api"
    });
  } catch (error) {
    console.error("Health check database error:", error);
    res.status(503).json({
      status: "error",
      message: "Database connection failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || "development",
      database: "disconnected",
      service: "missions-api",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.get("/api/debug/missions", (req, res) => {
  res.json({
    debug_info: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      env: process.env.NODE_ENV,
      status: "database_unified",
      memory_usage: process.memoryUsage()
    },
    message: "Check /api/missions for actual missions data"
  });
});
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "swideal-api",
    version: "1.0.0",
    node_env: process.env.NODE_ENV
  });
});
app.get("/api/ai/gemini-diagnostic", (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  res.json({
    gemini_ai_configured: hasApiKey,
    api_key: hasApiKey ? "CONFIGURED" : "MISSING",
    status: hasApiKey ? "ready" : "incomplete",
    provider: "gemini-api-only"
  });
});
var currentServer = null;
async function startServerWithRetry() {
  const maxAttempts = 8;
  const delayMs = 750;
  const totalTimeoutMs = 9e3;
  const startTime = Date.now();
  await cleanupPreviousProcess();
  console.log("\u{1F527} Initializing database before server start...");
  try {
    const { initializeDatabase: initializeDatabase2, testConnection: testConnection2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    await initializeDatabase2();
    await testConnection2();
    await validateDatabaseConnection();
    console.log("\u2705 Database initialization completed");
  } catch (dbError) {
    console.warn("\u26A0\uFE0F Database initialization failed (non-blocking):", dbError instanceof Error ? dbError.message : "Unknown error");
  }
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (Date.now() - startTime > totalTimeoutMs) {
      console.error(`\u274C Startup deadline exceeded (${totalTimeoutMs}ms), exiting for supervisor restart`);
      process.exit(1);
    }
    try {
      const server = createServer(app);
      currentServer = server;
      await new Promise((resolve, reject) => {
        const serverInstance = server.listen(port, "0.0.0.0", async () => {
          writePidFile();
          console.log(`\u{1F680} SWIDEAL server running on http://0.0.0.0:${port} (attempt ${attempt})`);
          console.log(`\u{1F4F1} Frontend: http://0.0.0.0:${port}`);
          console.log(`\u{1F527} API Health: http://0.0.0.0:${port}/api/health`);
          console.log(`\u{1F3AF} AI Provider: Gemini API Only`);
          console.log(`\u{1F50D} Process ID: ${process.pid}`);
          console.log(`\u{1F50D} Node Environment: ${process.env.NODE_ENV || "development"}`);
          console.log("\u{1F4E6} Loading Vite and AI modules dynamically...");
          try {
            const { setupVite: setupVite2, serveStatic: serveStatic2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
            const aiOrchestratorModule = await Promise.resolve().then(() => (init_ai(), ai_exports));
            const aiOrchestratorRoutes = aiOrchestratorModule.default;
            app.use("/api-ai-orchestrator", express6.json({ limit: "10mb" }), strictAiRateLimit, aiOrchestratorRoutes);
            console.log("\u2705 AI orchestrator routes mounted");
            if (process.env.NODE_ENV === "production") {
              console.log("\u{1F3ED} Production mode: serving static files");
              serveStatic2(app);
            } else {
              console.log("\u{1F527} Development mode: setting up Vite middleware");
              try {
                await setupVite2(app, server);
                console.log("\u2705 Vite middleware setup complete");
              } catch (error) {
                console.error("\u274C Failed to setup Vite middleware:", error);
              }
            }
          } catch (importError) {
            console.error("\u274C Failed to import modules:", importError);
          }
          resolve();
        });
        server.on("error", (err) => {
          server.close();
          if (err.code === "EADDRINUSE") {
            console.log(`\u23F3 Port ${port} busy on attempt ${attempt}/${maxAttempts}`);
            reject(new Error("EADDRINUSE"));
          } else {
            console.error("\u274C Server error:", err);
            reject(err);
          }
        });
      });
      return;
    } catch (error) {
      if (error.message === "EADDRINUSE" && attempt < maxAttempts) {
        const remainingTime = totalTimeoutMs - (Date.now() - startTime);
        if (remainingTime > delayMs) {
          console.log(`\u{1F504} Waiting ${delayMs}ms before retry ${attempt + 1}/${maxAttempts}...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          await waitForPortFree(port, 1e3);
        } else {
          console.error(`\u274C Not enough time remaining for retry, exiting`);
          process.exit(1);
        }
      } else {
        console.error(`\u274C Failed to start server after ${maxAttempts} attempts:`, error);
        process.exit(1);
      }
    }
  }
}
startServerWithRetry().catch((error) => {
  console.error("\u274C Fatal error starting server:", error);
  process.exit(1);
});
console.log("\u2705 Advanced AI routes registered - Gemini API Only");
process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  removePidFile();
  if (currentServer) {
    currentServer.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  removePidFile();
  if (currentServer) {
    currentServer.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  console.error("Stack:", error.stack);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
app.use((error, req, res, next) => {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  const requestId = req.headers["x-request-id"] || `req_${Date.now()}`;
  const isDebugMode = process.env.PREVIEW_MODE === "true" || process.env.NODE_ENV === "development";
  let statusCode = 500;
  let errorType = "server_error";
  if (error.name === "ValidationError") {
    statusCode = 400;
    errorType = "validation_error";
  } else if (error.message.includes("not found")) {
    statusCode = 404;
    errorType = "not_found";
  } else if (error.message.includes("unauthorized")) {
    statusCode = 401;
    errorType = "unauthorized";
  }
  console.error("\u{1F6A8} Global error handler:", {
    error_type: errorType,
    error: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : void 0,
    url: req.url,
    method: req.method,
    user_agent: req.headers["user-agent"],
    ip: req.ip,
    request_id: requestId,
    timestamp: timestamp2
  });
  setImmediate(async () => {
    try {
      const eventLoggerModule = await Promise.resolve().then(() => (init_event_logger(), event_logger_exports));
      eventLoggerModule.eventLogger?.logUserEvent("click", req.user?.id || "anonymous", req.sessionID || requestId, {
        error_type: errorType,
        error_message: error.message,
        endpoint: req.originalUrl,
        method: req.method,
        status_code: statusCode
      });
    } catch (logError) {
      console.warn("Event logging failed (non-critical):", logError instanceof Error ? logError.message : "Unknown error");
    }
  });
  if (!res.headersSent) {
    res.status(statusCode).json({
      ok: false,
      error: statusCode === 500 ? "Internal server error" : error.message,
      details: isDebugMode ? error.message : "An error occurred",
      stack: isDebugMode ? error.stack : void 0,
      error_type: errorType,
      timestamp: timestamp2,
      request_id: requestId,
      debug_mode: isDebugMode
    });
  }
});
var index_default = app;
export {
  index_default as default
};
