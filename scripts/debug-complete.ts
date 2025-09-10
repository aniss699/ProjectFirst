
#!/usr/bin/env tsx

import { db } from '../server/database.js';
import { missions, announcements } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

const API_BASE = process.env.NODE_ENV === 'production' ? 'https://swideal.com' : 'http://localhost:5000';

interface DiagnosticResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  data?: any;
}

async function runDiagnostic(name: string, testFn: () => Promise<any>): Promise<DiagnosticResult> {
  try {
    const result = await testFn();
    return {
      test: name,
      status: 'PASS',
      details: `✅ ${result}`,
      data: typeof result === 'object' ? result : undefined
    };
  } catch (error) {
    return {
      test: name,
      status: 'FAIL',
      details: `❌ ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: error
    };
  }
}

async function testDatabaseConnection(): Promise<string> {
  const result = await db.select({ id: missions.id }).from(missions).limit(1);
  return `Database connected, ${result.length} sample missions found`;
}

async function testMissionsTable(): Promise<string> {
  const count = await db.execute(`SELECT COUNT(*) as count FROM missions`);
  const columns = await db.execute(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'missions' 
    ORDER BY ordinal_position
  `);
  
  return `Missions table: ${count.rows[0].count} records, ${columns.rows.length} columns`;
}

async function testAnnouncementsTable(): Promise<string> {
  try {
    const count = await db.execute(`SELECT COUNT(*) as count FROM announcements`);
    return `Announcements table: ${count.rows[0].count} records`;
  } catch (error) {
    throw new Error(`Announcements table error: ${error.message}`);
  }
}

async function testMissionAPI(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/missions`);
  if (!response.ok) {
    throw new Error(`API /missions failed: ${response.status} ${response.statusText}`);
  }
  const missions = await response.json();
  return `API /missions works: ${missions.length} missions returned`;
}

async function testHealthEndpoint(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/missions/health`);
  if (!response.ok) {
    throw new Error(`Health endpoint failed: ${response.status}`);
  }
  const health = await response.json();
  return `Health endpoint: ${health.status}`;
}

async function testDebugEndpoint(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/missions/debug`);
  if (!response.ok) {
    throw new Error(`Debug endpoint failed: ${response.status}`);
  }
  const debug = await response.json();
  return `Debug endpoint: ${debug.status}, ${debug.sampleMissions} sample missions`;
}

async function testMissionCreation(): Promise<string> {
  const testMission = {
    title: `Debug Test Mission ${Date.now()}`,
    description: 'Mission de test pour le diagnostic complet du système',
    category: 'developpement',
    budget: '1000',
    location: 'Remote',
    userId: 1
  };

  const response = await fetch(`${API_BASE}/api/missions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testMission)
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    throw new Error(`Mission creation failed: ${response.status} - ${responseText}`);
  }

  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${responseText}`);
  }

  if (!result.ok || !result.id) {
    throw new Error(`Mission creation incomplete: ${JSON.stringify(result)}`);
  }

  return `Mission created successfully: ID ${result.id}`;
}

async function testProjectsAPI(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/api/projects`);
    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`Projects API failed: ${response.status} - ${responseText}`);
    }
    
    const projects = JSON.parse(responseText);
    return `Projects API works: ${Array.isArray(projects) ? projects.length : 'unknown'} projects`;
  } catch (error) {
    throw new Error(`Projects API error: ${error.message}`);
  }
}

async function testUserMissionsAPI(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/missions/users/3/missions`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`User missions API failed: ${response.status} - ${errorText}`);
  }
  const userMissions = await response.json();
  return `User missions API works: ${userMissions.length} missions for user 3`;
}

async function checkRecentMissions(): Promise<string> {
  const recentMissions = await db
    .select({
      id: missions.id,
      title: missions.title,
      status: missions.status,
      user_id: missions.user_id,
      created_at: missions.created_at
    })
    .from(missions)
    .orderBy(desc(missions.created_at))
    .limit(5);

  return `Recent missions: ${recentMissions.length} found, latest: ${recentMissions[0]?.title || 'none'}`;
}

async function main() {
  console.log('🔍 DEBUG COMPLET - Diagnostic système SwipDEAL');
  console.log('================================================');

  const diagnostics = [
    () => testDatabaseConnection(),
    () => testMissionsTable(),
    () => testAnnouncementsTable(),
    () => testHealthEndpoint(),
    () => testDebugEndpoint(),
    () => testMissionAPI(),
    () => testProjectsAPI(),
    () => testUserMissionsAPI(),
    () => checkRecentMissions(),
    () => testMissionCreation()
  ];

  const testNames = [
    'Database Connection',
    'Missions Table',
    'Announcements Table',
    'Health Endpoint',
    'Debug Endpoint',
    'Missions API',
    'Projects API',
    'User Missions API',
    'Recent Missions Check',
    'Mission Creation Test'
  ];

  const results: DiagnosticResult[] = [];

  for (let i = 0; i < diagnostics.length; i++) {
    console.log(`\n${i + 1}. Testing: ${testNames[i]}`);
    const result = await runDiagnostic(testNames[i], diagnostics[i]);
    results.push(result);
    
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`   ${statusIcon} ${result.details}`);
    
    if (result.status === 'FAIL') {
      console.log(`   🔍 Debug info:`, result.data);
    }
  }

  console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC');
  console.log('========================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`⚠️ Avertissements: ${warnings}`);
  
  if (failed > 0) {
    console.log('\n🚨 PROBLÈMES DÉTECTÉS:');
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`   - ${result.test}: ${result.details}`);
    });
  }

  console.log('\n🎯 RECOMMANDATIONS:');
  if (failed === 0) {
    console.log('   🎉 Système fonctionnel - aucune action requise');
  } else {
    console.log('   🔧 Corrigez les erreurs listées ci-dessus');
    console.log('   🔄 Relancez ce diagnostic après correction');
  }

  process.exit(failed > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('🚨 Diagnostic failed:', error);
    process.exit(1);
  });
}
