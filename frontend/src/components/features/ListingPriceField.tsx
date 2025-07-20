import React, { useRef, useEffect } from 'react';
import styles from './ListingPriceField.module.css';

interface ListingPriceFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const ListingPriceField: React.FC<ListingPriceFieldProps> = ({
  value,
  onChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus when component mounts
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9.]/g, '');
    
    // Handle decimal points
    const parts = newValue.split('.');
    if (parts.length > 2) {
      // More than one decimal point, keep only first
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      // Limit to 2 decimal places
      newValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Remove leading zeros unless it's "0." for decimal
    if (newValue.length > 1 && newValue[0] === '0' && newValue[1] !== '.') {
      newValue = newValue.substring(1);
    }
    
    onChange(newValue);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Set your price</h2>
      <p className={styles.subtitle}>You can always adjust it later</p>
      
      <div className={styles.priceInputWrapper}>
        <div className={styles.priceInputContainer}>
          <span className={styles.dollarSign}>$</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.priceInput}
            value={value}
            onChange={handleChange}
            placeholder="0"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
          />
        </div>
      </div>
    </div>
  );
};

export default ListingPriceField;