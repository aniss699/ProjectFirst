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

  const getSuggestion = async () => {
    if (!currentText.trim()) {
      toast({
        title: 'Texte manquant',
        description: 'Veuillez d\'abord saisir du texte à améliorer',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: currentText,
          fieldType,
          category
        })
      });

      if (!response.ok) {
        // Fallback si quota OpenAI dépassé
        if (response.status === 429) {
          throw new Error('Quota IA dépassé - Essayez plus tard');
        }
        throw new Error('Erreur lors de la suggestion');
      }

      const result = await response.json();
      onSuggestion(result.data.enhancedText);

      toast({
        title: 'Texte amélioré !',
        description: 'L\'IA a optimisé votre texte',
      });

    } catch (error) {
      console.error('Erreur suggestion texte:', error);
      toast({
        title: 'Erreur',
        description: (error as Error).message || 'Impossible de générer la suggestion',
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
      onClick={getSuggestion}
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