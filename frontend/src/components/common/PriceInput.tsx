import React from 'react';
import styles from './PriceInput.module.css';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  placeholder = '0.00',
  label,
  autoFocus = false,
  disabled = false
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const formatPrice = (val: string) => {
    // Remove non-numeric characters except decimal
    const cleaned = val.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    onChange(formatted);
  };

  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.priceInputWrapper}>
        <span className={styles.pricePrefix}>$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className={styles.priceInput}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default PriceInput;