
import { pgTable, serial, varchar, text, integer, boolean, timestamp, real, json } from 'drizzle-orm/pg-core';

// ============================================
// SCHÉMA MISSIONS SUPPRIMÉ
// ============================================
// La table missions a été complètement supprimée du système

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('CLIENT').notNull(),
  rating_mean: real('rating_mean'),
  rating_count: integer('rating_count'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Projects table (remplace missions)
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  budget: integer('budget').notNull(),
  currency: varchar('currency', { length: 10 }).default('EUR').notNull(),
  location: varchar('location', { length: 255 }),
  user_id: integer('user_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Bids table (pour les projets)
export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id').references(() => projects.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Feed announcements
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  budget_min: integer('budget_min'),
  budget_max: integer('budget_max'),
  location: varchar('location', { length: 255 }),
  tags: json('tags'),
  user_id: integer('user_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  priority: integer('priority').default(0),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// User favorites
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  announcement_id: integer('announcement_id').references(() => announcements.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
