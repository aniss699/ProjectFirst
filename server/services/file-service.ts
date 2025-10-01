
import { files } from '../../shared/schema.js';
import { db } from '../database.js';
import { eq, and } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = './uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Assurer que le dossier d'upload existe
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadFile(fileData: {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}, userId: number, context: {
  type: string;
  id?: number;
}) {
  try {
    await ensureUploadDir();

    // Validations
    if (fileData.size > MAX_FILE_SIZE) {
      throw new Error('Fichier trop volumineux (max 10MB)');
    }

    if (!ALLOWED_TYPES.includes(fileData.mimetype)) {
      throw new Error('Type de fichier non autorisé');
    }

    // Générer un nom unique
    const ext = path.extname(fileData.originalname);
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const fileUrl = `/uploads/${filename}`;

    // Sauvegarder le fichier
    await fs.writeFile(filepath, fileData.buffer);

    // Enregistrer en base
    const [file] = await db.insert(files).values({
      user_id: userId,
      filename,
      original_filename: fileData.originalname,
      file_type: fileData.mimetype,
      file_size: fileData.size,
      file_url: fileUrl,
      context_type: context.type,
      context_id: context.id || null
    }).returning();

    return file;
  } catch (error) {
    console.error('Erreur upload fichier:', error);
    throw error;
  }
}

export async function deleteFile(fileId: number, userId: number) {
  try {
    // Vérifier que le fichier appartient à l'utilisateur
    const file = await db.query.files.findFirst({
      where: and(
        eq(files.id, fileId),
        eq(files.user_id, userId)
      )
    });

    if (!file) {
      throw new Error('Fichier non trouvé');
    }

    // Supprimer le fichier physique
    const filepath = path.join(UPLOAD_DIR, file.filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.warn('Impossible de supprimer le fichier physique:', error);
    }

    // Supprimer de la base
    await db.delete(files).where(eq(files.id, fileId));

    return { success: true };
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    throw error;
  }
}

export async function getFilesByContext(contextType: string, contextId: number) {
  try {
    const contextFiles = await db.query.files.findMany({
      where: and(
        eq(files.context_type, contextType),
        eq(files.context_id, contextId)
      ),
      orderBy: [files.created_at]
    });

    return contextFiles;
  } catch (error) {
    console.error('Erreur récupération fichiers:', error);
    throw error;
  }
}

export async function getUserFiles(userId: number, contextType?: string) {
  try {
    let whereClause = eq(files.user_id, userId);
    
    if (contextType) {
      whereClause = and(whereClause, eq(files.context_type, contextType));
    }

    const userFiles = await db.query.files.findMany({
      where: whereClause,
      orderBy: [files.created_at]
    });

    return userFiles;
  } catch (error) {
    console.error('Erreur récupération fichiers utilisateur:', error);
    throw error;
  }
}
