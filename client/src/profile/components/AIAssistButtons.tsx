import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, TrendingUp } from "lucide-react";

interface AIAssistButtonsProps {
  onBioGenerated?: (bio: string) => void;
  onKeywordsGenerated?: (keywords: string[]) => void;
}

export function AIAssistButtons({ onBioGenerated, onKeywordsGenerated }: AIAssistButtonsProps) {
  const [isLoadingBio, setIsLoadingBio] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

  const handleGenerateBio = async () => {
    setIsLoadingBio(true);
    try {
      // Mock implementation
      const generatedBio = "Professionnel expérimenté avec une expertise technique solide et une approche orientée résultats. Spécialisé dans le développement de solutions innovantes et la livraison de projets de qualité.";
      onBioGenerated?.(generatedBio);
    } catch (error) {
      console.error("Error generating bio:", error);
    } finally {
      setIsLoadingBio(false);
    }
  };

  const handleGenerateKeywords = async () => {
    setIsLoadingKeywords(true);
    try {
      // Mock implementation
      const generatedKeywords = ["Développement web", "React", "TypeScript", "Node.js", "Base de données"];
      onKeywordsGenerated?.(generatedKeywords);
    } catch (error) {
      console.error("Error generating keywords:", error);
    } finally {
      setIsLoadingKeywords(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerateBio}
        disabled={isLoadingBio}
        variant="outline"
        className="w-full justify-start hover:bg-purple-50 border-purple-200"
      >
        {isLoadingBio ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4 mr-2 text-purple-600" />
        )}
        Bio professionnelle
      </Button>

      <Button
        onClick={handleGenerateKeywords}
        disabled={isLoadingKeywords}
        variant="outline"
        className="w-full justify-start hover:bg-green-50 border-green-200"
      >
        {isLoadingKeywords ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
        )}
        Mots-clés & Skills
      </Button>
    </div>
  );
}

// Helper functions for profile analysis
export function calculateBioQuality(bio: string): number {
  if (!bio) return 0;
  
  let quality = 0;
  
  // Length scoring
  if (bio.length >= 50) quality += 0.3;
  if (bio.length >= 100) quality += 0.3;
  if (bio.length >= 200) quality += 0.2;
  
  // Content quality indicators
  if (bio.includes("expérience") || bio.includes("expertise")) quality += 0.1;
  if (bio.match(/\d+\s*(an|année)/)) quality += 0.1; // Years of experience
  
  return Math.min(1, quality);
}

export async function performLocalProfileAnalysis(profile: any, userType: string) {
  const analysis = {
    completeness_score: 0,
    visibility_boost: 0,
    trust_score: 0,
    revenue_prediction: 0,
    response_rate_boost: 0,
    ai_suggestions: [] as any[],
    auto_improvements: [] as string[]
  };

  // Calculate completeness score
  const weights = {
    basic_info: 20,
    bio: 25,
    skills: 20,
    portfolio: 15,
    rates: 10,
    availability: 10
  };

  let completeness = 0;

  // Basic information
  if (profile?.firstName && profile?.lastName && profile?.email) {
    completeness += weights.basic_info;
  }

  // Bio quality
  if (profile?.bio) {
    const bioQuality = calculateBioQuality(profile.bio);
    completeness += weights.bio * bioQuality;
  }

  // Skills
  if (profile?.skills?.length >= 3) {
    const skillsScore = Math.min(1, profile.skills.length / 8);
    completeness += weights.skills * skillsScore;
  }

  // Portfolio
  if (profile?.portfolio?.length > 0) {
    const portfolioScore = Math.min(1, profile.portfolio.length / 3);
    completeness += weights.portfolio * portfolioScore;
  }

  // Rates
  if (profile?.hourlyRate || profile?.dayRate) {
    completeness += weights.rates;
  }

  // Availability
  if (profile?.availability) {
    completeness += weights.availability;
  }

  analysis.completeness_score = Math.round(completeness);

  // Predictive calculations
  analysis.visibility_boost = Math.min(50, (100 - completeness) * 0.8);
  analysis.trust_score = Math.min(100, completeness * 0.9 + (profile?.verifications?.length || 0) * 5);
  analysis.revenue_prediction = Math.min(40, completeness * 0.3 + (profile?.skills?.length || 0) * 2);
  analysis.response_rate_boost = Math.min(25, (100 - completeness) * 0.4);

  // Smart suggestions
  if (!profile?.bio || profile.bio.length < 100) {
    analysis.ai_suggestions.push({
      type: 'bio_improvement',
      reasoning: 'Une bio de 200+ caractères augmente vos chances de +35%',
      impact: 35
    });
  }

  if (completeness < 80) {
    analysis.ai_suggestions.push({
      type: 'profile_completion',
      reasoning: 'Un profil complet à 80%+ double votre visibilité',
      impact: 50
    });
  }

  return analysis;
}