// Google Cloud Storage service for API
import { Storage } from '@google-cloud/storage';

// Initialize GCS client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  // Cloud Run will automatically use the service account credentials
  // No need to specify keyFilename in production
});

const bucket = storage.bucket(process.env.GCS_BUCKET || 'swideal-uploads');

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  contentType: string;
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  try {
    const file = bucket.file(filename);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType,
      },
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', async () => {
        // Make the file public (optional - adjust based on your needs)
        await file.makePublic();
        
        resolve({
          filename,
          url: `https://storage.googleapis.com/${bucket.name}/${filename}`,
          size: buffer.length,
          contentType,
        });
      });
      
      stream.end(buffer);
    });
  } catch (error) {
    console.error('Error uploading file to GCS:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFile(filename: string): Promise<void> {
  try {
    await bucket.file(filename).delete();
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
    throw new Error('Failed to delete file');
  }
}

export async function getSignedUrl(filename: string, expires: number = 3600): Promise<string> {
  try {
    const [url] = await bucket.file(filename).getSignedUrl({
      action: 'read',
      expires: Date.now() + expires * 1000,
    });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}