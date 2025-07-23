import { useState, useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { uploadImage } from '../utils/imageUpload';

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useImageUpload() {
  const environment = useRelayEnvironment();
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const upload = useCallback(async (file: File) => {
    setUploadState({ uploading: true, progress: 0, error: null });

    try {
      const result = await uploadImage(file, environment, (progress) => {
        setUploadState(prev => ({ ...prev, progress }));
      });

      setUploadState({ uploading: false, progress: 100, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({ uploading: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, [environment]);

  return { upload, uploadState };
}