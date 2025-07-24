import React, { useState, useRef, useEffect } from 'react';
import styles from './ListingPhotosField.module.css';
import type { Photo } from '../../types/Photo';

interface ListingPhotosFieldProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const ListingPhotosField: React.FC<ListingPhotosFieldProps> = ({
  photos = [],
  onPhotosChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../../workers/imageProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Cleanup worker on unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !workerRef.current) return;

    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    // Add loading placeholders immediately
    const tempPhotos: Photo[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      file,
      dataUrl: '',
      loading: true
    }));
    
    onPhotosChange([...photos, ...tempPhotos]);
    
    // Process each image in the worker
    tempPhotos.forEach((photo) => {
      workerRef.current!.postMessage({
        file: photo.file,
        maxWidth: 300,
        maxHeight: 300,
        id: photo.id
      });
    });

    // Handle worker responses
    const handleWorkerMessage = (e: MessageEvent) => {
      const { id, dataUrl, success } = e.data;
      
      if (success) {
        onPhotosChange(prevPhotos => 
          prevPhotos.map(p => 
            p.id === id 
              ? { ...p, dataUrl, loading: false }
              : p
          )
        );
      }
    };

    workerRef.current.addEventListener('message', handleWorkerMessage);
  };

  const handleRemovePhoto = (photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add photos</h2>
      <p className={styles.subtitle}>Show your item from different angles</p>

      <div 
        className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className={styles.fileInput}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        {photos.length === 0 ? (
          <div className={styles.uploadPrompt}>
            <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className={styles.uploadText}>Drag photos here or click to browse</p>
            <button 
              type="button"
              className={styles.browseButton}
              onClick={() => fileInputRef.current?.click()}
            >
              Select Photos
            </button>
          </div>
        ) : (
          <div className={styles.photoGrid}>
            {photos.map(photo => (
              <div key={photo.id} className={styles.photoItem}>
                {photo.loading ? (
                  <div className={styles.loadingPlaceholder}>
                    <div className={styles.spinner} />
                  </div>
                ) : (
                  <img 
                    src={photo.dataUrl} 
                    alt={photo.file.name}
                    className={styles.photoImage}
                  />
                )}
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemovePhoto(photo.id)}
                  aria-label="Remove photo"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addMoreButton}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add more</span>
            </button>
          </div>
        )}
      </div>

      <p className={styles.helpText}>
        {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
      </p>
    </div>
  );
};

export default ListingPhotosField;