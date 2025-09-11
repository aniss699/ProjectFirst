
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

describe('Mission Creation Flow Integration', () => {
  beforeAll(() => {
    // Setup global mocks
    vi.stubGlobal('location', { reload: vi.fn() });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should complete full mission creation flow', async () => {
    // Mock successful API responses
    const mockHealthResponse = {
      ok: true,
      json: () => Promise.resolve({ status: 'healthy' })
    };

    const mockMissionResponse = {
      ok: true,
      json: () => Promise.resolve({ 
        id: 'test-123',
        title: 'Mission Test',
        status: 'draft',
        user_id: 1
      })
    };

    (fetch as any)
      .mockResolvedValueOnce(mockHealthResponse) // Health check
      .mockResolvedValueOnce(mockMissionResponse); // Mission creation

    // Import service after mocking
    const { MissionService } = await import('../client/src/services/missionService');

    // Test flow step by step
    
    // 1. Test connection
    const connectionTest = await MissionService.testConnection();
    expect(connectionTest).toBe(true);

    // 2. Test mission creation
    const missionData = {
      title: 'Mission Test Intégration',
      description: 'Description complète pour le test d\'intégration du flow',
      category: 'developpement',
      budget: '2000',
      location: 'Remote',
      urgency: 'medium' as const
    };

    const result = await MissionService.createMission(missionData);

    // Vérifications
    expect(result.ok).toBe(true);
    expect(result.id).toBe('test-123');
    expect(result.mission.title).toBe('Mission Test');

    // Vérifier que l'API a été appelée correctement
    expect(fetch).toHaveBeenCalledWith('/api/missions/health');
    expect(fetch).toHaveBeenCalledWith('/api/missions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"title":"Mission Test Intégration"')
    });
  });

  it('should handle team mission creation', async () => {
    const mockTeamResponse = {
      ok: true,
      json: () => Promise.resolve({ 
        id: 'team-456',
        title: 'Projet Équipe',
        isTeamMode: true,
        teamRequirements: []
      })
    };

    (fetch as any).mockResolvedValue(mockTeamResponse);

    const { MissionService } = await import('../client/src/services/missionService');

    const teamData = {
      title: 'Projet Équipe Test',
      description: 'Description pour projet équipe avec plusieurs spécialités',
      category: 'developpement',
      isTeamMode: true,
      timeline: '3' // teamSize
    };

    const result = await MissionService.createTeamProject(teamData);

    expect(result.ok).toBe(true);
    expect(result.id).toBe('team-456');
    expect(result.teamRequirements).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // Mock error response
    const mockErrorResponse = {
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' })
    };

    (fetch as any).mockResolvedValue(mockErrorResponse);

    const { MissionService } = await import('../client/src/services/missionService');

    const result = await MissionService.createMission({
      title: 'Test Error',
      description: 'Description test error',
      category: 'developpement'
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Server error');
  });
});
