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
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Euro, 
  Calendar, 
  User, 
  Star, 
  X, 
  Plus,
  Briefcase
} from 'lucide-react';
import type { TeamMember, TeamComposition } from '@shared/schema';

interface TeamBidFormProps {
  missionId: string;
  onSuccess: () => void;
}

export function TeamBidForm({ missionId, onSuccess }: TeamBidFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    timeline_days: '',
    message: '',
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      name: user?.name || '',
      role: 'Chef d\'équipe',
      experience: '5+ années',
      isLead: true,
      rating: 4.5
    }
  ]);

  const addTeamMember = () => {
    const newMember: TeamMember = {
      name: '',
      role: '',
      experience: '',
      isLead: false,
      rating: 4.0
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: any) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);
  };

  const removeTeamMember = (index: number) => {
    if (index === 0) return; // Ne pas supprimer le chef d'équipe
    const updatedMembers = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updatedMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour soumettre une offre',
        variant: 'destructive'
      });
      return;
    }

    // Validation
    if (!formData.amount || !formData.timeline_days || !formData.message) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    // Vérifier qu'il y a au moins 2 membres dans l'équipe
    if (teamMembers.length < 2) {
      toast({
        title: 'Erreur',
        description: 'Une équipe doit avoir au moins 2 membres',
        variant: 'destructive'
      });
      return;
    }

    // Vérifier que tous les membres ont des informations complètes
    const incompleteMembers = teamMembers.filter(member => 
      !member.name || !member.role || !member.experience
    );
    
    if (incompleteMembers.length > 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez compléter les informations de tous les membres de l\'équipe',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer la composition d'équipe
      const teamComposition: TeamComposition = {
        members: teamMembers,
        total_budget: parseInt(formData.amount),
        estimated_timeline: parseInt(formData.timeline_days),
        description: formData.message
      };

      const response = await apiRequest('POST', '/api/bids', {
        mission_id: parseInt(missionId),
        amount: formData.amount,
        timeline_days: parseInt(formData.timeline_days),
        message: formData.message,
        bid_type: 'team',
        team_composition: teamComposition,
        team_lead_id: user.id
      });

      const result = await response.json();
      
      toast({
        title: '✅ Candidature d\'équipe soumise !',
        description: `Votre équipe de ${teamMembers.length} membres a été proposée avec succès.`
      });

      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['mission-detail', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });

      onSuccess();
    } catch (error) {
      console.error('Erreur soumission candidature équipe:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de soumettre la candidature',
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
          <Users className="w-5 h-5" />
          Candidature d'équipe
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Présentez votre équipe pré-constituée pour cette mission
        </p>
      </div>

      {/* Composition de l'équipe */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Composition de l'équipe
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTeamMember}
            data-testid="button-add-member"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {teamMembers.map((member, index) => (
            <Card key={index} className={`${member.isLead ? 'ring-2 ring-purple-200 bg-purple-50' : 'bg-gray-50'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {member.isLead ? (
                      <>
                        <Star className="w-4 h-4 text-purple-600" />
                        Chef d'équipe
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        Membre {index}
                      </>
                    )}
                  </CardTitle>
                  {!member.isLead && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeamMember(index)}
                      data-testid={`button-remove-member-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Nom complet *</Label>
                    <Input
                      placeholder="Nom du membre"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      disabled={member.isLead}
                      data-testid={`input-member-name-${index}`}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Rôle/Spécialité *</Label>
                    <Input
                      placeholder="Ex: Développeur Frontend"
                      value={member.role}
                      onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                      data-testid={`input-member-role-${index}`}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Expérience *</Label>
                  <Select 
                    value={member.experience} 
                    onValueChange={(value) => updateTeamMember(index, 'experience', value)}
                  >
                    <SelectTrigger data-testid={`select-member-experience-${index}`}>
                      <SelectValue placeholder="Niveau d'expérience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 années">1-2 années</SelectItem>
                      <SelectItem value="3-5 années">3-5 années</SelectItem>
                      <SelectItem value="5+ années">5+ années</SelectItem>
                      <SelectItem value="10+ années">10+ années</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Détails de l'offre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="team-amount" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Prix total équipe (€) *
          </Label>
          <Input
            id="team-amount"
            type="number"
            placeholder="15000"
            min="100"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            data-testid="input-team-amount"
          />
          <p className="text-xs text-gray-500 mt-1">
            Montant global pour toute l'équipe
          </p>
        </div>

        <div>
          <Label htmlFor="team-timeline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Délai (jours) *
          </Label>
          <Input
            id="team-timeline"
            type="number"
            placeholder="30"
            min="1"
            value={formData.timeline_days}
            onChange={(e) => setFormData(prev => ({ ...prev, timeline_days: e.target.value }))}
            data-testid="input-team-timeline"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="team-message" className="text-base font-medium">
          Proposition détaillée *
        </Label>
        <Textarea
          id="team-message"
          placeholder="Décrivez comment votre équipe va réaliser cette mission, la répartition des tâches, votre méthodologie..."
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          data-testid="textarea-team-message"
        />
        <p className="text-xs text-gray-500 mt-1">
          Détaillez la stratégie de votre équipe pour cette mission
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Récapitulatif de l'équipe
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Membres:</span>
            <Badge variant="secondary">{teamMembers.length} personnes</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Budget total:</span>
            <Badge variant="secondary">{formData.amount || '0'}€</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Délai:</span>
            <Badge variant="secondary">{formData.timeline_days || '0'} jours</Badge>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={isSubmitting}
        data-testid="button-submit-team-bid"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Soumission en cours...
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            Soumettre la candidature d'équipe
          </>
        )}
      </Button>
    </form>
  );
}