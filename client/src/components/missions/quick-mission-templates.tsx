
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedBudget: number;
  estimatedDays: number;
  icon: string;
}

const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'website',
    title: 'Site Web Vitrine',
    description: 'Création d\'un site web moderne et responsive pour présenter mon entreprise avec formulaire de contact.',
    category: 'developpement',
    estimatedBudget: 2500,
    estimatedDays: 14,
    icon: '🌐'
  },
  {
    id: 'ecommerce',
    title: 'Boutique E-commerce',
    description: 'Développement d\'une boutique en ligne complète avec paiement sécurisé et gestion des stocks.',
    category: 'developpement',
    estimatedBudget: 5000,
    estimatedDays: 30,
    icon: '🛒'
  },
  {
    id: 'mobile-app',
    title: 'Application Mobile',
    description: 'Création d\'une application mobile native pour iOS et Android avec interface moderne.',
    category: 'mobile',
    estimatedBudget: 8000,
    estimatedDays: 45,
    icon: '📱'
  },
  {
    id: 'logo-design',
    title: 'Logo et Identité Visuelle',
    description: 'Conception d\'un logo professionnel et d\'une charte graphique complète pour ma marque.',
    category: 'design',
    estimatedBudget: 800,
    estimatedDays: 7,
    icon: '🎨'
  },
  {
    id: 'seo-marketing',
    title: 'Référencement SEO',
    description: 'Optimisation du référencement naturel de mon site web pour améliorer sa visibilité sur Google.',
    category: 'marketing',
    estimatedBudget: 1500,
    estimatedDays: 21,
    icon: '📈'
  }
];

interface QuickMissionTemplatesProps {
  onTemplateSelect: (template: MissionTemplate) => void;
  onCustomCreate: () => void;
}

export function QuickMissionTemplates({ onTemplateSelect, onCustomCreate }: QuickMissionTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MissionTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customBudget, setCustomBudget] = useState('');

  const handleTemplateClick = (template: MissionTemplate) => {
    setSelectedTemplate(template);
    setCustomTitle(template.title);
    setCustomDescription(template.description);
    setCustomBudget(template.estimatedBudget.toString());
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplate) {
      const customizedTemplate = {
        ...selectedTemplate,
        title: customTitle,
        description: customDescription,
        estimatedBudget: parseInt(customBudget) || selectedTemplate.estimatedBudget
      };
      onTemplateSelect(customizedTemplate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Créer une mission rapidement
        </h2>
        <p className="text-gray-600">
          Choisissez un template ou créez votre mission personnalisée
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MISSION_TEMPLATES.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleTemplateClick(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{template.icon}</span>
                <CardTitle className="text-lg">{template.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-green-600">
                  {template.estimatedBudget}€
                </span>
                <span className="text-gray-500">
                  ~{template.estimatedDays} jours
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Customization */}
      {selectedTemplate && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{selectedTemplate.icon}</span>
              Personnaliser votre mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre</label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Titre de votre mission"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Décrivez votre projet en détail"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Budget estimé (€)</label>
              <Input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                placeholder="Budget en euros"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button 
                onClick={handleCreateFromTemplate}
                className="flex-1"
                disabled={!customTitle || !customDescription}
              >
                Créer cette mission
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Creation Option */}
      <div className="text-center pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onCustomCreate}
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          💡 Créer une mission personnalisée
        </Button>
      </div>
    </div>
  );
}
