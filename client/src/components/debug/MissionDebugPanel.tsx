
import React, { useState } from 'react';
import { Button } from '../ui/button';

export function MissionDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkDebugInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/missions/debug');
      const data = await response.json();
      setDebugInfo(data);
      console.log('🔍 Debug info received:', data);
    } catch (error) {
      console.error('❌ Error fetching debug info:', error);
      setDebugInfo({ error: 'Failed to fetch debug info' });
    }
    setIsLoading(false);
  };

  const createTestMission = async () => {
    setIsLoading(true);
    try {
      const testMission = {
        title: `Test Mission ${Date.now()}`,
        description: 'This is a test mission created for debugging purposes',
        category: 'Development',
        budget_min: 500,
        budget_max: 1000,
        location: 'Remote',
        urgency: 'medium',
        skills_required: ['JavaScript', 'React'],
        is_team_mission: false,
        remote_allowed: true
      };

      console.log('🧪 Creating test mission:', testMission);
      
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMission),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('✅ Test mission created:', result);
      alert(`Mission created successfully with ID: ${result.id}`);
      
      // Refresh debug info
      checkDebugInfo();
    } catch (error) {
      console.error('❌ Error creating test mission:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Mission Debug Panel</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkDebugInfo} disabled={isLoading}>
            Check Database Status
          </Button>
          <Button onClick={createTestMission} disabled={isLoading}>
            Create Test Mission
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Debug Information:</h4>
            <pre className="bg-black text-green-400 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
