import React, { useState, useRef, useCallback } from 'react';
import { compressImage } from '../../utils/imageCompression';
import styles from './ListingPhotosField.module.css';

interface Photo {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
}

interface ListingPhotosFieldProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const ListingPhotosField: React.FC<ListingPhotosFieldProps> = ({
  photos,
  onPhotosChange
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastMoveTime = useRef<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 6 - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Add placeholder photos immediately with uploading state
    const placeholderPhotos: Photo[] = filesToAdd.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: '',
      uploading: true, // Show shimmer
      uploaded: false
    }));
    
    onPhotosChange([...photos, ...placeholderPhotos]);
    
    // Compress images and update them
    const compressedPhotos: Photo[] = [];
    
    for (let i = 0; i < filesToAdd.length; i++) {
      const compressedFile = await compressImage(filesToAdd[i]);
      const preview = URL.createObjectURL(compressedFile);
      compressedPhotos.push({
        ...placeholderPhotos[i],
        file: compressedFile,
        preview,
        uploading: false
      });
      
      // Update photos one by one as they complete
      onPhotosChange([...photos, ...compressedPhotos, ...placeholderPhotos.slice(i + 1)]);
    }
  };

  const handleRemovePhoto = (index: number) => {
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

    // Add placeholder photos immediately with uploading state
    const placeholderPhotos: Photo[] = filesToAdd.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: '',
      uploading: true, // Show shimmer
      uploaded: false
    }));
    
    onPhotosChange([...photos, ...placeholderPhotos]);
    
    // Compress images and update them
    const compressedPhotos: Photo[] = [];
    
    for (let i = 0; i < filesToAdd.length; i++) {
      const compressedFile = await compressImage(filesToAdd[i]);
      const preview = URL.createObjectURL(compressedFile);
      compressedPhotos.push({
        ...placeholderPhotos[i],
        file: compressedFile,
        preview,
        uploading: false
      });
      
      // Update photos one by one as they complete
      onPhotosChange([...photos, ...compressedPhotos, ...placeholderPhotos.slice(i + 1)]);
    }
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add photos</h2>
      <p className={styles.subtitle}>Add at least 3 photos (up to 6)</p>
      
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
                {photo.preview && <img src={photo.preview} alt={`Photo ${index + 1}`} />}
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
                {index === 0 && !photo.uploading && (
                  <div className={styles.thumbnailBadge}>Thumbnail</div>
                )}
                {photo.uploading && (
                  <div className={styles.photoShimmer}></div>
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