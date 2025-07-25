import { useParams, useNavigate } from 'react-router-dom';
import { useLazyLoadQuery, useFragment, useMutation } from 'react-relay';
import { useState, useEffect } from 'react';
import { graphql } from 'react-relay';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import NotFound from '../feedback/NotFound';
import ListingPhotosField from '../features/ListingPhotosField';
import LocationField from '../common/LocationField';
import TextInput from '../common/TextInput';
import TextArea from '../common/TextArea';
import PriceInput from '../common/PriceInput';
import { useAuth } from '../../contexts/AuthContext';
import type { EditListingPageQuery as QueryType } from '../../__generated__/EditListingPageQuery.graphql';
import type { EditListingPage_listing$key } from '../../__generated__/EditListingPage_listing.graphql';
import styles from './EditListingPage.module.css';

interface Photo {
  id: string;
  file: File | null;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  uploadProgress?: number;
  url?: string;
  key?: string;
}

const EditListingQuery = graphql`
  query EditListingPageQuery($id: ID!) {
    listing(id: $id) {
      ...EditListingPage_listing
    }
  }
`;

const EditListingFragment = graphql`
  fragment EditListingPage_listing on Listing {
    id
    title
    description
    price
    images
    city
    state
    createdAt
    status
  }
`;

const UpdateListingMutation = graphql`
  mutation EditListingPageUpdateMutation($id: ID!, $input: UpdateListingInput!) {
    updateListing(id: $id, input: $input) {
      id
      title
      description
      price
      images
      city
      state
      status
      updatedAt
    }
  }
`;

function EditListingView({ listingRef }: { listingRef: EditListingPage_listing$key }) {
  const listing = useFragment(EditListingFragment, listingRef);
  const navigate = useNavigate();
  
  // Initialize state with existing listing data
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(listing.price.toString());
  const [location, setLocation] = useState<{ lat: number; lng: number; city?: string; state?: string } | null>(
    listing.city && listing.state ? { lat: 0, lng: 0, city: listing.city, state: listing.state } : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [commitUpdate, isUpdating] = useMutation(UpdateListingMutation);
  
  // Initialize photos from existing images
  useEffect(() => {
    const existingPhotos: Photo[] = listing.images.map((url, index) => ({
      id: `existing-${index}`,
      file: null,
      dataUrl: url,
      loading: false
    }));
    setPhotos(existingPhotos);
  }, [listing.images]);
  
  
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Please enter a valid price');
      }
      
      // Get all image URLs (both existing and newly uploaded)
      const imageUrls = photos
        .filter(photo => photo.dataUrl)
        .map(photo => photo.dataUrl);
      
      if (imageUrls.length < 3) {
        throw new Error('Please add at least 3 photos');
      }
      
      commitUpdate({
        variables: {
          id: listing.id,
          input: {
            title: title.trim(),
            description: description.trim(),
            price: priceNum,
            images: imageUrls,
            city: location?.city || '',
            state: location?.state || ''
          }
        },
        onCompleted: () => {
          navigate(`/listing/${listing.id}/manage`);
        },
        onError: (error) => {
          setError(error.message);
          setIsSaving(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
      setIsSaving(false);
    }
  };
  
  const isValid = () => {
    return title.trim().length > 0 &&
           description.trim().length > 0 &&
           price.length > 0 &&
           parseFloat(price) > 0 &&
           photos.filter(p => p.url).length >= 3;
  };
  
  return (
    <div className={styles.editContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Edit Listing</h1>
        <div className={styles.actions}>
          <button 
            className={styles.cancelButton} 
            onClick={() => navigate(`/listing/${listing.id}/manage`)}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            className={styles.saveButton} 
            onClick={handleSave}
            disabled={!isValid() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className={styles.editForm}>
        <ListingPhotosField
          label="Photos"
          photos={photos}
          onPhotosChange={setPhotos}
        />
        
        <TextInput
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="What are you selling?"
          maxLength={100}
          showCharCount
        />
        
        <PriceInput
          label="Price"
          value={price}
          onChange={setPrice}
          placeholder="0.00"
        />
        
        <TextArea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Include condition, brand, size, and any flaws"
          maxLength={500}
          showCharCount
          rows={4}
        />
        
        <LocationField
          label="Location"
          location={location}
          onChange={setLocation}
        />
      </div>
    </div>
  );
}

export default function EditListingPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Always call hooks before any conditional returns
  const data = useLazyLoadQuery<QueryType>(
    EditListingQuery, 
    { id: itemId || '' },
    { fetchPolicy: itemId ? 'store-or-network' : 'store-only' }
  );
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin', { state: { from: `/listing/${itemId}/edit` } });
    }
  }, [user, navigate, itemId]);
  
  if (!itemId || !user) {
    return <NotFound />;
  }
  
  if (!data.listing) {
    return <NotFound />;
  }
  
  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <EditListingView listingRef={data.listing} />
      </Main>
    </Layout>
  );
}