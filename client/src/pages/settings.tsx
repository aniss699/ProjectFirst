
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Globe, 
  Shield, 
  Palette,
  Save,
  User,
  MessageSquare,
  DollarSign,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface NotificationSettings {
  // Notifications par type
  newMissions: boolean;
  newBids: boolean;
  messages: boolean;
  payments: boolean;
  reviews: boolean;
  systemUpdates: boolean;
  marketTrends: boolean;
  
  // Canaux de notification
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  
  // Préférences avancées
  quietHours: boolean;
  weekendNotifications: boolean;
  instantNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  showActivity: boolean;
  showLastSeen: boolean;
  allowDirectMessages: boolean;
  showInSearchResults: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  compactMode: boolean;
  showAnimations: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newMissions: true,
    newBids: true,
    messages: true,
    payments: true,
    reviews: true,
    systemUpdates: true,
    marketTrends: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    quietHours: false,
    weekendNotifications: true,
    instantNotifications: false
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showActivity: true,
    showLastSeen: true,
    allowDirectMessages: true,
    showInSearchResults: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'auto',
    language: 'fr',
    compactMode: false,
    showAnimations: true
  });

  // Charger les paramètres au montage
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/user-settings', {
          headers: {
            'x-user-id': user.id.toString()
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.notifications) setNotificationSettings(data.notifications);
          if (data.privacy) setPrivacySettings(data.privacy);
          if (data.appearance) setAppearanceSettings(data.appearance);
        }
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSaveNotifications = async () => {
    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id.toString()
        },
        body: JSON.stringify({
          notifications: notificationSettings,
          privacy: privacySettings,
          appearance: appearanceSettings
        })
      });

      if (response.ok) {
        toast({
          title: "Paramètres sauvegardés",
          description: "Vos préférences de notifications ont été mises à jour.",
        });
      } else {
        throw new Error('Erreur réseau');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    }
  };

  const handleSavePrivacy = async () => {
    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id.toString()
        },
        body: JSON.stringify({
          notifications: notificationSettings,
          privacy: privacySettings,
          appearance: appearanceSettings
        })
      });

      if (response.ok) {
        toast({
          title: "Paramètres sauvegardés",
          description: "Vos préférences de confidentialité ont été mises à jour.",
        });
      } else {
        throw new Error('Erreur réseau');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAppearance = async () => {
    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id.toString()
        },
        body: JSON.stringify({
          notifications: notificationSettings,
          privacy: privacySettings,
          appearance: appearanceSettings
        })
      });

      if (response.ok) {
        toast({
          title: "Paramètres sauvegardés",
          description: "Vos préférences d'apparence ont été mises à jour.",
        });
      } else {
        throw new Error('Erreur réseau');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
            <p className="text-gray-600">Connectez-vous pour accéder aux paramètres</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chargement...</h2>
            <p className="text-gray-600">Récupération de vos paramètres</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Apparence
            </TabsTrigger>
          </TabsList>

          {/* Onglet Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Types de notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <div>
                          <Label className="font-medium">Nouvelles missions</Label>
                          <p className="text-sm text-gray-500">Missions correspondant à vos critères</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.newMissions}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, newMissions: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <div>
                          <Label className="font-medium">Nouvelles offres</Label>
                          <p className="text-sm text-gray-500">Offres reçues sur vos missions</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.newBids}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, newBids: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <div>
                          <Label className="font-medium">Messages</Label>
                          <p className="text-sm text-gray-500">Nouveaux messages reçus</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.messages}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, messages: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <div>
                          <Label className="font-medium">Paiements</Label>
                          <p className="text-sm text-gray-500">Transactions et factures</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.payments}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, payments: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-orange-500" />
                        <div>
                          <Label className="font-medium">Avis et évaluations</Label>
                          <p className="text-sm text-gray-500">Nouveaux avis reçus</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.reviews}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, reviews: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        <div>
                          <Label className="font-medium">Tendances marché</Label>
                          <p className="text-sm text-gray-500">Analyse et insights IA</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.marketTrends}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, marketTrends: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Canaux de notification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <Label>Email</Label>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-green-500" />
                        <Label>Push</Label>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <Label>SMS</Label>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Confidentialité */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Paramètres de confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Visibilité du profil</Label>
                      <p className="text-sm text-gray-500">Qui peut voir votre profil</p>
                    </div>
                    <select 
                      className="border rounded px-3 py-2"
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings(prev => ({ 
                        ...prev, 
                        profileVisibility: e.target.value as any 
                      }))}
                    >
                      <option value="public">Public</option>
                      <option value="contacts">Contacts uniquement</option>
                      <option value="private">Privé</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Afficher dans les résultats de recherche</Label>
                      <p className="text-sm text-gray-500">Apparaître dans les recherches publiques</p>
                    </div>
                    <Switch
                      checked={privacySettings.showInSearchResults}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, showInSearchResults: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Autoriser les messages directs</Label>
                      <p className="text-sm text-gray-500">Recevoir des messages de tous les utilisateurs</p>
                    </div>
                    <Switch
                      checked={privacySettings.allowDirectMessages}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, allowDirectMessages: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Afficher l'activité</Label>
                      <p className="text-sm text-gray-500">Montrer votre statut d'activité</p>
                    </div>
                    <Switch
                      checked={privacySettings.showActivity}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, showActivity: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Afficher la dernière connexion</Label>
                      <p className="text-sm text-gray-500">Montrer quand vous étiez en ligne</p>
                    </div>
                    <Switch
                      checked={privacySettings.showLastSeen}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, showLastSeen: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePrivacy} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Apparence */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Paramètres d'apparence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Thème</Label>
                      <p className="text-sm text-gray-500">Choisir l'apparence de l'interface</p>
                    </div>
                    <select 
                      className="border rounded px-3 py-2"
                      value={appearanceSettings.theme}
                      onChange={(e) => setAppearanceSettings(prev => ({ 
                        ...prev, 
                        theme: e.target.value as any 
                      }))}
                    >
                      <option value="auto">Automatique</option>
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Langue</Label>
                      <p className="text-sm text-gray-500">Langue de l'interface</p>
                    </div>
                    <select 
                      className="border rounded px-3 py-2"
                      value={appearanceSettings.language}
                      onChange={(e) => setAppearanceSettings(prev => ({ 
                        ...prev, 
                        language: e.target.value as any 
                      }))}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Mode compact</Label>
                      <p className="text-sm text-gray-500">Interface plus dense</p>
                    </div>
                    <Switch
                      checked={appearanceSettings.compactMode}
                      onCheckedChange={(checked) => 
                        setAppearanceSettings(prev => ({ ...prev, compactMode: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Animations</Label>
                      <p className="text-sm text-gray-500">Activer les animations d'interface</p>
                    </div>
                    <Switch
                      checked={appearanceSettings.showAnimations}
                      onCheckedChange={(checked) => 
                        setAppearanceSettings(prev => ({ ...prev, showAnimations: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveAppearance} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
