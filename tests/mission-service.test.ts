
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MissionService } from '../client/src/services/missionService';

// Mock fetch
global.fetch = vi.fn();

describe('MissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateInput', () => {
    it('should validate valid mission data', () => {
      const validData = {
        title: 'Test Mission',
        description: 'Description valide de plus de 10 caractères',
        category: 'developpement',
        budget: '1000',
        location: 'Paris'
      };

      const result = MissionService.validateInput(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject title too short', () => {
      const invalidData = {
        title: 'AB',
        description: 'Description valide de plus de 10 caractères',
        category: 'developpement'
      };

      const result = MissionService.validateInput(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le titre doit contenir au moins 3 caractères');
    });

    it('should reject description too short', () => {
      const invalidData = {
        title: 'Titre valide',
        description: 'Court',
        category: 'developpement'
      };

      const result = MissionService.validateInput(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La description doit contenir au moins 10 caractères');
    });

    it('should reject budget below minimum', () => {
      const invalidData = {
        title: 'Titre valide',
        description: 'Description valide de plus de 10 caractères',
        category: 'developpement',
        budget: '5'
      };

      const result = MissionService.validateInput(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le budget minimum est de 10€');
    });
  });

  describe('formatMissionData', () => {
    it('should format mission data correctly', () => {
      const input = {
        title: '  Test Mission  ',
        description: '  Description valide  ',
        category: 'developpement',
        budget: '1500',
        location: '  Paris  ',
        urgency: 'high' as const,
        requirements: '  Exigences spéciales  ',
        isTeamMode: true
      };

      const result = MissionService.formatMissionData(input);

      expect(result.title).toBe('Test Mission');
      expect(result.description).toBe('Description valide');
      expect(result.budget).toBe(1500);
      expect(result.location).toBe('Paris');
      expect(result.urgency).toBe('high');
      expect(result.requirements).toBe('Exigences spéciales');
      expect(result.isTeamMode).toBe(true);
    });

    it('should handle default values', () => {
      const input = {
        title: 'Test',
        description: 'Description',
        category: '',
        budget: undefined,
        location: undefined,
        isTeamMode: undefined
      };

      const result = MissionService.formatMissionData(input);

      expect(result.category).toBe('developpement');
      expect(result.budget).toBe(1000);
      expect(result.location).toBe('Remote');
      expect(result.urgency).toBe('medium');
      expect(result.isTeamMode).toBe(false);
    });
  });

  describe('createMission', () => {
    it('should create mission successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ id: '123', title: 'Test Mission' })
      };
      
      (fetch as any).mockResolvedValue(mockResponse);

      const data = {
        title: 'Test Mission',
        description: 'Description valide de plus de 10 caractères',
        category: 'developpement'
      };

      const result = await MissionService.createMission(data);

      expect(result.ok).toBe(true);
      expect(result.id).toBe('123');
      expect(result.mission.title).toBe('Test Mission');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        title: 'AB',
        description: 'Court',
        category: ''
      };

      const result = await MissionService.createMission(invalidData);

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Le titre doit contenir au moins 3 caractères');
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const data = {
        title: 'Test Mission',
        description: 'Description valide de plus de 10 caractères',
        category: 'developpement'
      };

      const result = await MissionService.createMission(data);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('testConnection', () => {
    it('should return true when health endpoint is accessible', async () => {
      (fetch as any).mockResolvedValue({ ok: true });

      const result = await MissionService.testConnection();
      expect(result).toBe(true);
    });

    it('should return false when health endpoint fails', async () => {
      (fetch as any).mockResolvedValue({ ok: false });

      const result = await MissionService.testConnection();
      expect(result).toBe(false);
    });
  });
});
