
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
  Users, 
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
import * as LucideIcons from 'lucide-react';
import { CATEGORIES, connectionCategories, getCategoryDynamicFields, type DynamicField } from '@/lib/categories';
import { SimpleAIEnhancement } from '@/components/ai/simple-ai-enhancement';
import { TextSuggestionButton } from '@/components/ai/text-suggestion-button';
import { AIFeedbackButtons } from '@/components/ai/feedback-buttons';
import { InteractiveMap } from '@/components/location/interactive-map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type UserType = 'client' | 'prestataire' | null;
type ServiceType = 'mise-en-relation' | 'appel-offres' | null;

interface ProgressiveFlowProps {
  onComplete?: (data: any) => void;
}

export function ProgressiveFlow({ onComplete }: ProgressiveFlowProps) {
  const [currentStep, setCurrentStep] = useState(-1); // Commencer au niveau -1 pour avoir le niveau 0
  const [isCreating, setIsCreating] = useState(false);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Function to get Lucide icon component from icon name
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')
    ];
    return IconComponent || LucideIcons.Briefcase;
  };
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
    needsLocation: false,
    dynamicFields: {} as Record<string, string | number | boolean>
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(false);
  const [textSuggestionFeedback, setTextSuggestionFeedback] = useState<{[key: string]: boolean}>({});

  const progress = ((currentStep + 2) / 6) * 100; // 6 étapes au total maintenant (niveau 0 + 5 étapes)

  // Fonction pour créer la mission via l'API
  const createMission = async () => {
    if (!projectData.title || !projectData.description) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir au moins le titre et la description',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Mapper les catégories vers les valeurs acceptées par l'API
      const categoryMapping: Record<string, string> = {
        'web-dev': 'developpement',
        'mobile-dev': 'mobile', 
        'design': 'design',
        'marketing': 'marketing',
        'consulting': 'conseil',
        'lawyer': 'conseil',
        'doctor': 'services',
        'coach': 'services',
        'celebrity': 'services',
        'ai-ml': 'ai',
        'writing': 'redaction',
        'video': 'multimedia',
        'data': 'data',
        'photography': 'photo',
        'translation': 'traduction'
      };

      // Formater le budget
      const budgetText = projectData.budget || '2000';
      const budgetFormatted = budgetText.includes('-') ? budgetText : `${budgetText}`;

      // Formater les champs dynamiques pour la description
      const dynamicFieldsText = Object.keys(projectData.dynamicFields).length > 0 
        ? Object.entries(projectData.dynamicFields)
            .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
            .map(([key, value]) => {
              const field = getCategoryDynamicFields(selectedCategory).find(f => f.id === key);
              return field ? `${field.label}: ${value}` : null;
            })
            .filter(Boolean)
            .join('\n')
        : '';

      const missionData = {
        title: projectData.title,
        description: projectData.description + 
          (projectData.requirements ? `\n\nExigences spécifiques: ${projectData.requirements}` : '') +
          (dynamicFieldsText ? `\n\nInformations spécifiques:\n${dynamicFieldsText}` : ''),
        category: selectedCategory, // Utiliser la vraie catégorie au lieu du mapping obsolète
        budget: budgetFormatted,
        location: 'Remote',
        clientId: 'user_1', // ID utilisateur temporaire
        clientName: 'Utilisateur',
        dynamicFields: projectData.dynamicFields
      };

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(missionData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Mission créée avec succès !',
          description: 'Votre projet a été publié et est maintenant visible par les prestataires',
        });
        
        // Rediriger vers la page des missions
        setLocation('/missions');
        
        // Appeler le callback s'il existe
        onComplete?.({
          userType,
          serviceType,
          selectedCategory,
          projectData,
          missionId: result.id
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Erreur lors de la création',
          description: error.message || 'Une erreur est survenue lors de la création de la mission',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur création mission:', error);
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de créer la mission. Vérifiez votre connexion.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Réinitialiser les champs dynamiques lors du changement de catégorie
  useEffect(() => {
    setProjectData(prev => ({ ...prev, dynamicFields: {} }));
  }, [selectedCategory]);

  // Animation d'entrée pour chaque étape
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force un re-render pour les animations CSS
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Fonction pour rendre les champs dynamiques
  const renderDynamicFields = (categoryId: string) => {
    const fields = getCategoryDynamicFields(categoryId);
    
    if (fields.length === 0) return null;

    const handleFieldChange = (fieldId: string, value: string | number | boolean) => {
      setProjectData(prev => ({ 
        ...prev, 
        dynamicFields: { ...prev.dynamicFields, [fieldId]: value }
      }));
    };

    const renderField = (field: DynamicField) => {
      const fieldValue = projectData.dynamicFields[field.id] || '';

      switch (field.type) {
        case 'text':
          return (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && '*'}
              </label>
              <Input
                placeholder={field.placeholder}
                value={fieldValue as string}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
              />
            </div>
          );

        case 'number':
          return (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && '*'}
              </label>
              <Input
                type="number"
                placeholder={field.placeholder}
                value={fieldValue as string}
                min={field.min}
                max={field.max}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
              />
            </div>
          );

        case 'textarea':
          return (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && '*'}
              </label>
              <Textarea
                placeholder={field.placeholder}
                value={fieldValue as string}
                rows={3}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
              />
            </div>
          );

        case 'select':
          return (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && '*'}
              </label>
              <Select
                value={fieldValue as string}
                onValueChange={(value) => handleFieldChange(field.id, value)}
                required={field.required}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || `Choisir ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );

        case 'checkbox':
          return (
            <div key={field.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={field.id}
                checked={fieldValue as boolean}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                {field.label} {field.required && '*'}
              </label>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informations spécifiques à votre projet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(renderField)}
        </div>
      </div>
    );
  };

  // Étape -1 (Niveau 0): Présentation de Swideal
  const renderStepMinus1 = () => (
    <div className="text-center space-y-3 max-w-4xl mx-auto">
      <div className="space-y-3 animate-fade-in">
        <div className="text-left space-y-3 bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-blue-100">
          <div className="text-center mb-3">
            <p className="text-base md:text-lg leading-tight text-gray-800 font-medium">
              <span className="text-blue-600 font-bold">Swideal</span> place le <span className="text-blue-600 font-semibold">client</span> au cœur du modèle.
            </p>
            <p className="text-sm md:text-base text-gray-700 mt-1">
              Notre approche repose sur deux leviers puissants :
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 md:p-4 border-l-3 border-blue-500">
              <h3 className="text-sm md:text-base font-bold text-blue-800 mb-2">
                1️⃣ L'enchère inversée
              </h3>
              <p className="text-xs md:text-sm text-gray-700 leading-snug">
                Fini les heures perdues à chercher et comparer. Le <span className="text-blue-600 font-semibold">client</span> décrit son besoin et ce sont les <span className="text-green-600 font-semibold">prestataires</span> qui rivalisent pour lui offrir le meilleur deal.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 md:p-4 border-l-3 border-green-500">
              <h3 className="text-sm md:text-base font-bold text-green-800 mb-2">
                2️⃣ La mise en relation stratégique
              </h3>
              <p className="text-xs md:text-sm text-gray-700 leading-snug">
                Chacun peut tirer parti des connaissances et du réseau des autres pour être connecté directement à la bonne personne, au bon moment.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 md:p-4 border border-purple-200 mt-3">
            <p className="text-xs md:text-sm text-gray-800 leading-snug font-medium text-center">
              En combinant ces deux axes, <span className="text-purple-600 font-bold">Swideal</span> transforme la mise en relation en véritable <span className="text-purple-600 font-semibold">art du deal</span> : rapide, ciblée, et toujours au bénéfice du <span className="text-blue-600 font-semibold">client</span>.
            </p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={() => setCurrentStep(0)}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 text-white text-sm md:text-base px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 font-bold mt-4"
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
                {serviceType === 'mise-en-relation' ? 'Budget consultation' : 'Budget indicatif'}
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
                Délai souhaité
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
                Exigences spécifiques
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

          {/* Champs dynamiques spécifiques à la catégorie */}
          {renderDynamicFields(selectedCategory)}

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

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(2)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none"
              disabled={!projectData.title || !projectData.description}
              onClick={() => setCurrentStep(4)}
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              Étape suivante
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Étape 4: Géolocalisation
  const renderStep4 = () => {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 animate-bounce-in progressive-flow-title">
            Localisation du projet
          </h2>
          <p className="text-gray-600 animate-slide-up progressive-flow-description">
            Indiquez si votre projet nécessite une intervention sur site ou peut être réalisé à distance
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Choix: Projet sur site ou à distance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                !projectData.needsLocation ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-green-50/30'
              }`}
              onClick={() => setProjectData(prev => ({ ...prev, needsLocation: false }))}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Travail à distance</h3>
                <p className="text-sm text-gray-600">
                  Le prestataire peut travailler depuis n'importe où
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                projectData.needsLocation ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-blue-50/30'
              }`}
              onClick={() => setProjectData(prev => ({ ...prev, needsLocation: true }))}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Intervention sur site</h3>
                <p className="text-sm text-gray-600">
                  Le prestataire doit se déplacer à une adresse spécifique
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Carte interactive si intervention sur site */}
          {projectData.needsLocation && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Où se situe votre projet ?
              </h3>
              
              <InteractiveMap
                center={projectData.location.lat && projectData.location.lng 
                  ? [projectData.location.lat, projectData.location.lng] 
                  : [48.8566, 2.3522]
                }
                radius={projectData.location.radius}
                onLocationSelect={(lat, lng, address) => {
                  setProjectData(prev => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      lat,
                      lng,
                      address
                    }
                  }));
                }}
                showProviders={true}
                className="h-96"
              />
              
              {projectData.location.address && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Adresse sélectionnée: {projectData.location.address}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rayon de recherche (km)
                </label>
                <select 
                  value={projectData.location.radius}
                  onChange={(e) => setProjectData(prev => ({
                    ...prev,
                    location: { ...prev.location, radius: parseInt(e.target.value) }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(3)}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button 
            onClick={createMission}
            disabled={isCreating || !projectData.title || !projectData.description || 
              (projectData.needsLocation && (!projectData.location.lat || !projectData.location.lng))}
            className="min-w-[200px]"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Création en cours...
              </div>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer ma mission
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const steps = [renderStepMinus1, renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <div className="w-full max-w-6xl mx-auto progressive-flow-container">
      <div className="bg-transparent pb-24">
        <div className="px-4 relative progressive-flow-step">
          {steps[currentStep + 1]()}
        </div>
        
        {/* Bloc de progression compact sous le contenu - masqué pour le niveau 0 */}
        {currentStep >= 0 && (
          <div className="bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 p-3 rounded-xl mt-6 mb-6 border border-blue-200/20 backdrop-blur-sm progressive-flow-progress">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStep + 1} sur 5
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(((currentStep + 1) / 5) * 100)}%
              </span>
            </div>
            
            {/* Barre de progression avec gradient et animation */}
            <div className="w-full h-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-sm relative"
                style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
              >
                {/* Effet de brillance */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>
              </div>
            </div>
            
            {/* Points d'étapes réduits */}
            <div className="flex justify-between mt-2">
              {[1, 2, 3, 4, 5].map((step) => (
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
