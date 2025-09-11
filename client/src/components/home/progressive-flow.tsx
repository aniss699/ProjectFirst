import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Lightbulb,
  Target,
  Euro,
  MapPin,
  Clock,
  Users,
  Sparkles,
  Zap,
  Brain,
  Rocket,
  ChevronLeft,
  Calendar
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useMissionCreation } from '@/hooks/use-mission-creation';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, connectionCategories, getCategoryDynamicFields, type DynamicField } from '@/lib/categories';
import { SimpleAIEnhancement } from '@/components/ai/simple-ai-enhancement';
import { TextSuggestionButton } from '@/components/ai/text-suggestion-button';
import { AIFeedbackButtons } from '@/components/ai/feedback-buttons';
import { InteractiveMap } from '@/components/location/interactive-map';
import { TeamMissionCreator } from '@/components/missions/team-mission-creator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GeoSearch } from '@/components/location/geo-search';
import { queryClient } from '@tanstack/react-query';
import type { TeamRequirement } from '../../../shared/schema';

type UserType = 'client' | 'prestataire' | null;
type ServiceType = 'mise-en-relation' | 'appel-offres' | null;

interface ProgressiveFlowProps {
  onComplete?: (data: any) => void;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ProgressiveFlow({ onComplete, onSubmit, isLoading: externalLoading, error: externalError }: ProgressiveFlowProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { createMission, createTeamProject, isLoading: hookLoading, error: hookError } = useMissionCreation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use external loading/error if provided, otherwise use hook's
  const isCreating = externalLoading !== undefined ? externalLoading : hookLoading;
  const currentError = externalError !== undefined ? externalError : hookError;
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const [isTeamMode, setIsTeamMode] = useState(false); // State pour le mode équipe
  const [userType, setUserType] = useState<UserType>(null);
  const [serviceType, setServiceType] = useState<ServiceType>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    requirements: '',
    location: {
      address: '',
      lat: null as number | null,
      lng: null as number | null,
      radius: 10
    },
    needsLocation: false
  });

  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(false);
  const [textSuggestionFeedback, setTextSuggestionFeedback] = useState<{[key: string]: boolean}>({});

  const updateFormData = (newData: Partial<typeof projectData>) => {
    setProjectData(prev => ({ ...prev, ...newData }));
  };

  const handleMissionCreation = async () => {
    // Validation finale simple
    if (!projectData.title?.trim() || projectData.title.trim().length < 3) {
      toast({
        title: "Titre requis",
        description: "Le titre doit contenir au moins 3 caractères",
        variant: "destructive"
      });
      return { ok: false, error: "Titre invalide" };
    }

    if (!projectData.description?.trim() || projectData.description.trim().length < 10) {
      toast({
        title: "Description requise",
        description: "La description doit contenir au moins 10 caractères",
        variant: "destructive"
      });
      return { ok: false, error: "Description invalide" };
    }

    // Données avec valeurs par défaut optimales
    const missionData = {
      title: projectData.title.trim(),
      description: projectData.description.trim(),
      category: projectData.category || 'developpement',
      budget: parseInt(projectData.budget) || 1000,
      location: projectData.location.address || 'Remote', // Utiliser l'adresse du lieu ou 'Remote'
      isTeamMode: projectData.isTeamMode,
      requirements: projectData.requirements?.trim()
    };

    console.log('🚀 Mission création simplifiée:', missionData);

    // Création via le hook centralisé
    const result = isTeamMode
      ? await createTeamProject(missionData)
      : await createMission(missionData);


    if (result.ok && result.id) {
      // Success toast géré par le hook
      console.log('✅ Mission créée avec ID:', result.id);

      // Callback personnalisé si fourni
      if (onSubmit) {
        onSubmit(result);
      } else {
        // Redirection par défaut vers Mes Missions
        setLocation('/missions');
      }
    } else {
      // L'erreur est déjà affichée par le hook useMissionCreation ou le hook useToast
      console.error('Erreur lors de la création de la mission:', result.error);
    }

    return result;
  };

  const handleSubmit = async () => {
    try {
      await handleMissionCreation();
    } catch (error) {
      console.error('Erreur inattendue lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Function to get Lucide icon component from icon name
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')
    ];
    return IconComponent || LucideIcons.Briefcase;
  };

  // Animation d'entrée pour chaque étape
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force un re-render pour les animations CSS
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Étape -1 (Niveau 0): Présentation de Swideal
  const renderStepMinus1 = () => (
    <div className="text-center space-y-3 max-w-3xl mx-auto">
      <div className="space-y-3 animate-fade-in">
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-200">
          <div className="text-center mb-3">
            <p className="text-base md:text-lg text-gray-900 font-semibold mb-1">
              <span className="text-blue-600">Swideal</span> place le client au cœur du modèle.
            </p>
            <p className="text-sm text-gray-600">
              Notre approche repose sur deux leviers puissants :
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3 border-l-3 border-blue-500">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 flex items-center justify-center">
                <span className="inline-block w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-2 font-bold">1</span>
                L'enchère inversée
              </h3>
              <p className="text-xs md:text-sm text-gray-700 leading-snug">
                Le client décrit son besoin et les prestataires rivalisent pour offrir le meilleur deal.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border-l-3 border-green-500 text-center">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 flex items-center justify-center">
                <span className="inline-block w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center mr-2 font-bold">2</span>
                La mise en relation stratégique
              </h3>
              <p className="text-xs md:text-sm text-gray-700 leading-snug">
                Connectez-vous directement à la bonne personne grâce aux réseaux et connaissances partagées.
                <br />
                Toi aussi, valorise ton réseau
              </p>
            </div>
          </div>

          <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs md:text-sm text-gray-800 leading-snug text-center">
              <strong>Swideal</strong> transforme la mise en relation en véritable <strong>art du deal</strong>.
            </p>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => setCurrentStep(0)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
        size="lg"
      >
        🚀 Démarrer
      </Button>
    </div>
  );

  // Étape 0: Choix du type d'utilisateur
  const renderStep0 = () => (
    <div className="text-center space-y-3">
      <div className="space-y-2 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 animate-bounce-in progressive-flow-title" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
          Créez votre mission en quelques clics
        </h2>
        <p className="text-gray-600 animate-slide-up progressive-flow-description" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
          Publiez votre projet et recevez des propositions de <span className="text-green-600 font-semibold">prestataires</span> qualifiés
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto progressive-flow-grid">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 group card-shine progressive-flow-card ${
            userType === 'client' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-blue-50/30'
          } ${clickedCard === 'client' ? 'scale-95 ring-4 ring-blue-400 bg-blue-100 animate-pulse-glow' : ''}`}
          onClick={() => {
            setUserType('client');
            setClickedCard('client');
            setTimeout(() => {
              setCurrentStep(1);
              setClickedCard(null);
            }, 400);
          }}
        >
          <CardContent className="p-6 text-center">
            <Users className={`w-12 h-12 mx-auto mb-4 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
              clickedCard === 'client' ? 'scale-125 animate-pulse text-blue-800' : ''
            }`} />
            <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>👨‍💼 <span className="text-gray-900">Je suis</span> <span className="text-blue-600">Client</span></h3>
            <h4 className="text-lg font-medium text-gray-900 mb-3" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
              Trouvez le <span className="text-green-600 font-semibold">prestataire</span> idéal pour vos projets
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              AppelsPro révolutionne la mise en relation entre <span className="text-blue-600 font-medium">clients</span> et <span className="text-green-600 font-medium">prestataires</span>. 
              Publiez votre projet et recevez des devis personnalisés en quelques heures.
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 group card-shine progressive-flow-card ${
            userType === 'prestataire' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-green-50/30'
          } ${clickedCard === 'prestataire' ? 'scale-95 ring-4 ring-green-400 bg-green-100 animate-pulse-glow' : ''}`}
          onClick={() => {
            setUserType('prestataire');
            setClickedCard('prestataire');
            setTimeout(() => {
              setCurrentStep(1);
              setClickedCard(null);
            }, 400);
          }}
        >
          <CardContent className="p-6 text-center">
            <Zap className={`w-12 h-12 mx-auto mb-4 text-green-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
              clickedCard === 'prestataire' ? 'scale-125 animate-pulse text-green-800' : ''
            }`} />
            <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>🛠️ <span className="text-gray-900">Je suis</span> <span className="text-green-600">Prestataire</span></h3>
            <h4 className="text-lg font-medium text-gray-900 mb-3" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
              Développez votre activité en tant que pro
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Accédez à de nouvelles opportunités business sans prospection.
              Répondez aux appels d'offres qui correspondent à vos compétences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Étape 1: Choix du type de service
  const renderStep1 = () => (
    <div className="text-center space-y-3">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 progressive-flow-title">
          Comment souhaitez-vous procéder ?
        </h2>
        <p className="text-gray-600 progressive-flow-description">
          Sélectionnez la méthode qui vous convient le mieux
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto progressive-flow-grid">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 group card-shine progressive-flow-card ${
            serviceType === 'mise-en-relation' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-purple-50/30'
          } ${clickedCard === 'mise-en-relation' ? 'scale-95 ring-4 ring-purple-400 bg-purple-100 animate-pulse-glow' : ''}`}
          onClick={() => {
            setServiceType('mise-en-relation');
            setClickedCard('mise-en-relation');
            setTimeout(() => {
              setCurrentStep(2);
              setClickedCard(null);
            }, 400);
          }}
        >
          <CardContent className="p-6 text-center">
            <Zap className={`w-12 h-12 mx-auto mb-4 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
              clickedCard === 'mise-en-relation' ? 'scale-125 animate-pulse text-purple-800' : ''
            }`} />
            <h3 className="text-xl font-semibold mb-2">Mise en relation</h3>
            <p className="text-gray-600 mb-4">
              Contact direct avec des prestataires sélectionnés
            </p>
            <div className="space-y-2">
              <Badge variant="secondary">Contact immédiat</Badge>
              <Badge variant="secondary">Profils vérifiés</Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 group card-shine progressive-flow-card ${
            serviceType === 'appel-offres' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-orange-50/30'
          } ${clickedCard === 'appel-offres' ? 'scale-95 ring-4 ring-orange-400 bg-orange-100 animate-pulse-glow' : ''}`}
          onClick={() => {
            setServiceType('appel-offres');
            setClickedCard('appel-offres');
            setTimeout(() => {
              setCurrentStep(2);
              setClickedCard(null);
            }, 400);
          }}
        >
          <CardContent className="p-6 text-center">
            <Target className={`w-12 h-12 mx-auto mb-4 text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
              clickedCard === 'appel-offres' ? 'scale-125 animate-pulse text-orange-800' : ''
            }`} />
            <h3 className="text-xl font-semibold mb-2">Appel d'offres</h3>
            <p className="text-gray-600 mb-4">
              Recevez plusieurs propositions et choisissez la meilleure
            </p>
            <div className="space-y-2">
              <Badge variant="secondary">Enchère inversée</Badge>
              <Badge variant="secondary">+50 prestataires</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        variant="outline" 
        onClick={() => setCurrentStep(0)}
        className="mt-4"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>
    </div>
  );

  // Étape 2: Choix de catégorie
  const renderStep2 = () => {
    // Choisir les catégories appropriées selon le type de service
    const categoriesToShow = serviceType === 'mise-en-relation' ? connectionCategories : CATEGORIES;
    const categoryLabel = serviceType === 'mise-en-relation' ? 'expert' : 'projet';

    return (
      <div className="space-y-3">
        <div className="text-center space-y-2 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 animate-bounce-in progressive-flow-title">
            Dans quel domaine ?
          </h2>
          <p className="text-gray-600 animate-slide-up progressive-flow-description">
            Sélectionnez la catégorie qui correspond à votre {categoryLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 category-grid">
          {categoriesToShow.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1 group card-shine ${
              selectedCategory === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-blue-50/20'
            } ${clickedCard === category.id ? 'scale-95 ring-4 ring-blue-400 bg-blue-100 animate-pulse-glow' : ''}`}
            onClick={() => {
              setSelectedCategory(category.id);
              setClickedCard(category.id);
              setTimeout(() => {
                setCurrentStep(3);
                setClickedCard(null);
              }, 400);
            }}
          >
            <CardContent className="p-4 text-center category-card">
              <div className="mb-3">
                {(() => {
                  const IconComponent = getIcon(category.icon);
                  return <IconComponent className={`w-8 h-8 mx-auto ${category.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                    clickedCard === category.id ? 'scale-125 animate-pulse' : ''
                  }`} />;
                })()}
              </div>
              <h3 className="font-medium text-sm leading-tight">{category.name}</h3>
              {category.description && (
                <p className="text-xs text-gray-500 mt-1">{category.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    </div>
    );
  };

  // Étape 3: Complétude d'annonce
  const renderStep3 = () => {
    const categoriesToSearch = serviceType === 'mise-en-relation' ? connectionCategories : CATEGORIES;
    const selectedCat = categoriesToSearch.find(cat => cat.id === selectedCategory);
    const projectLabel = serviceType === 'mise-en-relation' ? 'demande de contact' : 'projet';

    return (
      <div className="space-y-3">
        <div className="text-center space-y-2 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 animate-bounce-in progressive-flow-title">
            Décrivez votre {projectLabel} {selectedCat?.name}
          </h2>
          <p className="text-gray-600 animate-slide-up progressive-flow-description">
            Plus votre description est précise, {serviceType === 'mise-en-relation' ? 'plus les experts seront adaptés' : 'meilleures seront les propositions'}
          </p>
        </div>

        <div className="space-y-6 max-w-2xl mx-auto progressive-flow-form">
          {/* Switch Mode Équipe */}
          <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Switch
              id="team-mode"
              checked={isTeamMode}
              onCheckedChange={setIsTeamMode}
            />
            <Label htmlFor="team-mode" className="text-blue-900 font-medium">
              🤝 Mode équipe - Diviser le projet en plusieurs spécialités
            </Label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Titre du {projectLabel} *
              </label>
              <TextSuggestionButton
                currentText={projectData.title}
                fieldType="title"
                category={selectedCategory}
                onSuggestion={(suggestedText) => {
                  setProjectData(prev => ({ ...prev, title: suggestedText }));
                  setTextSuggestionFeedback(prev => ({ ...prev, title: true }));
                }}
                className="text-xs"
              />
            </div>
            <Input
              placeholder={serviceType === 'mise-en-relation' ? `Ex: Recherche ${selectedCat?.name.toLowerCase()} pour conseil juridique` : "Ex: Création d'un site web e-commerce"}
              value={projectData.title}
              onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
            />
            {/* Mini feedback après suggestion de titre */}
            {textSuggestionFeedback.title && (
              <div className="mt-2">
                <AIFeedbackButtons
                  phase="brief_enhance"
                  prompt={{ field: 'title', text: projectData.title }}
                  onFeedback={() => setTextSuggestionFeedback(prev => ({ ...prev, title: false }))}
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description détaillée *
              </label>
              <TextSuggestionButton
                currentText={projectData.description}
                fieldType="description"
                category={selectedCategory}
                onSuggestion={(suggestedText) => {
                  setProjectData(prev => ({ ...prev, description: suggestedText }));
                  setTextSuggestionFeedback(prev => ({ ...prev, description: true }));
                }}
                className="text-xs"
              />
            </div>
            <Textarea
              placeholder={serviceType === 'mise-en-relation' ? "Décrivez le type de consultation recherchée, vos besoins spécifiques, le contexte..." : "Décrivez précisément votre besoin, vos objectifs, contraintes techniques..."}
              rows={4}
              value={projectData.description}
              onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
            />
            {/* Mini feedback après suggestion de description */}
            {textSuggestionFeedback.description && (
              <div className="mt-2">
                <AIFeedbackButtons
                  phase="brief_enhance"
                  prompt={{ field: 'description', text: projectData.description }}
                  onFeedback={() => setTextSuggestionFeedback(prev => ({ ...prev, description: false }))}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="w-4 h-4 inline mr-1" />
                {serviceType === 'mise-en-relation' ? 'Budget consultation (optionnel)' : 'Budget indicatif (optionnel)'}
              </label>
              <Input
                placeholder={serviceType === 'mise-en-relation' ? "Ex: 200 - 500 €/heure" : "Ex: 5 000 - 10 000 €"}
                value={projectData.budget}
                onChange={(e) => setProjectData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Délai souhaité (optionnel)
              </label>
              <Input
                placeholder="Ex: 2-3 mois"
                value={projectData.timeline}
                onChange={(e) => setProjectData(prev => ({ ...prev, timeline: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Exigences spécifiques (optionnel)
              </label>
              <TextSuggestionButton
                currentText={projectData.requirements}
                fieldType="requirements"
                category={selectedCategory}
                onSuggestion={(suggestedText) => {
                  setProjectData(prev => ({ ...prev, requirements: suggestedText }));
                  setTextSuggestionFeedback(prev => ({ ...prev, requirements: true }));
                }}
                className="text-xs"
              />
            </div>
            <Textarea
              placeholder="Technologies requises, contraintes particulières, livrables attendus..."
              rows={3}
              value={projectData.requirements}
              onChange={(e) => setProjectData(prev => ({ ...prev, requirements: e.target.value }))}
            />
            {/* Mini feedback après suggestion d'exigences */}
            {textSuggestionFeedback.requirements && (
              <div className="mt-2">
                <AIFeedbackButtons
                  phase="brief_enhance"
                  prompt={{ field: 'requirements', text: projectData.requirements }}
                  onFeedback={() => setTextSuggestionFeedback(prev => ({ ...prev, requirements: false }))}
                />
              </div>
            )}
          </div>

          {/* Intégration IA Enhancement */}
          <div className="mt-6">
            <SimpleAIEnhancement
              title={projectData.title}
              description={projectData.description}
              category={selectedCategory}
              onPriceSuggestion={(priceSuggestion) => {
                const suggestedBudget = `${priceSuggestion.minPrice} - ${priceSuggestion.maxPrice} €`;
                setProjectData(prev => ({ ...prev, budget: suggestedBudget }));
                setAiSuggestions({ type: 'pricing', data: priceSuggestion });
                setShowFeedbackButtons(true);
              }}
            />

            {/* Boutons feedback IA */}
            {showFeedbackButtons && aiSuggestions && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    🤖 Comment trouvez-vous cette suggestion IA ?
                  </p>
                  <div className="text-xs text-gray-600">
                    Votre retour nous aide à améliorer nos suggestions
                  </div>
                </div>
                <AIFeedbackButtons
                  phase="brief_enhance"
                  prompt={{
                    title: projectData.title,
                    description: projectData.description,
                    category: selectedCategory,
                    suggestion: aiSuggestions
                  }}
                  onFeedback={(accepted, rating, edits) => {
                    console.log('Feedback IA reçu:', { accepted, rating, edits });
                    setShowFeedbackButtons(false);
                    toast({
                      title: "Merci pour votre retour !",
                      description: "Vos commentaires nous aident à améliorer l'IA"
                    });
                  }}
                />
              </div>
            )}
          </div>

          {/* Section Localisation */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Localisation
            </h3>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="remote"
                  name="location-type"
                  checked={!projectData.needsLocation}
                  onChange={() => setProjectData(prev => ({ ...prev, needsLocation: false, location: { ...prev.location, address: '' } }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="remote" className="text-sm font-medium text-gray-700">
                  À distance
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="onsite"
                  name="location-type"
                  checked={projectData.needsLocation}
                  onChange={() => setProjectData(prev => ({ ...prev, needsLocation: true }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="onsite" className="text-sm font-medium text-gray-700">
                  Intervention sur site
                </label>
              </div>
            </div>

            {projectData.needsLocation && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal (5 chiffres) *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 75001"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  value={projectData.location.address}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                    setProjectData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        address: value
                      }
                    }));
                  }}
                  className="w-40"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saisissez le code postal de l'intervention
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(2)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none"
              disabled={
                !projectData.title.trim() || 
                !projectData.description.trim() ||
                !projectData.category ||
                (projectData.needsLocation && (!projectData.location.address || projectData.location.address.length !== 5))
              }
              onClick={handleSubmit}
              loading={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  {isTeamMode ? 'Créer le projet équipe' : 'Publier la mission'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };


  // Configuration des étapes simplifiées
  const steps = [
    {
      id: 0,
      title: "Comprendre Swideal",
      description: "Découvrir l'art du deal",
      icon: "lightbulb",
      fields: []
    },
    {
      id: 1,
      title: "Votre Mission",
      description: "Titre et description",
      icon: "briefcase",
      fields: ['title', 'description', 'category']
    },
    {
      id: 2,
      title: "Finaliser",
      description: "Budget, lieu et publication",
      icon: "rocket",
      fields: ['budget', 'location', 'isTeamMode']
    }
  ];

  // Validation simplifiée
  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: return true; // Page d'introduction
      case 1: 
        return projectData.title.length >= 3 && 
               projectData.description.length >= 10 && 
               projectData.category.length > 0;
      case 2:
        // Le budget et la localisation sont optionnels, donc l'étape est toujours valide
        return true; 
      default: 
        return false;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto progressive-flow-container">
      <div className="bg-transparent pb-24">
        <div className="px-4 relative progressive-flow-step">
          {currentStep === -1 && renderStepMinus1()}
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Bloc de progression compact sous le contenu - masqué pour le niveau 0 */}
        {currentStep >= 0 && (
          <div className="bg-gradient-to-r from-blue-50/5 via-indigo-50/5 to-purple-50/5 p-3 rounded-xl mt-6 mb-6 border border-blue-200/20 backdrop-blur-sm progressive-flow-progress">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStep + 1} sur 3
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(((currentStep + 1) / 3) * 100)}%
              </span>
            </div>

            {/* Barre de progression avec gradient et animation */}
            <div className="w-full h-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-sm relative"
                style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              >
                {/* Effet de brillance */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>
              </div>
            </div>

            {/* Points d'étapes réduits */}
            <div className="flex justify-between mt-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep + 1 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm' 
                      : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                    step <= currentStep + 1 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}