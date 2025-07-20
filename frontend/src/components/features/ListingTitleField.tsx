import React, { useRef, useEffect } from 'react';
import styles from './ListingTitleField.module.css';

interface ListingTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const ListingTitleField: React.FC<ListingTitleFieldProps> = ({
  value,
  onChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const maxLength = 100;
  const remaining = maxLength - value.length;

  useEffect(() => {
    // Auto-focus when component mounts
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>What are you selling?</h2>
      <p className={styles.subtitle}>Give your item a clear, descriptive title</p>
      
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={value}
          onChange={handleChange}
          placeholder="Item name"
          maxLength={maxLength}
        />
        
        <div className={`${styles.characterCount} ${remaining < 20 ? styles.warning : ''}`}>
          {remaining} characters remaining
        </div>
      </div>
    </div>
  );
};

export default ListingTitleField;