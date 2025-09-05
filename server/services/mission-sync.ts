import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import { announcements } from '../../shared/schema.js';
import { Mission } from '../types/mission.js';

export class MissionSyncService {
  private db: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string) {
    const connection = neon(databaseUrl);
    this.db = drizzle(connection);
  }

  async syncMissionsToFeed(missions: Mission[]): Promise<void> {
    try {
      console.log('🔄 Synchronisation des missions vers le feed...');
      
      for (const mission of missions) {
        // Vérifier si la mission existe déjà dans announcements
        const existing = await this.db
          .select()
          .from(announcements)
          .where(sql`title = ${mission.title} AND description = ${mission.description}`)
          .limit(1);
        
        if (existing.length === 0) {
          const budgetValue = parseFloat(mission.budget.toString().replace(/[^0-9.-]/g, '')) || 0;
          await this.db.insert(announcements).values({
            title: mission.title,
            description: mission.description,
            category: mission.category.toLowerCase(),
            city: mission.location || null,
            budget_min: budgetValue.toString(),
            budget_max: budgetValue.toString(),
            user_id: 1,
            status: mission.status === 'open' ? 'active' : 'inactive',
            quality_score: '0.8',
            created_at: new Date(mission.createdAt)
          });
          console.log(`✅ Mission "${mission.title}" ajoutée au feed`);
        }
      }
      
      console.log('✅ Synchronisation terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }

  async addMissionToFeed(mission: Mission): Promise<void> {
    try {
      const budgetValue = parseFloat(mission.budget.toString().replace(/[^0-9.-]/g, '')) || 0;
      await this.db.insert(announcements).values({
        title: mission.title,
        description: mission.description,
        category: mission.category.toLowerCase(),
        city: mission.location || null,
        budget_min: budgetValue.toString(),
        budget_max: budgetValue.toString(),
        user_id: 1, // TODO: utiliser le vrai user_id depuis l'auth
        status: 'active',
        quality_score: '0.8' // Score par défaut
      });
    } catch (error) {
      console.error('Erreur ajout mission au feed:', error);
      throw error;
    }
  }
}