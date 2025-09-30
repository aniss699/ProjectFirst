import { ServiceModeCard } from '@/components/ServiceModeCard';
import type { ServiceMode } from '@/lib/types/services';

const serviceModes: ServiceMode[] = [
  {
    id: 'construction-equipe',
    title: 'Construction d\'Équipe',
    description: 'Créez une équipe professionnelle où d\'autres experts peuvent vous rejoindre. Une fois complète, votre équipe sera disponible pour d\'autres missions.',
    emoji: '👥',
    href: '/services/construction-equipe',
    color: 'text-blue-600'
  },
  {
    id: 'concours-creatif',
    title: 'Concours Créatif',
    description: 'Plusieurs créatifs travaillent en parallèle sur votre projet. Vous choisissez la meilleure proposition et récompensez tous les participants.',
    emoji: '🏆',
    href: '/services/concours-creatif',
    color: 'text-purple-600'
  },
  {
    id: 'mission-miroir',
    title: 'Mission Miroir',
    description: 'Deux prestataires travaillent simultanément sur votre projet. Vous obtenez deux solutions et choisissez la meilleure.',
    emoji: '🪞',
    href: '/services/mission-miroir',
    color: 'text-emerald-600'
  },
  {
    id: 'cours-collectifs',
    title: 'Cours Collectifs',
    description: 'Apprenez ensemble, progressez plus vite avec des profs experts',
    emoji: '🎓',
    href: '/services/cours',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'opportunites',
    title: 'Opportunités Locales',
    description: 'Découvrez les créneaux libres près de chez vous et réservez instantanément.',
    emoji: '⏳',
    href: '/services/opportunites',
    color: 'text-indigo-600'
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-white text-2xl">🚀</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre mode de service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            5 modes de collaboration innovants pour vos projets
          </p>
        </div>

        {/* Service modes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {serviceModes.map((mode) => (
            <ServiceModeCard 
              key={mode.id} 
              mode={mode}
              className="w-full"
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Pas sûr de votre choix ?
          </h3>
          <p className="text-gray-600 mb-6">
            Notre équipe peut vous conseiller le mode le plus adapté à votre projet
          </p>
          <button 
            onClick={() => window.location.href = 'mailto:contact@swideal.com?subject=Conseil sur le choix du mode de service'}
            data-testid="button-contact-expert"
            className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          >
            💬 Discuter avec un expert
          </button>
        </div>
      </div>
    </div>
  );
}