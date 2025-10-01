import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { servicesApi } from '@/lib/api/services';
import { Loader2, GraduationCap, Clock, Users, Calendar, MapPin, Euro, Star, User } from 'lucide-react';
import { z } from 'zod';

const courseSchema = z.object({
  subject: z.string().min(1, "Veuillez sélectionner un domaine"),
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string().min(20, "La description doit faire au moins 20 caractères"),
  level: z.string().min(1, "Veuillez sélectionner un niveau"),
  maxStudents: z.number().min(2).max(20),
  pricePerStudent: z.number().min(10, "Le prix minimum est de 10€"),
  duration: z.number().min(30, "Durée minimum 30 minutes"),
  location: z.string().min(1, "La localisation est requise"),
  materials: z.string().optional(),
  timeSlots: z.array(z.object({
    date: z.string(),
    time: z.string(),
    available: z.boolean()
  })).min(1, "Ajoutez au moins un créneau")
});

type CourseFormData = z.infer<typeof courseSchema>;

const subjects = [
  'Langues (Anglais, Espagnol, etc.)',
  'Informatique & Programmation',
  'Marketing Digital',
  'Design & Créativité',
  'Musique & Arts',
  'Cuisine & Gastronomie',
  'Sport & Fitness',
  'Développement Personnel',
  'Mathématiques & Sciences',
  'Business & Entrepreneuriat'
];

const levels = [
  'Débutant',
  'Intermédiaire',
  'Avancé',
  'Tous niveaux'
];

