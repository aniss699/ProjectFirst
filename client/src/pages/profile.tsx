import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Briefcase, 
  Users, 
  Edit,
  Clock,
  Star,
  Plus,
  X,
  Target,
  Brain,
  Sparkles,
  RefreshCw,
  Save,
  Zap,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';
import { ProfileCompletenessAnalyzer } from '@/components/ai/profile-completeness-analyzer';
import { TextCompletionAssistant } from '@/components/ai/text-completion-assistant';
// Refactored components
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileGeneralInfo } from '@/components/profile/ProfileGeneralInfo';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfilePortfolio } from '@/components/profile/ProfilePortfolio';
import { ProfileActions } from '@/components/profile/ProfileActions';

export default function Profile() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeProfile, setActiveProfile] = useState<'client' | 'provider'>(user?.type || 'client');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    bio: activeProfile === 'client' 
      ? 'Nous recherchons des talents créatifs pour développer nos projets innovants.'
      : 'Développeur full-stack passionné avec 5+ années d\'expérience en React, Node.js et design UX/UI.',
    skills: activeProfile === 'provider' 
      ? ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Design UX/UI', 'Figma'] 
      : [],
    experience: 'Plus de 5 années d\'expérience dans le développement web full-stack...',
    portfolio: activeProfile === 'provider' 
      ? [
          {title: 'E-commerce Platform', description: 'Application de vente en ligne complète avec paiement intégré'},
          {title: 'Dashboard Analytics', description: 'Interface d\'analytics en temps réel avec graphiques interactifs'},
          {title: 'Mobile App', description: 'Application mobile cross-platform en React Native'}
        ] 
      : [],
    availability: true,
    hourlyRate: '75',
    company: 'TechStart Solutions',
    industry: 'Technology & Innovation',
    calendarAvailability: [] as Array<{ start: Date, end: Date }>,
    keywords: [] as string[] // Added keywords state
  });

  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioItem, setNewPortfolioItem] = useState({title: '', description: ''});
  const [newAvailabilitySlot, setNewAvailabilitySlot] = useState<{ start: Date, end: Date } | undefined>(undefined); // State for new availability
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const handleAISuggestionApply = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    toast({
      title: 'Suggestion appliquée',
      description: `Le champ "${field}" a été mis à jour avec la suggestion IA.`,
    });
  };

  const handleTextCompletion = (field: string) => (text: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: text
    }));
  };

  const handleSave = () => {
    // Sauvegarder le changement de type d'utilisateur
    if (user && user.type !== activeProfile) {
      const updatedUser = { ...user, type: activeProfile };
      login(updatedUser);
    }

    toast({
      title: 'Profil sauvegardé',
      description: 'Vos informations ont été mises à jour avec succès.',
    });
    setIsEditing(false);
  };

  const handleProfileTypeChange = (newType: 'client' | 'provider') => {
    setActiveProfile(newType);
    if (user) {
      const updatedUser = { ...user, type: newType };
      login(updatedUser);
      toast({
        title: 'Mode changé',
        description: `Vous êtes maintenant en mode ${newType === 'client' ? 'Client' : 'Prestataire'}`,
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addPortfolioItem = () => {
    if (newPortfolioItem.title.trim() && newPortfolioItem.description.trim()) {
      setProfileData(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, newPortfolioItem]
      }));
      setNewPortfolioItem({title: '', description: ''});
    }
  };

  const addCalendarAvailability = () => {
    if (newAvailabilitySlot && newAvailabilitySlot.start && newAvailabilitySlot.end && newAvailabilitySlot.start < newAvailabilitySlot.end) {
      setProfileData(prev => ({
        ...prev,
        calendarAvailability: [...prev.calendarAvailability, newAvailabilitySlot]
      }));
      setNewAvailabilitySlot(undefined); // Clear the input
    }
  };

  const removeCalendarAvailability = (indexToRemove: number) => {
    setProfileData(prev => ({
      ...prev,
      calendarAvailability: prev.calendarAvailability.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Fonctions d'assistance IA
  const handleAITextImprovement = async (field: string) => {
    const currentValue = profileData[field as keyof typeof profileData];
    if (!currentValue) return;

    try {
      // Simulation d'amélioration IA
      const improvedText = currentValue + " [Version améliorée par IA - style optimisé]";
      handleInputChange(field, improvedText);

      toast({
        title: "Texte amélioré !",
        description: "Votre texte a été optimisé par l'IA.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'améliorer le texte pour le moment.",
        variant: "destructive",
      });
    }
  };

  const handleAIEnrichment = async (field: string) => {
    const currentValue = profileData[field as keyof typeof profileData];
    if (!currentValue) return;

    try {
      const keywords = activeProfile === 'provider' ? 
        ['professionnel', 'expérimenté', 'qualité', 'délais'] :
        ['partenariat', 'collaboration', 'projet', 'qualité'];

      const enrichedText = currentValue + ` Mots-clés: ${keywords.slice(0, 2).join(', ')}.`;
      handleInputChange(field, enrichedText);

      toast({
        title: "Texte enrichi !",
        description: "Des mots-clés pertinents ont été ajoutés.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enrichir le texte pour le moment.",
        variant: "destructive",
      });
    }
  };

  const handleAICallToAction = async (field: string) => {
    const currentValue = profileData[field as keyof typeof profileData];
    if (!currentValue) return;

    try {
      const cta = activeProfile === 'provider' ? 
        " Contactez-moi pour discuter de votre projet !" :
        " N'hésitez pas à nous contacter pour échanger !";

      const textWithCTA = currentValue + cta;
      handleInputChange(field, textWithCTA);

      toast({
        title: "Appel à l'action ajouté !",
        description: "Un appel à l'action engageant a été ajouté.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'appel à l'action.",
        variant: "destructive",
      });
    }
  };

  const handleAIStructure = async (field: string) => {
    const currentValue = profileData[field as keyof typeof profileData];
    if (!currentValue) return;

    try {
      const sentences = currentValue.split('. ');
      const structuredText = sentences.map((sentence: string, index: number) => 
        index === 0 ? `✓ ${sentence}` : 
        index < sentences.length - 1 ? `• ${sentence}` : sentence
      ).join('. ');

      handleInputChange(field, structuredText);

      toast({
        title: "Texte structuré !",
        description: "La structure de votre texte a été améliorée.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de structurer le texte.",
        variant: "destructive",
      });
    }
  };

  const handleAIKeywordSuggestion = async () => {
    try {
      const suggestions = activeProfile === 'provider' ? 
        ['développement web', 'react', 'nodejs', 'consultation', 'formation'] :
        ['projet digital', 'marketing', 'e-commerce', 'startup', 'innovation'];

      // Ajouter les suggestions aux mots-clés existants
      const newKeywords = [...(profileData.keywords || []), ...suggestions.slice(0, 3)];
      const uniqueKeywords = Array.from(new Set(newKeywords));

      handleInputChange('keywords', uniqueKeywords);

      toast({
        title: "Mots-clés suggérés !",
        description: `${suggestions.slice(0, 3).length} nouveaux mots-clés ajoutés par l'IA.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer des suggestions pour le moment.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
            <p className="text-gray-600">Connectez-vous pour accéder à votre profil</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </div>
          </div>

          {/* Mode Selector - Plus visible */}
          <div className="mt-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Changer de mode</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleProfileTypeChange('client')}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                    activeProfile === 'client'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Mode Client
                </button>
                <button
                  onClick={() => handleProfileTypeChange('provider')}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                    activeProfile === 'provider'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Mode Prestataire
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {activeProfile === 'client' 
                  ? 'Publiez des missions et trouvez des prestataires'
                  : 'Recherchez des missions et proposez vos services'
                }
              </p>
            </div>
          </div>
        </div>

        <ProfileHeader 
          profileData={profileData}
          activeProfile={activeProfile}
          isEditing={isEditing}
        />

        {/* Profile Content */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 md:gap-0 h-auto md:h-10 p-1">
            <TabsTrigger value="general" className="flex flex-col md:flex-row items-center justify-center px-1 md:px-3 py-2 md:py-1.5 text-xs md:text-sm min-w-0">
              <User className="w-3 h-3 md:w-4 md:h-4 md:mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <span className="text-center leading-tight">Infos</span>
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="flex flex-col md:flex-row items-center justify-center px-1 md:px-3 py-2 md:py-1.5 text-xs md:text-sm min-w-0">
              <Brain className="w-3 h-3 md:w-4 md:h-4 md:mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <span className="text-center leading-tight">IA</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex flex-col md:flex-row items-center justify-center px-1 md:px-3 py-2 md:py-1.5 text-xs md:text-sm min-w-0">
              <Briefcase className="w-3 h-3 md:w-4 md:h-4 md:mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <span className="text-center leading-tight">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex flex-col md:flex-row items-center justify-center px-1 md:px-3 py-2 md:py-1.5 text-xs md:text-sm min-w-0">
              <Briefcase className="w-3 h-3 md:w-4 md:h-4 md:mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <span className="text-center leading-tight">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex flex-col md:flex-row items-center justify-center px-1 md:px-3 py-2 md:py-1.5 text-xs md:text-sm min-w-0">
              <Clock className="w-3 h-3 md:w-4 md:h-4 md:mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <span className="text-center leading-tight">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex flex-col md:flex-row items-center justify-center px-1 md:px-3 py-2 md:py-1.5 text-xs md:text-sm min-w-0">
              <Star className="w-3 h-3 md:w-4 md:h-4 md:mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <span className="text-center leading-tight">Prefs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-analysis">
            <ProfileCompletenessAnalyzer
              userProfile={profileData}
              userType={activeProfile}
              onApplySuggestion={handleAISuggestionApply}
            />
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
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
                    onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                    disabled={!isEditing}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({...prev, location: e.target.value}))}
                    disabled={!isEditing}
                    placeholder="Paris, France"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
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
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder={activeProfile === 'client' 
                        ? "Décrivez votre entreprise et vos besoins..."
                        : "Présentez-vous et vos services..."
                      }
                      rows={4}
                      disabled={!isEditing}
                    />
                    {isEditing && (
                      <TextCompletionAssistant
                        inputValue={profileData.bio}
                        onSuggestionApply={handleTextCompletion('bio')}
                        context={{
                          field: 'bio',
                          category: 'profile',
                          userType: activeProfile
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Boutons d'assistance IA visibles */}
                  {isEditing && (
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Brain className="h-4 w-4 text-blue-600" />
                          Assistant IA - Améliorer votre description
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleAITextImprovement('bio')}
                            variant="outline"
                            size="sm"
                            className="border-blue-200 hover:bg-blue-50 text-blue-700"
                          >
                            <Sparkles className="h-3 w-3 mr-2" />
                            Améliorer le style
                          </Button>
                          <Button
                            onClick={() => handleAIEnrichment('bio')}
                            variant="outline"
                            size="sm"
                            className="border-green-200 hover:bg-green-50 text-green-700"
                          >
                            <Target className="h-3 w-3 mr-2" />
                            Enrichir avec mots-clés
                          </Button>
                          <Button
                            onClick={() => handleAICallToAction('bio')}
                            variant="outline"
                            size="sm"
                            className="border-orange-200 hover:bg-orange-50 text-orange-700"
                          >
                            <Zap className="h-3 w-3 mr-2" />
                            Ajouter un appel à l'action
                          </Button>
                          <Button
                            onClick={() => handleAIStructure('bio')}
                            variant="outline"
                            size="sm"
                            className="border-purple-200 hover:bg-purple-50 text-purple-700"
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
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({...prev, company: e.target.value}))}
                        disabled={!isEditing}
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Secteur d'activité</Label>
                      <Input
                        id="industry"
                        value={profileData.industry}
                        onChange={(e) => setProfileData(prev => ({...prev, industry: e.target.value}))}
                        disabled={!isEditing}
                        placeholder="Ex: Tech, Marketing, Finance..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <Label htmlFor="experience">Expérience</Label>
                      <Textarea
                        id="experience"
                        value={profileData.experience}
                        onChange={(e) => setProfileData(prev => ({...prev, experience: e.target.value}))}
                        disabled={!isEditing}
                        placeholder="Décrivez votre expérience professionnelle..."
                        rows={3}
                      />
                      
                      {/* Assistant IA pour l'expérience */}
                      {isEditing && (
                        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">IA - Optimiser votre expérience</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => handleAITextImprovement('experience')}
                                variant="outline"
                                size="sm"
                                className="border-green-200 hover:bg-green-50 text-green-700"
                              >
                                <Sparkles className="h-3 w-3 mr-2" />
                                Perfectionner
                              </Button>
                              <Button
                                onClick={() => handleAIEnrichment('experience')}
                                variant="outline"
                                size="sm"
                                className="border-blue-200 hover:bg-blue-50 text-blue-700"
                              >
                                <Target className="h-3 w-3 mr-2" />
                                Ajouter expertise
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Tarif horaire (€)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={profileData.hourlyRate}
                        onChange={(e) => setProfileData(prev => ({...prev, hourlyRate: e.target.value}))}
                        disabled={!isEditing}
                        placeholder="50"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {activeProfile === 'provider' && (
            <>
              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Compétences et Expertise</span>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAIKeywordSuggestion}
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Suggestions IA
                        </Button>
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Analyser compétences
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Statistiques des compétences */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-700">{profileData.skills.length}</div>
                          <div className="text-sm text-blue-600">Compétences</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-700">
                            {Math.round(profileData.skills.length > 0 ? (profileData.skills.length / 10) * 100 : 0)}%
                          </div>
                          <div className="text-sm text-green-600">Complétude</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-700">
                            {profileData.skills.filter(skill => ['React', 'Node.js', 'TypeScript', 'Python'].includes(skill)).length}
                          </div>
                          <div className="text-sm text-purple-600">Tech populaires</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-orange-700">A+</div>
                          <div className="text-sm text-orange-600">Score marché</div>
                        </div>
                      </div>

                      {/* Liste des compétences avec niveaux */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          Mes compétences
                        </h4>
                        
                        {profileData.skills.length > 0 ? (
                          <div className="space-y-3">
                            {profileData.skills.map((skill, index) => {
                              const skillLevel = Math.floor(Math.random() * 5) + 1; // Simulation niveau
                              const skillDemand = Math.floor(Math.random() * 40) + 60; // Simulation demande marché
                              
                              return (
                                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all group">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      <span className="font-semibold text-gray-800">{skill}</span>
                                      <Badge variant="outline" className="text-xs">
                                        Demande: {skillDemand}%
                                      </Badge>
                                    </div>
                                    {isEditing && (
                                      <button
                                        onClick={() => removeSkill(skill)}
                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-gray-600">Niveau:</span>
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                          <Star
                                            key={level}
                                            className={`w-4 h-4 ${
                                              level <= skillLevel 
                                                ? 'text-yellow-400 fill-current' 
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-gray-600">Tarif suggéré</div>
                                      <div className="font-semibold text-green-600">
                                        {45 + skillLevel * 10}€/h
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                      <span>Demande marché</span>
                                      <span>{skillDemand}%</span>
                                    </div>
                                    <Progress value={skillDemand} className="h-2" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-2">Aucune compétence ajoutée</p>
                            <p className="text-sm text-gray-500">Ajoutez vos compétences pour améliorer votre visibilité</p>
                          </div>
                        )}
                      </div>

                      {/* Formulaire d'ajout */}
                      {isEditing && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-800 mb-3">Ajouter une compétence</h4>
                          <div className="flex space-x-2">
                            <Input
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Ex: React, Design UX/UI, Gestion de projet..."
                              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                              className="flex-1"
                            />
                            <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Suggestions rapides */}
                          <div className="mt-3">
                            <p className="text-xs text-blue-600 mb-2">Suggestions populaires:</p>
                            <div className="flex flex-wrap gap-2">
                              {['JavaScript', 'Python', 'Design UI/UX', 'Marketing Digital', 'SEO', 'WordPress'].map((suggestion) => (
                                <Button
                                  key={suggestion}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setNewSkill(suggestion);
                                    addSkill();
                                  }}
                                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-100"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommandations IA */}
                      {!isEditing && profileData.skills.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                            <Brain className="h-4 w-4 mr-2" />
                            Recommandations IA
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-purple-700">
                              <Target className="h-3 w-3 mr-2" />
                              Ajoutez "TypeScript" pour +15% de visibilité
                            </div>
                            <div className="flex items-center text-purple-700">
                              <TrendingUp className="h-3 w-3 mr-2" />
                              "Cloud Computing" est en forte demande (+40%)
                            </div>
                            <div className="flex items-center text-purple-700">
                              <Zap className="h-3 w-3 mr-2" />
                              Votre profil correspond à 85% des missions tech
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {profileData.portfolio.map((item, index) => (
                          <Card key={index} className="border">
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{item.title}</h4>
                              <p className="text-gray-600 text-sm">{item.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {isEditing && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <h4 className="font-medium mb-3">Ajouter un projet</h4>
                          <div className="space-y-3">
                            <Input
                              value={newPortfolioItem.title}
                              onChange={(e) => setNewPortfolioItem(prev => ({...prev, title: e.target.value}))}
                              placeholder="Titre du projet"
                            />
                            <Textarea
                              value={newPortfolioItem.description}
                              onChange={(e) => setNewPortfolioItem(prev => ({...prev, description: e.target.value}))}
                              placeholder="Description du projet"
                              rows={3}
                            />
                            <Button onClick={addPortfolioItem}>
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability" className="space-y-6">
                {/* Vue d'ensemble des disponibilités */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-700 mb-1">
                        {profileData.calendarAvailability.length}
                      </div>
                      <div className="text-sm text-green-600">Créneaux libres</div>
                      <div className="text-xs text-green-500 mt-1">cette semaine</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700 mb-1">32h</div>
                      <div className="text-sm text-blue-600">Disponibles</div>
                      <div className="text-xs text-blue-500 mt-1">ce mois-ci</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-700 mb-1">
                        {profileData.availability ? 'ON' : 'OFF'}
                      </div>
                      <div className="text-sm text-purple-600">Statut</div>
                      <div className="text-xs text-purple-500 mt-1">
                        {profileData.availability ? 'Disponible' : 'Indisponible'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Statut de disponibilité global */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-600" />
                        Statut de disponibilité
                      </div>
                      <Switch
                        checked={profileData.availability}
                        onCheckedChange={(checked) => setProfileData(prev => ({...prev, availability: checked}))}
                        disabled={!isEditing}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border ${
                        profileData.availability 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {profileData.availability ? '✅ Disponible pour nouveaux projets' : '⏸️ Indisponible'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {profileData.availability 
                                ? 'Votre profil est visible aux clients potentiels'
                                : 'Votre profil est masqué des recherches'
                              }
                            </p>
                          </div>
                          {profileData.availability && (
                            <Badge className="bg-green-100 text-green-800">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              En ligne
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Planning intelligent */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center">
                            <Target className="h-4 w-4 mr-2 text-blue-500" />
                            Planning intelligent
                          </h4>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                // Simulation de créneaux optimaux
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setHours(9, 0, 0, 0);
                                const endTime = new Date(tomorrow);
                                endTime.setHours(17, 0, 0, 0);
                                
                                setNewAvailabilitySlot({ start: tomorrow, end: endTime });
                                if (isEditing) addCalendarAvailability();
                              }}
                              disabled={!isEditing}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Ajouter demain (9h-17h)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              disabled={!isEditing}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Créneaux récurrents
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              disabled={!isEditing}
                            >
                              <Brain className="h-4 w-4 mr-2" />
                              IA: Optimiser planning
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                            Recommandations
                          </h4>
                          <div className="text-sm space-y-2">
                            <div className="flex items-center text-green-700 bg-green-50 p-2 rounded">
                              <Lightbulb className="h-3 w-3 mr-2" />
                              Les matinées sont 40% plus demandées
                            </div>
                            <div className="flex items-center text-blue-700 bg-blue-50 p-2 rounded">
                              <TrendingUp className="h-3 w-3 mr-2" />
                              Mardi-Jeudi: peak de demandes
                            </div>
                            <div className="flex items-center text-purple-700 bg-purple-50 p-2 rounded">
                              <Target className="h-3 w-3 mr-2" />
                              +25% de tarif en urgence possible
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gestion des créneaux */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Gestion des créneaux</span>
                      {isEditing && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            // Quick add: demain 9h-17h
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(9, 0, 0, 0);
                            const endTime = new Date(tomorrow);
                            endTime.setHours(17, 0, 0, 0);
                            setNewAvailabilitySlot({ start: tomorrow, end: endTime });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajout rapide
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Formulaire d'ajout amélioré */}
                      {isEditing && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium mb-4 text-blue-800">Nouveau créneau de disponibilité</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="availabilityStart" className="text-sm font-medium text-gray-700">
                                Date et heure de début
                              </Label>
                              <Input
                                id="availabilityStart"
                                type="datetime-local"
                                value={newAvailabilitySlot?.start.toISOString().slice(0, 16) || ''}
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  setNewAvailabilitySlot(prev => ({ ...(prev || { start: new Date(), end: new Date() }), start: date }));
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="availabilityEnd" className="text-sm font-medium text-gray-700">
                                Date et heure de fin
                              </Label>
                              <Input
                                id="availabilityEnd"
                                type="datetime-local"
                                value={newAvailabilitySlot?.end.toISOString().slice(0, 16) || ''}
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  setNewAvailabilitySlot(prev => ({ ...(prev || { start: new Date(), end: new Date() }), end: date }));
                                }}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const today = new Date();
                                  today.setHours(9, 0, 0, 0);
                                  const end = new Date(today);
                                  end.setHours(17, 0, 0, 0);
                                  setNewAvailabilitySlot({ start: today, end });
                                }}
                              >
                                Aujourd'hui 9h-17h
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  tomorrow.setHours(9, 0, 0, 0);
                                  const end = new Date(tomorrow);
                                  end.setHours(17, 0, 0, 0);
                                  setNewAvailabilitySlot({ start: tomorrow, end });
                                }}
                              >
                                Demain 9h-17h
                              </Button>
                            </div>
                            
                            <Button 
                              onClick={addCalendarAvailability} 
                              disabled={!newAvailabilitySlot || !newAvailabilitySlot.start || !newAvailabilitySlot.end || newAvailabilitySlot.start >= newAvailabilitySlot.end}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter créneau
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Liste des créneaux */}
                      {profileData.calendarAvailability.length > 0 ? (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-green-500" />
                            Mes créneaux de disponibilité ({profileData.calendarAvailability.length})
                          </h4>
                          <div className="space-y-3">
                            {profileData.calendarAvailability.map((slot, index) => {
                              const duration = Math.round((slot.end.getTime() - slot.start.getTime()) / (1000 * 60 * 60));
                              const isToday = slot.start.toDateString() === new Date().toDateString();
                              const isPast = slot.end < new Date();
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`p-4 rounded-lg border transition-all group ${
                                    isPast 
                                      ? 'bg-gray-50 border-gray-200 opacity-50' 
                                      : isToday 
                                        ? 'bg-green-50 border-green-300 shadow-md' 
                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                          isPast ? 'bg-gray-400' : isToday ? 'bg-green-500' : 'bg-blue-500'
                                        }`}></div>
                                        <div>
                                          <div className="font-semibold text-gray-800">
                                            {slot.start.toLocaleDateString('fr-FR', { 
                                              weekday: 'long', 
                                              day: 'numeric', 
                                              month: 'long' 
                                            })}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {slot.start.toLocaleTimeString('fr-FR', { 
                                              hour: '2-digit', 
                                              minute: '2-digit' 
                                            })} - {slot.end.toLocaleTimeString('fr-FR', { 
                                              hour: '2-digit', 
                                              minute: '2-digit' 
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      <div className="text-right">
                                        <div className="text-sm font-medium text-gray-700">
                                          {duration}h disponibles
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {isToday && 'Aujourd\'hui'}
                                          {isPast && 'Passé'}
                                        </div>
                                      </div>
                                      
                                      {isEditing && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeCalendarAvailability(index)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">Aucun créneau de disponibilité défini</p>
                          <p className="text-sm text-gray-500">
                            {isEditing 
                              ? 'Ajoutez vos créneaux pour que les clients puissent vous contacter'
                              : 'Activez le mode édition pour gérer vos disponibilités'
                            }
                          </p>
                        </div>
                      )}

                      {/* Calendrier intégré en mode lecture */}
                      {!isEditing && (
                        <div className="border-t pt-6">
                          <AvailabilityCalendar 
                            readOnly={true}
                            initialAvailability={[]}
                            onSave={(availability) => {
                              setProfileData(prev => ({
                                ...prev,
                                calendarAvailability: []
                              }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Préférences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProfile === 'provider' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Disponible pour de nouveaux projets</h4>
                      <p className="text-sm text-gray-600">Afficher votre profil aux clients</p>
                    </div>
                    <Switch
                      checked={profileData.availability}
                      onCheckedChange={(checked) => setProfileData(prev => ({...prev, availability: checked}))}
                      disabled={!isEditing}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <div className="flex justify-between items-center mt-8">
            <Button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              variant="outline"
              className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
            >
              <Brain className="w-4 h-4 mr-2" />
              {showAIAssistant ? 'Masquer' : 'Afficher'} l'Assistant IA
            </Button>
            
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 shadow-lg">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les modifications
            </Button>
          </div>
        )}

        {/* Assistant IA flottant */}
        {showAIAssistant && isEditing && (
          <Card className="mt-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Brain className="h-5 w-5" />
                Assistant IA Global
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleAIKeywordSuggestion}
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50 text-purple-700"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Suggérer mots-clés
                </Button>
                <Button
                  onClick={() => handleAITextImprovement('bio')}
                  variant="outline"
                  className="border-blue-200 hover:bg-blue-50 text-blue-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Améliorer description
                </Button>
                <Button
                  onClick={() => handleAIEnrichment('bio')}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50 text-green-700"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Enrichir profil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}