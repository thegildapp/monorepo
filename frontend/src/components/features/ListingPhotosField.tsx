import React, { useState, useRef, useCallback, useEffect } from 'react';
import { compressImage } from '../../utils/imageCompression';
import { uploadImageToSpaces } from '../../utils/uploadToSpaces';
import { useRelayEnvironment } from 'react-relay';
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
}

interface ListingPhotosFieldProps {
  label?: string;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const ListingPhotosField: React.FC<ListingPhotosFieldProps> = ({
  label,
  photos,
  onPhotosChange
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastMoveTime = useRef<number>(0);
  const environment = useRelayEnvironment();
  const uploadQueue = useRef<Map<string, boolean>>(new Map());
  const activeUploads = useRef<number>(0);
  const MAX_CONCURRENT_UPLOADS = 3;
  const currentPhotosRef = useRef<Photo[]>([]);
  
  // Keep ref in sync with photos prop
  useEffect(() => {
    currentPhotosRef.current = photos;
  }, [photos]);

  const uploadImage = useCallback(async (photo: Photo) => {
    if (uploadQueue.current.has(photo.id)) return; // Already uploading
    
    // Check if photo still exists before starting upload
    if (!currentPhotosRef.current.some(p => p.id === photo.id)) {
      return;
    }
    
    // Wait if we're at max concurrent uploads
    while (activeUploads.current >= MAX_CONCURRENT_UPLOADS) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Check again after waiting
    if (!currentPhotosRef.current.some(p => p.id === photo.id)) {
      return;
    }
    
    uploadQueue.current.set(photo.id, true);
    activeUploads.current++;

    try {
      const result = await uploadImageToSpaces(
        photo.file,
        environment,
        (progress) => {
          // Update specific photo's progress
          onPhotosChange(prevPhotos => 
            prevPhotos.map(p => 
              p.id === photo.id 
                ? { ...p, uploadProgress: progress.percentage }
                : p
            )
          );
        }
      );

      if (result.success && result.url) {
        onPhotosChange(prevPhotos => 
          prevPhotos.map(p => 
            p.id === photo.id 
              ? { 
                  ...p, 
                  uploading: false, 
                  uploaded: true, 
                  url: result.url,
                  key: result.key,
                  uploadProgress: 100
                }
              : p
          )
        );
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // Mark as failed but keep the preview
      onPhotosChange(prevPhotos => 
        prevPhotos.map(p => 
          p.id === photo.id 
            ? { ...p, uploading: false, uploaded: false, uploadProgress: 0 }
            : p
        )
      );
    } finally {
      uploadQueue.current.delete(photo.id);
      activeUploads.current--;
    }
  }, [onPhotosChange, environment]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Reset file input immediately to allow re-selecting same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    const remainingSlots = 6 - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Create photos with instant previews
    const newPhotos: Photo[] = filesToAdd.map((file, i) => {
      const id = `${Date.now()}-${Math.random()}-${i}`;
      const preview = URL.createObjectURL(file);
      
      return {
        id,
        file,
        preview,
        uploading: true,
        uploaded: false,
        uploadProgress: 0
      };
    });
    
    // Update UI immediately with all photos
    const updatedPhotos = [...photos, ...newPhotos];
    onPhotosChange(updatedPhotos);
    
    // Process all photos in parallel (compress and upload)
    const processPromises = newPhotos.map(async (photo, index) => {
      try {
        // Compress the image
        const compressedFile = await compressImage(photo.file);
        
        // Check if photo was removed during compression
        const stillExists = currentPhotosRef.current.some(p => p.id === photo.id);
        if (!stillExists) {
          URL.revokeObjectURL(photo.preview);
          return;
        }
        
        const compressedPreview = URL.createObjectURL(compressedFile);
        
        // Update with compressed version
        onPhotosChange(prevPhotos => 
          prevPhotos.map(p => 
            p.id === photo.id 
              ? { ...p, file: compressedFile, preview: compressedPreview }
              : p
          )
        );
        
        // Clean up original preview
        URL.revokeObjectURL(photo.preview);
        
        // Start upload immediately after compression
        const updatedPhoto = { ...photo, file: compressedFile, preview: compressedPreview };
        await uploadImage(updatedPhoto);
      } catch (error) {
        console.error('Error processing image:', error);
        onPhotosChange(prevPhotos => 
          prevPhotos.map(p => 
            p.id === photo.id 
              ? { ...p, uploading: false, uploaded: false }
              : p
          )
        );
      }
    });
    
    // Don't await - let them run in parallel
    Promise.all(processPromises).catch(err => {
      console.error('Error processing images:', err);
    });
  };

  const handleRemovePhoto = (index: number) => {
    const photoToRemove = photos[index];
    
    // Cancel upload if it's in progress
    if (photoToRemove && uploadQueue.current.has(photoToRemove.id)) {
      uploadQueue.current.delete(photoToRemove.id);
    }
    
    // Clean up preview URL
    if (photoToRemove && photoToRemove.preview) {
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

  // Touch event handlers for mobile
  const handleTouchStart = (_e: React.TouchEvent, index: number) => {
    setTouchDragIndex(index);
    
    // Prevent scrolling while dragging
    document.body.style.overflow = 'hidden';
    
    // Add haptic feedback if available
    if (window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(10);
    }
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchDragIndex === null) return;
    
    // Throttle touch move events to 60fps
    const now = Date.now();
    if (now - lastMoveTime.current < 16) return;
    lastMoveTime.current = now;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (!element) return;
    
    // Find the photo item we're over
    const photoItem = element.closest(`.${styles.photoItem}`);
    if (!photoItem) return;
    
    const gridElement = gridRef.current;
    if (!gridElement) return;
    
    // Get all photo items
    const photoItems = Array.from(gridElement.querySelectorAll(`.${styles.photoItem}`));
    const targetIndex = photoItems.indexOf(photoItem as HTMLElement);
    
    if (targetIndex !== -1 && targetIndex !== touchDragIndex && photos[targetIndex]) {
      // Only reorder if we're over a different valid photo
      const newPhotos = [...photos];
      const draggedPhoto = newPhotos[touchDragIndex];
      newPhotos.splice(touchDragIndex, 1);
      newPhotos.splice(targetIndex, 0, draggedPhoto);
      
      onPhotosChange(newPhotos);
      setTouchDragIndex(targetIndex);
    }
  }, [touchDragIndex, photos, onPhotosChange]);

  const handleTouchEnd = () => {
    setTouchDragIndex(null);
    document.body.style.overflow = '';
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) return;

    const remainingSlots = 6 - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Create photos with instant previews
    const newPhotos: Photo[] = filesToAdd.map((file, i) => {
      const id = `${Date.now()}-${Math.random()}-${i}`;
      const preview = URL.createObjectURL(file);
      
      return {
        id,
        file,
        preview,
        uploading: true,
        uploaded: false,
        uploadProgress: 0
      };
    });
    
    // Update UI immediately with all photos
    const updatedPhotos = [...photos, ...newPhotos];
    onPhotosChange(updatedPhotos);
    
    // Process all photos in parallel (compress and upload)
    const processPromises = newPhotos.map(async (photo, index) => {
      try {
        // Compress the image
        const compressedFile = await compressImage(photo.file);
        
        // Check if photo was removed during compression
        const stillExists = currentPhotosRef.current.some(p => p.id === photo.id);
        if (!stillExists) {
          URL.revokeObjectURL(photo.preview);
          return;
        }
        
        const compressedPreview = URL.createObjectURL(compressedFile);
        
        // Update with compressed version
        onPhotosChange(prevPhotos => 
          prevPhotos.map(p => 
            p.id === photo.id 
              ? { ...p, file: compressedFile, preview: compressedPreview }
              : p
          )
        );
        
        // Clean up original preview
        URL.revokeObjectURL(photo.preview);
        
        // Start upload immediately after compression
        const updatedPhoto = { ...photo, file: compressedFile, preview: compressedPreview };
        await uploadImage(updatedPhoto);
      } catch (error) {
        console.error('Error processing image:', error);
        onPhotosChange(prevPhotos => 
          prevPhotos.map(p => 
            p.id === photo.id 
              ? { ...p, uploading: false, uploaded: false }
              : p
          )
        );
      }
    });
    
    // Don't await - let them run in parallel
    Promise.all(processPromises).catch(err => {
      console.error('Error processing images:', err);
    });
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

  const allPhotosUploaded = photos.length > 0 && photos.every(p => p.uploaded);
  const uploadingCount = photos.filter(p => p.uploading).length;

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div 
        ref={gridRef}
        className={`${styles.photosGrid} ${isDraggingOver ? styles.draggingOver : ''}`}
        onDrop={handleFileDrop}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneDragLeave}
      >
        {/* Show all 6 slots */}
        {[...Array(6)].map((_, index) => {
          const photo = photos[index];
          
          if (photo) {
            return (
              <div
                key={photo.id}
                className={`${styles.photoItem} ${draggedIndex === index || touchDragIndex === index ? styles.dragging : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
              >
                {photo.preview ? (
                  <img src={photo.preview} alt={`Photo ${index + 1}`} />
                ) : (
                  <div className={styles.photoPlaceholder} />
                )}
                {!photo.uploading && (
                  <button
                    className={styles.removePhoto}
                    onClick={() => handleRemovePhoto(index)}
                    aria-label="Remove photo"
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
                onClick={handleAddPhotoClick}
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