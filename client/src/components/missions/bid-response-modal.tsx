import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  VisuallyHidden,
} from '@/components/ui/dialog';
import { MessageCircle, CheckCircle, XCircle } from 'lucide-react';

interface BidResponseModalProps {
  bidId: string | null;
  bidderName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BidResponseModal({ bidId, bidderName, isOpen, onClose }: BidResponseModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responseType, setResponseType] = useState<'accept' | 'reject' | 'negotiate' | null>(null);
  const [message, setMessage] = useState('');

  const respondToBid = useMutation({
    mutationFn: async (responseData: any) => {
      const response = await apiRequest('POST', '/api/bids/respond', responseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missions'] });

      const responseText = responseType === 'accept' ? 'acceptée' :
                          responseType === 'reject' ? 'déclinée' : 'en négociation';

      toast({
        title: 'Réponse envoyée !',
        description: `Votre réponse (${responseText}) a été envoyée au prestataire. Il recevra une notification.`,
      });

      // Show confirmation in UI
      setTimeout(() => {
        alert(`Confirmation : Votre réponse "${responseText}" a bien été envoyée à ${bidderName}. Un email de confirmation lui a été envoyé.`);
      }, 500);

      onClose();
      setResponseType(null);
      setMessage('');
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

    if (!responseType) {
      toast({
        title: 'Action requise',
        description: 'Veuillez choisir une action',
        variant: 'destructive',
      });
      return;
    }

    if (responseType === 'negotiate' && !message.trim()) {
      toast({
        title: 'Message requis',
        description: 'Veuillez ajouter un message pour négocier',
        variant: 'destructive',
      });
      return;
    }

    respondToBid.mutate({
      bidId: bidId,
      status: responseType,
      message: message.trim() || null,
      clientResponse: responseType,
    });
  };

  const getResponseTemplate = (type: 'accept' | 'reject' | 'negotiate') => {
    switch (type) {
      case 'accept':
        return `Bonjour ${bidderName},\n\nNous avons le plaisir de vous informer que votre offre a été retenue pour ce projet. Nous allons procéder à la mise en place du contrat.\n\nCordialement`;
      case 'reject':
        return `Bonjour ${bidderName},\n\nNous vous remercions pour votre offre. Malheureusement, nous avons décidé de retenir une autre proposition pour ce projet.\n\nCordialement`;
      case 'negotiate':
        return `Bonjour ${bidderName},\n\nVotre offre nous intéresse. Cependant, nous aimerions discuter de certains points :\n\n- \n- \n\nÊtes-vous ouvert à la négociation ?\n\nCordialement`;
    }
  };

  const handleResponseTypeChange = (type: 'accept' | 'reject' | 'negotiate') => {
    setResponseType(type);
    setMessage(getResponseTemplate(type));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            Répondre à l'offre de {bidderName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Action Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Choisissez votre réponse :</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleResponseTypeChange('accept')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  responseType === 'accept'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="font-semibold">Accepter</div>
                <div className="text-sm text-gray-600">Retenir cette offre</div>
              </button>

              <button
                type="button"
                onClick={() => handleResponseTypeChange('negotiate')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  responseType === 'negotiate'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="font-semibold">Négocier</div>
                <div className="text-sm text-gray-600">Demander des ajustements</div>
              </button>

              <button
                type="button"
                onClick={() => handleResponseTypeChange('reject')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  responseType === 'reject'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="font-semibold">Décliner</div>
                <div className="text-sm text-gray-600">Ne pas retenir</div>
              </button>
            </div>
          </div>

          {/* Message */}
          {responseType && (
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-semibold text-gray-800">
                Message à {bidderName}
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..."
                className="min-h-[120px]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={respondToBid.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={!responseType || respondToBid.isPending}
            >
              {respondToBid.isPending ? 'Envoi...' : 'Envoyer la réponse'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}