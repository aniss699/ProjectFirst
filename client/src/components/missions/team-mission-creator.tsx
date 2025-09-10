
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, Plus, Trash2, Edit, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamRequirement {
  profession: string;
  description: string;
  required_skills: string[];
  estimated_budget: number;
  estimated_days: number;
  min_experience: number;
  is_lead_role: boolean;
  importance: 'high' | 'medium' | 'low';
}

interface TeamMissionCreatorProps {
  onComplete: (missionData: any) => void;
  onCancel: () => void;
}

export function TeamMissionCreator({ onComplete, onCancel }: TeamMissionCreatorProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isTeamMode, setIsTeamMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    location: ''
  });
  const [teamRequirements, setTeamRequirements] = useState<TeamRequirement[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeTeam = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Champs obligatoires manquants",
        description: "Veuillez remplir au moins le titre et la description.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/team/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          title: formData.title,
          category: formData.category,
          budget: formData.budget
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setTeamRequirements(analysis.professions);
        setStep(3);
        toast({
          title: "Analyse terminée",
          description: `${analysis.professions.length} professions identifiées pour votre projet.`
        });
      } else {
        throw new Error('Erreur analyse');
      }
    } catch (error) {
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser les besoins d'équipe.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateRequirement = (index: number, field: string, value: any) => {
    const updated = [...teamRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setTeamRequirements(updated);
  };

  const removeRequirement = (index: number) => {
    setTeamRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomRequirement = () => {
    const newReq: TeamRequirement = {
      profession: '',
      description: '',
      required_skills: [],
      estimated_budget: 1000,
      estimated_days: 5,
      min_experience: 1,
      is_lead_role: false,
      importance: 'medium'
    };
    setTeamRequirements(prev => [...prev, newReq]);
  };

  const handleCreateProject = async () => {
    if (teamRequirements.length === 0) {
      toast({
        title: "Équipe vide",
        description: "Veuillez ajouter au moins une profession à votre équipe.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/team/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: { 
            ...formData, 
            isTeamMode: true,
            location: formData.location || 'Remote'
          },
          teamRequirements
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Projet créé avec succès !",
          description: `Votre projet a été divisé en ${result.subMissions.length} missions spécialisées.`
        });
        onComplete({ 
          ...formData, 
          isTeamMode: true, 
          teamRequirements,
          projectId: result.project.id,
          subMissions: result.subMissions
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur création');
      }
    } catch (error) {
      console.error('Erreur création projet équipe:', error);
      toast({
        title: "Erreur de création",
        description: error.message || "Impossible de créer le projet.",
        variant: "destructive"
      });
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Informations générales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Titre du projet</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Développement d'une plateforme e-commerce"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description détaillée</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Décrivez votre projet en détail..."
            rows={6}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Ex: Développement web"
            />
          </div>
          <div>
            <Label htmlFor="budget">Budget total</Label>
            <Input
              id="budget"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="Ex: 5000€"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="team-mode"
            checked={isTeamMode}
            onCheckedChange={setIsTeamMode}
          />
          <Label htmlFor="team-mode">Mode équipe - Diviser le projet en plusieurs spécialités</Label>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button 
            onClick={() => isTeamMode ? setStep(2) : onComplete(formData)}
            disabled={!formData.title.trim() || !formData.description.trim()}
          >
            {isTeamMode ? 'Analyser l\'équipe' : 'Créer le projet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Analyse des besoins d'équipe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Notre IA va analyser votre description pour identifier les professions nécessaires à votre projet.
          </p>
          <Button 
            onClick={handleAnalyzeTeam}
            disabled={isAnalyzing}
            size="lg"
          >
            {isAnalyzing ? 'Analyse en cours...' : 'Analyser les besoins'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Équipe recommandée
            <Button variant="outline" size="sm" onClick={addCustomRequirement}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamRequirements.map((req, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={req.profession}
                      onChange={(e) => updateRequirement(index, 'profession', e.target.value)}
                      className="font-semibold"
                      placeholder="Nom de la profession"
                    />
                    {req.is_lead_role && <Badge variant="secondary">Lead</Badge>}
                    <Badge variant={req.importance === 'high' ? 'destructive' : 'secondary'}>
                      {req.importance}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeRequirement(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Textarea
                  value={req.description}
                  onChange={(e) => updateRequirement(index, 'description', e.target.value)}
                  placeholder="Description du rôle..."
                  rows={2}
                  className="mb-3"
                />

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <Input
                      type="number"
                      value={req.estimated_budget}
                      onChange={(e) => updateRequirement(index, 'estimated_budget', Number(e.target.value))}
                      placeholder="Budget"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <Input
                      type="number"
                      value={req.estimated_days}
                      onChange={(e) => updateRequirement(index, 'estimated_days', Number(e.target.value))}
                      placeholder="Jours"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={req.min_experience}
                      onChange={(e) => updateRequirement(index, 'min_experience', Number(e.target.value))}
                      placeholder="Exp. min (années)"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {req.required_skills.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setStep(2)}>
              Retour
            </Button>
            <Button onClick={handleCreateProject}>
              Créer le projet équipe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
          <div className="h-px bg-gray-300 flex-1"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
          <div className="h-px bg-gray-300 flex-1"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
