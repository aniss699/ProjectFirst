
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Sparkles, Lightbulb, Target, Users } from 'lucide-react';

interface AIAssistantProps {
  currentPage: string;
  userContext?: {
    isClient?: boolean;
    isProvider?: boolean;
    missions?: number;
    completedProjects?: number;
  };
}

export function AIAssistant({ currentPage, userContext }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateContextualSuggestions();
    }
  }, [isOpen, currentPage]);

  const generateContextualSuggestions = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/assistant-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: currentPage,
          userContext
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      // Fallback suggestions based on page
      setSuggestions(getFallbackSuggestions());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackSuggestions = () => {
    const suggestionMap: Record<string, any[]> = {
      'create-mission': [
        {
          type: 'tip',
          title: 'Optimisez votre description',
          description: 'Ajoutez des détails sur le budget et les délais pour attirer plus de candidats',
          action: 'Utiliser l\'IA pour améliorer',
          icon: Lightbulb
        },
        {
          type: 'insight',
          title: 'Meilleur moment pour publier',
          description: 'Les missions publiées le mardi reçoivent 40% plus de candidatures',
          action: 'Programmer la publication',
          icon: Target
        }
      ],
      'marketplace': [
        {
          type: 'recommendation',
          title: 'Missions recommandées',
          description: 'Basé sur vos compétences, 3 nouvelles missions correspondent à votre profil',
          action: 'Voir les recommandations',
          icon: Sparkles
        },
        {
          type: 'market',
          title: 'Tendance du marché',
          description: 'La demande en développement web a augmenté de 25% cette semaine',
          action: 'Explorer les opportunités',
          icon: Users
        }
      ]
    };

    return suggestionMap[currentPage] || [];
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Assistant IA
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Analyse en cours...</p>
            </div>
          ) : (
            suggestions.map((suggestion, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <suggestion.icon className="h-4 w-4 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  {suggestion.action}
                </Button>
              </div>
            ))
          )}
          
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              Poser une question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
