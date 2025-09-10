
import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

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

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
