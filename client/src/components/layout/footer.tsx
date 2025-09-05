
import { useLocation } from 'wouter';
import { ROUTES } from '@/routes/paths';

export default function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div>
            <h3 className="text-lg font-semibold mb-3">Swideal</h3>
            <p className="text-gray-300 text-sm">
              La plateforme révolutionnaire pour dénicher les meilleures affaires avec l'IA
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => setLocation(ROUTES.MARKETPLACE)} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Missions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation('/available-providers')} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Prestataires
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation(ROUTES.CREATE_MISSION)} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Créer une mission
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Mon compte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => setLocation('/login')} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Connexion
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation(ROUTES.DASHBOARD)} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Tableau de bord
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation(ROUTES.PROFILE)} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Mon profil
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => setLocation('/sitemap')} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Plan du site
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation(ROUTES.LEGAL)} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Mentions légales
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          © 2024 Swideal. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
