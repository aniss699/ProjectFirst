
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Euro, Calendar, MapPin, Users, Zap, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const mirrorMissionSchema = z.object({
  projectTitle: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  description: z.string().min(50, "La description doit faire au moins 50 caractères"),
  budgetPerProvider: z.number().min(100, "Le budget par prestataire minimum est de 100€"),
  deadline: z.string().min(1, "Veuillez définir une date limite"),
  location: z.string().min(1, "La localisation est requise"),
  allowSameProvider: z.boolean().default(false),
  evaluationCriteria: z.string().min(20, "Détaillez les critères d'évaluation"),
  deliverables: z.string().min(20, "Précisez les livrables attendus"),
});

type MirrorMissionFormData = z.infer<typeof mirrorMissionSchema>;

const categories = [
  'Développement web',
  'Design graphique',
  'Marketing digital',
  'Rédaction',
  'Consulting',
  'Traduction',
  'Formation',
  'Architecture',
  'Photographie',
  'Vidéo'
];

export default function MirrorMissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MirrorMissionFormData>({
    resolver: zodResolver(mirrorMissionSchema),
    defaultValues: {
      projectTitle: '',
      category: '',
      description: '',
      budgetPerProvider: 1000,
      deadline: '',
      location: '',
      allowSameProvider: false,
      evaluationCriteria: '',
      deliverables: '',
    }
  });

  const watchedBudgetPerProvider = form.watch('budgetPerProvider');
  const totalBudget = watchedBudgetPerProvider * 2;

  const onSubmit = async (data: MirrorMissionFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Mission Miroir créée !",
        description: "Deux prestataires vont maintenant travailler en parallèle sur votre projet.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la mission miroir. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
            <Copy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mission Miroir</h1>
          <p className="text-gray-600">Deux prestataires, deux solutions, vous choisissez la meilleure</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Créer votre mission miroir</span>
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
                          placeholder="Ex: Développement site e-commerce responsive"
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
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
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
                      <FormLabel>Description détaillée du projet</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez précisément ce que vous attendez, les fonctionnalités, les contraintes..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliverables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Livrables attendus</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Spécifiez exactement ce que chaque prestataire doit livrer..."
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
                    name="budgetPerProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget par prestataire (€)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Euro className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input 
                              type="number" 
                              min={100}
                              placeholder="1000"
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
                        <FormLabel>Date limite de livraison</FormLabel>
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation préférée</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Paris, Lyon, France, ou Remote"
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
                  name="evaluationCriteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critères d'évaluation</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Sur quels critères allez-vous évaluer et comparer les deux solutions ? (qualité, innovation, rapidité...)"
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
                  name="allowSameProvider"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Autoriser le même prestataire
                        </FormLabel>
                        <div className="text-sm text-gray-600">
                          Permettre qu'un même prestataire propose deux solutions différentes
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Récapitulatif budget */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-3">Récapitulatif financier</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Budget prestataire A:</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {watchedBudgetPerProvider || 0}€
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Budget prestataire B:</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {watchedBudgetPerProvider || 0}€
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
                      <span>Budget total:</span>
                      <Badge variant="default" className="bg-emerald-600">
                        {totalBudget}€
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2">Comment ça marche ?</h4>
                  <div className="space-y-2 text-sm text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-emerald-100">1</Badge>
                      <span>Deux prestataires différents travaillent simultanément sur votre projet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-emerald-100">2</Badge>
                      <span>Chacun développe sa propre approche et solution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-emerald-100">3</Badge>
                      <span>Vous recevez deux livrables complets à comparer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-emerald-100">4</Badge>
                      <span>Vous payez les deux prestataires et choisissez la solution à retenir</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Avantages de la Mission Miroir</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          Maximise vos chances d'obtenir la solution parfaite
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          Compare différentes approches créatives et techniques
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          Réduit les risques projet grâce à la redondance
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Créer la mission miroir
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
