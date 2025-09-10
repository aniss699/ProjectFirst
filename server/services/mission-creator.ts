
export interface SimpleMissionInput {
  title: string;
  description: string;
  category?: string;
  budget?: number;
  location?: string;
  userId: number;
}

export class MissionCreator {
  static async createSimpleMission(input: SimpleMissionInput) {
    const {
      title,
      description,
      category = 'developpement',
      budget = 1000,
      location = 'Remote',
      userId
    } = input;

    // Validation des données minimales
    if (!title || title.trim().length < 3) {
      throw new Error('Le titre doit contenir au moins 3 caractères');
    }

    if (!description || description.trim().length < 10) {
      throw new Error('La description doit contenir au moins 10 caractères');
    }

    if (!userId || userId <= 0) {
      throw new Error('Utilisateur invalide');
    }

    // Données par défaut intelligentes
    const missionData = {
      title: title.trim(),
      description: description.trim(),
      category,
      budget_value_cents: budget * 100, // Conversion en centimes
      currency: 'EUR',
      location,
      user_id: userId,
      client_id: userId,
      status: 'published' as const,
      urgency: 'medium' as const,
      remote_allowed: true,
      is_team_mission: false,
      team_size: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    return missionData;
  }

  static async saveMission(missionData: any) {
    try {
      const result = await db.insert(missions).values(missionData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Échec de la sauvegarde en base de données');
      }

      return result[0];
    } catch (error) {
      console.error('❌ Erreur sauvegarde mission:', error);
      throw new Error(`Erreur de sauvegarde: ${error.message}`);
    }
  }
}
