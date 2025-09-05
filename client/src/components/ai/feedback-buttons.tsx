import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Edit, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIFeedbackButtonsProps {
  phase: 'pricing' | 'brief_enhance' | 'matching' | 'scoring';
  prompt: any;
  onFeedback?: (accepted: boolean, rating: number, edits?: string) => void;
}

export const AIFeedbackButtons: React.FC<AIFeedbackButtonsProps> = ({
  phase,
  prompt,
  onFeedback
}) => {
  const { toast } = useToast();

  const sendFeedback = async (feedback: { accepted: boolean; rating: number; edits?: string }) => {
    try {
      const response = await fetch('/api/ai-orchestrator/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, prompt, feedback })
      });
      
      if (response.ok) {
        toast({ title: "Merci pour votre retour !" });
        onFeedback?.(feedback.accepted, feedback.rating, feedback.edits);
      }
    } catch (error) {
      console.error('Erreur feedback:', error);
      toast({ title: "Erreur lors de l'envoi", variant: "destructive" });
    }
  };

  const handleKeep = () => sendFeedback({ accepted: true, rating: 5 });
  const handleReject = () => sendFeedback({ accepted: false, rating: 1 });
  const handleModify = () => {
    const edits = window.prompt("Indiquez vos modifications :");
    if (edits) {
      sendFeedback({ accepted: true, rating: 3, edits });
    }
  };

  return (
    <div className="flex gap-2 mt-2" data-testid="ai-feedback-buttons">
      <Button
        size="sm"
        variant="outline"
        onClick={handleKeep}
        className="text-green-600 hover:bg-green-50"
        data-testid="button-keep-suggestion"
      >
        <Check className="w-3 h-3 mr-1" />
        Garder
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleModify}
        className="text-blue-600 hover:bg-blue-50"
        data-testid="button-modify-suggestion"
      >
        <Edit className="w-3 h-3 mr-1" />
        Modifier
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        className="text-red-600 hover:bg-red-50"
        data-testid="button-reject-suggestion"
      >
        <X className="w-3 h-3 mr-1" />
        Rejeter
      </Button>
    </div>
  );
};