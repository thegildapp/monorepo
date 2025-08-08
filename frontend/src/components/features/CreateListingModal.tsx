import React, { useState } from 'react';
import { useMutation } from 'react-relay';
import Modal from '../common/Modal';
import PagedContainer from './PagedContainer';
import ListingPhotosField from './ListingPhotosField';
import ListingTitleField from './ListingTitleField';
import ListingDescriptionField from './ListingDescriptionField';
import ListingPriceField from './ListingPriceField';
import ListingLocationField from './ListingLocationField';
import ListingPaymentField from './ListingPaymentField';
import ErrorBoundary from '../common/ErrorBoundary';
import ErrorState from '../feedback/ErrorState';
import { CreateListingMutation, GenerateUploadUrlMutation } from '../../queries/listings';
import type { listingsCreateListingMutation } from '../../__generated__/listingsCreateListingMutation.graphql';
import type { listingsGenerateUploadUrlMutation } from '../../__generated__/listingsGenerateUploadUrlMutation.graphql';
import type { Photo } from '../../types/Photo';
import styles from './CreateListingModal.module.css';

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
  const [currentPage, setCurrentPage] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; city?: string; state?: string } | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [commitCreateListing] = useMutation<listingsCreateListingMutation>(CreateListingMutation);
  const [commitGenerateUploadUrl] = useMutation<listingsGenerateUploadUrlMutation>(GenerateUploadUrlMutation);

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
      case 5: // Payment
        return paymentMethodId !== null && paymentMethodId !== '';
      default:
        return false;
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload all photos to Digital Ocean Spaces in parallel
      const uploadPromises = photos.map(async (photo) => {
        // Generate upload URL
        const uploadUrlResponse = await new Promise<{ generateUploadUrl: { url: string; key: string } }>((resolve, reject) => {
          commitGenerateUploadUrl({
            variables: {
              filename: photo.file.name,
              contentType: photo.file.type,
              fileSize: photo.file.size,
            },
            onCompleted: resolve,
            onError: reject,
          });
        });

        const { url: uploadUrl, key } = uploadUrlResponse.generateUploadUrl;

        // Upload the file to the presigned URL with public-read ACL
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: photo.file,
          headers: {
            'Content-Type': photo.file.type,
            'x-amz-acl': 'public-read',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image ${photo.file.name}`);
        }

        // Construct the CDN URL from the key
        // The backend returns the key in format: listings/userId/timestamp-randomId.extension
        // Use the CDN endpoint for better performance
        const cdnUrl = `https://gild.sfo3.cdn.digitaloceanspaces.com/${key}`;
        return cdnUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Create the listing with uploaded image URLs
      commitCreateListing({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            price: Math.round(parseFloat(price) * 100) / 100,
            images: imageUrls,
            city: location?.city || '',
            state: location?.state || '',
            latitude: location?.lat || 0,
            longitude: location?.lng || 0,
            paymentMethodId: paymentMethodId || '',
          },
        },
        updater: (store) => {
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
    // Reset all state
    setCurrentPage(0);
    setPhotos([]);
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation(null);
    setPaymentMethodId(null);
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
    />,
    <ListingPaymentField
      key="payment"
      onPaymentMethodChange={setPaymentMethodId}
      isProcessing={isSubmitting}
    />
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="medium"
      showHeader={!!error}
      title=""
      className={styles.createListingModal}
    >
      <ErrorBoundary
        fallback={
          <ErrorState
            title="Something went wrong"
            message=""
          />
        }
      >
        {error ? (
          <div className={styles.errorStateWrapper}>
            <ErrorState
              title="Unable to create listing"
              message={error}
            />
            <button
              className={styles.retryButton}
              onClick={() => {
                setError(null);
                setIsSubmitting(false);
              }}
            >
              Try Again
            </button>
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
          isSubmitting={isSubmitting}
        />
      )}
      </ErrorBoundary>
    </Modal>
  );
};

export default CreateListingModal;