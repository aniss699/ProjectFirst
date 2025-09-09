
import { TeamAnalysisRequest, TeamAnalysisResponse, ProfessionRequirement } from '../types/mission.js';

export class TeamAnalysisService {
  
  async analyzeTeamRequirements(request: TeamAnalysisRequest): Promise<TeamAnalysisResponse> {
    const { description, title, category, budget } = request;
    
    // Analyse AI pour détecter les professions nécessaires
    const professions = await this.detectRequiredProfessions(description, category);
    
    // Calcul des budgets et délais
    const budgetNumber = parseFloat(budget?.replace(/[^0-9.-]/g, '') || '0');
    const distributedBudget = this.distributeBudget(professions, budgetNumber);
    
    return {
      professions: distributedBudget,
      totalEstimatedBudget: budgetNumber,
      totalEstimatedDays: Math.max(...distributedBudget.map(p => p.estimated_days)),
      complexity: this.calculateComplexity(professions),
      coordination_needs: this.identifyCoordinationNeeds(professions)
    };
  }

  private async detectRequiredProfessions(description: string, category?: string): Promise<ProfessionRequirement[]> {
    const desc = description.toLowerCase();
    const professions: ProfessionRequirement[] = [];

    // Règles de détection basées sur des mots-clés
    const professionRules = {
      'développeur_web': {
        keywords: ['site web', 'application web', 'frontend', 'backend', 'api'],
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
        base_days: 15,
        base_budget_ratio: 0.4
      },
      'designer_ui_ux': {
        keywords: ['design', 'interface', 'ux', 'ui', 'maquette', 'wireframe'],
        skills: ['Figma', 'Adobe XD', 'UI/UX', 'Design thinking'],
        base_days: 10,
        base_budget_ratio: 0.25
      },
      'développeur_mobile': {
        keywords: ['application mobile', 'app mobile', 'ios', 'android', 'react native'],
        skills: ['React Native', 'Flutter', 'iOS', 'Android'],
        base_days: 20,
        base_budget_ratio: 0.45
      },
      'chef_de_projet': {
        keywords: ['gestion de projet', 'coordination', 'planning', 'équipe'],
        skills: ['Gestion de projet', 'Agile', 'Scrum'],
        base_days: 5,
        base_budget_ratio: 0.15
      },
      'développeur_backend': {
        keywords: ['api', 'base de données', 'serveur', 'backend'],
        skills: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB'],
        base_days: 12,
        base_budget_ratio: 0.35
      },
      'testeur_qa': {
        keywords: ['test', 'qualité', 'qa', 'validation'],
        skills: ['Tests automatisés', 'Selenium', 'Jest'],
        base_days: 8,
        base_budget_ratio: 0.2
      }
    };

    for (const [professionKey, rule] of Object.entries(professionRules)) {
      if (rule.keywords.some(keyword => desc.includes(keyword))) {
        const profession = professionKey.replace('_', ' ').toUpperCase();
        
        professions.push({
          profession,
          description: `Responsable ${profession.toLowerCase()}`,
          required_skills: rule.skills,
          estimated_budget: 0, // Sera calculé dans distributeBudget
          estimated_days: rule.base_days,
          min_experience: this.getMinExperience(rule.keywords, desc),
          is_lead_role: profession.includes('CHEF') || profession.includes('LEAD'),
          importance: this.getImportance(rule.keywords, desc)
        });
      }
    }

    // Si aucune profession détectée, ajouter un développeur générique
    if (professions.length === 0) {
      professions.push({
        profession: 'Développeur général',
        description: 'Développement général du projet',
        required_skills: ['Développement', 'Problem solving'],
        estimated_budget: 0,
        estimated_days: 15,
        min_experience: 2,
        is_lead_role: true,
        importance: 'high'
      });
    }

    return professions;
  }

  private distributeBudget(professions: ProfessionRequirement[], totalBudget: number): ProfessionRequirement[] {
    const totalRatio = professions.reduce((sum, prof) => {
      return sum + this.getBudgetRatio(prof.profession);
    }, 0);

    return professions.map(prof => ({
      ...prof,
      estimated_budget: Math.round((totalBudget * this.getBudgetRatio(prof.profession)) / totalRatio)
    }));
  }

  private getBudgetRatio(profession: string): number {
    const ratios: { [key: string]: number } = {
      'DÉVELOPPEUR WEB': 0.4,
      'DESIGNER UI UX': 0.25,
      'DÉVELOPPEUR MOBILE': 0.45,
      'CHEF DE PROJET': 0.15,
      'DÉVELOPPEUR BACKEND': 0.35,
      'TESTEUR QA': 0.2,
      'Développeur général': 0.5
    };
    return ratios[profession] || 0.3;
  }

  private getMinExperience(keywords: string[], description: string): number {
    if (description.includes('senior') || description.includes('expert')) return 5;
    if (description.includes('junior') || description.includes('débutant')) return 1;
    return 2;
  }

  private getImportance(keywords: string[], description: string): 'high' | 'medium' | 'low' {
    if (keywords.some(k => description.includes(k + ' principal')) || description.includes('critique')) return 'high';
    if (description.includes('secondaire') || description.includes('optionnel')) return 'low';
    return 'medium';
  }

  private calculateComplexity(professions: ProfessionRequirement[]): number {
    const baseComplexity = professions.length * 2;
    const skillComplexity = professions.reduce((sum, prof) => sum + prof.required_skills.length, 0);
    return Math.min(10, Math.round((baseComplexity + skillComplexity) / 2));
  }

  private identifyCoordinationNeeds(professions: ProfessionRequirement[]): string[] {
    const needs = [];
    
    if (professions.length > 2) {
      needs.push('Coordination entre équipes multiples');
    }
    
    if (professions.some(p => p.profession.includes('MOBILE')) && professions.some(p => p.profession.includes('WEB'))) {
      needs.push('Synchronisation mobile-web');
    }
    
    if (professions.some(p => p.profession.includes('BACKEND')) && professions.some(p => p.profession.includes('FRONTEND'))) {
      needs.push('Intégration API frontend-backend');
    }
    
    return needs;
  }
}
