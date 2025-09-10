
#!/usr/bin/env tsx

/**
 * Script pour exécuter le test complet de la chaîne de mission
 * Usage: npm run test:complete ou tsx scripts/run-complete-test.ts
 */

import { runCompleteChainTest } from './complete-mission-chain-test.js';

console.log('🔥 Lancement du test complet de la chaîne de mission...');
console.log('⏳ Vérification: Frontend → API → Database → Feed → Performance\n');

runCompleteChainTest()
  .then(() => {
    console.log('\n🎯 Test complet terminé avec succès!');
  })
  .catch((error) => {
    console.error('\n💥 Erreur lors du test complet:', error);
    process.exit(1);
  });
