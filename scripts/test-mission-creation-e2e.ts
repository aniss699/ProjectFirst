
#!/usr/bin/env tsx

import { db } from '../server/database.js';
import { missions } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

const API_BASE = process.env.NODE_ENV === 'production' ? 'https://swideal.com' : 'http://localhost:5000';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  timing?: number;
}

async function runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
  const start = Date.now();
  try {
    const result = await testFn();
    return {
      name,
      passed: true,
      details: `✅ ${result}`,
      timing: Date.now() - start
    };
  } catch (error) {
    return {
      name,
      passed: false,
      details: `❌ ${error.message}`,
      timing: Date.now() - start
    };
  }
}

async function testMissionCreationAPI(): Promise<string> {
  const testData = {
    title: `Test E2E Mission ${Date.now()}`,
    description: 'Description de test pour valider la création de mission via API',
    category: 'developpement',
    budget: '1500',
    location: 'Remote',
    userId: 1
  };

  console.log('🚀 Sending POST request to create mission...');
  
  const response = await fetch(`${API_BASE}/api/missions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
  });

  const responseText = await response.text();
  console.log('📄 Raw response:', responseText);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseText}`);
  }

  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${responseText}`);
  }

  if (!responseData.ok) {
    throw new Error(`API returned ok: false - ${responseData.error || 'Unknown error'}`);
  }

  if (!responseData.id) {
    throw new Error(`No ID returned in response: ${JSON.stringify(responseData)}`);
  }

  return `Mission created with ID ${responseData.id}, title: "${responseData.title}"`;
}

async function testMissionInDatabase(): Promise<string> {
  console.log('🔍 Checking latest missions in database...');
  
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
    .limit(3);

  if (recentMissions.length === 0) {
    throw new Error('No missions found in database');
  }

  const latestMission = recentMissions[0];
  const timeSinceCreation = Date.now() - latestMission.created_at.getTime();

  if (timeSinceCreation > 30000) { // Plus de 30 secondes
    throw new Error(`Latest mission is too old (${Math.round(timeSinceCreation/1000)}s ago)`);
  }

  return `Latest mission: ID ${latestMission.id}, "${latestMission.title}" (${Math.round(timeSinceCreation/1000)}s ago)`;
}

async function testMissionVisibilityInListing(): Promise<string> {
  console.log('📋 Checking mission visibility in listing...');
  
  const response = await fetch(`${API_BASE}/api/missions`);
  
  if (!response.ok) {
    throw new Error(`Listing API failed: HTTP ${response.status}`);
  }

  const missions = await response.json();
  
  if (!Array.isArray(missions) || missions.length === 0) {
    throw new Error('No missions returned from listing API');
  }

  const recentMission = missions.find(m => {
    const createdAt = new Date(m.createdAt);
    const timeSince = Date.now() - createdAt.getTime();
    return timeSince < 60000; // Créée dans les 60 dernières secondes
  });

  if (!recentMission) {
    throw new Error('No recently created mission found in listing');
  }

  return `Found recent mission in listing: ID ${recentMission.id}, "${recentMission.title}"`;
}

async function main() {
  console.log('🧪 Starting E2E Mission Creation Tests');
  console.log('=====================================');
  
  const tests = [
    () => testMissionCreationAPI(),
    () => testMissionInDatabase(),
    () => testMissionVisibilityInListing()
  ];

  const results: TestResult[] = [];

  for (let i = 0; i < tests.length; i++) {
    const testName = [
      'Mission Creation API',
      'Database Persistence',
      'Listing Visibility'
    ][i];
    
    console.log(`\n${i + 1}. Testing: ${testName}`);
    const result = await runTest(testName, tests[i]);
    results.push(result);
    console.log(`   ${result.details} (${result.timing}ms)`);
  }

  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach((result, i) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${i + 1}. ${status} ${result.name} (${result.timing}ms)`);
    if (!result.passed) {
      console.log(`   Error: ${result.details}`);
    }
  });

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Mission creation is working correctly.');
    process.exit(0);
  } else {
    console.log('🚨 Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('🚨 Test runner failed:', error);
    process.exit(1);
  });
}
