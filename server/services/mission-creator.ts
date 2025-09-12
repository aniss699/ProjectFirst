import { db } from '../database.js';
import { missions } from '../../shared/schema.js';

export interface SimpleMissionInput {
  title: string;
  description: string;
  category?: string;
  budget?: number;
  location?: string;
  userId: number;
}

export class MissionCreator {
  static async createSimpleMission(input: {
    title: string;
    description: string;
    budget?: number;
    isTeamMode: boolean;
    userId: number;
    category?: string;
    location?: string;
  }) {
    console.log('🎯 Création mission simplifiée avec:', input);

    // Valeurs par défaut intelligentes basées sur l'analyse du titre/description
    const smartDefaults = await this.generateSmartDefaults(input);
    console.log('🧠 Valeurs par défaut générées:', smartDefaults);

    return {
      title: input.title,
      description: input.description,
      category: input.category || smartDefaults.category,
      location_raw: input.location || smartDefaults.location,
      urgency: 'medium',
      status: 'published',
      remote_allowed: true,
      quality_target: 'standard',
      currency: 'EUR',
      budget_value_cents: (input.budget || smartDefaults.budget) * 100,
      user_id: input.userId,
      client_id: input.userId,
      is_team_mission: input.isTeamMode,
      team_size: input.isTeamMode ? 2 : 1,
      tags: smartDefaults.tags || [],
      skills_required: smartDefaults.skills || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async generateSmartDefaults(input: { title: string; description: string; budget?: number }) {
    console.log('🔍 Génération valeurs par défaut pour:', input.title);

    // Analyse simple du titre et description pour détecter la catégorie
    const titleLower = input.title.toLowerCase();
    const descriptionLower = input.description.toLowerCase();
    const text = (titleLower + ' ' + descriptionLower).toLowerCase();

    let category = 'developpement';
    let location = 'Remote';
    let budget = input.budget || 2000;
    let tags = [];
    let skills = [];

    // Détection de catégorie basique
    if (text.includes('web') || text.includes('site') || text.includes('react') || text.includes('javascript')) {
      category = 'web-development';
      budget = input.budget || 3000;
      tags = ['web', 'frontend'];
      skills = ['JavaScript', 'HTML', 'CSS'];
    } else if (text.includes('mobile') || text.includes('app') || text.includes('android') || text.includes('ios')) {
      category = 'mobile-development';
      budget = input.budget || 5000;
      tags = ['mobile', 'app'];
      skills = ['React Native', 'Mobile Development'];
    } else if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('graphique')) {
      category = 'design';
      budget = input.budget || 1500;
      tags = ['design', 'ui/ux'];
      skills = ['Figma', 'Design'];
    } else if (text.includes('data') || text.includes('analyse') || text.includes('machine learning') || text.includes('ai')) {
      category = 'data-science';
      budget = input.budget || 4000;
      tags = ['data', 'analytics'];
      skills = ['Python', 'Data Analysis'];
    }

    // Détection de localisation
    if (text.includes('paris') || text.includes('france') || text.includes('sur place') || text.includes('présentiel')) {
      location = 'Paris, France';
    }

    console.log('✨ Valeurs par défaut générées:', { category, location, budget, tags, skills });

    return { category, location, budget, tags, skills };
  }

  static async saveMission(missionData: any) {
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

  static async createMission(missionData: any) {
  }
}