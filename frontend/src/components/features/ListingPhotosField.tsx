import React, { useState, useRef } from 'react';
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

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    // Add loading placeholders immediately
    const tempPhotos: Photo[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      file,
      dataUrl: '',
      loading: true
    }));
    
    onPhotosChange([...photos, ...tempPhotos]);
    
    // Process images asynchronously
    const processedPhotos = await Promise.all(
      tempPhotos.map(async (photo) => {
        const dataUrl = await resizeImage(photo.file, 300, 300);
        return { ...photo, dataUrl, loading: false };
      })
    );
    
    onPhotosChange([...photos, ...processedPhotos]);
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