
// Script de migration automatique pour Cloud Run
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function runMigrations() {
  console.log('🔄 Début des migrations Prisma...');
  
  try {
    // Vérifier la connexion à la base de données
    console.log('🔗 Vérification de la connexion...');
    const testPrisma = new PrismaClient();
    await testPrisma.$connect();
    console.log('✅ Connexion base de données réussie');
    await testPrisma.$disconnect();
    
    // Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Vérifier si les migrations sont nécessaires
    console.log('🔍 Vérification du statut des migrations...');
    try {
      execSync('npx prisma migrate status', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Migrations en attente détectées');
    }
    
    // Exécuter les migrations
    console.log('📊 Exécution des migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Test final de connexion
    const finalPrisma = new PrismaClient();
    await finalPrisma.$connect();
    console.log('✅ Test final de connexion réussi');
    await finalPrisma.$disconnect();
    
    console.log('✅ Migrations terminées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.log('🛑 Migration interrompue par SIGINT');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('🛑 Migration interrompue par SIGTERM');
  process.exit(1);
});

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
