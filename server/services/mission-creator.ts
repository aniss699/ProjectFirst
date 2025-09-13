import { db } from '../database.js';
import { missions } from '../../shared/schema.js';

export interface MissionInput {
  title: string;
  description: string;
  category?: string;
  budget?: number;
  location?: string;
  userId: number;
}

export class MissionCreator {
  static async createMission(missionData: any) {
    console.log('💾 Sauvegarde mission:', missionData);

    try {
      const [savedMission] = await db.insert(missions).values(missionData).returning();
      console.log('✅ Mission sauvegardée avec succès:', savedMission.id);
      return savedMission;
    } catch (error) {
      console.error('❌ Erreur sauvegarde mission:', error);
      throw new Error('Erreur lors de la sauvegarde de la mission');
    }
  }
}