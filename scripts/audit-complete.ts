
import { db } from '../server/database.js';
import { missions, users } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

async function auditComplet() {
    console.log('🔍 === AUDIT COMPLET MISSIONS ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL configuré:', !!process.env.DATABASE_URL);
    console.log('');

    try {
        // ==================
        // 1. TEST BASE DE DONNÉES
        // ==================
        console.log('📋 1. VÉRIFICATION BASE DE DONNÉES');
        console.log('===================================');

        // Test connexion
        const dbTest = await db.execute(`SELECT COUNT(*) as total FROM missions`);
        const totalMissions = dbTest.rows[0]?.total || 0;
        console.log('✅ Connexion DB OK - Total missions:', totalMissions);

        // Vérifier structure table missions
        const columnsResult = await db.execute(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'missions' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 Colonnes table missions:');
        columnsResult.rows.forEach(row => {
            console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Vérifier colonnes critiques
        const criticalColumns = ['id', 'title', 'description', 'user_id', 'status', 'created_at', 'budget_value_cents', 'location_data'];
        const existingColumns = columnsResult.rows.map(r => r.column_name);
        
        console.log('\n🔍 Vérification colonnes critiques:');
        criticalColumns.forEach(col => {
            const exists = existingColumns.includes(col);
            console.log(`   ${exists ? '✅' : '❌'} ${col}`);
        });

        // ==================
        // 2. TEST API POST /missions
        // ==================
        console.log('\n\n🎯 2. TEST CRÉATION MISSION');
        console.log('============================');

        const testMissionData = {
            title: 'Mission Test Audit ' + Date.now(),
            description: 'Description test pour vérifier que la création fonctionne correctement avec tous les champs requis.',
            category: 'test',
            budget: '2500',
            location: 'Paris, France',
            userId: 1,
            postal_code: '75001'
        };

        console.log('📤 Données envoyées:');
        console.log(JSON.stringify(testMissionData, null, 2));

        try {
            const response = await fetch('http://localhost:5000/api/missions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testMissionData)
            });

            const result = await response.json();
            console.log(`📥 Réponse API (${response.status}):`);
            console.log(JSON.stringify(result, null, 2));

            if (response.ok && result.id) {
                console.log('✅ Création mission réussie - ID:', result.id);
                
                // Vérifier dans la DB
                const createdMission = await db
                    .select()
                    .from(missions)
                    .where(eq(missions.id, result.id))
                    .limit(1);

                if (createdMission.length > 0) {
                    console.log('✅ Mission trouvée dans la DB:');
                    console.log('   - ID:', createdMission[0].id);
                    console.log('   - Titre:', createdMission[0].title);
                    console.log('   - Status:', createdMission[0].status);
                    console.log('   - User ID:', createdMission[0].user_id);
                    console.log('   - Budget cents:', createdMission[0].budget_value_cents);
                    console.log('   - Location data:', createdMission[0].location_data);
                } else {
                    console.log('❌ Mission non trouvée dans la DB après création');
                }
            } else {
                console.log('❌ Création mission échouée:', result.error || 'Erreur inconnue');
            }
        } catch (error) {
            console.log('❌ Erreur lors du test POST /missions:', error.message);
        }

        // ==================
        // 3. TEST API GET /missions
        // ==================
        console.log('\n\n🔍 3. TEST RÉCUPÉRATION MISSIONS');
        console.log('=================================');

        try {
            const response = await fetch('http://localhost:5000/api/missions');
            const result = await response.json();

            console.log(`📥 Réponse GET /missions (${response.status}):`);
            console.log('   - Nombre de missions:', result.missions?.length || 0);
            
            if (result.missions && result.missions.length > 0) {
                console.log('   - Première mission:');
                const firstMission = result.missions[0];
                console.log('     * ID:', firstMission.id);
                console.log('     * Titre:', firstMission.title);
                console.log('     * Status:', firstMission.status);
                console.log('     * Budget:', firstMission.budget_display || firstMission.budget);
                console.log('     * Location:', firstMission.location);
                console.log('     * User ID:', firstMission.user_id);
                console.log('     * Created At:', firstMission.createdAt || firstMission.created_at);
            } else {
                console.log('⚠️ Aucune mission retournée par GET /missions');
            }

            // Comparer avec la DB directement
            const dbMissions = await db
                .select()
                .from(missions)
                .where(eq(missions.status, 'open'))
                .orderBy(desc(missions.created_at))
                .limit(5);

            console.log('\n🔍 Comparaison avec DB directe:');
            console.log('   - Missions "open" dans DB:', dbMissions.length);
            
            if (dbMissions.length > 0) {
                console.log('   - Première mission DB:');
                const firstDbMission = dbMissions[0];
                console.log('     * ID:', firstDbMission.id);
                console.log('     * Titre:', firstDbMission.title);
                console.log('     * Status:', firstDbMission.status);
                console.log('     * User ID:', firstDbMission.user_id);
            }

        } catch (error) {
            console.log('❌ Erreur lors du test GET /missions:', error.message);
        }

        // ==================
        // 4. VÉRIFICATION COHÉRENCE PREVIEW/PROD
        // ==================
        console.log('\n\n🔄 4. VÉRIFICATION ENVIRONNEMENTS');
        console.log('==================================');

        console.log('Database URL (masqué):', process.env.DATABASE_URL?.substring(0, 30) + '...');
        console.log('Port:', process.env.PORT || 5000);
        console.log('Node ENV:', process.env.NODE_ENV);

        // Test santé API
        try {
            const healthResponse = await fetch('http://localhost:5000/api/health');
            const healthData = await healthResponse.json();
            console.log('✅ API Health:', healthData.status);
            console.log('   - Database:', healthData.database);
            console.log('   - Uptime:', healthData.uptime_seconds, 'secondes');
        } catch (error) {
            console.log('❌ Erreur health check:', error.message);
        }

        // ==================
        // 5. RECOMMANDATIONS
        // ==================
        console.log('\n\n💡 5. RECOMMANDATIONS');
        console.log('=====================');

        const recommendations = [];

        if (totalMissions === 0) {
            recommendations.push('❗ Aucune mission en base - Vérifier la création');
        }

        if (!existingColumns.includes('budget_value_cents')) {
            recommendations.push('❗ Colonne budget_value_cents manquante');
        }

        if (!existingColumns.includes('location_data')) {
            recommendations.push('❗ Colonne location_data manquante');
        }

        if (recommendations.length > 0) {
            console.log('Corrections nécessaires:');
            recommendations.forEach(rec => console.log('   -', rec));
        } else {
            console.log('✅ Schéma paraît correct');
        }

        console.log('\n🎯 ACTIONS À EFFECTUER:');
        console.log('1. Exécuter le script SQL de correction si colonnes manquantes');
        console.log('2. Vérifier les logs de création dans POST /missions');
        console.log('3. Vérifier les logs de récupération dans GET /missions');
        console.log('4. Comparer les DATABASE_URL preview vs prod');

    } catch (error) {
        console.error('❌ ERREUR FATALE AUDIT:', error);
        throw error;
    }

    console.log('\n✅ AUDIT COMPLET TERMINÉ');
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
    auditComplet()
        .then(() => {
            console.log('\n🎉 Audit terminé avec succès');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Audit échoué:', error);
            process.exit(1);
        });
}

export { auditComplet };
