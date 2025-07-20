import imageCompression from 'browser-image-compression';

interface ImageSize {
  width: number;
  suffix: string;
  quality: number;
}

const IMAGE_SIZES: ImageSize[] = [
  { width: 320, suffix: 'sm', quality: 0.9 },
  { width: 640, suffix: 'md', quality: 0.85 },
  { width: 1024, suffix: 'lg', quality: 0.8 },
  { width: 1920, suffix: 'xl', quality: 0.75 },
];

export interface OptimizedImage {
  original: File;
  compressed: File;
  thumbnail?: File;
  sizes?: Map<string, File>;
  metadata: {
    width: number;
    height: number;
    aspectRatio: number;
    originalSize: number;
    compressedSize: number;
  };
}

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  // Get original dimensions
  const dimensions = await getImageDimensions(file);
  
  // Main compression with WebP format
  const mainOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: 'image/webp' as const,
    alwaysKeepResolution: false,
  };

  // Compress main image
  let compressed = await imageCompression(file, mainOptions);
  
  // If still too large, compress more aggressively
  if (compressed.size > 2 * 1024 * 1024) {
    compressed = await imageCompression(file, {
      ...mainOptions,
      initialQuality: 0.7,
      maxSizeMB: 1.5,
    });
  }

  // Create thumbnail (always small)
  const thumbnail = await imageCompression(file, {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 200,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: 'image/webp' as const,
  });

  // Generate multiple sizes for responsive images (optional, for future use)
  const sizes = new Map<string, File>();
  
  // Only generate sizes smaller than original
  for (const size of IMAGE_SIZES) {
    if (size.width < dimensions.width) {
      try {
        const resized = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: size.width,
          useWebWorker: true,
          initialQuality: size.quality,
          fileType: 'image/webp' as const,
        });
        sizes.set(size.suffix, resized);
      } catch (error) {
        console.error(`Failed to create ${size.suffix} size:`, error);
      }
    }
  }

  return {
    original: file,
    compressed,
    thumbnail,
    sizes,
    metadata: {
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.width / dimensions.height,
      originalSize: file.size,
      compressedSize: compressed.size,
    },
  };
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

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const maxSize = 50 * 1024 * 1024; // 50MB before compression
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and HEIC/HEIF are allowed.',
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File is too large. Maximum size is 50MB.',
    };
  }
  
  return { isValid: true };
}

// Generate blur data URL for placeholder
export async function generateBlurDataURL(file: File): Promise<string> {
  const tinyImage = await imageCompression(file, {
    maxSizeMB: 0.001,
    maxWidthOrHeight: 20,
    useWebWorker: false,
    fileType: 'image/webp' as const,
  });
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(tinyImage);
  });
}

// Client-side EXIF data extraction for orientation
export async function getImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1); // Not JPEG, no orientation
        return;
      }
      
      const length = view.byteLength;
      let offset = 2;
      
      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        
        if (marker === 0xFFE1) {
          if (view.getUint32(offset + 2, false) !== 0x45786966) {
            resolve(1); // No EXIF
            return;
          }
          
          const little = view.getUint16(offset + 8, false) === 0x4949;
          offset += 10;
          
          const tags = view.getUint16(offset, little);
          offset += 2;
          
          for (let i = 0; i < tags; i++) {
            const tag = view.getUint16(offset + (i * 12), little);
            if (tag === 0x0112) {
              resolve(view.getUint16(offset + (i * 12) + 8, little));
              return;
            }
          }
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      
      resolve(1); // Default orientation
    };
    
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read first 64KB
  });
}