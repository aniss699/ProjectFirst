import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Euro, RefreshCw, Sparkles, Clock, CheckCircle } from "lucide-react";

export interface AIEnhancementProps {
  onPricingSuggestion?: (suggestion: any) => void;
  onDescriptionEnhancement?: (enhancement: any) => void;
}

export function AIEnhancement({ onPricingSuggestion, onDescriptionEnhancement }: AIEnhancementProps) {
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null);
  const [enhancedDescription, setEnhancedDescription] = useState<any>(null);

  const suggestPricing = async () => {
    setIsLoadingPrice(true);
    try {
      // Mock implementation
      const mockSuggestion = {
        minPrice: 1500,
        averagePrice: 2500,
        maxPrice: 3500,
        factors: ["Complexité technique", "Délai demandé", "Marché local"]
      };
      setPriceSuggestion(mockSuggestion);
      onPricingSuggestion?.(mockSuggestion);
    } catch (error) {
      console.error("Error suggesting pricing:", error);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const enhanceDescription = async () => {
    setIsEnhancing(true);
    try {
      // Mock implementation
      const mockEnhancement = {
        improvedTitle: "Développement d'application mobile e-commerce moderne",
        detailedDescription: "Développement complet d'une application mobile de commerce électronique avec interface utilisateur intuitive et système de paiement sécurisé intégré.",
        complexity: "Moyen",
        suggestedRequirements: ["React Native", "API RESTful", "Base de données", "Paiements sécurisés"],
        estimatedTimeline: "6-8 semaines"
      };
      setEnhancedDescription(mockEnhancement);
      onDescriptionEnhancement?.(mockEnhancement);
    } catch (error) {
      console.error("Error enhancing description:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Simple": return "bg-green-100 text-green-800";
      case "Moyen": return "bg-yellow-100 text-yellow-800";
      case "Complexe": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const applyEnhancedDescription = () => {
    // Implementation for applying enhanced description
    console.log("Applying enhanced description");
  };

  return (
    <div className="space-y-4">
      {/* AI Enhancement Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={suggestPricing}
          disabled={isLoadingPrice}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLoadingPrice ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Euro className="w-4 h-4" />
          )}
          Suggérer un prix IA
        </Button>

        <Button
          onClick={enhanceDescription}
          disabled={isEnhancing}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isEnhancing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Améliorer la description
        </Button>
      </div>

      {/* Price Suggestion Results */}
      {priceSuggestion && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-blue-800">
              <Euro className="w-5 h-5 mr-2" />
              Suggestion de prix IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-sm text-gray-600">Minimum</p>
                <p className="text-xl font-bold text-blue-600">{priceSuggestion.minPrice}€</p>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg border-2 border-blue-300">
                <p className="text-sm text-blue-700">Recommandé</p>
                <p className="text-2xl font-bold text-blue-800">{priceSuggestion.averagePrice}€</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-sm text-gray-600">Maximum</p>
                <p className="text-xl font-bold text-blue-600">{priceSuggestion.maxPrice}€</p>
              </div>
            </div>
            
            {priceSuggestion.factors.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Facteurs analysés :</h4>
                <div className="flex flex-wrap gap-2">
                  {priceSuggestion.factors.map((factor: string, index: number) => (
                    <Badge key={index} variant="secondary">{factor}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Description Results */}
      {enhancedDescription && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-purple-800">
              <Lightbulb className="w-5 h-5 mr-2" />
              Description améliorée par IA
              <Badge className={`ml-2 ${getComplexityColor(enhancedDescription.complexity)}`}>
                {enhancedDescription.complexity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Titre amélioré :</h4>
              <p className="p-3 bg-white rounded-lg border font-medium">
                {enhancedDescription.improvedTitle}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Description détaillée :</h4>
              <Textarea 
                value={enhancedDescription.detailedDescription}
                readOnly
                className="min-h-[120px] bg-white"
              />
            </div>

            {enhancedDescription.suggestedRequirements.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Exigences suggérées :</h4>
                <div className="flex flex-wrap gap-2">
                  {enhancedDescription.suggestedRequirements.map((req: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-white">{req}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Délai estimé : {enhancedDescription.estimatedTimeline}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={applyEnhancedDescription} className="bg-purple-600 hover:bg-purple-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Appliquer les améliorations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}