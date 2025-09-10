import express from 'express';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import { users } from '../shared/schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Tentative de connexion:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ 
        error: 'Email et mot de passe requis',
        success: false 
      });
    }

    // Chercher l'utilisateur
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect',
        success: false 
      });
    }

    const userData = user[0];

    // Vérifier le mot de passe (en production, utiliser bcrypt)
    if (!userData.password || userData.password !== password) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect',
        success: false 
      });
    }

    // Créer la session utilisateur (sans le mot de passe)
    const userSession = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      rating_mean: userData.rating_mean,
      rating_count: userData.rating_count,
      profile_data: userData.profile_data,
      created_at: userData.created_at
    };

    res.json({
      success: true,
      user: userSession,
      message: `Bienvenue ${userData.name || userData.email} !`
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Tentative de création de compte:', { email: req.body.email, name: req.body.name });
    const { email, password, name, role = 'CLIENT' } = req.body;

    // Validation améliorée
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ 
        error: 'Email et mot de passe requis',
        success: false 
      });
    }

    if (!name || name.trim().length < 2) {
      console.log('❌ Nom invalide');
      return res.status(400).json({ 
        error: 'Le nom doit contenir au moins 2 caractères',
        success: false 
      });
    }

    if (password.length < 6) {
      console.log('❌ Mot de passe trop court');
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères',
        success: false 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      console.log('❌ Email déjà utilisé:', email);
      return res.status(409).json({ 
        error: 'Un compte existe déjà avec cet email',
        success: false 
      });
    }

    // Créer l'utilisateur
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        password, // En production, hasher avec bcrypt
        name: name.trim(),
        role: role.toUpperCase(),
        profile_data: {},
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    const userSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      rating_mean: newUser.rating_mean,
      rating_count: newUser.rating_count,
      profile_data: newUser.profile_data,
      created_at: newUser.created_at
    };

    res.status(201).json({
      success: true,
      user: userSession,
      message: 'Compte créé avec succès !'
    });

  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du compte' });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userData = user[0];
    const userProfile = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      rating_mean: userData.rating_mean,
      rating_count: userData.rating_count,
      profile_data: userData.profile_data,
      created_at: userData.created_at
    };

    res.json({ user: userProfile });

  } catch (error) {
    console.error('Erreur get profile:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du profil' });
  }
});

// Demo users endpoint
router.get('/demo-users', async (req, res) => {
  try {
    const demoUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      profile_data: users.profile_data
    }).from(users);

    res.json({ 
      users: demoUsers,
      message: 'Utilisateurs de démonstration disponibles'
    });

  } catch (error) {
    console.error('Erreur get demo users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour vérifier les comptes démo
router.get('/demo-accounts/verify', async (req, res) => {
  try {
    const demoEmails = ['demo@swideal.com', 'prestataire@swideal.com', 'admin@swideal.com'];
    
    const demoAccounts = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at
    })
    .from(users)
    .where(sql`${users.email} = ANY(${demoEmails})`);

    const accountsStatus = {
      client: demoAccounts.find(u => u.email === 'demo@swideal.com'),
      provider: demoAccounts.find(u => u.email === 'prestataire@swideal.com'),
      admin: demoAccounts.find(u => u.email === 'admin@swideal.com'),
      total: demoAccounts.length
    };

    res.json({
      success: true,
      accounts: accountsStatus,
      allPresent: demoAccounts.length === 3
    });
  } catch (error) {
    console.error('Erreur vérification comptes démo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la vérification des comptes démo' 
    });
  }
});

// Route pour diagnostiquer les comptes démo en production
router.get('/debug/demo-accounts', async (req, res) => {
  try {
    console.log('🔍 Diagnostic des comptes démo...');
    
    // Vérifier tous les utilisateurs
    const allUsers = await db.select({
      id: users.id,
      email: users.email, 
      name: users.name,
      role: users.role,
      created_at: users.created_at
    }).from(users);

    // Vérifier spécifiquement les comptes démo avec mots de passe
    const demoUsers = await db.select().from(users)
      .where(sql`${users.email} IN ('demo@swideal.com', 'prestataire@swideal.com', 'admin@swideal.com')`);

    res.json({
      debug: true,
      timestamp: new Date().toISOString(),
      database_url_exists: !!process.env.DATABASE_URL,
      total_users: allUsers.length,
      all_users: allUsers,
      demo_accounts_found: demoUsers.length,
      demo_accounts: demoUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        password_length: user.password?.length || 0,
        password_is_demo123: user.password === 'demo123',
        password_is_admin123: user.password === 'admin123',
        created_at: user.created_at
      }))
    });
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    res.status(500).json({ 
      error: 'Erreur lors du diagnostic', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour forcer la création des comptes démo
router.post('/debug/create-demo-accounts', async (req, res) => {
  try {
    console.log('🛠️ Création forcée des comptes démo...');
    
    // Données des comptes démo
    const demoAccounts = [
      {
        email: 'demo@swideal.com',
        password: 'demo123',
        name: 'Emma Rousseau',
        role: 'CLIENT',
        rating_mean: '0',
        rating_count: 0,
        profile_data: {
          company: 'TechStart Innovation',
          sector: 'SaaS',
          projects_posted: 0,
          total_budget_spent: 0,
          verified: true,
          phone: '+33 1 45 67 89 12',
          location: 'Paris, France'
        }
      },
      {
        email: 'prestataire@swideal.com',
        password: 'demo123',
        name: 'Julien Moreau',
        role: 'PRO',
        rating_mean: '0',
        rating_count: 0,
        profile_data: {
          specialties: ['React', 'Node.js', 'TypeScript', 'Python'],
          hourly_rate: 65,
          availability: 'Disponible',
          experience_years: 5,
          completed_projects: 0,
          success_rate: 0,
          response_time_hours: 4,
          certifications: ['React Developer'],
          portfolio_url: 'https://julienmoreau.dev',
          linkedin: 'https://linkedin.com/in/julienmoreau',
          phone: '+33 6 78 90 12 34',
          location: 'Lyon, France'
        }
      },
      {
        email: 'admin@swideal.com',
        password: 'admin123',
        name: 'Clara Dubois',
        role: 'ADMIN',
        profile_data: {
          department: 'Platform Management',
          access_level: 'full',
          phone: '+33 1 56 78 90 12'
        }
      }
    ];

    const results = [];
    for (const account of demoAccounts) {
      try {
        // Vérifier si le compte existe déjà
        const existingUser = await db.select().from(users).where(eq(users.email, account.email)).limit(1);
        
        if (existingUser.length > 0) {
          results.push({ 
            email: account.email, 
            status: 'exists', 
            message: 'Compte déjà existant' 
          });
        } else {
          // Créer le compte
          const [newUser] = await db.insert(users).values(account).returning();
          results.push({ 
            email: account.email, 
            status: 'created', 
            id: newUser.id,
            message: 'Compte créé avec succès' 
          });
        }
      } catch (error) {
        results.push({ 
          email: account.email, 
          status: 'error', 
          message: error.message 
        });
      }
    }

    res.json({
      success: true,
      message: 'Création des comptes démo terminée',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur création comptes démo:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création des comptes démo', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;