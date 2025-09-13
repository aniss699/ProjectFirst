import { missions } from '../../shared/schema.js';

// Types dérivés du schéma
export type MissionRow = typeof missions.$inferSelect;

// Interface pour les données de localisation dans le JSONB
export interface LocationData {
  raw?: string;
  address?: string; 
  city?: string;
  country?: string;
  remote_allowed?: boolean;
}

// DTO pour le format attendu par le frontend
export interface MissionDTO {
  id: number;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  budget: string; // Format string pour le frontend
  budget_value_cents: number;
  currency: string;
  location: string; // String simple pour le frontend
  postal_code?: string | null;
  city?: string | null;
  country?: string;
  remote_allowed: boolean;
  user_id: number;
  client_id: number | null;
  status: string;
  urgency: string;
  is_team_mission: boolean;
  team_size: number;
  created_at: Date | null;
  updated_at: Date | null;
  createdAt: string; // Format ISO string pour le frontend
  updatedAt?: string;
  clientName?: string;
  bids?: any[];
}

// Helper pour extraire les données de localisation du JSONB
export function extractLocationData(locationData: unknown): LocationData {
  if (!locationData || typeof locationData !== 'object') {
    return {
      raw: 'Remote',
      remote_allowed: true,
      country: 'France'
    };
  }
  return locationData as LocationData;
}

// Helper pour générer un excerpt
export function generateExcerpt(description: string, maxLength: number = 200): string {
  if (!description || description.length <= maxLength) {
    return description || '';
  }
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }
  return truncated.trim() + '...';
}

// Fonction principale de mapping Row → DTO
export function mapMission(row: MissionRow): MissionDTO {
  const locationData = extractLocationData(row.location_data);
  
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    excerpt: generateExcerpt(row.description, 200),
    category: row.category,
    budget: (row.budget_value_cents / 100).toString(), // Convertir centimes en euros
    budget_value_cents: row.budget_value_cents,
    currency: row.currency || 'EUR',
    location: locationData.raw || locationData.city || 'Remote',
    postal_code: locationData.address || null,
    city: locationData.city || null,
    country: locationData.country || 'France',
    remote_allowed: locationData.remote_allowed ?? true,
    user_id: row.user_id,
    client_id: row.client_id,
    status: row.status || 'draft',
    urgency: row.urgency || 'medium',
    is_team_mission: row.is_team_mission || false,
    team_size: row.team_size || 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
    createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    updatedAt: row.updated_at?.toISOString(),
    clientName: 'Client', // TODO: récupérer le vrai nom client
    bids: [] // TODO: récupérer les vraies offres
  };
}