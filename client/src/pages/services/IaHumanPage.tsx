
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { servicesApi } from '@/lib/api/services';
import { iaHumanSchema, type IaHumanFormData } from '@/lib/validation/services';
import type { AIDraftBrief } from '@/lib/types/services';
import { Loader2, Brain, CheckCircle, Edit, Send } from 'lucide-react';

export default function IaHumanPage() {
  const [step, setStep] = useState<'input' | 'draft' | 'done'>('input');
  const [isProcessing, setIsProcessing] = useState(false);
  const [draft, setDraft] = useState<AIDraftBrief | null>(null);
  const { toast } = useToast();
  
  const form = useForm<IaHumanFormData>({
    resolver: zodResolver(iaHumanSchema),
    defaultValues: {
      description: '',
    }
  });

  const onSubmit = async (data: IaHumanFormData) => {
    setIsProcessing(true);
    try {
      const aiDraft = await servicesApi.aiDraftBrief(data.description);
      setDraft(aiDraft);
      setStep('draft');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le brief IA. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendToExperts = async () => {
    if (!draft) return;
    
    setIsProcessing(true);
    try {
      const result = await servicesApi.createIaHumanJob(draft);
      if (result.success) {
        setStep('done');
        toast({
          title: "Brief envoyé aux experts !",
          description: "Vous recevrez des propositions détaillées sous peu.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer aux experts. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const goBackToInput = () => {
    setStep('input');
    setDraft(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IA + Humain</h1>
          <p className="text-gray-600">Notre IA analyse votre besoin et le transforme en brief expert</p>
        </div>

        {step === 'input' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>Décrivez votre projet</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Décrivez votre besoin en détail</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez votre projet, vos objectifs, contraintes, délais... Plus vous êtes précis, plus l'IA pourra vous aider !"
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3 text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        L'IA analyse votre projet...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Générer le brief avec l'IA
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {step === 'draft' && draft && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Brief IA généré</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">📋 Périmètre du projet</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{draft.scope}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">🎯 Livrables attendus</h3>
                  <ul className="space-y-2">
                    {draft.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">⚠️ Risques identifiés</h3>
                  <ul className="space-y-2">
                    {draft.risks.map((risk, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">✅ Checklist validation</h3>
                  <ul className="space-y-2">
                    {draft.checklist.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <input type="checkbox" className="mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={goBackToInput}
                variant="outline"
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier le brief
              </Button>
              <Button 
                onClick={sendToExperts}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Valider & envoyer aux experts
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Brief envoyé avec succès !</h2>
              <p className="text-gray-600 mb-6">
                Notre équipe d'experts va analyser votre brief IA et vous envoyer des propositions personnalisées.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Créer un nouveau brief
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
