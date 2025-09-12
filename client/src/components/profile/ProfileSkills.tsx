import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Star,
  Plus,
  X
} from 'lucide-react';

interface ProfileSkillsProps {
  skills: string[];
  newSkill: string;
  isEditing: boolean;
  onNewSkillChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  onAIKeywordSuggestion: () => void;
}

export function ProfileSkills({
  skills,
  newSkill,
  isEditing,
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
  onAIKeywordSuggestion
}: ProfileSkillsProps) {
  return (
    <Card data-testid="card-skills">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Compétences et Mots-clés</span>
          <Button
            onClick={onAIKeywordSuggestion}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700"
            data-testid="button-ai-suggestions"
          >
            <Brain className="h-4 w-4 mr-2" />
            Suggestions IA
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3" data-testid="skills-list">
            {skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-sm px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200 text-blue-800 hover:from-blue-150 hover:to-purple-150 transition-all"
                data-testid={`skill-badge-${index}`}
              >
                <Star className="w-3 h-3 mr-1.5 text-blue-600" />
                {skill}
                {isEditing && (
                  <button
                    onClick={() => onRemoveSkill(skill)}
                    className="ml-2 hover:text-red-500 transition-colors"
                    data-testid={`button-remove-skill-${index}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
            
            {skills.length === 0 && (
              <div className="text-gray-500 italic text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-200" data-testid="empty-skills">
                Aucune compétence ajoutée. Utilisez l'assistant IA pour des suggestions.
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex space-x-2" data-testid="add-skill-form">
              <Input
                value={newSkill}
                onChange={(e) => onNewSkillChange(e.target.value)}
                placeholder="Ajouter une compétence..."
                onKeyPress={(e) => e.key === 'Enter' && onAddSkill()}
                data-testid="input-new-skill"
              />
              <Button onClick={onAddSkill} data-testid="button-add-skill">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}