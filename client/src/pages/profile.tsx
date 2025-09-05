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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Briefcase, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Plus,
  X,
  Camera,
  Save,
  Edit,
  Clock,
  Brain,
  Sparkles,
  Target,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';
import { ProfileCompletenessAnalyzer } from '@/components/ai/profile-completeness-analyzer';
import { TextCompletionAssistant } from '@/components/ai/text-completion-assistant';

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
    const currentValue = profileData[field];
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
    const currentValue = profileData[field];
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
    const currentValue = profileData[field];
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
    const currentValue = profileData[field];
    if (!currentValue) return;

    try {
      const sentences = currentValue.split('. ');
      const structuredText = sentences.map((sentence, index) => 
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
      const uniqueKeywords = [...new Set(newKeywords)];

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

        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <CardContent className="p-6 -mt-16 relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="relative z-10">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 shadow-lg">
                    <Camera className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-3">
                    <h2 className="text-3xl font-bold text-gray-900">{profileData.name}</h2>
                    <Badge className={`${activeProfile === 'client' ? 'bg-blue-500' : 'bg-green-500'} px-3 py-1`}>
                      {activeProfile === 'client' ? (
                        <>
                          <Briefcase className="w-4 h-4 mr-2" />
                          Client Premium
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Prestataire Certifié
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="truncate">{profileData.email}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-green-500" />
                      <span>{profileData.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{profileData.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Statistics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {activeProfile === 'provider' ? (
                    <>
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="text-2xl font-bold text-gray-900">4.9</span>
                        </div>
                        <p className="text-sm text-gray-600">127 avis clients</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Briefcase className="w-5 h-5 text-green-500" />
                          <span className="text-2xl font-bold text-gray-900">89</span>
                        </div>
                        <p className="text-sm text-gray-600">Projets réalisés</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="w-5 h-5 text-blue-500" />
                          <span className="text-2xl font-bold text-gray-900">98%</span>
                        </div>
                        <p className="text-sm text-gray-600">Taux de satisfaction</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="w-5 h-5 text-purple-500" />
                          <span className="text-2xl font-bold text-gray-900">{profileData.hourlyRate}€</span>
                        </div>
                        <p className="text-sm text-gray-600">Tarif horaire</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Briefcase className="w-5 h-5 text-blue-500" />
                          <span className="text-2xl font-bold text-gray-900">23</span>
                        </div>
                        <p className="text-sm text-gray-600">Projets publiés</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="w-5 h-5 text-green-500" />
                          <span className="text-2xl font-bold text-gray-900">156</span>
                        </div>
                        <p className="text-sm text-gray-600">Candidatures reçues</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Star className="w-5 h-5 text-purple-500" />
                          <span className="text-2xl font-bold text-gray-900">4.8</span>
                        </div>
                        <p className="text-sm text-gray-600">Note moyenne</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <span className="text-2xl font-bold text-gray-900">{profileData.industry?.split(' ')[0] || 'Tech'}</span>
                        </div>
                        <p className="text-sm text-gray-600">Secteur d'activité</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Assistant IA
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Compétences
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Disponibilités
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Préférences
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
                      <span>Compétences et Mots-clés</span>
                      <Button
                        onClick={handleAIKeywordSuggestion}
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Suggestions IA
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        {profileData.skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-sm px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200 text-blue-800 hover:from-blue-150 hover:to-purple-150 transition-all"
                          >
                            <Star className="w-3 h-3 mr-1.5 text-blue-600" />
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-2 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                        
                        {profileData.skills.length === 0 && (
                          <div className="text-gray-500 italic text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                            Aucune compétence ajoutée. Utilisez l'assistant IA pour des suggestions.
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex space-x-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Ajouter une compétence..."
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          />
                          <Button onClick={addSkill}>
                            <Plus className="w-4 h-4" />
                          </Button>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      Gérer mes disponibilités
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {isEditing ? (
                        <>
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium mb-3">Ajouter une plage horaire</h4>
                            <div className="space-y-3">
                              <div className="flex space-x-3">
                                <div className="flex-1">
                                  <Label htmlFor="availabilityStart">Début</Label>
                                  <Input
                                    id="availabilityStart"
                                    type="datetime-local"
                                    value={newAvailabilitySlot?.start.toISOString().slice(0, 16) || ''}
                                    onChange={(e) => {
                                      const date = new Date(e.target.value);
                                      setNewAvailabilitySlot(prev => ({ ...(prev || { start: new Date(), end: new Date() }), start: date }));
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor="availabilityEnd">Fin</Label>
                                  <Input
                                    id="availabilityEnd"
                                    type="datetime-local"
                                    value={newAvailabilitySlot?.end.toISOString().slice(0, 16) || ''}
                                    onChange={(e) => {
                                      const date = new Date(e.target.value);
                                      setNewAvailabilitySlot(prev => ({ ...(prev || { start: new Date(), end: new Date() }), end: date }));
                                    }}
                                  />
                                </div>
                              </div>
                              <Button onClick={addCalendarAvailability} disabled={!newAvailabilitySlot || !newAvailabilitySlot.start || !newAvailabilitySlot.end || newAvailabilitySlot.start >= newAvailabilitySlot.end}>
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter plage
                              </Button>
                            </div>
                          </div>
                          {profileData.calendarAvailability.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Plages planifiées</h4>
                              <div className="space-y-2">
                                {profileData.calendarAvailability.map((slot, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                    <span>
                                      {slot.start.toLocaleString()} - {slot.end.toLocaleString()}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => removeCalendarAvailability(index)}>
                                      <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <AvailabilityCalendar availability={profileData.calendarAvailability} />
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