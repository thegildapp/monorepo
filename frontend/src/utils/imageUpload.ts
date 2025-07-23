import { graphql, commitMutation } from 'react-relay';

const generateUploadUrlMutation = graphql`
  mutation imageUploadGenerateUploadUrlMutation($filename: String!, $contentType: String!) {
    generateUploadUrl(filename: $filename, contentType: $contentType) {
      url
      key
    }
  }
`;

export interface UploadResult {
  url: string;
  key: string;
}

// Generate a random filename while preserving the file extension
function generateRandomFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop() || 'jpg';
  return `${timestamp}-${randomString}.${extension}`;
}

export async function uploadImage(
  file: File, 
  environment: any,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Generate random filename
  const randomFilename = generateRandomFilename(file.name);

  // Get pre-signed upload URL from backend
  const uploadUrlData = await new Promise<{ url: string; key: string }>((resolve, reject) => {
    commitMutation(environment, {
      mutation: generateUploadUrlMutation,
      variables: {
        filename: randomFilename,
        contentType: file.type,
      },
      onCompleted: (response: any) => {
        if (response.generateUploadUrl) {
          resolve(response.generateUploadUrl);
        } else {
          reject(new Error('Failed to generate upload URL'));
        }
      },
      onError: (error: Error) => {
        reject(error);
      },
    });
  });

  if (!uploadUrlData) {
    throw new Error('Failed to generate upload URL');
  }

  // Upload file directly to storage
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // Construct the public CDN URL
        // Format: https://{bucket}.{region}.cdn.digitaloceanspaces.com/{key}
        const bucket = 'gild';
        const region = 'sfo3';
        const publicUrl = `https://${bucket}.${region}.cdn.digitaloceanspaces.com/${uploadUrlData.key}`;
        
        resolve({
          url: publicUrl,
          key: uploadUrlData.key,
        });
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrlData.url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.send(file);
  });
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a JPEG, PNG, or WebP image.',
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image must be less than 10MB.',
    };
  }
  
  return { isValid: true };
}