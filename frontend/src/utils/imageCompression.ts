import imageCompression from 'browser-image-compression';

const compressionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
  fileType: 'image/webp',
  alwaysKeepResolution: false,
};

export async function compressImage(file: File): Promise<File> {
  try {
    // If file is already WebP and under 2MB, use it as-is
    if (file.type === 'image/webp' && file.size <= 2 * 1024 * 1024) {
      return file;
    }

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // If compression failed to reduce size enough, try with lower quality
    if (compressedFile.size > 2 * 1024 * 1024) {
      const fallbackOptions = {
        ...compressionOptions,
        initialQuality: 0.6,
        maxSizeMB: 1.5,
      };
      return await imageCompression(file, fallbackOptions);
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // If compression fails, return original file (validation will catch if too large)
    return file;
  }
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB before compression
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File is too large. Maximum size is 10MB.',
    };
  }
  
  return { isValid: true };
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}