
import { AnyProfile } from '../types/profile';

export function computeProfileCompleteness(p: Partial<AnyProfile>): number {
  let score = 0;
  
  // Informations de base (30 points)
  if (p.avatarUrl) score += 5;
  if (p.displayName) score += 5;
  if (p.headline) score += 10;
  if (p.bio && p.bio.length > 50) score += 15;
  else if (p.bio && p.bio.length > 20) score += 8;
  
  // Contact et localisation (10 points)
  if (p.location?.city) score += 5;
  if (p.languages?.length) score += 5;
  
  // Compétences et expertise (35 points)
  if (p.keywords?.length && p.keywords.length >= 3) score += 10;
  else if (p.keywords?.length) score += 5;
  
  if (p.skills?.length && p.skills.length >= 5) score += 20;
  else if (p.skills?.length && p.skills.length >= 3) score += 15;
  else if (p.skills?.length) score += 8;
  
  if (p.industries?.length) score += 5;
  
  // Portfolio et certifications (15 points)
  if (p.portfolio?.length && p.portfolio.length >= 3) score += 10;
  else if (p.portfolio?.length) score += 5;
  
  if (p.certifications?.length) score += 5;
  
  // Disponibilité et tarifs (10 points)
  if (p.availability?.modes?.length) score += 5;
  if (p.rates?.min && p.rates?.max) score += 5;
  
  // Préférences et consentement (bonus)
  if (p.preferences?.gdprConsent) score += 5;
  
  return Math.min(Math.max(score, 0), 100);
}

export function getCompletenessLevel(score: number): {
  level: "critique" | "faible" | "moyen" | "bon" | "excellent";
  color: string;
  description: string;
} {
  if (score < 30) return {
    level: "critique",
    color: "red",
    description: "Profil incomplet - Risque de visibilité très faible"
  };
  if (score < 50) return {
    level: "faible", 
    color: "orange",
    description: "Profil basique - Ajoutez plus d'informations"
  };
  if (score < 70) return {
    level: "moyen",
    color: "yellow", 
    description: "Profil correct - Quelques améliorations possibles"
  };
  if (score < 90) return {
    level: "bon",
    color: "blue",
    description: "Bon profil - Presque optimal"
  };
  return {
    level: "excellent",
    color: "green", 
    description: "Profil excellent - Visibilité maximale"
  };
}

export function getMissingElements(p: Partial<AnyProfile>): Array<{
  field: string;
  label: string;
  priority: "high" | "medium" | "low";
  points: number;
}> {
  const missing = [];
  
  if (!p.avatarUrl) missing.push({ field: "avatarUrl", label: "Photo de profil", priority: "medium" as const, points: 5 });
  if (!p.headline) missing.push({ field: "headline", label: "Titre professionnel", priority: "high" as const, points: 10 });
  if (!p.bio || p.bio.length < 50) missing.push({ field: "bio", label: "Description détaillée", priority: "high" as const, points: 15 });
  if (!p.location?.city) missing.push({ field: "location", label: "Localisation", priority: "medium" as const, points: 5 });
  if (!p.languages?.length) missing.push({ field: "languages", label: "Langues parlées", priority: "medium" as const, points: 5 });
  if (!p.keywords?.length || p.keywords.length < 3) missing.push({ field: "keywords", label: "Mots-clés (min 3)", priority: "high" as const, points: 10 });
  if (!p.skills?.length || p.skills.length < 5) missing.push({ field: "skills", label: "Compétences (min 5)", priority: "high" as const, points: 20 });
  if (!p.portfolio?.length) missing.push({ field: "portfolio", label: "Portfolio/Références", priority: "medium" as const, points: 10 });
  if (!p.availability?.modes?.length) missing.push({ field: "availability", label: "Disponibilités", priority: "medium" as const, points: 5 });
  if (!p.rates?.min) missing.push({ field: "rates", label: "Tarifs", priority: "medium" as const, points: 5 });
  
  return missing.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Utilitaires supplémentaires pour le calcul de score de profil
export interface ProfileScoreFactors {
  completeness: number;
  activity: number;
  reputation: number;
  verification: number;
}

export function calculateProfileScore(factors: ProfileScoreFactors): number {
  const weights = {
    completeness: 0.3,
    activity: 0.2,
    reputation: 0.4,
    verification: 0.1
  };
  
  return Math.round(
    factors.completeness * weights.completeness +
    factors.activity * weights.activity +
    factors.reputation * weights.reputation +
    factors.verification * weights.verification
  );
}

export function getProfileCompletenessScore(profile: any): number {
  if (!profile) return 0;
  
  let score = 0;
  const fields = ['name', 'email', 'description', 'location', 'skills'];
  
  fields.forEach(field => {
    if (profile[field] && profile[field].length > 0) {
      score += 20; // 20 points par champ complété
    }
  });
  
  return Math.min(score, 100);
}
