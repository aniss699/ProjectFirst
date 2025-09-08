
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, projects } from '../shared/schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

async function verifyDemoData() {
  console.log('🔍 Vérification des données démo...');

  try {
    // Vérifier les utilisateurs démo
    const demoUsers = await db.select().from(users);
    
    console.log('\n👥 Utilisateurs trouvés:');
    demoUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Rôle: ${user.role}`);
    });

    // Vérifier les projets démo
    const demoProjects = await db.select().from(projects);
    
    console.log('\n📊 Projets trouvés:');
    demoProjects.forEach(project => {
      console.log(`- ${project.title} - Budget: ${project.budget} - Statut: ${project.status}`);
    });

    console.log(`\n✅ Total: ${demoUsers.length} utilisateurs et ${demoProjects.length} projets`);

    // Vérifier spécifiquement les comptes démo
    const clientDemo = demoUsers.find(u => u.email === 'demo@swideal.com');
    const providerDemo = demoUsers.find(u => u.email === 'prestataire@swideal.com');
    const adminDemo = demoUsers.find(u => u.email === 'admin@swideal.com');

    console.log('\n🎯 Comptes démo spécifiques:');
    console.log(`- Client démo: ${clientDemo ? '✅ Trouvé' : '❌ Manquant'}`);
    console.log(`- Prestataire démo: ${providerDemo ? '✅ Trouvé' : '❌ Manquant'}`);
    console.log(`- Admin démo: ${adminDemo ? '✅ Trouvé' : '❌ Manquant'}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }

  process.exit(0);
}

verifyDemoData();
