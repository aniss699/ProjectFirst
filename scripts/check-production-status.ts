
async function checkProductionStatus(): Promise<void> {
  console.log('🔍 VÉRIFICATION RAPIDE DU STATUT PRODUCTION');
  console.log('=' .repeat(50));

  const baseUrl = 'http://0.0.0.0:5000';
  
  const endpoints = [
    { path: '/api/health', name: 'Santé générale' },
    { path: '/api/missions/health', name: 'Santé missions' },
    { path: '/api/missions', name: 'Liste missions' },
    { path: '/api/auth/demo-users', name: 'Utilisateurs démo' }
  ];

  console.log(`🌐 Test des endpoints sur ${baseUrl}...\n`);

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(`${baseUrl}${endpoint.path}`);
      const duration = Date.now() - start;
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: OK (${duration}ms)`);
        
        // Afficher des détails pour certains endpoints
        if (endpoint.path === '/api/missions') {
          const data = await response.json();
          console.log(`   📊 ${Array.isArray(data) ? data.length : 'N/A'} missions disponibles`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: ERROR ${response.status} (${duration}ms)`);
      }
    } catch (error) {
      console.log(`💥 ${endpoint.name}: FAILED - ${error.message}`);
    }
  }

  // Test rapide de création de compte
  console.log('\n👤 Test rapide création de compte...');
  try {
    const testUser = {
      email: `quicktest-${Date.now()}@test.com`,
      password: 'test123',
      name: 'Test Quick'
    };

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Création compte: OK (ID: ${result.user?.id})`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Création compte: ERROR ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.log(`💥 Création compte: FAILED - ${error.message}`);
  }

  console.log('\n🏁 Vérification terminée');
}

// Exécution
checkProductionStatus().catch(console.error);
