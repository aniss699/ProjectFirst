import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Camera, 
  MapPin, 
  Globe,
  User,
  Briefcase,
  Star,
  Settings,
  CheckCircle,
  Lightbulb,
  Sparkles,
  Wand2,
  Target,
  TrendingUp,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfile } from './useProfile';
import { KeywordsSkillsEditor } from './components/KeywordsSkillsEditor';
import { AIAssistButtons } from './components/AIAssistButtons';
import type { User } from '@shared/schema';

type AnyProfile = Omit<User, 'password' | 'id' | 'email'>;
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  { id: 'general', title: 'Informations générales', icon: User },
  { id: 'location', title: 'Localisation & Langues', icon: MapPin },
  { id: 'skills', title: 'Compétences & Mots-clés', icon: Star },
  { id: 'portfolio', title: 'Portfolio & Certifications', icon: Briefcase },
  { id: 'availability', title: 'Disponibilité & Tarifs', icon: Globe },
  { id: 'preferences', title: 'Préférences & Confidentialité', icon: Settings }
];

export function ProfileWizard() {
  const [, setLocation] = useLocation();
  const { profile, updateProfile, saveStep } = useProfile();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<AnyProfile>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>({});
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const updateFormData = (updates: Partial<AnyProfile>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Générer des suggestions IA pour l'étape actuelle
  const generateStepSuggestions = async (stepId: string, data: Partial<AnyProfile>) => {
    try {
      const response = await fetch('/api/ai/assistant-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: `profile-${stepId}`,
          userContext: {
            isClient: data.role === 'client',
            isProvider: data.role === 'provider',
            completeness: data.completeness || 0,
            hasContent: {
              bio: !!data.bio && data.bio.length > 50,
              headline: !!data.headline,
              skills: !!data.skills && data.skills.length > 0,
              portfolio: !!data.portfolio && data.portfolio.length > 0
            }
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAiSuggestions(prev => ({
          ...prev,
          [stepId]: result.suggestions
        }));
      }
    } catch (error) {
      console.error('Erreur suggestions IA:', error);
    }
  };

  // Générer suggestions quand on change d'étape
  useEffect(() => {
    if (formData.role && showAISuggestions) {
      const stepId = STEPS[currentStep].id;
      generateStepSuggestions(stepId, formData);
    }
  }, [currentStep, formData.role, showAISuggestions]);

  const handleSaveStep = async () => {
    try {
      await saveStep(formData);
      setHasChanges(false);
      toast({
        title: 'Étape sauvegardée',
        description: 'Vos modifications ont été enregistrées.',
      });
    } catch (error) {
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder les modifications.',
        variant: 'destructive'
      });
    }
  };

  const nextStep = async () => {
    if (hasChanges) {
      await handleSaveStep();
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = async () => {
    if (hasChanges) {
      await handleSaveStep();
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishWizard = async () => {
    try {
      await updateProfile(formData);
      toast({
        title: 'Profil mis à jour',
        description: 'Votre profil a été mis à jour avec succès.',
      });
      setLocation('/profile');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de finaliser les modifications.',
        variant: 'destructive'
      });
    }
  };

  const currentStepData = STEPS[currentStep];
  const StepIcon = currentStepData.icon;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Modifier mon profil</h1>
            <Button
              variant="outline"
              onClick={() => setLocation('/profile')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Étape {currentStep + 1} sur {STEPS.length}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="flex flex-wrap gap-2 mt-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Icon className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <StepIcon className="h-5 w-5 mr-2 text-blue-600" />
                {currentStepData.title}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" /> {/* Changed Brain to Zap */}
                {showAISuggestions ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Masquer IA
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Afficher IA
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Suggestions IA pour l'étape actuelle */}
            {showAISuggestions && aiSuggestions[STEPS[currentStep].id] && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                    <Sparkles className="h-4 w-4" />
                    Suggestions IA pour cette étape
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {aiSuggestions[STEPS[currentStep].id].map((suggestion: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex-shrink-0 mt-1">
                        {suggestion.icon === 'Lightbulb' && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                        {suggestion.icon === 'Target' && <Target className="h-4 w-4 text-blue-500" />}
                        {suggestion.icon === 'TrendingUp' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {suggestion.icon === 'Sparkles' && <Sparkles className="h-4 w-4 text-purple-500" />}
                        {!suggestion.icon && <Zap className="h-4 w-4 text-blue-500" />} {/* Changed Brain to Zap */}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{suggestion.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                        {suggestion.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              // Action personnalisée selon le type de suggestion
                              if (suggestion.type === 'enhancement') {
                                generateStepSuggestions(STEPS[currentStep].id, formData);
                              }
                            }}
                          >
                            {suggestion.action}
                          </Button>
                        )}
                        {suggestion.priority === 'high' && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Priorité haute
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {currentStep === 0 && (
              <GeneralInfoStep
                data={formData}
                onChange={updateFormData}
              />
            )}

            {currentStep === 1 && (
              <LocationLanguagesStep
                data={formData}
                onChange={updateFormData}
              />
            )}

            {currentStep === 2 && (
              <SkillsKeywordsStep
                data={formData}
                onChange={updateFormData}
              />
            )}

            {currentStep === 3 && (
              <PortfolioCertificationsStep
                data={formData}
                onChange={updateFormData}
              />
            )}

            {currentStep === 4 && (
              <AvailabilityRatesStep
                data={formData}
                onChange={updateFormData}
              />
            )}

            {currentStep === 5 && (
              <PreferencesStep
                data={formData}
                onChange={updateFormData}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          <div className="flex space-x-3">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleSaveStep}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            )}

            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={finishWizard}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Terminer
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function GeneralInfoStep({ data, onChange }: { data: Partial<AnyProfile>; onChange: (updates: Partial<AnyProfile>) => void }) {
  const setHeadline = (headline: string) => onChange({ headline });
  const setBio = (bio: string) => onChange({ bio });
  const setKeywords = (keywords: string[]) => onChange({ keywords });
  const setSkills = (skills: { name: string, level: number }[]) => onChange({ skills });

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center space-x-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={data.avatarUrl} />
          <AvatarFallback className="text-xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
            {data.displayName?.split(' ').map(n => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Changer la photo
          </Button>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG jusqu'à 2MB</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="displayName">Nom affiché *</Label>
          <Input
            id="displayName"
            value={data.displayName || ''}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder="Votre nom complet"
          />
        </div>

        <div>
          <Label htmlFor="role">Type de profil</Label>
          <Select
            value={data.role}
            onValueChange={(value: 'client' | 'provider') => onChange({ role: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="provider">Prestataire</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Headline */}
      <div>
        <Label htmlFor="headline">Titre professionnel</Label>
        <Input
          id="headline"
          value={data.headline || ''}
          onChange={(e) => onChange({ headline: e.target.value })}
          placeholder={data.role === 'provider' ? 'Ex: Développeur Full-Stack React/Node.js' : 'Ex: Directeur Marketing Digital'}
        />
        <AIAssistButtons 
          type="headline"
          currentValue={data.bio || ''}
          role={data.role}
          onSuggestion={(suggestion) => setHeadline(suggestion as string)}
          currentProfile={data}
          userType={data.role}
        />
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Description *</Label>
        <Textarea
          id="bio"
          value={data.bio || ''}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder={
            data.role === 'provider'
              ? 'Présentez votre expertise, votre expérience et ce qui vous différencie...'
              : 'Décrivez votre entreprise, vos besoins et vos attentes...'
          }
          rows={5}
        />
        <AIAssistButtons
          type="bio"
          currentValue={data.bio || ''}
          role={data.role}
          onSuggestion={(suggestion) => onChange({ bio: suggestion as string })}
        />
      </div>
    </div>
  );
}

function LocationLanguagesStep({ data, onChange }: { data: Partial<AnyProfile>; onChange: (updates: Partial<AnyProfile>) => void }) {
  const [newLanguage, setNewLanguage] = useState('');

  const addLanguage = () => {
    if (newLanguage.trim() && !data.languages?.includes(newLanguage.trim())) {
      onChange({
        languages: [...(data.languages || []), newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    onChange({
      languages: data.languages?.filter(l => l !== language) || []
    });
  };

  return (
    <div className="space-y-6">
      {/* Location */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={data.location?.city || ''}
            onChange={(e) => onChange({ 
              location: { ...data.location, city: e.target.value }
            })}
            placeholder="Paris"
          />
        </div>
        <div>
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            value={data.location?.country || ''}
            onChange={(e) => onChange({ 
              location: { ...data.location, country: e.target.value }
            })}
            placeholder="France"
          />
        </div>
      </div>

      {/* Languages */}
      <div>
        <Label>Langues parlées</Label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Ajouter une langue..."
              onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
            />
            <Button onClick={addLanguage} type="button">
              Ajouter
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.languages?.map((language, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {language}
                <button
                  onClick={() => removeLanguage(language)}
                  className="ml-2 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Industries */}
      <div>
        <Label>Secteurs d'activité</Label>
        <div className="grid md:grid-cols-2 gap-2 mt-2">
          {[
            'Technologie', 'Marketing', 'Design', 'Consulting', 'Finance',
            'Santé', 'Éducation', 'E-commerce', 'Immobilier', 'Autre'
          ].map((industry) => (
            <label key={industry} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.industries?.includes(industry) || false}
                onChange={(e) => {
                  const industries = data.industries || [];
                  if (e.target.checked) {
                    onChange({ industries: [...industries, industry] });
                  } else {
                    onChange({ industries: industries.filter(i => i !== industry) });
                  }
                }}
              />
              <span className="text-sm">{industry}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillsKeywordsStep({ data, onChange }: { data: Partial<AnyProfile>; onChange: (updates: Partial<AnyProfile>) => void }) {
  const setKeywords = (keywords: string[]) => onChange({ keywords });
  const setSkills = (skills: { name: string, level: number }[]) => onChange({ skills });

  return (
    <div className="space-y-6">
      <KeywordsSkillsEditor
        keywords={data.keywords || []}
        skills={data.skills || []}
        onKeywordsChange={(keywords) => onChange({ keywords })}
        onSkillsChange={(skills) => onChange({ skills })}
        role={data.role || 'provider'}
      />

      <AIAssistButtons
        type="keywords"
        currentValue={data.bio || ''}
        role={data.role}
        onSuggestion={(suggestion) => {
          if (typeof suggestion === 'object') {
            onChange({
              keywords: [...(data.keywords || []), ...suggestion.keywords],
              skills: [...(data.skills || []), ...suggestion.skills.map(s => ({ name: s, level: 3 as const }))]
            });
          }
        }}
      />
    </div>
  );
}

function PortfolioCertificationsStep({ data, onChange }: { data: Partial<AnyProfile>; onChange: (updates: Partial<AnyProfile>) => void }) {
  const [newPortfolio, setNewPortfolio] = useState({ title: '', description: '', url: '' });
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', year: new Date().getFullYear() });

  const addPortfolio = () => {
    if (newPortfolio.title.trim()) {
      onChange({
        portfolio: [...(data.portfolio || []), newPortfolio]
      });
      setNewPortfolio({ title: '', description: '', url: '' });
    }
  };

  const addCertification = () => {
    if (newCertification.name.trim()) {
      onChange({
        certifications: [...(data.certifications || []), newCertification]
      });
      setNewCertification({ name: '', issuer: '', year: new Date().getFullYear() });
    }
  };

  return (
    <div className="space-y-8">
      {/* Portfolio */}
      <div>
        <h3 className="text-lg font-medium mb-4">Portfolio / Références</h3>

        {/* Existing portfolio items */}
        <div className="space-y-3 mb-4">
          {data.portfolio?.map((item, index) => (
            <Card key={index} className="p-4">
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                  Voir le projet →
                </a>
              )}
            </Card>
          ))}
        </div>

        {/* Add new portfolio item */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Ajouter un projet</h4>
          <div className="space-y-3">
            <Input
              placeholder="Titre du projet"
              value={newPortfolio.title}
              onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Description du projet"
              value={newPortfolio.description}
              onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Input
              placeholder="URL (optionnel)"
              value={newPortfolio.url}
              onChange={(e) => setNewPortfolio(prev => ({ ...prev, url: e.target.value }))}
            />
            <Button onClick={addPortfolio} type="button">
              Ajouter au portfolio
            </Button>
          </div>
        </Card>
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-lg font-medium mb-4">Certifications</h3>

        {/* Existing certifications */}
        <div className="space-y-2 mb-4">
          {data.certifications?.map((cert, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{cert.name}</span>
                {cert.issuer && <span className="text-gray-600 ml-2">- {cert.issuer}</span>}
                {cert.year && <span className="text-gray-500 ml-2">({cert.year})</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Add new certification */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Ajouter une certification</h4>
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              placeholder="Nom de la certification"
              value={newCertification.name}
              onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Organisme"
              value={newCertification.issuer}
              onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Année"
              value={newCertification.year}
              onChange={(e) => setNewCertification(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            />
          </div>
          <Button onClick={addCertification} className="mt-3" type="button">
            Ajouter la certification
          </Button>
        </Card>
      </div>
    </div>
  );
}

function AvailabilityRatesStep({ data, onChange }: { data: Partial<AnyProfile>; onChange: (updates: Partial<AnyProfile>) => void }) {
  return (
    <div className="space-y-6">
      {/* Availability modes */}
      <div>
        <Label className="text-base font-medium">Modes de travail</Label>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          {[
            { value: 'remote', label: 'À distance' },
            { value: 'on-site', label: 'Sur site' }
          ].map((mode) => (
            <label key={mode.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.availability?.modes?.includes(mode.value as any) || false}
                onChange={(e) => {
                  const modes = data.availability?.modes || [];
                  const newModes = e.target.checked
                    ? [...modes, mode.value as 'remote' | 'on-site']
                    : modes.filter(m => m !== mode.value);
                  onChange({
                    availability: { ...data.availability, modes: newModes }
                  });
                }}
              />
              <span>{mode.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Hours per week */}
      <div>
        <Label htmlFor="hoursPerWeek">Heures disponibles par semaine</Label>
        <Input
          id="hoursPerWeek"
          type="number"
          value={data.availability?.hoursPerWeek || ''}
          onChange={(e) => onChange({
            availability: { 
              ...data.availability, 
              hoursPerWeek: parseInt(e.target.value) || undefined 
            }
          })}
          placeholder="40"
        />
      </div>

      {/* Rates */}
      {data.role === 'provider' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Tarification</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rateType">Type de tarif</Label>
              <Select
                value={data.rates?.rateType}
                onValueChange={(value: 'hourly' | 'fixed') => onChange({
                  rates: { ...data.rates, rateType: value, currency: 'EUR' }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Horaire</SelectItem>
                  <SelectItem value="fixed">Forfait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="minRate">Tarif minimum (€)</Label>
              <Input
                id="minRate"
                type="number"
                value={data.rates?.min || ''}
                onChange={(e) => onChange({
                  rates: { 
                    ...data.rates, 
                    min: parseInt(e.target.value) || undefined,
                    currency: 'EUR'
                  }
                })}
                placeholder="50"
              />
            </div>

            <div>
              <Label htmlFor="maxRate">Tarif maximum (€)</Label>
              <Input
                id="maxRate"
                type="number"
                value={data.rates?.max || ''}
                onChange={(e) => onChange({
                  rates: { 
                    ...data.rates, 
                    max: parseInt(e.target.value) || undefined,
                    currency: 'EUR'
                  }
                })}
                placeholder="100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Experience (for providers) */}
      {data.role === 'provider' && (
        <div>
          <Label htmlFor="yearsExperience">Années d'expérience</Label>
          <Input
            id="yearsExperience"
            type="number"
            value={(data as any).yearsExperience || ''}
            onChange={(e) => onChange({ 
              yearsExperience: parseInt(e.target.value) || undefined 
            })}
            placeholder="5"
          />
        </div>
      )}
    </div>
  );
}

function PreferencesStep({ data, onChange }: { data: Partial<AnyProfile>; onChange: (updates: Partial<AnyProfile>) => void }) {
  return (
    <div className="space-y-6">
      {/* Visibility */}
      <div>
        <Label className="text-base font-medium">Visibilité du profil</Label>
        <div className="space-y-3 mt-2">
          {[
            { value: 'public', label: 'Public', description: 'Visible par tous les utilisateurs' },
            { value: 'private', label: 'Privé', description: 'Visible uniquement par vous' },
            { value: 'anonymized', label: 'Anonymisé', description: 'Visible mais sans informations personnelles' }
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={data.preferences?.visibility === option.value}
                onChange={(e) => onChange({
                  preferences: { 
                    ...data.preferences, 
                    visibility: e.target.value as 'public' | 'private' | 'anonymized' 
                  }
                })}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* GDPR Consent */}
      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Switch
          checked={data.preferences?.gdprConsent || false}
          onCheckedChange={(checked) => onChange({
            preferences: { ...data.preferences, gdprConsent: checked }
          })}
        />
        <div className="flex-1">
          <div className="font-medium">Consentement RGPD</div>
          <div className="text-sm text-gray-600 mt-1">
            J'accepte le traitement de mes données personnelles conformément à la politique de confidentialité.
            Ce consentement est nécessaire pour l'utilisation complète de la plateforme.
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="font-medium text-green-800 mb-2">🎉 Profil presque terminé !</h3>
        <p className="text-sm text-green-700">
          Vous êtes sur le point de finaliser votre profil. Vérifiez que toutes les informations 
          sont correctes et cliquez sur "Terminer" pour sauvegarder vos modifications.
        </p>
      </div>
    </div>
  );
}