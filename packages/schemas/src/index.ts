
import { z } from 'zod';

// Schémas utilisateurs
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['CLIENT', 'PRO', 'PERSON', 'ADMIN']),
  rating_mean: z.number().min(0).max(5),
  rating_count: z.number().min(0),
  created_at: z.date(),
});

// Schémas projets
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  category: z.string(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  timeline_days: z.number().positive().optional(),
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']),
  loc_score: z.number().min(0).max(1).optional(),
});

// Schémas sourcing
export const SourcedProviderSchema = z.object({
  company_name: z.string().min(1),
  website_url: z.string().url().optional(),
  contact_email: z.string().email().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  specialties: z.array(z.string()),
  location: z.string().optional(),
  source_type: z.enum(['rss', 'sitemap', 'crawler', 'api']),
  confidence_score: z.number().min(0).max(1),
  status: z.enum(['pending', 'verified', 'contacted', 'converted', 'rejected']),
});

export type User = z.infer<typeof UserSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type SourcedProvider = z.infer<typeof SourcedProviderSchema>;
