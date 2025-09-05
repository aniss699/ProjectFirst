import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface BidFormProps {
  missionId: string;
  onSuccess: () => void;
}

export function BidForm({ missionId, onSuccess }: BidFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    price: '',
    timeline: '',
    proposal: '',
  });

  const submitBid = useMutation({
    mutationFn: async (bidData: any) => {
      const response = await apiRequest('POST', '/api/bids', bidData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missions', missionId] });
      queryClient.invalidateQueries({ queryKey: ['/api/missions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'bids'] });
      toast({
        title: 'Offre envoyée !',
        description: 'Votre offre a été envoyée avec succès',
      });
      setFormData({ price: '', timeline: '', proposal: '' });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.price || !formData.timeline || !formData.proposal) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour postuler',
        variant: 'destructive',
      });
      return;
    }

    submitBid.mutate({
      missionId,
      providerId: user.id,
      providerName: user.name,
      price: parseFloat(formData.price),
      timeline: formData.timeline,
      proposal: formData.proposal,
      rating: user.rating || '5.0',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user || user.type !== 'provider') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-1">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span>Prix proposé (€)</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 2500"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="h-11 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <span>Délai de livraison</span>
            </Label>
            <Input
              id="timeline"
              type="text"
              placeholder="Ex: 4 semaines"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span>Décrivez votre proposition</span>
          </Label>
          <Textarea
            id="proposal"
            placeholder="Expliquez votre approche, votre expérience pertinente et ce que vous allez concrètement livrer pour cette mission..."
            value={formData.proposal}
            onChange={(e) => handleInputChange('proposal', e.target.value)}
            className="min-h-[120px] rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none transition-colors"
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            disabled={submitBid.isPending}
          >
            {submitBid.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi en cours...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🚀</span>
                <span>Envoyer ma candidature</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}