import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
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

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      onClose();
      toast({
        title: 'Connexion réussie !',
        description: 'Bienvenue sur Swideal',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Email ou mot de passe incorrect',
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        profile_data: {
          company: data.company,
          specialties: data.specialties,
          experience: data.experience,
          budget: data.budget,
          goals: data.goals,
          onboarding_completed: true
        }
      };
      const response = await apiRequest('POST', '/api/auth/register', payload);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      setShowOnboarding(false);
      onClose();
      toast({
        title: '🎉 Bienvenue sur Swideal !',
        description: 'Votre compte a été configuré avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur lors de l\'inscription',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
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
    registerMutation.mutate(onboardingData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      if (!formData.email.trim() || !formData.password.trim()) {
        toast({
          title: 'Champs requis',
          description: 'Veuillez remplir tous les champs',
          variant: 'destructive',
        });
        return;
      }

      loginMutation.mutate({
        email: formData.email.trim(),
        password: formData.password,
      });
    } else {
      // Validation pour l'inscription
      if (!formData.email.trim()) {
        toast({
          title: 'Email requis',
          description: 'Veuillez saisir votre adresse email',
          variant: 'destructive',
        });
        return;
      }

      // Validation email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast({
          title: 'Email invalide',
          description: 'Veuillez saisir un email valide',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.password.trim() || formData.password.length < 6) {
        toast({
          title: 'Mot de passe invalide',
          description: 'Le mot de passe doit contenir au moins 6 caractères',
          variant: 'destructive',
        });
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = (newMode: 'login' | 'register') => {
    resetForm();
    onSwitchMode(newMode);
  };

  // Rendu des étapes d'onboarding
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
                />
              </div>
            </div>
          </div>
        );
        
      case 2: // Spécialisations (pour PRO) ou Entreprise (pour CLIENT)
        if (onboardingData.role === 'PRO') {
          const commonSpecialties = ['React', 'Vue.js', 'Node.js', 'Python', 'Design UI/UX', 'Marketing', 'SEO', 'Rédaction'];
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Vos spécialités</h3>
                <p className="text-gray-600">Sélectionnez vos domaines d'expertise</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {commonSpecialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={onboardingData.specialties?.includes(specialty) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = onboardingData.specialties || [];
                      if (current.includes(specialty)) {
                        updateOnboardingData('specialties', current.filter(s => s !== specialty));
                      } else {
                        updateOnboardingData('specialties', [...current, specialty]);
                      }
                    }}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
              
              <Button 
                onClick={completeOnboarding}
                className="w-full bg-green-600 hover:bg-green-700 mt-6"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Création en cours...' : '🎉 Créer mon compte'}
              </Button>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Votre entreprise</h3>
                <p className="text-gray-600">Parlez-nous de votre organisation</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Nom de l'entreprise</Label>
                  <Input
                    id="company"
                    value={onboardingData.company || ''}
                    onChange={(e) => updateOnboardingData('company', e.target.value)}
                    placeholder="Votre entreprise"
                  />
                </div>
                
                <div>
                  <Label htmlFor="budget">Budget mensuel approximatif</Label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={onboardingData.budget || ''}
                    onChange={(e) => updateOnboardingData('budget', e.target.value)}
                  >
                    <option value="">Sélectionnez un budget</option>
                    <option value="0-1000">0 - 1 000€</option>
                    <option value="1000-5000">1 000 - 5 000€</option>
                    <option value="5000-15000">5 000 - 15 000€</option>
                    <option value="15000+">15 000€+</option>
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={completeOnboarding}
                className="w-full bg-green-600 hover:bg-green-700 mt-6"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Création en cours...' : '🎉 Créer mon compte'}
              </Button>
            </div>
          );
        }
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`bg-white ${showOnboarding ? 'sm:max-w-lg' : 'sm:max-w-md'}`}>
        {showOnboarding ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Configuration de votre compte</DialogTitle>
              <div className="flex items-center space-x-2 mt-4">
                <Progress value={(onboardingStep + 1) / getMaxSteps() * 100} className="flex-1" />
                <span className="text-sm text-gray-500">{onboardingStep + 1}/{getMaxSteps()}</span>
              </div>
            </DialogHeader>
            
            {renderOnboardingStep()}
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={onboardingStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              
              {onboardingStep < 2 && (
                <Button 
                  onClick={nextStep}
                  disabled={
                    (onboardingStep === 0 && !onboardingData.role) ||
                    (onboardingStep === 1 && (!onboardingData.name || !onboardingData.email || !onboardingData.password))
                  }
                >
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-900 text-center">
                {mode === 'login' ? 'Connexion' : 'Créer un compte'}
              </DialogTitle>
              <DialogDescription className="text-center text-blue-600">
                {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte avec votre email'}
              </DialogDescription>
            </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-blue-800">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="mt-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-blue-800">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="mt-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {loginMutation.isPending || registerMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Chargement...</span>
              </div>
            ) : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </Button>
        </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-blue-600">
                {mode === 'login' ? (
                  <>
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-semibold text-blue-700 hover:text-blue-800 underline"
                    >
                      Créer un compte
                    </button>
                  </>
                ) : (
                  <>
                    Déjà un compte ?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-blue-700 hover:text-blue-800 underline"
                    >
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}