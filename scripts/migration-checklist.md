
# 📋 Checklist Migration & Tests - Backend Marketplace

## 🔄 Phase 1: Migrations Base de Données

### ✅ Préparation
- [ ] Backup de la base de données actuelle
- [ ] Vérification des connexions et permissions
- [ ] Test sur environnement de staging

### ✅ Exécution Migrations
```bash
# 1. Créer les ENUMs et table missions
psql -d swideal -f scripts/001_missions_industrialized.sql

# 2. Créer fonction upsert announcements
psql -d swideal -f scripts/002_announcements_upsert.sql

# 3. Vérifier les index créés
psql -d swideal -c "\d+ missions"
psql -d swideal -c "\d+ announcements"
```

### ✅ Validation Post-Migration
- [ ] Tous les index sont créés
- [ ] Triggers fonctionnent (update_at, published_at)
- [ ] Contraintes CHECK validées
- [ ] Performance des requêtes courantes

## 🧪 Phase 2: Tests Automatisés

### ✅ Tests Unitaires - Fonction normalizeMission

```typescript
// tests/mission-normalizer.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeMission, eurosToCents } from '../server/services/mission-normalizer.js';

describe('normalizeMission', () => {
  const validInput = {
    title: 'Test Mission',
    description: 'Description longue de plus de 10 caractères',
    category: 'developpement',
    budget: { type: 'fixed', valueCents: 500000, currency: 'EUR' },
    status: 'draft'
  };

  it('should normalize valid mission data', () => {
    const result = normalizeMission(validInput, { authUserId: 123 });
    
    expect(result.user_id).toBe(123);
    expect(result.client_id).toBe(123);
    expect(result.budget_type).toBe('fixed');
    expect(result.budget_value_cents).toBe(500000);
    expect(result.status).toBe('draft');
  });

  it('should reject invalid auth user ID', () => {
    expect(() => {
      normalizeMission(validInput, { authUserId: 0 });
    }).toThrow('Auth user ID is required');
  });

  it('should validate budget range constraints', () => {
    const invalidRange = {
      ...validInput,
      budget: { type: 'range', minCents: 1000, maxCents: 500, currency: 'EUR' }
    };
    
    expect(() => {
      normalizeMission(invalidRange, { authUserId: 123 });
    }).toThrow('Budget minimum cannot be greater than maximum');
  });

  it('should enforce team mission rules', () => {
    const invalidTeam = {
      ...validInput,
      team: { isTeamMission: true, teamSize: 1 }
    };
    
    expect(() => {
      normalizeMission(invalidTeam, { authUserId: 123 });
    }).toThrow('Team mission must have team size greater than 1');
  });

  it('should validate future deadlines', () => {
    const pastDeadline = {
      ...validInput,
      deadline: new Date('2020-01-01')
    };
    
    expect(() => {
      normalizeMission(pastDeadline, { authUserId: 123 });
    }).toThrow('Deadline must be in the future');
  });
});

// Test des utilitaires
describe('Utility functions', () => {
  it('should convert euros to cents correctly', () => {
    expect(eurosToCents(100)).toBe(10000);
    expect(eurosToCents(99.99)).toBe(9999);
    expect(eurosToCents(0.01)).toBe(1);
  });
});
```

### ✅ Tests d'Intégration - API Endpoints

