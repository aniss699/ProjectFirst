
// Vérifier la cohérence des variables d'environnement preview vs prod
console.log('🔍 VÉRIFICATION VARIABLES D\'ENVIRONNEMENT');
console.log('==========================================');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Masquer DATABASE_URL pour la sécurité mais montrer le format
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    const urlParts = dbUrl.split('@');
    const hostPart = urlParts[1] || '';
    console.log('DATABASE_URL configuré: OUI');
    console.log('Host/DB:', hostPart.substring(0, 50) + '...');
    
    // Détecter le type de base
    if (dbUrl.includes('localhost')) {
        console.log('Type: Base de données locale');
    } else if (dbUrl.includes('replit')) {
        console.log('Type: Base de données Replit');
    } else if (dbUrl.includes('postgresql://')) {
        console.log('Type: PostgreSQL externe');
    }
} else {
    console.log('❌ DATABASE_URL: NON CONFIGURÉ');
}

// Test de connexion simple
try {
    const { db } = await import('../server/database.js');
    const testResult = await db.execute('SELECT NOW() as current_time');
    console.log('✅ Test connexion DB réussi à:', testResult.rows[0]?.current_time);
} catch (error) {
    console.log('❌ Test connexion DB échoué:', error.message);
}

console.log('\n💡 POUR COMPARER PREVIEW vs PROD:');
console.log('1. Exécuter ce script en preview ET en prod');
console.log('2. Comparer les valeurs DATABASE_URL');
console.log('3. Vérifier que les deux pointent sur la même base');
