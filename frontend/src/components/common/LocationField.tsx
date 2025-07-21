import React from 'react';
import LocationSelector from '../features/LocationSelector';
import styles from './LocationField.module.css';

interface LocationFieldProps {
  label?: string;
  location: { lat: number; lng: number; city?: string; state?: string } | null;
  onChange: (location: { lat: number; lng: number; city?: string; state?: string } | null) => void;
}

const LocationField: React.FC<LocationFieldProps> = ({
  label,
  location,
  onChange
}) => {
  const handleLocationChange = (loc: { lat: number; lng: number; city?: string; state?: string } | null, radius: number) => {
    // Ignore radius for listing creation
    onChange(loc);
  };

  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <LocationSelector
        onLocationChange={handleLocationChange}
        hideRadius={true}
      />
    </div>
  );
};

export default LocationField;