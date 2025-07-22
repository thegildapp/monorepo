import { useState, useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { optimizeImage, validateImageFile } from '../utils/imageOptimization';
import { uploadImageToSpaces, uploadImagesInParallel, uploadImageVariantsToSpaces, type UploadProgress, type ImageVariantUrls } from '../utils/uploadToSpaces';

export interface ImageUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  results: UploadedImage[];
}

export interface UploadedImage {
  url: string;
  key: string;
  width: number;
  height: number;
  size: number;
  variants?: ImageVariantUrls;
}

export interface UseImageUploadOptions {
  maxFiles?: number;
  maxSizeMB?: number;
  onProgress?: (progress: number) => void;
  onComplete?: (images: UploadedImage[]) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const environment = useRelayEnvironment();
  const [state, setState] = useState<ImageUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    results: [],
  });

  const uploadSingle = useCallback(async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
      options.onError?.(validation.error || 'Invalid file');
      return null;
    }

    setState(prev => ({ ...prev, uploading: true, error: null, progress: 0 }));

    try {
      // Optimize image
      const optimized = await optimizeImage(file);
      
      // Upload all variants
      const variantsResult = await uploadImageVariantsToSpaces(
        {
          thumbnail: optimized.variants.thumbnail.file,
          card: optimized.variants.card.file,
          full: optimized.variants.full.file,
        },
        environment,
        (variant, progress) => {
          // Average progress across all variants
          setState(prev => ({ ...prev, progress: progress.percentage }));
          options.onProgress?.(progress.percentage);
        }
      );

      if (!variantsResult.success) {
        throw new Error(variantsResult.error || 'Upload failed');
      }

      const uploadedImage: UploadedImage = {
        url: variantsResult.urls!.full, // Use full size as default URL for backward compatibility
        key: variantsResult.keys!.full,
        width: optimized.metadata.width,
        height: optimized.metadata.height,
        size: optimized.metadata.compressedSize,
        variants: variantsResult.urls,
      };

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        results: [...prev.results, uploadedImage],
      }));

      options.onComplete?.([uploadedImage]);
      return uploadedImage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({ ...prev, uploading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      return null;
    }
  }, [environment, options]);

  const uploadMultiple = useCallback(async (files: File[]) => {
    if (options.maxFiles && files.length > options.maxFiles) {
      const error = `Maximum ${options.maxFiles} files allowed`;
      setState(prev => ({ ...prev, error }));
      options.onError?.(error);
      return [];
    }

    setState(prev => ({ ...prev, uploading: true, error: null, progress: 0 }));

    try {
      // Validate all files first
      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid file');
        }
      }

      // Optimize all images
      const optimizedImages = await Promise.all(
        files.map(file => optimizeImage(file))
      );

      // Upload variants for each image
      const uploadedImages: UploadedImage[] = [];
      const uploadProgresses = new Map<number, number>();
      
      for (let i = 0; i < optimizedImages.length; i++) {
        const optimized = optimizedImages[i];
        
        // Upload all variants for this image
        const variantsResult = await uploadImageVariantsToSpaces(
          {
            thumbnail: optimized.variants.thumbnail.file,
            card: optimized.variants.card.file,
            full: optimized.variants.full.file,
          },
          environment,
          (variant, progress) => {
            // Track progress per image
            uploadProgresses.set(i, progress.percentage);
            const totalProgress = Array.from(uploadProgresses.values()).reduce((a, b) => a + b, 0) / files.length;
            setState(prev => ({ ...prev, progress: Math.round(totalProgress) }));
            options.onProgress?.(Math.round(totalProgress));
          }
        );
        
        if (variantsResult.success && variantsResult.urls && variantsResult.keys) {
          uploadedImages.push({
            url: variantsResult.urls.full, // Use full size as default URL
            key: variantsResult.keys.full,
            width: optimized.metadata.width,
            height: optimized.metadata.height,
            size: optimized.metadata.compressedSize,
            variants: variantsResult.urls,
          });
        }
      }

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        results: [...prev.results, ...uploadedImages],
      }));

      options.onComplete?.(uploadedImages);
      return uploadedImages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({ ...prev, uploading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      return [];
    }
  }, [environment, options]);

  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      results: [],
    });
  }, []);

  return {
    ...state,
    uploadSingle,
    uploadMultiple,
    reset,
  };
}