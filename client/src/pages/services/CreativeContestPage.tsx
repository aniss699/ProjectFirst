
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
import { Loader2, Trophy, Palette, Euro, Calendar, Users, Gift } from 'lucide-react';
import { z } from 'zod';

const creativeContestSchema = z.object({
  projectTitle: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  description: z.string().min(50, "La description doit faire au moins 50 caractères"),
  mainPrize: z.number().min(100, "Le prix principal minimum est de 100€"),
  participationReward: z.number().min(10, "La récompense de participation minimum est de 10€"),
  maxParticipants: z.number().min(3).max(20),
  deadline: z.string().min(1, "Veuillez définir une date limite"),
  requirements: z.string().min(20, "Détaillez les exigences créatives"),
});

type CreativeContestFormData = z.infer<typeof creativeContestSchema>;

const creativeCategories = [
  'Logo et identité visuelle',
  'Design web et mobile',
  'Illustration et artwork',
  'Packaging et print',
  'Vidéo et motion design',
  'Photographie',
  'Rédaction créative',
  'Concept marketing',
  'Design produit',
  'Architecture et 3D'
];

export default function CreativeContestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<CreativeContestFormData>({
    resolver: zodResolver(creativeContestSchema),
    defaultValues: {
      projectTitle: '',
      category: '',
      description: '',
      mainPrize: 500,
      participationReward: 50,
      maxParticipants: 5,
      deadline: '',
      requirements: '',
    }
  });

  const watchedMainPrize = form.watch('mainPrize');
  const watchedParticipationReward = form.watch('participationReward');
  const watchedMaxParticipants = form.watch('maxParticipants');

  const totalBudget = watchedMainPrize + (watchedParticipationReward * (watchedMaxParticipants - 1));

  const onSubmit = async (data: CreativeContestFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Concours créatif lancé !",
        description: "Votre concours est maintenant visible par tous les créatifs de la plateforme.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de lancer le concours. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Concours Créatif</h1>
          <p className="text-gray-600">Obtenez plusieurs créations et choisissez la meilleure</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <span>Lancer votre concours créatif</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="projectTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du projet</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Logo pour startup tech innovante"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie créative</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {creativeCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
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
                      <FormLabel>Description du projet</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez votre vision, vos objectifs, votre public cible..."
                          className="min-h-[120px]"
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
                    name="mainPrize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix principal (€)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Euro className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input 
                              type="number" 
                              min={100}
                              placeholder="500"
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
                    name="participationReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Récompense participation (€)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Gift className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre max de participants</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input 
                              type="number" 
                              min={3}
                              max={20}
                              placeholder="5"
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
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date limite de soumission</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exigences et contraintes créatives</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Formats requis, couleurs, style, contraintes techniques..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Récapitulatif budget */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3">Récapitulatif du concours</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Prix du gagnant:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {watchedMainPrize || 0}€
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Récompenses participants:</span>
                      <Badge variant="secondary">
                        {watchedParticipationReward || 0}€ × {(watchedMaxParticipants || 0) - 1}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
                      <span>Budget total:</span>
                      <Badge variant="default" className="bg-purple-600">
                        {totalBudget}€
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Comment ça marche ?</h4>
                  <div className="space-y-2 text-sm text-purple-800">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100">1</Badge>
                      <span>Vous lancez le concours avec votre brief créatif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100">2</Badge>
                      <span>Les créatifs soumettent leurs propositions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100">3</Badge>
                      <span>Vous évaluez et choisissez la meilleure création</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100">4</Badge>
                      <span>Le gagnant reçoit le prix principal, les autres la récompense de participation</span>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Lancement en cours...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Lancer le concours créatif
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
