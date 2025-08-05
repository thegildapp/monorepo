import React, { useState, useRef, useEffect } from 'react';
import styles from './ListingPhotosField.module.css';
import type { Photo } from '../../types/Photo';

interface ListingPhotosFieldProps {
  label?: string;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const ListingPhotosField: React.FC<ListingPhotosFieldProps> = ({
  label,
  photos = [],
  onPhotosChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const dragCounter = useRef(0);

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

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        console.warn(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
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
        maxWidth: 800,
        maxHeight: 800,
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
    dragCounter.current = 0;
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  // Photo reordering handlers
  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    // Create an invisible drag image
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setDraggedIndex(index);
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handlePhotoDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const draggedPhoto = photos[draggedIndex];
    const newPhotos = [...photos];
    
    // Remove the dragged photo
    newPhotos.splice(draggedIndex, 1);
    
    // Insert at new position - if dragging from left to right, place after the target
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex : dropIndex;
    newPhotos.splice(adjustedDropIndex, 0, draggedPhoto);
    
    onPhotosChange(newPhotos);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handlePhotoDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch handlers for mobile
  const [touchItem, setTouchItem] = useState<{ index: number; photo: Photo } | null>(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    longPressTimer.current = setTimeout(() => {
      setTouchItem({ index, photo: photos[index] });
      setTouchOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      element.style.opacity = '0.5';
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchItem) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      return;
    }
    
    e.preventDefault();
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const photoElement = elements.find(el => 
      el.classList.contains(styles.photoItem) && 
      el !== e.currentTarget
    );
    
    if (photoElement) {
      const index = Array.from(photoElement.parentElement!.children).indexOf(photoElement);
      if (index !== -1) {
        setDragOverIndex(index);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '1';
    
    if (touchItem && dragOverIndex !== null && touchItem.index !== dragOverIndex) {
      const newPhotos = [...photos];
      newPhotos.splice(touchItem.index, 1);
      
      const adjustedDropIndex = touchItem.index < dragOverIndex ? dragOverIndex : dragOverIndex;
      newPhotos.splice(adjustedDropIndex, 0, touchItem.photo);
      
      onPhotosChange(newPhotos);
    }
    
    setTouchItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className={styles.container}>
      {label ? (
        <label className={styles.label}>{label}</label>
      ) : (
        <>
          <h2 className={styles.title}>Add photos</h2>
          <p className={styles.subtitle}>Show your item from different angles</p>
        </>
      )}

      <div 
        className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
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
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className={`${styles.photoItem} ${draggedIndex === index ? styles.dragging : ''} ${dragOverIndex === index ? styles.dragOver : ''}`}
                draggable={!photo.loading}
                onDragStart={(e) => handlePhotoDragStart(e, index)}
                onDragOver={(e) => handlePhotoDragOver(e, index)}
                onDrop={(e) => handlePhotoDrop(e, index)}
                onDragEnd={handlePhotoDragEnd}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}>
                {photo.loading ? (
                  <div className={styles.loadingPlaceholder}>
                    <div className={styles.spinner} />
                  </div>
                ) : (
                  <img 
                    src={photo.dataUrl} 
                    alt={photo.file?.name || 'Photo'}
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