interface AvailableSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function CollectiveCoursesPage() {
  const [mode, setMode] = useState<'create' | 'browse' | 'exchange'>('browse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      subject: '',
      title: '',
      description: '',
      level: '',
      maxStudents: 8,
      pricePerStudent: 25,
      duration: 90,
      location: '',
      materials: '',
      timeSlots: []
    }
  });

  const [timeSlots, setTimeSlots] = useState<AvailableSlot[]>([]);

  useEffect(() => {
    fetchAvailableCourses();
  }, [selectedSubject]);

  const fetchAvailableCourses = async () => {
    try {
      // Mock data pour les cours disponibles
      const mockCourses = [
        {
          id: 1,
          teacherName: "Sophie Martin",
          rating: 4.8,
          title: "Anglais conversationnel intensif",
          subject: "Langues (Anglais, Espagnol, etc.)",
          level: "Intermédiaire",
          pricePerStudent: 30,
          duration: 120,
          maxStudents: 6,
          studentsEnrolled: 4,
          nextSlot: "2024-02-15T10:00:00",
          location: "Paris 15ème",
          description: "Améliorez votre anglais oral dans une ambiance conviviale"
        },
        {
          id: 2,
          teacherName: "Marc Dubois",
          rating: 4.9,
          title: "JavaScript pour débutants",
          subject: "Informatique & Programmation",
          level: "Débutant",
          pricePerStudent: 35,
          duration: 180,
          maxStudents: 8,
          studentsEnrolled: 3,
          nextSlot: "2024-02-16T14:00:00",
          location: "Lyon Centre",
          description: "Apprenez les bases du JavaScript en petit groupe"
        }
      ];

      setAvailableCourses(selectedSubject && selectedSubject !== 'all'
        ? mockCourses.filter(course => course.subject === selectedSubject)
        : mockCourses
      );
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    }
  };

  const addTimeSlot = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    setTimeSlots(prev => [...prev, {
      date: dateStr,
      time: '10:00',
      available: true
    }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof AvailableSlot, value: string | boolean) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const courseData = {
        ...data,
        timeSlots
      };

      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Cours collectif créé !",
        description: "Votre cours est maintenant visible par tous les élèves intéressés.",
      });

      form.reset();
      setTimeSlots([]);
      setMode('browse');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le cours. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const enrollInCourse = async (courseId: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Inscription réussie !",
        description: "Vous êtes maintenant inscrit à ce cours.",
      });
      fetchAvailableCourses();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de s'inscrire. Réessayez.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cours Collectifs</h1>
          <p className="text-gray-600">Apprenez ensemble, progressez plus vite</p>
        </div>

        {/* Toggle Mode */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <Button
              variant={mode === 'browse' ? 'default' : 'ghost'}
              onClick={() => setMode('browse')}
              className="rounded-md"
            >
              <Users className="w-4 h-4 mr-2" />
              Trouver un cours
            </Button>
            <Button
              variant={mode === 'create' ? 'default' : 'ghost'}
              onClick={() => setMode('create')}
              className="rounded-md"
            >
              <User className="w-4 h-4 mr-2" />
              Proposer un cours
            </Button>
            <Button
              variant={mode === 'exchange' ? 'default' : 'ghost'}
              onClick={() => setMode('exchange')}
              className="rounded-md"
            >
              <MapPin className="w-4 h-4 mr-2" />
              J'ai un lieu
            </Button>
          </div>
        </div>

        {mode === 'browse' ? (
          <div className="space-y-6">
            {/* Filtres */}
            <Card>
              <CardHeader>
                <CardTitle>Filtrer les cours</CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les domaines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les domaines</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Liste des cours */}
            <div className="grid gap-6">
              {availableCourses.map(course => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{course.title}</h3>
                          <Badge variant="outline">{course.level}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {course.teacherName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {course.rating}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {course.location}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{course.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="font-semibold text-emerald-600">{course.pricePerStudent}€</div>
                            <div className="text-xs text-gray-500">par élève</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{course.duration}min</div>
                            <div className="text-xs text-gray-500">durée</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{course.studentsEnrolled}/{course.maxStudents}</div>
                            <div className="text-xs text-gray-500">inscrits</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">
                              {new Date(course.nextSlot).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(course.nextSlot).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge 
                        variant={course.studentsEnrolled < course.maxStudents ? "default" : "secondary"}
                        className={course.studentsEnrolled < course.maxStudents ? "bg-green-500" : ""}
                      >
                        {course.studentsEnrolled < course.maxStudents ? "Places disponibles" : "Complet"}
                      </Badge>

                      <Button 
                        onClick={() => enrollInCourse(course.id)}
                        disabled={course.studentsEnrolled >= course.maxStudents}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        S'inscrire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : mode === 'create' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Proposer un cours collectif</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domaine d'enseignement</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un domaine" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez le niveau" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {levels.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du cours</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Anglais conversationnel pour le business"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description du cours</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez le contenu, les objectifs, votre méthode..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="maxStudents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre max d'élèves</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={2}
                              max={20}
                              placeholder="8"
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricePerStudent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix par élève (€)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Euro className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <Input 
                                type="number" 
                                min={10}
                                placeholder="25"
                                className="pl-10"
                                {...field} 
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={30}
                              placeholder="90"
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lieu du cours</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input 
                              placeholder="Paris, Lyon, ou en visio..."
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="materials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matériel requis (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ordinateur portable, cahier, aucun matériel spécifique..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Créneaux horaires */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Créneaux proposés</h3>
                      <Button type="button" onClick={addTimeSlot} variant="outline">
                        <Clock className="w-4 h-4 mr-2" />
                        Ajouter un créneau
                      </Button>
                    </div>

                    {timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <Input
                            type="date"
                            value={slot.date}
                            onChange={(e) => updateTimeSlot(index, 'date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <Input
                            type="time"
                            value={slot.time}
                            onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
                          />
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={slot.available}
                              onCheckedChange={(checked) => updateTimeSlot(index, 'available', checked)}
                            />
                            <span className="text-sm">Disponible</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}

                    {timeSlots.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Aucun créneau ajouté. Cliquez sur "Ajouter un créneau" pour commencer.
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || timeSlots.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Créer le cours collectif
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : mode === 'exchange' ? (
          <div className="space-y-6">
            {/* Formulaire d'échange lieu contre cours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>J'ai un lieu - Cours gratuit en échange</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                    <h3 className="font-semibold text-emerald-800 mb-3">💡 Le concept : Lieu contre Cours</h3>
                    <div className="text-sm text-emerald-700 space-y-2">
                      <p className="font-medium">Vous cherchez un cours mais vous n'avez pas le budget ?</p>
                      <p>
                        <strong>Votre solution :</strong> Mettez votre salon, bureau ou jardin à disposition pour organiser un cours collectif ! 
                        En échange, vous participez <span className="font-semibold text-emerald-800">entièrement gratuitement</span> au cours que vous souhaitez.
                      </p>
                      <div className="flex items-start space-x-2 mt-3">
                        <span className="text-emerald-600">🏠</span>
                        <span>Vous : un lieu confortable pour 4-8 personnes</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-emerald-600">👨‍🏫</span>
                        <span>Professeur : vient chez vous donner le cours</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-emerald-600">🎓</span>
                        <span>Résultat : cours gratuit + convivialité à domicile</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Domaine souhaité
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Cours recherché" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Niveau souhaité
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Votre niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Description du cours recherché
                    </label>
                    <Textarea 
                      placeholder="Ex: Cours de français conversation, perfectionnement écrit..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-800 mb-4">📍 Votre lieu</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Type de lieu
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="salon">Salon/séjour</SelectItem>
                            <SelectItem value="bureau">Bureau/espace de travail</SelectItem>
                            <SelectItem value="salle_reunion">Salle de réunion</SelectItem>
                            <SelectItem value="jardin">Jardin/terrasse</SelectItem>
                            <SelectItem value="local_asso">Local associatif</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Capacité max
                        </label>
                        <Input 
                          type="number" 
                          min={3}
                          max={15}
                          placeholder="6"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Adresse du lieu
                      </label>
                      <Input 
                        placeholder="Adresse complète du lieu de cours"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Équipements disponibles
                      </label>
                      <Textarea 
                        placeholder="Ex: WiFi, tableau blanc, projecteur, cuisine accessible..."
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Disponibilités
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Quand êtes-vous disponible ?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekend">Week-end uniquement</SelectItem>
                            <SelectItem value="soir_semaine">Soirs de semaine</SelectItem>
                            <SelectItem value="mercredi">Mercredi</SelectItem>
                            <SelectItem value="flexible">Très flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Durée max souhaitée
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Durée de cours" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60">1 heure</SelectItem>
                            <SelectItem value="90">1h30</SelectItem>
                            <SelectItem value="120">2 heures</SelectItem>
                            <SelectItem value="180">3 heures</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">✨ Vos avantages</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Cours entièrement gratuit pour vous</li>
                      <li>• Apprentissage dans un cadre familier</li>
                      <li>• Rencontre avec d'autres passionnés près de chez vous</li>
                      <li>• Professeurs qualifiés qui viennent à vous</li>
                    </ul>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3 text-lg font-semibold">
                    <MapPin className="w-5 h-5 mr-2" />
                    Proposer mon lieu en échange
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Offres d'échange existantes */}
            <Card>
              <CardHeader>
                <CardTitle>🏠 Offres d'échange en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Exemple d'offre */}
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Cours d'anglais conversationnel</h3>
                        <p className="text-gray-600 text-sm">Recherche prof pour groupe de 4-6 personnes • Niveau intermédiaire</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Lieu disponible
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Lieu:</span>
                        <div className="font-medium">Salon 25m²</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Capacité:</span>
                        <div className="font-medium">6 personnes</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Zone:</span>
                        <div className="font-medium">Paris 11ème</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Équipements:</span>
                        <div className="font-medium">WiFi, tableau</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Proposé par <span className="font-medium">Marie L.</span> • il y a 2 jours
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600" size="sm">
                          Proposer un cours
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Autre exemple */}
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Cours de cuisine italienne</h3>
                        <p className="text-gray-600 text-sm">Recherche chef pour cours pratique • Tous niveaux</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Cuisine équipée
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Lieu:</span>
                        <div className="font-medium">Cuisine ouverte</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Capacité:</span>
                        <div className="font-medium">4 personnes</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Zone:</span>
                        <div className="font-medium">Lyon 2ème</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Équipements:</span>
                        <div className="font-medium">Four, plaques, ustensiles</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Proposé par <span className="font-medium">Thomas B.</span> • il y a 1 jour
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600" size="sm">
                          Proposer un cours
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}