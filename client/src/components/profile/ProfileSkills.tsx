import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain,
  Star,
  Plus,
  X,
  Euro
} from 'lucide-react';

interface Skill {
  name: string;
  hourlyRate?: number;
  category?: string;
}

interface ProfileSkillsProps {
  skills: Skill[];
  newSkill: string;
  newSkillRate: number;
  newSkillCategory: string;
  isEditing: boolean;
  onNewSkillChange: (value: string) => void;
  onNewSkillRateChange: (rate: number) => void;
  onNewSkillCategoryChange: (category: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skillName: string) => void;
  onUpdateSkillRate: (skillName: string, rate: number) => void;
  onAIKeywordSuggestion: () => void;
}

const skillCategories = [
  { value: 'web-development', label: 'Développement Web' },
  { value: 'mobile-development', label: 'Développement Mobile' },
  { value: 'design', label: 'Design & Créatif' },
  { value: 'marketing', label: 'Marketing & Communication' },
  { value: 'writing', label: 'Rédaction & Contenu' },
  { value: 'consulting', label: 'Conseil & Stratégie' },
  { value: 'data-science', label: 'Data & Analyse' },
  { value: 'translation', label: 'Traduction & Langues' },
  { value: 'photography', label: 'Photo & Vidéo' },
  { value: 'construction', label: 'Travaux & Construction' },
  { value: 'repair', label: 'Réparation & Maintenance' },
  { value: 'cleaning', label: 'Ménage & Entretien' },
  { value: 'tutoring', label: 'Formation & Enseignement' },
  { value: 'health', label: 'Santé & Bien-être' },
  { value: 'legal', label: 'Juridique & Administratif' },
  { value: 'accounting', label: 'Comptabilité & Finance' },
  { value: 'other', label: 'Autres Services' }
];

const getCategoryColor = (category: string) => {
  const colors = {
    'web-development': 'bg-blue-100 text-blue-800 border-blue-200',
    'mobile-development': 'bg-green-100 text-green-800 border-green-200',
    'design': 'bg-purple-100 text-purple-800 border-purple-200',
    'marketing': 'bg-orange-100 text-orange-800 border-orange-200',
    'writing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'consulting': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'data-science': 'bg-teal-100 text-teal-800 border-teal-200',
    'translation': 'bg-pink-100 text-pink-800 border-pink-200',
    'photography': 'bg-red-100 text-red-800 border-red-200',
    'construction': 'bg-amber-100 text-amber-800 border-amber-200',
    'repair': 'bg-gray-100 text-gray-800 border-gray-200',
    'cleaning': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'tutoring': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'health': 'bg-rose-100 text-rose-800 border-rose-200',
    'legal': 'bg-slate-100 text-slate-800 border-slate-200',
    'accounting': 'bg-lime-100 text-lime-800 border-lime-200',
    'other': 'bg-neutral-100 text-neutral-800 border-neutral-200'
  };
  return colors[category as keyof typeof colors] || colors.other;
};

export function ProfileSkills({
  skills,
  newSkill,
  newSkillRate,
  newSkillCategory,
  isEditing,
  onNewSkillChange,
  onNewSkillRateChange,
  onNewSkillCategoryChange,
  onAddSkill,
  onRemoveSkill,
  onUpdateSkillRate,
  onAIKeywordSuggestion
}: ProfileSkillsProps) {
  return (
    <Card data-testid="card-skills">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Compétences et Tarifs</span>
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
          <div className="space-y-3" data-testid="skills-list">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${getCategoryColor(skill.category || 'other')} transition-all hover:shadow-sm`}
                data-testid={`skill-item-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">{skill.name}</span>
                    {skill.category && (
                      <Badge variant="outline" className="text-xs">
                        {skillCategories.find(c => c.value === skill.category)?.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {skill.hourlyRate && (
                      <div className="flex items-center text-sm font-medium">
                        <Euro className="w-3 h-3 mr-1" />
                        {skill.hourlyRate}€/h
                      </div>
                    )}
                    {isEditing && (
                      <>
                        <Input
                          type="number"
                          value={skill.hourlyRate || ''}
                          onChange={(e) => onUpdateSkillRate(skill.name, parseInt(e.target.value) || 0)}
                          placeholder="€/h"
                          className="w-20 h-8 text-xs"
                        />
                        <button
                          onClick={() => onRemoveSkill(skill.name)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          data-testid={`button-remove-skill-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {skills.length === 0 && (
              <div className="text-gray-500 italic text-sm bg-gray-50 px-4 py-8 rounded-lg border border-gray-200 text-center" data-testid="empty-skills">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Aucune compétence ajoutée.</p>
                <p className="text-xs mt-1">Ajoutez vos compétences et définissez vos tarifs.</p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="bg-gray-50 p-4 rounded-lg border" data-testid="add-skill-form">
              <h4 className="font-medium mb-3">Ajouter une compétence</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  value={newSkill}
                  onChange={(e) => onNewSkillChange(e.target.value)}
                  placeholder="Nom de la compétence..."
                  onKeyPress={(e) => e.key === 'Enter' && onAddSkill()}
                  data-testid="input-new-skill"
                  className="md:col-span-2"
                />
                <Select value={newSkillCategory} onValueChange={onNewSkillCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={newSkillRate || ''}
                    onChange={(e) => onNewSkillRateChange(parseInt(e.target.value) || 0)}
                    placeholder="€/h"
                    className="flex-1"
                  />
                  <Button onClick={onAddSkill} data-testid="button-add-skill">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}