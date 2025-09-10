import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ROUTES } from '../../routes/paths';

export function HeroSection() {
  return (
    <div className="text-center mb-12 sm:mb-16 px-2 sm:px-0">
      <div className="space-y-6">
        {/* Logo et nom SWIDEAL */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-1.5 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <img 
                src="/swideal-logo.png" 
                alt="Swideal Logo" 
                className="w-full h-full object-cover brightness-0 invert"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent tracking-tight">
              SWIDEAL
            </span>
            <span className="text-sm text-gray-500 font-medium">
              IA • Missions • Talents
            </span>
          </div>
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
          Trouvez le <span className="text-green-600 font-bold">prestataire</span> parfait avec l'IA
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
          Plateforme française d'appels d'offres inversés pour <span className="text-blue-600 font-semibold">clients</span> et <span className="text-green-600 font-semibold">prestataires</span> avec intelligence artificielle avancée.
        </p>
        <div className="flex justify-center gap-3 text-sm">
          <div className="flex items-center text-green-600 font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Plateforme en lancement
          </div>
          <div className="flex items-center text-blue-600 font-medium">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            Premiers utilisateurs
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg">
            <Link href={ROUTES.MARKETPLACE}>
              Découvrir les missions
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={ROUTES.CREATE_MISSION}>
              Poster une mission
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}