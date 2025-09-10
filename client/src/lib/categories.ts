// Catégories pour la mise en relation (services généraux de la vie courante)
export const CATEGORIES = [
  // Services de la maison et travaux
  {
    id: 'construction',
    name: 'Travaux & Construction',
    icon: 'Hammer',
    color: 'text-orange-600',
    description: 'Rénovation, construction, plomberie, électricité'
  },
  {
    id: 'home-services',
    name: 'Services à domicile',
    icon: 'Home',
    color: 'text-blue-600',
    description: 'Ménage, jardinage, bricolage, livraison'
  },
  {
    id: 'childcare',
    name: 'Garde d\'enfants',
    icon: 'Baby',
    color: 'text-pink-600',
    description: 'Babysitting, nounou, crèche privée'
  },
  {
    id: 'tutoring',
    name: 'Cours particuliers',
    icon: 'BookOpen',
    color: 'text-purple-600',
    description: 'Soutien scolaire, cours de langue, musique'
  },
  {
    id: 'wellness',
    name: 'Bien-être & Santé',
    icon: 'Heart',
    color: 'text-red-600',
    description: 'Massage, kinésithérapie, nutrition, coaching'
  },
  {
    id: 'automotive',
    name: 'Automobile',
    icon: 'Car',
    color: 'text-gray-600',
    description: 'Réparation, entretien, nettoyage auto'
  },
  {
    id: 'catering',
    name: 'Restauration & Traiteur',
    icon: 'ChefHat',
    color: 'text-yellow-600',
    description: 'Chef à domicile, traiteur, cours de cuisine'
  },
  {
    id: 'events',
    name: 'Événementiel',
    icon: 'Calendar',
    color: 'text-emerald-600',
    description: 'Organisation d\'événements, animation, DJ'
  },
  // Services numériques regroupés
  {
    id: 'web-digital',
    name: 'Web & Digital',
    icon: 'Globe',
    color: 'text-blue-500',
    description: 'Sites web, applications, marketing digital'
  },
  {
    id: 'design-creative',
    name: 'Design & Créatif',
    icon: 'Palette',
    color: 'text-pink-500',
    description: 'Design graphique, vidéo, photographie'
  },
  {
    id: 'tech-consulting',
    name: 'Tech & Consulting',
    icon: 'Laptop',
    color: 'text-indigo-600',
    description: 'Développement, IA, conseil technique'
  },
  {
    id: 'other',
    name: 'Autres Services',
    icon: 'Settings',
    color: 'text-slate-600',
    description: 'Autres prestations professionnelles'
  }
];

// Catégories pour les appels d'offres (personnes physiques/experts)
export const connectionCategories = [
  {
    id: 'lawyer',
    name: 'Avocat',
    icon: 'Scale',
    color: 'text-amber-600',
    description: 'Conseil juridique, représentation légale'
  },
  {
    id: 'celebrity',
    name: 'Célébrité',
    icon: 'Star',
    color: 'text-yellow-500',
    description: 'Influenceur, personnalité publique'
  },
  {
    id: 'tech-expert',
    name: 'Expert Informatique',
    icon: 'Cpu',
    color: 'text-blue-600',
    description: 'CTO, architecte logiciel, expert cybersécurité'
  },
  {
    id: 'ceo-executive',
    name: 'Dirigeant',
    icon: 'Crown',
    color: 'text-purple-600',
    description: 'CEO, directeur général, entrepreneur'
  },
  {
    id: 'doctor',
    name: 'Médecin Spécialiste',
    icon: 'Stethoscope',
    color: 'text-red-600',
    description: 'Consultation médicale spécialisée'
  },
  {
    id: 'coach',
    name: 'Coach Personnel',
    icon: 'Target',
    color: 'text-green-600',
    description: 'Coach de vie, sportif, professionnel'
  },
  {
    id: 'chef',
    name: 'Chef Cuisinier',
    icon: 'ChefHat',
    color: 'text-orange-600',
    description: 'Chef étoilé, consultant culinaire'
  },
  {
    id: 'architect',
    name: 'Architecte',
    icon: 'Building',
    color: 'text-stone-600',
    description: 'Architecte DPLG, urbaniste'
  },
  {
    id: 'financial-advisor',
    name: 'Conseiller Financier',
    icon: 'PiggyBank',
    color: 'text-emerald-600',
    description: 'Expert en investissement, gestion patrimoine'
  },
  {
    id: 'artist',
    name: 'Artiste',
    icon: 'Paintbrush',
    color: 'text-rose-600',
    description: 'Peintre, sculpteur, créateur'
  },
  {
    id: 'scientist',
    name: 'Scientifique',
    icon: 'Microscope',
    color: 'text-cyan-600',
    description: 'Chercheur, expert technique'
  },
  {
    id: 'professor',
    name: 'Professeur/Formateur',
    icon: 'GraduationCap',
    color: 'text-indigo-600',
    description: 'Expert académique, formation spécialisée'
  }
];

// Type pour les catégories
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Export des fourchettes de budget
export const budgetRanges = [
  { label: 'Moins de 500€', min: 0, max: 500 },
  { label: '500€ - 1 500€', min: 500, max: 1500 },
  { label: '1 500€ - 5 000€', min: 1500, max: 5000 },
  { label: '5 000€ - 15 000€', min: 5000, max: 15000 },
  { label: 'Plus de 15 000€', min: 15000, max: 100000 }
];

// Export des niveaux d'urgence
export const urgencyLevels = [
  { id: 'low', label: 'Standard', description: 'Délai flexible' },
  { id: 'medium', label: 'Prioritaire', description: 'Sous 2 semaines' },
  { id: 'high', label: 'Urgent', description: 'Sous 1 semaine' },
  { id: 'critical', label: 'Critique', description: 'Sous 48h' }
];

// Alias pour rétrocompatibilité
export const categories = CATEGORIES;

// Fonction pour formater le budget
export function formatBudget(budget: string | number): string {
  const amount = typeof budget === 'string' ? parseFloat(budget) : budget;
  if (isNaN(amount)) return '0€';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Fonction pour formater les dates
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
}

// Fonction pour obtenir une catégorie par ID
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(category => category.id === id) ||
         connectionCategories.find(category => category.id === id);
}

// Fonction pour formater le temps relatif
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Il y a quelques secondes';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
  return formatDate(d);
}