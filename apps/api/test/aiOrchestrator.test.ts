import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPricingSuggestion, enhanceBrief, logUserFeedback } from '../src/ai/aiOrchestrator';
import { geminiCall } from '../src/ai/adapters/geminiAdapter';
import { prismaSink } from '../src/ai/persisters/prismaSink';

// Mock des dépendances
vi.mock('../src/ai/adapters/geminiAdapter');
vi.mock('../src/ai/persisters/prismaSink');

const mockGeminiCall = vi.mocked(geminiCall);
const mockPrismaSink = vi.mocked(prismaSink);

describe('AI Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call gemini for pricing suggestion and log result', async () => {
    const mockOutput = {
      phase: 'pricing' as const,
      model_family: 'gemini' as const,
      model_name: 'gemini-2.5-flash',
      input_redacted: {},
      output: { priceMin: 1000, priceMax: 2000 },
      quality: { latency_ms: 500 },
      meta: {
        provider: 'google',
        allow_training: true,
        provenance: 'auto' as const,
        created_at: new Date().toISOString()
      }
    };

    mockGeminiCall.mockResolvedValue(mockOutput);
    mockPrismaSink.mockResolvedValue(undefined);

    const prompt = { projectTitle: 'Test', description: 'Test desc', category: 'dev' };
    const result = await getPricingSuggestion(prompt);

    expect(mockGeminiCall).toHaveBeenCalledWith('pricing', prompt);
    expect(mockPrismaSink).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'pricing',
        model_family: 'gemini',
        meta: expect.objectContaining({ allow_training: true })
      })
    );
    expect(result).toEqual({ priceMin: 1000, priceMax: 2000 });
  });

  it('should log user feedback correctly', async () => {
    mockPrismaSink.mockResolvedValue(undefined);

    const prompt = { test: 'prompt' };
    const feedback = { accepted: true, rating: 5, edits: 'test edits' };

    await logUserFeedback('pricing', prompt, feedback);

    expect(mockPrismaSink).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'pricing',
        model_family: 'local',
        model_name: 'feedback-only',
        meta: expect.objectContaining({
          provider: 'user',
          allow_training: true,
          provenance: 'human_validated'
        }),
        user_feedback: feedback
      })
    );
  });
});