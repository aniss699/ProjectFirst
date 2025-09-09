
// Replit Storage Configuration for Swideal
// This module handles file uploads and storage operations on Replit

// For Replit deployment, use local storage or external services
const STORAGE_CONFIG = {
  // Use Replit's built-in storage or external services like Cloudinary
  baseUrl: '/uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

export async function uploadFile(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: fileUrl }),
    });
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete file');
  }
}

export async function listFiles(prefix?: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/upload${prefix ? `?prefix=${prefix}` : ''}`);
    const { files } = await response.json();
    return files;
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

export { STORAGE_CONFIG };
