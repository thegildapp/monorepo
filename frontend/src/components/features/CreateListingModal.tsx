import React, { useState } from 'react';
import { useMutation, useRelayEnvironment } from 'react-relay';
import Modal from '../common/Modal';
import PagedContainer from './PagedContainer';
import ListingPhotosField from './ListingPhotosField';
import ListingTitleField from './ListingTitleField';
import ListingDescriptionField from './ListingDescriptionField';
import ListingPriceField from './ListingPriceField';
import ListingLocationField from './ListingLocationField';
import AnimatedDots from './AnimatedDots';
import { CreateListingMutation } from '../../queries/listings';
import { uploadImagesInParallel } from '../../utils/uploadToSpaces';
import type { listingsCreateListingMutation } from '../../__generated__/listingsCreateListingMutation.graphql';
import styles from './CreateListingModal.module.css';

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

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const environment = useRelayEnvironment();
  const [currentPage, setCurrentPage] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; city?: string; state?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [commitCreateListing] = useMutation<listingsCreateListingMutation>(CreateListingMutation);

  // Validation for each step
  const canProceed = () => {
    switch (currentPage) {
      case 0: // Photos
        return photos.length >= 3;
      case 1: // Title
        return title.trim().length > 0;
      case 2: // Description
        return description.trim().length > 0;
      case 3: // Price
        return price.length > 0 && parseFloat(price) > 0;
      case 4: // Location
        return location !== null;
      default:
        return false;
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get URLs from already uploaded photos or upload remaining ones
      const imageUrls: string[] = [];
      const photosToUpload: { photo: any; index: number }[] = [];
      
      // Check which photos are already uploaded
      photos.forEach((photo, index) => {
        if (photo.uploaded && photo.url) {
          imageUrls[index] = photo.url;
        } else {
          photosToUpload.push({ photo, index });
        }
      });
      
      // Upload any remaining photos that aren't uploaded yet
      if (photosToUpload.length > 0) {
        const filesToUpload = photosToUpload.map(p => p.photo.file);
        const uploadResults = await uploadImagesInParallel(
          filesToUpload,
          environment,
          (uploadIndex, progress) => {
            const photoIndex = photosToUpload[uploadIndex].index;
            console.log(`Photo ${photoIndex + 1}: ${progress.percentage}%`);
          }
        );
        
        // Extract successful URLs and place them in correct positions
        uploadResults.forEach((result, uploadIndex) => {
          const photoIndex = photosToUpload[uploadIndex].index;
          if (result.success && result.url) {
            imageUrls[photoIndex] = result.url;
          } else {
            console.error(`Failed to upload photo ${photoIndex + 1}:`, result.error);
          }
        });
      }
      
      // Filter out any undefined URLs (failed uploads)
      const validImageUrls = imageUrls.filter(url => url !== undefined);
      
      if (validImageUrls.length === 0) {
        throw new Error('Failed to upload any photos');
      }

      // Create the listing
      commitCreateListing({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            price: Math.round(parseFloat(price) * 100) / 100,
            images: validImageUrls,
            city: location?.city || '',
            state: location?.state || '',
            latitude: location?.lat || 0,
            longitude: location?.lng || 0,
          },
        },
        updater: (store, data) => {
          // Get the new listing from the payload
          const newListing = store.getRootField('createListing');
          if (!newListing) return;
          
          // Get the root query
          const root = store.getRoot();
          
          // Get existing myListings
          const myListings = root.getLinkedRecords('myListings');
          if (myListings) {
            // Add the new listing to the beginning of the list
            root.setLinkedRecords([newListing, ...myListings], 'myListings');
          }
          
          // Also add to regular listings if it exists
          const listings = root.getLinkedRecords('listings');
          if (listings) {
            root.setLinkedRecords([newListing, ...listings], 'listings');
          }
        },
        onCompleted: (response) => {
          if (response.createListing) {
            onSuccess?.();
            handleClose();
          }
        },
        onError: (error) => {
          setError(error.message);
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      setError('Failed to create listing. Please try again.');
      console.error('Error creating listing:', err);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up photo URLs
    photos.forEach(photo => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
    
    // Reset all state
    setCurrentPage(0);
    setPhotos([]);
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation(null);
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const pages = [
    <ListingPhotosField 
      key="photos"
      photos={photos}
      onPhotosChange={setPhotos}
    />,
    <ListingTitleField
      key="title"
      value={title}
      onChange={setTitle}
    />,
    <ListingDescriptionField
      key="description"
      value={description}
      onChange={setDescription}
    />,
    <ListingPriceField
      key="price"
      value={price}
      onChange={setPrice}
    />,
    <ListingLocationField
      key="location"
      location={location}
      onChange={(loc) => {
        setLocation(loc);
      }}
    />
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="medium"
      showHeader={false}
      className={styles.createListingModal}
    >
      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {isSubmitting ? (
        <div className={styles.submittingOverlay}>
          <AnimatedDots text="Creating your listing" />
        </div>
      ) : (
        <PagedContainer
          pages={pages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          canProceed={canProceed()}
          onCancel={handleClose}
          onFinish={handleFinish}
          isLastPage={currentPage === pages.length - 1}
        />
      )}
    </Modal>
  );
};

export default CreateListingModal;