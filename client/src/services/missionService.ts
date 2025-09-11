
interface MissionCreateInput {
  title: string;
  description: string;
  category: string;
  budget?: string | number;
  location?: string;
  isTeamMode?: boolean;
  requirements?: string;
  urgency?: 'low' | 'medium' | 'high';
  timeline?: string;
  needsLocation?: boolean;
}

interface MissionResponse {
  ok: boolean;
  id?: string;
  error?: string;
  mission?: any;
}

interface TeamResponse {
  ok: boolean;
  id?: string;
  teamRequirements?: any[];
  error?: string;
}

interface FormattedMissionData {
  title: string;
  description: string;
  category: string;
  budget: number;
  location?: string;
  userId: number;
  urgency: string;
  requirements?: string;
  isTeamMode: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class MissionService {
  static async createMission(data: MissionCreateInput): Promise<MissionResponse> {
    try {
      // Valider les données
      const validation = this.validateInput(data);
      if (!validation.isValid) {
        return {
          ok: false,
          error: validation.errors.join(', ')
        };
      }

      // Formater les données
      const formattedData = this.formatMissionData(data);
      
      console.log('🚀 MissionService: Creating mission with data:', formattedData);

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const mission = await response.json();
      
      return {
        ok: true,
        id: mission.id?.toString(),
        mission
      };
    } catch (error) {
      console.error('❌ MissionService: Error creating mission:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  static async createTeamProject(data: MissionCreateInput): Promise<TeamResponse> {
    try {
      const teamData = {
        ...data,
        isTeamMode: true,
        team: {
          isTeamMission: true,
          teamSize: data.timeline ? parseInt(data.timeline) || 3 : 3
        }
      };

      const result = await this.createMission(teamData);
      
      return {
        ok: result.ok,
        id: result.id,
        error: result.error,
        teamRequirements: result.mission?.teamRequirements || []
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Erreur création équipe'
      };
    }
  }

  static formatMissionData(input: MissionCreateInput): FormattedMissionData {
    // Conversion budget avec validation
    let budgetValue = 1000; // Valeur par défaut
    
    if (input.budget) {
      if (typeof input.budget === 'string') {
        const parsed = parseFloat(input.budget.replace(/[^\d.]/g, ''));
        budgetValue = isNaN(parsed) ? 1000 : Math.max(parsed, 10);
      } else {
        budgetValue = Math.max(input.budget, 10);
      }
    }

    return {
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category || 'developpement',
      budget: budgetValue,
      location: input.location?.trim() || 'Remote',
      userId: (input as any).userId || 1, // Sera fourni par le hook
      urgency: input.urgency || 'medium',
      requirements: input.requirements?.trim() || undefined,
      isTeamMode: input.isTeamMode || false,
      postal_code: input.needsLocation && input.location?.length === 5 ? input.location : undefined
    };
  }

  static validateInput(data: MissionCreateInput): ValidationResult {
    const errors: string[] = [];

    // Validation titre
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Le titre doit contenir au moins 3 caractères');
    }
    if (data.title && data.title.length > 500) {
      errors.push('Le titre ne peut pas dépasser 500 caractères');
    }

    // Validation description
    if (!data.description || data.description.trim().length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    }
    if (data.description && data.description.length > 5000) {
      errors.push('La description ne peut pas dépasser 5000 caractères');
    }

    // Validation catégorie
    if (!data.category) {
      errors.push('La catégorie est requise');
    }

    // Validation budget
    if (data.budget) {
      const budgetNum = typeof data.budget === 'string' 
        ? parseFloat(data.budget.replace(/[^\d.]/g, ''))
        : data.budget;
      
      if (isNaN(budgetNum) || budgetNum < 10) {
        errors.push('Le budget minimum est de 10€');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Méthodes utilitaires
  static async getMissions(): Promise<any[]> {
    try {
      const response = await fetch('/api/missions');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching missions:', error);
      return [];
    }
  }

  static async getMission(id: string): Promise<any | null> {
    try {
      const response = await fetch(`/api/missions/${id}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`❌ Error fetching mission ${id}:`, error);
      return null;
    }
  }

  // Méthode de test pour vérifier le bon fonctionnement
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/missions/health');
      return response.ok;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

export { MissionService, type MissionCreateInput, type MissionResponse, type TeamResponse };
