// Replit Storage service for API
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use local file system for Replit
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  await ensureUploadDir();
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

export async function deleteFile(filename: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn('File not found for deletion:', filename);
  }
}

export async function listFiles(): Promise<string[]> {
  await ensureUploadDir();
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    return files.map(file => `/uploads/${file}`);
  } catch {
    return [];
  }
}