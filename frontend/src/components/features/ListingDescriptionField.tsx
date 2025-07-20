import React, { useRef, useEffect } from 'react';
import styles from './ListingDescriptionField.module.css';

interface ListingDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const ListingDescriptionField: React.FC<ListingDescriptionFieldProps> = ({
  value,
  onChange
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 500;
  const remaining = maxLength - value.length;

  useEffect(() => {
    // Auto-focus when component mounts
    textareaRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Describe your item</h2>
      <p className={styles.subtitle}>Include condition, brand, size, and any flaws</p>
      
      <div className={styles.textareaContainer}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          placeholder="Describe your item"
          rows={6}
          maxLength={maxLength}
        />
      </div>
      
      <div className={`${styles.characterCount} ${remaining < 50 ? styles.warning : ''}`}>
        {remaining} characters remaining
      </div>

    </div>
  );
};

export default ListingDescriptionField;