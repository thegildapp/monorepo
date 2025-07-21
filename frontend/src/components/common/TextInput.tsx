import React from 'react';
import styles from './TextInput.module.css';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  showCharCount?: boolean;
  autoFocus?: boolean;
  type?: 'text' | 'number' | 'email' | 'tel';
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  maxLength,
  showCharCount = false,
  autoFocus = false,
  type = 'text',
  disabled = false
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const remaining = maxLength ? maxLength - value.length : 0;

  React.useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type={type}
          className={styles.input}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
        />
        {showCharCount && maxLength && (
          <div className={`${styles.charCount} ${remaining < 20 ? styles.warning : ''}`}>
            {remaining} characters remaining
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInput;