import React from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  showCharCount?: boolean;
  rows?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  label,
  maxLength,
  showCharCount = false,
  rows = 4,
  autoFocus = false,
  disabled = false
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const remaining = maxLength ? maxLength - value.length : 0;

  React.useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.textareaContainer}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
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

export default TextArea;