
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { servicesApi } from '@/lib/api/services';
import { Loader2, Users, UserPlus, MapPin, Euro, Calendar, Star } from 'lucide-react';
import { z } from 'zod';

const teamBuildingSchema = z.object({
  teamName: z.string().min(3, "Le nom d'équipe doit faire au moins 3 caractères"),
  specialty: z.string().min(1, "Veuillez sélectionner une spécialité"),
  description: z.string().min(20, "La description doit faire au moins 20 caractères"),
  targetSize: z.number().min(2).max(10),
  location: z.string().min(1, "La localisation est requise"),
  hourlyRate: z.number().min(10, "Le taux horaire minimum est de 10€"),
  availability: z.string().min(1, "Veuillez indiquer votre disponibilité"),
  experience: z.string().min(1, "Veuillez sélectionner votre niveau d'expérience"),
});

type TeamBuildingFormData = z.infer<typeof teamBuildingSchema>;

const specialties = [
  'Sécurité et surveillance',
  'Développement web',
  'Design graphique',
  'Marketing digital',
  'Traduction',
  'Événementiel',
  'Nettoyage professionnel',
  'Formation et coaching',
  'Maintenance technique',
  'Consulting business'
];

export default function TeamBuildingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<TeamBuildingFormData>({
    resolver: zodResolver(teamBuildingSchema),
    defaultValues: {
      teamName: '',
      specialty: '',
      description: '',
      targetSize: 3,
      location: '',
      hourlyRate: 50,
      availability: '',
      experience: '',
    }
  });

  const onSubmit = async (data: TeamBuildingFormData) => {
    setIsSubmitting(true);
    try {
      // Simuler l'API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Équipe créée avec succès !",
        description: "Votre équipe est maintenant visible et d'autres experts peuvent la rejoindre.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'équipe. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Construction d'Équipe</h1>
          <p className="text-gray-600">Créez une équipe d'experts dans votre domaine</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Créer votre équipe professionnelle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'équipe</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Équipe Sécurité Pro Paris"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spécialité de l'équipe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une spécialité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specialties.map(specialty => (
                            <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description de l'équipe</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez votre équipe, vos compétences, votre approche..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taille cible de l'équipe</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={2}
                            max={10}
                            placeholder="3"
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
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taux horaire d'équipe (€)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Euro className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input 
                              type="number" 
                              min={10}
                              placeholder="50"
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
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone d'intervention</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Paris, Lyon, France, Europe..."
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
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau d'expérience requis</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="junior">Junior (1-3 ans)</SelectItem>
                          <SelectItem value="intermediate">Intermédiaire (3-5 ans)</SelectItem>
                          <SelectItem value="senior">Senior (5+ ans)</SelectItem>
                          <SelectItem value="expert">Expert (10+ ans)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilité</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Ex: Disponible immédiatement, weekends..."
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100">1</Badge>
                      <span>Vous créez votre équipe et définissez les profils recherchés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100">2</Badge>
                      <span>D'autres experts postulent pour rejoindre votre équipe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100">3</Badge>
                      <span>Une fois complète, votre équipe est disponible pour des missions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100">4</Badge>
                      <span>Les revenus sont répartis équitablement entre les membres</span>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 py-3 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Créer l'équipe
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
