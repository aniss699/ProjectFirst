import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCreateApi } from '@/hooks/useApiCall';
import { useFormSubmit, validationHelpers } from '@/hooks/useFormSubmit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Users, CheckCircle, ArrowRight, ArrowLeft, Sparkles, Target, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
}

interface OnboardingData {
  name: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'PRO';
  company?: string;
  specialties?: string[];
  experience?: string;
  budget?: string;
  goals?: string[];
}

export function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // État pour l'onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
    goals: []
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Utilisation de l'architecture centralisée pour éliminer la duplication
  const loginApi = useCreateApi<any, { email: string; password: string }>('/api/auth/login', {
    successMessage: 'Connexion réussie ! Bienvenue sur Swideal',
    errorContext: 'Connexion utilisateur',
    onSuccess: (data) => {
      login(data.user);
      onClose();
    },
  });

  const loginSubmit = useFormSubmit<{ email: string; password: string }>({
    onSubmit: async (data) => {
      loginApi.mutate(data);
    },
    validateBeforeSubmit: validationHelpers.validateAuth,
  });

  const registerMutation = useCreateApi<any, OnboardingData>('/api/auth/register', {
    successMessage: '🎉 Bienvenue sur Swideal ! Votre compte a été créé',
    errorContext: 'Inscription utilisateur',
    onSuccess: (data) => {
      login(data.user);
      setShowOnboarding(false);
      onClose();
    },
  });

  // Fonctions pour l'onboarding
  const startOnboarding = () => {
    // Copier les données du formulaire initial dans l'onboarding
    setOnboardingData(prev => ({
      ...prev,
      email: formData.email.trim(),
      password: formData.password
    }));
    setShowOnboarding(true);
    setOnboardingStep(0);
  };

  const nextStep = () => {
    if (onboardingStep < getMaxSteps() - 1) {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const prevStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const getMaxSteps = () => {
    return 3; // Simplifié : Rôle, Infos de base, Spécialisations/Entreprise
  };

  const updateOnboardingData = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const completeOnboarding = () => {
    const payload = {
      name: onboardingData.name,
      email: onboardingData.email,
      password: onboardingData.password,
      role: onboardingData.role,
      profile_data: {
        company: onboardingData.company,
        specialties: onboardingData.specialties,
        experience: onboardingData.experience,
        budget: onboardingData.budget,
        goals: onboardingData.goals,
        onboarding_completed: true
      }
    };
    registerMutation.mutate(payload);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      // Utilise le système centralisé de validation et de gestion d'erreur
      loginSubmit.handleSubmit({
        email: formData.email.trim(),
        password: formData.password,
      });
    } else {
      // Utilise la validation centralisée pour l'inscription
      const validationErrors = validationHelpers.validateAuth({
        email: formData.email,
        password: formData.password,
      });

      if (validationErrors && validationErrors.length > 0) {
        // Utilise directement le service d'erreur pour afficher la validation
        loginSubmit.handleError(new Error(`Champs requis : ${validationErrors.join(', ')}`), 'Validation inscription');
        return;
      }

      startOnboarding();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ email: '', password: '' });
    loginSubmit.reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = (newMode: 'login' | 'register') => {
    resetForm();
    onSwitchMode(newMode);
  };

  // Rendu des étapes d'onboarding (simplifié pour exemple)
  const renderOnboardingStep = () => {
    switch (onboardingStep) {
      case 0: // Choix du rôle
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bienvenue sur Swideal !</h3>
              <p className="text-gray-600">Choisissez votre profil pour personnaliser votre expérience</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${onboardingData.role === 'CLIENT' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                onClick={() => updateOnboardingData('role', 'CLIENT')}
                data-testid="role-client-card"
              >
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Je suis Client</h4>
                  <p className="text-sm text-gray-600">Je cherche des prestataires pour mes projets</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${onboardingData.role === 'PRO' ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
                onClick={() => updateOnboardingData('role', 'PRO')}
                data-testid="role-pro-card"
              >
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Je suis Prestataire</h4>
                  <p className="text-sm text-gray-600">Je propose mes services aux clients</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 1: // Informations de base
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Informations de base</h3>
              <p className="text-gray-600">Créons votre profil {onboardingData.role === 'CLIENT' ? 'client' : 'prestataire'}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={onboardingData.name}
                  onChange={(e) => updateOnboardingData('name', e.target.value)}
                  placeholder="Votre nom complet"
                  data-testid="input-onboarding-name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={onboardingData.email}
                  onChange={(e) => updateOnboardingData('email', e.target.value)}
                  placeholder="votre@email.com"
                  data-testid="input-onboarding-email"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={onboardingData.password}
                  onChange={(e) => updateOnboardingData('password', e.target.value)}
                  placeholder="Au moins 6 caractères"
                  data-testid="input-onboarding-password"
                />
              </div>
            </div>
          </div>
        );
        
      case 2: // Finalisation
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Presque fini !</h3>
              <p className="text-gray-600">Confirmez vos informations pour créer votre compte</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Récapitulatif</h4>
              <p><strong>Nom :</strong> {onboardingData.name}</p>
              <p><strong>Email :</strong> {onboardingData.email}</p>
              <p><strong>Rôle :</strong> {onboardingData.role === 'CLIENT' ? 'Client' : 'Prestataire'}</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Affichage du modal principal ou de l'onboarding
  if (showOnboarding) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un compte</DialogTitle>
            <DialogDescription>
              Étape {onboardingStep + 1} sur {getMaxSteps()}
            </DialogDescription>
          </DialogHeader>
          
          <Progress value={(onboardingStep + 1) / getMaxSteps() * 100} className="mb-4" />
          
          {renderOnboardingStep()}
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={onboardingStep === 0}
              data-testid="button-onboarding-prev"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            
            {onboardingStep < getMaxSteps() - 1 ? (
              <Button 
                onClick={nextStep}
                data-testid="button-onboarding-next"
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={completeOnboarding}
                disabled={registerMutation.isPending}
                data-testid="button-onboarding-complete"
              >
                {registerMutation.isPending ? 'Création...' : 'Créer le compte'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Modal principal de connexion/inscription
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'Connectez-vous à votre compte Swideal' 
              : 'Rejoignez la communauté Swideal'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre@email.com"
              required
              data-testid="input-auth-email"
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={mode === 'login' ? 'Votre mot de passe' : 'Au moins 6 caractères'}
              required
              data-testid="input-auth-password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loginSubmit.isSubmitting}
            data-testid="button-auth-submit"
          >
            {loginSubmit.isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                {mode === 'login' ? 'Connexion...' : 'Création...'}
              </div>
            ) : (
              mode === 'login' ? 'Se connecter' : 'Continuer'
            )}
          </Button>
        </form>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="ml-1 text-blue-600 hover:underline"
              data-testid="button-auth-switch"
            >
              {mode === 'login' ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}