```typescript
// tests/missions-api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';
import { db } from '../server/database.js';

describe('POST /api/missions', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Setup utilisateur test
    const user = await createTestUser();
    userId = user.id;
    authToken = generateAuthToken(user);
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestData();
  });

  it('should create mission with valid data', async () => {
    const missionData = {
      title: 'Test Mission API',
      description: 'Description complète pour test API integration',
      category: 'developpement',
      budget: {
        type: 'fixed',
        valueCents: 500000,
        currency: 'EUR'
      },
      status: 'draft'
    };

    const response = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(missionData)
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.user_id).toBe(userId);
    expect(response.body.budget_value_cents).toBe(500000);
  });

  it('should reject mission without auth', async () => {
    const missionData = {
      title: 'Test Mission',
      description: 'Description test'
    };

    await request(app)
      .post('/api/missions')
      .send(missionData)
      .expect(401);
  });

  it('should validate required fields', async () => {
    await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(400);
  });
});

describe('GET /api/missions/:id', () => {
  it('should return mission with correct format', async () => {
    const mission = await createTestMission(userId);
    
    const response = await request(app)
      .get(`/api/missions/${mission.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Vérifier format de réponse
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('budget');
    expect(response.body.budget).toHaveProperty('type');
    expect(response.body).toHaveProperty('location');
    expect(response.body).toHaveProperty('bidsSummary');
    expect(response.body).toHaveProperty('permissions');
    expect(response.body).toHaveProperty('client');
  });
});
```

### ✅ Tests de Performance

```typescript
// tests/performance.test.ts
describe('Performance Tests', () => {
  it('should handle 100 concurrent mission creations', async () => {
    const start = Date.now();
    
    const promises = Array.from({ length: 100 }, (_, i) => 
      createTestMission(userId, { title: `Mission ${i}` })
    );
    
    await Promise.all(promises);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000); // < 5 secondes
  });

  it('should search missions efficiently', async () => {
    await createTestMissions(1000); // Créer beaucoup de missions
    
    const start = Date.now();
    
    const response = await request(app)
      .get('/api/missions/search')
      .query({ 
        query: 'React JavaScript',
        category: 'developpement',
        limit: 20 
      });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500); // < 500ms
    expect(response.body.missions.length).toBeLessThanOrEqual(20);
  });
});
```

## 🔒 Phase 3: Tests de Sécurité

### ✅ Tests d'Authentification

```typescript
describe('Security Tests', () => {
  it('should prevent userId manipulation', async () => {
    const maliciousData = {
      title: 'Hack attempt',
      description: 'Trying to set wrong userId',
      userId: 999, // Différent de l'auth token
      status: 'published'
    };

    const response = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(maliciousData)
      .expect(201);

    // Vérifier que user_id vient de l'auth, pas du payload
    expect(response.body.user_id).toBe(userId);
    expect(response.body.user_id).not.toBe(999);
  });

  it('should sanitize SQL injection attempts', async () => {
    const sqlInjection = {
      title: "'; DROP TABLE missions; --",
      description: 'SQL injection test'
    };

    await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(sqlInjection)
      .expect(400); // Devrait être rejeté par validation
  });

  it('should prevent XSS in mission content', async () => {
    const xssAttempt = {
      title: '<script>alert("xss")</script>',
      description: 'Test XSS <img src=x onerror=alert(1)>'
    };

    const response = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(xssAttempt)
      .expect(201);

    // Vérifier que les scripts sont échappés
    expect(response.body.title).not.toContain('<script>');
    expect(response.body.description).not.toContain('<img src=x');
  });
});
```

## ⚡ Phase 4: Tests de Charge

```bash
# Tests avec Artillery.js
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Create and read missions"
    requests:
      - post:
          url: "/api/missions"
          headers:
            Authorization: "Bearer {{authToken}}"
          json:
            title: "Load test mission"
            description: "Mission créée pendant test de charge"
      - get:
          url: "/api/missions/{{$randomNumber}}"

# Commande
artillery run artillery-config.yml
```

## 🎯 Phase 5: Validation Fonctionnelle

### ✅ Scénarios End-to-End

1. **Cycle complet mission**
   - [ ] Création draft → validation → publication
   - [ ] Réception offres → sélection → attribution
   - [ ] Sync feed en temps réel

2. **Gestion équipe**
   - [ ] Mission équipe avec team_size > 1
   - [ ] Validation contraintes métier

3. **Recherche et filtrage**
   - [ ] Recherche full-text fonctionne
   - [ ] Filtres budget, localisation, compétences
   - [ ] Performance avec gros volumes

## 📊 Métriques de Validation

```sql
-- Requêtes de validation post-migration

-- 1. Vérifier contraintes
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'missions';

-- 2. Performance index
EXPLAIN ANALYZE 
SELECT * FROM missions 
WHERE status = 'published' 
  AND category = 'developpement' 
ORDER BY created_at DESC 
LIMIT 20;

-- 3. Recherche full-text
EXPLAIN ANALYZE 
SELECT * FROM missions 
WHERE search_vector @@ to_tsquery('french', 'React & JavaScript')
LIMIT 10;

-- 4. Stats générales
SELECT 
  status,
  COUNT(*) as count,
  AVG(budget_value_cents) as avg_budget,
  COUNT(DISTINCT user_id) as unique_clients
FROM missions 
GROUP BY status;
```

## ✅ Checklist Finale

- [ ] Toutes les migrations exécutées sans erreur
- [ ] Tests unitaires passent (>95% coverage)
- [ ] Tests d'intégration passent
- [ ] Tests de sécurité validés
- [ ] Performance acceptable (<500ms queries courantes)
- [ ] Monitoring et alertes configurés
- [ ] Documentation API mise à jour
- [ ] Formation équipe effectuée
