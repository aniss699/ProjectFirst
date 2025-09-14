import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { LogIn, User, Briefcase, Shield, Mail, Lock, Zap, Star, Trophy, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { verifyDemoAccounts } from '@/services/aiService';
import { useFormSubmit, validationHelpers } from '@/hooks/useFormSubmit';
import { useCreateApi } from '@/hooks/useApiCall';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Utilisation de l'architecture centralisée pour éliminer la duplication
  const loginApi = useCreateApi<any, { email: string; password: string }>('/api/auth/login', {
    successMessage: 'Connexion réussie ! Bienvenue sur Swideal',
    errorContext: 'Connexion utilisateur',
    onSuccess: (data) => {
      login(data.user);
      setTimeout(() => {
        setLocation('/');
      }, 1000);
    },
  });

  const authSubmit = useFormSubmit<{ email: string; password: string }>({
    onSubmit: async (data) => {
      loginApi.mutate(data);
    },
    validateBeforeSubmit: validationHelpers.validateAuth,
  });

  const demoAccounts = [
    {
      email: 'demo@swideal.com',
      password: 'demo123',
      name: 'Emma Rousseau',
      role: 'CLIENT',
      description: 'Compte client démo pour tester la plateforme',
      icon: <User className="w-5 h-5" />,
      color: 'blue',
      stats: ['Nouveau compte', 'Tests disponibles', 'Interface client']
    },
    {
      email: 'prestataire@swideal.com',
      password: 'demo123',
      name: 'Julien Moreau',
      role: 'PRO',
      description: 'Compte prestataire démo pour découvrir les outils',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'green',
      stats: ['Nouveau profil', 'Outils pros', 'Tests IA']
    },
    {
      email: 'admin@swideal.com',
      password: 'admin123',
      name: 'Clara Dubois',
      role: 'ADMIN',
      description: 'Administrateur plateforme avec accès complet',
      icon: <Shield className="w-5 h-5" />,
      color: 'purple',
      stats: ['Accès IA complet', 'Analytics avancées', 'Gestion plateforme']
    }
  ];

  // Pattern correct - plus de mutation de handleSubmit

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    authSubmit.handleSubmit({ email, password });
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleVerifyDemoAccounts = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyDemoAccounts();
      setVerificationResult(result);
      console.log('Résultat vérification:', result);
    } catch (error) {
      console.error('Erreur vérification:', error);
      authSubmit.handleError(error, 'Vérification des comptes');
    } finally {
      setIsVerifying(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 hover:bg-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50 hover:bg-green-100',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-700',
        icon: 'text-purple-600'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <LogIn className="w-10 h-10 mr-3 text-blue-600" />
            Connexion Swideal
          </h1>
          <p className="text-xl text-gray-600">
            Accédez à votre espace personnel ou utilisez un compte de démonstration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de connexion */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Se connecter</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    data-testid="input-password"
                  />
                </div>

                {/* Affichage centralisé des erreurs/succès */}
                {authSubmit.submitError && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700">{authSubmit.submitError}</AlertDescription>
                  </Alert>
                )}

                {authSubmit.submitSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">{authSubmit.submitSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={authSubmit.isSubmitting}
                  data-testid="button-login"
                >
                  {authSubmit.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Connexion...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Se connecter
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comptes de démonstration */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comptes de test</h2>
              <p className="text-gray-600">Découvrez Swideal avec nos comptes de démonstration</p>
            </div>

            <div className="space-y-4">
              {demoAccounts.map((account, index) => {
                const colorClasses = getColorClasses(account.color);
                return (
                  <Card
                    key={index}
                    className={`transition-all duration-200 cursor-pointer ${colorClasses.bg} ${colorClasses.border} border-2 hover:shadow-lg`}
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    data-testid={`demo-account-${account.role.toLowerCase()}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${colorClasses.bg} ${colorClasses.icon}`}>
                          {account.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{account.name}</h3>
                            <Badge variant="secondary" className={`${colorClasses.text} bg-white`}>
                              {account.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{account.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {account.stats.map((stat, statIndex) => (
                              <div key={statIndex} className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-700">{stat}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {account.email}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {account.password}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Outils de développement */}
            <Card className="bg-yellow-50 border-yellow-200 border-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-bold text-gray-900">Outils développeurs</h3>
                </div>
                <Button
                  onClick={handleVerifyDemoAccounts}
                  disabled={isVerifying}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  data-testid="button-verify-demo"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Vérification...
                    </div>
                  ) : (
                    "Vérifier les comptes démo"
                  )}
                </Button>
                
                {verificationResult && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h4 className="font-semibold text-sm mb-2">Résultat de vérification :</h4>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(verificationResult, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}