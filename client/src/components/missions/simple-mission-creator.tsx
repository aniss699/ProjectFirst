
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';

interface SimpleMissionCreatorProps {
  onComplete?: (missionData: any) => void;
  onCancel?: () => void;
}

export function SimpleMissionCreator({ onComplete, onCancel }: SimpleMissionCreatorProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    isTeamMode: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre et la description sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Envoi mission simplifiée:', formData);
      
      const response = await fetch('/api/missions/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget: formData.budget ? parseInt(formData.budget) : undefined,
          isTeamMode: formData.isTeamMode
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      toast({
        title: "✅ Mission créée !",
        description: `Mission "${formData.title}" créée avec succès`,
      });

      if (onComplete) {
        onComplete(result);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        budget: '',
        isTeamMode: false
      });

    } catch (error) {
      console.error('Erreur création mission:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la mission",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          🎯 Créer une Mission
        </CardTitle>
        <p className="text-gray-600 text-center">
          Décrivez votre projet en quelques mots, nous nous occupons du reste !
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Titre de votre mission *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Développer une application mobile de gestion de tâches"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              className="text-base"
              maxLength={100}
            />
            <p className="text-sm text-gray-500">
              {formData.title.length}/100 caractères
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Description détaillée *
            </Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre projet, vos besoins, les fonctionnalités attendues..."
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              className="min-h-[120px] text-base"
              maxLength={1000}
            />
            <p className="text-sm text-gray-500">
              {formData.description.length}/1000 caractères
            </p>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-base font-medium">
              Budget approximatif (€)
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="Ex: 2000"
              value={formData.budget}
              onChange={(e) => updateFormData('budget', e.target.value)}
              className="text-base"
              min="0"
              max="100000"
            />
            <p className="text-sm text-gray-500">
              Optionnel - Nous vous aiderons à estimer le budget si nécessaire
            </p>
          </div>

          {/* Mode équipe */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <Switch
              id="teamMode"
              checked={formData.isTeamMode}
              onCheckedChange={(checked) => updateFormData('isTeamMode', checked)}
            />
            <div>
              <Label htmlFor="teamMode" className="text-base font-medium">
                Mission en équipe
              </Label>
              <p className="text-sm text-gray-600">
                Cherchez-vous une équipe de plusieurs freelances ?
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Annuler
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                '🚀 Créer ma mission'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
