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

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      login(data.user);
      setSuccess(data.message);

      setTimeout(() => {
        setLocation('/');
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
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

                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-yellow-600" />
                Comptes Démo
              </CardTitle>
              <p className="text-center text-gray-600">
                Testez la plateforme avec des comptes pré-configurés
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoAccounts.map((account, index) => {
                const colorClasses = getColorClasses(account.color);

                return (
                  <Card 
                    key={index} 
                    className={`${colorClasses.bg} ${colorClasses.border} border transition-all cursor-pointer hover:shadow-md`}
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    data-testid={`card-demo-${account.role.toLowerCase()}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center border ${colorClasses.border}`}>
                          <div className={colorClasses.icon}>
                            {account.icon}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${colorClasses.text}`}>
                              {account.name}
                            </h3>
                            <Badge variant="outline" className={`text-xs ${colorClasses.text} ${colorClasses.border}`}>
                              {account.role}
                            </Badge>
                          </div>

                          <p className={`text-sm ${colorClasses.text} mb-2`}>
                            {account.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {account.stats.map((stat, statIndex) => (
                              <div key={statIndex} className={`flex items-center gap-1 text-xs ${colorClasses.text}`}>
                                {statIndex === 0 && <Trophy className="w-3 h-3" />}
                                {statIndex === 1 && <Star className="w-3 h-3" />}
                                {statIndex === 2 && <Zap className="w-3 h-3" />}
                                <span>{stat}</span>
                              </div>
                            ))}
                          </div>

                          <div className={`text-xs ${colorClasses.text} mt-2 font-mono`}>
                            📧 {account.email}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  Fonctionnalités débloquées
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Système IA complet avec analyses prédictives</li>
                  <li>• Projets et offres réalistes pré-créés</li>
                  <li>• Tableau de bord interactif en temps réel</li>
                  <li>• Données de marché et métriques avancées</li>
                </ul>
              </div>

              <Button 
                onClick={handleVerifyDemoAccounts} 
                disabled={isVerifying}
                className="w-full mt-4"
                data-testid="button-verify-demo"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Vérification...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Vérifier les comptes démo
                  </div>
                )}
              </Button>

              {verificationResult && (
                <Alert className="mt-4">
                  <AlertDescription>
                    {verificationResult.message}
                  </AlertDescription>
                </Alert>
              )}

            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Nouveau sur Swideal ?{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}