import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain,
  Save,
  Sparkles,
  Target,
  RefreshCw
} from 'lucide-react';

interface ProfileActionsProps {
  isEditing: boolean;
  showAIAssistant: boolean;
  onToggleAIAssistant: () => void;
  onSave: () => void;
  onAITextImprovement: (field: string) => void;
  onAIEnrichment: (field: string) => void;
  onAICallToAction: (field: string) => void;
  onAIStructure: (field: string) => void;
}

export function ProfileActions({
  isEditing,
  showAIAssistant,
  onToggleAIAssistant,
  onSave,
  onAITextImprovement,
  onAIEnrichment,
  onAICallToAction,
  onAIStructure
}: ProfileActionsProps) {
  return (
    <>
      {isEditing && (
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={onToggleAIAssistant}
            variant="outline"
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
            data-testid="button-toggle-ai-assistant"
          >
            <Brain className="w-4 h-4 mr-2" />
            {showAIAssistant ? 'Masquer' : 'Afficher'} l'Assistant IA
          </Button>
          
          <Button 
            onClick={onSave} 
            className="bg-green-600 hover:bg-green-700 shadow-lg"
            data-testid="button-save-profile"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les modifications
          </Button>
        </div>
      )}

      {/* Floating AI Assistant */}
      {showAIAssistant && isEditing && (
        <Card className="mt-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50" data-testid="floating-ai-assistant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-5 w-5" />
              Assistant IA - Optimisation du profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-purple-700">Amélioration du contenu</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => onAITextImprovement('bio')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-blue-200 hover:bg-blue-50 text-blue-700"
                    data-testid="button-ai-improve-bio"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Améliorer la description
                  </Button>
                  <Button
                    onClick={() => onAIEnrichment('bio')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-green-200 hover:bg-green-50 text-green-700"
                    data-testid="button-ai-enrich-bio"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Ajouter des mots-clés
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-purple-700">Structure et impact</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => onAICallToAction('bio')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-orange-200 hover:bg-orange-50 text-orange-700"
                    data-testid="button-ai-add-cta"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ajouter un appel à l'action
                  </Button>
                  <Button
                    onClick={() => onAIStructure('bio')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-purple-200 hover:bg-purple-50 text-purple-700"
                    data-testid="button-ai-restructure"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restructurer le texte
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}