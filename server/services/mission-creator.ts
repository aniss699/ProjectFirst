

import { db } from '../database.js';
import { missions } from '../../shared/schema.js';

export interface SimpleMissionInput {
  title: string;
  description: string;
  category?: string;
  budget?: number;
  location?: string;
  userId: number;
  isTeamMode?: boolean;
  requirements?: string;
}

export class MissionCreator {
  static async createSimpleMission(input: SimpleMissionInput) {
    const {
      title,
      description,
      category = 'developpement',
      budget = 1000,
      location = 'Remote',
      userId,
      isTeamMode = false,
      requirements
    } = input;

    // Validation centralisée avec messages clairs
    this.validateInput(input);

    // Données par défaut intelligentes
    const missionData = {
      title: title.trim(),
      description: description.trim() + (requirements ? `\n\nExigences: ${requirements}` : ''),
      category,
      budget_value_cents: Math.max(budget * 100, 1000), // Minimum 10€
      currency: 'EUR',
      location_raw: location === 'Remote' ? null : location,
      postal_code: /^\d{5}$/.test(location) ? location : null,
      country: 'France',
      remote_allowed: location === 'Remote' || !location,
      user_id: userId,
      client_id: userId,
      status: 'published' as const,
      urgency: 'medium' as const,
      is_team_mission: isTeamMode,
      team_size: isTeamMode ? 3 : 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    return missionData;
  }

  static validateInput(input: SimpleMissionInput): void {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length < 3) {
      errors.push('Le titre doit contenir au moins 3 caractères');
    }
    if (input.title && input.title.length > 200) {
      errors.push('Le titre ne peut pas dépasser 200 caractères');
    }

    if (!input.description || input.description.trim().length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    }
    if (input.description && input.description.length > 2000) {
      errors.push('La description ne peut pas dépasser 2000 caractères');
    }

    if (!input.userId || input.userId <= 0) {
      errors.push('Utilisateur invalide');
    }

    if (input.budget && input.budget < 10) {
      errors.push('Le budget minimum est de 10€');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  static async saveMission(missionData: any) {
    try {
      const result = await db.insert(missions).values(missionData).returning({
        id: missions.id,
        title: missions.title,
        created_at: missions.created_at
      });
      
      if (!result || result.length === 0) {
        throw new Error('Échec de la sauvegarde en base de données');
      }

      return result[0];
    } catch (error) {
      console.error('❌ Erreur sauvegarde mission:', error);
      throw new Error(`Erreur de sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // Méthode utilitaire pour créer et sauvegarder en une fois
  static async createAndSave(input: SimpleMissionInput) {
    const missionData = await this.createSimpleMission(input);
    return await this.saveMission(missionData);
  }
}

