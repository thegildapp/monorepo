import React, { useRef } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { uploadImage, validateImageFile } from '../../utils/imageUpload';
import styles from './MobilePhotoField.module.css';

interface Photo {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  key?: string;
  variants?: {
    thumbnail: string;
    card: string;
    full: string;
  };
}

interface MobilePhotoFieldProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const MobilePhotoField: React.FC<MobilePhotoFieldProps> = ({ photos, onPhotosChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const environment = useRelayEnvironment();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const remainingSlots = 6 - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Create previews
    const newPhotos: Photo[] = [];
    for (const file of filesToAdd) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        continue;
      }
      
      const id = `${Date.now()}-${Math.random()}`;
      
      // Create preview URL immediately
      let preview = '';
      try {
        preview = URL.createObjectURL(file);
      } catch (error) {
        console.error('Failed to create preview URL:', error);
        continue; // Skip this file if we can't create a preview
      }
      
      newPhotos.push({
        id,
        file,
        preview,
        uploading: false,
        uploaded: false,
      });
    }

    // Update UI immediately
    onPhotosChange([...photos, ...newPhotos]);

    // Upload in background
    newPhotos.forEach(photo => {
      uploadImage(photo.file, environment).then(result => {
        onPhotosChange((prev: Photo[]) => prev.map(p => 
          p.id === photo.id 
            ? { 
                ...p, 
                uploaded: true, 
                url: result.url,
                key: result.key,
                variants: {
                  thumbnail: result.url,
                  card: result.url,
                  full: result.url
                }
              }
            : p
        ));
      }).catch(err => {
        console.error('Upload failed:', err);
      });
    });
  };

  const removePhoto = (index: number) => {
    const photo = photos[index];
    if (photo?.preview.startsWith('blob:')) {
      URL.revokeObjectURL(photo.preview);
    }
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {[...Array(6)].map((_, index) => {
          const photo = photos[index];
          
          if (photo) {
            return (
              <div key={photo.id} className={styles.photoSlot}>
                {photo.preview ? (
                  <img src={photo.preview} alt="" />
                ) : (
                  <div className={styles.loadingIndicator}>
                    <div className={styles.spinner}></div>
                  </div>
                )}
                <button
                  className={styles.removeBtn}
                  onClick={() => removePhoto(index)}
                  type="button"
                >
                  ×
                </button>
              </div>
            );
          } else {
            return (
              <button
                key={`empty-${index}`}
                className={styles.addBtn}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                +
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

export default MobilePhotoField;