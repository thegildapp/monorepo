import React from 'react';
import LocationSelector from './LocationSelector';
import styles from './ListingLocationField.module.css';

interface ListingLocationFieldProps {
  location: { lat: number; lng: number; city?: string; state?: string } | null;
  onChange: (location: { lat: number; lng: number; city?: string; state?: string } | null) => void;
}

const ListingLocationField: React.FC<ListingLocationFieldProps> = ({
  location,
  onChange
}) => {
  const handleLocationChange = (loc: { lat: number; lng: number; city?: string; state?: string } | null, radius: number) => {
    // Ignore radius for listing creation
    onChange(loc);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Where are you located?</h2>
      <p className={styles.subtitle}>Buyers can see your approximate location</p>
      
      <div className={styles.locationSelectorWrapper}>
        <LocationSelector
          onLocationChange={handleLocationChange}
          hideRadius={true}
        />
      </div>
    </div>
  );
};

export default ListingLocationField;