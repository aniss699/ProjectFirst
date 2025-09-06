
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
import { useToast } from '@/hooks/use-toast';
import { servicesApi } from '@/lib/api/services';
import { groupRequestSchema, type GroupRequestFormData } from '@/lib/validation/services';
import { Loader2, Users, MapPin, Euro, TrendingUp } from 'lucide-react';

const categories = [
  'Développement web',
  'Design graphique',
  'Marketing digital',
  'Rédaction',
  'Formation',
  'Conseil',
  'Traduction',
  'Maintenance'
];

export default function GroupRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const { toast } = useToast();
  
  const form = useForm<GroupRequestFormData>({
    resolver: zodResolver(groupRequestSchema),
    defaultValues: {
      category: '',
      need: '',
      location: '',
      pricePerParticipant: 0,
      targetParticipants: 2,
      deadline: '',
    }
  });

  const watchedCategory = form.watch('category');
  const watchedLocation = form.watch('location');

  useEffect(() => {
    if (watchedCategory && watchedLocation) {
      servicesApi.getGroupInterest(watchedLocation, watchedCategory)
        .then(result => setInterestCount(result.count));
    }
  }, [watchedCategory, watchedLocation]);

  const onSubmit = async (data: GroupRequestFormData) => {
    setIsSubmitting(true);
    try {
      const result = await servicesApi.createGroupRequest(data);
      if (result.success) {
        toast({
          title: "Demande groupée créée !",
          description: "Nous allons chercher d'autres participants dans votre zone.",
        });
        form.reset();
        setInterestCount(0);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande groupée. Réessayez.",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demandes Groupées</h1>
          <p className="text-gray-600">Mutualisez vos besoins pour obtenir des tarifs préférentiels</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Créer une demande groupée</span>
              </div>
              {interestCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {interestCount} personnes intéressées
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie de service</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="need"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Décrivez votre besoin</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Détaillez le service recherché pour le groupe..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone géographique</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Ville ou code postal..."
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricePerParticipant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix par participant (€)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Euro className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input 
                              type="number" 
                              placeholder="100"
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
                    name="targetParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nb participants visé</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={2}
                            placeholder="5"
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
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date limite d'inscription</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      Créer la demande groupée
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
