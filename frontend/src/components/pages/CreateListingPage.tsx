import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-relay';
import { useRelayEnvironment } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import LocationSelector from '../features/LocationSelector';
import { useAuth } from '../../contexts/AuthContext';
import { CreateListingMutation } from '../../queries/listings';
import { compressImage, validateImageFile } from '../../utils/imageCompression';
import { uploadImagesInParallel, type UploadProgress } from '../../utils/uploadToSpaces';
import type { listingsCreateListingMutation } from '../../__generated__/listingsCreateListingMutation.graphql';
import styles from './CreateListingPage.module.css';

interface ImageUploadState {
  file: File;
  compressedFile?: File;
  preview: string;
  uploading: boolean;
  progress: number;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const environment = useRelayEnvironment();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [images, setImages] = useState<ImageUploadState[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [commitCreateListing, isCreateListingInFlight] = useMutation<listingsCreateListingMutation>(CreateListingMutation);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);
  
  if (!user) {
    return null;
  }
  
  const handleImageSelect = async (files: FileList) => {
    const newImages: ImageUploadState[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        continue;
      }
      
      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        uploading: false,
        progress: 0,
        uploaded: false,
      });
    }
    
    // Check total image count (min 3, max 10)
    const totalImages = images.length + newImages.length;
    if (totalImages > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    
    setImages(prev => [...prev, ...newImages]);
    setError('');
    
    // Start compression and upload process
    processImages(newImages);
  };
  
  const processImages = async (imagesToProcess: ImageUploadState[]) => {
    const startIndex = images.length;
    
    // Update state to show uploading
    setImages(prev => prev.map((img, index) => 
      index >= startIndex ? { ...img, uploading: true } : img
    ));
    
    // Compress images in parallel
    const compressionPromises = imagesToProcess.map(async (imageState, index) => {
      try {
        const compressedFile = await compressImage(imageState.file);
        const globalIndex = startIndex + index;
        
        setImages(prev => prev.map((img, i) => 
          i === globalIndex ? { ...img, compressedFile } : img
        ));
        
        return compressedFile;
      } catch (error) {
        console.error('Error compressing image:', error);
        return imageState.file;
      }
    });
    
    const compressedFiles = await Promise.all(compressionPromises);
    
    // Upload compressed images in parallel
    const uploadResults = await uploadImagesInParallel(
      compressedFiles,
      environment,
      (index, progress) => {
        const globalIndex = startIndex + index;
        setImages(prev => prev.map((img, i) => 
          i === globalIndex ? { ...img, progress: progress.percentage } : img
        ));
      }
    );
    
    // Update state with upload results
    setImages(prev => prev.map((img, index) => {
      if (index >= startIndex && index < startIndex + uploadResults.length) {
        const result = uploadResults[index - startIndex];
        return {
          ...img,
          uploading: false,
          uploaded: result.success,
          url: result.url,
          error: result.error,
        };
      }
      return img;
    }));
  };
  
  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };
  
  const validateForm = () => {
    if (!title.trim()) return 'Title is required';
    if (title.trim().split(' ').length > 10) return 'Title must be 10 words or less';
    if (!description.trim()) return 'Description is required';
    if (description.trim().split(' ').length > 100) return 'Description must be 100 words or less';
    if (!price || parseFloat(price) < 1) return 'Price must be at least $1';
    if (!city.trim()) return 'City is required';
    if (!state.trim()) return 'State is required';
    if (images.length < 3) return 'At least 3 images are required';
    if (images.some(img => !img.uploaded)) return 'All images must be uploaded before submitting';
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    const imageUrls = images.map(img => img.url!);
    
    commitCreateListing({
      variables: {
        input: {
          title: title.trim(),
          description: description.trim(),
          price: Math.round(parseFloat(price)), // Whole dollars only
          images: imageUrls,
          city: city.trim(),
          state: state.trim(),
          latitude,
          longitude,
        },
      },
      updater: (store) => {
        // Invalidate the myListings query to force a refetch
        const root = store.getRoot();
        const myListings = root.getLinkedRecords('myListings');
        if (myListings) {
          root.invalidateRecord();
        }
      },
      onCompleted: (response) => {
        if (response.createListing) {
          navigate('/me');
        }
      },
      onError: (error) => {
        setError(error.message);
        setIsSubmitting(false);
      },
    });
  };
  
  const handleCancel = () => {
    navigate('/me');
  };
  
  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <div className={styles.content}>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (max 10 words)"
                className={styles.input}
                required
                autoFocus
              />
              
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (max 100 words)"
                className={styles.textarea}
                rows={4}
                required
              />
              
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price ($)"
                className={styles.input}
                min="1"
                step="0.01"
                required
              />
              
              <div className={styles.locationRow}>
                <LocationSelector
                  onLocationChange={(location, radius) => {
                    if (location) {
                      setCity(location.city || '');
                      setState(location.state || '');
                      setLatitude(location.lat);
                      setLongitude(location.lng);
                    }
                  }}
                />
                <div className={styles.locationDisplay}>
                  {city && state && (
                    <span className={styles.locationText}>{city}, {state}</span>
                  )}
                </div>
              </div>
              
              <div className={styles.imageUpload}>
                <label className={styles.uploadLabel}>
                  Images ({images.length}/10) - Min 3 required
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => e.target.files && handleImageSelect(e.target.files)}
                    className={styles.fileInput}
                    disabled={images.length >= 10}
                  />
                </label>
                
                {images.length > 0 && (
                  <div className={styles.imageGrid}>
                    {images.map((image, index) => (
                      <div key={index} className={styles.imagePreview}>
                        <img src={image.preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className={styles.removeButton}
                          disabled={image.uploading}
                        >
                          ×
                        </button>
                        {image.uploading && (
                          <div className={styles.uploadProgress}>
                            <div 
                              className={styles.progressBar} 
                              style={{ width: `${image.progress}%` }}
                            />
                          </div>
                        )}
                        {image.error && (
                          <div className={styles.imageError}>{image.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {error && <div className={styles.error}>{error}</div>}
              
              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={isSubmitting || isCreateListingInFlight}
                  className={styles.submitButton}
                >
                  {isSubmitting || isCreateListingInFlight ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Main>
    </Layout>
  );
}