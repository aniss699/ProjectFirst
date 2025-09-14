import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, missions, bids } from '../shared/schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

async function seedDemo() {
  console.log('🌱 Création des données de démonstration...');

  try {
    // Créer utilisateur démo client
    const [demoClient] = await db
      .insert(users)
      .values({
        email: 'demo@swideal.com',
        password: 'demo123', // En production, cela devrait être hashé
        name: 'Emma Rousseau',
        role: 'CLIENT',
        rating_mean: '0',
        rating_count: 0,
        profile_data: {
          company: 'TechStart Innovation',
          sector: 'SaaS',
          projects_posted: 0,
          total_budget_spent: 0,
          verified: true,
          phone: '+33 1 45 67 89 12',
          location: 'Paris, France'
        }
      })
      .returning();

    // Créer utilisateur démo prestataire
    const [demoProvider] = await db
      .insert(users)
      .values({
        email: 'prestataire@swideal.com',
        password: 'demo123',
        name: 'Julien Moreau',
        role: 'PRO',
        rating_mean: '0',
        rating_count: 0,
        profile_data: {
          specialties: ['React', 'Node.js', 'TypeScript', 'Python'],
          hourly_rate: 65,
          availability: 'Disponible',
          experience_years: 5,
          completed_projects: 0,
          success_rate: 0,
          response_time_hours: 4,
          certifications: ['React Developer'],
          portfolio_url: 'https://julienmoreau.dev',
          linkedin: 'https://linkedin.com/in/julienmoreau',
          phone: '+33 6 78 90 12 34',
          location: 'Lyon, France'
        }
      })
      .returning();

    // Créer utilisateur admin
    const [demoAdmin] = await db
      .insert(users)
      .values({
        email: 'admin@swideal.com',
        password: 'admin123',
        name: 'Clara Dubois',
        role: 'ADMIN',
        profile_data: {
          department: 'Platform Management',
          access_level: 'full',
          phone: '+33 1 56 78 90 12'
        }
      })
      .returning();

    // Créer des projets démo
    const [project1] = await db
      .insert(projects)
      .values({
        title: 'Site vitrine pour startup tech',
        description: 'Recherche d\'un développeur web pour créer un site vitrine moderne et responsive pour notre startup. Le site doit inclure : présentation de l\'entreprise, section équipe, blog intégré, formulaire de contact, optimisation SEO. Technologies souhaitées : React/Next.js, design moderne et épuré.',
        budget: '3000-5000',
        category: 'developpement',
        quality_target: 'medium',
        risk_tolerance: '0.5',
        geo_required: false,
        status: 'published',
        client_id: demoClient.id
      })
      .returning();

    const [project2] = await db
      .insert(projects)
      .values({
        title: 'Application mobile de gestion de tâches',
        description: 'Développement d\'une application mobile simple pour la gestion de tâches personnelles. Fonctionnalités : création/modification de tâches, catégories, notifications, synchronisation cloud. Interface intuitive et design moderne requis. Compatible iOS et Android.',
        budget: '5000-8000',
        category: 'mobile',
        quality_target: 'medium',
        risk_tolerance: '0.4',
        geo_required: true,
        onsite_radius_km: 100,
        status: 'published',
        client_id: demoClient.id
      })
      .returning();

    const [project3] = await db
      .insert(projects)
      .values({
        title: 'Intégration chatbot IA basique',
        description: 'Intégration d\'un chatbot IA simple sur notre site web existant. Le bot doit pouvoir répondre aux questions fréquentes, rediriger vers les bonnes pages, et collecter les informations de contact. Solution clé en main souhaitée.',
        budget: '2000-4000',
        category: 'intelligence-artificielle',
        quality_target: 'medium',
        risk_tolerance: '0.6',
        geo_required: false,
        status: 'published',
        client_id: demoClient.id
      })
      .returning();

    console.log('✅ Données de démonstration créées avec succès !');
    console.log('\n🔑 Comptes créés :');
    console.log(`
👤 CLIENT DÉMO
Email: demo@swideal.com  
Mot de passe: demo123
Rôle: Client
Nom: Emma Rousseau

👨‍💻 PRESTATAIRE DÉMO  
Email: prestataire@swideal.com
Mot de passe: demo123
Rôle: Prestataire  
Nom: Julien Moreau

👑 ADMIN DÉMO
Email: admin@swideal.com
Mot de passe: admin123
Rôle: Administrateur
Nom: Clara Dubois
`);

    console.log('\n📊 Données créées :');
    console.log(`- ${3} utilisateurs`);
    console.log(`- ${3} projets`); 
    console.log(`- ${0} offres`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données démo:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedDemo();