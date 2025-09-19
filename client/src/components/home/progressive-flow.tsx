import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  Target,
  Euro,
  Calendar,
  MapPin,
  PlusCircle
} from 'lucide-react';
// Removed unused import * as LucideIcons from 'lucide-react';
import { CATEGORIES, connectionCategories } from '@/lib/categories';
import { SimpleAIEnhancement } from '@/components/ai/simple-ai-enhancement';
import { TextSuggestionButton } from '@/components/ai/text-suggestion-button';
import { AIFeedbackButtons } from '@/components/ai/feedback-buttons';
import { InteractiveMap } from '@/components/location/interactive-map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamMissionCreator } from '@/components/missions/team-mission-creator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { GeoSearch } from '@/components/location/geo-search';
import { useQueryClient } from '@tanstack/react-query';
import type { TeamRequirement } from '@shared/schema';

type ServiceType = 'mise-en-relation' | 'appel-offres' | null;

interface ProgressiveFlowProps {
  onComplete?: (data: any) => void;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ProgressiveFlow({ onComplete, onSubmit, isLoading: externalLoading, error: externalError }: ProgressiveFlowProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(-1); // Commencer au niveau -1 (présentation)
  const [isCreating, setIsCreating] = useState(false);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isTeamMode, setIsTeamMode] = useState(false); // State pour le mode équipe
  const [isSubmitting, setIsSubmitting] = useState(false); // State pour le bouton de soumission

  // Function to get Lucide icon component from icon name
  const getIcon = (iconName: string) => {
    // Simple icon mapping for most common icons
    const iconMap: {[key: string]: any} = {
      'Hammer': Target,
      'Home': Target,
      'Baby': Target,
      'BookOpen': FileText,
      'Heart': Target,
      'Car': Target,
      'ChefHat': Target,
      'Calendar': Calendar,
      'Camera': Target,
      'Briefcase': Target
    };
    return iconMap[iconName] || Target;
  };
  const [serviceType, setServiceType] = useState<ServiceType>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    budget: '',
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

  const progress = ((currentStep + 2) / 5) * 100; // 5 niveaux au total maintenant (niveau -1 + 4 étapes)

  // Function to create the mission via API
  const createMission = async () => {
    setIsCreating(true);

    try {
      if (isTeamMode) {
        // Analyser les besoins d'équipe
        const response = await fetch('/api/team/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: projectData.description,
            title: projectData.title,
            category: selectedCategory,
            budget: projectData.budget
          })
        });

