import { Card } from '@/components/ui/card';
import { MessageSquare, Zap, Clock, Users, Star } from 'lucide-react';

interface ServiceTypeCardsProps {
  selectedService: 'reverse-bidding' | 'direct-connection' | null;
  onServiceSelect: (service: 'reverse-bidding' | 'direct-connection') => void;
}

export function ServiceTypeCards({ selectedService, onServiceSelect }: ServiceTypeCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-12 sm:mb-16 px-2 sm:px-0">
      <Card 
        className={`p-4 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer ${
          selectedService === 'reverse-bidding' 
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-400' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100'
        }`}
        onClick={() => onServiceSelect('reverse-bidding')}
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md ${
            selectedService === 'reverse-bidding' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }`}>
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Appels d'offres</h3>
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            Décrivez votre projet et laissez les prestataires vous proposer leurs services.
          </p>
          <div className="p-3 bg-white rounded-lg shadow-inner">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-blue-500" />
                Réponse sous 2h
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-green-500" />
                +50 prestataires
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card 
        className={`p-4 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer ${
          selectedService === 'direct-connection' 
            ? 'bg-gradient-to-br from-green-50 to-emerald-100 ring-2 ring-green-400' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-100'
        }`}
        onClick={() => onServiceSelect('direct-connection')}
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md ${
            selectedService === 'direct-connection' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }`}>
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Mise en relation</h3>
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            Contactez instantanément des professionnels qualifiés dans votre domaine.
          </p>
          <div className="p-3 bg-white rounded-lg shadow-inner">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-green-500" />
                Contact immédiat
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                Pros vérifiés
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}