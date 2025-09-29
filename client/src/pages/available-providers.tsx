import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Clock, 
  Star, 
  MapPin, 
  Euro, 
  Calendar as CalendarIcon,
  Filter,
  Search,
  MessageCircle,
  Phone
} from 'lucide-react';
import { CATEGORIES as categories } from '@/lib/categories';

interface AvailableProvider {
  id: string;
  name: string;
  avatar?: string;
  category: string;
  location: string;
  rating: number;
  hourlyRate: number;
  availability: {
    date: string;
    timeSlots: string[];
  }[];
  skills: string[];
  responseTime: string;
  completedProjects: number;
  lastSeen?: string; // Added for the change
  memberSince?: string; // Added for the change
}

export default function AvailableProviders() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState({
    category: 'all',
    location: '',
    maxRate: '',
    availability: 'today'
  });
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    provider: AvailableProvider | null;
    selectedTimeSlot: string;
  }>({
    isOpen: false,
    provider: null,
    selectedTimeSlot: ''
  });
  const [bookingForm, setBookingForm] = useState({
    date: '',
    timeSlot: '',
    duration: '1',
    description: '',
    budget: ''
  });

  const { data: availableProviders = [] } = useQuery<AvailableProvider[]>({
    queryKey: ['/api/providers/available'],
  });

  // Données de démonstration
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const mockProviders: AvailableProvider[] = [
    {
      id: '1',
      name: 'Sophie Martin',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      category: 'design',
      location: 'Paris',
      rating: 4.9,
      hourlyRate: 65,
      skills: ['UI/UX Design', 'Figma', 'Adobe Creative'],
      responseTime: '< 1h',
      completedProjects: 127,
      availability: [
        {
          date: today.toISOString().split('T')[0],
          timeSlots: ['09:00-12:00', '14:00-17:00']
        },
        {
          date: tomorrow.toISOString().split('T')[0],
          timeSlots: ['10:00-16:00']
        }
      ],
      lastSeen: '2024-07-26T10:00:00Z',
      memberSince: '2023-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Thomas Dubois',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      category: 'development',
      location: 'Lyon',
      rating: 4.8,
      hourlyRate: 80,
      skills: ['React', 'Node.js', 'TypeScript'],
      responseTime: '< 30min',
      completedProjects: 89,
      availability: [
        {
          date: today.toISOString().split('T')[0],
          timeSlots: ['08:00-12:00', '13:00-18:00']
        }
      ],
      lastSeen: '2024-07-25T15:30:00Z',
      memberSince: '2022-05-20T00:00:00Z'
    },
    {
      id: '3',
      name: 'Marie Leroy',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      category: 'marketing',
      location: 'Marseille',
      rating: 4.7,
      hourlyRate: 55,
      skills: ['SEO', 'Google Ads', 'Analytics'],
      responseTime: '< 2h',
      completedProjects: 156,
      availability: [
        {
          date: today.toISOString().split('T')[0],
          timeSlots: ['09:00-13:00']
        },
        {
          date: tomorrow.toISOString().split('T')[0],
          timeSlots: ['14:00-18:00']
        }
      ],
      lastSeen: '2024-07-26T09:00:00Z',
      memberSince: '2023-11-01T00:00:00Z'
    }
  ];

  const filteredProviders = mockProviders.filter(provider => {
    if (filters.category !== 'all' && provider.category !== filters.category) return false;
    if (filters.location && !provider.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.maxRate && provider.hourlyRate > parseInt(filters.maxRate)) return false;

    if (filters.availability === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return provider.availability.some(avail => avail.date === today);
    }

    return true;
  });

  const getAvailabilityForDate = (provider: AvailableProvider, date: Date) => {
    if (!date || isNaN(date.getTime())) return [];
    const dateStr = date.toISOString().split('T')[0];
    return provider.availability.find(avail => avail.date === dateStr)?.timeSlots || [];
  };

  const selectedDateStr = selectedDate && !isNaN(selectedDate.getTime()) 
    ? selectedDate.toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];
  const providersAvailableOnDate = filteredProviders.filter(provider => 
    provider.availability.some(avail => avail.date === selectedDateStr)
  );

  const handleBookingOpen = (provider: AvailableProvider, timeSlot?: string) => {
    const bookingDate = selectedDate && !isNaN(selectedDate.getTime()) 
      ? selectedDate.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];

    setBookingModal({
      isOpen: true,
      provider,
      selectedTimeSlot: timeSlot || ''
    });
    setBookingForm({
      date: bookingDate,
      timeSlot: timeSlot || '',
      duration: '1',
      description: '',
      budget: ''
    });
  };

  const handleBookingSubmit = () => {
    // Logique de réservation à implémenter
    console.log('Réservation:', {
      provider: bookingModal.provider?.id,
      ...bookingForm
    });
    setBookingModal({ isOpen: false, provider: null, selectedTimeSlot: '' });
    // Afficher un message de succès
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Prestataires Disponibles
        </h1>
        <p className="text-lg text-gray-600">
          Trouvez des professionnels disponibles immédiatement avec leurs créneaux et tarifs
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filtres et Calendrier */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/90 rounded-lg shadow-sm border border-gray-200 p-2 backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-2">
              <Filter className="w-3 h-3 text-blue-600" />
              <h3 className="text-xs font-medium text-gray-700">Filtres</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({...prev, category: value}))}>
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  placeholder="Ville..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
                  className="h-6 text-xs"
                />
              </div>

              <div>
                <Input
                  type="number"
                  placeholder="Max €/h"
                  value={filters.maxRate}
                  onChange={(e) => setFilters(prev => ({...prev, maxRate: e.target.value}))}
                  className="h-6 text-xs"
                />
              </div>

              <div>
                <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({...prev, availability: value}))}>
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue placeholder="Dispo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Semaine</SelectItem>
                    <SelectItem value="all">Toutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              className="w-full h-5 text-xs px-2"
              onClick={() => setFilters({category: 'all', location: '', maxRate: '', availability: 'today'})}
            >
              Effacer
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Sélectionner une date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
              <div className="mt-4 text-sm text-gray-600">
                {providersAvailableOnDate.length} prestataire(s) disponible(s) le {selectedDate.toLocaleDateString('fr-FR')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des prestataires */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {filteredProviders.length} prestataires trouvés
            </h2>
            <div className="text-sm text-gray-500">
              Triés par disponibilité et note
            </div>
          </div>

          <div className="space-y-6">
            {filteredProviders.map((provider) => {
              const todaySlots = getAvailabilityForDate(provider, new Date());
              const selectedDateSlots = getAvailabilityForDate(provider, selectedDate);

              return (
                <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={provider.avatar} alt={provider.name} />
                          <AvatarFallback>{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold">{provider.name}</h3>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium ml-1">{provider.rating}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {provider.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Répond en {provider.responseTime}
                            </div>
                            <div>
                              {provider.completedProjects} projets
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {provider.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className="text-2xl font-bold text-green-600 mb-2">
                            {provider.hourlyRate}€/h
                          </div>

                          {/* Changes applied here */}
                          <span className="text-sm text-gray-500">
                            Dernier vu: {provider.lastSeen ? new Date(provider.lastSeen).toLocaleDateString() : 'Récemment'}
                          </span>
                          <br />
                          <span className="text-sm text-gray-500">
                            Membre depuis {provider.memberSince ? new Date(provider.memberSince).getFullYear() : '2024'}
                          </span>

                        </div>
                      </div>

                      <div className="lg:text-right space-y-3">
                        {/* Disponibilités aujourd'hui */}
                        {todaySlots.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-green-600 mb-1">
                              ✅ Disponible aujourd'hui
                            </div>
                            <div className="text-xs text-gray-600">
                              {todaySlots.join(', ')}
                            </div>
                          </div>
                        )}

                        {/* Disponibilités date sélectionnée */}
                        {selectedDateSlots.length > 0 && selectedDate.toDateString() !== new Date().toDateString() && (
                          <div>
                            <div className="text-sm font-medium text-blue-600 mb-1">
                              📅 Disponible le {selectedDate.toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-gray-600">
                              {selectedDateSlots.join(', ')}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2 flex-wrap">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = `/messages?provider=${provider.id}`}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                            onClick={() => window.open(`tel:+33${Math.floor(Math.random() * 1000000000)}`, '_self')}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Contacter
                          </Button>
                          <Dialog open={bookingModal.isOpen && bookingModal.provider?.id === provider.id} onOpenChange={(open) => !open && setBookingModal({ isOpen: false, provider: null, selectedTimeSlot: '' })}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                onClick={() => handleBookingOpen(provider)}
                              >
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                Réserver
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Réserver un créneau</DialogTitle>
                                <DialogDescription>
                                  Réservez un créneau avec {provider.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="date">Date</Label>
                                  <Input
                                    id="date"
                                    type="date"
                                    value={bookingForm.date}
                                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                                    min={new Date().toISOString().split('T')[0]}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="timeSlot">Créneaux disponibles</Label>
                                  <Select value={bookingForm.timeSlot} onValueChange={(value) => setBookingForm(prev => ({ ...prev, timeSlot: value }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un créneau" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {bookingForm.date && getAvailabilityForDate(provider, new Date(bookingForm.date)).map((slot) => (
                                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="duration">Durée (heures)</Label>
                                  <Select value={bookingForm.duration} onValueChange={(value) => setBookingForm(prev => ({ ...prev, duration: value }))}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 heure</SelectItem>
                                      <SelectItem value="2">2 heures</SelectItem>
                                      <SelectItem value="4">4 heures</SelectItem>
                                      <SelectItem value="8">Journée complète</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="budget">Budget estimé</Label>
                                  <Input
                                    id="budget"
                                    type="number"
                                    placeholder={`${provider.hourlyRate * parseInt(bookingForm.duration)}€`}
                                    value={bookingForm.budget}
                                    onChange={(e) => setBookingForm(prev => ({ ...prev, budget: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="description">Description du projet</Label>
                                  <Textarea
                                    id="description"
                                    placeholder="Décrivez brièvement votre projet..."
                                    value={bookingForm.description}
                                    onChange={(e) => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" className="flex-1" onClick={() => setBookingModal({ isOpen: false, provider: null, selectedTimeSlot: '' })}>
                                    Annuler
                                  </Button>
                                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" onClick={handleBookingSubmit}>
                                    Confirmer la réservation
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun prestataire disponible
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}