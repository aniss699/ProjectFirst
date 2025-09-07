
// Script de migration automatique pour Cloud Run
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function runMigrations() {
  console.log('🔄 Début des migrations Prisma...');
  
  try {
    // Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Exécuter les migrations
    console.log('📊 Exécution des migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Vérifier la connexion
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Connexion base de données réussie');
    await prisma.$disconnect();
    
    console.log('✅ Migrations terminées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
