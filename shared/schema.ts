
import { pgTable, serial, varchar, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

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

export type AiEvent = typeof aiEvents.$inferSelect;
export type NewAiEvent = typeof aiEvents.$inferInsert;
