import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Sparkles,
  Target,
  RefreshCw
} from 'lucide-react';
import { TextCompletionAssistant } from '@/components/ai/text-completion-assistant';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio?: string;
  company?: string;
  industry?: string;
  experience?: string;
}

interface ProfileGeneralInfoProps {
  profileData: ProfileData;
  activeProfile: 'client' | 'provider';
  isEditing: boolean;
  onProfileDataChange: (updater: (prev: ProfileData) => ProfileData) => void;
  onInputChange: (field: string, value: string) => void;
  onTextCompletion: (field: string) => (suggestion: string) => void;
  onAITextImprovement: (field: string) => void;
  onAIEnrichment: (field: string) => void;
  onAICallToAction: (field: string) => void;
  onAIStructure: (field: string) => void;
}

export function ProfileGeneralInfo({
  profileData,
  activeProfile,
  isEditing,
  onProfileDataChange,
  onInputChange,
  onTextCompletion,
  onAITextImprovement,
  onAIEnrichment,
  onAICallToAction,
  onAIStructure
}: ProfileGeneralInfoProps) {
  return (
    <div className="space-y-6">
      <Card data-testid="card-general-info">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informations générales</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              <Brain className="w-4 h-4 mr-1" />
              Assistant IA activé
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => onProfileDataChange(prev => ({...prev, name: e.target.value}))}
              disabled={!isEditing}
              data-testid="input-name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => onProfileDataChange(prev => ({...prev, email: e.target.value}))}
              disabled={!isEditing}
              data-testid="input-email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => onProfileDataChange(prev => ({...prev, phone: e.target.value}))}
              disabled={!isEditing}
              placeholder="+33 6 12 34 56 78"
              data-testid="input-phone"
            />
          </div>
          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => onProfileDataChange(prev => ({...prev, location: e.target.value}))}
              disabled={!isEditing}
              placeholder="Paris, France"
              data-testid="input-location"
            />
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-about">
        <CardHeader>
          <CardTitle>
            {activeProfile === 'client' ? 'À propos de votre entreprise' : 'À propos de vous'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="bio">Description</Label>
            <div className="relative">
              <Textarea
                id="bio"
                value={profileData.bio || ''}
                onChange={(e) => onInputChange('bio', e.target.value)}
                placeholder={activeProfile === 'client' 
                  ? "Décrivez votre entreprise et vos besoins..."
                  : "Présentez-vous et vos services..."
                }
                rows={4}
                disabled={!isEditing}
                data-testid="textarea-bio"
              />
              {isEditing && (
                <TextCompletionAssistant
                  inputValue={profileData.bio || ''}
                  onSuggestionApply={onTextCompletion('bio')}
                  context={{
                    field: 'bio',
                    category: 'profile',
                    userType: activeProfile
                  }}
                />
              )}
            </div>
            
            {/* AI Assistant Buttons */}
            {isEditing && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" data-testid="card-ai-assistant">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-blue-600" />
                    Assistant IA - Améliorer votre description
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => onAITextImprovement('bio')}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 hover:bg-blue-50 text-blue-700"
                      data-testid="button-ai-improve-style"
                    >
                      <Sparkles className="h-3 w-3 mr-2" />
                      Améliorer le style
                    </Button>
                    <Button
                      onClick={() => onAIEnrichment('bio')}
                      variant="outline"
                      size="sm"
                      className="border-green-200 hover:bg-green-50 text-green-700"
                      data-testid="button-ai-enrich-keywords"
                    >
                      <Target className="h-3 w-3 mr-2" />
                      Enrichir avec mots-clés
                    </Button>
                    <Button
                      onClick={() => onAICallToAction('bio')}
                      variant="outline"
                      size="sm"
                      className="border-orange-200 hover:bg-orange-50 text-orange-700"
                      data-testid="button-ai-call-to-action"
                    >
                      <Sparkles className="h-3 w-3 mr-2" />
                      Ajouter un appel à l'action
                    </Button>
                    <Button
                      onClick={() => onAIStructure('bio')}
                      variant="outline"
                      size="sm"
                      className="border-purple-200 hover:bg-purple-50 text-purple-700"
                      data-testid="button-ai-structure"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Structurer le texte
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {activeProfile === 'client' ? (
            <>
              <div>
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={profileData.company || ''}
                  onChange={(e) => onProfileDataChange(prev => ({...prev, company: e.target.value}))}
                  disabled={!isEditing}
                  placeholder="Nom de votre entreprise"
                  data-testid="input-company"
                />
              </div>
              <div>
                <Label htmlFor="industry">Secteur d'activité</Label>
                <Input
                  id="industry"
                  value={profileData.industry || ''}
                  onChange={(e) => onProfileDataChange(prev => ({...prev, industry: e.target.value}))}
                  disabled={!isEditing}
                  placeholder="Ex: Tech, Marketing, Finance..."
                  data-testid="input-industry"
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="experience">Expérience</Label>
              <Textarea
                id="experience"
                value={profileData.experience || ''}
                onChange={(e) => onProfileDataChange(prev => ({...prev, experience: e.target.value}))}
                disabled={!isEditing}
                placeholder="Décrivez votre expérience professionnelle..."
                rows={3}
                data-testid="textarea-experience"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}