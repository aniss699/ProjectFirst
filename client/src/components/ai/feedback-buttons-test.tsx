import React, { useState } from 'react';
import { AIFeedbackButtons } from './feedback-buttons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FeedbackButtonsTest() {
  const [showButtons, setShowButtons] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>Test des boutons de feedback AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Cliquez sur "Afficher les boutons" pour voir les boutons de feedback AI.
        </p>
        
        <Button 
          onClick={() => setShowButtons(!showButtons)}
          data-testid="toggle-feedback-buttons"
        >
          {showButtons ? 'Masquer' : 'Afficher'} les boutons
        </Button>

        {showButtons && (
          <div className="p-4 border rounded bg-gray-50">
            <h4 className="font-medium mb-2">Suggestion AI simulée :</h4>
            <p className="text-sm mb-3">Prix suggéré : 2500€ (basé sur vos critères)</p>
            
            <AIFeedbackButtons 
              phase="pricing" 
              prompt={{ 
                projectTitle: "Test Project",
                description: "Test description",
                category: "development",
                suggestedPrice: 2500
              }}
              onFeedback={(accepted, rating, edits) => {
                setFeedback(`Feedback reçu: ${accepted ? 'Accepté' : 'Rejeté'} (Note: ${rating}/5)${edits ? ` - Modifications: ${edits}` : ''}`);
              }}
            />
          </div>
        )}

        {feedback && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
            <strong>Résultat :</strong> {feedback}
          </div>
        )}
      </CardContent>
    </Card>
  );
}