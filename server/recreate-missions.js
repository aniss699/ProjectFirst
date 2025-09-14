
import { cleanTestMissions, seedTestMissions } from './seed-test-missions.js';
cleanTestMissions().then(() => {
  console.log('🧹 Anciennes missions supprimées');
  return seedTestMissions();
}).then(() => {
  console.log('✅ Nouvelles missions créées avec catégories correctes');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

