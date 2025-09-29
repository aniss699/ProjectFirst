
import { useLocation } from 'wouter';
import { ROUTES } from '@/routes/paths';
import { Heart, Mail, MapPin, Phone, Globe } from 'lucide-react';

export default function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 border-b border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 relative">
                  <span className="text-white font-bold text-lg">S</span>
                  <div className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full"></div>
                  <div className="absolute bottom-1 left-2 w-1 h-1 bg-white rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Swideal
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                La plateforme qui connecte talents et opportunités dans tous les domaines. 
                Trouvez le partenaire idéal pour concrétiser vos projets.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-xs text-gray-400">
                  <Heart className="w-3 h-3 mr-1 text-red-400" />
                  Fait avec passion
                </div>
              </div>
            </div>

            {/* Navigation rapide */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-200">Navigation</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => setLocation(ROUTES.MARKETPLACE)} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Découvrir les missions
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation('/available-providers')} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Trouver des experts
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation(ROUTES.CREATE_MISSION)} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Publier une mission
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation('/notre-concept')} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Notre concept
                  </button>
                </li>
              </ul>
            </div>

            {/* Mon espace */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-200">Mon espace</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => setLocation('/login')} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Se connecter
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation(ROUTES.DASHBOARD)} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Mon tableau de bord
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation(ROUTES.PROFILE)} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Mon profil
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation('/messages')} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Messages
                  </button>
                </li>
              </ul>
            </div>

            {/* Support et contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-200">Support</h4>
              <ul className="space-y-3 mb-6">
                <li>
                  <button 
                    onClick={() => setLocation(ROUTES.LEGAL)} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-green-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Mentions légales
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation('/sitemap')} 
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-green-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Plan du site
                  </button>
                </li>
              </ul>
              
              {/* Contact info */}
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-400">
                  <Mail className="w-3 h-3 mr-2 text-blue-400" />
                  contact@swideal.com
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Globe className="w-3 h-3 mr-2 text-blue-400" />
                  www.swideal.com
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 Swideal. Tous droits réservés.
            </div>
            
            <div className="flex items-center space-x-6 text-xs text-gray-400">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Service disponible 24h/7j
              </span>
              <span>|</span>
              <span>🌍 Plateforme mondiale</span>
              <span>|</span>
              <span>🔒 Paiements sécurisés</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
