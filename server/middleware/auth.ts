import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../database.js';
import { users } from '../../shared/schema.js';

// Ajouter l'utilisateur authentifié au type Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: string;
        rating_mean?: string | null;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pour l'instant, on utilise le X-User-ID header que le client envoie
    // mais on le valide en base de données
    const userIdHeader = req.headers['x-user-id'] as string;
    
    if (!userIdHeader) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No user ID provided'
      });
    }

    const userId = parseInt(userIdHeader);
    if (isNaN(userId)) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Invalid user ID format'
      });
    }

    // Vérifier que l'utilisateur existe et est actif
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      rating_mean: users.rating_mean
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Invalid user'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userIdHeader = req.headers['x-user-id'] as string;
    
    if (userIdHeader) {
      const userId = parseInt(userIdHeader);
      if (!isNaN(userId)) {
        const [user] = await db.select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          rating_mean: users.rating_mean
        }).from(users).where(eq(users.id, userId)).limit(1);

        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue même en cas d'erreur pour les routes optionnelles
    next();
  }
};