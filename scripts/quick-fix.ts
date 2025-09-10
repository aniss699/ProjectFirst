
#!/usr/bin/env tsx

import { db } from '../server/database.js';
import { missions } from '../shared/schema.js';

async function quickFix() {
  console.log('🔧 QUICK FIX - Correction rapide des problèmes courants');
  console.log('=====================================================');

  try {
    // 1. Vérifier la structure de la table missions
    console.log('\n1. Vérification structure table missions...');
    const columns = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'missions' 
      ORDER BY ordinal_position
    `);
    
    console.log(`✅ Table missions: ${columns.rows.length} colonnes trouvées`);
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 2. Nettoyer les données incohérentes
    console.log('\n2. Nettoyage des données incohérentes...');
    const updateResult = await db.execute(`
      UPDATE missions 
      SET 
        status = COALESCE(status, 'published'),
        urgency = COALESCE(urgency, 'medium'),
        currency = COALESCE(currency, 'EUR'),
        remote_allowed = COALESCE(remote_allowed, true),
        is_team_mission = COALESCE(is_team_mission, false),
        team_size = COALESCE(team_size, 1),
        updated_at = NOW()
      WHERE status IS NULL 
         OR urgency IS NULL 
         OR currency IS NULL 
         OR remote_allowed IS NULL 
         OR is_team_mission IS NULL 
         OR team_size IS NULL
    `);
    
    console.log(`✅ Données nettoyées: ${updateResult.rowCount || 0} lignes mises à jour`);

    // 3. Vérifier les index
    console.log('\n3. Vérification des index...');
    const indexes = await db.execute(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename = 'missions'
    `);
    
    console.log(`✅ Index trouvés: ${indexes.rows.length}`);
    indexes.rows.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    // 4. Test de création de mission simple
    console.log('\n4. Test de création de mission...');
    const testMission = {
      title: `Test QuickFix ${Date.now()}`,
      description: 'Mission de test pour vérifier le bon fonctionnement',
      category: 'developpement',
      budget_value_cents: 100000,
      currency: 'EUR',
      user_id: 1,
      client_id: 1,
      status: 'published' as const,
      urgency: 'medium' as const,
      remote_allowed: true,
      is_team_mission: false,
      team_size: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    const insertResult = await db.insert(missions).values(testMission).returning({
      id: missions.id,
      title: missions.title
    });

    console.log(`✅ Mission test créée: ID ${insertResult[0].id} - "${insertResult[0].title}"`);

    console.log('\n🎉 Quick Fix terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur dans Quick Fix:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  quickFix().catch(error => {
    console.error('🚨 Quick Fix failed:', error);
    process.exit(1);
  });
}
