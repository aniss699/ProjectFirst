import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  UsersRound, 
  Euro, 
  Calendar, 
  Globe, 
  Lock, 
  UserPlus, 
  Settings,
  Plus,
  X
} from 'lucide-react';
import type { RequiredRole } from '@shared/schema';

interface OpenTeamBidFormProps {
  missionId: string;
  onSuccess: () => void;
}

export function OpenTeamBidForm({ missionId, onSuccess }: OpenTeamBidFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimated_budget: '',
    estimated_timeline_days: '',
    max_members: '5',
    visibility: 'public' as 'public' | 'private',
    auto_accept: true
  });

  const [requiredRoles, setRequiredRoles] = useState<RequiredRole[]>([
    {
      title: '',
      description: '',
      skills: [],
      min_experience: 1,
      priority: 'medium'
    }
  ]);

  const addRequiredRole = () => {
    const newRole: RequiredRole = {
      title: '',
      description: '',
      skills: [],
      min_experience: 1,
      priority: 'medium'
    };
    setRequiredRoles([...requiredRoles, newRole]);
  };

  const updateRequiredRole = (index: number, field: keyof RequiredRole, value: any) => {
    const updatedRoles = [...requiredRoles];
    updatedRoles[index] = { ...updatedRoles[index], [field]: value };
    setRequiredRoles(updatedRoles);
  };

  const removeRequiredRole = (index: number) => {
    if (requiredRoles.length <= 1) return; // Garder au moins un rôle
    const updatedRoles = requiredRoles.filter((_, i) => i !== index);
    setRequiredRoles(updatedRoles);
  };

  const addSkillToRole = (roleIndex: number, skill: string) => {
    if (!skill.trim()) return;
    const updatedRoles = [...requiredRoles];
    const currentSkills = updatedRoles[roleIndex].skills;
    if (!currentSkills.includes(skill.trim())) {
      updatedRoles[roleIndex].skills = [...currentSkills, skill.trim()];
      setRequiredRoles(updatedRoles);
    }
  };

  const removeSkillFromRole = (roleIndex: number, skillIndex: number) => {
    const updatedRoles = [...requiredRoles];
    updatedRoles[roleIndex].skills = updatedRoles[roleIndex].skills.filter((_, i) => i !== skillIndex);
    setRequiredRoles(updatedRoles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour créer une équipe ouverte',
        variant: 'destructive'
      });
      return;
    }

    // Validation
    if (!formData.name || !formData.description || !formData.estimated_budget || !formData.estimated_timeline_days) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    // Vérifier qu'il y a au moins un rôle avec titre
    const validRoles = requiredRoles.filter(role => role.title.trim());
    if (validRoles.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez définir au moins un rôle recherché',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer l'équipe ouverte
      const response = await apiRequest('POST', '/api/open-teams', {
        mission_id: parseInt(missionId),
        name: formData.name,
        description: formData.description,
        estimated_budget: parseInt(formData.estimated_budget) * 100, // Convertir en centimes
        estimated_timeline_days: parseInt(formData.estimated_timeline_days),
        max_members: parseInt(formData.max_members),
        visibility: formData.visibility,
        auto_accept: formData.auto_accept,
        required_roles: validRoles,
        members: [
          {
            user_id: user.id,
            name: user.name,
            role: 'Initiateur',
            experience_years: 5,
            rating: 4.5,
            joined_at: new Date().toISOString()
          }
        ]
      });

      const result = await response.json();
      
      toast({
        title: '🚀 Équipe ouverte créée !',
        description: `${formData.name} est maintenant ouverte au recrutement.`
      });

      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['mission-detail', missionId] });
      queryClient.invalidateQueries({ queryKey: ['open-teams'] });

      onSuccess();
    } catch (error) {
      console.error('Erreur création équipe ouverte:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer l\'équipe ouverte',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.type !== 'provider') {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          <UsersRound className="w-5 h-5" />
          Créer une équipe ouverte
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Initiez une équipe où d'autres prestataires peuvent vous rejoindre
        </p>
      </div>

      {/* Informations de base */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="team-name" className="text-base font-medium">
            Nom de l'équipe *
          </Label>
          <Input
            id="team-name"
            placeholder="Ex: Équipe Développement Web Pro"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            data-testid="input-team-name"
          />
        </div>

        <div>
          <Label htmlFor="team-description" className="text-base font-medium">
            Description de l'équipe *
          </Label>
          <Textarea
            id="team-description"
            placeholder="Décrivez votre approche, votre vision pour cette mission..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            data-testid="textarea-team-description"
          />
        </div>
      </div>

      {/* Budget et timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estimated-budget" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Budget estimé (€) *
          </Label>
          <Input
            id="estimated-budget"
            type="number"
            placeholder="10000"
            min="100"
            value={formData.estimated_budget}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_budget: e.target.value }))}
            data-testid="input-estimated-budget"
          />
        </div>

        <div>
          <Label htmlFor="estimated-timeline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Délai estimé (jours) *
          </Label>
          <Input
            id="estimated-timeline"
            type="number"
            placeholder="45"
            min="1"
            value={formData.estimated_timeline_days}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_timeline_days: e.target.value }))}
            data-testid="input-estimated-timeline"
          />
        </div>
      </div>

      {/* Rôles recherchés */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Rôles recherchés
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRequiredRole}
            data-testid="button-add-role"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {requiredRoles.map((role, index) => (
            <Card key={index} className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Rôle {index + 1}</CardTitle>
                  {requiredRoles.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequiredRole(index)}
                      data-testid={`button-remove-role-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Titre du poste *</Label>
                    <Input
                      placeholder="Ex: Développeur React"
                      value={role.title}
                      onChange={(e) => updateRequiredRole(index, 'title', e.target.value)}
                      data-testid={`input-role-title-${index}`}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Priorité</Label>
                    <Select 
                      value={role.priority} 
                      onValueChange={(value: 'high' | 'medium' | 'low') => updateRequiredRole(index, 'priority', value)}
                    >
                      <SelectTrigger data-testid={`select-role-priority-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Description du rôle</Label>
                  <Textarea
                    placeholder="Décrivez les responsabilités et attentes..."
                    rows={2}
                    value={role.description}
                    onChange={(e) => updateRequiredRole(index, 'description', e.target.value)}
                    data-testid={`textarea-role-description-${index}`}
                  />
                </div>

                <div>
                  <Label className="text-sm">Compétences requises</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {role.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeSkillFromRole(index, skillIndex)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter une compétence..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkillToRole(index, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      data-testid={`input-role-skill-${index}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = (e.currentTarget.parentNode as HTMLElement)?.querySelector('input');
                        if (input) {
                          addSkillToRole(index, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Paramètres de l'équipe */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Paramètres de l'équipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Nombre max de membres</Label>
              <Select 
                value={formData.max_members} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, max_members: value }))}
              >
                <SelectTrigger data-testid="select-max-members">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 membres</SelectItem>
                  <SelectItem value="5">5 membres</SelectItem>
                  <SelectItem value="7">7 membres</SelectItem>
                  <SelectItem value="10">10 membres</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Visibilité</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value: 'public' | 'private') => setFormData(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger data-testid="select-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Publique
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Privée
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-accept"
              checked={formData.auto_accept}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_accept: checked }))}
              data-testid="switch-auto-accept"
            />
            <Label htmlFor="auto-accept" className="text-sm">
              Accepter automatiquement les candidatures
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Récapitulatif */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <UsersRound className="w-4 h-4" />
          Récapitulatif de l'équipe ouverte
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Nom:</span>
            <Badge variant="secondary">{formData.name || 'Non défini'}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Budget estimé:</span>
            <Badge variant="secondary">{formData.estimated_budget || '0'}€</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Membres max:</span>
            <Badge variant="secondary">{formData.max_members} personnes</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Rôles définis:</span>
            <Badge variant="secondary">{requiredRoles.filter(r => r.title).length} rôles</Badge>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-orange-600 hover:bg-orange-700"
        disabled={isSubmitting}
        data-testid="button-submit-open-team"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Création en cours...
          </>
        ) : (
          <>
            <UsersRound className="w-4 h-4 mr-2" />
            Créer l'équipe ouverte
          </>
        )}
      </Button>
    </form>
  );
}