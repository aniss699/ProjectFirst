import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, RefreshCw } from 'lucide-react';

interface TextSuggestionButtonProps {
  currentText: string;
  fieldType: 'title' | 'description' | 'requirements';
  category?: string;
  onSuggestion: (suggestedText: string) => void;
  className?: string;
}

export function TextSuggestionButton({ 
  currentText, 
  fieldType, 
  category = '',
  onSuggestion,
  className = ''
}: TextSuggestionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false); // Pour gérer l'affichage du feedback après succès

  const handleSuggestion = async () => {
    console.log('🎯 Déclenchement suggestion pour:', { text: currentText.substring(0, 50), fieldType, category });

    if (!currentText.trim()) {
      console.warn('❌ Texte vide fourni');
      setError('Aucun texte à améliorer');
      return;
    }

    setIsLoading(true);
    setError(null); // Réinitialiser l'erreur avant une nouvelle tentative
    setShowFeedback(false); // Réinitialiser le feedback

    try {
      console.log('📡 Envoi requête /api/ai/enhance-text...');

      const requestBody = {
        text: currentText.trim(),
        fieldType,
        category: category || 'général' // Assurer une valeur par défaut si category est undefined
      };

      console.log('📦 Corps de la requête:', requestBody);

      const response = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📨 Réponse reçue, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        // Ajuster le message d'erreur pour être plus précis
        let errorMessage = `Erreur ${response.status}`;
        if (response.status === 429) {
            errorMessage = 'Quota IA dépassé - Essayez plus tard';
        } else {
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorText;
            } catch (e) {
                errorMessage = errorText || `Erreur ${response.status}`;
            }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📋 Données reçues:', data);

      if (data.success && data.data?.enhancedText) {
        console.log('✅ Suggestion reçue avec succès');
        // Vérifier si c'est vraiment une amélioration
        if (data.data.enhancedText.length > currentText.trim().length * 0.8) {
          onSuggestion(data.data.enhancedText);
          setShowFeedback(true); // Afficher le feedback de succès
          toast({
            title: 'Texte amélioré !',
            description: 'L\'IA a optimisé votre texte',
          });
        } else {
          console.warn('⚠️ Suggestion trop courte, conservation du texte original');
          setError('La suggestion générée semble incomplète');
          toast({
            title: 'Suggestion Incomplète',
            description: 'L\'IA n\'a pas pu améliorer le texte de manière significative.',
            variant: 'destructive'
          });
        }
      } else {
        console.error('❌ Réponse invalide:', data);
        const serverError = data.error || 'Réponse invalide du serveur';
        throw new Error(serverError);
      }

    } catch (error) {
        console.error('Erreur suggestion texte:', error);
        // Afficher un message d'erreur à l'utilisateur
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(errorMessage);
        toast({
          title: 'Erreur',
          description: `IA temporairement indisponible: ${errorMessage}`,
          variant: 'destructive'
        });
      } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    switch (fieldType) {
      case 'title': return 'Améliorer le titre';
      case 'description': return 'Enrichir la description';
      case 'requirements': return 'Préciser les exigences';
      default: return 'Suggestion IA';
    }
  };

  return (
    <Button 
      onClick={handleSuggestion} // Utiliser handleSuggestion ici
      disabled={isLoading || !currentText.trim()}
      variant="outline"
      size="sm"
      className={`bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 ${className}`}
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 mr-2" />
      )}
      {getButtonText()}
    </Button>
  );
}