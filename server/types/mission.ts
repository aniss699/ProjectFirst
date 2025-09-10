// Mission and AI Analysis Types
export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  location?: string;
  clientId: string; // clientId = user.id du client
  clientName: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  createdAt: string;
  bids: Bid[];
  updatedAt?: string;
  isTeamMode?: boolean;
  teamRequirements?: TeamRequirement[];
}

export interface TeamRequirement {
  id: string;
  missionId: string;
  profession: string;
  description: string;
  requiredSkills: string[];
  estimatedBudget?: number;
  estimatedDays?: number;
  minExperience?: number;
  isLeadRole: boolean;
  bids: Bid[];
  createdAt: string;
}

export interface TeamAnalysisRequest {
  description: string;
  title?: string;
  category?: string;
  budget?: string;
}

export interface TeamAnalysisResponse {
  professions: ProfessionRequirement[];
  totalEstimatedBudget: number;
  totalEstimatedDays: number;
  complexity: number;
  coordination_needs: string[];
}

export interface ProfessionRequirement {
  profession: string;
  description: string;
  required_skills: string[];
  estimated_budget: number;
  estimated_days: number;
  min_experience: number;
  is_lead_role: boolean;
  importance: 'high' | 'medium' | 'low';
}

export interface Bid {
  id: string;
  missionId: string;
  providerId: string; // providerId = user.id du prestataire
  amount: number;
  message: string;
  createdAt: string;
}

export interface SkillPricing {
  keywords: string[];
  basePrice: number;
  complexity: number;
}

export interface SkillPricingMap {
  [key: string]: SkillPricing;
}

export interface DemandFactorsMap {
  [key: string]: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface AIAnalysisRequest {
  description: string;
  title?: string;
  category?: string;
}

export interface AIAnalysisResponse {
  qualityScore: number;
  brief_quality_score: number;
  detectedSkills: string[];
  estimatedComplexity: number;
  price_suggested_med: number;
  price_range_min: number;
  price_range_max: number;
  delay_suggested_days: number;
  optimizedDescription: string | null;
  improvements: string[];
  market_insights: MarketInsights;
}

export interface MarketInsights {
  estimated_providers_interested: number;
  competition_level: 'faible' | 'moyenne' | 'forte';
  demand_level: 'faible' | 'moyenne' | 'forte';
  category_detected: string;
  urgency_detected: boolean;
  suggested_budget_range: PriceRange;
}

export interface CategoryMarketData {
  avgBudget: number;
  priceRange: [number, number];
  avgDuration: number;
  availableProviders: number;
  competitionLevel: string;
  seasonalMultiplier: number;
  urgencyPremium: number;
  skills: string[];
  demandTrend: string;
  clientSatisfactionRate: number;
}

export interface CategoryMarketDataMap {
  [category: string]: CategoryMarketData;
}

export interface MissionStandardization {
  id: string;
  missionId: string;
  title_std: string;
  summary_std: string;
  acceptance_criteria: string[];
  tasks_std: any[];
  deliverables_std: any[];
  skills_std: string[];
  constraints_std: string[];
  price_suggested_min?: number;
  price_suggested_med?: number;
  price_suggested_max?: number;
  delay_suggested_days?: number;
  price_rationale?: string;
  improvement_potential?: number;
  createdAt: string;
  updatedAt: string;
}

// Global types for the application
declare global {
  namespace NodeJS {
    interface Global {
      missionStandardizations?: Map<string, MissionStandardization>;
      aiEnhancementCache?: Map<string, any>;
      performanceMetrics?: Map<string, any>;
    }
  }
  
  var missionStandardizations: Map<string, MissionStandardization> | undefined;
  var aiEnhancementCache: Map<string, any> | undefined;
  var performanceMetrics: Map<string, any> | undefined;
}