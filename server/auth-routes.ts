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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Chercher l'utilisateur
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const userData = user[0];

    // Vérifier le mot de passe (en production, utiliser bcrypt)
    if (userData.password !== password) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
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
    const { email, password, name, role = 'CLIENT' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
    }

    // Créer l'utilisateur
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password, // En production, hasher avec bcrypt
        name,
        role,
        profile_data: {}
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

export default router;