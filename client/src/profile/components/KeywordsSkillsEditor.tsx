
import React, { useState, useRef } from 'react';
import { X, Plus, Lightbulb, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { normalizeTags, expandSynonyms, suggestKeywords } from '../../../shared/utils/keywords';

interface KeywordsSkillsEditorProps {
  keywords: string[];
  skills: Array<{ name: string; level?: 1|2|3|4|5; hourlyRate?: number; category?: string }>;
  onKeywordsChange: (keywords: string[]) => void;
  onSkillsChange: (skills: Array<{ name: string; level?: 1|2|3|4|5; hourlyRate?: number; category?: string }>) => void;
  suggestions?: string[];
  role: 'client' | 'provider';
}

export function KeywordsSkillsEditor({
  keywords,
  skills,
  onKeywordsChange,
  onSkillsChange,
  suggestions = [],
  role
}: KeywordsSkillsEditorProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commonSuggestions = [
    // Développement & Tech
    'développement web', 'design web', 'ui/ux', 'wordpress', 'e-commerce',
    // Marketing & Communication
    'seo', 'marketing digital', 'réseaux sociaux', 'content marketing', 'copywriting',
    // Services Professionnels
    'conseil', 'formation', 'audit', 'gestion projet', 'stratégie', 'traduction',
    // Créatif & Design
    'photographie', 'montage vidéo', 'design graphique', 'illustration', 'logo',
    // Travaux & Artisanat
    'plomberie', 'électricité', 'peinture', 'menuiserie', 'jardinage', 'rénovation',
    // Services à la personne
    'ménage', 'garde d\'enfants', 'cours particuliers', 'assistance administrative',
    // Santé & Bien-être
    'massage', 'coaching', 'nutrition', 'fitness', 'relaxation'
  ];

  const addKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    
    const normalized = normalizeTags([keyword]);
    const newKeywords = [...new Set([...keywords, ...normalized])];
    onKeywordsChange(newKeywords);
    setKeywordInput('');
  };

  const removeKeyword = (keyword: string) => {
    onKeywordsChange(keywords.filter(k => k !== keyword));
  };

  const addSkill = (skillName: string, level: 1|2|3|4|5 = 3, hourlyRate?: number, category?: string) => {
    if (!skillName.trim()) return;
    
    const normalized = normalizeTags([skillName])[0];
    const existingIndex = skills.findIndex(s => s.name === normalized);
    
    if (existingIndex >= 0) {
      // Mettre à jour la compétence existante
      const newSkills = [...skills];
      newSkills[existingIndex] = { 
        name: normalized, 
        level,
        hourlyRate: hourlyRate || newSkills[existingIndex].hourlyRate,
        category: category || newSkills[existingIndex].category
      };
      onSkillsChange(newSkills);
    } else {
      // Ajouter nouvelle compétence
      onSkillsChange([...skills, { name: normalized, level, hourlyRate, category }]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillName: string) => {
    onSkillsChange(skills.filter(s => s.name !== skillName));
  };

  const updateSkillLevel = (skillName: string, level: 1|2|3|4|5) => {
    const newSkills = skills.map(s => 
      s.name === skillName ? { ...s, level } : s
    );
    onSkillsChange(newSkills);
  };

  const getSkillLevelText = (level?: number) => {
    switch (level) {
      case 1: return 'Débutant';
      case 2: return 'Novice';
      case 3: return 'Intermédiaire';
      case 4: return 'Avancé';
      case 5: return 'Expert';
      default: return 'Non spécifié';
    }
  };

  const getSkillLevelColor = (level?: number) => {
    switch (level) {
      case 1: return 'bg-gray-100 text-gray-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSuggestionClick = (suggestion: string, type: 'keyword' | 'skill') => {
    if (type === 'keyword') {
      addKeyword(suggestion);
    } else {
      addSkill(suggestion, 3);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mots-clés Section */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Mots-clés</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggestions
              </Button>
            </div>

            {/* Input pour ajouter des mots-clés */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ajouter un mot-clé..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword(keywordInput);
                  }
                }}
              />
              <Button onClick={() => addKeyword(keywordInput)} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Mots-clés actuels */}
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200 group"
                >
                  <span className="font-medium">{keyword}</span>
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity"
                    aria-label={`Supprimer ${keyword}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {keywords.length === 0 && (
                <div className="text-gray-400 italic text-sm py-2">
                  Aucun mot-clé ajouté. Utilisez l'IA pour des suggestions !
                </div>
              )}
            </div>

            {/* Suggestions mots-clés */}
            {showSuggestions && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Suggestions populaires :</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonSuggestions
                    .filter(s => !keywords.includes(s))
                    .slice(0, 10)
                    .map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion, 'keyword')}
                        className="text-xs bg-white hover:bg-blue-100 border-blue-200 text-blue-700 hover:border-blue-300 transition-all duration-200"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                </div>
                <div className="mt-3 text-xs text-blue-600">
                  💡 Cliquez pour ajouter rapidement ces mots-clés pertinents
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compétences Section (pour prestataires) */}
      {role === 'provider' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Compétences & Niveaux</h3>

              {/* Input pour ajouter des compétences */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une compétence..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                />
                <Button onClick={() => addSkill(skillInput)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Compétences actuelles avec niveaux */}
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors duration-200 group">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-semibold text-gray-800">{skill.name}</span>
                      </div>
                      <Badge className={`${getSkillLevelColor(skill.level)} px-3 py-1 font-medium`}>
                        {getSkillLevelText(skill.level)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Sélecteur de niveau visuel amélioré */}
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => updateSkillLevel(skill.name, level as 1|2|3|4|5)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                              (skill.level || 3) >= level
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-110'
                                : 'bg-gray-200 text-gray-400 hover:bg-gray-300 hover:scale-105'
                            }`}
                            aria-label={`Niveau ${level}`}
                          >
                            <Star className={`h-3 w-3 ${(skill.level || 3) >= level ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => removeSkill(skill.name)}
                        className="text-red-400 hover:text-red-600 opacity-60 group-hover:opacity-100 transition-all duration-200 p-1 rounded-full hover:bg-red-50"
                        aria-label={`Supprimer ${skill.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {skills.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune compétence ajoutée.</p>
                    <p className="text-xs">Ajoutez vos compétences pour améliorer votre profil !</p>
                  </div>
                )}
              </div>

              {/* Suggestions compétences depuis mots-clés */}
              {keywords.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Transformer vos mots-clés en compétences :</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords
                      .filter(k => !skills.some(s => s.name === k))
                      .slice(0, 8)
                      .map((keyword, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(keyword, 'skill')}
                          className="text-xs bg-white hover:bg-green-100 border-green-200 text-green-700 hover:border-green-300 transition-all duration-200"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {keyword}
                        </Button>
                      ))}
                  </div>
                  <div className="mt-3 text-xs text-green-600">
                    🎯 Niveau par défaut : Intermédiaire (modifiable après ajout)
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
