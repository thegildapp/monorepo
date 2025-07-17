import { commitMutation } from 'react-relay';
import { GenerateUploadUrlMutation } from '../queries/listings';
import type { listingsGenerateUploadUrlMutation } from '../__generated__/listingsGenerateUploadUrlMutation.graphql';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export async function uploadImageToSpaces(
  file: File,
  environment: any,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Step 1: Generate pre-signed URL
    const uploadUrlResult = await new Promise<{ url: string; key: string }>((resolve, reject) => {
      commitMutation<listingsGenerateUploadUrlMutation>(environment, {
        mutation: GenerateUploadUrlMutation,
        variables: {
          filename: file.name,
          contentType: file.type,
        },
        onCompleted: (response) => {
          if (response.generateUploadUrl) {
            resolve({
              url: response.generateUploadUrl.url,
              key: response.generateUploadUrl.key,
            });
          } else {
            reject(new Error('Failed to generate upload URL'));
          }
        },
        onError: (error) => {
          reject(error);
        },
      });
    });

    // Step 2: Upload file to Digital Ocean Spaces
    const uploadResult = await uploadFileToSignedUrl(
      file,
      uploadUrlResult.url,
      onProgress
    );

    if (uploadResult.success) {
      // Construct the public URL for the uploaded file
      const spacesEndpoint = import.meta.env.VITE_SPACES_ENDPOINT || 'https://gild.sfo3.digitaloceanspaces.com';
      const publicUrl = `${spacesEndpoint}/${uploadUrlResult.key}`;
      
      return {
        success: true,
        url: publicUrl,
        key: uploadUrlResult.key,
      };
    } else {
      return uploadResult;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

async function uploadFileToSignedUrl(
  file: File,
  signedUrl: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          error: `Upload failed with status ${xhr.status}`,
        });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({
        success: false,
        error: 'Network error during upload',
      });
    });

    xhr.addEventListener('abort', () => {
      resolve({
        success: false,
        error: 'Upload was aborted',
      });
    });

    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.send(file);
  });
}

export async function uploadImagesInParallel(
  files: File[],
  environment: any,
  onProgress?: (index: number, progress: UploadProgress) => void,
  maxConcurrent: number = 3
): Promise<UploadResult[]> {
  const results: UploadResult[] = new Array(files.length);
  const executing: Map<Promise<void>, number> = new Map();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const index = i;

    const uploadPromise = uploadImageToSpaces(
      file,
      environment,
      onProgress ? (progress) => onProgress(index, progress) : undefined
    ).then((result) => {
      results[index] = result;
      executing.delete(uploadPromise);
    }).catch((error) => {
      results[index] = {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
      executing.delete(uploadPromise);
    });

    executing.set(uploadPromise, index);

    // If we've reached max concurrent uploads, wait for one to complete
    if (executing.size >= maxConcurrent) {
      await Promise.race(executing.keys());
    }
  }

  // Wait for all remaining uploads to complete
  await Promise.all(executing.keys());

  return results;
}