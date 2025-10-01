import React, { useState, useEffect } from 'react';
import { Bell, X, Check, ExternalLink, MessageSquare, Trophy, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRelativeTime } from '@/lib/categories';
import { useWebSocket } from '../../hooks/use-websocket'; // Assuming this path is correct
import { useAuth } from '../../hooks/use-auth'; // Assuming this path is correct

export interface Notification {
  id: string;
  type: 'message' | 'bid' | 'payment' | 'system' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: any;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

export function NotificationCenter({ 
  notifications: initialNotifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete 
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'today'>('all');
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(initialNotifications);
  const { lastMessage, isConnected } = useWebSocket(); // Assuming useWebSocket hook provides necessary functions

  // Update local notifications when initialNotifications change
  useEffect(() => {
    setLocalNotifications(initialNotifications);
  }, [initialNotifications]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_notification') {
      const newNotification: Notification = {
        ...lastMessage.notification,
        timestamp: new Date(lastMessage.notification.timestamp),
        read: false, // Assume new notifications are unread
      };
      setLocalNotifications(prev => [newNotification, ...prev]);
      // Optionally request browser notification if permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.description,
          icon: '/favicon.ico' // Replace with your actual icon path
        });
      }
    }
  }, [lastMessage]);


  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'bid': return DollarSign;
      case 'payment': return DollarSign;
      case 'achievement': return Trophy;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-orange-500 bg-orange-50';
      case 'low': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = localNotifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return notification.timestamp >= today;
    }
    return true;
  });

  const unreadCount = localNotifications.filter(n => !n.read).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                onMarkAllAsRead();
                setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
              }}
              className="text-xs"
            >
              Tout marquer lu
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Toutes ({localNotifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Non lues ({unreadCount})</TabsTrigger>
            <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const IconComponent = getIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        notification.read 
                          ? 'bg-muted/50 border-muted' 
                          : 'bg-white border-primary/20 shadow-sm'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          onMarkAsRead(notification.id);
                          setLocalNotifications(prev => 
                            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                          );
                        }
                        if (notification.actionUrl) {
                          window.open(notification.actionUrl, '_blank');
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-muted-foreground' : 'text-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click from firing
                                    onMarkAsRead(notification.id);
                                    setLocalNotifications(prev => 
                                      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                                    );
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click from firing
                                  onDelete(notification.id);
                                  setLocalNotifications(prev => prev.filter(n => n.id !== notification.id));
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.description}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(notification.timestamp)}
                            </span>

                            {notification.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                            {notification.actionUrl && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(notification.actionUrl, '_blank');
                                }}
                              >
                                Voir plus <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Hook for managing notifications, potentially to be used in conjunction with backend logic
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { sendMessage } = useWebSocket(); // Assuming sendMessage is available from useWebSocket

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read' | 'priority' | 'actionUrl' | 'metadata'> & { priority?: Notification['priority'], actionUrl?: string, metadata?: any }) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More robust unique ID
      timestamp: new Date(),
      read: false,
      priority: notificationData.priority || 'low', // Default priority
      actionUrl: notificationData.actionUrl,
      metadata: notificationData.metadata
    };
    
    setNotifications(prev => [newNotification, ...prev]);

    // Send notification to backend via WebSocket if connected
    if (sendMessage) {
      sendMessage({
        type: 'send_notification',
        notification: {
          ...newNotification,
          timestamp: newNotification.timestamp.toISOString(), // Ensure timestamp is serializable
          read: false,
        }
      });
    }

    // Request browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.description,
        icon: '/favicon.ico' // Replace with your actual icon path
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // Ideally, send an update to the backend as well
    if (sendMessage) {
      sendMessage({
        type: 'mark_notification_read',
        notificationId: id,
      });
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
     // Ideally, send an update to the backend as well
    if (sendMessage) {
      sendMessage({
        type: 'mark_all_notifications_read',
      });
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Ideally, send an update to the backend as well
    if (sendMessage) {
      sendMessage({
        type: 'delete_notification',
        notificationId: id,
      });
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  };

  // Fetch initial notifications from backend on mount (optional, if not handled by WebSocket)
  useEffect(() => {
    const fetchNotifications = async () => {
      // Replace with your actual API call or WebSocket message to fetch initial data
      // Example:
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      // const formattedData = data.map((n: any) => ({ ...n, timestamp: new Date(n.created_at), read: n.read_at !== null }));
      // setNotifications(formattedData);
    };

    // fetchNotifications(); // Uncomment when API is available
  }, []); // Empty dependency array means this runs once on mount

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission,
    setNotifications // Expose setNotifications for direct manipulation if needed
  };
}