import { db } from './database.js';
import { users } from '@shared/schema';

async function createDemoUser() {
  console.log('🌱 Création de l\'utilisateur démo...');

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

    console.log(`✅ Utilisateur démo créé: ${demoClient.name} (ID: ${demoClient.id})`);

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

    console.log(`✅ Prestataire démo créé: ${demoProvider.name} (ID: ${demoProvider.id})`);
    console.log('🎉 Utilisateurs démo créés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs démo:', error);
    throw error;
  }
}

// Exécution directe si appelé en tant que script
if (import.meta.url === `file://${process.argv[1]}`) {
  createDemoUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}