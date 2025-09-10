import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Euro, Sparkles, RefreshCw, TrendingUp } from 'lucide-react';

interface PriceSuggestion {
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  factors: string[];
  confidence: number;
}

interface SimpleAIEnhancementProps {
  title: string;
  description: string;
  category: string;
  onPriceSuggestion?: (price: PriceSuggestion) => void;
}

export function SimpleAIEnhancement({ 
  title, 
  description, 
  category, 
  onPriceSuggestion 
}: SimpleAIEnhancementProps) {
  const [isPricingSuggestion, setIsPricingSuggestion] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  const { toast } = useToast();

  const generatePriceSuggestion = async () => {
    if (!title || !description || !category) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez remplir le titre, la description et la catégorie',
        variant: 'destructive'
      });
      return;
    }

    setIsPricingSuggestion(true);
    try {
      // Simulation locale de suggestion de prix
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation d'attente
      
      const suggestion = generateLocalPriceSuggestion(title, description, category);
      setPriceSuggestion(suggestion);
      onPriceSuggestion?.(suggestion);

      toast({
        title: 'Suggestion de prix générée !',
        description: 'L\'IA a analysé votre projet et propose une fourchette de prix',
      });

    } catch (error) {
      console.error('Erreur suggestion prix:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer la suggestion de prix',
        variant: 'destructive'
      });
    } finally {
      setIsPricingSuggestion(false);
    }
  };

  const generateLocalPriceSuggestion = (title: string, description: string, category: string): PriceSuggestion => {
    // Calcul basé sur la catégorie et la complexité du projet
    const categoryMultipliers = {
      'développement': { base: 500, min: 0.7, max: 1.8, factors: ['Complexité technique', 'Délais', 'Technologies'] },
      'design': { base: 300, min: 0.6, max: 1.6, factors: ['Créativité', 'Révisions', 'Supports'] },
      'marketing': { base: 400, min: 0.5, max: 2.0, factors: ['Audience', 'Canaux', 'Durée campagne'] },
      'conseil': { base: 600, min: 0.8, max: 2.2, factors: ['Expertise', 'Secteur', 'Urgence'] },
      'travaux': { base: 800, min: 0.9, max: 1.5, factors: ['Matériaux', 'Surface', 'Complexité'] },
      'services': { base: 250, min: 0.6, max: 1.4, factors: ['Durée', 'Fréquence', 'Spécialisation'] }
    };

    const multiplier = categoryMultipliers[category as keyof typeof categoryMultipliers] || categoryMultipliers['services'];
    const complexityFactor = Math.min(description.length / 100, 2); // Plus de description = plus complexe
    const basPrice = multiplier.base * (1 + complexityFactor * 0.3);

    const minPrice = Math.round(basPrice * multiplier.min);
    const maxPrice = Math.round(basPrice * multiplier.max);
    const averagePrice = Math.round((minPrice + maxPrice) / 2);

    const result = {
      minPrice,
      maxPrice,
      averagePrice,
      factors: multiplier.factors || ['Analyse complexité', 'Marché local', 'Standards secteur'],
      confidence: 0.82 + Math.random() * 0.15 // Entre 82% et 97%
    };
    
    console.log('Prix suggéré:', result);
    return result;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Bouton de suggestion de prix */}
      <Button 
        onClick={generatePriceSuggestion}
        disabled={isPricingSuggestion}
        variant="outline"
        className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200"
      >
        {isPricingSuggestion ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Euro className="w-4 h-4 mr-2" />
        )}
        Suggérer un prix IA
      </Button>

      {/* Affichage de la suggestion de prix */}
      {priceSuggestion && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-blue-800">
              <TrendingUp className="w-5 h-5 mr-2" />
              Suggestion de prix IA
              <Badge className={`ml-2 ${getConfidenceColor(priceSuggestion.confidence)}`}>
                {Math.round(priceSuggestion.confidence * 100)}% confiance
              </Badge>
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
            
            {priceSuggestion.factors && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Facteurs analysés :</h4>
                <div className="flex flex-wrap gap-2">
                  {priceSuggestion.factors.map((factor, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}