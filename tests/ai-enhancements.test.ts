
/**
 * Tests de non-régression pour les enrichissements IA
 * Vérifie que l'existant fonctionne toujours avec les nouveaux services
 */

import { describe, test, expect, beforeAll } from 'vitest';

describe('AI Enhancements - Non-Regression Tests', () => {
  
  // Snapshot des endpoints existants (doit passer inchangé)
  test('Existing /api/ai/brief-analysis still works', async () => {
    const response = await fetch('http://localhost:3000/api/ai/brief-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Je veux un site web simple',
        title: 'Site vitrine',
        category: 'web-development'
      })
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // Structure existante préservée
    expect(data).toHaveProperty('score');
    expect(data).toHaveProperty('recommendations');
    expect(data).toHaveProperty('confidence');
  });

  test('Existing /api/ai/missions/suggest preserves structure', async () => {
    const response = await fetch('http://localhost:3000/api/ai/missions/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Site e-commerce',
        description: 'Boutique en ligne pour vendre mes produits',
        category: 'web-development',
        budget_min: 1000,
        budget_max: 3000
      })
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // Structure legacy préservée
    expect(data).toHaveProperty('suggestion');
    expect(data.suggestion).toHaveProperty('title');
    expect(data.suggestion).toHaveProperty('summary');
  });

  // Tests des nouveaux services (avec flags)
  test('New normalize endpoint works when enabled', async () => {
    // Skip si flag disabled
    if (process.env.ENABLE_NORMALIZE !== 'true') {
      return;
    }
    
    const response = await fetch('http://localhost:3000/api/ai/normalize', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Site web',
        description: 'Je veux créer un site web pour mon entreprise'
      })
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    
    expect(data).toHaveProperty('success');
    expect(data.data).toHaveProperty('completeness_score');
    expect(data.data).toHaveProperty('title_std');
  });

  test('New services return 503 when disabled', async () => {
    // Force flag off pour ce test
    const originalFlag = process.env.ENABLE_NORMALIZE;
    process.env.ENABLE_NORMALIZE = 'false';
    
    const response = await fetch('http://localhost:3000/api/ai/normalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test', description: 'Test' })
    });
    
    expect(response.status).toBe(503);
    
    // Restore
    process.env.ENABLE_NORMALIZE = originalFlag;
  });

  test('Health endpoint includes new services', async () => {
    const response = await fetch('http://localhost:3000/api/ai/health');
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data).toHaveProperty('features_enabled');
    expect(data.features_enabled).toHaveProperty('normalize');
    expect(data.features_enabled).toHaveProperty('generator');
    expect(data.features_enabled).toHaveProperty('questioner');
  });

  // Test d'intégration E2E minimal
  test('E2E: Create mission with AI enhancements', async () => {
    const briefData = {
      title: 'Application mobile iOS',
      description: 'Application de gestion de tâches avec synchronisation cloud',
      category: 'mobile-app'
    };

    // 1. Analyse normale (existant)
    const analysisResponse = await fetch('http://localhost:3000/api/ai/brief-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(briefData)
    });
    expect(analysisResponse.ok).toBe(true);

    // 2. Enrichissements si activés
    if (process.env.ENABLE_NORMALIZE === 'true') {
      const normalizeResponse = await fetch('http://localhost:3000/api/ai/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefData)
      });
      expect(normalizeResponse.ok).toBe(true);
    }

    // 3. Suggestions enrichies (modifié mais compatible)
    const suggestResponse = await fetch('http://localhost:3000/api/ai/missions/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...briefData,
        budget_min: 2000,
        budget_max: 8000
      })
    });
    expect(suggestResponse.ok).toBe(true);
    
    const suggestion = await suggestResponse.json();
    // Structure legacy toujours présente
    expect(suggestion.suggestion).toHaveProperty('title');
    expect(suggestion.suggestion).toHaveProperty('summary');
  });
});

// Tests de performance (les nouveaux services ne doivent pas ralentir l'existant)
describe('Performance Tests', () => {
  
  test('Existing endpoints maintain response time', async () => {
    const start = Date.now();
    
    await fetch('http://localhost:3000/api/ai/brief-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Simple test',
        category: 'web-development'
      })
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000); // Max 5s
  });
});
