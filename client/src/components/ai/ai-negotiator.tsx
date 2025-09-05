
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, TrendingUp, Euro, Zap, CheckCircle } from 'lucide-react';

interface NegotiationData {
  initial_bid: number;
  client_budget: number;
  mission_complexity: number;
  provider_profile: {
    rating: number;
    experience_years: number;
    success_rate: number;
  };
}

export function AINegotiator({ negotiationData }: { negotiationData: NegotiationData }) {
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<any>(null);

  const handleNegotiate = async () => {
    setIsNegotiating(true);
    try {
      const response = await fetch('/api/ai/negotiate/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(negotiationData)
      });

      if (response.ok) {
        const result = await response.json();
        setNegotiationResult(result.negotiation);
      }
    } catch (error) {
      console.error('Negotiation failed:', error);
    } finally {
      setIsNegotiating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Négociation IA Automatique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contexte de négociation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {negotiationData.initial_bid}€
            </div>
            <p className="text-sm text-blue-800">Offre initiale</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {negotiationData.client_budget}€
            </div>
            <p className="text-sm text-green-800">Budget client</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {negotiationData.mission_complexity}/10
            </div>
            <p className="text-sm text-purple-800">Complexité</p>
          </div>
        </div>

        {/* Bouton de négociation */}
        {!negotiationResult && (
          <Button 
            onClick={handleNegotiate} 
            disabled={isNegotiating}
            className="w-full"
            size="lg"
          >
            {isNegotiating ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-pulse" />
                IA en cours de négociation...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Lancer la négociation IA
              </>
            )}
          </Button>
        )}

        {/* Résultats de négociation */}
        {negotiationResult && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Négociation Terminée</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Prix suggéré</p>
                  <p className="text-2xl font-bold text-green-600">
                    {negotiationResult.suggested_counter_offer}€
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Probabilité de succès</p>
                  <div className="flex items-center gap-2">
                    <Progress value={negotiationResult.win_probability * 100} className="flex-1" />
                    <span className="text-sm font-semibold">
                      {Math.round(negotiationResult.win_probability * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stratégie et arguments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Stratégie Recommandée</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mb-2">
                    {negotiationResult.negotiation_strategy}
                  </Badge>
                  <div className="space-y-2">
                    {negotiationResult.arguments?.map((arg: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm">{arg}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Prochaines Étapes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {negotiationResult.next_steps?.map((step: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="default" className="flex-1">
                <Euro className="h-4 w-4 mr-2" />
                Accepter le prix suggéré
              </Button>
              <Button variant="outline" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Contre-proposer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
