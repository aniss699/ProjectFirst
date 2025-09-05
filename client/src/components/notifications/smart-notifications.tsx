
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  Star,
  TrendingUp,
  AlertCircle,
  Settings,
  Filter
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'mission' | 'bid' | 'message' | 'payment' | 'review' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    missionId?: string;
    amount?: number;
    senderName?: string;
    rating?: number;
  };
}

interface NotificationSettings {
  newMissions: boolean;
  newBids: boolean;
  messages: boolean;
  payments: boolean;
  reviews: boolean;
  marketTrends: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export function SmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'mission',
      title: 'Nouvelle mission correspondante',
      description: 'Une mission "Développement React" correspond à vos compétences',
      timestamp: new Date('2024-01-15T11:00:00'),
      read: false,
      priority: 'high',
      actionUrl: '/missions/123',
      metadata: { missionId: '123' }
    },
    {
      id: '2',
      type: 'bid',
      title: 'Nouvelle offre reçue',
      description: 'Marie Dubois a fait une offre de 2500€ pour votre projet',
      timestamp: new Date('2024-01-15T10:45:00'),
      read: false,
      priority: 'medium',
      metadata: { amount: 2500, senderName: 'Marie Dubois' }
    },
    {
      id: '3',
      type: 'message',
      title: 'Nouveau message',
      description: 'Pierre Martin: "Le projet avance bien, livraison prévue demain"',
      timestamp: new Date('2024-01-15T10:30:00'),
      read: true,
      priority: 'medium',
      metadata: { senderName: 'Pierre Martin' }
    },
    {
      id: '4',
      type: 'payment',
      title: 'Paiement effectué',
      description: 'Votre paiement de 1800€ a été traité avec succès',
      timestamp: new Date('2024-01-15T09:15:00'),
      read: true,
      priority: 'high',
      metadata: { amount: 1800 }
    },
    {
      id: '5',
      type: 'review',
      title: 'Nouvelle évaluation',
      description: 'Sophie Laurent vous a donné 5 étoiles !',
      timestamp: new Date('2024-01-14T16:30:00'),
      read: true,
      priority: 'low',
      metadata: { rating: 5, senderName: 'Sophie Laurent' }
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    newMissions: true,
    newBids: true,
    messages: true,
    payments: true,
    reviews: true,
    marketTrends: false,
    emailNotifications: true,
    pushNotifications: true,
  });

  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high' || notification.priority === 'urgent';
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-red-500' : 
                     priority === 'high' ? 'text-orange-500' : 
                     priority === 'medium' ? 'text-blue-500' : 'text-gray-500';

    switch (type) {
      case 'mission': return <TrendingUp className={`w-5 h-5 ${iconClass}`} />;
      case 'bid': return <DollarSign className={`w-5 h-5 ${iconClass}`} />;
      case 'message': return <MessageSquare className={`w-5 h-5 ${iconClass}`} />;
      case 'payment': return <DollarSign className={`w-5 h-5 ${iconClass}`} />;
      case 'review': return <Star className={`w-5 h-5 ${iconClass}`} />;
      default: return <Bell className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-200';
      case 'high': return 'bg-orange-100 border-orange-200';
      case 'medium': return 'bg-blue-100 border-blue-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  useEffect(() => {
    // Simulation de nouvelles notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'message',
          title: 'Nouveau message',
          description: 'Vous avez reçu un nouveau message',
          timestamp: new Date(),
          read: false,
          priority: 'medium'
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-blue-900">
              <BellRing className="w-5 h-5 mr-2" />
              Centre de notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="w-4 h-4 mr-1" />
                Tout marquer lu
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Toutes ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Non lues ({unreadCount})
              </Button>
              <Button
                variant={filter === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('high')}
              >
                Importantes
              </Button>
            </div>

            <Separator />

            {/* Paramètres */}
            {showSettings && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">Paramètres de notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-blue-800">Types de notifications</h4>
                      {Object.entries(settings).slice(0, 6).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-blue-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => 
                              setSettings(prev => ({ ...prev, [key]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-blue-800">Canaux de notification</h4>
                      {Object.entries(settings).slice(6).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-blue-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => 
                              setSettings(prev => ({ ...prev, [key]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste des notifications */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`${!notification.read ? getPriorityColor(notification.priority) : 'bg-white'} transition-all hover:shadow-md`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${!notification.read ? 'text-blue-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(notification.timestamp).toLocaleString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
