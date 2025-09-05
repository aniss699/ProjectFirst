
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResponsive } from '@/hooks/use-mobile';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { CategorySelector } from './category-selector';

interface MobileMissionCreatorProps {
  onComplete: (missionData: any) => void;
  onCancel: () => void;
}

export function MobileMissionCreator({ onComplete, onCancel }: MobileMissionCreatorProps) {
  const { isMobile } = useResponsive();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    location: '',
    urgency: 'medium'
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isMobile) {
    return null; // Fallback to desktop version
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="text-white hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-semibold">Nouvelle Mission</h1>
        <div className="text-sm">
          {step}/{totalSteps}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-1">
        <div 
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Titre de votre mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Titre"
                placeholder="Ex: Développement d'une app mobile"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                mobileOptimized={true}
              />
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 Un bon titre attire plus de prestataires qualifiés
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Catégorie et lieu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CategorySelector
                value={formData.category}
                onChange={(value) => updateFormData('category', value)}
              />
              <Input
                label="Localisation"
                placeholder="Paris, Remote, etc."
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
              />
              <Select
                value={formData.urgency}
                onValueChange={(value) => updateFormData('urgency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Urgence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Pas pressé</SelectItem>
                  <SelectItem value="medium">Normal</SelectItem>
                  <SelectItem value="high">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Description détaillée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Décrivez votre projet en détail..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                className="min-h-[150px] text-base"
              />
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  ✨ Plus votre description est précise, meilleurs seront les devis
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Budget indicatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Budget (€)"
                type="number"
                placeholder="Ex: 2500"
                value={formData.budget}
                onChange={(e) => updateFormData('budget', e.target.value)}
              />
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-700">
                  💰 Un budget réaliste attire des prestataires sérieux
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={handlePrev} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
        )}
        {step < totalSteps ? (
          <Button onClick={handleNext} className="flex-1">
            Suivant
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Publier
          </Button>
        )}
      </div>
    </div>
  );
}
