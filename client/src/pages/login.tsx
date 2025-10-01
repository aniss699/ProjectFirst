import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useLocation } from 'wouter';
import { useFormSubmit, validationHelpers } from '@/hooks/useFormSubmit';
import { useCreateApi } from '@/hooks/useApiCall';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    authSubmit.handleSubmit({ email, password });
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
            Accédez à votre espace personnel
          </p>
        </div>

        <div className="max-w-md mx-auto">
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
        </div>
      </div>
    </div>
  );
}