
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimeSlot {
  start: string;
  end: string;
  rate: number;
}

interface AvailabilityDay {
  date: Date;
  slots: TimeSlot[];
}

interface AvailabilityCalendarProps {
  readOnly?: boolean;
  initialAvailability?: AvailabilityDay[];
  onSave?: (availability: AvailabilityDay[]) => void;
}

export function AvailabilityCalendar({ 
  readOnly = false, 
  initialAvailability = [],
  onSave 
}: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<AvailabilityDay[]>(
    initialAvailability.map(avail => ({
      ...avail,
      date: typeof avail.date === 'string' ? new Date(avail.date) : avail.date
    }))
  );
  const [newSlot, setNewSlot] = useState<TimeSlot>({ start: '09:00', end: '17:00', rate: 50 });

  const getAvailabilityForDate = (date: Date) => {
    return availability.find(avail => 
      format(avail.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const addTimeSlot = () => {
    if (!selectedDate) return;
    
    const dateAvailability = getAvailabilityForDate(selectedDate);
    
    if (dateAvailability) {
      setAvailability(prev => prev.map(avail => 
        format(avail.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          ? { ...avail, slots: [...avail.slots, { ...newSlot }] }
          : avail
      ));
    } else {
      setAvailability(prev => [...prev, {
        date: selectedDate,
        slots: [{ ...newSlot }]
      }]);
    }
    
    setNewSlot({ start: '09:00', end: '17:00', rate: 50 });
  };

  const handleSave = async (data: AvailabilityDay[]) => {
    if (onSave) {
      onSave(data);
    }
  };

  const removeTimeSlot = (slotIndex: number) => {
    if (!selectedDate) return;
    
    setAvailability(prev => prev.map(avail => 
      format(avail.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        ? { ...avail, slots: avail.slots.filter((_, index) => index !== slotIndex) }
        : avail
    ).filter(avail => avail.slots.length > 0));
  };

  const selectedDateAvailability = selectedDate ? getAvailabilityForDate(selectedDate) : null;

  const modifiers = {
    available: availability.map(avail => avail.date)
  };

  const modifiersClassNames = {
    available: 'bg-green-100 text-green-900 font-semibold'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendrier */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Calendrier des disponibilités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={fr}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-lg border-0 shadow-inner bg-white p-4"
            disabled={readOnly ? undefined : (date) => date < new Date()}
          />
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="w-3 h-3 bg-green-100 border border-green-300 rounded inline-block mr-2"></span>
              Jours disponibles
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des créneaux */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
        <CardHeader>
          <CardTitle className="text-gray-800">
            {selectedDate 
              ? `Créneaux du ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}`
              : 'Sélectionnez une date'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Créneaux existants */}
          {selectedDateAvailability && selectedDateAvailability.slots.length > 0 ? (
            <div className="space-y-3">
              {selectedDateAvailability.slots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {slot.start} - {slot.end}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {slot.rate}€/h
                    </Badge>
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : selectedDate ? (
            <p className="text-gray-500 text-center py-6 italic">
              Aucun créneau défini pour cette date
            </p>
          ) : (
            <p className="text-gray-500 text-center py-6 italic">
              Sélectionnez une date dans le calendrier
            </p>
          )}

          {/* Formulaire d'ajout */}
          {!readOnly && selectedDate && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h4 className="font-medium text-gray-800">Ajouter un créneau</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Début
                  </label>
                  <Input
                    type="time"
                    value={newSlot.start}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, start: e.target.value }))}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin
                  </label>
                  <Input
                    type="time"
                    value={newSlot.end}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, end: e.target.value }))}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarif (€/heure)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newSlot.rate}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={addTimeSlot}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                disabled={!newSlot.start || !newSlot.end || newSlot.start >= newSlot.end}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter le créneau
              </Button>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          {!readOnly && onSave && (
            <Button
              onClick={() => handleSave(availability)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les disponibilités
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
