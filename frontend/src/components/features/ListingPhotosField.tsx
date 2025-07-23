import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { uploadImage, validateImageFile } from '../../utils/imageUpload';
import MobilePhotoField from './MobilePhotoField';
import styles from './ListingPhotosField.module.css';

interface Photo {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  uploadProgress?: number;
  url?: string;
  key?: string;
  variants?: {
    thumbnail: string;
    card: string;
    full: string;
  };
}

interface ListingPhotosFieldProps {
  label?: string;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  showTitle?: boolean;
}

const ListingPhotosField: React.FC<ListingPhotosFieldProps> = ({
  label,
  photos,
  onPhotosChange,
  showTitle = false
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const environment = useRelayEnvironment();
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect if device supports touch (mobile/tablet)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  useEffect(() => {
    // Check if mobile based on viewport width and touch capability
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 && isTouchDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isTouchDevice]);

  const uploadPhoto = useCallback(async (photo: Photo) => {
    try {
      // Update to show uploading state
      onPhotosChange((prev: Photo[]) => prev.map(p => 
        p.id === photo.id 
          ? { ...p, uploading: true, uploadProgress: 0 }
          : p
      ));

      // Upload the image
      const result = await uploadImage(photo.file, environment, (progress) => {
        onPhotosChange((prev: Photo[]) => prev.map(p => 
          p.id === photo.id 
            ? { ...p, uploadProgress: progress }
            : p
        ));
      });

      // Update with upload result - use same URL for all variants
      onPhotosChange((prev: Photo[]) => prev.map(p => 
        p.id === photo.id 
          ? { 
              ...p, 
              uploading: false, 
              uploaded: true, 
              url: result.url,
              key: result.key,
              uploadProgress: 100,
              variants: {
                thumbnail: result.url,
                card: result.url,
                full: result.url
              }
            }
          : p
      ));
    } catch (error) {
      console.error('Upload failed:', error);
      // Mark as failed but keep the preview
      onPhotosChange((prev: Photo[]) => prev.map(p => 
        p.id === photo.id 
          ? { ...p, uploading: false, uploaded: false, uploadProgress: 0 }
          : p
      ));
    }
  }, [environment, onPhotosChange]);

  const processFiles = useCallback(async (files: File[]) => {
    const remainingSlots = 6 - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Validate and create photo objects
    const newPhotos: Photo[] = [];
    for (const file of filesToAdd) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        continue;
      }

      const id = `${Date.now()}-${Math.random()}`;
      
      // Try to create preview - use FileReader for better iOS support
      let preview: string;
      try {
        // For iOS compatibility, use FileReader for HEIC/HEIF files
        if (file.type === 'image/heic' || file.type === 'image/heif' || !file.type) {
          preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } else {
          preview = URL.createObjectURL(file);
        }
      } catch (error) {
        console.error('Failed to create preview:', error);
        preview = URL.createObjectURL(file); // Fallback
      }
      
      newPhotos.push({
        id,
        file,
        preview,
        uploading: false,
        uploaded: false,
      });
    }
    
    // Update UI with new photos immediately
    const updatedPhotos = [...photos, ...newPhotos];
    onPhotosChange(updatedPhotos);
    
    // Force UI update by using requestAnimationFrame before starting uploads
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        for (const photo of newPhotos) {
          uploadPhoto(photo);
        }
      });
    });
  }, [photos, onPhotosChange, uploadPhoto]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    await processFiles(files);
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const photoToRemove = photos[index];
    
    if (!photoToRemove) {
      return;
    }
    
    // Clean up preview URL (only for blob URLs, not data URLs)
    if (photoToRemove?.preview && photoToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);
    
    onPhotosChange(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDropZoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDropZoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  // Use simple mobile component on mobile devices
  if (isMobile) {
    return (
      <div className={styles.container}>
        {showTitle && (
          <>
            <h2 className={styles.title}>Add photos</h2>
            <p className={styles.subtitle}>Upload up to 6 photos of your item</p>
          </>
        )}
        {label && !showTitle && <label className={styles.label}>{label}</label>}
        <MobilePhotoField photos={photos} onPhotosChange={onPhotosChange} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showTitle && (
        <>
          <h2 className={styles.title}>Add photos</h2>
          <p className={styles.subtitle}>Upload up to 6 photos of your item</p>
        </>
      )}
      {label && !showTitle && <label className={styles.label}>{label}</label>}
      
      <div 
        className={`${styles.photosGrid} ${isDraggingOver ? styles.draggingOver : ''}`}
        onDrop={handleFileDrop}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneDragLeave}
      >
        {[...Array(6)].map((_, index) => {
          const photo = photos[index];
          
          if (photo) {
            return (
              <div
                key={photo.id}
                className={`${styles.photoItem} ${draggedIndex === index ? styles.dragging : ''}`}
                draggable={!isTouchDevice}
                onDragStart={!isTouchDevice ? () => handleDragStart(index) : undefined}
                onDragOver={!isTouchDevice ? (e) => handleDragOver(e, index) : undefined}
                onDragEnd={!isTouchDevice ? handleDragEnd : undefined}
              >
                <img src={photo.preview} alt={`Photo ${index + 1}`} />
                {!photo.uploading && (
                  <button
                    className={styles.removePhoto}
                    onClick={() => handleRemovePhoto(index)}
                    aria-label="Remove photo"
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                )}
                {photo.uploading && (
                  <>
                    <div className={styles.photoShimmer}></div>
                    {photo.uploadProgress !== undefined && photo.uploadProgress > 0 && (
                      <div className={styles.uploadProgress}>
                        <div 
                          className={styles.uploadProgressBar}
                          style={{ width: `${photo.uploadProgress}%` }}
                        />
                        <span className={styles.uploadProgressText}>
                          {Math.round(photo.uploadProgress)}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          } else {
            return (
              <button 
                key={`empty-${index}`}
                className={styles.addPhotoButton} 
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            );
          }
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ListingPhotosField;