        if (response.ok) {
          const analysis = await response.json();

          // Créer le projet avec l'équipe analysée
          const createResponse = await fetch('/api/team/create-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectData: {
                title: projectData.title,
                description: projectData.description,
                category: selectedCategory,
                budget: projectData.budget,
                location: projectData.needsLocation ? projectData.location.address : 'Remote',
                isTeamMode: true
              },
              teamRequirements: analysis.professions
            })
          });

          if (createResponse.ok) {
            const result = await createResponse.json();
            toast({
              title: 'Projet équipe créé !',
              description: `Votre projet a été divisé en ${result.subMissions.length} missions spécialisées.`,
            });

            // Invalider le cache des missions pour forcer le rechargement
            queryClient.invalidateQueries({ queryKey: ['missions'] });

            // Rediriger vers les missions
            setLocation('/missions');
            onComplete?.({
              serviceType,
              selectedCategory,
              projectData,
              projectId: result.project.id
            });
          } else {
            const error = await createResponse.json();
            throw new Error(error.error || 'Erreur lors de la création du projet');
          }
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de l\'analyse d\'équipe');
        }
      } else {
        // Mode mission simple
        const missionData = {
          title: projectData.title,
          description: projectData.description,
          category: selectedCategory,
          budget: Number(projectData.budget),
          location: projectData.needsLocation ? projectData.location.address : 'Remote',
          userId: user?.id?.toString() || null,
          clientName: user?.name || 'Utilisateur'
        };

        // Si onSubmit est fourni (depuis create-mission.tsx), l'utiliser
        if (onSubmit) {
          console.log('🔄 Utilisation de onSubmit fourni par create-mission.tsx');
          await onSubmit(missionData);
          return; // onSubmit gère la redirection et les messages
        }

        // Sinon, comportement par défaut (appel API direct)
        const response = await fetch('/api/missions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(missionData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Mission créée avec succès:', result);

          toast({ 
            title: 'Mission créée !', 
            description: 'Votre mission a été publiée avec succès.' 
          });

          // Invalider le cache des missions pour forcer le rechargement
          queryClient.invalidateQueries({ queryKey: ['missions'] });

          // Rediriger vers les missions
          setLocation('/missions');
          onComplete?.({
            serviceType,
            selectedCategory,
            projectData,
            missionId: result.id
          });
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Erreur lors de la création de la mission');
        }
      }
    } catch (error) {
      console.error('Erreur création mission:', error);
      toast({
        title: 'Erreur de création',
        description: (error as Error).message || 'Impossible de créer la mission. Vérifiez votre connexion.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // --- Nouvelle fonction handleSubmitMission modifiée ---
  const handleSubmitMission = async (values: any) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour créer une mission",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure proper data formatting before sending
      const formattedData = {
        title: values.title,
        description: values.description,
        category: values.category || 'developpement',
        budget: values.budget ? parseInt(values.budget.toString()) : null,
        location: values.location || null,
        urgency: values.urgency || 'medium',
        requirements: values.requirements || null,
        tags: values.tags || [],
        deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      };

      console.log('🚀 Sending formatted data:', formattedData);

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erreur serveur:', result);
        throw new Error(result.error || 'Erreur lors de la création de la mission');
      }

      console.log('Mission créée avec succès:', result);

      toast({
        title: "Mission créée !",
        description: "Votre mission a été publiée avec succès",
      });

      onComplete?.(result);
    } catch (error) {
      console.error('Erreur création mission:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer la mission. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  // Animation d'entrée pour chaque étape
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force un re-render pour les animations CSS
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);



  // Étape -1 (Niveau 0): Présentation révolutionnaire de SwipDEAL
  const renderStepMinus1 = () => (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] relative overflow-hidden">
      {/* Arrière-plan dynamique avec dégradés et particules */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-blue-900 opacity-95"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/10 to-cyan-400/20"></div>
      
      {/* Particules flottantes animées */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 bg-purple-400 rounded-full animate-ping opacity-70 animation-delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-80"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-full px-4 py-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Accroche principale avec effet magique */}
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 mb-4 animate-bounce-in tracking-tight">
                🎯 SwipDEAL
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white animate-slide-up leading-tight">
              Révolutionne ta façon de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 animate-sparkle"> trouver</span> et 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-400 animate-sparkle"> collaborer</span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto animate-slide-up leading-relaxed">
              Fini les recherches interminables et les négociations douloureuses. 
              <span className="text-yellow-300 font-bold"> SwipDEAL</span> met le pouvoir entre tes mains.
            </p>
          </div>

          {/* Cards révolutionnaires avec animations */}
          <div className="grid md:grid-cols-2 gap-6 mt-12 animate-fade-in">
            
            {/* Card Enchère Inversée */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="text-5xl animate-bounce">⚡</div>
                    <div className="absolute -inset-2 bg-yellow-400/30 rounded-full blur-md animate-pulse"></div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    L'Enchère Inversée
                  </h3>
                  <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                    <span className="text-yellow-300 font-semibold">Tu poses ton besoin</span>, 
                    les pros se battent pour te donner le 
                    <span className="text-pink-300 font-semibold"> meilleur prix</span> !
                  </p>
                  <div className="flex justify-center space-x-2 mt-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-200 text-xs rounded-full border border-pink-400/30">
                      Prix compétitifs
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-200 text-xs rounded-full border border-yellow-400/30">
                      Zéro négociation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Mise en relation */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-green-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="text-5xl animate-bounce animation-delay-500">🤝</div>
                    <div className="absolute -inset-2 bg-cyan-400/30 rounded-full blur-md animate-pulse animation-delay-500"></div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    Connexion Stratégique
                  </h3>
                  <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                    <span className="text-cyan-300 font-semibold">Accès direct aux experts</span> 
                    grâce aux réseaux. 
                    <span className="text-green-300 font-semibold">Monétise tes contacts</span> !
                  </p>
                  <div className="flex justify-center space-x-2 mt-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-green-500/20 text-cyan-200 text-xs rounded-full border border-cyan-400/30">
                      Réseau premium
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 text-xs rounded-full border border-green-400/30">
                      Revenus passifs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message de transformation */}
          <div className="relative mt-8 animate-slide-up animation-delay-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30">
              <p className="text-lg md:text-xl text-center text-white font-semibold leading-relaxed">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 text-2xl">✨ SwipDEAL ✨</span>
                <br />
                Transforme chaque collaboration en 
                <span className="text-yellow-300 font-bold"> art du deal</span>
              </p>
            </div>
          </div>

          {/* Call-to-action époustouflant */}
          <div className="mt-10 animate-bounce-in animation-delay-1500">
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500 rounded-2xl blur-lg group-hover:blur-xl transition duration-300 animate-pulse"></div>
              <Button 
                onClick={() => setCurrentStep(0)}
                className="relative bg-gradient-to-r from-yellow-500 via-pink-500 to-cyan-500 hover:from-yellow-400 hover:via-pink-400 hover:to-cyan-400 text-white font-black text-lg md:text-xl px-12 py-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:-translate-y-2 border-2 border-white/30"
                size="lg"
              >
                <span className="flex items-center space-x-3">
                  <span className="text-2xl animate-bounce">🚀</span>
                  <span>COMMENCER L'AVENTURE</span>
                  <span className="text-2xl animate-pulse">⚡</span>
                </span>
              </Button>
            </div>
            
            {/* Indicateur subtil */}
            <p className="text-gray-300 text-sm mt-4 animate-pulse">
              🎯 Rejoins des milliers d'entrepreneurs malins
            </p>
          </div>

        </div>
      </div>
    </div>
  );


  // Étape 0: Choix du type de service  
  const renderStep0 = () => (
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
              setCurrentStep(1);
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
              setCurrentStep(1);
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
        onClick={() => setCurrentStep(-1)}
        className="mt-4"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>
    </div>
  );

  // Étape 1: Choix de catégorie
  const renderStep1 = () => {
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
                setCurrentStep(2);
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
          onClick={() => setCurrentStep(0)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    </div>
    );
  };

  // Étape 2: Complétude d'annonce
  const renderStep2 = () => {
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Euro className="w-4 h-4 inline mr-1" />
              Budget en euros *
            </label>
            <Input
              type="number"
              placeholder="Ex: 5000"
              min="10"
              max="1000000"
              value={projectData.budget}
              onChange={(e) => setProjectData(prev => ({ ...prev, budget: e.target.value }))}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Montant en euros (entre 10€ et 1 000 000€)
            </p>
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
              onClick={() => setCurrentStep(1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none"
              disabled={
                isCreating || !projectData.title.trim() || 
                !projectData.description.trim() ||
                !projectData.budget.trim() ||
                isNaN(Number(projectData.budget)) ||
                Number(projectData.budget) < 10 ||
                Number(projectData.budget) > 1000000 ||
                (projectData.needsLocation && (!projectData.location.address || projectData.location.address.length !== 5))
              }
              onClick={createMission}
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


  const steps = [renderStepMinus1, renderStep0, renderStep1, renderStep2];

  return (
    <div className="w-full max-w-6xl mx-auto progressive-flow-container">
      <div className="bg-transparent pb-24">
        <div className="px-4 relative progressive-flow-step">
          {steps[currentStep + 1]()}
        </div>

        {/* Bloc de progression compact sous le contenu - masqué pour le niveau présentation */}
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